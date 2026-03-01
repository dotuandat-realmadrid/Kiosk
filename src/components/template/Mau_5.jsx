import React, { useState, useRef, useEffect } from "react";
import VirtualKeyboard, {
  processVietnameseInput,
} from "./../VirtualKeyboard";

const Mau_5 = ({ idData, initialFormData, onSubmit, onCancel }) => {
  // ===== STATE MANAGEMENT =====
  const [formData, setFormData] = useState({});
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const activeInputRef = useRef(null);

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
    const currentDate = `${day} tháng ${month} năm ${year}`;

    return {
      branch_name: "",
      document_location: "Hà Nội",
      document_date: currentDate,
      hmtc_contract_number: "",
      hmtc_contract_date: "",
      hmtc_limit: "",
      hmtc_duration: "",
      hmtc_payment_method: "",
      hmtc_current_debt: "",
      organization_name: "",
      organization_address: "",
      organization_phone: "",
      organization_position: "",
      total_income: "",
      salary_method: "",
      salary_method_other: "",
      other_income: "",
      has_relative: "",
      relative_name: "",
      relative_relationship: "",
      relative_date_of_birth: "",
      relative_gender: "",
      relative_id_number: "",
      relative_id_issue_date: "",
      relative_id_issue_place: "",
      relative_address: "",
      relative_phone: "",
      relative_email: "",
      relative_workplace: "",
      relative_workplace_address: "",
      relative_workplace_phone: "",
      relative_field_of_activity: "",
      relative_position: "",
      relative_labor_contract_type: "",
      relative_labor_contract_expiry: "",
      relative_total_income: "",
      relative_salary_method: "",
      relative_salary_method_other: "",
      old_hmtc_limit: "",
      new_hmtc_limit: "",
      hmtc_adjustment_reason: "",
      official_name: "",
      official_position: "",
      official_labor_contract_duration: "",
      official_total_income: "",
      bank_section: "",
      bank_section_agree: "",
      bank_section_disagree: "",
      bank_section_other: "",
    };
  };

  useEffect(() => {
    setFormData(initializeFormData());
  }, []);

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
    if (
      field === "hmtc_limit" ||
      field === "hmtc_current_debt" ||
      field === "total_income" ||
      field === "other_income" ||
      field === "relative_total_income" ||
      field === "old_hmtc_limit" ||
      field === "new_hmtc_limit" ||
      field === "official_total_income"
    ) {
      setFormData((prev) => ({ ...prev, [field]: formatNumber(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
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

  const processFormDataForPDF = (data) => {
    let processed = { ...data };
    const relative_labor_contract_expiry =
      processed.relative_labor_contract_expiry || "";
    if (relative_labor_contract_expiry) {
      const parts = relative_labor_contract_expiry.split("-");
      processed.relative_labor_contract_expiry = `${parts[2] || ".."}/${
        parts[1] || ".."
      }/${parts[0] || "...."}`;
    } else {
      processed.relative_labor_contract_expiry = "../../....";
    }
    const relative_date_of_birth = processed.relative_date_of_birth || "";
    if (relative_date_of_birth) {
      const parts = relative_date_of_birth.split("-");
      processed.relative_date_of_birth = `${parts[2] || ".."}/${
        parts[1] || ".."
      }/${parts[0] || "...."}`;
    } else {
      processed.relative_date_of_birth = "../../....";
    }
    const hmtc_contract_date = processed.hmtc_contract_date || "";
    if (hmtc_contract_date) {
      const parts = hmtc_contract_date.split("-");
      processed.hmtc_contract_date = `${parts[2] || ".."}/${parts[1] || ".."}/${
        parts[0] || "...."
      }`;
    } else {
      processed.hmtc_contract_date = "../../....";
    }
    const relative_id_issue_date = processed.relative_id_issue_date || "";
    if (relative_id_issue_date) {
      const parts = relative_id_issue_date.split("-");
      processed.relative_id_issue_date = `${parts[2] || ".."}/${
        parts[1] || ".."
      }/${parts[0] || "...."}`;
    } else {
      processed.relative_id_issue_date = "../../....";
    }

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

  const customStyles = `
    @import url(https://themes.googleusercontent.com/fonts/css?kit=fpjTOVmNbO4Lz34iLyptLUXza5VhXqVC6o75Eld_V98);

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
      
    ol.lst-kix_list_9-0.start {
        counter-reset: lst-ctn-kix_list_9-0 0
    }

    ul.lst-kix_list_9-3 {
        list-style-type: none
    }

    ul.lst-kix_list_9-4 {
        list-style-type: none
    }

    ul.lst-kix_list_9-1 {
        list-style-type: none
    }

    ul.lst-kix_list_9-2 {
        list-style-type: none
    }

    ul.lst-kix_list_9-7 {
        list-style-type: none
    }

    ul.lst-kix_list_9-8 {
        list-style-type: none
    }

    ul.lst-kix_list_9-5 {
        list-style-type: none
    }

    .lst-kix_list_5-0>li {
        counter-increment: lst-ctn-kix_list_5-0
    }

    .lst-kix_list_9-0>li {
        counter-increment: lst-ctn-kix_list_9-0
    }

    ul.lst-kix_list_9-6 {
        list-style-type: none
    }

    ol.lst-kix_list_1-5.start {
        counter-reset: lst-ctn-kix_list_1-5 0
    }

    .lst-kix_list_1-2>li {
        counter-increment: lst-ctn-kix_list_1-2
    }

    ol.lst-kix_list_10-4.start {
        counter-reset: lst-ctn-kix_list_10-4 0
    }

    .lst-kix_list_5-0>li:before {
        content: "" counter(lst-ctn-kix_list_5-0, upper-roman) "/ "
    }

    ol.lst-kix_list_6-0 {
        list-style-type: none
    }

    .lst-kix_list_1-4>li {
        counter-increment: lst-ctn-kix_list_1-4
    }

    ol.lst-kix_list_1-6.start {
        counter-reset: lst-ctn-kix_list_1-6 0
    }

    .lst-kix_list_5-3>li:before {
        content: " "
    }

    .lst-kix_list_5-2>li:before {
        content: " "
    }

    .lst-kix_list_5-1>li:before {
        content: " "
    }

    .lst-kix_list_5-7>li:before {
        content: " "
    }

    ul.lst-kix_list_8-4 {
        list-style-type: none
    }

    ul.lst-kix_list_8-5 {
        list-style-type: none
    }

    .lst-kix_list_5-6>li:before {
        content: " "
    }

    .lst-kix_list_5-8>li:before {
        content: " "
    }

    ul.lst-kix_list_8-2 {
        list-style-type: none
    }

    ul.lst-kix_list_8-3 {
        list-style-type: none
    }

    ul.lst-kix_list_8-8 {
        list-style-type: none
    }

    ul.lst-kix_list_8-6 {
        list-style-type: none
    }

    ul.lst-kix_list_8-7 {
        list-style-type: none
    }

    .lst-kix_list_5-4>li:before {
        content: " "
    }

    .lst-kix_list_5-5>li:before {
        content: " "
    }

    ul.lst-kix_list_8-0 {
        list-style-type: none
    }

    ul.lst-kix_list_8-1 {
        list-style-type: none
    }

    .lst-kix_list_10-3>li {
        counter-increment: lst-ctn-kix_list_10-3
    }

    ol.lst-kix_list_1-0.start {
        counter-reset: lst-ctn-kix_list_1-0 0
    }

    .lst-kix_list_6-1>li:before {
        content: " "
    }

    .lst-kix_list_6-3>li:before {
        content: " "
    }

    .lst-kix_list_6-0>li:before {
        content: "" counter(lst-ctn-kix_list_6-0, decimal) ". "
    }

    .lst-kix_list_6-4>li:before {
        content: " "
    }

    ol.lst-kix_list_4-0.start {
        counter-reset: lst-ctn-kix_list_4-0 0
    }

    .lst-kix_list_6-2>li:before {
        content: " "
    }

    .lst-kix_list_6-8>li:before {
        content: " "
    }

    .lst-kix_list_6-5>li:before {
        content: " "
    }

    .lst-kix_list_6-7>li:before {
        content: " "
    }

    .lst-kix_list_6-6>li:before {
        content: " "
    }

    ol.lst-kix_list_1-3 {
        list-style-type: none
    }

    ol.lst-kix_list_10-6.start {
        counter-reset: lst-ctn-kix_list_10-6 0
    }

    ol.lst-kix_list_1-4 {
        list-style-type: none
    }

    .lst-kix_list_2-7>li:before {
        content: " "
    }

    ol.lst-kix_list_1-5 {
        list-style-type: none
    }

    .lst-kix_list_7-4>li:before {
        content: " "
    }

    .lst-kix_list_7-6>li:before {
        content: " "
    }

    ol.lst-kix_list_1-6 {
        list-style-type: none
    }

    ol.lst-kix_list_1-0 {
        list-style-type: none
    }

    .lst-kix_list_2-5>li:before {
        content: " "
    }

    ol.lst-kix_list_1-1 {
        list-style-type: none
    }

    ol.lst-kix_list_1-2 {
        list-style-type: none
    }

    .lst-kix_list_7-2>li:before {
        content: " "
    }

    ol.lst-kix_list_10-3.start {
        counter-reset: lst-ctn-kix_list_10-3 0
    }

    ul.lst-kix_list_3-7 {
        list-style-type: none
    }

    ul.lst-kix_list_3-8 {
        list-style-type: none
    }

    .lst-kix_list_10-1>li:before {
        content: "" counter(lst-ctn-kix_list_10-1, lower-latin) ". "
    }

    ul.lst-kix_list_3-1 {
        list-style-type: none
    }

    ul.lst-kix_list_3-2 {
        list-style-type: none
    }

    .lst-kix_list_7-8>li:before {
        content: " "
    }

    ul.lst-kix_list_3-0 {
        list-style-type: none
    }

    ol.lst-kix_list_1-7 {
        list-style-type: none
    }

    ul.lst-kix_list_3-5 {
        list-style-type: none
    }

    ol.lst-kix_list_9-0 {
        list-style-type: none
    }

    ol.lst-kix_list_1-8 {
        list-style-type: none
    }

    ul.lst-kix_list_3-6 {
        list-style-type: none
    }

    ul.lst-kix_list_3-3 {
        list-style-type: none
    }

    ul.lst-kix_list_3-4 {
        list-style-type: none
    }

    .lst-kix_list_10-7>li:before {
        content: "" counter(lst-ctn-kix_list_10-7, lower-latin) ". "
    }

    .lst-kix_list_10-5>li:before {
        content: "" counter(lst-ctn-kix_list_10-5, lower-roman) ". "
    }

    .lst-kix_list_10-3>li:before {
        content: "" counter(lst-ctn-kix_list_10-3, decimal) ". "
    }

    .lst-kix_list_4-1>li:before {
        content: " "
    }

    .lst-kix_list_9-2>li:before {
        content: " "
    }

    .lst-kix_list_4-3>li:before {
        content: " "
    }

    .lst-kix_list_4-5>li:before {
        content: " "
    }

    .lst-kix_list_1-8>li {
        counter-increment: lst-ctn-kix_list_1-8
    }

    .lst-kix_list_10-5>li {
        counter-increment: lst-ctn-kix_list_10-5
    }

    ol.lst-kix_list_1-4.start {
        counter-reset: lst-ctn-kix_list_1-4 0
    }

    ol.lst-kix_list_1-1.start {
        counter-reset: lst-ctn-kix_list_1-1 0
    }

    .lst-kix_list_9-0>li:before {
        content: "" counter(lst-ctn-kix_list_9-0, decimal) ". "
    }

    ol.lst-kix_list_10-7 {
        list-style-type: none
    }

    .lst-kix_list_9-6>li:before {
        content: " "
    }

    ol.lst-kix_list_10-8 {
        list-style-type: none
    }

    ol.lst-kix_list_10-3 {
        list-style-type: none
    }

    .lst-kix_list_9-4>li:before {
        content: " "
    }

    ol.lst-kix_list_10-4 {
        list-style-type: none
    }

    ol.lst-kix_list_10-5 {
        list-style-type: none
    }

    ol.lst-kix_list_10-6 {
        list-style-type: none
    }

    ol.lst-kix_list_10-0 {
        list-style-type: none
    }

    ol.lst-kix_list_10-1 {
        list-style-type: none
    }

    ol.lst-kix_list_1-3.start {
        counter-reset: lst-ctn-kix_list_1-3 0
    }

    ul.lst-kix_list_2-8 {
        list-style-type: none
    }

    ol.lst-kix_list_10-2 {
        list-style-type: none
    }

    ol.lst-kix_list_1-2.start {
        counter-reset: lst-ctn-kix_list_1-2 0
    }

    ul.lst-kix_list_2-2 {
        list-style-type: none
    }

    ul.lst-kix_list_2-3 {
        list-style-type: none
    }

    ul.lst-kix_list_2-0 {
        list-style-type: none
    }

    ul.lst-kix_list_2-1 {
        list-style-type: none
    }

    .lst-kix_list_9-8>li:before {
        content: " "
    }

    ul.lst-kix_list_2-6 {
        list-style-type: none
    }

    .lst-kix_list_1-1>li:before {
        content: "" counter(lst-ctn-kix_list_1-1, decimal) ". "
    }

    ul.lst-kix_list_2-7 {
        list-style-type: none
    }

    ul.lst-kix_list_2-4 {
        list-style-type: none
    }

    ul.lst-kix_list_2-5 {
        list-style-type: none
    }

    .lst-kix_list_1-3>li:before {
        content: "" counter(lst-ctn-kix_list_1-0, decimal) "." counter(lst-ctn-kix_list_1-1, decimal) "." counter(lst-ctn-kix_list_1-2, lower-latin) "." counter(lst-ctn-kix_list_1-3, decimal) ". "
    }

    .lst-kix_list_10-4>li {
        counter-increment: lst-ctn-kix_list_10-4
    }

    ol.lst-kix_list_10-5.start {
        counter-reset: lst-ctn-kix_list_10-5 0
    }

    .lst-kix_list_1-7>li:before {
        content: "" counter(lst-ctn-kix_list_1-0, decimal) "." counter(lst-ctn-kix_list_1-1, decimal) "." counter(lst-ctn-kix_list_1-2, lower-latin) "." counter(lst-ctn-kix_list_1-3, decimal) "." counter(lst-ctn-kix_list_1-4, decimal) "." counter(lst-ctn-kix_list_1-5, decimal) "." counter(lst-ctn-kix_list_1-6, decimal) "." counter(lst-ctn-kix_list_1-7, decimal) ". "
    }

    .lst-kix_list_1-3>li {
        counter-increment: lst-ctn-kix_list_1-3
    }

    .lst-kix_list_1-5>li:before {
        content: "" counter(lst-ctn-kix_list_1-0, decimal) "." counter(lst-ctn-kix_list_1-1, decimal) "." counter(lst-ctn-kix_list_1-2, lower-latin) "." counter(lst-ctn-kix_list_1-3, decimal) "." counter(lst-ctn-kix_list_1-4, decimal) "." counter(lst-ctn-kix_list_1-5, decimal) ". "
    }

    .lst-kix_list_2-1>li:before {
        content: " "
    }

    ol.lst-kix_list_6-0.start {
        counter-reset: lst-ctn-kix_list_6-0 0
    }

    .lst-kix_list_2-3>li:before {
        content: " "
    }

    .lst-kix_list_1-1>li {
        counter-increment: lst-ctn-kix_list_1-1
    }

    .lst-kix_list_3-0>li:before {
        content: "-  "
    }

    ul.lst-kix_list_5-7 {
        list-style-type: none
    }

    ul.lst-kix_list_5-8 {
        list-style-type: none
    }

    .lst-kix_list_3-1>li:before {
        content: " "
    }

    .lst-kix_list_3-2>li:before {
        content: " "
    }

    ul.lst-kix_list_5-5 {
        list-style-type: none
    }

    ul.lst-kix_list_5-6 {
        list-style-type: none
    }

    .lst-kix_list_8-1>li:before {
        content: "o  "
    }

    ol.lst-kix_list_1-8.start {
        counter-reset: lst-ctn-kix_list_1-8 0
    }

    .lst-kix_list_4-0>li {
        counter-increment: lst-ctn-kix_list_4-0
    }

    .lst-kix_list_8-2>li:before {
        content: "\u25aa   "
    }

    .lst-kix_list_6-0>li {
        counter-increment: lst-ctn-kix_list_6-0
    }

    .lst-kix_list_3-5>li:before {
        content: " "
    }

    .lst-kix_list_10-0>li {
        counter-increment: lst-ctn-kix_list_10-0
    }

    .lst-kix_list_3-4>li:before {
        content: " "
    }

    ul.lst-kix_list_5-3 {
        list-style-type: none
    }

    .lst-kix_list_3-3>li:before {
        content: " "
    }

    ul.lst-kix_list_5-4 {
        list-style-type: none
    }

    ul.lst-kix_list_5-1 {
        list-style-type: none
    }

    .lst-kix_list_8-0>li:before {
        content: "-  "
    }

    ul.lst-kix_list_5-2 {
        list-style-type: none
    }

    .lst-kix_list_8-7>li:before {
        content: "o  "
    }

    .lst-kix_list_3-8>li:before {
        content: " "
    }

    .lst-kix_list_8-5>li:before {
        content: "\u25aa"
    }

    ol.lst-kix_list_10-7.start {
        counter-reset: lst-ctn-kix_list_10-7 0
    }

    .lst-kix_list_8-6>li:before {
        content: "\u25cf"
    }

    .lst-kix_list_8-3>li:before {
        content: "\u25cf"
    }

    .lst-kix_list_3-6>li:before {
        content: " "
    }

    .lst-kix_list_3-7>li:before {
        content: " "
    }

    .lst-kix_list_8-4>li:before {
        content: "o  "
    }

    ol.lst-kix_list_5-0.start {
        counter-reset: lst-ctn-kix_list_5-0 0
    }

    .lst-kix_list_10-2>li {
        counter-increment: lst-ctn-kix_list_10-2
    }

    .lst-kix_list_8-8>li:before {
        content: "\u25aa   "
    }

    ol.lst-kix_list_10-1.start {
        counter-reset: lst-ctn-kix_list_10-1 0
    }

    .lst-kix_list_4-8>li:before {
        content: " "
    }

    .lst-kix_list_4-7>li:before {
        content: " "
    }

    ul.lst-kix_list_4-8 {
        list-style-type: none
    }

    ul.lst-kix_list_4-6 {
        list-style-type: none
    }

    ul.lst-kix_list_4-7 {
        list-style-type: none
    }

    ul.lst-kix_list_4-1 {
        list-style-type: none
    }

    ol.lst-kix_list_10-8.start {
        counter-reset: lst-ctn-kix_list_10-8 0
    }

    ul.lst-kix_list_4-4 {
        list-style-type: none
    }

    ul.lst-kix_list_4-5 {
        list-style-type: none
    }

    ul.lst-kix_list_4-2 {
        list-style-type: none
    }

    ul.lst-kix_list_4-3 {
        list-style-type: none
    }

    ol.lst-kix_list_10-2.start {
        counter-reset: lst-ctn-kix_list_10-2 0
    }

    .lst-kix_list_7-0>li:before {
        content: "+  "
    }

    ol.lst-kix_list_5-0 {
        list-style-type: none
    }

    .lst-kix_list_2-6>li:before {
        content: " "
    }

    .lst-kix_list_2-4>li:before {
        content: " "
    }

    .lst-kix_list_2-8>li:before {
        content: " "
    }

    .lst-kix_list_7-1>li:before {
        content: " "
    }

    .lst-kix_list_7-5>li:before {
        content: " "
    }

    .lst-kix_list_7-3>li:before {
        content: " "
    }

    ul.lst-kix_list_7-5 {
        list-style-type: none
    }

    .lst-kix_list_10-0>li:before {
        content: "" counter(lst-ctn-kix_list_10-0, lower-latin) ". "
    }

    ul.lst-kix_list_7-6 {
        list-style-type: none
    }

    ul.lst-kix_list_7-3 {
        list-style-type: none
    }

    ul.lst-kix_list_7-4 {
        list-style-type: none
    }

    ul.lst-kix_list_7-7 {
        list-style-type: none
    }

    ul.lst-kix_list_7-8 {
        list-style-type: none
    }

    .lst-kix_list_10-6>li {
        counter-increment: lst-ctn-kix_list_10-6
    }

    ul.lst-kix_list_7-1 {
        list-style-type: none
    }

    ul.lst-kix_list_7-2 {
        list-style-type: none
    }

    .lst-kix_list_1-7>li {
        counter-increment: lst-ctn-kix_list_1-7
    }

    ul.lst-kix_list_7-0 {
        list-style-type: none
    }

    .lst-kix_list_7-7>li:before {
        content: " "
    }

    ol.lst-kix_list_10-0.start {
        counter-reset: lst-ctn-kix_list_10-0 0
    }

    .lst-kix_list_10-4>li:before {
        content: "" counter(lst-ctn-kix_list_10-4, lower-latin) ". "
    }

    .lst-kix_list_10-8>li:before {
        content: "" counter(lst-ctn-kix_list_10-8, lower-roman) ". "
    }

    .lst-kix_list_4-0>li:before {
        content: "" counter(lst-ctn-kix_list_4-0, decimal) ". "
    }

    .lst-kix_list_10-2>li:before {
        content: "" counter(lst-ctn-kix_list_10-2, lower-roman) ". "
    }

    ol.lst-kix_list_1-7.start {
        counter-reset: lst-ctn-kix_list_1-7 0
    }

    .lst-kix_list_4-4>li:before {
        content: " "
    }

    .lst-kix_list_1-5>li {
        counter-increment: lst-ctn-kix_list_1-5
    }

    .lst-kix_list_4-2>li:before {
        content: " "
    }

    .lst-kix_list_4-6>li:before {
        content: " "
    }

    .lst-kix_list_9-3>li:before {
        content: " "
    }

    .lst-kix_list_10-8>li {
        counter-increment: lst-ctn-kix_list_10-8
    }

    .lst-kix_list_10-6>li:before {
        content: "" counter(lst-ctn-kix_list_10-6, decimal) ". "
    }

    .lst-kix_list_9-1>li:before {
        content: " "
    }

    ol.lst-kix_list_4-0 {
        list-style-type: none
    }

    .lst-kix_list_9-7>li:before {
        content: " "
    }

    .lst-kix_list_9-5>li:before {
        content: " "
    }

    ul.lst-kix_list_6-6 {
        list-style-type: none
    }

    ul.lst-kix_list_6-7 {
        list-style-type: none
    }

    ul.lst-kix_list_6-4 {
        list-style-type: none
    }

    ul.lst-kix_list_6-5 {
        list-style-type: none
    }

    ul.lst-kix_list_6-8 {
        list-style-type: none
    }

    .lst-kix_list_1-0>li:before {
        content: "" counter(lst-ctn-kix_list_1-0, decimal) ". "
    }

    ul.lst-kix_list_6-2 {
        list-style-type: none
    }

    ul.lst-kix_list_6-3 {
        list-style-type: none
    }

    .lst-kix_list_1-2>li:before {
        content: "" counter(lst-ctn-kix_list_1-2, lower-latin) ") "
    }

    ul.lst-kix_list_6-1 {
        list-style-type: none
    }

    .lst-kix_list_1-4>li:before {
        content: "" counter(lst-ctn-kix_list_1-0, decimal) "." counter(lst-ctn-kix_list_1-1, decimal) "." counter(lst-ctn-kix_list_1-2, lower-latin) "." counter(lst-ctn-kix_list_1-3, decimal) "." counter(lst-ctn-kix_list_1-4, decimal) ". "
    }

    .lst-kix_list_10-1>li {
        counter-increment: lst-ctn-kix_list_10-1
    }

    .lst-kix_list_1-0>li {
        counter-increment: lst-ctn-kix_list_1-0
    }

    .lst-kix_list_1-6>li {
        counter-increment: lst-ctn-kix_list_1-6
    }

    .lst-kix_list_1-6>li:before {
        content: "" counter(lst-ctn-kix_list_1-0, decimal) "." counter(lst-ctn-kix_list_1-1, decimal) "." counter(lst-ctn-kix_list_1-2, lower-latin) "." counter(lst-ctn-kix_list_1-3, decimal) "." counter(lst-ctn-kix_list_1-4, decimal) "." counter(lst-ctn-kix_list_1-5, decimal) "." counter(lst-ctn-kix_list_1-6, decimal) ". "
    }

    .lst-kix_list_10-7>li {
        counter-increment: lst-ctn-kix_list_10-7
    }

    .lst-kix_list_2-0>li:before {
        content: "-  "
    }

    .lst-kix_list_1-8>li:before {
        content: "" counter(lst-ctn-kix_list_1-0, decimal) "." counter(lst-ctn-kix_list_1-1, decimal) "." counter(lst-ctn-kix_list_1-2, lower-latin) "." counter(lst-ctn-kix_list_1-3, decimal) "." counter(lst-ctn-kix_list_1-4, decimal) "." counter(lst-ctn-kix_list_1-5, decimal) "." counter(lst-ctn-kix_list_1-6, decimal) "." counter(lst-ctn-kix_list_1-7, decimal) "." counter(lst-ctn-kix_list_1-8, decimal) ". "
    }

    .lst-kix_list_2-2>li:before {
        content: " "
    }

    ol {
        margin: 0;
        padding: 0
    }

    table td,
    table th {
        padding: 0
    }

    .c40 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 19.7pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c36 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 10.1pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c78 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 257.3pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c17 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: middle;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 69pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c52 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: middle;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 141.2pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c1 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: middle;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 10.1pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c26 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 540.6pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c66 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 190pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c19 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 9.8pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c32 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 195.3pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c71 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: middle;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 195.1pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c70 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: middle;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 268.1pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c13 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: middle;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 10.8pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c51 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: middle;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 167pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c43 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 69pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c12 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 17.6pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c68 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 400pt !important;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c23 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: middle;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 9.8pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c63 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: middle;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 117.2pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c47 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 155.3pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c15 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 141.2pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c34 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: middle;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 17.6pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c73 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: middle;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 178.5pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c31 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 10.8pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c0 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 268.1pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c75 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 283.3pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c5 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 67.4pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c38 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 30pt !important;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c46 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: middle;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 540.6pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c49 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: middle;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 67.4pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c74 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: middle;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 262.5pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c80 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: middle;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 272.5pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c85 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 272.5pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c9 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: middle;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 19.7pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c35 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
        border-bottom-color: #000000;
        border-top-width: 1pt;
        border-right-width: 1pt;
        border-left-color: #000000;
        vertical-align: middle;
        border-right-color: #000000;
        border-left-width: 1pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 1pt;
        width: 160.9pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c8 {
        padding-top: 1.4pt;
        padding-bottom: 10pt;
        line-height: 1.1500000000000001;
        orphans: 2;
        widows: 2;
        text-align: center;
        margin-right: -2.8pt;
        height: 11pt
    }

    .c22 {
        padding-top: 0pt;
        padding-bottom: 10pt;
        line-height: 1.1500000000000001;
        orphans: 2;
        widows: 2;
        text-align: center;
        margin-right: -2.8pt;
        height: 11pt
    }

    .c37 {
        padding-top: 1.4pt;
        padding-bottom: 10pt;
        line-height: 1.1500000000000001;
        orphans: 2;
        widows: 2;
        text-align: left;
        margin-right: -2.8pt;
        height: 11pt
    }

    .c56 {
        padding-top: 0pt;
        padding-bottom: 10pt;
        line-height: 1.1500000000000001;
        orphans: 2;
        widows: 2;
        text-align: left;
        height: 11pt
    }

    .c10 {
        padding-top: 1.4pt;
        padding-bottom: 10pt;
        line-height: 1.1500000000000001;
        orphans: 2;
        widows: 2;
        text-align: center;
        margin-right: -2.8pt
    }

    .c33 {
        padding-top: 0pt;
        padding-bottom: 10pt;
        line-height: 1.1500000000000001;
        orphans: 2;
        widows: 2;
        text-align: center;
        margin-right: -2.8pt
    }

    .c16 {
        color: #000000;
        font-weight: 400;
        text-decoration: none;
        vertical-align: baseline;
        font-size: 11pt;
        font-family: "Calibri";
        font-style: normal
    }

    .c58 {
        padding-top: 0pt;
        padding-bottom: 10pt;
        line-height: 1.1500000000000001;
        orphans: 2;
        widows: 2;
        text-align: right;
        margin-right: -2.8pt
    }

    .c57 {
        padding-top: 6pt;
        text-indent: 36pt;
        padding-bottom: 10pt;
        line-height: 1.1500000000000001;
        orphans: 2;
        widows: 2;
        text-align: center
    }

    .c64 {
        padding-top: 12pt;
        padding-bottom: 10pt;
        line-height: 1.1500000000000001;
        orphans: 2;
        widows: 2;
        text-align: center;
        margin-right: -2.8pt
    }

    .c42 {
        padding-top: 0pt;
        padding-bottom: 10pt;
        line-height: 1.1500000000000001;
        orphans: 2;
        widows: 2;
        text-align: left;
        margin-right: -2.8pt
    }

    .c2 {
        color: #000000;
        font-weight: 400;
        text-decoration: none;
        vertical-align: baseline;
        font-size: 11pt;
        font-family: "Times New Roman";
        font-style: normal
    }

    .c14 {
        padding-top: 3pt;
        padding-bottom: 3pt;
        line-height: 1.0;
        orphans: 2;
        widows: 2;
        text-align: justify
    }

    .c44 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.0;
        orphans: 2;
        widows: 2;
        text-align: center
    }

    .c27 {
        padding-top: 0pt;
        padding-bottom: 10pt;
        line-height: 1.1500000000000001;
        orphans: 2;
        widows: 2;
        text-align: justify
    }

    .c20 {
        font-weight: 400;
        text-decoration: none;
        vertical-align: baseline;
        font-size: 12.5pt;
        font-family: "Times New Roman";
        font-style: normal
    }

    .c79 {
        padding-top: 3pt;
        padding-bottom: 3pt;
        line-height: 1.0;
        orphans: 2;
        widows: 2;
        text-align: right
    }

    .c50 {
        padding-top: 3pt;
        padding-bottom: 3pt;
        line-height: 1.0;
        orphans: 2;
        widows: 2;
        text-align: center
    }

    .c84 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.1500000000000001;
        orphans: 2;
        widows: 2;
        text-align: center
    }

    .c4 {
        padding-top: 3pt;
        padding-bottom: 3pt;
        line-height: 1.0;
        orphans: 2;
        widows: 2;
        text-align: left
    }

    .c11 {
        vertical-align: baseline;
        font-family: "Times New Roman";
        font-style: italic;
        color: #000000;
        font-weight: 400
    }

    .c65 {
        -webkit-text-decoration-skip: none;
        text-decoration: underline;
        text-decoration-skip-ink: none;
        font-size: 10pt;
        font-style: normal
    }

    .c3 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.15;
        text-align: left;
        height: 11pt
    }

    .c77 {
        /* margin-left: -45pt; */
        border-spacing: 0;
        border-collapse: collapse;
        /* margin-right: auto */
        width: 100%;
    }

    .c53 {
        -webkit-text-decoration-skip: none;
        text-decoration: underline;
        text-decoration-skip-ink: none;
        font-size: 12.5pt
    }

    .c24 {
        vertical-align: super;
        font-family: "Times New Roman";
        font-weight: 700
    }

    .c7 {
        vertical-align: super;
        font-weight: 400;
        font-family: "Times New Roman"
    }

    .c88 {
        font-weight: 400;
        font-family: "Times New Roman"
    }

    .c41 {
        text-decoration: none;
        font-size: 11pt;
        font-style: normal
    }

    .c21 {
        vertical-align: baseline;
        font-family: "Times New Roman";
        font-weight: 400
    }

    .c59 {
        background-color: #ffffff;
        max-width: 760.7pt;
        margin-top: 3rem;
        padding: 36pt;
        border-radius: 24pt;
        font-family: "Times New Roman";
    }

    .c6 {
        vertical-align: baseline;
        font-weight: 700;
        font-family: "Times New Roman"
    }

    .c39 {
        text-decoration: none;
        font-size: 12pt;
        font-style: normal
    }

    .c29 {
        height: 13.1pt
    }

    .c60 {
        font-size: 12pt
    }

    .c18 {
        color: #000000
    }

    .c48 {
        height: 13.8pt
    }

    .c69 {
        height: 20.9pt
    }

    .c25 {
        font-style: italic
    }

    .c30 {
        height: 34.6pt
    }

    .c45 {
        font-size: 15pt
    }

    .c83 {
        height: 13.2pt
    }

    .c86 {
        font-size: 12.5pt
    }

    .c54 {
        height: 85.5pt
    }

    .c76 {
        height: 21.6pt
    }

    .c55 {
        height: 21.4pt
    }

    .c67 {
        height: 49.3pt
    }

    .c62 {
        height: 11pt
    }

    .c82 {
        height: 26.4pt
    }

    .c61 {
        margin-left: 36pt
    }

    .c81 {
        margin-right: -2.8pt
    }

    .c28 {
        height: 20.2pt
    }

    .c87 {
        height: 14.8pt
    }

    .c72 {
        height: 170.9pt
    }

    .title {
        padding-top: 24pt;
        color: #000000;
        font-weight: 700;
        font-size: 36pt;
        padding-bottom: 6pt;
        font-family: "Calibri";
        line-height: 1.1500000000000001;
        page-break-after: avoid;
        orphans: 2;
        widows: 2;
        text-align: left
    }

    .subtitle {
        padding-top: 18pt;
        color: #666666;
        font-size: 24pt;
        padding-bottom: 4pt;
        font-family: "Georgia";
        line-height: 1.1500000000000001;
        page-break-after: avoid;
        font-style: italic;
        orphans: 2;
        widows: 2;
        text-align: left
    }

    li {
        color: #000000;
        font-size: 11pt;
        font-family: "Calibri"
    }

    p {
        margin: 0;
        color: #000000;
        font-size: 11pt;
        font-family: "Calibri"
    }

    h1 {
        padding-top: 24pt;
        color: #000000;
        font-weight: 700;
        font-size: 24pt;
        padding-bottom: 6pt;
        font-family: "Calibri";
        line-height: 1.1500000000000001;
        page-break-after: avoid;
        orphans: 2;
        widows: 2;
        text-align: left
    }

    h2 {
        padding-top: 18pt;
        color: #000000;
        font-weight: 700;
        font-size: 18pt;
        padding-bottom: 4pt;
        font-family: "Calibri";
        line-height: 1.1500000000000001;
        page-break-after: avoid;
        orphans: 2;
        widows: 2;
        text-align: left
    }

    h3 {
        padding-top: 14pt;
        color: #000000;
        font-weight: 700;
        font-size: 14pt;
        padding-bottom: 4pt;
        font-family: "Calibri";
        line-height: 1.1500000000000001;
        page-break-after: avoid;
        orphans: 2;
        widows: 2;
        text-align: left
    }

    h4 {
        padding-top: 12pt;
        color: #000000;
        font-weight: 700;
        font-size: 13pt;
        padding-bottom: 3pt;
        font-family: "Times New Roman";
        line-height: 1.0;
        page-break-after: avoid;
        orphans: 2;
        widows: 2;
        text-align: left
    }

    h5 {
        padding-top: 12pt;
        color: #000000;
        font-size: 13pt;
        padding-bottom: 3pt;
        font-family: "Times New Roman";
        line-height: 1.0;
        orphans: 2;
        widows: 2;
        text-align: left
    }

    h6 {
        padding-top: 10pt;
        color: #000000;
        font-weight: 700;
        font-size: 10pt;
        padding-bottom: 2pt;
        font-family: "Calibri";
        line-height: 1.1500000000000001;
        page-break-after: avoid;
        orphans: 2;
        widows: 2;
        text-align: left
    }

    @page {
        margin: 20mm 15mm 15mm 15mm;
        /* top, right, bottom, left */
    }

    @media print {
        tr.avoid-break {
            page-break-inside: avoid;
        }

        .page-break {
            page-break-before: always;
        }
        
        .c38 {
            width: 40pt !important;
            padding: 0pt 2pt 0pt 2pt !important;
        }
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
    `;

  return (
    <>
      <style>{customStyles}</style>
      <div className="c59 doc-content">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              overflow: "hidden",
              display: "inline-block",
              margin: 0,
              border: "0 solid #000000",
              transform: "rotate(0rad) translateZ(0)",
              WebkitTransform: "rotate(0rad) translateZ(0)",
              width: 262.6,
              height: 57.4,
            }}
          >
            <img
              alt=""
              src="https://lh3.googleusercontent.com/fife/ALs6j_HOMOjrgGsgXKf3muB80w1e5mQsVdQNTvByWW6I4Pyylji3L0C3E58rg8K2z1ytUcBfO4eoPmK9W7QuT0oYIdglY6FS6D-OuRi11t9mjyI43zAdTA8Ucu0SUhZ5YH2R7mdAuBeOCumNc4l2XMtnGF-hHpv56nEqCifZ_T-j_AvYGCdnx_RHkaXm80VkMyOQHMZH_LX67mw70JVR2Yxu0d22VrnW5SMhWqDW4ix7Dsb_aOwtRv2aw8zOz-4C2zJgC_EhABRj6xWAblblQtfMztMwyYnP_hwdIxhGPC5SRb9bUjvcqovtVrPYBiCZJdh7JhkjlSbMoE7QrxrrHPibX5Fb94mqU8zEr-PfbAIbh6qYDSxRcHPJRlBxK0f-wt7N_AFmxS6exdDfzYdeG9y0Loucmp09FQbqJ3pmG18cPHbmK9sjxvNPB2goI_lk51gAogkHxWuzzEBkC6OcYAgjK0oNbGmC6BLYU3qR-w1itNvXCxXTx4hVl2RFRilNOBIL0y2tNfOGnwr4Tw5202NXCPO3mE3ltd_DgjEfkxyUlm40Y6ANbqmZ1Ffmcfl7p-VEUeO1-iZy3Ie7CJfiO5VhMia4YS-q08tvcZKKmJUdkuHR5mvJUXcz8SDPAE4tGVYnG-PQfDYtlMMidfEaKFUP4FaYp4-w26SWxJxo9CldI4J9hFV7tUVMZ5OS-o719sUCUu0uOe4d_U1IbtZAbmzh_CrqKtd9wwiKdsloOUYgk9v0i-y0GdTqslqOdL9Md662toyrOtEVv_N2oEFbFKyPgCpiFjn2JSR7ht6u1r62N1XbSgGFp2aBMZgVA2lQJUOLlbI-NAG2OirdxQibUidp6LkixbxfS4jxEMZ0yGT4BUy4aDtvRySE3uQODduidr9vH2k_l4Be0oLlDCx-QWQu6EIc7YKQIMm-9kyjjUBlomhLdn6R1_-Ms4FGWphvjiT6ALCGE5JKX4Bzcts-MLh6xLi8X7ihCc3o8BIctLJEw7pb8h7NtmfkPGZzWjY-2H4AIXLs-eVfRFj_tLjjkMD5UK7jUGAHUsemx_p0inx39hvzW1firFfhT5D5aRIEblNm0NbZCqImLoYYbYUaH9_TFJl-mXQozASSh4ESvaG8cUhJim5Egvi7vxiNOJxdI4j-3pOhc_SPHhIZZMxb7KRTSYGfBIsdm534ZOvPwZgVi9gdYwYKo0FuW5zZvJXKFp4Ab52oMEkOem7FY_BUeExDhLB9L5Pe9SUcEhv6gA9XuYD66437XcZfvFJFuvvnTC34jOsonHJCrQuU5Qkc9Lg0qli4t_WkA7tz6lCiZKiVOY6o4QhDobM0xGjqaqIyJzKyAayYwpa3obUDB1jD6nEZt9Fz__2t8yHHdYVQpOyIrViX42y1hkqWWY5PlrQsQcLvib3K86FOBoDyVGzNtJvCthrEzidoPfQhrFPHVavWXv-pjBn4EE9lqR88SiB5tbzzjWdzCrg6Qe2GamxQcFHswWEzy8YQEuomV1X8Je9glL1G-HJNJL4jUUpnetG_gZ_9F0nFPZgqWRmPRwF8IdMn8dLd_lJaQUYOx1VWlhs-v-5UyGHUR-ZOM1i9Ht9qpkMlAbPEwLGKGXNAkEFJeT_n4KOOXdhoRGpnKFg0ImCdwzP43ktpMRVXtCzHz1rOkgrcUQ9pUmlnFoCE=w1680-h889?auditContext=forDisplay"
              style={{
                width: 262.6,
                height: 57.4,
                marginLeft: 0,
                marginTop: 0,
                transform: "rotate(0rad) translateZ(0)",
                WebkitTransform: "rotate(0rad) translateZ(0)",
              }}
              title=""
            />
          </span>

          <div
            style={{ width: "50%", textAlign: "right", verticalAlign: "top" }}
          >
            <span style={{ fontStyle: "italic", fontSize: "14px" }}>
              Mẫu số 05/TCCN
            </span>
          </div>
        </div>
        <p className="c44">
          <span className="c6 c60">
            C&#7896;NG HO&Agrave; X&Atilde; H&#7896;I CH&#7910; NGH&#296;A
            VI&#7878;T NAM
          </span>
        </p>
        <p className="c44">
          <span className="c6 c39 c18">
            &#272;&#7897;c l&#7853;p - T&#7921; do - H&#7841;nh ph&uacute;c
          </span>
        </p>
        <p className="c44">
          <span className="c6 c60">------------&amp;-----------</span>
        </p>
        <p className="c44 c62">
          <span className="c21 c39 c18"></span>
        </p>
        <p className="c84">
          <span className="c6 c45">
            GI&#7844;Y &#272;&#7872; NGH&#7882; &#272;I&#7872;U CH&#7880;NH
            H&#7840;N M&#7912;C TH&#7844;U CHI
          </span>
        </p>
        <p className="c57">
          <span className="c6 c18 c25 c53">K&iacute;nh g&#7917;i </span>
          <span className="c6 c18 c86">
            : Ng&acirc;n h&agrave;ng H&#7907;p t&aacute;c x&atilde; Vi&#7879;t
            Nam Chi nh&aacute;nh
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="text"
              name="branch_name"
              id="branch_name"
              value={formData.branch_name || ""}
              onChange={(e) => handleChange("branch_name", e.target.value)}
              onFocus={(e) => handleInputFocus("branch_name", e.target)}
            />
          </span>
        </p>
        <table className="c77">
          <tbody>
            <tr className="c48">
              <td className="c46" colSpan="9" rowSpan="1">
                <p className="c4">
                  <span className="c6 c18">
                    I. Th&ocirc;ng tin kh&aacute;ch h&agrave;ng
                  </span>
                </p>
              </td>
            </tr>
            <tr className="c83">
              <td className="c74" colSpan="4" rowSpan="1">
                <p className="c14">
                  <span className="c2">
                    1. Tên khách hàng: <br /> {idData.full_name}
                  </span>
                </p>
              </td>
              <td
                className="c63"
                colSpan="4"
                rowSpan="1"
                style={{ whiteSpace: "nowrap", width: "100px" }}
              >
                <p className="c14">
                  <span className="c2">Ngày sinh: {idData.date_of_birth}</span>
                </p>
              </td>
              <td className="c35" colSpan="1" rowSpan="1">
                <p className="c14">
                  <span className="c2">
                    Giới tính:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="sex"
                      id="sex_male"
                      defaultChecked={idData.sex === "Nam"}
                      onChange={(e) => handleChange("sex", "Nam")}
                    />{" "}
                    Nam
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="sex"
                      id="sex_female"
                      defaultChecked={idData.sex === "Nữ"}
                      onChange={(e) => handleChange("sex", "Nữ")}
                    />{" "}
                    Nữ
                  </span>
                </p>
              </td>
            </tr>
            <tr className="c29">
              <td className="c74" colSpan="2" rowSpan="1">
                <p className="c14">
                  <span className="c2">
                    2. CCCD/CMND/hộ chiếu số: <br />
                    {idData.eid_number}
                  </span>
                </p>
              </td>
              <td className="c63" colSpan="6" rowSpan="1">
                <p className="c14">
                  <span className="c2">
                    Nơi cấp: <br />
                    {idData.place_of_issue}
                  </span>
                </p>
              </td>
              <td className="c35" colSpan="2" rowSpan="1">
                <p className="c14">
                  <span className="c2">
                    Ngày cấp:
                    {idData.date_of_issue}
                  </span>
                </p>
              </td>
            </tr>
            <tr className="c48">
              <td className="c46" colSpan="9" rowSpan="1">
                <p className="c4">
                  <span className="c21 c18">3.</span>
                  <span className="c6 c18">&nbsp;</span>
                  <span className="c21">
                    Tài khoản thanh toán tại Ngân hàng Hợp tác xã Việt Nam
                    (NHHTX)- Chi nhánh
                  </span>
                  <span className="c6">: </span>
                  <span className="c21 c25">{formData.branch_name}</span>
                </p>
              </td>
            </tr>
            <tr className="c48">
              <td className="c46" colSpan="9" rowSpan="1">
                <p className="c4">
                  <span className="c6 c18">
                    II. Hi&#7879;n t&ocirc;i &#273;ang &#273;&#432;&#7907;c
                    c&#7845;p h&#7841;n m&#7913;c th&#7845;u chi tr&ecirc;n
                    t&agrave;i kho&#7843;n thanh to&aacute;n d&agrave;nh cho
                    kh&aacute;ch h&agrave;ng c&aacute; nh&acirc;n t&#7841;i
                    NHHTX- Chi nh&aacute;nh {formData.branch_name} v&#7899;i
                    n&#7897;i dung c&#7909; th&#7875; nh&#432; sau:
                  </span>
                </p>
              </td>
            </tr>
            <tr className="c30">
              <td className="c26" colSpan="9" rowSpan="1">
                <p className="c14">
                  <span className="c2">
                    - S&#7889; H&#7907;p &#273;&#7891;ng cho vay theo h&#7841;n
                    m&#7913;c th&#7845;u chi s&#7889;:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="text"
                      name="hmtc_contract_number"
                      id="hmtc_contract_number"
                      value={formData.hmtc_contract_number || ""}
                      onChange={(e) =>
                        handleChange(
                          "hmtc_contract_number",
                          e.target.value.replace(/[^0-9]/g, "")
                        )
                      }
                      onFocus={(e) =>
                        handleInputFocus("hmtc_contract_number", e.target)
                      }
                    />
                    K&yacute; ng&agrave;y:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="date"
                      name="hmtc_contract_date"
                      id="hmtc_contract_date"
                      value={formData.hmtc_contract_date || ""}
                      onChange={(e) =>
                        handleChange("hmtc_contract_date", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("hmtc_contract_date", e.target)
                      }
                    />
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    - H&#7841;n m&#7913;c th&#7845;u chi:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", width: "240pt" }}
                      type="text"
                      name="hmtc_limit"
                      id="hmtc_limit"
                      value={formData.hmtc_limit || ""}
                      onChange={(e) =>
                        handleChange(
                          "hmtc_limit",
                          e.target.value.replace(/[^0-9]/g, "")
                        )
                      }
                      onFocus={(e) => handleInputFocus("hmtc_limit", e.target)}
                    />
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    - Th&#7901;i h&#7841;n c&#7845;p h&#7841;n m&#7913;c
                    th&#7845;u chi:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="text"
                      name="hmtc_duration"
                      id="hmtc_duration"
                      value={formData.hmtc_duration || ""}
                      onChange={(e) =>
                        handleChange("hmtc_duration", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("hmtc_duration", e.target)
                      }
                    />
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    - Ph&#432;&#417;ng th&#7913;c c&#7845;p h&#7841;n m&#7913;c
                    th&#7845;u chi:
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="hmtc_payment_method"
                      id="hmtc_payment_method_no"
                      checked={
                        formData.hmtc_payment_method ===
                        "Cấp hạn mức thấu chi không có tài sản bảo đảm."
                      }
                      onChange={(e) =>
                        handleChange(
                          "hmtc_payment_method",
                          "Cấp hạn mức thấu chi không có tài sản bảo đảm."
                        )
                      }
                    />
                    C&#7845;p h&#7841;n m&#7913;c th&#7845;u chi kh&ocirc;ng
                    c&oacute; t&agrave;i s&#7843;n b&#7843;o &#273;&#7843;m.
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="hmtc_payment_method"
                      id="hmtc_payment_method_yes"
                      checked={
                        formData.hmtc_payment_method ===
                        "Cấp hạn mức thấu chi có tài sản bảo đảm."
                      }
                      onChange={(e) =>
                        handleChange(
                          "hmtc_payment_method",
                          "Cấp hạn mức thấu chi có tài sản bảo đảm."
                        )
                      }
                    />
                    C&#7845;p h&#7841;n m&#7913;c th&#7845;u chi c&oacute;
                    t&agrave;i s&#7843;n b&#7843;o &#273;&#7843;m.
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    - D&#432; n&#7907; th&#7845;u chi hi&#7879;n t&#7841;i:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", width: "240pt" }}
                      type="text"
                      name="hmtc_current_debt"
                      id="hmtc_current_debt"
                      value={formData.hmtc_current_debt || ""}
                      onChange={(e) =>
                        handleChange("hmtc_current_debt", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("hmtc_current_debt", e.target)
                      }
                    />
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    - Ngu&#7891;n thu nh&#7853;p tr&#7843; n&#7907;:
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    + T&#7915; thu nh&#7853;p c&#7911;a t&ocirc;i t&#7841;i
                    &#273;&#417;n v&#7883; v&#7899;i c&aacute;c th&ocirc;ng tin
                    c&#7909; th&#7875; nh&#432; sau:
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    T&ecirc;n c&#417; quan/t&#7893; ch&#7913;c:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", width: "77.2%" }}
                      type="text"
                      name="organization_name"
                      id="organization_name"
                      value={formData.organization_name || ""}
                      onChange={(e) =>
                        handleChange("organization_name", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("organization_name", e.target)
                      }
                    />
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    &#272;&#7883;a ch&#7881;:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", width: "54%" }}
                      type="text"
                      name="organization_address"
                      id="organization_address"
                      value={formData.organization_address || ""}
                      onChange={(e) =>
                        handleChange("organization_address", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("organization_address", e.target)
                      }
                    />
                    &#272;i&#7879;n tho&#7841;i:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="text"
                      name="organization_phone"
                      id="organization_phone"
                      value={formData.organization_phone || ""}
                      onChange={(e) =>
                        handleChange(
                          "organization_phone",
                          e.target.value.replace(/[^0-9]/g, "")
                        )
                      }
                      onFocus={(e) =>
                        handleInputFocus("organization_phone", e.target)
                      }
                    />
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    Ch&#7913;c danh:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", width: "240pt" }}
                      type="text"
                      name="organization_position"
                      id="organization_position"
                      value={formData.organization_position || ""}
                      onChange={(e) =>
                        handleChange("organization_position", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("organization_position", e.target)
                      }
                    />
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    T&#7893;ng thu nh&#7853;p:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", width: "240pt" }}
                      type="text"
                      name="total_income"
                      id="total_income"
                      value={formData.total_income || ""}
                      onChange={(e) =>
                        handleChange(
                          "total_income",
                          e.target.value.replace(/[^0-9]/g, "")
                        )
                      }
                      onFocus={(e) =>
                        handleInputFocus("total_income", e.target)
                      }
                    />
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    H&igrave;nh th&#7913;c tr&#7843; l&#432;&#417;ng:
                  </span>
                </p>
                <p className="c14 c61">
                  <span className="c21 c25">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="salary_method"
                      id="salary_method_tien_mat"
                      checked={formData.salary_method === "Tiền mặt"}
                      onChange={(e) =>
                        handleChange("salary_method", "Tiền mặt")
                      }
                    />{" "}
                    Ti&#7873;n m&#7863;t &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="salary_method"
                      id="salary_method_chuyen_khoan"
                      checked={formData.salary_method === "Chuyển khoản"}
                      onChange={(e) =>
                        handleChange("salary_method", "Chuyển khoản")
                      }
                    />{" "}
                    Chuy&#7875;n kho&#7843;n &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                    &nbsp; &nbsp;
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="salary_method"
                      id="salary_method_khac"
                      checked={formData.salary_method === "Khác"}
                      onChange={(e) => handleChange("salary_method", "Khác")}
                    />
                    Kh&aacute;c:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", width: "240pt" }}
                      type="text"
                      name="salary_method_other"
                      id="salary_method_other"
                      value={formData.salary_method_other || ""}
                      onChange={(e) =>
                        handleChange("salary_method_other", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("salary_method_other", e.target)
                      }
                    />
                  </span>
                </p>
                <p className="c14">
                  <span className="c21">
                    + Thu nh&#7853;p kh&aacute;c c&#7911;a t&ocirc;i v&#7899;i
                    th&ocirc;ng tin c&#7909; th&#7875; nh&#432; sau:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="text"
                      name="other_income"
                      id="other_income"
                      value={formData.other_income || ""}
                      onChange={(e) =>
                        handleChange(
                          "other_income",
                          e.target.value.replace(/[^0-9]/g, "")
                        )
                      }
                      onFocus={(e) =>
                        handleInputFocus("other_income", e.target)
                      }
                    />
                  </span>
                </p>
              </td>
            </tr>
            <tr className="c82">
              <td className="c26" colSpan="9" rowSpan="1">
                <p className="c14">
                  <span className="c6 c18">
                    III. Ng&#432;&#7901;i th&acirc;n c&#7911;a kh&aacute;ch
                    h&agrave;ng
                  </span>
                  <span className="c24 c18">(1)</span>
                  <span className="c6 c18">&nbsp; &nbsp; &nbsp;</span>
                  <span className="c21 c18">
                    &nbsp;
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="has_relative"
                      id="has_relative_no"
                      checked={formData.has_relative === "Không có"}
                      onChange={(e) => handleChange("has_relative", "Không có")}
                    />
                    Kh&ocirc;ng c&oacute; &nbsp; &nbsp;
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="has_relative"
                      id="has_relative_yes"
                      checked={formData.has_relative === "Có"}
                      onChange={(e) => handleChange("has_relative", "Có")}
                    />
                    C&oacute; (Chi ti&#7871;t nh&#432; d&#432;&#7899;i
                    &#273;&acirc;y)
                  </span>
                </p>
              </td>
            </tr>
            <tr className="c30">
              <td className="c68" colSpan="5" rowSpan="1">
                <p className="c14">
                  <span className="c6 c18">
                    1. H&#7885; v&agrave; t&ecirc;n:
                  </span>
                  <span className="c2">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", width: "240pt" }}
                      type="text"
                      name="relative_name"
                      id="relative_name"
                      value={formData.relative_name || ""}
                      onChange={(e) =>
                        handleChange("relative_name", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("relative_name", e.target)
                      }
                    />
                  </span>
                </p>
                <p className="c14">
                  <span className="c6 c18">
                    2. Quan h&#7879; v&#7899;i ng&#432;&#7901;i vay:
                  </span>
                  <span className="c18 c21">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", width: "120pt" }}
                      type="text"
                      name="relative_relationship"
                      id="relative_relationship"
                      value={formData.relative_relationship || ""}
                      onChange={(e) =>
                        handleChange("relative_relationship", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("relative_relationship", e.target)
                      }
                    />
                  </span>
                </p>
              </td>
              <td className="c38" colSpan="3" rowSpan="1">
                <p className="c4">
                  <span className="c6 c18">Ng&agrave;y sinh: </span>
                  <span className="c21 c18">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="date"
                      name="relative_date_of_birth"
                      id="relative_date_of_birth"
                      value={formData.relative_date_of_birth || ""}
                      onChange={(e) =>
                        handleChange("relative_date_of_birth", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("relative_date_of_birth", e.target)
                      }
                    />
                  </span>
                </p>
              </td>
              <td className="c15" colSpan="1" rowSpan="1">
                <p className="c4">
                  <span className="c21 c25">
                    Gi&#7899;i t&iacute;nh:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="relative_gender"
                      id="relative_gender_male"
                      checked={formData.relative_gender === "Nam"}
                      onChange={(e) => handleChange("relative_gender", "Nam")}
                    />
                    Nam &nbsp;
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="relative_gender"
                      id="relative_gender_female"
                      checked={formData.relative_gender === "Nữ"}
                      onChange={(e) => handleChange("relative_gender", "Nữ")}
                    />
                    N&#7919; &nbsp;{" "}
                  </span>
                </p>
              </td>
            </tr>
            <tr className="c69">
              <td className="c68" colSpan="5" rowSpan="1">
                <p className="c14">
                  <span className="c6">3.</span>
                  <span className="c21">
                    &nbsp;CCCD/CMND/h&#7897; chi&#7871;u s&#7889;:{" "}
                  </span>
                </p>
                <p className="c14">
                  <input
                    className="form_control"
                    style={{ margin: "0 4pt", width: "90%" }}
                    type="text"
                    name="relative_id_number"
                    id="relative_id_number"
                    value={formData.relative_id_number || ""}
                    onChange={(e) =>
                      handleChange(
                        "relative_id_number",
                        e.target.value.replace(/[^0-9]/g, "")
                      )
                    }
                    onFocus={(e) =>
                      handleInputFocus("relative_id_number", e.target)
                    }
                  />
                </p>
              </td>
              <td className="c38" colSpan="3" rowSpan="1">
                <p className="c4">
                  <span className="c6 c18">Ng&agrave;y c&#7845;p:</span>
                  <span className="c21 c18">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="date"
                      name="relative_id_issue_date"
                      id="relative_id_issue_date"
                      value={formData.relative_id_issue_date || ""}
                      onChange={(e) =>
                        handleChange("relative_id_issue_date", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("relative_id_issue_date", e.target)
                      }
                    />
                  </span>
                </p>
              </td>
              <td className="c15" colSpan="1" rowSpan="1">
                <p className="c4">
                  <span className="c2">N&#417;i c&#7845;p:</span>
                </p>
                <p className="c4">
                  <input
                    className="form_control"
                    style={{ margin: "0 4pt", width: "90%" }}
                    type="text"
                    name="relative_id_issue_place"
                    id="relative_id_issue_place"
                    value={formData.relative_id_issue_place || ""}
                    onChange={(e) =>
                      handleChange("relative_id_issue_place", e.target.value)
                    }
                    onFocus={(e) =>
                      handleInputFocus("relative_id_issue_place", e.target)
                    }
                  />
                </p>
              </td>
            </tr>
            <tr className="c55">
              <td className="c26" colSpan="9" rowSpan="1">
                <p className="c14">
                  <span className="c6 c18">4. </span>
                  <span className="c6">
                    H&#7897; kh&#7849;u th&#432;&#7901;ng tr&uacute; :
                  </span>
                  <span className="c21 c25"></span>
                </p>
                <p className="c14">
                  <input
                    className="form_control"
                    style={{ margin: "0 4pt", width: "98%" }}
                    type="text"
                    name="relative_address"
                    id="relative_address"
                    value={formData.relative_address || ""}
                    onChange={(e) =>
                      handleChange("relative_address", e.target.value)
                    }
                    onFocus={(e) =>
                      handleInputFocus("relative_address", e.target)
                    }
                  />
                </p>
              </td>
            </tr>
            <tr className="c30">
              <td className="c80" colSpan="3" rowSpan="1">
                <p className="c4">
                  <span className="c6 c18">
                    5. &#272;i&#7879;n tho&#7841;i li&ecirc;n h&#7879;:
                  </span>
                  <span className="c21 c18">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="text"
                      name="relative_phone"
                      id="relative_phone"
                      value={formData.relative_phone || ""}
                      onChange={(e) =>
                        handleChange(
                          "relative_phone",
                          e.target.value.replace(/[^0-9]/g, "")
                        )
                      }
                      onFocus={(e) =>
                        handleInputFocus("relative_phone", e.target)
                      }
                    />
                  </span>
                </p>
              </td>
              <td className="c70" colSpan="6" rowSpan="1">
                <p className="c4">
                  <span className="c6 c18">Email:</span>
                  <span className="c21 c18">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="text"
                      name="relative_email"
                      id="relative_email"
                      value={formData.relative_email || ""}
                      onChange={(e) =>
                        handleChange("relative_email", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("relative_email", e.target)
                      }
                    />
                  </span>
                </p>
              </td>
            </tr>
            <tr className="c30 avoid-break">
              <td className="c71" colSpan="1" rowSpan="1">
                <p className="c14">
                  <span className="c6 c18">
                    6. C&ocirc;ng vi&#7879;c hi&#7879;n t&#7841;i:
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    T&ecirc;n c&#417; quan/t&#7893; ch&#7913;c:
                  </span>
                </p>
                <p className="c14">
                  <input
                    className="form_control"
                    style={{ margin: "0 4pt", width: "96%" }}
                    type="text"
                    name="relative_workplace"
                    id="relative_workplace"
                    value={formData.relative_workplace || ""}
                    onChange={(e) =>
                      handleChange("relative_workplace", e.target.value)
                    }
                    onFocus={(e) =>
                      handleInputFocus("relative_workplace", e.target)
                    }
                  />
                </p>
                <p className="c14">
                  <span className="c2">&#272;&#7883;a ch&#7881;:</span>
                </p>
                <p className="c14">
                  <input
                    className="form_control"
                    style={{ margin: "0 4pt", width: "96%" }}
                    type="text"
                    name="relative_workplace_address"
                    id="relative_workplace_address"
                    value={formData.relative_workplace_address || ""}
                    onChange={(e) =>
                      handleChange("relative_workplace_address", e.target.value)
                    }
                    onFocus={(e) =>
                      handleInputFocus("relative_workplace_address", e.target)
                    }
                  />
                </p>
                <p className="c14">
                  <span className="c2">&#272;i&#7879;n tho&#7841;i:</span>
                </p>
                <p className="c14">
                  <input
                    className="form_control"
                    style={{ margin: "0 4pt", width: "96%" }}
                    type="text"
                    name="relative_workplace_phone"
                    id="relative_workplace_phone"
                    value={formData.relative_workplace_phone || ""}
                    onChange={(e) =>
                      handleChange(
                        "relative_workplace_phone",
                        e.target.value.replace(/[^0-9]/g, "")
                      )
                    }
                    onFocus={(e) =>
                      handleInputFocus("relative_workplace_phone", e.target)
                    }
                  />
                </p>
                <p className="c14">
                  <span className="c21 c18">
                    L&#297;nh v&#7921;c ho&#7841;t &#273;&#7897;ng:
                  </span>
                </p>
                <p className="c14">
                  <input
                    className="form_control"
                    style={{ margin: "0 4pt", width: "96%" }}
                    type="text"
                    name="relative_field_of_activity"
                    id="relative_field_of_activity"
                    value={formData.relative_field_of_activity || ""}
                    onChange={(e) =>
                      handleChange("relative_field_of_activity", e.target.value)
                    }
                    onFocus={(e) =>
                      handleInputFocus("relative_field_of_activity", e.target)
                    }
                  />
                </p>
              </td>
              <td className="c51" colSpan="7" rowSpan="1">
                <p className="c14">
                  <span className="c2">
                    Ch&#7913;c danh:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", width: "240pt" }}
                      type="text"
                      name="relative_position"
                      id="relative_position"
                      value={formData.relative_position || ""}
                      onChange={(e) =>
                        handleChange("relative_position", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("relative_position", e.target)
                      }
                    />
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">Lo&#7841;i H&#272;L&#272;:</span>
                </p>
                <p className="c14">
                  <span className="c21 c25">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="relative_labor_contract_type"
                      id="relative_labor_contract_type_no"
                      checked={
                        formData.relative_labor_contract_type ===
                        "Không xác định thời hạn"
                      }
                      onChange={(e) =>
                        handleChange(
                          "relative_labor_contract_type",
                          "Không xác định thời hạn"
                        )
                      }
                    />
                    &nbsp;Kh&ocirc;ng x&aacute;c &#273;&#7883;nh th&#7901;i
                    h&#7841;n
                  </span>
                </p>
                <p className="c14">
                  <span className="c21 c25">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="relative_labor_contract_type"
                      id="relative_labor_contract_type_yes"
                      checked={
                        formData.relative_labor_contract_type ===
                        "Có xác định thời hạn"
                      }
                      onChange={(e) =>
                        handleChange(
                          "relative_labor_contract_type",
                          "Có xác định thời hạn"
                        )
                      }
                    />
                    &nbsp;C&oacute; x&aacute;c &#273;&#7883;nh th&#7901;i
                    h&#7841;n
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    (Th&#7901;i gian h&#7871;t h&#7841;n H&#272;L&#272;
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="date"
                      name="relative_labor_contract_expiry"
                      id="relative_labor_contract_expiry"
                      value={formData.relative_labor_contract_expiry || ""}
                      onChange={(e) =>
                        handleChange(
                          "relative_labor_contract_expiry",
                          e.target.value
                        )
                      }
                      onFocus={(e) =>
                        handleInputFocus(
                          "relative_labor_contract_expiry",
                          e.target
                        )
                      }
                    />
                    )
                  </span>
                </p>
              </td>
              <td className="c73" colSpan="1" rowSpan="1">
                <p className="c14">
                  <span className="c2">T&#7893;ng thu nh&#7853;p:</span>
                </p>
                <p className="c14">
                  <input
                    className="form_control"
                    style={{ margin: "0 4pt", width: "96%" }}
                    type="text"
                    name="relative_total_income"
                    id="relative_total_income"
                    value={formData.relative_total_income || ""}
                    onChange={(e) =>
                      handleChange(
                        "relative_total_income",
                        e.target.value.replace(/[^0-9]/g, "")
                      )
                    }
                    onFocus={(e) =>
                      handleInputFocus("relative_total_income", e.target)
                    }
                  />
                </p>
                <p className="c14">
                  <span className="c2">
                    H&igrave;nh th&#7913;c tr&#7843; l&#432;&#417;ng:
                  </span>
                </p>
                <p className="c14">
                  <span className="c21 c25">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="relative_salary_method"
                      id="relative_salary_method_tien_mat"
                      checked={formData.relative_salary_method === "Tiền mặt"}
                      onChange={(e) =>
                        handleChange("relative_salary_method", "Tiền mặt")
                      }
                    />
                    &nbsp;Ti&#7873;n m&#7863;t
                  </span>
                </p>
                <p className="c14">
                  <span className="c21 c25">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="relative_salary_method"
                      id="relative_salary_method_chuyen_khoan"
                      checked={
                        formData.relative_salary_method === "Chuyển khoản"
                      }
                      onChange={(e) =>
                        handleChange("relative_salary_method", "Chuyển khoản")
                      }
                    />
                    &nbsp;Chuy&#7875;n kho&#7843;n
                  </span>
                </p>
                <p className="c14">
                  <span className="c21 c25">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="relative_salary_method"
                      id="relative_salary_method_khac"
                      checked={formData.relative_salary_method === "Khác"}
                      onChange={(e) =>
                        handleChange("relative_salary_method", "Khác")
                      }
                    />
                    &nbsp;Kh&aacute;c:
                  </span>
                </p>
                <p className="c14">
                  <input
                    className="form_control"
                    style={{ margin: "0 4pt", width: "96%" }}
                    type="text"
                    name="relative_salary_method_other"
                    id="relative_salary_method_other"
                    value={formData.relative_salary_method_other || ""}
                    onChange={(e) =>
                      handleChange(
                        "relative_salary_method_other",
                        e.target.value
                      )
                    }
                    onFocus={(e) =>
                      handleInputFocus("relative_salary_method_other", e.target)
                    }
                  />
                </p>
              </td>
            </tr>
            <tr className="c87">
              <td className="c26" colSpan="9" rowSpan="1">
                <p className="c4">
                  <span className="c6 c18">IV. </span>
                  <span className="c6">
                    &#272;&#7873; ngh&#7883; NHHTX- Chi nh&aacute;nh{" "}
                    {formData.branch_name} &#273;i&#7873;u ch&#7881;nh h&#7841;n
                    m&#7913;c th&#7845;u chi cho t&ocirc;i theo n&#7897;i dung
                    sau
                  </span>
                  <span className="c21">:</span>
                </p>
              </td>
            </tr>
            <tr className="c67">
              <td className="c26" colSpan="9" rowSpan="1">
                <p className="c14">
                  <span className="c2">
                    - H&#7841;n m&#7913;c th&#7845;u chi c&#361;:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", width: "480pt" }}
                      type="text"
                      name="old_hmtc_limit"
                      id="old_hmtc_limit"
                      value={formData.old_hmtc_limit || ""}
                      onChange={(e) =>
                        handleChange(
                          "old_hmtc_limit",
                          e.target.value.replace(/[^0-9]/g, "")
                        )
                      }
                      onFocus={(e) =>
                        handleInputFocus("old_hmtc_limit", e.target)
                      }
                    />
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    - H&#7841;n m&#7913;c th&#7845;u chi &#273;&#7873;
                    ngh&#7883; &#273;i&#7873;u ch&#7881;nh:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", width: "408pt" }}
                      type="text"
                      name="new_hmtc_limit"
                      id="new_hmtc_limit"
                      value={formData.new_hmtc_limit || ""}
                      onChange={(e) =>
                        handleChange(
                          "new_hmtc_limit",
                          e.target.value.replace(/[^0-9]/g, "")
                        )
                      }
                      onFocus={(e) =>
                        handleInputFocus("new_hmtc_limit", e.target)
                      }
                    />
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    - L&yacute; do &#273;&#7873; xu&#7845;t &#273;i&#7873;u
                    ch&#7881;nh h&#7841;n m&#7913;c th&#7845;u chi:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", width: "382pt" }}
                      type="text"
                      name="hmtc_adjustment_reason"
                      id="hmtc_adjustment_reason"
                      value={formData.hmtc_adjustment_reason || ""}
                      onChange={(e) =>
                        handleChange("hmtc_adjustment_reason", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("hmtc_adjustment_reason", e.target)
                      }
                    />
                  </span>
                </p>
              </td>
            </tr>
            <tr className="c48">
              <td className="c26" colSpan="9" rowSpan="1">
                <p className="c4">
                  <span className="c6 c18">V. </span>
                  <span className="c6">T&ocirc;i xin cam k&#7871;t</span>
                  <span className="c21">:</span>
                </p>
              </td>
            </tr>
            <tr className="c48">
              <td className="c85" colSpan="3" rowSpan="1">
                <p className="c14">
                  <span className="c2">
                    - Nh&#7919;ng th&ocirc;ng tin tr&ecirc;n &#273;&acirc;y
                    l&agrave; &#273;&#7849;y &#273;&#7911;, &#273;&uacute;ng
                    s&#7921; th&#7853;t v&agrave; ho&agrave;n to&agrave;n
                    ch&#7883;u tr&aacute;ch nhi&#7879;m tr&#432;&#7899;c
                    ph&aacute;p lu&#7853;t v&#7873; c&aacute;c th&ocirc;ng tin
                    cung c&#7845;p.
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    - T&#7845;t c&#7843; c&aacute;c th&ocirc;ng tin kh&aacute;c
                    v&#7873; h&#7841;n m&#7913;c th&#7845;u chi c&#7911;a
                    t&ocirc;i v&#7851;n th&#7921;c hi&#7879;n theo H&#7907;p
                    &#273;&#7891;ng cho vay theo h&#7841;n m&#7913;c th&#7845;u
                    chi s&#7889;: {}/Hợp đồng cho vay ký ngày {} gi&#7919;a
                    t&ocirc;i v&agrave; NHHTX - Chi nh&aacute;nh{" "}
                    {formData.branch_name}
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    - S&#7917; d&#7909;ng v&#7889;n vay &#273;&uacute;ng
                    m&#7909;c &#273;&iacute;ch; ho&agrave;n tr&#7843; g&#7889;c
                    v&agrave; l&atilde;i vay &#273;&#7847;y &#273;&#7911;
                    &#273;&uacute;ng h&#7841;n.
                  </span>
                </p>
              </td>
              <td className="c0" colSpan="6" rowSpan="1">
                <p className="c50">
                  <span className="c2">
                    Ng&agrave;y {formData.document_date}
                  </span>
                </p>
                <p className="c50">
                  <span className="c6 c18">Kh&aacute;ch h&agrave;ng </span>
                  <span className="c18 c24">(2)</span>
                </p>
                <p className="c50">
                  <span className="c21 c18">
                    (K&yacute;, ghi r&otilde; h&#7885; t&ecirc;n)
                  </span>
                </p>
                <p className="c50" style={{ margin: "28pt 0pt" }}>
                  <span className="c21 c18"></span>
                </p>
              </td>
            </tr>
            <tr className="c28">
              <td className="c26" colSpan="9" rowSpan="1">
                <p className="c4">
                  <span className="c6 c18">
                    VI. &nbsp;X&Aacute;C NH&#7852;N C&#7910;A C&#416; QUAN{" "}
                  </span>
                  <span className="c24 c18">(3)</span>
                </p>
              </td>
            </tr>
            <tr className="c28">
              <td className="c26" colSpan="9" rowSpan="1">
                <p className="c14">
                  <span className="c21 c25">
                    &Ocirc;ng (B&agrave;):
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="text"
                      name="official_name"
                      id="official_name"
                      value={formData.official_name || ""}
                      onChange={(e) =>
                        handleChange("official_name", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("official_name", e.target)
                      }
                    />
                    hi&#7879;n &#273;ang c&ocirc;ng t&aacute;c t&#7841;i c&#417;
                    quan ch&uacute;ng t&ocirc;i)
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    1- Ch&#7913;c v&#7909;:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="text"
                      name="official_position"
                      id="official_position"
                      value={formData.official_position || ""}
                      onChange={(e) =>
                        handleChange("official_position", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("official_position", e.target)
                      }
                    />
                    , th&#7901;i h&#7841;n hi&#7879;u l&#7921;c c&ograve;n
                    l&#7841;i c&#7911;a h&#7907;p &#273;&#7891;ng lao
                    &#273;&#7897;ng (Ng&#432;&#7901;i vay v&#7889;n c&oacute;
                    h&#7907;p &#273;&#7891;ng lao &#273;&#7897;ng c&oacute;
                    x&aacute;c &#273;&#7883;nh th&#7901;i h&#7841;n):
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="text"
                      name="official_labor_contract_duration"
                      id="official_labor_contract_duration"
                      value={formData.official_labor_contract_duration || ""}
                      onChange={(e) =>
                        handleChange(
                          "official_labor_contract_duration",
                          e.target.value
                        )
                      }
                      onFocus={(e) =>
                        handleInputFocus(
                          "official_labor_contract_duration",
                          e.target
                        )
                      }
                    />
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    2- T&#7893;ng thu nh&#7853;p h&agrave;ng th&aacute;ng (bao
                    g&#7891;m l&#432;&#417;ng v&agrave; c&aacute;c kho&#7843;n
                    thu nh&#7853;p kh&aacute;c) l&agrave;:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", width: "240pt" }}
                      type="text"
                      name="official_total_income"
                      id="official_total_income"
                      value={formData.official_total_income || ""}
                      onChange={(e) =>
                        handleChange(
                          "official_total_income",
                          e.target.value.replace(/[^0-9]/g, "")
                        )
                      }
                      onFocus={(e) =>
                        handleInputFocus("official_total_income", e.target)
                      }
                    />
                  </span>
                </p>
                <p className="c14">
                  <span className="c2">
                    3- Tr&#432;&#7901;ng h&#7907;p ng&#432;&#7901;i vay
                    v&#7889;n kh&ocirc;ng tr&#7843; &#273;&#432;&#7907;c
                    n&#7907; theo &#273;&uacute;ng cam k&#7871;t c&#417; quan
                    ch&uacute;ng t&ocirc;i s&#7869; h&#7895; tr&#7907;
                    Ng&acirc;n h&agrave;ng H&#7907;p t&aacute;c Chi nh&aacute;nh{" "}
                    {formData.branch_name} trong c&ocirc;ng t&aacute;c thu
                    n&#7907; vay (g&#7889;c v&agrave; l&atilde;i). N&#7871;u
                    ng&#432;&#7901;i vay v&#7889;n ngh&#7881; vi&#7879;c
                    ho&#7863;c thuy&ecirc;n chuy&#7875;n c&ocirc;ng t&aacute;c
                    c&#417; quan s&#7869; th&ocirc;ng b&aacute;o cho NHHTX- Chi
                    nh&aacute;nh {formData.branch_name} v&agrave; &#273;&ocirc;n
                    &#273;&#7889;c ng&#432;&#7901;i vay tr&#7843; h&#7871;t
                    n&#7907; tr&#432;&#7899;c khi l&agrave;m c&aacute;c
                    th&#7911; t&#7909;c theo ch&#7871; &#273;&#7897;.
                  </span>
                </p>
                <p className="c79">
                  <span className="c11" style={{ paddingRight: "12pt" }}>
                    Ng&agrave;y {formData.document_date}
                  </span>
                </p>
              </td>
            </tr>
            <tr className="c72">
              <td className="c75" colSpan="4" rowSpan="1">
                <p className="c33">
                  <span className="c6 c18">
                    T/M BAN CH&#7844;P H&Agrave;NH C&Ocirc;NG
                    &#272;O&Agrave;N/B&#7896; PH&#7852;N NH&Acirc;N
                    S&#7920;/B&#7896; PH&#7852;N K&#7870; TO&Aacute;N
                  </span>
                </p>
                <p className="c33">
                  <span className="c6 c18">
                    (K&yacute;, ghi r&otilde; h&#7885; t&ecirc;n)
                  </span>
                </p>
              </td>
              <td className="c78" colSpan="5" rowSpan="1">
                <p className="c33">
                  <span className="c6 c18">
                    TH&#7910; TR&#431;&#7902;NG &#272;&#416;N V&#7882;
                  </span>
                </p>
                <p className="c33">
                  <span className="c6 c18">
                    (K&yacute;, &#273;&oacute;ng d&#7845;u)
                  </span>
                </p>
                <p className="c22">
                  <span className="c2"></span>
                </p>
                <p className="c22">
                  <span className="c2"></span>
                </p>
                <p className="c22">
                  <span className="c2"></span>
                </p>
                <p className="c56 c81">
                  <span className="c2"></span>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        <hr style={{ pageBreakBefore: "always", display: "none" }} />
        <p className="c56">
          <span className="c16"></span>
        </p>
        <table className="c77">
          <tbody>
            <tr className="c76">
              <td className="c26" colSpan="3" rowSpan="1">
                <div className="page-break">
                  <p className="c64">
                    <span className="c6 c18">
                      PH&#7846;N D&Agrave;NH CHO NG&Acirc;N H&Agrave;NG
                    </span>
                  </p>
                </div>
              </td>
            </tr>
            <tr className="c54">
              <td className="c26" colSpan="3" rowSpan="1">
                <p className="c42">
                  <span className="c2">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", marginTop: "12pt" }}
                      type="radio"
                      name="bank_section"
                      id="bank_section_dong_y"
                      checked={
                        formData.bank_section ===
                        "Đồng ý điều chỉnh HMTC theo đề xuất"
                      }
                      onChange={(e) =>
                        handleChange(
                          "bank_section",
                          "Đồng ý điều chỉnh HMTC theo đề xuất"
                        )
                      }
                    />
                    &nbsp;&#272;&#7891;ng &yacute; &#273;i&#7873;u ch&#7881;nh
                    HMTC theo &#273;&#7873; xu&#7845;t:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", width: "420pt" }}
                      type="text"
                      name="bank_section_agree"
                      id="bank_section_agree"
                      value={formData.bank_section_agree || ""}
                      onChange={(e) =>
                        handleChange("bank_section_agree", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("bank_section_agree", e.target)
                      }
                    />
                  </span>
                </p>
                <p className="c42">
                  <span className="c2">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="bank_section"
                      id="bank_section_khong_dong_y"
                      checked={
                        formData.bank_section ===
                        "Không đồng ý cấp HMTC theo đề xuất"
                      }
                      onChange={(e) =>
                        handleChange(
                          "bank_section",
                          "Không đồng ý cấp HMTC theo đề xuất"
                        )
                      }
                    />
                    &nbsp;Kh&ocirc;ng &#273;&#7891;ng &yacute; c&#7845;p HMTC
                    theo &#273;&#7873; xu&#7845;t. L&yacute; do
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", width: "392pt" }}
                      type="text"
                      name="bank_section_disagree"
                      id="bank_section_disagree"
                      value={formData.bank_section_disagree || ""}
                      onChange={(e) =>
                        handleChange("bank_section_disagree", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("bank_section_disagree", e.target)
                      }
                    />
                  </span>
                </p>
                <p className="c42">
                  <span className="c2">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="bank_section"
                      id="bank_section_y_kien_khac"
                      checked={formData.bank_section === "Ý kiến khác"}
                      onChange={(e) =>
                        handleChange("bank_section", "Ý kiến khác")
                      }
                    />
                    &nbsp;&Yacute; ki&#7871;n kh&aacute;c:
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt", width: "540pt" }}
                      type="text"
                      name="bank_section_other"
                      id="bank_section_other"
                      value={formData.bank_section_other || ""}
                      onChange={(e) =>
                        handleChange("bank_section_other", e.target.value)
                      }
                      onFocus={(e) =>
                        handleInputFocus("bank_section_other", e.target)
                      }
                    />
                  </span>
                </p>
                <p className="c58">
                  <span className="c11" style={{ paddingRight: "12pt" }}>
                    Ng&agrave;y {formData.document_date}
                  </span>
                </p>
              </td>
            </tr>
            <tr className="c54">
              <td className="c66" colSpan="1" rowSpan="1">
                <p className="c10">
                  <span className="c6">
                    C&Aacute;N B&#7896; T&Iacute;N D&#7908;NG
                  </span>
                </p>
                <p className="c10">
                  <span className="c21 c25">
                    (K&yacute;, ghi r&otilde; h&#7885; t&ecirc;n)
                  </span>
                </p>
              </td>
              <td className="c32" colSpan="1" rowSpan="1">
                <p className="c10">
                  <span className="c6">TR&#431;&#7902;NG PH&Ograve;NG</span>
                </p>
                <p className="c10">
                  <span className="c21 c25">
                    (K&yacute;, ghi r&otilde; h&#7885; t&ecirc;n)
                  </span>
                </p>
              </td>
              <td className="c47" colSpan="1" rowSpan="1">
                <p className="c10">
                  <span className="c6">GI&Aacute;M &#272;&#7888;C</span>
                </p>
                <p className="c10">
                  <span className="c21 c25">
                    (K&yacute;, &#273;&oacute;ng d&#7845;u)
                  </span>
                </p>
                <p className="c8">
                  <span className="c2"></span>
                </p>
                <p className="c8">
                  <span className="c2"></span>
                </p>
                <p className="c37">
                  <span className="c2"></span>
                </p>
                <p className="c37">
                  <span className="c2"></span>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="c27" style={{ paddingTop: "12pt" }}>
          <span className="c21">L&#432;u &yacute;: </span>
          <span className="c88">(1)</span>
          <span className="c2">
            &nbsp;Y&ecirc;u c&#7847;u c&#7843; ng&#432;&#7901;i th&acirc;n
            c&#7911;a kh&aacute;ch h&agrave;ng k&yacute; trong tr&#432;&#7901;ng
            h&#7907;p kh&aacute;ch h&agrave;ng d&ugrave;ng thu nh&#7853;p
            c&#7911;a ng&#432;&#7901;i th&acirc;n &#273;&#7875; tr&#7843;
            n&#7907; (D&agrave;nh cho vay ng&#432;&#7901;i th&acirc;n c&#7911;a
            CBNV c&#7911;a NHHTX);
          </span>
        </p>
        <p className="c27">
          <span className="c88 c18">&nbsp;(2)</span>
          <span className="c2">
            &nbsp;&#272;&#7889;i v&#7899;i tr&#432;&#7901;ng h&#7907;p
            kh&aacute;ch h&agrave;ng l&agrave; ng&#432;&#7901;i th&acirc;n
            c&#7911;a CBNV c&#7911;a NHHTX: Ng&#432;&#7901;i th&acirc;n
            c&#7911;a CBNV c&#7911;a NHHTX s&#7869; &#273;i&#7873;n th&ocirc;ng
            tin m&#7909;c &ldquo;kh&aacute;ch h&agrave;ng&rdquo;, CBNV c&#7911;a
            NHHTX &#273;i&#7873;n th&ocirc;ng tin m&#7909;c &ldquo;
            Ng&#432;&#7901;i th&acirc;n c&#7911;a kh&aacute;ch
            h&agrave;ng&rdquo;, k&yacute; x&aacute;c nh&#7853;n d&#432;&#7899;i
            ph&#7847;n ch&#7919; k&yacute; kh&aacute;ch h&agrave;ng;
          </span>
        </p>
        <p className="c27">
          <span className="c88 c18">(3)</span>
          <span className="c2">
            &nbsp;D&agrave;nh cho kh&aacute;ch h&agrave;ng ch&#7885;n
            h&igrave;nh th&#7913;c vay th&#7845;u chi kh&ocirc;ng c&oacute;
            t&agrave;i s&#7843;n b&#7843;o &#273;&#7843;m v&agrave; kh&aacute;ch
            h&agrave;ng kh&ocirc;ng c&ocirc;ng t&aacute;c t&#7841;i NHHTX
            (Kh&aacute;ch h&agrave;ng l&agrave; CBNV/ ng&#432;&#7901;i
            th&acirc;n CBNV c&#7911;a NHHTX kh&ocirc;ng &#273;i&#7873;n
            ph&#7847;n n&agrave;y)
          </span>
        </p>
        <p className="c56">
          <span className="c2"></span>
        </p>
        <p className="c56">
          <span className="c2"></span>
        </p>
        <p className="c56">
          <span className="c21 c39 c18"></span>
        </p>
        <p className="c56">
          <span className="c21 c39 c18"></span>
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
    </>
  );
};

export default Mau_5;
