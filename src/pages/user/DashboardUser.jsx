import { Breadcrumb, Button, Col, message, Modal, Row, Select, Spin, Table, Tabs, Typography } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { MdPerson } from "react-icons/md";
import { FaPlay, FaEdit, FaTrash, FaUndo } from "react-icons/fa";
import {
  getActiveTransactionsByUser,
  getCancelledTransactionsByUser,
  getTransactionById,
  callTransaction,
  completeTransaction,
  cancelTransaction,
  updateTransaction,
} from "../../api/transaction";
import { getUserByCounterCode } from "../../api/user";
// ✅ THÊM: import toggleCounters, getCounterById
import { toggleCounters, getCounterById } from "../../api/counter";
import UseWebSocket from "../../hooks/UseWebSocket";

const { Text } = Typography;
const { Option } = Select;

// ==========================================
// HELPER: map status → label tiếng Việt
// ==========================================
const STATUS_LABEL = {
  waiting:   "Đang đợi",
  serving:   "Đang phục vụ",
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
};

const STATUS_COLOR = {
  waiting:   "#FFA500",
  serving:   "#0099FF",
  cancelled: "#cc3333",
  completed: "#28a745",
};

// Format Date → "HH:mm:ss"
const toTimeString = (date) =>
  [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ].join(":");

// ==========================================
// HELPER: map CCCD info + template_data → customerData for PDF
// ==========================================
const mapIdDataToCustomerData = (cccdInfo, additionalData = {}) => {
  if (!cccdInfo) return { ...additionalData };

  const placeOfIssue = cccdInfo.date_of_issue
    ? "Cục trưởng cục cảnh sát quản lý hành chính về trật tự xã hội"
    : cccdInfo.date_of_issue_qr
    ? "Bộ công an"
    : "";

  return {
    full_name:      cccdInfo.full_name || "",
    date_of_birth:  cccdInfo.date_of_birth || "",
    sex:            cccdInfo.sex || "",
    nation_no:      cccdInfo.eid_number || "",
    place_of_issue: placeOfIssue,
    date_of_issue:  cccdInfo.date_of_issue || cccdInfo.date_of_issue_qr || "",
    address:        cccdInfo.place_of_residence || cccdInfo.place_of_residence_qr || "",
    expired_date:   cccdInfo.date_of_expiry || "",
    nation:         cccdInfo.nationality || "Việt Nam",
    ethnicity:      cccdInfo.ethnicity || "Kinh",
    religion:       cccdInfo.religion || "Không",
    ...additionalData,
  };
};

