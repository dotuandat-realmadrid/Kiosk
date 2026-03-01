import React, { useState, useRef, useEffect } from "react";
import {
  VIETNAM_PROVINCES,
  VIETNAM_WARDS,
} from "../../assets/js/provinces_ward";
import VirtualKeyboard, {
  processVietnameseInput,
} from "./../VirtualKeyboard";
import IndustryModal from "./../IndustryModal";

const Mau_2 = ({ idData, initialFormData, onSubmit, onCancel }) => {
  // ===== STATE MANAGEMENT =====
  const [formData, setFormData] = useState({});
  const [addresses, setAddresses] = useState({
    permanent_address_province: "",
    permanent_address_ward: "",
    contact_address_province: "",
    contact_address_ward: "",
    headquarters_address_province: "",
    headquarters_address_ward: "",
    tax_registration_province: "",
    tax_registration_ward: "",
  });
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const activeInputRef = useRef(null);
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [selectedModalCell, setSelectedModalCell] = useState(null); // { tableName, rowIndex, columnName }

  // Khởi tạo formData với default cho tables
  const initializeFormData = () => {
    // Kiểm tra initialFormData
    if (initialFormData && Object.keys(initialFormData).length > 0) {
      return initialFormData;
    }

    // Lấy ngày hiện tại theo định dạng YYYY-MM-DD
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const currentDate = `ngày ${day} tháng ${month} năm ${year}`;

    return {
      business_registration_authority: "",
      id_document_type: "",
      permanent_address_street: "",
      contact_address_street: "",
      phone: "",
      email: "",
      business_household_name: "",
      headquarters_address_street: "",
      headquarters_phone: "",
      headquarters_fax: "",
      headquarters_email: "",
      headquarters_website: "",
      business_capital: "",
      tax_registration_street: "",
      tax_registration_phone: "",
      tax_registration_email: "",
      operation_start_date: "",
      total_employees: "",
      document_location: "Bắc Ninh", // Mặc định là Bắc Ninh
      document_date: currentDate, // Ngày hiện tại
      establishment_entity: "",
      // Tables
      business_sectors: [
        { stt: "1", industry_name: "", industry_code: "", is_main: "&#9744;" },
      ],
      business_locations: [
        {
          stt: "1",
          location_name: "",
          street: "",
          ward: "",
          province: "",
          start_date: "",
        },
      ],
      family_members: [
        {
          stt: "1",
          full_name: "",
          dob: "",
          gender: "",
          nationality: "",
          ethnicity: "",
          permanent_address: "",
          contact_address: "",
          id_number: "",
          signature: "",
        },
      ],
    };
  };

  useEffect(() => {
    setFormData(initializeFormData());
    // // Khởi tạo document_location select
    // const docLocationSelect = document.getElementById("document_location");
    // if (docLocationSelect) {
    //   docLocationSelect.innerHTML = "";
    //   const defaultOption = document.createElement("option");
    //   defaultOption.style.textAlign = "center";
    //   defaultOption.value = "";
    //   defaultOption.textContent = "-- Chọn --";
    //   docLocationSelect.appendChild(defaultOption);

    //   VIETNAM_PROVINCES.forEach(province => {
    //     const option = document.createElement("option");
    //     option.value = province;
    //     option.textContent = province;
    //     docLocationSelect.appendChild(option);
    //   });
    // }
  }, []);

  useEffect(() => {
    if (idData) {
      // Nếu cả 2 trường đều rỗng -> Căn cước công dân
      if (!idData.place_of_residence_qr && !idData.date_of_issue_qr) {
        setFormData((prev) => ({
          ...prev,
          id_document_type: "Căn cước công dân",
        }));
      }
      // Nếu cả 2 trường đều có giá trị -> Căn cước
      else if (idData.place_of_residence_qr && idData.date_of_issue_qr) {
        setFormData((prev) => ({ ...prev, id_document_type: "Căn cước" }));
      }
      // else {
      //   setFormData(prev => ({ ...prev, id_document_type: "" }));
      // }
    }
  }, [idData]); // Chạy lại khi idData thay đổi

  // Thêm hàm format số (đặt sau phần STATE MANAGEMENT)
  const formatNumber = (value) => {
    // Nếu value rỗng hoặc undefined, trả về chuỗi rỗng
    if (!value) return "";

    // Chuyển về string nếu cần
    const stringValue = String(value);

    // Loại bỏ tất cả dấu chấm cũ (để tránh format lại sai)
    const cleanValue = stringValue.replace(/\./g, "");

    // Kiểm tra nếu không phải toàn số thì trả về giá trị gốc
    if (!/^\d+$/.test(cleanValue)) {
      return value;
    }

    // Format với dấu chấm phân cách hàng nghìn
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Sửa lại handleChange để xử lý format số
  // ===== HANDLE CHANGE =====
  const handleChange = (field, value) => {
    if (field === "business_capital" || field === "total_employees") {
      const formatted = formatNumber(value);
      setFormData((prev) => ({ ...prev, [field]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleProvinceChange = (e) => {
    const { name, value } = e.target;
    const wardFieldName = name.replace("_province", "_ward");

    setAddresses((prev) => ({
      ...prev,
      [name]: value,
      [wardFieldName]: "", // Reset ward khi đổi province
    }));
  };

  const handleWardChange = (e) => {
    const { name, value } = e.target;
    setAddresses((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputFocus = (fieldName, inputRef) => {
    setActiveField(fieldName);
    activeInputRef.current = inputRef;
    setShowKeyboard(true);
  };

  const handleKeyPress = (key) => {
    if (!activeField) return;

    const tableMatch = activeField.match(/^(.+)_(\d+)_(.+)$/);
    if (tableMatch) {
      const [, tableName, rowIdx, colName] = tableMatch;
      const tableData = formData[tableName] || [];
      const current = tableData[parseInt(rowIdx)]?.[colName] || "";

      if (key === "Backspace") {
        const updated = [...tableData];
        updated[parseInt(rowIdx)] = {
          ...updated[parseInt(rowIdx)],
          [colName]: current.slice(0, -1),
        };
        setFormData((prev) => ({ ...prev, [tableName]: updated }));
        return;
      }
      if (key === "Enter") {
        setShowKeyboard(false);
        setActiveField(null);
        return;
      }

      const newVal = processVietnameseInput(current, key);
      const updated = [...tableData];
      updated[parseInt(rowIdx)] = {
        ...updated[parseInt(rowIdx)],
        [colName]: newVal,
      };
      setFormData((prev) => ({ ...prev, [tableName]: updated }));
    } else {
      const current = formData[activeField] || "";
      if (key === "Backspace") {
        handleChange(activeField, current.slice(0, -1));
        return;
      }
      if (key === "Enter") {
        setShowKeyboard(false);
        setActiveField(null);
        return;
      }
      const newVal = processVietnameseInput(current, key);
      handleChange(activeField, newVal);
    }
  };

  // ===== TABLE HANDLERS =====
  const handleTableChange = (tableName, rowIdx, colName, val) => {
    const tableData = formData[tableName] || [];
    const updated = [...tableData];

    if (!updated[rowIdx]) {
      updated[rowIdx] = {};
    }

    // Nếu đang cập nhật is_main = "☒", bỏ chọn tất cả các row khác
    if (
      tableName === "business_sectors" &&
      colName === "is_main" &&
      val === "&#9746;"
    ) {
      updated.forEach((row, idx) => {
        if (idx !== rowIdx) {
          row.is_main = "&#9744;";
        }
      });
    }

    // Cập nhật giá trị theo đúng thứ tự: stt, industry_name, industry_code, is_main
    if (tableName === "business_sectors") {
      updated[rowIdx] = {
        stt: updated[rowIdx].stt || (rowIdx + 1).toString(),
        industry_name:
          colName === "industry_name"
            ? val
            : updated[rowIdx].industry_name || "",
        industry_code:
          colName === "industry_code"
            ? val
            : updated[rowIdx].industry_code || "",
        is_main:
          colName === "is_main" ? val : updated[rowIdx].is_main || "&#9744;",
      };
    } else {
      // Các table khác giữ nguyên logic cũ
      updated[rowIdx] = { ...updated[rowIdx], [colName]: val };
    }

    // Cập nhật lại STT
    updated.forEach((r, i) => {
      if (!r.stt || r.stt !== (i + 1).toString()) {
        r.stt = (i + 1).toString();
      }
    });

    setFormData((prev) => ({ ...prev, [tableName]: updated }));
  };

  const addRow = (tableName, defaultRow) => {
    const tableData = formData[tableName] || [];

    // Xử lý riêng cho business_sectors
    if (tableName === "business_sectors") {
      const newRow = {
        stt: (tableData.length + 1).toString(),
        industry_name: "",
        industry_code: "",
        is_main: "&#9744;",
      };
      const updated = [...tableData, newRow];
      setFormData((prev) => ({ ...prev, [tableName]: updated }));
    } else {
      const newRow = { ...defaultRow, stt: (tableData.length + 1).toString() };
      const updated = [...tableData, newRow];
      setFormData((prev) => ({ ...prev, [tableName]: updated }));
    }
  };

  const deleteRow = (tableName, rowIdx) => {
    const tableData = formData[tableName] || [];
    if (tableData.length <= 1) return; // minRows = 1
    let updated = tableData.filter((_, i) => i !== rowIdx);
    updated.forEach((r, i) => (r.stt = (i + 1).toString()));
    setFormData((prev) => ({ ...prev, [tableName]: updated }));
  };

  // ===== MODAL HANDLERS =====
  const handleOpenModal = (tableName, rowIndex, columnName) => {
    setSelectedModalCell({ tableName, rowIndex, columnName });
    setShowIndustryModal(true);
  };

  const handleModalSelect = (selectedIndustry) => {
    if (!selectedModalCell) return;

    const { tableName, rowIndex } = selectedModalCell;
    const tableData = formData[tableName] || [];
    const updated = [...tableData];

    if (!updated[rowIndex]) {
      updated[rowIndex] = {
        stt: (rowIndex + 1).toString(),
        industry_name: "",
        industry_code: "",
        is_main: "&#9744;",
      };
    }

    // Cập nhật theo đúng thứ tự
    updated[rowIndex] = {
      stt: updated[rowIndex].stt || (rowIndex + 1).toString(),
      industry_name: selectedIndustry.industry_name || "",
      industry_code: selectedIndustry.industry_code || "",
      is_main: updated[rowIndex].is_main || "&#9744;",
    };

    setFormData((prev) => ({ ...prev, [tableName]: updated }));
    setShowIndustryModal(false);
    setSelectedModalCell(null);
  };

  const processFormDataForPDF = (data) => {
    let processed = { ...data, ...addresses }; // Kết hợp addresses vào processed
    const date = processed.document_date || "";
    const parts = date.split("-");
    processed.year = parts[0] || ".......";
    processed.month = parts[1] || ".......";
    processed.day = parts[2] || ".......";

    Object.keys(processed).forEach((k) => {
      if (Array.isArray(processed[k])) {
        return; // Giữ nguyên dữ liệu table
      }

      if (k === "document_location" && !processed[k]) {
        processed[k] = "..........";
      } else if (!processed[k]) {
        processed[k] = "...................................";
      }
    });

    return processed;
  };

  // ===== HANDLE SUBMIT =====
  const handleSubmit = () => {
    onSubmit({
      rawData: formData, // ← Data gốc để quay lại
      processedData: processFormDataForPDF(formData), // ← Data đã xử lý để tạo PDF
    });
  };

  // ===== RENDER OPTIONS =====
  const renderProvinceOptions = () => {
    return (
      <>
        <option style={{ textAlign: "center" }} value="">
          -- Chọn Tỉnh/Thành phố --
        </option>
        {VIETNAM_PROVINCES.map((province, index) => (
          <option key={index} value={province}>
            {province}
          </option>
        ))}
      </>
    );
  };

  const renderWardOptions = (province) => {
    if (!province) {
      return (
        <option style={{ textAlign: "center" }} value="">
          -- Chọn Tỉnh/Thành phố --
        </option>
      );
    }

    const wards = VIETNAM_WARDS[province] || [];

    return (
      <>
        <option style={{ textAlign: "center" }} value="">
          -- Chọn Xã/Phường/Đặc khu --
        </option>
        {wards.map((ward, index) => (
          <option key={index} value={ward}>
            {ward}
          </option>
        ))}
      </>
    );
  };

  // ===== RENDER TABLES =====
  const renderIndustryTable = () => {
    const tableData = formData.business_sectors || [
      { stt: "1", industry_name: "", industry_code: "", is_main: false },
    ];
    return (
      <table>
        <thead>
          <tr>
            <th style={{ fontWeight: "bold" }}>STT</th>
            <th style={{ fontWeight: "bold" }}>Tên ngành</th>
            <th style={{ fontWeight: "bold" }}>
              Mã ngành <sup style={{ fontSize: "7pt" }}>2</sup>
            </th>
            <th style={{ fontWeight: "bold" }}>
              Ngành, nghề kinh doanh chính
              <span style={{ fontStyle: "italic", fontWeight: "normal" }}>
                (Đánh dấu x để chọn một trong các ngành, nghề đã kê khai)
              </span>
            </th>
            <th style={{ width: "50pt", fontWeight: "bold" }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIdx) => (
            <tr key={rowIdx}>
              <td className="text-center">{rowIdx + 1}</td>
              <td>
                <textarea
                  className="form-control form-control-sm"
                  value={row.industry_name || ""}
                  rows={3}
                  readOnly
                />
              </td>
              <td>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={row.industry_code || ""}
                    readOnly
                    placeholder="Chọn"
                    onClick={() =>
                      handleOpenModal(
                        "business_sectors",
                        rowIdx,
                        "industry_code"
                      )
                    }
                    style={{
                      paddingRight: "35px",
                      backgroundColor: "white",
                      cursor: "pointer",
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() =>
                      handleOpenModal(
                        "business_sectors",
                        rowIdx,
                        "industry_code"
                      )
                    }
                    style={{
                      position: "absolute",
                      right: "5px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                    }}
                  >
                    <svg
                      style={{
                        width: "16px",
                        height: "16px",
                        color: "#64748b",
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
              </td>
              <td className="text-center">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={row.is_main === "&#9746;"}
                  onChange={(e) =>
                    handleTableChange(
                      "business_sectors",
                      rowIdx,
                      "is_main",
                      e.target.checked ? "&#9746;" : "&#9744;"
                    )
                  }
                />
              </td>
              <td className="text-center align-middle">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteRow("business_sectors", rowIdx)}
                  disabled={tableData.length <= 1}
                >
                  <svg
                    style={{ width: "14px", height: "14px" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderLocationTable = () => {
    const tableData = formData.business_locations || [
      {
        stt: "1",
        location_name: "",
        street: "",
        ward: "",
        province: "",
        start_date: "",
      },
    ];
    return (
      <table>
        <thead>
          <tr>
            <th rowSpan={2}>STT</th>
            <th rowSpan={2}>Tên địa điểm kinh doanh</th>
            <th colSpan={3}>Địa chỉ kinh doanh</th>
            <th rowSpan={2}>Ngày bắt đầu hoạt động</th>
            <th rowSpan={2} style={{ width: "50pt" }}>
              Thao tác
            </th>
          </tr>
          <tr>
            <th>Số nhà, đường phố/tổ/xóm/ấp/thôn</th>
            <th>Xã/Phường/Đặc khu</th>
            <th>Tỉnh/Thành phố</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIdx) => (
            <tr key={rowIdx}>
              <td className="text-center">{rowIdx + 1}</td>
              <td>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={row.location_name || ""}
                  onChange={(e) =>
                    handleTableChange(
                      "business_locations",
                      rowIdx,
                      "location_name",
                      e.target.value
                    )
                  }
                  onFocus={(e) =>
                    handleInputFocus(
                      `business_locations_${rowIdx}_location_name`,
                      e.target
                    )
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={row.street || ""}
                  onChange={(e) =>
                    handleTableChange(
                      "business_locations",
                      rowIdx,
                      "street",
                      e.target.value
                    )
                  }
                  onFocus={(e) =>
                    handleInputFocus(
                      `business_locations_${rowIdx}_street`,
                      e.target
                    )
                  }
                />
              </td>
              <td>
                <select
                  className="form-control form-control-sm"
                  value={row.ward || ""}
                  onChange={(e) =>
                    handleTableChange(
                      "business_locations",
                      rowIdx,
                      "ward",
                      e.target.value
                    )
                  }
                >
                  <option value="">-- Chọn Xã/Phường --</option>
                  {row.province && VIETNAM_WARDS[row.province]
                    ? VIETNAM_WARDS[row.province].map((ward, index) => (
                        <option key={index} value={ward}>
                          {ward}
                        </option>
                      ))
                    : null}
                </select>
              </td>
              <td>
                <select
                  className="form-control form-control-sm"
                  value={row.province || ""}
                  onChange={(e) => {
                    const newProvince = e.target.value;
                    const tableData = formData.business_locations || [];
                    const updated = [...tableData];

                    // Cập nhật CẢ province VÀ ward trong một lần
                    updated[rowIdx] = {
                      ...updated[rowIdx],
                      province: newProvince,
                      ward: "", // Reset ward cùng lúc
                    };

                    setFormData((prev) => ({
                      ...prev,
                      business_locations: updated,
                    }));
                  }}
                >
                  <option value="">-- Chọn Tỉnh/Thành phố --</option>
                  {VIETNAM_PROVINCES.map((province, index) => (
                    <option key={index} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={row.start_date || ""}
                  onChange={(e) =>
                    handleTableChange(
                      "business_locations",
                      rowIdx,
                      "start_date",
                      e.target.value
                    )
                  }
                />
              </td>
              <td className="text-center align-middle">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteRow("business_locations", rowIdx)}
                  disabled={tableData.length <= 1}
                >
                  <svg
                    style={{ width: "14px", height: "14px" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderFamilyTable = () => {
    const tableData = formData.family_members || [
      {
        stt: "1",
        full_name: "",
        dob: "",
        gender: "",
        nationality: "",
        ethnicity: "",
        permanent_address: "",
        contact_address: "",
        id_number: "",
        signature: "",
      },
    ];
    return (
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Họ và tên</th>
            <th>Ngày, tháng, năm sinh</th>
            <th>Giới tính</th>
            <th>Quốc tịch</th>
            <th>Dân tộc</th>
            <th>Địa chỉ thường trú</th>
            <th>Địa chỉ liên lạc</th>
            <th>Số, ngày cấp, cơ quan cấp CCCD/CMND</th>
            <th>Chữ ký</th>
            <th style={{ width: "50pt" }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIdx) => (
            <tr key={rowIdx}>
              <td className="text-center">{rowIdx + 1}</td>
              <td>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={row.full_name || ""}
                  onChange={(e) =>
                    handleTableChange(
                      "family_members",
                      rowIdx,
                      "full_name",
                      e.target.value
                    )
                  }
                  onFocus={(e) =>
                    handleInputFocus(
                      `family_members_${rowIdx}_full_name`,
                      e.target
                    )
                  }
                />
              </td>
              <td>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={row.dob || ""}
                  onChange={(e) =>
                    handleTableChange(
                      "family_members",
                      rowIdx,
                      "dob",
                      e.target.value
                    )
                  }
                />
              </td>
              <td>
                <select
                  className="form-control form-control-sm text-center"
                  value={row.gender || ""}
                  onChange={(e) =>
                    handleTableChange(
                      "family_members",
                      rowIdx,
                      "gender",
                      e.target.value
                    )
                  }
                >
                  <option value="">-- Chọn --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </td>
              <td>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={row.nationality || ""}
                  onChange={(e) =>
                    handleTableChange(
                      "family_members",
                      rowIdx,
                      "nationality",
                      e.target.value
                    )
                  }
                  onFocus={(e) =>
                    handleInputFocus(
                      `family_members_${rowIdx}_nationality`,
                      e.target
                    )
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={row.ethnicity || ""}
                  onChange={(e) =>
                    handleTableChange(
                      "family_members",
                      rowIdx,
                      "ethnicity",
                      e.target.value
                    )
                  }
                  onFocus={(e) =>
                    handleInputFocus(
                      `family_members_${rowIdx}_ethnicity`,
                      e.target
                    )
                  }
                />
              </td>
              <td>
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  value={row.permanent_address || ""}
                  onChange={(e) =>
                    handleTableChange(
                      "family_members",
                      rowIdx,
                      "permanent_address",
                      e.target.value
                    )
                  }
                  onFocus={(e) =>
                    handleInputFocus(
                      `family_members_${rowIdx}_permanent_address`,
                      e.target
                    )
                  }
                />
              </td>
              <td>
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  value={row.contact_address || ""}
                  onChange={(e) =>
                    handleTableChange(
                      "family_members",
                      rowIdx,
                      "contact_address",
                      e.target.value
                    )
                  }
                  onFocus={(e) =>
                    handleInputFocus(
                      `family_members_${rowIdx}_contact_address`,
                      e.target
                    )
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={row.id_number || ""}
                  onChange={(e) =>
                    handleTableChange(
                      "family_members",
                      rowIdx,
                      "id_number",
                      e.target.value
                    )
                  }
                  onFocus={(e) =>
                    handleInputFocus(
                      `family_members_${rowIdx}_id_number`,
                      e.target
                    )
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={row.signature || ""}
                  onChange={(e) =>
                    handleTableChange(
                      "family_members",
                      rowIdx,
                      "signature",
                      e.target.value
                    )
                  }
                  onFocus={(e) =>
                    handleInputFocus(
                      `family_members_${rowIdx}_signature`,
                      e.target
                    )
                  }
                />
              </td>
              <td className="text-center align-middle">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteRow("family_members", rowIdx)}
                  disabled={tableData.length <= 1}
                >
                  <svg
                    style={{ width: "14px", height: "14px" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
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
    .c0 {
      color: #000000;
      font-weight: 400;
      text-decoration: none;
      vertical-align: baseline;
      font-size: 11pt;
      font-family: "Times New Roman";
      font-style: italic;
    }
    .c1 {
      display: flex;
      align-items: center;
      gap: 6pt;
      padding-top: 0pt;
      padding-bottom: 0pt;
      line-height: 1;
      orphans: 2;
      widows: 2;
      text-align: justify;
    }
    .c1 input {
      flex: 1;
      min-width: 0;
    }
    .c1 select {
      width: max-content;
    }
    .c1 radio {
      flex: 1;
      min-width: 0;
    }
    .c2 {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      gap: 6pt;
      padding-top: 0pt;
      padding-bottom: 0pt;
      line-height: 1;
      orphans: 2;
      widows: 2;
      text-align: justify;
    }
    .c2 input[type="radio"] {
      display: none;
    }
    /* Ô vuông */
    .radio-box {
      width: 16pt;
      height: 16pt;
      border: 2pt solid #333;
      margin-right: 2pt;
      position: relative;
      border-radius: 2pt;
      transition: all 0.2s ease;
    }
    /* Dấu ✓ khi được chọn */
    .c2 input[type="radio"]:checked + .radio-box-check::after {
      content: "✓";
      position: absolute;
      top: 0;
      left: 1pt;
      font-size: 14pt;
      color: #000000ff;
      font-weight: bold;
    }
    /* Dấu ✕ khi được chọn */
    .c2 input[type="radio"]:checked + .radio-box-cross::after {
      content: "✕";
      position: absolute;
      top: 0;
      left: 1px;
      font-size: 14pt;
      color: #000000ff;
      font-weight: bold;
    }
    .c3 {
      color: #000000;
      font-weight: 400;
      text-decoration: none;
      vertical-align: baseline;
      font-size: 12pt;
      font-family: "Times New Roman";
      font-style: normal;
    }
    .c4 {
      color: #000000;
      font-weight: 400;
      text-decoration: none;
      vertical-align: baseline;
      font-size: 12pt;
      padding-left: 2rem;
      font-family: "Times New Roman";
      font-style: normal;
    }
    .c5 {
      color: #000000;
      font-weight: bold;
      text-decoration: none;
      vertical-align: baseline;
      font-size: 12pt;
      padding-left: 1rem;
      font-family: "Times New Roman";
      font-style: normal;
    }
    .c6 {
      color: #000000;
      font-weight: bold;
      text-decoration: none;
      vertical-align: baseline;
      font-size: 12pt;
      font-family: "Times New Roman";
      font-style: normal;
    }
    .c7 {
      background-color: #ffffff;
      max-width: 951.4pt;
      margin-top: 3rem;
      padding: 24pt;
      border-radius: 24pt;
      font-family: "Times New Roman";
    }
    .c8 {
      color: #000000;
      font-weight: 700;
      text-decoration: none;
      vertical-align: baseline;
      font-size: 12pt;
      font-family: "Times New Roman";
      font-style: normal;
    }
    .c9 {
      padding-top: 0pt;
      padding-bottom: 0pt;
      line-height: 1;
      orphans: 2;
      widows: 2;
      text-align: left;
      height: 12pt;
    }
    .c10 {
      line-height: 1;
      orphans: 2;
      widows: 2;
      text-align: right;
    }
    .c11 {
      color: #000000;
      text-decoration: none;
      vertical-align: baseline;
      font-size: 12pt;
      font-family: "Times New Roman";
      font-style: italic;
    }
    .c12 {
      padding-top: 2.4pt;
      padding-bottom: 2.4pt;
      line-height: 1;
      orphans: 2;
      widows: 2;
      text-align: center;
      align-items: center;
    }
    .c12 input {
      flex: 1;
      min-width: 0;
    }
    .c13 {
      padding-top: 2.4pt;
      padding-bottom: 2.4pt;
      line-height: 1;
      page-break-after: avoid;
      text-align: center;
    }
    .c14 {
      padding-top: 0pt;
      padding-bottom: 0pt;
      line-height: 1;
      orphans: 2;
      widows: 2;
      text-align: center;
    }
    .c15 {
      padding: 0;
      margin: 0;
      line-height: 1;
      orphans: 2;
      widows: 2;
      text-align: justify;
    }
    .c16 {
      color: #000000;
      text-decoration: none;
      vertical-align: baseline;
      font-size: 10pt;
      font-family: "Times New Roman";
      font-style: normal;
    }
    .c17 {
      color: #000000;
      font-weight: 400;
      text-decoration: none;
      vertical-align: baseline;
      font-size: 12pt;
      font-family: "Times New Roman";
      font-style: normal;
    }
    .c18 {
      color: #000000;
      font-weight: 400;
      text-decoration: none;
      vertical-align: baseline;
      font-size: 12pt;
      font-family: "Times New Roman";
      font-style: italic;
    }
    .c23 {
      color: #000000;
      font-weight: 700;
      text-decoration: none;
      vertical-align: baseline;
      font-size: 14pt;
      font-family: "Times New Roman";
      font-style: normal;
    }
    .c25 {
      color: #000000;
      font-weight: 700;
      text-decoration: none;
      vertical-align: baseline;
      font-size: 12pt;
      font-family: "Times New Roman";
      font-style: normal;
    }
    .c27 {
      padding-top: 0pt;
      padding-bottom: 0pt;
      line-height: 1;
      orphans: 2;
      widows: 2;
      text-align: right;
    }
    .c28 {
      padding-top: 0pt;
      padding-bottom: 0pt;
      line-height: 1;
      orphans: 2;
      widows: 2;
      text-align: left;
    }
    table {
      width: 100%;
      border-collapse: collapse; /* gộp viền */
      border: 1px solid #000;    /* viền ngoài */
      table-layout: fixed;
    }
    table th,
    table td {
      border: 1px solid #000;    /* viền ô */
      padding: 6px 4px;          /* khoảng cách chữ */
      vertical-align: middle;   /* căn giữa theo chiều dọc */
      font-size: 12pt;           /* đồng bộ với biểu mẫu */
      font-family: "Times New Roman";
    }
    table th {
      text-align: center;
      font-weight: normal;      /* KHÔNG bôi đậm (chuẩn hành chính) */
    }
    table th:first-child {
      width: 36px;
    }
    table td {
      word-wrap: break-word; /* Tự động xuống dòng */
      word-break: break-word; /* Ngắt từ dài */
      white-space: pre-line; /* Cho phép xuống dòng */
      vertical-align: middle; /* Căn trên giữa */
      text-align: center; /* Mặc định là center */
    }

    table td:nth-child(2),
    table td:nth-child(7),
    table td:nth-child(8),
    table td:nth-child(9),
    table td:nth-child(10) {
      text-align: justify;
    }
    .form_control {
      background-clip: padding-box;
      border: 1px solid #ced4da;
      border-radius: 0.375rem;
      line-height: 1.5;
      box-sizing: border-box;
      padding: 0 6pt;
      font-size: 12pt;
    }
    .form_control option {
      text-align: center;
      text-align-last: center;
    }
  `;

  return (
    <>
      <style>{customStyles}</style>
      <div className="c7 doc-content">
        <div>
          <p className="c9">
            <span className="c17"></span>
          </p>
          <p className="c27">
            <span className="c0">Mẫu số 02/TCCN</span>
          </p>
        </div>
        <p className="c13" style={{ margin: 0 }}>
          <span className="c25">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</span>
        </p>
        <p className="c14" style={{ margin: 0 }}>
          <span className="c25">Độc lập – Tự do – Hạnh phúc</span>
        </p>
        <p className="c28" style={{ textAlign: "center", margin: "4px" }}>
          <span
            style={{
              overflow: "hidden",
              display: "inline-block",
              margin: "0px 0px",
              border: "0px solid #000000",
              transform: "rotate(0rad) translateZ(0px)",
              WebkitTransform: "rotate(0rad) translateZ(0px)",
              width: "180px",
              height: "1.33px",
            }}
          >
            <img
              alt=""
              src="https://lh3.googleusercontent.com/fife/ALs6j_Egzj__am4C2zFNUv8BzCFckNeu9evuOchjlq7AA6VeBL3sspaSX5hfyRVI47Vr4ShNLBPumkbMu_3Poj2i4JKNcGdZG73qEOep7KdX3UVXQd9F5NRia0VaJweJWIMi_6tqRIOAtqsGJeAtQdpnyhab7Enid8Hk9SSVocFo1ejdfgQ7Eh3VEPis9cCV7Bi9j25HgOkdXbaVuHEE2BMeb1gxHKk-0lLntiQioxbuVwxGdSq7KexQ5Z5BQ2kalVHOGD37oFhWeMDIwjYsLyAeHDOsmBG39nBSnUS80vUJnOn0DBm-xuRp_sDknfWXwOlmmFdyrYnC-BIJYWE1jWd77iNLrVB2TGFBQ8nfDmhXvrbVi1egv6SLS8UneZp4urW9iFQjXh4_xh57KzfSI6s64EQHpSlvAjQAbH5uha_vkuwY6w5FDv5qzIrgf5BmmIMyOqBV83QF1bM8TgHf7HZcwiY_1nTSaaKETWh9XJFwq_tuvwe0F_UV7FwFgvZulkpiuQTeybPPTrmyVaYVct-1GA-bM0QWU0lFiQGGYsiHMAm6k2A3bIeM18UETvZb26GTYfXBWHhWdLuVremp3BR3qWlwHtTtKyz8FCkfpYhgGMvs9wmAKH8P7UIOAJ7KZD29DV_5CoiZZ3XpOcUgA1eV9_QHs237JBmvcHaZALCT_IGHl7Wm0uUoTx07lXZu_6fS48Jh-RrpSDDkgI2fSeIslcfwfDxvvCNv4eKNJIoaarMYJdhaXPAiNMQznzFur78442YZvli2FmOH3MFKCZdin4SXRLihUrLXNH-2lALKxGZeLGAJLe_Sjf-A7ANH1KtEG_Q4LSPZfUQVWWVY9PjnsuQ__P2rTuKwDSijllCy6qb9EtlvCG7MFQqehuYFs-0G2pYuhf0OTUAxQyg5olPAVxmiGM8HK1nNaR_WGFBK5Dh756rxoXonX8HuPXF5EVb9e8nX92B9zoJ2vLzVsy_TjeQ-TW1zqPRST5_p5gTQuYCgcbYWi7asV6KEYqmAqGogrpthbCKW_Fnu9mSRv8sDaIxCzaxpIDd5N_RNxvIHcoOcvqj946qE9AveFhFt7X_Wxtm9ocIimkkiWq9_qdlcpLCe6m5XKhjYsZj1k4fUdr-kGItIDiQuwjIbaQlVk9-XpxzfYrGmyqnpr-4y9T_K5BLMawVK7GLObEZACuy9t-GjRHW-BcI-drE_mbUxqwBhoD9Th-_tF5rrQr4E_uErA8RhGgUJ1RnaL6_frso7Q7Py8VU2CEoHk8hGGiTo0PQUhwlVlHPdkgFy6Ij_OPUinRkqSLNSmt0zYqF9g8f5Zz5r5KbqB-pFJFtxau9YGDoUf55LigFd-lcFNnu5sdzVnBlZzkhycayuOX553RoVYv3okpjYAKGiRwyBkZ8GhKOtAaMA-favzHI6BR_cHMkOPbLrz_g7DgmVAoye0Qxa5grDRcoH1LpcAEBorndIzu957CLcO3DghME8jNe-JTuejsLr4xI1Ui2pWy_8mi5csSjnov7oc7zfMotQr5defgFSyjwPRLzfjrM9QPNdscr6GWqwKTsKdJNJqcg_FpMIZ59ZvcU-rXmpDAMx0bfsjF76pn71Pu6Jjx9KS8a0HLSfCuJdgKNUaqOmJcMbpyaH66x7-kXrz0goZwEz9jWiCWaWW_CqLSx3FEy4lA=w1105-h889?auditContext=forDisplay"
              style={{
                width: "180px",
                height: "1.33px",
                marginLeft: "0px",
                marginTop: "0px",
                transform: "rotate(0rad) translateZ(0px)",
                WebkitTransform: "rotate(0rad) translateZ(0px)",
              }}
              title=""
            />
          </span>
        </p>
        <p style={{ textAlign: "right", paddingRight: "5rem" }}>
          <span className="c18">
            {formData.document_location || "..........."},{" "}
            {formData.document_date}
          </span>
        </p>
        <p className="c13">
          <span className="c23">GIẤY ĐỀ NGHỊ ĐĂNG KÝ HỘ KINH DOANH</span>
        </p>
        <p className="c12">
          <span className="c3">
            Kính gửi{" "}
            <span className="c18">(Cơ quan đăng ký kinh doanh cấp xã)</span>:
          </span>
          <input
            style={{ padding: "0 6pt", fontSize: "12pt" }}
            className="form_control"
            type="text"
            name="business_registration_authority"
            id="business_registration_authority"
            value={formData.business_registration_authority || ""}
            onChange={(e) =>
              handleChange("business_registration_authority", e.target.value)
            }
            onFocus={(e) =>
              handleInputFocus("business_registration_authority", e.target)
            }
          />
        </p>
        <p className="c1">
          <span className="c3">
            Tôi là <span className="c18">(ghi họ tên bằng chữ in hoa)</span>:
            <span style={{ textTransform: "uppercase" }}>
              {" "}
              {idData?.full_name}
            </span>
          </span>
        </p>
        <p
          className="c1"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <span className="c3">Sinh ngày: {idData?.date_of_issue}</span>
          <span className="c3">Dân tộc: {idData?.ethnicity}</span>
          <span className="c3">Quốc tịch: {idData?.nationality}</span>
        </p>
        <p className="c1">
          <span className="c3">
            Mã số thuế cá nhân <span className="c18">(nếu có)</span>:{" "}
            {idData?.eid_number}
          </span>
        </p>
        <p className="c2">
          <span className="c3" style={{ paddingRight: "18pt" }}>
            Loại giấy tờ pháp lý của cá nhân:
          </span>

          <label className="c2" style={{ cursor: "pointer" }}>
            <input
              type="radio"
              name="id_document_type"
              id="cccd"
              checked={formData.id_document_type === "Căn cước công dân"}
              onChange={() =>
                handleChange("id_document_type", "Căn cước công dân")
              }
            />
            <span className="radio-box radio-box-check"></span>
            <span className="c3" style={{ paddingRight: "4rem" }}>
              Căn cước công dân
            </span>
          </label>

          <label className="c2" style={{ cursor: "pointer" }}>
            <input
              type="radio"
              name="id_document_type"
              id="cc"
              checked={formData.id_document_type === "Căn cước"}
              onChange={() => handleChange("id_document_type", "Căn cước")}
            />
            <span className="radio-box radio-box-check"></span>
            <span className="c3">Căn cước</span>
          </label>
        </p>
        <p className="c1">
          <span className="c3">
            Số giấy tờ pháp lý của cá nhân: {idData?.eid_number}
          </span>
        </p>
        <p
          className="c1"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <span className="c3">Ngày cấp: {idData?.date_of_issue}</span>
          <span className="c3">Nơi cấp: {idData?.place_of_issue}</span>
        </p>
        <p className="c1">
          <span className="c3">
            Có giá trị đến ngày <span className="c18">(nếu có)</span>:{" "}
            {idData?.date_of_expiry}
          </span>
        </p>
        <p className="c1">
          <span className="c3">Địa chỉ thường trú:</span>
        </p>
        <p className="c1">
          <span className="c4">
            Tỉnh/Thành phố:
            <select
              style={{ margin: "0 10pt" }}
              className="form_control"
              name="permanent_address_province"
              id="permanent_address_province"
              value={addresses.permanent_address_province}
              onChange={handleProvinceChange}
            >
              {renderProvinceOptions()}
            </select>
          </span>
          <span className="c4" style={{ padding: "0 120pt" }}>
            Xã/Phường/Đặc khu:
            <select
              style={{ margin: "0 10pt" }}
              className="form_control"
              name="permanent_address_ward"
              id="permanent_address_ward"
              value={addresses.permanent_address_ward}
              onChange={handleWardChange}
            >
              {renderWardOptions(addresses.permanent_address_province)}
            </select>
          </span>
        </p>
        <p className="c1">
          <span className="c4">Số nhà, đường phố/tổ/xóm/ấp/thôn:</span>
          <input
            className="c3 form_control"
            type="text"
            name="permanent_address_street"
            id="permanent_address_street"
            value={formData.permanent_address_street || ""}
            onChange={(e) =>
              handleChange("permanent_address_street", e.target.value)
            }
            onFocus={(e) =>
              handleInputFocus("permanent_address_street", e.target)
            }
          />
        </p>
        <p className="c1">
          <span className="c3">Địa chỉ liên lạc:</span>
        </p>
        <p className="c1">
          <span className="c4">
            Tỉnh/Thành phố:
            <select
              style={{ margin: "0 10pt" }}
              className="form_control"
              name="contact_address_province"
              id="contact_address_province"
              value={addresses.contact_address_province}
              onChange={handleProvinceChange}
            >
              {renderProvinceOptions()}
            </select>
          </span>
          <span className="c4" style={{ padding: "0 120pt" }}>
            Xã/Phường/Đặc khu:
            <select
              style={{ margin: "0 10pt" }}
              className="form_control"
              name="contact_address_ward"
              id="contact_address_ward"
              value={addresses.contact_address_ward}
              onChange={handleWardChange}
            >
              {renderWardOptions(addresses.contact_address_province)}
            </select>
          </span>
        </p>
        <p className="c1">
          <span className="c4">Số nhà, đường phố/tổ/xóm/ấp/thôn:</span>
          <input
            className="c3 form_control"
            type="text"
            name="contact_address_street"
            id="contact_address_street"
            value={formData.contact_address_street || ""}
            onChange={(e) =>
              handleChange("contact_address_street", e.target.value)
            }
            onFocus={(e) =>
              handleInputFocus("contact_address_street", e.target)
            }
          />
        </p>
        <p
          className="c1"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <span className="c3">
            Điện thoại <span className="c18">(nếu có)</span>:
          </span>
          <input
            className="form_control"
            type="text"
            name="phone"
            id="phone"
            value={formData.phone || ""}
            onChange={(e) =>
              handleChange("phone", e.target.value.replace(/[^0-9]/g, ""))
            }
            onFocus={(e) => handleInputFocus("phone", e.target)}
          />
          <span className="c3">
            Email <span className="c18">(nếu có)</span>:
          </span>
          <input
            className="form_control"
            type="email"
            name="email"
            id="email"
            value={formData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            onFocus={(e) => handleInputFocus("email", e.target)}
          />
        </p>

        <p className="c1">
          <span className="c5">
            Đăng ký hộ kinh doanh do tôi là chủ hộ với các nội dung sau:
          </span>
        </p>
        <p className="c1">
          <span className="c6">
            1. Tên hộ kinh doanh
            <span className="c18"> (ghi bằng chữ in hoa)</span>:
          </span>
          <input
            className="form_control"
            type="text"
            name="business_household_name"
            id="business_household_name"
            value={formData.business_household_name || ""}
            onChange={(e) =>
              handleChange("business_household_name", e.target.value)
            }
            onFocus={(e) =>
              handleInputFocus("business_household_name", e.target)
            }
          />
        </p>
        <p className="c1">
          <span className="c6">2. Địa chỉ trụ sở hộ kinh doanh:</span>
        </p>
        <p className="c1">
          <span className="c3">
            Tỉnh/Thành phố:
            <select
              style={{ margin: "0 10pt" }}
              className="form_control"
              name="headquarters_address_province"
              id="headquarters_address_province"
              value={addresses.headquarters_address_province}
              onChange={handleProvinceChange}
            >
              {renderProvinceOptions()}
            </select>
          </span>
          <span className="c4" style={{ padding: "0 140pt" }}>
            Xã/Phường/Đặc khu:
            <select
              style={{ margin: "0 10pt" }}
              className="form_control"
              name="headquarters_address_ward"
              id="headquarters_address_ward"
              value={addresses.headquarters_address_ward}
              onChange={handleWardChange}
            >
              {renderWardOptions(addresses.headquarters_address_province)}
            </select>
          </span>
        </p>
        <p className="c1">
          <span className="c3">
            Số nhà, ngách, hẻm, ngõ, đường phố/tổ/xóm/ấp/thôn:
          </span>
          <input
            className="form_control"
            type="text"
            name="headquarters_address_street"
            id="headquarters_address_street"
            value={formData.headquarters_address_street || ""}
            onChange={(e) =>
              handleChange("headquarters_address_street", e.target.value)
            }
            onFocus={(e) =>
              handleInputFocus("headquarters_address_street", e.target)
            }
          />
        </p>
        <p
          className="c1"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <span className="c3">
            Điện thoại <span className="c18">(nếu có)</span>:
          </span>
          <input
            className="form_control"
            type="tel"
            name="headquarters_phone"
            id="headquarters_phone"
            value={formData.headquarters_phone || ""}
            onChange={(e) =>
              handleChange(
                "headquarters_phone",
                e.target.value.replace(/[^0-9]/g, "")
              )
            }
            onFocus={(e) => handleInputFocus("headquarters_phone", e.target)}
          />
          <span className="c3">
            Fax <span className="c18">(nếu có)</span>:
          </span>
          <input
            className="form_control"
            type="tel"
            name="headquarters_fax"
            id="headquarters_fax"
            value={formData.headquarters_fax || ""}
            onChange={(e) =>
              handleChange(
                "headquarters_fax",
                e.target.value.replace(/[^0-9]/g, "")
              )
            }
            onFocus={(e) => handleInputFocus("headquarters_fax", e.target)}
          />
        </p>
        <p
          className="c1"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <span className="c3">
            Email <span className="c18">(nếu có)</span>:
          </span>
          <input
            className="form_control"
            type="email"
            name="headquarters_email"
            id="headquarters_email"
            value={formData.headquarters_email || ""}
            onChange={(e) => handleChange("headquarters_email", e.target.value)}
            onFocus={(e) => handleInputFocus("headquarters_email", e.target)}
          />
          <span className="c3">
            Website <span className="c18">(nếu có)</span>:
          </span>
          <input
            className="form_control"
            type="text"
            name="headquarters_website"
            id="headquarters_website"
            value={formData.headquarters_website || ""}
            onChange={(e) =>
              handleChange("headquarters_website", e.target.value)
            }
            onFocus={(e) => handleInputFocus("headquarters_website", e.target)}
          />
        </p>
        <p className="c1">
          <span className="c6">
            3. Ngành, nghề kinh doanh
            <sup style={{ fontSize: "7pt" }}> 1 </sup>:
          </span>
        </p>
        {renderIndustryTable()}
        <button
          type="button"
          className="btn btn-sm btn-success my-2"
          onClick={() =>
            addRow("business_sectors", {
              industry_name: "",
              industry_code: "",
              is_main: "&#9744;",
            })
          }
        >
          <svg
            style={{ width: "14px", height: "14px" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <p className="c1">
          <span className="c6">4. Vốn kinh doanh:</span>
        </p>

        <p className="c1">
          <span className="c3">
            Tổng số <span className="c18">(bằng số, bằng chữ, VNĐ)</span>:
          </span>
          <input
            className="form_control"
            type="text"
            name="business_capital"
            id="business_capital"
            value={formData.business_capital || ""}
            onChange={(e) => handleChange("business_capital", e.target.value)}
            onFocus={(e) => handleInputFocus("business_capital", e.target)}
          />
        </p>

        <p className="c1">
          <span className="c6">5. Thông tin đăng ký thuế:</span>
        </p>

        <p className="c1">
          <span className="c3">
            5.1. Địa chỉ nhận thông báo thuế{" "}
            <span className="c18">
              (chỉ kê khai nếu địa chỉ nhận thông báo thuế khác địa chỉ trụ sở
              chính)
            </span>
            :
          </span>
        </p>

        <p className="c1">
          <span className="c4">
            Tỉnh/Thành phố:
            <select
              style={{ margin: "0 10pt" }}
              className="form_control"
              name="tax_registration_province"
              id="tax_registration_province"
              value={addresses.tax_registration_province}
              onChange={handleProvinceChange}
            >
              {renderProvinceOptions()}
            </select>
          </span>

          <span className="c4" style={{ padding: "0 120pt" }}>
            Xã/Phường/Đặc khu:
            <select
              style={{ margin: "0 10pt" }}
              className="form_control"
              name="tax_registration_ward"
              id="tax_registration_ward"
              value={addresses.tax_registration_ward}
              onChange={handleWardChange}
            >
              {renderWardOptions(addresses.tax_registration_province)}
            </select>
          </span>
        </p>

        <p className="c1">
          <span className="c4">Số nhà, đường phố/tổ/xóm/ấp/thôn:</span>
          <input
            className="form_control"
            type="text"
            name="tax_registration_street"
            id="tax_registration_street"
            value={formData.tax_registration_street || ""}
            onChange={(e) =>
              handleChange("tax_registration_street", e.target.value)
            }
            onFocus={(e) =>
              handleInputFocus("tax_registration_street", e.target)
            }
          />
        </p>

        <p
          className="c1"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <span className="c3">
            Điện thoại <span className="c18">(nếu có)</span>:
          </span>
          <input
            className="form_control"
            type="tel"
            name="tax_registration_phone"
            id="tax_registration_phone"
            value={formData.tax_registration_phone || ""}
            onChange={(e) =>
              handleChange(
                "tax_registration_phone",
                e.target.value.replace(/[^0-9]/g, "")
              )
            }
            onFocus={(e) =>
              handleInputFocus("tax_registration_phone", e.target)
            }
          />
          <span className="c3">
            Email <span className="c18">(nếu có)</span>:
          </span>
          <input
            className="form_control"
            type="email"
            name="tax_registration_email"
            id="tax_registration_email"
            value={formData.tax_registration_email || ""}
            onChange={(e) =>
              handleChange("tax_registration_email", e.target.value)
            }
            onFocus={(e) =>
              handleInputFocus("tax_registration_email", e.target)
            }
          />
        </p>
        <p className="c1">
          <span className="c3">
            5.2. Ngày bắt đầu hoạt động
            <sup style={{ fontSize: "8pt" }}> 3</sup>
            <span className="c18">
              {" "}
              (trường hợp hộ kinh doanh dự kiến bắt đầu hoạt động kể từ ngày
              được cấp Giấy chứng nhận đăng ký hộ kinh doanh thì không cần kê
              khai nội dung này)
            </span>
            :
            <input
              style={{ margin: "6pt 0" }}
              className="form_control"
              type="date"
              name="operation_start_date"
              id="operation_start_date"
              value={formData.operation_start_date || ""}
              onChange={(e) =>
                handleChange("operation_start_date", e.target.value)
              }
            />
          </span>
        </p>
        <p className="c1">
          <span className="c3">
            5.3. Tổng số lao động <span className="c18">(dự kiến)</span>:
          </span>
          <input
            className="form_control"
            type="text"
            name="total_employees"
            id="total_employees"
            value={formData.total_employees || ""}
            onChange={(e) =>
              handleChange(
                "total_employees",
                e.target.value.replace(/[^0-9]/g, "")
              )
            }
            onFocus={(e) => handleInputFocus("total_employees", e.target)}
          />
        </p>
        <p className="c1">
          <span className="c3">
            5.4. Địa điểm kinh doanh của hộ kinh doanh{" "}
            <span className="c18">
              (Chỉ kê khai khi có địa điểm kinh doanh khác trụ sở hộ kinh doanh)
            </span>
            :
          </span>
        </p>
        {renderLocationTable()}
        <button
          type="button"
          className="btn btn-sm btn-success my-2"
          onClick={() =>
            addRow("business_locations", {
              location_name: "",
              street: "",
              ward: "",
              province: "",
              start_date: "",
            })
          }
        >
          <svg
            style={{ width: "14px", height: "14px" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <p className="c1">
          <span className="c6">6. Chủ thể thành lập hộ kinh doanh</span>
          <span className="c3">
            <span className="c18">(đánh dấu X vào ô thích hợp)</span>:
          </span>
        </p>
        <p className="c2">
          <label className="c2" style={{ cursor: "pointer" }}>
            <input
              type="radio"
              name="establishment_entity"
              id="cn"
              checked={formData.establishment_entity === "Cá nhân"}
              onChange={() => handleChange("establishment_entity", "Cá nhân")}
            />
            <span className="radio-box radio-box-cross"></span>
            <span className="c3" style={{ paddingRight: "12rem" }}>
              Cá nhân
            </span>
          </label>

          <label className="c2" style={{ cursor: "pointer" }}>
            <input
              type="radio"
              name="establishment_entity"
              id="ctvhgd"
              checked={
                formData.establishment_entity === "Các thành viên hộ gia đình"
              }
              onChange={() =>
                handleChange(
                  "establishment_entity",
                  "Các thành viên hộ gia đình"
                )
              }
            />
            <span className="radio-box radio-box-cross"></span>
            <span className="c3">Các thành viên hộ gia đình</span>
          </label>
        </p>
        <p className="c1">
          <span className="c6">
            7. Thông tin về các thành viên hộ gia đình tham gia thành lập hộ
            kinh doanh<sup style={{ fontSize: "8pt" }}> 4 </sup>:
          </span>
        </p>
        {renderFamilyTable()}
        <button
          type="button"
          className="btn btn-sm btn-success mt-2"
          onClick={() =>
            addRow("family_members", {
              full_name: "",
              dob: "",
              gender: "",
              nationality: "",
              ethnicity: "",
              permanent_address: "",
              contact_address: "",
              id_number: "",
              signature: "",
            })
          }
        >
          <svg
            style={{ width: "14px", height: "14px" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        <p className="c1">
          <span className="c3"> </span>
        </p>

        <p className="c1">
          <span className="c3">Tôi xin cam kết:</span>
        </p>
        <p className="c1">
          <span className="c3">
            - Bản thân và các thành viên hộ kinh doanh{" "}
            <span className="c18">
              (trường hợp hộ kinh doanh do các thành viên hộ gia đình đăng ký
              thành lập)
            </span>{" "}
            không thuộc diện pháp luật cấm kinh doanh;
          </span>
        </p>
        <p className="c1">
          <span className="c3">
            - Không đồng thời là chủ hộ kinh doanh khác;
          </span>
        </p>
        <p className="c1">
          <span className="c3">- Không là chủ doanh nghiệp tư nhân;</span>
        </p>
        <p className="c1">
          <span className="c3">
            - Không là thành viên hợp danh của công ty hợp danh{" "}
            <span className="c18">
              (trừ trường hợp được sự nhất trí của các thành viên hợp danh còn
              lại)
            </span>
            ;
          </span>
        </p>
        <p className="c1">
          <span className="c3">
            - Địa chỉ trụ sở hộ kinh doanh thuộc quyền sở hữu/quyền sử dụng hợp
            pháp của hộ kinh doanh và được sử dụng đúng mục đích theo quy định
            của pháp luật;
          </span>
        </p>
        <p className="c1">
          <span className="c3">
            - Hoàn toàn chịu trách nhiệm trước pháp luật về tính hợp pháp, chính
            xác và trung thực của nội dung đăng ký trên.
          </span>
        </p>

        <p
          className="c10"
          style={{ paddingRight: "5rem", marginTop: 0, marginBottom: 0 }}
        >
          <span className="c8">CHỦ HỘ KINH DOANH</span>
        </p>
        <p
          className="c10"
          style={{ paddingRight: "6.5rem", marginTop: 0, marginBottom: 0 }}
        >
          <span className="c11">
            (Ký và ghi họ tên)
            <sup style={{ fontSize: "7pt" }}> 5 </sup>
          </span>
        </p>

        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <hr />
        <p className="c15">
          <span className="c16">
            <sup style={{ fontSize: "7pt" }}>1</sup> - Hộ kinh doanh có quyền tự
            do kinh doanh trong những ngành, nghề mà luật không cấm;
          </span>
        </p>

        <p className="c15">
          <span className="c16">
            - Các ngành, nghề cấm đầu tư kinh doanh quy định tại Điều 6 Luật Đầu
            tư;
          </span>
        </p>

        <p className="c15">
          <span className="c16">
            - Đối với ngành, nghề đầu tư kinh doanh có điều kiện, hộ kinh doanh
            chỉ được kinh doanh khi có đủ điều kiện theo quy định. Danh mục
            ngành, nghề đầu tư kinh doanh có điều kiện quy định tại Phụ lục IV
            ban hành kèm theo Luật Đầu tư.
          </span>
        </p>

        <p className="c15">
          <span className="c16">
            <sup style={{ fontSize: "7pt" }}>2</sup> Ghi tên ngành và mã ngành
            cấp bốn trong Hệ thống ngành kinh tế Việt Nam đối với ngành, nghề
            kinh doanh chính. Đối với các ngành, nghề kinh doanh khác, hộ kinh
            doanh được ghi tự do (free text) và không cần ghi mã ngành cấp bốn.
          </span>
        </p>

        <p className="c15">
          <span className="c16">
            <sup style={{ fontSize: "7pt" }}>3</sup> Trường hợp hộ kinh doanh
            được cấp Giấy chứng nhận đăng ký hộ kinh doanh sau ngày bắt đầu hoạt
            động đã kê khai thì ngày bắt đầu hoạt động là ngày hộ kinh doanh
            được cấp Giấy chứng nhận đăng ký hộ kinh doanh.
          </span>
        </p>

        <p className="c15">
          <span className="c16">
            <sup style={{ fontSize: "7pt" }}>4</sup> Chỉ kê khai trong trường
            hợp chủ thể thành lập hộ kinh doanh là các thành viên hộ gia đình và
            kê khai cả thông tin của chủ hộ tại Bảng này.
          </span>
        </p>

        <p className="c15">
          <span className="c16">
            <sup style={{ fontSize: "7pt" }}>5</sup> Chủ hộ kinh doanh ký trực
            tiếp vào phần này.
          </span>
        </p>
      </div>

      <div className="p-4 d-flex justify-content-between gap-3">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Hủy
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
        >
          Xem PDF
        </button>
      </div>

      {showKeyboard && (
        <VirtualKeyboard
          onKeyPress={handleKeyPress}
          onClose={() => {
            setShowKeyboard(false);
            setActiveField(null);
          }}
          currentValue={(() => {
            if (!activeField) return "";
            const tableMatch = activeField.match(/^(.+)_(\d+)_(.+)$/);
            if (tableMatch) {
              const [, tableName, rowIdx, colName] = tableMatch;
              const tableData = formData[tableName] || [];
              return tableData[parseInt(rowIdx)]?.[colName] || "";
            }
            return formData[activeField] || "";
          })()}
        />
      )}

      <IndustryModal
        show={showIndustryModal}
        onClose={() => {
          setShowIndustryModal(false);
          setSelectedModalCell(null);
        }}
        onSelect={handleModalSelect}
      />
    </>
  );
};

export default Mau_2;
