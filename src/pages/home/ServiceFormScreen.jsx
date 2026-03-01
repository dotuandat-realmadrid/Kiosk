import React, { useState, useEffect, useRef } from "react";
import Lottie from "lottie-react";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import errorAnim from "../../assets/images/error.json";
import { message } from 'antd';
import { useToast } from "../../assets/js/use_toast";
import { useAlert } from "../../assets/js/user_alert";
import { API } from "../../api/auth";

import Mau_NHHT from "../../components/template/Mau_NHHT";
import Mau_1 from "../../components/template/Mau_1";
import Mau_2 from "../../components/template/Mau_2";
import Mau_4 from "../../components/template/Mau_4";
import Mau_5 from "../../components/template/Mau_5";
import Mau_7 from "../../components/template/Mau_7";
import Mau_8 from "../../components/template/Mau_8";

// API configuration
const API_BASE_URL = "http://192.168.1.66:7000";

const ServiceFormScreen = ({
  onBack,
  idData,
  onPrintComplete,
  capturedFace,
}) => {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [currentFileName, setCurrentFileName] = useState("");
  const [currentServiceName, setCurrentServiceName] = useState("");
  const [currentServiceKey, setCurrentServiceKey] = useState("");
  const [currentTicketNumber, setCurrentTicketNumber] = useState("");
  const [showTemplate, setShowTemplate] = useState(false);
  const [savedFormData, setSavedFormData] = useState({});
  const [savedAdditionalData, setSavedAdditionalData] = useState({});

  // New states for API data
  const [servicesData, setServicesData] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const hasFetchedRef = useRef(false);
  const { showToast } = useToast();
  const { showAlert } = useAlert();

  // Mapping template names
  const templateMapping = {
    "tra-soat-khieu-nai": { component: Mau_NHHT, templateName: "mau_nhht" },
    "thoa-thuan-mo-ho-so-thong-tin-khach-hang": {
      component: Mau_1,
      templateName: "mau_1",
    },
    "giay-de-nghi-dang-ky-ho-kinh-doanh": {
      component: Mau_2,
      templateName: "mau_2",
    },
    "hop-dong-cho-vay-hmtc": { component: Mau_4, templateName: "mau_4" },
    "giay-de-nghi-dieu-chinh-hmtc": { component: Mau_5, templateName: "mau_5" },
    "phu-luc-hop-dong-cho-vay-hmtc": {
      component: Mau_7,
      templateName: "mau_7",
    },
    "de-nghi-tam-dung-mo-lai-cham-dut-hmtc": {
      component: Mau_8,
      templateName: "mau_8",
    },
  };

  // Local ticket numbering
  const ticketCountersRef = React.useRef({});
  
  const getSeriesByServiceKey = (serviceKey) => {
    if (!serviceKey) return "A";
    const key = String(serviceKey);
    if (key === "tra-soat-khieu-nai") return "A";
    if (
      key === "hop-dong-cho-vay-hmtc" ||
      key === "giay-de-nghi-dieu-chinh-hmtc" ||
      key === "phu-luc-hop-dong-cho-vay-hmtc" ||
      key === "de-nghi-tam-dung-mo-lai-cham-dut-hmtc"
    ) {
      return "B";
    }
    if (key === "thoa-thuan-mo-ho-so-thong-tin-khach-hang") return "C";
    if (key === "giay-de-nghi-dang-ky-ho-kinh-doanh") return "Q";
    return "A";
  };

  const generateTicketNumberBySeries = (serviceKey) => {
    const series = getSeriesByServiceKey(serviceKey);
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    if (!ticketCountersRef.current[dateStr]) {
      ticketCountersRef.current[dateStr] = { A: 0, B: 0, C: 0 };
    }
    ticketCountersRef.current[dateStr][series] =
      (ticketCountersRef.current[dateStr][series] || 0) + 1;
    const count = ticketCountersRef.current[dateStr][series];
    const numberStr = String(count).padStart(3, "0");
    return `${series}${numberStr}`;
  };

  // Get current list based on selection
  const getCurrentList = () => {
    if (!servicesData) return [];

    if (!selected) {
      // Root level: show both services and service_groups
      const services = servicesData.services || [];
      const serviceGroups = servicesData.service_group || [];
      return [...services, ...serviceGroups];
    } else {
      // Sub level: show services within selected service group
      const serviceGroup = servicesData.service_group?.find(
        (sg) => sg.code === selected
      );
      return serviceGroup?.services || [];
    }
  };

  const currentList = getCurrentList();
  const isRoot = !selected;
  
  const selectedName = (() => {
    if (!selected) return "Danh sách dịch vụ";

    // Find in service groups
    const serviceGroup = servicesData?.service_group?.find(
      (sg) => sg.code === selected
    );
    if (serviceGroup) return serviceGroup.vn_name;

    // Find in services
    const service = servicesData?.services?.find((s) => s.code === selected);
    if (service) return service.vn_name;

    return "Danh sách dịch vụ";
  })();

  // Map ID data to customer data format
  const mapIdDataToCustomerData = (idData) => {
    if (!idData) return {};

    const placeOfIssue = idData.date_of_issue
      ? "Cục trưởng cục cảnh sát quản lý hành chính về trật tự xã hội"
      : idData.date_of_issue_qr
      ? "Bộ công an"
      : "";

    return {
      full_name: idData.full_name || "",
      date_of_birth: idData.date_of_birth || "",
      sex: idData.sex || "",
      nation_no: idData.eid_number || "",
      place_of_issue: placeOfIssue,
      date_of_issue: idData.date_of_issue || idData.date_of_issue_qr || "",
      address: idData.place_of_residence || idData.place_of_residence_qr || "",
      expired_date: idData.date_of_expiry || "",
      nation: idData.nationality || "Việt Nam",
      ethnicity: idData.ethnicity || "Kinh",
      religion: idData.religion || "Không",
    };
  };

  // Fetch services data from API
  useEffect(() => {
    if (hasFetchedRef.current) return;

    const fetchServices = async () => {
      try {
        hasFetchedRef.current = true;
        setApiLoading(true);
        setApiError(null);

        const response = await fetch(
          `${API}/kiosks/get-by-kiosk-code/coop_bank01`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          // Transform service_groups
          const transformedServiceGroups = (data.data.service_groups || []).map(sg => ({
            id: sg.id,
            code: sg.code,
            vn_name: sg.name_vi,
            en_name: sg.name_en,
            representative_image: sg.representative_image,
            services: (sg.services || []).map(s => ({
              id: s.id,
              code: s.code,
              vn_name: s.name_vi,
              en_name: s.name_en,
              format_id: s.format_id,
              representative_image: s.representative_image,
              ticket_format: s.ticket_format
            }))
          }));

          // Get service IDs already in groups
          const serviceIdsInGroups = new Set(
            transformedServiceGroups.flatMap(sg => 
              sg.services.map(s => s.id)
            )
          );

          // Filter services: only keep services NOT in any group
          const transformedServices = (data.data.services || [])
            .filter(s => !serviceIdsInGroups.has(s.id))
            .map(s => ({
              id: s.id,
              code: s.code,
              vn_name: s.name_vi,
              en_name: s.name_en,
              format_id: s.format_id,
              representative_image: s.representative_image,
              ticket_format: s.ticket_format
            }));

          const transformedData = {
            services: transformedServices,
            service_group: transformedServiceGroups
          };

          setServicesData(transformedData);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        setApiError(error.message);
        showToast("Không thể tải danh sách dịch vụ", "danger");
      } finally {
        setApiLoading(false);
      }
    };

    fetchServices();
  }, []);

  // // Fetch services data from API
  // useEffect(() => {
  //   // Prevent multiple API calls in React StrictMode
  //   if (hasFetchedRef.current) return;

  //   const fetchServices = async () => {
  //     try {
  //       hasFetchedRef.current = true;
  //       setApiLoading(true);
  //       setApiError(null);

  //       console.log("🔍 Fetching services from API...");
  //       const response = await fetch(
  //         `${API_BASE_URL}/api/admin/center/service/get-by-kiosk-code?kiosk_code=coop_bank01`
  //       );

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       const data = await response.json();

  //       if (data.status === "success" && data.data) {
  //         console.log("✅ Services data loaded successfully");
  //         setServicesData(data.data);
  //       } else {
  //         throw new Error("Invalid response format");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching services:", error);
  //       setApiError(error.message);
  //       message.error("Không thể tải danh sách dịch vụ");
  //     } finally {
  //       setApiLoading(false);
  //     }
  //   };

  //   fetchServices();
  // }, []);

  // Call PDF API
  const generatePDF = async (serviceKey, additionalData = {}) => {
    if (!idData) {
      showToast("Không có thông tin khách hàng!", "info");
      return;
    }

    // Kiểm tra template mapping
    const templateConfig = templateMapping[serviceKey];
    
    if (!templateConfig) {
      console.error("❌ Template not found for service:", serviceKey);
      console.log("📋 Available templates:", Object.keys(templateMapping));
      console.log("🔍 Current service key:", serviceKey);
      
      showAlert(
        `Chưa có template tương ứng với dịch vụ này (${serviceKey})`,
        "warning"
      );
      return;
    }

    const templateName = templateConfig.templateName;
    setSavedAdditionalData(additionalData);
    setLoading(true);
    try {
      const customerData = {
        ...mapIdDataToCustomerData(idData),
        ...additionalData,
      };

      console.log("📋 Customer data to send for PDF generation:", customerData);

      // Convert keys to UPPERCASE to match placeholders in template
      const transformedData = Object.fromEntries(
        Object.entries(customerData).map(([key, value]) => [
          key.toUpperCase(),
          value || "",
        ])
      );

      // console.log("📄 Generating PDF with template:", templateName);
      // console.log("👤 Transformed Customer data:", transformedData);

      const response = await fetch(
        "http://localhost:8080/api/pdf/fill-template",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            templateName,
            customerData: transformedData,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        showToast("Tạo PDF thành công!", "success");
        setCurrentPdfUrl(result.pdfUrl);
        setCurrentFileName(result.fileName);
        setPdfModalVisible(true);
      } else {
        showToast("Tạo PDF thất bại: " + result.error + "!", "danger");
        console.error("PDF generation failed:", result);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Lỗi khi tạo PDF: " + error.message + "!", "danger");
    } finally {
      setLoading(false);
    }
  };

  // Print PDF
  const printPDF = async (fileName) => {
    try {
      // Create ticket before printing
      let ticketNumber = currentTicketNumber;

      if (!ticketNumber && servicesData) {
        // Find service_id from servicesData
        let serviceId = null;
        const service = servicesData?.services?.find(
          (s) => s.code === currentServiceKey
        );
        if (service) {
          serviceId = service.id;
        }

        if (!serviceId) {
          for (const serviceGroup of servicesData?.service_group || []) {
            const subService = serviceGroup.services?.find(
              (s) => s.code === currentServiceKey
            );
            if (subService) {
              serviceId = subService.id;
              break;
            }
          }
        }

        const customerData = {
          ...idData,
          template_data: savedAdditionalData,
        };
        console.log("Data to backup:", customerData);

        if (serviceId) {
          // Save CCCD backup after successful print
          if (idData) {
            try {
              const backupResponse = await fetch(
                "http://localhost:8080/api/id-info-backup/",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(customerData),
                }
              );

              const backupResult = await backupResponse.json();

              if (backupResult.success) {
                try {
                  const ticketResponse = await fetch(
                    `http://localhost:8080/api/transactions`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        service_id: serviceId,
                        ticket_type: "Offline",
                        cccd_info_backup_id: backupResult.data.id,
                        thumbnail_base64: capturedFace || "",
                      }),
                    }
                  );

                  const ticketResult = await ticketResponse.json();
                  if (ticketResult.status === "success" && ticketResult.data?.ticket_code) {
                    ticketNumber = ticketResult.data.ticket_code;
                    setCurrentTicketNumber(ticketNumber);
                  } else {
                    console.warn("⚠️ Ticket creation failed, using fallback number");
                  }
                } catch (ticketError) {
                  console.warn("⚠️ Ticket creation error:", ticketError);
                }
                // try {
                //   const ticketResponse = await fetch(
                //     `${API_BASE_URL}/process/kiosk/create_ticket`,
                //     {
                //       method: "PUT",
                //       headers: { "Content-Type": "application/json" },
                //       body: JSON.stringify({
                //         kiosk_code: "coop_bank01",
                //         language: "vn",
                //         service_id: serviceId,
                //         booking_id: "",
                //         appointment_code: 0,
                //         type: "Offline",
                //         numEId: idData.eid_number,
                //         thumbnail_base64: capturedFace || "",
                //       }),
                //     }
                //   );

                //   const ticketResult = await ticketResponse.json();
                //   if (ticketResult.status === "success" && ticketResult.data?.cnum) {
                //     ticketNumber = ticketResult.data.cnum;
                //     setCurrentTicketNumber(ticketNumber);
                //   } else {
                //     console.warn("⚠️ Ticket creation failed, using fallback number");
                //   }
                // } catch (ticketError) {
                //   console.warn("⚠️ Ticket creation error:", ticketError);
                // }
              } else {
                console.warn("⚠️ CCCD backup failed:", backupResult.message);
              }
            } catch (backupError) {
              console.warn("⚠️ CCCD backup error:", backupError);
            }
          }
        }
      }

      // Print small ticket via Electron IPC
      if (idData && window?.api?.printTicket) {
        const ticketPayload = {
          fullname: idData.full_name || "",
          dateofbirth: idData.date_of_birth || "",
          sex: idData.sex || "",
          cardnumber: idData.eid_number || "",
          service: currentServiceName || "Dịch vụ ngân hàng",
          serviceKey: currentServiceKey || "",
          ticketNumber:
            ticketNumber ||
            generateTicketNumberBySeries(currentServiceKey || ""),
          pageWidthMm: 80,
          contentOffsetMm: -6,
        };
        try {
          const res = await window.api.printTicket(ticketPayload);
          if (!res?.success) {
            console.warn("IPC print-ticket error:", res?.error);
            showToast("In phiếu tại máy in nhiệt thất bại!", "warning");
          }
        } catch (e) {
          console.warn("IPC print-ticket exception:", e);
        }
      }

      // Convert HTML to PDF and print via A4 printer
      const response = await fetch(
        "http://localhost:8080/api/pdf/convert-html-to-pdf",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: fileName,
            printOptions: {
              printer: "RICOH IM 50000", // Tên máy in đã cài đặt trên hệ thống
            },
          }),
        }
      );
      console.log("TicketNumber: " + generateTicketNumberBySeries(currentServiceKey || ""));

      const result = await response.json();

      if (result.success) {
        showToast("Đã gửi lệnh in PDF thành công!", "success");
      } else {
        showToast("In PDF thất bại: " + result.error + "!", "danger");
      }
    } catch (error) {
      console.error("Error printing PDF:", error);
      showToast("Lỗi khi in PDF: " + error.message + "!", "danger");
    }
  };

  // Handle service selection
  const handleServiceClick = (service) => {
    if (isRoot && service.services && service.services.length > 0) {
      // Navigate to service group
      setSelected(service.code);
    } else {
      // // Log service information
      // console.log("=== SERVICE SELECTED ===");
      // console.log("Service Code:", service.code);
      // console.log("Service Name (VN):", service.vn_name);
      // console.log("Service Name (EN):", service.en_name);
      // console.log("Service ID:", service.id);
      // console.log("Format ID:", service.format_id);
      // console.log("Ticket Format:", service.ticket_format);
      // console.log("Full Service Data:", service);
      // console.log("========================");

      // Check if template exists
      const hasTemplate = templateMapping[service.code];
      
      if (!hasTemplate) {
        console.warn("⚠️ Không tìm thấy template cho service:", service.code);
        console.log("📋 Available templates:", Object.keys(templateMapping));
        
        showToast(
          `Chưa có template tương ứng với dịch vụ "${service.vn_name}"`,
          "warning"
        );
        return;
      }

      const rootName = selected
        ? servicesData?.service_group?.find(
            (x) => x.code === selected
          )?.vn_name
        : null;
      const serviceName = rootName
        ? `${rootName} - ${service.vn_name}`
        : service.vn_name;
      
      setCurrentServiceName(serviceName);
      setCurrentServiceKey(service.code);
      setCurrentTicketNumber("");
      setShowTemplate(true);
    }
  };

  const customStyles = `
    body {
      margin: 0;
      place-items: center;
      min-width: 320px;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(180deg, #d4e5ff, #fef5f9);
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }

    .gradient-bg {
      margin-top: 56pt;
      margin-bottom: 36pt;
      width: 1280px;
      border-radius: 1.5rem;
      height: auto;
    }

    @media (min-width: 768px) and (max-width: 1024px) {
      .gradient-bg {
        margin-top: 56pt;
        margin-bottom: 36pt;
        width: 100%;
        max-width: 900px;
        border-radius: 1.2rem;
        padding: 0 20px;
      }
    }

    @media (max-width: 767px) {
      .gradient-bg {
        margin-top: 56pt;
        margin-bottom: 36pt;
        width: 100%;
        max-width: 100%;
        border-radius: 1rem;
        padding: 0 10px;
      }
    }

    @media (max-width: 480px) {
      .gradient-bg {
        margin-top: 56pt;
        margin-bottom: 42pt;
        width: 100%;
        border-radius: 0.8rem;
        padding: 0 8px;
      }
    }
    
    .animated-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      animation: pulse 6s ease-in-out infinite;
    }
    .animated-blob-1 {
      top: 0;
      left: 25%;
      width: min(384px, 40vw);
      height: min(384px, 40vw);
    }
    .animated-blob-2 {
      bottom: 0;
      right: 25%;
      width: min(384px, 40vw);
      height: min(384px, 40vw);
      animation-delay: 2s;
    }
    .animated-blob-3 {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(256px, 30vw);
      height: min(256px, 30vw);
      animation-delay: 4s;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .service-card {
      opacity: 0;
      transform: translateY(50px);
      animation: slideInUp 0.8s ease-out forwards;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: 24px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.5s ease;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      min-height: 200px;
    }
    
    .service-card:hover {
      border-color: #93c5fd;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    
    .service-card .hover-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1));
      opacity: 0;
      transition: opacity 0.5s ease;
    }
    
    .service-card:hover .hover-overlay {
      opacity: 1;
    }
    
    .service-icon {
      width: clamp(48px, 10vw, 64px);
      height: clamp(48px, 10vw, 64px);
      background: linear-gradient(135deg, #2563eb, #06b6d4);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: clamp(1.2rem, 3vw, 1.5rem);
      font-weight: bold;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }
    
    .service-card:hover .service-icon {
      transform: scale(1.1);
    }
    
    .service-card:hover .service-title {
      color: #2563eb;
    }
    
    .arrow-icon {
      transition: transform 0.3s ease;
    }
    
    .service-card:hover .arrow-icon {
      transform: translateX(4px);
    }
    
    .back-arrow {
      transition: transform 0.3s ease;
    }
    
    .btn:hover .back-arrow {
      transform: translateX(-4px);
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }
    
    .loading-spinner {
      position: relative;
      width: 42px;
      height: 42px;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: rotate 2s linear infinite;
    }

    .loading-spinner span {
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: #3b82f6;
      border-radius: 50%;
      animation: pulse 1.0s infinite ease-in-out;
    }

    .loading-spinner span:nth-child(1) {
      top: 2px;
      left: calc(50% - 5px);
      animation-delay: 0s;
    }

    .loading-spinner span:nth-child(2) {
      top: calc(50% - 5px);
      right: 2px;
      animation-delay: 0.25s;
    }

    .loading-spinner span:nth-child(3) {
      bottom: 2px;
      left: calc(50% - 5px);
      animation-delay: 0.5s;
    }

    .loading-spinner span:nth-child(4) {
      top: calc(50% - 5px);
      left: 2px;
      animation-delay: 0.75s;
    }

    @keyframes rotate {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    
    @media (max-width: 768px) {
      .modal-xl {
        max-width: 95%;
        margin: 0.5rem;
      }
      
      .modal-body {
        height: 60vh !important;
      }
    }
  `;

  // Show loading state for API
  if (apiLoading) {
    return (
      <div className="gradient-bg d-flex align-items-center justify-content-center">
        <style>{customStyles}</style>
        <div
          className="text-center p-5 d-flex flex-column justify-content-center align-items-center"
          style={{
            minWidth: "400px",
            minHeight: "400px",
            maxWidth: "500px",
          }}
        >
          <div
            className="d-flex align-items-center justify-content-center mb-4 mx-auto"
            style={{
              width: "80px",
              height: "80px",
            }}
          >
            <div className="loading-spinner">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <h1 className="fs-2 fw-bold text-primary mb-3">Đang tải dữ liệu</h1>

          <p
            className="text-secondary mb-0 lh-base"
            style={{ fontSize: "0.95rem" }}
          >
            Đang tải danh sách dịch vụ
          </p>
        </div>
      </div>
    );
  }

  // Show loading state for PDF generation
  if (loading) {
    return (
      <div className="gradient-bg d-flex align-items-center justify-content-center">
        <style>{customStyles}</style>
        <div
          className="text-center p-5 d-flex flex-column justify-content-center align-items-center"
          style={{
            minWidth: "400px",
            minHeight: "400px",
            maxWidth: "500px",
          }}
        >
          <div
            className="d-flex align-items-center justify-content-center mb-4 mx-auto"
            style={{
              width: "80px",
              height: "80px",
            }}
          >
            <div className="loading-spinner">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <h1 className="fs-2 fw-bold text-primary mb-3">Đang xử lý</h1>

          <p
            className="text-secondary mb-0 lh-base"
            style={{ fontSize: "0.95rem" }}
          >
            Đang tạo biểu mẫu
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (apiError) {
    return (
      <div className="gradient-bg d-flex align-items-center justify-content-center">
        <style>{customStyles}</style>
        <div
          className="text-center p-5 d-flex flex-column justify-content-center align-items-center"
          style={{
            minWidth: "400px",
            minHeight: "400px",
            maxWidth: "500px",
          }}
        >
          <Lottie
            animationData={errorAnim}
            loop={true}
            style={{ width: 180, height: 180 }}
            className="mx-auto"
          />

          <h1 className="fs-2 fw-bold text-danger mb-3">Lỗi tải dữ liệu</h1>

          <p
            className="text-secondary mb-4 lh-base"
            style={{ fontSize: "0.95rem" }}
          >
            {apiError}
          </p>

          <button
            className="btn btn-primary d-inline-flex align-items-center gap-2 rounded-4 px-3 py-2"
            onClick={() => window.location.reload()}
          >
            <svg
              style={{ width: "18px", height: "18px" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Show template component
  if (showTemplate) {
    const templateConfig = templateMapping[currentServiceKey];
    
    if (!templateConfig) {
      console.error("❌ No template component found for:", currentServiceKey);
      
      return (
        <div className="gradient-bg d-flex align-items-center justify-content-center">
          <style>{customStyles}</style>
          <div
            className="text-center p-5 d-flex flex-column justify-content-center align-items-center"
            style={{
              // minWidth: "400px",
              // minHeight: "400px",
              // maxWidth: "500px",
              width: "min-content",
              height: "min-content",
            }}
          >
            <div
              className="mb-4"
              style={{
                width: "80px",
                height: "80px",
                background: "#fef3c7",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                style={{ width: "40px", height: "40px" }}
                className="text-warning"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="fs-2 fw-bold text-warning mb-3">
              Chưa có template
            </h1>

            <p
              className="text-secondary mb-4 lh-base"
              style={{ fontSize: "0.95rem" }}
            >
              Dịch vụ <strong>{currentServiceName}</strong> chưa có mẫu template tương ứng.
            </p>

            <button
              className="btn btn-primary d-inline-flex align-items-center gap-2 rounded-4 px-3 py-2"
              onClick={() => {
                setShowTemplate(false);
                setCurrentServiceKey("");
              }}
            >
              <svg
                style={{ width: "18px", height: "18px" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Quay lại danh sách dịch vụ
            </button>
          </div>
        </div>
      );
    }

    const TemplateComponent = templateConfig.component;
    
    return (
      <TemplateComponent
        idData={idData}
        initialFormData={savedFormData[currentServiceKey]}
        onSubmit={(data) => {
          setSavedFormData((prev) => ({
            ...prev,
            [currentServiceKey]: data.rawData,
          }));

          setShowTemplate(false);
          generatePDF(currentServiceKey, data.processedData);
        }}
        onCancel={() => {
          setShowTemplate(false);
        }}
      />
    );
  }

  return (
    <>
      <Header />
      <div className="gradient-bg d-flex flex-column position-relative overflow-hidden">
        <style>{customStyles}</style>

        {/* Animated background elements */}
        <div
          className="position-absolute w-100 h-100"
          style={{ top: 0, left: 0 }}
        >
          <div className="animated-blob animated-blob-1"></div>
          <div className="animated-blob animated-blob-2"></div>
          <div className="animated-blob animated-blob-3"></div>
        </div>

        {/* Header */}
        <div
          className="position-relative"
          style={{ zIndex: 10, paddingTop: "1.5rem", paddingBottom: "1.5rem" }}
        >
          <div className="container px-3 px-md-4" style={{ maxWidth: "1280px" }}>
            {/* Breadcrumb */}
            <div className="mb-3 mb-md-4 ps-2">
              <nav aria-label="breadcrumb">
                <ol
                  className="breadcrumb mb-0"
                  style={{ fontSize: "clamp(0.75rem, 2vw, 0.875rem)" }}
                >
                  <li className="breadcrumb-item active fw-medium">
                    <span style={{ cursor: "pointer" }}>
                      Trang chủ
                    </span>
                  </li>
                  {isRoot ? (
                    <li className="breadcrumb-item fw-medium" aria-current="page">
                      Dịch vụ
                    </li>
                  ) : (
                    <>
                      <li className="breadcrumb-item active fw-medium" aria-current="page">
                        Dịch vụ
                      </li>
                      <li className="breadcrumb-item fw-medium" aria-current="page">
                        {selectedName}
                      </li>
                    </>
                  )}
                </ol>
              </nav>
            </div>

            {/* Title Section */}
            <div className="text-center mb-4">
              <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-3 mb-4">
                <div
                  style={{
                    width: "clamp(40px, 8vw, 48px)",
                    height: "clamp(40px, 8vw, 48px)",
                    background: "linear-gradient(135deg, #2563eb, #06b6d4)",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <svg
                    className="text-white"
                    style={{ width: "clamp(20px, 4vw, 24px)", height: "clamp(20px, 4vw, 24px)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h1
                  className="fw-bold mb-0"
                  style={{ 
                    color: "#1e293b",
                    fontSize: "clamp(1.75rem, 5vw, 3.5rem)"
                  }}
                >
                  {isRoot ? "Dịch vụ ngân hàng" : selectedName}
                </h1>
              </div>
              <p
                className="text-secondary mx-auto px-3"
                style={{ 
                  maxWidth: "768px", 
                  lineHeight: "1.75",
                  fontSize: "clamp(0.9rem, 2vw, 1.25rem)"
                }}
              >
                {isRoot
                  ? "Chọn dịch vụ bạn muốn sử dụng từ danh sách bên dưới"
                  : "Chọn dịch vụ chi tiết để tiếp tục"}
              </p>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="position-relative flex-fill" style={{ zIndex: 100 }}>
          <div
            className="container pb-4 pb-md-5 px-3 px-md-4"
            style={{ maxWidth: "1280px", height: "auto" }}
          >
            <div className="row g-3 g-md-4">
              {currentList.map((s, index) => (
                <div key={s.code} className="col-12 col-sm-6 col-lg-4">
                  <div
                    className="service-card position-relative"
                    onClick={() => handleServiceClick(s)}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="hover-overlay"></div>

                    <div className="position-relative p-3 p-md-4">
                      {/* Icon and badge */}
                      <div className="d-flex align-items-start justify-content-between mb-3 mb-md-4">
                        <div className="service-icon">
                          {s.vn_name.charAt(0)}
                        </div>
                        {isRoot && s.services && s.services.length > 0 && (
                          <span
                            className="badge rounded-pill"
                            style={{
                              background: "#d1fae5",
                              color: "#065f46",
                              border: "1px solid #a7f3d0",
                              padding: "0.25rem 0.75rem",
                              fontSize: "clamp(0.7rem, 2vw, 0.875rem)"
                            }}
                          >
                            {s.services.length} dịch vụ
                          </span>
                        )}
                      </div>

                      {/* Title and description */}
                      <div className="mb-3">
                        <h3
                          className="fw-bold service-title mb-2 mb-md-3"
                          style={{ 
                            color: "#1e293b",
                            fontSize: "clamp(1rem, 3vw, 1.25rem)"
                          }}
                        >
                          {s.vn_name}
                        </h3>
                        <p
                          className="text-secondary small mb-0"
                          style={{ 
                            lineHeight: "1.75",
                            fontSize: "clamp(0.8rem, 2vw, 0.875rem)"
                          }}
                        >
                          {isRoot && s.services && s.services.length > 0
                            ? `Khám phá ${s.services.length} dịch vụ chuyên nghiệp`
                            : "Nhấn để bắt đầu quy trình"}
                        </p>
                      </div>

                      {/* Action indicator */}
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center text-primary small fw-medium">
                          <span className="me-2" style={{ fontSize: "clamp(0.75rem, 2vw, 0.875rem)" }}>Tiếp tục</span>
                          <svg
                            className="arrow-icon"
                            style={{ width: "16px", height: "16px" }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </div>
                        <div className="status-dot"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-4 mt-md-4">
              {!isRoot ? (
                <button
                  className="btn btn-light border d-inline-flex align-items-center gap-2 rounded-3 w-auto justify-content-center"
                  onClick={() => setSelected(null)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <svg
                    className="back-arrow"
                    style={{ width: "16px", height: "16px" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="small fw-medium">Quay lại</span>
                </button>
              ) : (
                <div></div>
              )}

              <button
                onClick={onBack}
                className="btn btn-light border d-inline-flex align-items-center gap-2 rounded-3 w-auto justify-content-center"
                style={{
                  padding: "0.75rem 1.5rem",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                }}
              >
                <svg
                  style={{ width: "16px", height: "16px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span className="small fw-medium">Về màn hình chính</span>
              </button>
            </div>
          </div>
        </div>

        {/* PDF Modal */}
        {pdfModalVisible && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Xem PDF - {currentFileName}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setPdfModalVisible(false)}
                  ></button>
                </div>
                <div className="modal-body p-0" style={{ height: "80vh" }}>
                  <iframe
                    src={currentPdfUrl}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      borderRadius: "8px",
                    }}
                    title="PDF Viewer"
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setPdfModalVisible(false);
                      setShowTemplate(true);
                    }}
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      printPDF(currentFileName);
                      if (onPrintComplete) {
                        onPrintComplete();
                      }
                    }}
                  >
                    In PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default ServiceFormScreen;