function DashboardUser() {
  const userInfo  = useSelector((state) => state.user);
  const userId    = userInfo?.id;
  const counterId = userInfo?.counter?.id || userInfo?.counter_id || null;

  const [isTamNghi, setIsTamNghi]                       = useState(false);
  // ✅ THÊM: loading state cho Tạm Nghỉ / Khôi Phục
  const [togglingCounter, setTogglingCounter]           = useState(false);
  // ✅ THÊM: loading khi fetch trạng thái is_active của counter lúc mount
  const [loadingCounterStatus, setLoadingCounterStatus] = useState(false);

  const [waitingList, setWaitingList]           = useState([]);
  const [cancelledList, setCancelledList]       = useState([]);
  const [loadingWaiting, setLoadingWaiting]     = useState(false);
  const [loadingCancelled, setLoadingCancelled] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loadingDetail, setLoadingDetail]   = useState(false);
  const [callingId, setCallingId]           = useState(null);
  const [completingId, setCompletingId]     = useState(null);
  const [cancellingId, setCancellingId]     = useState(null);
  const [restoringId, setRestoringId]       = useState(null);

  // PDF MODAL STATE
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl]                   = useState("");
  const [pdfFileName, setPdfFileName]         = useState("");
  const [generatingPdf, setGeneratingPdf]     = useState(false);

  // ==========================================
  // CHUYỂN VÉ MODAL STATE
  // ==========================================
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [transferRecord, setTransferRecord]             = useState(null);
  const [transferServiceId, setTransferServiceId]       = useState(null);
  const [transferCounterCode, setTransferCounterCode]   = useState(null);
  const [transferring, setTransferring]                 = useState(false);
  const [serviceOptions, setServiceOptions]             = useState([]);
  const [counterOptions, setCounterOptions]             = useState([]);
  const [loadingServices, setLoadingServices]           = useState(false);
  const [loadingCounters, setLoadingCounters]           = useState(false);

  // REF để đánh dấu đang trong quá trình chuyển vé
  // tránh websocket ghi đè selectedRecord(null) vừa set
  const isTransferringRef = useRef(false);

  // ĐỒNG HỒ REALTIME
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // FETCH DATA
  // ==========================================
  const fetchActiveTransactions = useCallback(async () => {
    if (!userId) return;
    setLoadingWaiting(true);
    try {
      const result = await getActiveTransactionsByUser(userId);
      setWaitingList(result.data || []);
    } catch (error) {
      console.error("Lỗi tải vé đang đợi:", error);
    } finally {
      setLoadingWaiting(false);
    }
  }, [userId]);

  const fetchCancelledTransactions = useCallback(async () => {
    if (!userId) return;
    setLoadingCancelled(true);
    try {
      const result = await getCancelledTransactionsByUser(userId);
      setCancelledList(result.data || []);
    } catch (error) {
      console.error("Lỗi tải vé đã hủy:", error);
    } finally {
      setLoadingCancelled(false);
    }
  }, [userId]);

  const fetchServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      const { API } = await import("../../api/auth");
      const { getToken } = await import("../../services/localStorageService");
      const response = await fetch(`${API}/services?size=100`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const result = await response.json();
      if (result.success) {
        setServiceOptions(result.data || []);
      }
    } catch (error) {
      console.error("Lỗi tải dịch vụ:", error);
    } finally {
      setLoadingServices(false);
    }
  }, []);

  // ✅ SỬA: fetchCounters lấy TẤT CẢ quầy (cả active lẫn inactive)
  // Việc filter chỉ cho chọn active được xử lý ở phần render Option
  const fetchCounters = useCallback(async () => {
    setLoadingCounters(true);
    try {
      const { API } = await import("../../api/auth");
      const { getToken } = await import("../../services/localStorageService");
      // Không truyền is_active filter → lấy tất cả quầy
      const response = await fetch(`${API}/counters?size=100`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const result = await response.json();
      if (result.success) {
        setCounterOptions(result.data || []);
      }
    } catch (error) {
      console.error("Lỗi tải quầy:", error);
    } finally {
      setLoadingCounters(false);
    }
  }, []);

  // ==========================================
  // WEBSOCKET
  // ==========================================
  UseWebSocket({
    "new-transaction": useCallback(() => {
      fetchActiveTransactions();
    }, [fetchActiveTransactions]),

    "update-transaction": useCallback((data) => {
      fetchActiveTransactions();
      fetchCancelledTransactions();
      // Bỏ qua nếu đang trong quá trình chuyển vé (tránh ghi đè null vừa set)
      if (isTransferringRef.current) return;
      if (selectedRecord?.id === data.id) {
        // Vé bị chuyển sang quầy khác → clear panel
        if (data.counter_id && data.counter_id !== counterId) {
          setSelectedRecord(null);
        } else {
          getTransactionById(data.id).then(setSelectedRecord).catch(console.error);
        }
      }
    }, [fetchActiveTransactions, fetchCancelledTransactions, selectedRecord, counterId]),

    "status-changed": useCallback((data) => {
      fetchActiveTransactions();
      fetchCancelledTransactions();
      // Bỏ qua nếu đang trong quá trình chuyển vé
      if (isTransferringRef.current) return;
      if (selectedRecord?.id === data.id) {
        // Vé bị chuyển sang quầy khác → clear panel
        if (data.counter_id && data.counter_id !== counterId) {
          setSelectedRecord(null);
        } else {
          getTransactionById(data.id).then(setSelectedRecord).catch(console.error);
        }
      }
    }, [fetchActiveTransactions, fetchCancelledTransactions, selectedRecord, counterId]),
  });

  useEffect(() => {
    fetchActiveTransactions();
    fetchCancelledTransactions();
  }, [fetchActiveTransactions, fetchCancelledTransactions]);

  // ✅ THÊM: Fetch trạng thái is_active của counter hiện tại khi mount
  // để đồng bộ nút Tạm Nghỉ / Khôi Phục với trạng thái thực tế trên server
  useEffect(() => {
    if (!counterId) return;
    setLoadingCounterStatus(true);
    getCounterById(counterId)
      .then((counter) => {
        // is_active = false  →  đang tạm nghỉ
        // is_active = true   →  đang hoạt động bình thường
        const active =
          counter?.is_active !== undefined ? counter.is_active :
          counter?.isActive  !== undefined ? counter.isActive  : true;
        setIsTamNghi(!active);
      })
      .catch((err) => {
        console.error("Lỗi lấy trạng thái quầy:", err);
      })
      .finally(() => setLoadingCounterStatus(false));
  }, [counterId]);

  // ==========================================
  // HELPERS
  // ==========================================
  const hasServingTransaction = waitingList.some((r) => r.status === "serving");
  const firstWaiting          = waitingList.find((r) => r.status === "waiting");

  // Helper kiểm tra counter có active không (hỗ trợ cả 2 kiểu tên field)
  const isCounterActive = (counter) => {
    if (counter.isActive !== undefined) return counter.isActive !== false;
    if (counter.is_active !== undefined) return counter.is_active !== false;
    return true; // mặc định coi là active nếu không có field
  };

  // ==========================================
  // HANDLER — MỞ MODAL CHUYỂN VÉ
  // ==========================================
  const handleOpenTransferModal = async (record) => {
    if (!record || isTamNghi) return;
    setTransferRecord(record);
    setTransferServiceId(record.service?.id || null);
    setTransferCounterCode(counterId || null);
    setTransferModalVisible(true);
    fetchServices();
    fetchCounters();
  };

  // ==========================================
  // HANDLER — XÁC NHẬN CHUYỂN VÉ
  // ==========================================
  const handleConfirmTransfer = async () => {
    if (!transferRecord?.id) return;
    if (!transferCounterCode) {
      message.warning("Vui lòng chọn quầy chuyển đến!");
      return;
    }
    if (transferCounterCode === counterId) {
      message.warning("Vui lòng chọn quầy khác với quầy hiện tại!");
      return;
    }

    // Kiểm tra quầy được chọn có active không
    const selectedCounter = counterOptions.find(
      (c) => c.code === transferCounterCode || c.id === transferCounterCode
    );
    // ✅ Double-check: dù đã disabled ở UI, vẫn kiểm tra lại ở đây
    if (selectedCounter && !isCounterActive(selectedCounter)) {
      message.warning("Quầy này hiện không hoạt động, vui lòng chọn quầy khác!");
      return;
    }

    setTransferring(true);
    isTransferringRef.current = true; // bắt đầu chuyển vé, chặn websocket ghi đè

    try {
      const newCounterId = selectedCounter?.id || transferCounterCode;

      let newUserId = null;
      try {
        const counterUser = await getUserByCounterCode(
          selectedCounter?.code || transferCounterCode
        );
        newUserId = counterUser?.id || null;
      } catch {
        console.warn("Không tìm được user của quầy, chỉ cập nhật counter_id");
      }

      const updatePayload = {
        counter_id: newCounterId,
        status: "waiting",
        call_time: null,
      };

      if (transferServiceId && transferServiceId !== transferRecord?.service?.id) {
        updatePayload.service_id = transferServiceId;
      }

      if (newUserId) {
        updatePayload.user_id = newUserId;
      }

      await updateTransaction(transferRecord.id, updatePayload);

      // Clear panel trước, sau đó mới fetch để tránh flash nội dung cũ
      setSelectedRecord(null);

      message.success("Chuyển vé thành công!");
      setTransferModalVisible(false);
      setTransferRecord(null);
      setTransferServiceId(null);
      setTransferCounterCode(null);

      await fetchActiveTransactions();
      await fetchCancelledTransactions();
    } catch (error) {
      console.error("Lỗi chuyển vé:", error);
      message.error("Chuyển vé thất bại: " + error.message);
    } finally {
      setTransferring(false);
      isTransferringRef.current = false; // kết thúc, cho phép websocket hoạt động lại
    }
  };

  // ==========================================
  // HANDLER — BIỂU MẪU
  // ==========================================
  const handleBieuMau = async () => {
    if (!selectedRecord) return;

    const cccdInfo     = selectedRecord?.cccd_info || null;
    const templateData = selectedRecord?.cccd_info?.template_data
      || selectedRecord?.template_data
      || null;

    if (!cccdInfo && !templateData) {
      message.warning("Không có thông tin khách hàng để tạo biểu mẫu!");
      return;
    }

    const customerData = mapIdDataToCustomerData(cccdInfo, templateData || {});
    const serviceCode  = selectedRecord?.service?.code || "";
    const templateName = selectedRecord?.service?.template_name
      || selectedRecord?.template_name
      || deriveTemplateName(serviceCode);

    if (!templateName) {
      message.warning(`Chưa có template tương ứng với dịch vụ này (${serviceCode})!`);
      return;
    }

    const transformedData = Object.fromEntries(
      Object.entries(customerData).map(([key, value]) => [key.toUpperCase(), value || ""])
    );

    setGeneratingPdf(true);
    try {
      const response = await fetch("http://localhost:8080/api/pdf/fill-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateName, customerData: transformedData }),
      });

      const result = await response.json();

      if (result.success) {
        setPdfUrl(result.pdfUrl);
        setPdfFileName(result.fileName);
        setPdfModalVisible(true);
        message.success("Tạo biểu mẫu thành công!");
      } else {
        message.error("Tạo biểu mẫu thất bại: " + (result.error || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error("Lỗi khi tạo biểu mẫu: " + error.message);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const deriveTemplateName = (serviceCode) => {
    const mapping = {
      "tra-soat-khieu-nai":                              "mau_nhht",
      "thoa-thuan-mo-ho-so-thong-tin-khach-hang":        "mau_1",
      "giay-de-nghi-dang-ky-ho-kinh-doanh":              "mau_2",
      "hop-dong-cho-vay-hmtc":                           "mau_4",
      "giay-de-nghi-dieu-chinh-hmtc":                    "mau_5",
      "phu-luc-hop-dong-cho-vay-hmtc":                   "mau_7",
      "de-nghi-tam-dung-mo-lai-cham-dut-hmtc":           "mau_8",
    };
    return mapping[serviceCode] || null;
  };

  // ==========================================
  // HANDLER — ROW CLICK
  // ==========================================
  const handleRowClick = async (record) => {
    if (isTamNghi) return;
    setLoadingDetail(true);
    try {
      const detail = await getTransactionById(record.id);
      setSelectedRecord(detail);
    } catch (error) {
      console.error("Lỗi tải chi tiết giao dịch:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ==========================================
  // HANDLER — TẠM NGHỈ
  // ✅ SỬA: gọi toggleCounters để set is_active = false cho quầy hiện tại
  // ==========================================
  const handleTamNghi = async () => {
    if (hasServingTransaction) {
      message.warning("Đang có giao dịch đang được phục vụ, không thể tạm nghỉ!");
      return;
    }
    if (!counterId) {
      message.warning("Không tìm thấy thông tin quầy hiện tại!");
      return;
    }
    setTogglingCounter(true);
    try {
      await toggleCounters(counterId, false);
      setIsTamNghi(true);
      setSelectedRecord(null);
      // message.success("Đã tạm nghỉ!");
    } catch (error) {
      console.error("Lỗi tạm nghỉ:", error);
      message.error("Không thể tạm nghỉ: " + error.message);
    } finally {
      setTogglingCounter(false);
    }
  };

  // ==========================================
  // HANDLER — KHÔI PHỤC
  // ✅ SỬA: gọi toggleCounters để set is_active = true cho quầy hiện tại
  // ==========================================
  const handleKhoiPhuc = async () => {
    if (!counterId) {
      message.warning("Không tìm thấy thông tin quầy hiện tại!");
      return;
    }
    setTogglingCounter(true);
    try {
      await toggleCounters(counterId, true);
      setIsTamNghi(false);
      // message.success("Đã khôi phục hoạt động!");
    } catch (error) {
      console.error("Lỗi khôi phục:", error);
      message.error("Không thể khôi phục: " + error.message);
    } finally {
      setTogglingCounter(false);
    }
  };

  // ==========================================
  // HANDLER — GỌI LẠI
  // ==========================================
  const handleGoiLai = async (record) => {
    if (!record?.id || isTamNghi) return;
    setCallingId(record.id);
    try {
      const callTime = toTimeString(new Date());
      await callTransaction(record.id, {
        call_time:  callTime,
        user_id:    userId,
        counter_id: counterId,
      });
      await fetchActiveTransactions();
      const detail = await getTransactionById(record.id);
      setSelectedRecord(detail);
    } catch (error) {
      console.error("Lỗi gọi lại:", error);
    } finally {
      setCallingId(null);
    }
  };

  // ==========================================
  // HANDLER — TIẾP THEO
  // ==========================================
  const handleTiepTheo = async () => {
    if (!firstWaiting || isTamNghi) return;
    setCallingId(firstWaiting.id);
    try {
      const callTime = toTimeString(new Date());
      await callTransaction(firstWaiting.id, {
        call_time:  callTime,
        user_id:    userId,
        counter_id: counterId,
      });
      await fetchActiveTransactions();
      const detail = await getTransactionById(firstWaiting.id);
      setSelectedRecord(detail);
    } catch (error) {
      console.error("Lỗi tiếp theo:", error);
    } finally {
      setCallingId(null);
    }
  };

  // ==========================================
  // HANDLER — KẾT THÚC
  // ==========================================
  const handleKetThuc = async () => {
    if (!selectedRecord?.id) return;

    if (selectedRecord.status !== "serving") {
      message.warning(
        selectedRecord.status === "waiting"
          ? "Vé chưa được gọi. Vui lòng gọi vé trước khi kết thúc!"
          : selectedRecord.status === "completed"
          ? "Giao dịch này đã hoàn thành rồi!"
          : selectedRecord.status === "cancelled"
          ? "Giao dịch này đã bị hủy, không thể kết thúc!"
          : "Không thể kết thúc giao dịch ở trạng thái hiện tại!"
      );
      return;
    }

    const recordId = selectedRecord.id;
    setCompletingId(recordId);
    try {
      const endTime = toTimeString(new Date());
      await completeTransaction(recordId, { end_time: endTime });
      // message.success("Kết thúc giao dịch thành công!");

      const result = await getActiveTransactionsByUser(userId);
      const newList = result.data || [];
      setWaitingList(newList);

      const servingRecord = newList.find((r) => r.status === "serving");
      if (servingRecord) {
        try {
          const detail = await getTransactionById(servingRecord.id);
          setSelectedRecord(detail);
        } catch {
          setSelectedRecord(servingRecord);
        }
      } else {
        setSelectedRecord(null);
      }
    } catch (error) {
      console.error("Lỗi kết thúc:", error);
      message.error("Kết thúc giao dịch thất bại! Vui lòng thử lại.");
    } finally {
      setCompletingId(null);
    }
  };

  // ==========================================
  // HANDLER — HỦY VÉ
  // ==========================================
  const handleHuyVe = async (record) => {
    if (!record?.id || isTamNghi) return;
    const recordId = record.id;
    setCancellingId(recordId);
    try {
      const endTime = toTimeString(new Date());
      await cancelTransaction(recordId, { end_time: endTime });
      // message.success("Hủy vé thành công!");

      // Sau khi hủy: fetch lại danh sách, rồi quyết định panel bên phải hiển thị gì
      const [activeResult, cancelledResult] = await Promise.all([
        getActiveTransactionsByUser(userId),
        getCancelledTransactionsByUser(userId),
      ]);
      const newActiveList = activeResult.data || [];
      setWaitingList(newActiveList);
      setCancelledList(cancelledResult.data || []);

      if (selectedRecord && selectedRecord.id === recordId) {
        // Ưu tiên hiển thị vé đang serving tại quầy
        const servingRecord = newActiveList.find((r) => r.status === "serving");
        if (servingRecord) {
          try {
            const detail = await getTransactionById(servingRecord.id);
            setSelectedRecord(detail);
          } catch {
            setSelectedRecord(servingRecord);
          }
        } else {
          // Không có vé serving → về trạng thái mặc định
          setSelectedRecord(null);
        }
      }
    } catch (error) {
      console.error("Lỗi hủy vé:", error);
      message.error("Hủy vé thất bại!");
    } finally {
      setCancellingId(null);
    }
  };

  // ==========================================
  // HANDLER — KHÔI PHỤC VÉ
  // ==========================================
  const handleKhoiPhucVe = async (record) => {
    if (!record?.id || isTamNghi) return;
    const recordId = record.id;
    setRestoringId(recordId);
    try {
      await updateTransaction(recordId, { status: "waiting", user_id: null, counter_id: null, end_time: null, call_time: null });
      if (selectedRecord && selectedRecord.id === recordId) {
        setSelectedRecord(null);
      }
      await fetchActiveTransactions();
      await fetchCancelledTransactions();
    } catch (error) {
      console.error("Lỗi khôi phục vé:", error);
      message.error("Khôi phục vé thất bại!");
    } finally {
      setRestoringId(null);
    }
  };

  // ==========================================
  // TÍNH THỜI GIAN ĐỢI REALTIME
  // ==========================================
  const calcWaitTime = (record) => {
    if (!record.print_time) return "00:00:00";
    const date = record.print_date || now.toISOString().slice(0, 10);
    try {
      const from = new Date(`${date}T${record.print_time}`);
      if (record.call_time) {
        const to     = new Date(`${date}T${record.call_time}`);
        const diffMs = to - from;
        if (diffMs < 0) return "00:00:00";
        const total = Math.floor(diffMs / 1000);
        const h = String(Math.floor(total / 3600)).padStart(2, "0");
        const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
        const s = String(total % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
      }
      const diffMs = now - from;
      if (diffMs < 0) return "00:00:00";
      const total = Math.floor(diffMs / 1000);
      const h = String(Math.floor(total / 3600)).padStart(2, "0");
      const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
      const s = String(total % 60).padStart(2, "0");
      return `${h}:${m}:${s}`;
    } catch {
      return "00:00:00";
    }
  };

  // ==========================================
  // TÍNH THỜI GIAN PHỤC VỤ REALTIME
  // ==========================================
  const calcServingTime = (record) => {
    if (!record?.call_time) return "";
    const date = record.print_date || now.toISOString().slice(0, 10);
    try {
      const from   = new Date(`${date}T${record.call_time}`);
      const to     = record.end_time ? new Date(`${date}T${record.end_time}`) : now;
      const diffMs = to - from;
      if (diffMs < 0) return "00:00:00";
      const total = Math.floor(diffMs / 1000);
      const h = String(Math.floor(total / 3600)).padStart(2, "0");
      const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
      const s = String(total % 60).padStart(2, "0");
      return `${h}:${m}:${s}`;
    } catch {
      return "00:00:00";
    }
  };

  // ==========================================
  // TABLE COLUMNS
  // ==========================================
  const rowClassName = (record) =>
    selectedRecord && selectedRecord.id === record.id ? "selected-row" : "";

  const columns_waiting = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Loại vé",
      key: "ticket_type",
      align: "center",
      render: (_, record) => record.ticket_type || "—",
    },
    {
      title: "Số vé",
      key: "ticket_code",
      align: "center",
      render: (_, record) => record.ticket_code || "—",
    },
    {
      title: "Dịch vụ",
      key: "service",
      align: "center",
      render: (_, record) => record.service ? record.service.name_vi : "—",
    },
    {
      title: "Thời gian đợi",
      key: "wait_time",
      align: "center",
      render: (_, record) => (
        <span className="badge-wait-time">{calcWaitTime(record)}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => {
        const isWaiting    = record.status === "waiting";
        const isCalling    = callingId === record.id;
        const isCancelling = cancellingId === record.id;
        const disabled     = isTamNghi || !isWaiting || isCalling;
        return (
          <div
            style={{ display: "flex", justifyContent: "center", gap: "10px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              title="Gọi lại"
              loading={isCalling}
              disabled={disabled}
              onClick={() => handleGoiLai(record)}
              style={{ background: "none", border: "none", padding: "0 4px", width: "min-content", height: "min-content" }}
            >
              {!isCalling && (
                <FaPlay style={{ color: disabled ? "#ccc" : "#636363", cursor: disabled ? "default" : "pointer", fontSize: "14px" }} />
              )}
            </Button>
            <Button
              title="Chuyển đổi vé"
              disabled={isTamNghi}
              onClick={() => handleOpenTransferModal(record)}
              style={{ background: "none", border: "none", padding: "0 4px", width: "min-content", height: "min-content" }}
            >
              <FaEdit style={{ color: isTamNghi ? "#ccc" : "#636363", cursor: isTamNghi ? "default" : "pointer", fontSize: "14px" }} />
            </Button>
            <Button
              title="Hủy vé"
              loading={isCancelling}
              disabled={isTamNghi || isCancelling}
              onClick={() => handleHuyVe(record)}
              style={{ background: "none", border: "none", padding: "0 4px", width: "min-content", height: "min-content" }}
            >
              {!isCancelling && (
                <FaTrash style={{ color: isTamNghi ? "#ccc" : "#636363", cursor: isTamNghi ? "default" : "pointer", fontSize: "14px" }} />
              )}
            </Button>
          </div>
        );
      },
    },
  ];

  const columns_cancel = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Số vé",
      key: "ticket_code",
      align: "center",
      render: (_, record) => record.ticket_code || "—",
    },
    {
      title: "Dịch vụ",
      key: "service",
      align: "center",
      render: (_, record) => record.service ? record.service.name_vi : "—",
    },
    {
      title: "Thời gian hủy",
      key: "end_time",
      align: "center",
      render: (_, record) => record.end_time || "—",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => {
        const isRestoring = restoringId === record.id;
        return (
          <div
            style={{ display: "flex", justifyContent: "center", gap: "10px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              title="Khôi phục"
              loading={isRestoring}
              disabled={isTamNghi || isRestoring}
              onClick={() => handleKhoiPhucVe(record)}
              style={{ background: "none", border: "none", padding: "0 4px", width: "min-content", height: "min-content" }}
            >
              {!isRestoring && (
                <FaUndo style={{ color: isTamNghi ? "#ccc" : "#636363", cursor: isTamNghi ? "default" : "pointer", fontSize: "14px" }} />
              )}
            </Button>
          </div>
        );
      },
    },
  ];

  // ==========================================
  // PANEL BÊN PHẢI
  // ==========================================
  const cccd       = selectedRecord?.cccd_info || null;
  const imgCccdSrc = cccd?.dg02 ? `data:image/jpeg;base64,${cccd.dg02}` : null;
  const imgCamSrc  = selectedRecord?.thumbnail_base64
    ? `data:image/jpeg;base64,${selectedRecord.thumbnail_base64}`
    : null;

  const hasSelected = !!selectedRecord;
  const statusLabel = hasSelected
    ? (STATUS_LABEL[selectedRecord.status] || selectedRecord.status || "—")
    : "Tạm nghỉ";
  const statusColor = hasSelected
    ? (STATUS_COLOR[selectedRecord.status] || "#0099FF")
    : "#0099FF";

  const isCompleting      = completingId === selectedRecord?.id;
  const isCancelling      = cancellingId === selectedRecord?.id;
  const isRestoringPanel  = restoringId  === selectedRecord?.id;
  // ✅ THÊM: vé đang chọn có status cancelled không?
  const isCancelledRecord = hasSelected && selectedRecord.status === "cancelled";
  const canComplete       = hasSelected && selectedRecord.status === "serving" && !isTamNghi && !isCompleting;
  // ✅ THÊM: có thể khôi phục vé đang chọn từ panel bên phải
  const canRestorePanel   = isCancelledRecord && !isTamNghi && !isRestoringPanel;

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/user">User</Link> },
          { title: "Trang chủ" },
        ]}
      />

      <Row gutter={24}>
        {/* CỘT TRÁI: BẢNG VÉ */}
        <Col
          xs={24}
          lg={16}
          style={{
            background: "#CCFFFF",
            height: "40rem",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <Tabs
              defaultActiveKey="1"
              className="custom-tabs-cyan"
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
              items={[
                {
                  key: "1",
                  label: `VÉ ĐANG ĐỢI (${waitingList.length})`,
                  children: (
                    <Table
                      columns={columns_waiting}
                      dataSource={waitingList}
                      rowKey="id"
                      loading={loadingWaiting}
                      bordered
                      className="custom-table-cyan mt-2"
                      pagination={false}
                      scroll={{ y: 450 }}
                      rowClassName={rowClassName}
                      onRow={(record) => ({
                        onClick: () => handleRowClick(record),
                        style: { cursor: isTamNghi ? "not-allowed" : "pointer" },
                      })}
                    />
                  ),
                },
                {
                  key: "2",
                  label: `VÉ TẠM HỦY/ CHỜ KHÔI PHỤC (${cancelledList.length})`,
                  children: (
                    <Table
                      columns={columns_cancel}
                      dataSource={cancelledList}
                      rowKey="id"
                      loading={loadingCancelled}
                      bordered
                      className="custom-table-cyan mt-2"
                      pagination={false}
                      scroll={{ y: 450, width: "1%" }}
                      rowClassName={rowClassName}
                      onRow={(record) => ({
                        onClick: () => handleRowClick(record),
                        style: { cursor: isTamNghi ? "not-allowed" : "pointer" },
                      })}
                    />
                  ),
                },
              ]}
            />
          </div>

          <div className="button-container">
            <Button
              className="btn-tiep-theo"
              disabled={isTamNghi || !firstWaiting || !!callingId}
              loading={!!callingId && callingId === firstWaiting?.id}
              onClick={handleTiepTheo}
            >
              TIẾP THEO
            </Button>

            {/* ✅ SỬA: loading khi đang toggle hoặc đang fetch trạng thái ban đầu */}
            <Button
              className={isTamNghi ? "btn-khoi-phuc" : "btn-tam-nghi"}
              loading={togglingCounter || loadingCounterStatus}
              disabled={togglingCounter || loadingCounterStatus}
              onClick={isTamNghi ? handleKhoiPhuc : handleTamNghi}
            >
              {!togglingCounter && !loadingCounterStatus && (isTamNghi ? "KHÔI PHỤC" : "TẠM NGHỈ")}
            </Button>
          </div>
        </Col>

        {/* CỘT PHẢI: PANEL THÔNG TIN */}
        <Col xs={24} lg={8}>
          <div
            style={{
              background: "#B0E0E6",
              height: "40rem",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            {loadingDetail ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <Spin size="large" />
              </div>
            ) : (
              <>
                {/* Ảnh CCCD và ảnh chụp màn hình */}
                <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "8px" }}>
                  <div style={{ width: "120px", height: "140px", borderRadius: "8px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {imgCccdSrc
                      ? <img src={imgCccdSrc} alt="Ảnh CCCD" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <MdPerson size={100} color="#ccc" />
                    }
                  </div>
                  <div style={{ width: "120px", height: "140px", borderRadius: "8px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {imgCamSrc
                      ? <img src={imgCamSrc} alt="Ảnh chụp màn" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <MdPerson size={100} color="#ccc" />
                    }
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
                  <Button style={{ background: "white", border: "2px solid #ddd" }}>+</Button>
                </div>

                {/* NÚT BIỂU MẪU */}
                {selectedRecord ? (
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
                    <Button
                      loading={generatingPdf}
                      disabled={isTamNghi || generatingPdf}
                      onClick={handleBieuMau}
                      style={{ background: "white", border: "2px solid #ddd" }}
                    >
                      Biểu mẫu
                    </Button>
                  </div>
                ) : null}

                {/* Trạng thái */}
                <div style={{ textAlign: "center", margin: "6px 0" }}>
                  <Text strong style={{ fontSize: "20px", color: statusColor }}>
                    {statusLabel}
                  </Text>
                </div>

                {/* Thông tin vé */}
                <div style={{ padding: "6px 20px 4px 20px", borderRadius: "8px" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text strong>Số vé: </Text>
                    <Text>{selectedRecord?.ticket_code || ""}</Text>
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <Text strong>Phục vụ: </Text>
                    <Text>{calcServingTime(selectedRecord)}</Text>
                  </div>
                  <div>
                    <Text strong>Dịch vụ: </Text>
                    <Text>{selectedRecord?.service?.name_vi || ""}</Text>
                  </div>
                  <hr />
                </div>

                {/* Thông tin khách hàng */}
                <div style={{ padding: "4px 20px 12px 20px", borderRadius: "8px" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text strong>Họ và Tên: </Text>
                    <Text>{cccd?.full_name || ""}</Text>
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <Text strong>Số CCCD: </Text>
                    <Text>{cccd?.eid_number || ""}</Text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Button
                      disabled={!hasSelected || isTamNghi}
                      style={{
                        background: hasSelected && !isTamNghi ? "#0099FF" : "#E0E0E0",
                        border: "none",
                        color: hasSelected && !isTamNghi ? "white" : "#999",
                        width: "6rem",
                      }}
                    >
                      CCCD
                    </Button>
                  </div>
                </div>

                {/* Buttons hành động */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <Button
                    disabled={!hasSelected || isTamNghi || !!callingId}
                    loading={!!callingId && callingId === selectedRecord?.id}
                    onClick={() => selectedRecord && handleGoiLai(selectedRecord)}
                    style={{
                      background: hasSelected && !isTamNghi ? "#0099FF" : "#E0E0E0",
                      border: "none",
                      color: hasSelected && !isTamNghi ? "white" : "#999",
                    }}
                  >
                    GỌI LẠI
                  </Button>

                  <Button
                    disabled={!hasSelected || isTamNghi}
                    onClick={() => selectedRecord && handleOpenTransferModal(selectedRecord)}
                    style={{
                      background: hasSelected && !isTamNghi ? "#0099FF" : "#E0E0E0",
                      border: "none",
                      color: hasSelected && !isTamNghi ? "white" : "#999",
                    }}
                  >
                    CHUYỂN VÉ
                  </Button>

                  <Button
                    disabled={!canComplete}
                    loading={isCompleting}
                    onClick={handleKetThuc}
                    title={
                      !hasSelected
                        ? "Chưa chọn giao dịch"
                        : selectedRecord?.status !== "serving"
                        ? "Chỉ có thể kết thúc khi giao dịch đang được phục vụ"
                        : ""
                    }
                    style={{
                      background: canComplete ? "#0099FF" : "#E0E0E0",
                      border: "none",
                      color: canComplete ? "white" : "#999",
                      cursor: canComplete ? "pointer" : "not-allowed",
                    }}
                  >
                    KẾT THÚC
                  </Button>

                  {/* ✅ SỬA: button 2 trạng thái — HỦY VÉ khi chưa hủy, KHÔI PHỤC khi đã hủy */}
                  {isCancelledRecord ? (
                    <Button
                      loading={isRestoringPanel}
                      disabled={!canRestorePanel}
                      onClick={() => selectedRecord && handleKhoiPhucVe(selectedRecord)}
                      style={{
                        background: canRestorePanel ? "#28a745" : "#E0E0E0",
                        border: "none",
                        color: canRestorePanel ? "white" : "#999",
                        cursor: canRestorePanel ? "pointer" : "not-allowed",
                      }}
                    >
                      KHÔI PHỤC
                    </Button>
                  ) : (
                    <Button
                      disabled={!hasSelected || isTamNghi || isCancelling}
                      loading={isCancelling}
                      onClick={() => selectedRecord && handleHuyVe(selectedRecord)}
                      style={{
                        background: hasSelected && !isTamNghi ? "#cc3333" : "#E0E0E0",
                        border: "none",
                        color: hasSelected && !isTamNghi ? "white" : "#999",
                      }}
                    >
                      HỦY VÉ
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </Col>
      </Row>

      {/* ==========================================
          MODAL CHUYỂN ĐỔI VÉ
          ========================================== */}
      <Modal
        open={transferModalVisible}
        onCancel={() => {
          if (!transferring) {
            setTransferModalVisible(false);
            setTransferRecord(null);
            setTransferServiceId(null);
            setTransferCounterCode(null);
          }
        }}
        footer={null}
        width={620}
        closable={!transferring}
        maskClosable={!transferring}
        styles={{ header: { padding: 0, marginBottom: 0 }, body: { padding: 0 } }}
        style={{ top: 80 }}
      >
        {/* Header */}
        <div style={{ fontWeight: "bold", fontSize: "16px", padding: "12px" }}>
          CHUYỂN ĐỔI VÉ
        </div>

        <div style={{ padding: "24px 28px 20px 28px" }}>
          <Row gutter={32}>
            {/* Cột trái: Thông tin vé */}
            <Col span={10}>
              <div style={{ borderRight: "1px solid #e0e0e0", paddingRight: "24px", height: "100%" }}>
                <Text
                  strong
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginBottom: "16px",
                    fontSize: "13px",
                    color: "#555",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  THÔNG TIN VÉ
                </Text>

                <div style={{ marginBottom: "10px" }}>
                  <Text strong>Số vé: </Text>
                  <Text>{transferRecord?.ticket_code || "—"}</Text>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <Text strong>Dịch vụ: </Text>
                  <Text>{transferRecord?.service?.name_vi || "—"}</Text>
                </div>
                <div>
                  <Text strong>Giờ in vé: </Text>
                  <Text>{transferRecord?.print_time || "—"}</Text>
                </div>
              </div>
            </Col>

            {/* Cột phải: Thông tin chuyển đổi */}
            <Col span={14}>
              <Text
                strong
                style={{
                  display: "block",
                  textAlign: "center",
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: "#555",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                THÔNG TIN CHUYỂN ĐỔI
              </Text>

              {/* Chọn dịch vụ */}
              <div style={{ marginBottom: "16px" }}>
                <Text strong style={{ display: "block", marginBottom: "6px" }}>
                  Chọn dịch vụ
                </Text>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Chọn dịch vụ..."
                  value={transferServiceId}
                  onChange={(val) => setTransferServiceId(val)}
                  loading={loadingServices}
                  showSearch
                  optionFilterProp="children"
                  allowClear
                >
                  {serviceOptions.map((svc) => (
                    <Option key={svc.id} value={svc.id}>
                      {svc.name_vi || svc.name || svc.code}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Chọn quầy chuyển đến */}
              {/* ✅ SỬA: hiển thị tất cả quầy nhưng chỉ cho chọn quầy is_active = true */}
              <div style={{ marginBottom: "8px" }}>
                <Text strong style={{ display: "block", marginBottom: "6px" }}>
                  Chọn quầy chuyển đến
                </Text>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Quầy..."
                  value={transferCounterCode}
                  onChange={(value) => setTransferCounterCode(value)}
                  loading={loadingCounters}
                  showSearch
                  optionFilterProp="children"
                  allowClear
                >
                  {counterOptions.map((counter) => {
                    // ✅ Quầy inactive bị disabled, không cho chọn
                    const inactive = !isCounterActive(counter);
                    // ✅ Quầy hiện tại của user cũng không cho chọn
                    const isCurrentCounter = counter.id === counterId;
                    const isDisabled = inactive || isCurrentCounter;
                    return (
                      <Option
                        key={counter.id}
                        value={counter.id || counter.code}
                        disabled={isDisabled}
                        style={{ color: isDisabled ? "#bbb" : undefined }}
                      >
                        {counter.name || counter.code}
                        {inactive && " (Không hoạt động)"}
                        {!inactive && isCurrentCounter && " (Quầy hiện tại)"}
                      </Option>
                    );
                  })}
                </Select>
              </div>
            </Col>
          </Row>

          {/* Footer buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "24px",
              borderTop: "1px solid #f0f0f0",
              paddingTop: "16px",
            }}
          >
            <Button
              disabled={transferring}
              onClick={() => {
                setTransferModalVisible(false);
                setTransferRecord(null);
                setTransferServiceId(null);
                setTransferCounterCode(null);
              }}
              style={{ minWidth: "90px" }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              loading={transferring}
              onClick={handleConfirmTransfer}
              style={{ background: "#0099FF", border: "none", minWidth: "90px" }}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>

      {/* PDF MODAL */}
      {pdfModalVisible && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xem PDF - {pdfFileName}</h5>
                <button type="button" className="btn-close" onClick={() => setPdfModalVisible(false)} />
              </div>
              <div className="modal-body p-0" style={{ height: "80vh" }}>
                <iframe src={pdfUrl} style={{ width: "100%", height: "100%", border: "none", borderRadius: "8px" }} title="PDF Viewer" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPdfModalVisible(false)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .badge-wait-time {
          display: inline-block;
          background-color: #b65a5a;
          color: white;
          font-weight: bold;
          padding: 3px 14px;
          border-radius: 4px;
          min-width: 80px;
          text-align: center;
          letter-spacing: 1px;
          font-variant-numeric: tabular-nums;
        }

        .custom-table-cyan { background-color: #CCFFFF !important; }
        .custom-table-cyan .ant-table { background-color: #CCFFFF !important; }
        .custom-table-cyan .ant-table-container { background-color: #CCFFFF !important; }
        .custom-table-cyan .ant-table-thead > tr > th {
          background-color: #0099FF !important; color: white !important;
          font-weight: bold !important; border-bottom: 1px solid #0088dd !important;
        }
        .custom-table-cyan .ant-table-tbody > tr > td {
          background-color: #CCFFFF !important; border-bottom: 1px solid #d9f2f2 !important;
        }
        .custom-table-cyan .ant-table-tbody > tr:hover > td { background-color: #b3e6e6 !important; }
        .custom-table-cyan .ant-table-placeholder { background-color: #CCFFFF !important; }
        .custom-table-cyan .ant-empty { background-color: transparent !important; }
        .custom-table-cyan .ant-spin-container { background-color: #CCFFFF !important; }
        .custom-table-cyan .ant-table-body { overflow-y: auto !important; }
        .custom-table-cyan .ant-table-tbody > tr.selected-row > td { background-color: #80d4ff !important; }

        .table-disabled { opacity: 0.5; pointer-events: none; }

        .custom-tabs-cyan { display: flex !important; flex-direction: column !important; height: 100% !important; }
        .custom-tabs-cyan .ant-tabs-content-holder { background-color: #CCFFFF !important; flex: 1 !important; overflow: hidden !important; }
        .custom-tabs-cyan .ant-tabs-tabpane { background-color: #CCFFFF !important; height: 100% !important; }
        .custom-tabs-cyan .ant-tabs-content { background-color: #CCFFFF !important; height: 100% !important; }
        .custom-tabs-cyan .ant-tabs-nav { background-color: #CCFFFF !important; margin: 0 !important; }
        .custom-tabs-cyan .ant-tabs-tab { color: #999 !important; font-weight: 500 !important; }
        .custom-tabs-cyan .ant-tabs-tab-active { color: #0099FF !important; }
        .custom-tabs-cyan .ant-tabs-ink-bar { background: #0099FF !important; }

        .button-container { display: flex; justify-content: center; gap: 16px; padding: 16px 0 0 0; margin-top: auto; }

        .btn-tiep-theo { background-color: #0099FF !important; color: white !important; border: none !important; padding: 6px 24px !important; height: auto !important; font-size: 14px !important; font-weight: 500 !important; border-radius: 4px !important; }
        .btn-tiep-theo:hover:not(:disabled) { background-color: #0088dd !important; }
        .btn-tiep-theo:disabled { background-color: #ccc !important; color: #666 !important; cursor: not-allowed !important; opacity: 0.6 !important; }

        .btn-tam-nghi { background-color: #FFA500 !important; color: white !important; border: none !important; padding: 6px 24px !important; height: auto !important; font-size: 14px !important; font-weight: 500 !important; border-radius: 4px !important; }
        .btn-tam-nghi:hover { background-color: #FF9500 !important; }

        .btn-khoi-phuc { background-color: #28a745 !important; color: white !important; border: none !important; padding: 6px 24px !important; height: auto !important; font-size: 14px !important; font-weight: 500 !important; border-radius: 4px !important; }
        .btn-khoi-phuc:hover { background-color: #218838 !important; }
      `}</style>
    </>
  );
}

export default DashboardUser;