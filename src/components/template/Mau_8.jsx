import React, { useState, useRef, useEffect } from "react";
import VirtualKeyboard, {
  processVietnameseInput,
} from "./../VirtualKeyboard";

const Mau_8 = ({ idData, initialFormData, onSubmit, onCancel }) => {
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
    const currentDate = `ngày ${day} tháng ${month} năm ${year}`;

    return {
      branch_name: "",
      document_location: "Hà Nội",
      document_date: currentDate,
      borrower_place_of_birth: "",
      borrower_bank_account: "",
      hmtc_request_type: "",
      hmtc_contract_number: "",
      hmtc_contract_date: "",
      hmtc_limit_amount: "",
      hmtc_effective_duration: "",
      hmtc_limit_amount_text: "",
      hmtc_suspension_reason: "",
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
    if (field === "hmtc_limit_amount") {
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
    // Xử lý hmtc_contract_date
    const hmtc_contract_date = processed.hmtc_contract_date || "";
    if (hmtc_contract_date) {
      const parts = hmtc_contract_date.split("-");
      processed.hmtc_contract_date = `${parts[2] || ".."}/${parts[1] || ".."}/${
        parts[0] || "...."
      }`;
    } else {
      processed.hmtc_contract_date = "../../....";
    }
    // Xử lý hmtc_effective_duration
    const hmtc_effective_duration = processed.hmtc_effective_duration || "";
    if (hmtc_effective_duration) {
      const parts = hmtc_effective_duration.split("-");
      processed.hmtc_effective_duration = `${parts[2] || ".."}/${
        parts[1] || ".."
      }/${parts[0] || "...."}`;
    } else {
      processed.hmtc_effective_duration = "../../....";
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

  // ===== HANDLE CHECKBOX =====
  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => {
      const currentValues = prev[field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value) // Bỏ chọn nếu đã có
        : [...currentValues, value]; // Thêm vào nếu chưa có
      return { ...prev, [field]: newValues };
    });
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

    ol.lst-kix_list_7-0 {
        list-style-type: none
    }

    .lst-kix_list_14-1>li:before {
        content: "\u2022"
    }

    .lst-kix_list_14-3>li:before {
        content: "\u2022"
    }

    .lst-kix_list_21-8>li {
        counter-increment: lst-ctn-kix_list_21-8
    }

    ol.lst-kix_list_9-0.start {
        counter-reset: lst-ctn-kix_list_9-0 0
    }

    .lst-kix_list_14-0>li:before {
        content: "" counter(lst-ctn-kix_list_14-0, decimal) ". "
    }

    .lst-kix_list_14-4>li:before {
        content: "\u2022"
    }

    .lst-kix_list_14-5>li:before {
        content: "\u2022"
    }

    .lst-kix_list_14-7>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_15-0 {
        list-style-type: none
    }

    .lst-kix_list_14-6>li:before {
        content: "\u2022"
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

    .lst-kix_list_13-0>li {
        counter-increment: lst-ctn-kix_list_13-0
    }

    ul.lst-kix_list_9-8 {
        list-style-type: none
    }

    .lst-kix_list_17-0>li {
        counter-increment: lst-ctn-kix_list_17-0
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

    .lst-kix_list_14-2>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_23-2.start {
        counter-reset: lst-ctn-kix_list_23-2 0
    }

    ul.lst-kix_list_17-1 {
        list-style-type: none
    }

    ol.lst-kix_list_12-0.start {
        counter-reset: lst-ctn-kix_list_12-0 0
    }

    ul.lst-kix_list_17-8 {
        list-style-type: none
    }

    ul.lst-kix_list_17-7 {
        list-style-type: none
    }

    ol.lst-kix_list_21-6.start {
        counter-reset: lst-ctn-kix_list_21-6 0
    }

    ul.lst-kix_list_17-6 {
        list-style-type: none
    }

    ul.lst-kix_list_17-5 {
        list-style-type: none
    }

    ul.lst-kix_list_17-4 {
        list-style-type: none
    }

    ul.lst-kix_list_17-3 {
        list-style-type: none
    }

    .lst-kix_list_14-8>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_17-2 {
        list-style-type: none
    }

    .lst-kix_list_5-0>li:before {
        content: "" counter(lst-ctn-kix_list_5-0, decimal) ". "
    }

    ol.lst-kix_list_6-0 {
        list-style-type: none
    }

    ol.lst-kix_list_22-3.start {
        counter-reset: lst-ctn-kix_list_22-3 0
    }

    .lst-kix_list_24-7>li:before {
        content: "\u2022"
    }

    .lst-kix_list_24-8>li:before {
        content: "\u2022"
    }

    .lst-kix_list_5-3>li:before {
        content: "\u2022"
    }

    .lst-kix_list_5-2>li:before {
        content: "\u2022"
    }

    .lst-kix_list_5-1>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_18-0.start {
        counter-reset: lst-ctn-kix_list_18-0 2
    }

    .lst-kix_list_24-2>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_16-0 {
        list-style-type: none
    }

    .lst-kix_list_5-7>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_8-4 {
        list-style-type: none
    }

    ul.lst-kix_list_8-5 {
        list-style-type: none
    }

    .lst-kix_list_5-6>li:before {
        content: "\u2022"
    }

    .lst-kix_list_5-8>li:before {
        content: "\u2022"
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

    .lst-kix_list_24-3>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_8-6 {
        list-style-type: none
    }

    .lst-kix_list_24-4>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_8-7 {
        list-style-type: none
    }

    .lst-kix_list_24-5>li:before {
        content: "\u2022"
    }

    .lst-kix_list_5-4>li:before {
        content: "\u2022"
    }

    .lst-kix_list_5-5>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_8-1 {
        list-style-type: none
    }

    .lst-kix_list_24-6>li:before {
        content: "\u2022"
    }

    .lst-kix_list_23-6>li:before {
        content: "" counter(lst-ctn-kix_list_23-6, decimal) ". "
    }

    .lst-kix_list_6-1>li:before {
        content: "\u2022"
    }

    .lst-kix_list_6-3>li:before {
        content: "\u2022"
    }

    .lst-kix_list_23-3>li:before {
        content: "" counter(lst-ctn-kix_list_23-3, decimal) ". "
    }

    .lst-kix_list_23-7>li:before {
        content: "" counter(lst-ctn-kix_list_23-7, lower-latin) ". "
    }

    .lst-kix_list_6-0>li:before {
        content: "" counter(lst-ctn-kix_list_6-0, lower-latin) ") "
    }

    .lst-kix_list_6-4>li:before {
        content: "\u2022"
    }

    .lst-kix_list_23-2>li:before {
        content: "" counter(lst-ctn-kix_list_23-2, lower-roman) ". "
    }

    ul.lst-kix_list_16-2 {
        list-style-type: none
    }

    ol.lst-kix_list_23-7.start {
        counter-reset: lst-ctn-kix_list_23-7 0
    }

    ul.lst-kix_list_16-1 {
        list-style-type: none
    }

    .lst-kix_list_23-0>li:before {
        content: "" counter(lst-ctn-kix_list_23-0, decimal) " "
    }

    .lst-kix_list_23-8>li:before {
        content: "" counter(lst-ctn-kix_list_23-8, lower-roman) ". "
    }

    .lst-kix_list_23-1>li:before {
        content: "" counter(lst-ctn-kix_list_23-1, lower-latin) ". "
    }

    .lst-kix_list_6-2>li:before {
        content: "\u2022"
    }

    .lst-kix_list_24-1>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_15-0.start {
        counter-reset: lst-ctn-kix_list_15-0 0
    }

    ul.lst-kix_list_16-8 {
        list-style-type: none
    }

    ul.lst-kix_list_16-7 {
        list-style-type: none
    }

    ul.lst-kix_list_16-6 {
        list-style-type: none
    }

    ul.lst-kix_list_16-5 {
        list-style-type: none
    }

    .lst-kix_list_24-0>li:before {
        content: "" counter(lst-ctn-kix_list_24-0, decimal) ". "
    }

    ul.lst-kix_list_16-4 {
        list-style-type: none
    }

    .lst-kix_list_6-8>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_16-3 {
        list-style-type: none
    }

    .lst-kix_list_6-5>li:before {
        content: "\u2022"
    }

    .lst-kix_list_6-7>li:before {
        content: "\u2022"
    }

    .lst-kix_list_23-4>li:before {
        content: "" counter(lst-ctn-kix_list_23-4, lower-latin) ". "
    }

    .lst-kix_list_23-5>li:before {
        content: "" counter(lst-ctn-kix_list_23-5, lower-roman) ". "
    }

    .lst-kix_list_6-6>li:before {
        content: "\u2022"
    }

    .lst-kix_list_7-4>li:before {
        content: "\u2022"
    }

    .lst-kix_list_7-6>li:before {
        content: "\u2022"
    }

    .lst-kix_list_22-2>li:before {
        content: "" counter(lst-ctn-kix_list_22-2, lower-roman) ". "
    }

    .lst-kix_list_22-6>li:before {
        content: "" counter(lst-ctn-kix_list_22-6, decimal) ". "
    }

    ol.lst-kix_list_17-0 {
        list-style-type: none
    }

    .lst-kix_list_22-2>li {
        counter-increment: lst-ctn-kix_list_22-2
    }

    .lst-kix_list_7-2>li:before {
        content: "\u2022"
    }

    .lst-kix_list_22-0>li:before {
        content: "" counter(lst-ctn-kix_list_22-0, lower-roman) ". "
    }

    .lst-kix_list_22-8>li:before {
        content: "" counter(lst-ctn-kix_list_22-8, lower-roman) ". "
    }

    ol.lst-kix_list_22-8.start {
        counter-reset: lst-ctn-kix_list_22-8 0
    }

    ol.lst-kix_list_22-5.start {
        counter-reset: lst-ctn-kix_list_22-5 0
    }

    .lst-kix_list_13-7>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_3-0.start {
        counter-reset: lst-ctn-kix_list_3-0 0
    }

    .lst-kix_list_7-8>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_23-0.start {
        counter-reset: lst-ctn-kix_list_23-0 0
    }

    ol.lst-kix_list_9-0 {
        list-style-type: none
    }

    .lst-kix_list_22-4>li:before {
        content: "" counter(lst-ctn-kix_list_22-4, lower-latin) ". "
    }

    .lst-kix_list_15-5>li:before {
        content: "\u2022"
    }

    .lst-kix_list_4-1>li:before {
        content: "\u2022"
    }

    .lst-kix_list_15-7>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_19-7 {
        list-style-type: none
    }

    ul.lst-kix_list_19-6 {
        list-style-type: none
    }

    .lst-kix_list_4-3>li:before {
        content: "\u2022"
    }

    .lst-kix_list_4-5>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_19-5 {
        list-style-type: none
    }

    ul.lst-kix_list_19-4 {
        list-style-type: none
    }

    ul.lst-kix_list_19-3 {
        list-style-type: none
    }

    ul.lst-kix_list_19-2 {
        list-style-type: none
    }

    ul.lst-kix_list_19-1 {
        list-style-type: none
    }

    ul.lst-kix_list_19-0 {
        list-style-type: none
    }

    .lst-kix_list_15-1>li:before {
        content: "\u2022"
    }

    .lst-kix_list_15-3>li:before {
        content: "\u2022"
    }

    .lst-kix_list_22-1>li {
        counter-increment: lst-ctn-kix_list_22-1
    }

    ul.lst-kix_list_19-8 {
        list-style-type: none
    }

    .lst-kix_list_20-0>li {
        counter-increment: lst-ctn-kix_list_20-0
    }

    ol.lst-kix_list_18-0 {
        list-style-type: none
    }

    .lst-kix_list_12-3>li:before {
        content: "\u2022"
    }

    .lst-kix_list_12-1>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_8-0 {
        list-style-type: none
    }

    .lst-kix_list_23-6>li {
        counter-increment: lst-ctn-kix_list_23-6
    }

    .lst-kix_list_21-4>li {
        counter-increment: lst-ctn-kix_list_21-4
    }

    .lst-kix_list_13-3>li:before {
        content: "\u2022"
    }

    .lst-kix_list_13-5>li:before {
        content: "\u2022"
    }

    .lst-kix_list_12-5>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_18-8 {
        list-style-type: none
    }

    ul.lst-kix_list_18-7 {
        list-style-type: none
    }

    ul.lst-kix_list_18-6 {
        list-style-type: none
    }

    ul.lst-kix_list_18-5 {
        list-style-type: none
    }

    .lst-kix_list_12-7>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_18-4 {
        list-style-type: none
    }

    ul.lst-kix_list_18-3 {
        list-style-type: none
    }

    ul.lst-kix_list_18-2 {
        list-style-type: none
    }

    ol.lst-kix_list_6-0.start {
        counter-reset: lst-ctn-kix_list_6-0 0
    }

    ol.lst-kix_list_21-1.start {
        counter-reset: lst-ctn-kix_list_21-1 0
    }

    ul.lst-kix_list_18-1 {
        list-style-type: none
    }

    .lst-kix_list_13-1>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_24-1 {
        list-style-type: none
    }

    .lst-kix_list_22-8>li {
        counter-increment: lst-ctn-kix_list_22-8
    }

    ul.lst-kix_list_24-2 {
        list-style-type: none
    }

    ul.lst-kix_list_24-3 {
        list-style-type: none
    }

    ol.lst-kix_list_21-3.start {
        counter-reset: lst-ctn-kix_list_21-3 0
    }

    ul.lst-kix_list_24-4 {
        list-style-type: none
    }

    ol.lst-kix_list_3-0 {
        list-style-type: none
    }

    ul.lst-kix_list_24-5 {
        list-style-type: none
    }

    .lst-kix_list_3-0>li:before {
        content: "" counter(lst-ctn-kix_list_3-0, lower-latin) ") "
    }

    ul.lst-kix_list_5-7 {
        list-style-type: none
    }

    ul.lst-kix_list_5-8 {
        list-style-type: none
    }

    ul.lst-kix_list_5-5 {
        list-style-type: none
    }

    ol.lst-kix_list_11-0 {
        list-style-type: none
    }

    ul.lst-kix_list_5-6 {
        list-style-type: none
    }

    .lst-kix_list_21-8>li:before {
        content: "" counter(lst-ctn-kix_list_21-8, lower-roman) ". "
    }

    .lst-kix_list_16-0>li {
        counter-increment: lst-ctn-kix_list_16-0
    }

    .lst-kix_list_4-0>li {
        counter-increment: lst-ctn-kix_list_4-0
    }

    .lst-kix_list_8-0>li {
        counter-increment: lst-ctn-kix_list_8-0
    }

    ul.lst-kix_list_24-6 {
        list-style-type: none
    }

    ul.lst-kix_list_24-7 {
        list-style-type: none
    }

    .lst-kix_list_10-0>li {
        counter-increment: lst-ctn-kix_list_10-0
    }

    .lst-kix_list_3-4>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_24-8 {
        list-style-type: none
    }

    ul.lst-kix_list_5-3 {
        list-style-type: none
    }

    .lst-kix_list_3-3>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_5-4 {
        list-style-type: none
    }

    ul.lst-kix_list_5-1 {
        list-style-type: none
    }

    .lst-kix_list_8-0>li:before {
        content: "" counter(lst-ctn-kix_list_8-0, decimal) ". "
    }

    ul.lst-kix_list_5-2 {
        list-style-type: none
    }

    .lst-kix_list_8-7>li:before {
        content: "\u2022"
    }

    .lst-kix_list_3-8>li:before {
        content: "\u2022"
    }

    .lst-kix_list_21-0>li:before {
        content: "" counter(lst-ctn-kix_list_21-0, decimal) ". "
    }

    .lst-kix_list_21-1>li:before {
        content: "" counter(lst-ctn-kix_list_21-1, lower-roman) ") "
    }

    .lst-kix_list_8-3>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_13-5 {
        list-style-type: none
    }

    ol.lst-kix_list_22-7 {
        list-style-type: none
    }

    ul.lst-kix_list_13-4 {
        list-style-type: none
    }

    ol.lst-kix_list_22-6 {
        list-style-type: none
    }

    ul.lst-kix_list_13-3 {
        list-style-type: none
    }

    ul.lst-kix_list_13-2 {
        list-style-type: none
    }

    ol.lst-kix_list_22-8 {
        list-style-type: none
    }

    ul.lst-kix_list_13-1 {
        list-style-type: none
    }

    .lst-kix_list_3-7>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_22-3 {
        list-style-type: none
    }

    ol.lst-kix_list_22-2 {
        list-style-type: none
    }

    .lst-kix_list_8-4>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_22-5 {
        list-style-type: none
    }

    ol.lst-kix_list_22-4 {
        list-style-type: none
    }

    ol.lst-kix_list_22-1 {
        list-style-type: none
    }

    ol.lst-kix_list_22-0 {
        list-style-type: none
    }

    ul.lst-kix_list_13-8 {
        list-style-type: none
    }

    .lst-kix_list_11-1>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_13-7 {
        list-style-type: none
    }

    ul.lst-kix_list_13-6 {
        list-style-type: none
    }

    .lst-kix_list_21-5>li:before {
        content: "" counter(lst-ctn-kix_list_21-5, lower-roman) ". "
    }

    .lst-kix_list_21-4>li:before {
        content: "" counter(lst-ctn-kix_list_21-4, lower-latin) ". "
    }

    .lst-kix_list_11-0>li:before {
        content: "" counter(lst-ctn-kix_list_11-0, decimal) ". "
    }

    .lst-kix_list_8-8>li:before {
        content: "\u2022"
    }

    .lst-kix_list_16-8>li:before {
        content: "\u2022"
    }

    .lst-kix_list_16-7>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_2-0 {
        list-style-type: none
    }

    .lst-kix_list_4-8>li:before {
        content: "\u2022"
    }

    .lst-kix_list_21-5>li {
        counter-increment: lst-ctn-kix_list_21-5
    }

    .lst-kix_list_4-7>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_20-0.start {
        counter-reset: lst-ctn-kix_list_20-0 0
    }

    .lst-kix_list_17-0>li:before {
        content: "" counter(lst-ctn-kix_list_17-0, decimal) ". "
    }

    ul.lst-kix_list_4-8 {
        list-style-type: none
    }

    .lst-kix_list_16-0>li:before {
        content: "" counter(lst-ctn-kix_list_16-0, decimal) ". "
    }

    ul.lst-kix_list_4-6 {
        list-style-type: none
    }

    ul.lst-kix_list_4-7 {
        list-style-type: none
    }

    ol.lst-kix_list_12-0 {
        list-style-type: none
    }

    .lst-kix_list_21-0>li {
        counter-increment: lst-ctn-kix_list_21-0
    }

    .lst-kix_list_16-4>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_4-1 {
        list-style-type: none
    }

    .lst-kix_list_16-3>li:before {
        content: "\u2022"
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

    ul.lst-kix_list_12-6 {
        list-style-type: none
    }

    ol.lst-kix_list_23-6 {
        list-style-type: none
    }

    ul.lst-kix_list_12-5 {
        list-style-type: none
    }

    ol.lst-kix_list_23-5 {
        list-style-type: none
    }

    .lst-kix_list_17-7>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_12-4 {
        list-style-type: none
    }

    ol.lst-kix_list_23-8 {
        list-style-type: none
    }

    ul.lst-kix_list_12-3 {
        list-style-type: none
    }

    ol.lst-kix_list_23-7 {
        list-style-type: none
    }

    ul.lst-kix_list_12-2 {
        list-style-type: none
    }

    ol.lst-kix_list_23-2 {
        list-style-type: none
    }

    ul.lst-kix_list_12-1 {
        list-style-type: none
    }

    ol.lst-kix_list_21-4.start {
        counter-reset: lst-ctn-kix_list_21-4 0
    }

    ol.lst-kix_list_23-1 {
        list-style-type: none
    }

    .lst-kix_list_17-8>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_23-4 {
        list-style-type: none
    }

    ol.lst-kix_list_23-3 {
        list-style-type: none
    }

    .lst-kix_list_17-3>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_23-0 {
        list-style-type: none
    }

    .lst-kix_list_17-4>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_12-8 {
        list-style-type: none
    }

    ul.lst-kix_list_12-7 {
        list-style-type: none
    }

    ol.lst-kix_list_8-0.start {
        counter-reset: lst-ctn-kix_list_8-0 0
    }

    .lst-kix_list_7-0>li:before {
        content: "" counter(lst-ctn-kix_list_7-0, lower-latin) ") "
    }

    ol.lst-kix_list_5-0 {
        list-style-type: none
    }

    .lst-kix_list_22-5>li:before {
        content: "" counter(lst-ctn-kix_list_22-5, lower-roman) ". "
    }

    .lst-kix_list_2-4>li:before {
        content: "\u2022"
    }

    .lst-kix_list_2-8>li:before {
        content: "\u2022"
    }

    .lst-kix_list_21-2>li {
        counter-increment: lst-ctn-kix_list_21-2
    }

    .lst-kix_list_22-1>li:before {
        content: "" counter(lst-ctn-kix_list_22-1, lower-latin) ". "
    }

    ol.lst-kix_list_13-0 {
        list-style-type: none
    }

    .lst-kix_list_7-3>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_7-5 {
        list-style-type: none
    }

    .lst-kix_list_10-0>li:before {
        content: "" counter(lst-ctn-kix_list_10-0, lower-latin) ") "
    }

    ul.lst-kix_list_7-6 {
        list-style-type: none
    }

    .lst-kix_list_23-3>li {
        counter-increment: lst-ctn-kix_list_23-3
    }

    ul.lst-kix_list_7-3 {
        list-style-type: none
    }

    ol.lst-kix_list_21-7.start {
        counter-reset: lst-ctn-kix_list_21-7 0
    }

    ul.lst-kix_list_7-4 {
        list-style-type: none
    }

    .lst-kix_list_13-8>li:before {
        content: "\u2022"
    }

    .lst-kix_list_18-3>li:before {
        content: "\u2022"
    }

    .lst-kix_list_18-7>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_7-7 {
        list-style-type: none
    }

    ul.lst-kix_list_7-8 {
        list-style-type: none
    }

    ul.lst-kix_list_7-1 {
        list-style-type: none
    }

    ul.lst-kix_list_7-2 {
        list-style-type: none
    }

    .lst-kix_list_7-7>li:before {
        content: "\u2022"
    }

    .lst-kix_list_15-4>li:before {
        content: "\u2022"
    }

    .lst-kix_list_10-4>li:before {
        content: "\u2022"
    }

    .lst-kix_list_10-8>li:before {
        content: "\u2022"
    }

    .lst-kix_list_4-0>li:before {
        content: "" counter(lst-ctn-kix_list_4-0, decimal) ". "
    }

    ul.lst-kix_list_15-3 {
        list-style-type: none
    }

    ul.lst-kix_list_15-2 {
        list-style-type: none
    }

    .lst-kix_list_15-0>li:before {
        content: "" counter(lst-ctn-kix_list_15-0, decimal) ". "
    }

    ul.lst-kix_list_15-1 {
        list-style-type: none
    }

    .lst-kix_list_15-8>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_24-0 {
        list-style-type: none
    }

    .lst-kix_list_4-4>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_20-1.start {
        counter-reset: lst-ctn-kix_list_20-1 0
    }

    ul.lst-kix_list_15-8 {
        list-style-type: none
    }

    ul.lst-kix_list_15-7 {
        list-style-type: none
    }

    ul.lst-kix_list_15-6 {
        list-style-type: none
    }

    .lst-kix_list_9-3>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_15-5 {
        list-style-type: none
    }

    ul.lst-kix_list_15-4 {
        list-style-type: none
    }

    ol.lst-kix_list_7-0.start {
        counter-reset: lst-ctn-kix_list_7-0 0
    }

    ol.lst-kix_list_4-0 {
        list-style-type: none
    }

    .lst-kix_list_9-7>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_21-8.start {
        counter-reset: lst-ctn-kix_list_21-8 0
    }

    .lst-kix_list_11-4>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_14-0 {
        list-style-type: none
    }

    .lst-kix_list_22-5>li {
        counter-increment: lst-ctn-kix_list_22-5
    }

    .lst-kix_list_12-4>li:before {
        content: "\u2022"
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

    .lst-kix_list_20-5>li:before {
        content: "\u2022"
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

    .lst-kix_list_20-1>li:before {
        content: "" counter(lst-ctn-kix_list_20-1, decimal) ". "
    }

    ul.lst-kix_list_6-2 {
        list-style-type: none
    }

    .lst-kix_list_11-8>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_6-3 {
        list-style-type: none
    }

    ol.lst-kix_list_2-0.start {
        counter-reset: lst-ctn-kix_list_2-0 0
    }

    .lst-kix_list_12-0>li:before {
        content: "" counter(lst-ctn-kix_list_12-0, lower-latin) ") "
    }

    ul.lst-kix_list_6-1 {
        list-style-type: none
    }

    .lst-kix_list_1-4>li:before {
        content: "\u2022"
    }

    .lst-kix_list_13-0>li:before {
        content: "" counter(lst-ctn-kix_list_13-0, decimal) ". "
    }

    .lst-kix_list_21-7>li {
        counter-increment: lst-ctn-kix_list_21-7
    }

    ul.lst-kix_list_14-4 {
        list-style-type: none
    }

    ul.lst-kix_list_14-3 {
        list-style-type: none
    }

    ol.lst-kix_list_13-0.start {
        counter-reset: lst-ctn-kix_list_13-0 0
    }

    ul.lst-kix_list_14-2 {
        list-style-type: none
    }

    .lst-kix_list_13-4>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_14-1 {
        list-style-type: none
    }

    ul.lst-kix_list_14-8 {
        list-style-type: none
    }

    ul.lst-kix_list_14-7 {
        list-style-type: none
    }

    .lst-kix_list_2-0>li:before {
        content: "" counter(lst-ctn-kix_list_2-0, lower-latin) ") "
    }

    ul.lst-kix_list_14-6 {
        list-style-type: none
    }

    ul.lst-kix_list_14-5 {
        list-style-type: none
    }

    .lst-kix_list_1-8>li:before {
        content: "\u2022"
    }

    .lst-kix_list_12-8>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_20-2 {
        list-style-type: none
    }

    ul.lst-kix_list_20-3 {
        list-style-type: none
    }

    .lst-kix_list_19-0>li:before {
        content: "-  "
    }

    .lst-kix_list_19-1>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_20-4 {
        list-style-type: none
    }

    ul.lst-kix_list_20-5 {
        list-style-type: none
    }

    ul.lst-kix_list_20-6 {
        list-style-type: none
    }

    ul.lst-kix_list_20-7 {
        list-style-type: none
    }

    ul.lst-kix_list_20-8 {
        list-style-type: none
    }

    .lst-kix_list_23-8>li {
        counter-increment: lst-ctn-kix_list_23-8
    }

    .lst-kix_list_19-4>li:before {
        content: "\u2022"
    }

    .lst-kix_list_19-2>li:before {
        content: "\u2022"
    }

    .lst-kix_list_19-3>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_21-0.start {
        counter-reset: lst-ctn-kix_list_21-0 0
    }

    .lst-kix_list_15-0>li {
        counter-increment: lst-ctn-kix_list_15-0
    }

    .lst-kix_list_7-0>li {
        counter-increment: lst-ctn-kix_list_7-0
    }

    .lst-kix_list_11-0>li {
        counter-increment: lst-ctn-kix_list_11-0
    }

    ul.lst-kix_list_1-3 {
        list-style-type: none
    }

    ul.lst-kix_list_1-4 {
        list-style-type: none
    }

    ul.lst-kix_list_1-1 {
        list-style-type: none
    }

    ul.lst-kix_list_1-2 {
        list-style-type: none
    }

    ul.lst-kix_list_1-7 {
        list-style-type: none
    }

    ul.lst-kix_list_1-8 {
        list-style-type: none
    }

    ul.lst-kix_list_1-5 {
        list-style-type: none
    }

    ul.lst-kix_list_1-6 {
        list-style-type: none
    }

    ol.lst-kix_list_22-4.start {
        counter-reset: lst-ctn-kix_list_22-4 0
    }

    .lst-kix_list_22-7>li {
        counter-increment: lst-ctn-kix_list_22-7
    }

    .lst-kix_list_19-8>li:before {
        content: "\u2022"
    }

    .lst-kix_list_19-5>li:before {
        content: "\u2022"
    }

    .lst-kix_list_19-6>li:before {
        content: "\u2022"
    }

    .lst-kix_list_19-7>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_23-8.start {
        counter-reset: lst-ctn-kix_list_23-8 0
    }

    ol.lst-kix_list_21-5.start {
        counter-reset: lst-ctn-kix_list_21-5 0
    }

    .lst-kix_list_22-0>li {
        counter-increment: lst-ctn-kix_list_22-0
    }

    ol.lst-kix_list_24-0.start {
        counter-reset: lst-ctn-kix_list_24-0 2
    }

    .lst-kix_list_21-6>li {
        counter-increment: lst-ctn-kix_list_21-6
    }

    ol.lst-kix_list_1-0.start {
        counter-reset: lst-ctn-kix_list_1-0 0
    }

    .lst-kix_list_18-0>li:before {
        content: "" counter(lst-ctn-kix_list_18-0, decimal) ". "
    }

    .lst-kix_list_3-0>li {
        counter-increment: lst-ctn-kix_list_3-0
    }

    .lst-kix_list_18-1>li:before {
        content: "\u2022"
    }

    .lst-kix_list_18-2>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_4-0.start {
        counter-reset: lst-ctn-kix_list_4-0 0
    }

    .lst-kix_list_23-4>li {
        counter-increment: lst-ctn-kix_list_23-4
    }

    ol.lst-kix_list_23-1.start {
        counter-reset: lst-ctn-kix_list_23-1 0
    }

    .lst-kix_list_23-1>li {
        counter-increment: lst-ctn-kix_list_23-1
    }

    .lst-kix_list_2-7>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_1-0 {
        list-style-type: none
    }

    .lst-kix_list_2-5>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_17-0.start {
        counter-reset: lst-ctn-kix_list_17-0 0
    }

    .lst-kix_list_22-3>li {
        counter-increment: lst-ctn-kix_list_22-3
    }

    .lst-kix_list_18-6>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_3-7 {
        list-style-type: none
    }

    ul.lst-kix_list_3-8 {
        list-style-type: none
    }

    .lst-kix_list_10-1>li:before {
        content: "\u2022"
    }

    .lst-kix_list_21-3>li {
        counter-increment: lst-ctn-kix_list_21-3
    }

    .lst-kix_list_18-4>li:before {
        content: "\u2022"
    }

    .lst-kix_list_18-8>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_3-1 {
        list-style-type: none
    }

    ul.lst-kix_list_3-2 {
        list-style-type: none
    }

    ul.lst-kix_list_3-5 {
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
        content: "\u2022"
    }

    .lst-kix_list_20-1>li {
        counter-increment: lst-ctn-kix_list_20-1
    }

    .lst-kix_list_10-5>li:before {
        content: "\u2022"
    }

    .lst-kix_list_10-3>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_11-7 {
        list-style-type: none
    }

    ul.lst-kix_list_11-6 {
        list-style-type: none
    }

    ul.lst-kix_list_11-5 {
        list-style-type: none
    }

    ul.lst-kix_list_11-4 {
        list-style-type: none
    }

    ul.lst-kix_list_11-3 {
        list-style-type: none
    }

    ul.lst-kix_list_11-2 {
        list-style-type: none
    }

    ul.lst-kix_list_11-1 {
        list-style-type: none
    }

    .lst-kix_list_9-2>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_20-1 {
        list-style-type: none
    }

    ol.lst-kix_list_20-0 {
        list-style-type: none
    }

    ol.lst-kix_list_14-0.start {
        counter-reset: lst-ctn-kix_list_14-0 0
    }

    ul.lst-kix_list_11-8 {
        list-style-type: none
    }

    .lst-kix_list_20-8>li:before {
        content: "\u2022"
    }

    .lst-kix_list_9-0>li:before {
        content: "" counter(lst-ctn-kix_list_9-0, lower-latin) ") "
    }

    .lst-kix_list_20-0>li:before {
        content: "" counter(lst-ctn-kix_list_20-0, upper-roman) ". "
    }

    .lst-kix_list_9-6>li:before {
        content: "\u2022"
    }

    .lst-kix_list_9-4>li:before {
        content: "\u2022"
    }

    .lst-kix_list_23-5>li {
        counter-increment: lst-ctn-kix_list_23-5
    }

    .lst-kix_list_11-3>li:before {
        content: "\u2022"
    }

    .lst-kix_list_20-6>li:before {
        content: "\u2022"
    }

    .lst-kix_list_23-0>li {
        counter-increment: lst-ctn-kix_list_23-0
    }

    ol.lst-kix_list_10-0 {
        list-style-type: none
    }

    ul.lst-kix_list_2-8 {
        list-style-type: none
    }

    .lst-kix_list_20-4>li:before {
        content: "\u2022"
    }

    .lst-kix_list_11-5>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_22-7.start {
        counter-reset: lst-ctn-kix_list_22-7 0
    }

    ul.lst-kix_list_2-2 {
        list-style-type: none
    }

    .lst-kix_list_20-2>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_21-2.start {
        counter-reset: lst-ctn-kix_list_21-2 0
    }

    ul.lst-kix_list_2-3 {
        list-style-type: none
    }

    ul.lst-kix_list_2-1 {
        list-style-type: none
    }

    .lst-kix_list_9-8>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_2-6 {
        list-style-type: none
    }

    .lst-kix_list_1-1>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_2-7 {
        list-style-type: none
    }

    .lst-kix_list_11-7>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_2-4 {
        list-style-type: none
    }

    ul.lst-kix_list_2-5 {
        list-style-type: none
    }

    .lst-kix_list_1-3>li:before {
        content: "\u2022"
    }

    ul.lst-kix_list_10-8 {
        list-style-type: none
    }

    ol.lst-kix_list_21-8 {
        list-style-type: none
    }

    ul.lst-kix_list_10-7 {
        list-style-type: none
    }

    .lst-kix_list_1-7>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_21-7 {
        list-style-type: none
    }

    ul.lst-kix_list_10-6 {
        list-style-type: none
    }

    ul.lst-kix_list_10-5 {
        list-style-type: none
    }

    ul.lst-kix_list_10-4 {
        list-style-type: none
    }

    ol.lst-kix_list_21-4 {
        list-style-type: none
    }

    ul.lst-kix_list_10-3 {
        list-style-type: none
    }

    .lst-kix_list_1-5>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_21-3 {
        list-style-type: none
    }

    ul.lst-kix_list_10-2 {
        list-style-type: none
    }

    ol.lst-kix_list_21-6 {
        list-style-type: none
    }

    ul.lst-kix_list_10-1 {
        list-style-type: none
    }

    ol.lst-kix_list_21-5 {
        list-style-type: none
    }

    ol.lst-kix_list_21-0 {
        list-style-type: none
    }

    ol.lst-kix_list_22-6.start {
        counter-reset: lst-ctn-kix_list_22-6 0
    }

    ol.lst-kix_list_21-2 {
        list-style-type: none
    }

    ol.lst-kix_list_21-1 {
        list-style-type: none
    }

    .lst-kix_list_2-1>li:before {
        content: "\u2022"
    }

    .lst-kix_list_2-3>li:before {
        content: "\u2022"
    }

    .lst-kix_list_3-1>li:before {
        content: "\u2022"
    }

    .lst-kix_list_3-2>li:before {
        content: "\u2022"
    }

    .lst-kix_list_14-0>li {
        counter-increment: lst-ctn-kix_list_14-0
    }

    .lst-kix_list_8-1>li:before {
        content: "\u2022"
    }

    .lst-kix_list_8-2>li:before {
        content: "\u2022"
    }

    .lst-kix_list_6-0>li {
        counter-increment: lst-ctn-kix_list_6-0
    }

    .lst-kix_list_3-5>li:before {
        content: "\u2022"
    }

    .lst-kix_list_18-0>li {
        counter-increment: lst-ctn-kix_list_18-0
    }

    .lst-kix_list_12-0>li {
        counter-increment: lst-ctn-kix_list_12-0
    }

    .lst-kix_list_21-2>li:before {
        content: "" counter(lst-ctn-kix_list_21-2, lower-roman) ". "
    }

    .lst-kix_list_8-5>li:before {
        content: "\u2022"
    }

    .lst-kix_list_8-6>li:before {
        content: "\u2022"
    }

    .lst-kix_list_2-0>li {
        counter-increment: lst-ctn-kix_list_2-0
    }

    .lst-kix_list_3-6>li:before {
        content: "\u2022"
    }

    .lst-kix_list_21-6>li:before {
        content: "" counter(lst-ctn-kix_list_21-6, decimal) ". "
    }

    .lst-kix_list_21-7>li:before {
        content: "" counter(lst-ctn-kix_list_21-7, lower-latin) ". "
    }

    ol.lst-kix_list_5-0.start {
        counter-reset: lst-ctn-kix_list_5-0 0
    }

    .lst-kix_list_11-2>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_22-1.start {
        counter-reset: lst-ctn-kix_list_22-1 0
    }

    ol.lst-kix_list_16-0.start {
        counter-reset: lst-ctn-kix_list_16-0 0
    }

    .lst-kix_list_21-3>li:before {
        content: "" counter(lst-ctn-kix_list_21-3, decimal) ". "
    }

    .lst-kix_list_16-6>li:before {
        content: "\u2022"
    }

    .lst-kix_list_17-1>li:before {
        content: "\u2022"
    }

    .lst-kix_list_22-6>li {
        counter-increment: lst-ctn-kix_list_22-6
    }

    .lst-kix_list_16-1>li:before {
        content: "\u2022"
    }

    .lst-kix_list_16-2>li:before {
        content: "\u2022"
    }

    .lst-kix_list_16-5>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_22-2.start {
        counter-reset: lst-ctn-kix_list_22-2 0
    }

    ol.lst-kix_list_11-0.start {
        counter-reset: lst-ctn-kix_list_11-0 0
    }

    .lst-kix_list_23-7>li {
        counter-increment: lst-ctn-kix_list_23-7
    }

    .lst-kix_list_17-2>li:before {
        content: "\u2022"
    }

    .lst-kix_list_17-6>li:before {
        content: "\u2022"
    }

    .lst-kix_list_17-5>li:before {
        content: "\u2022"
    }

    .lst-kix_list_2-6>li:before {
        content: "\u2022"
    }

    .lst-kix_list_22-3>li:before {
        content: "" counter(lst-ctn-kix_list_22-3, decimal) ". "
    }

    .lst-kix_list_7-1>li:before {
        content: "\u2022"
    }

    .lst-kix_list_7-5>li:before {
        content: "\u2022"
    }

    .lst-kix_list_22-7>li:before {
        content: "" counter(lst-ctn-kix_list_22-7, lower-latin) ". "
    }

    ol.lst-kix_list_23-3.start {
        counter-reset: lst-ctn-kix_list_23-3 0
    }

    .lst-kix_list_23-2>li {
        counter-increment: lst-ctn-kix_list_23-2
    }

    .lst-kix_list_18-5>li:before {
        content: "\u2022"
    }

    .lst-kix_list_13-6>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_10-0.start {
        counter-reset: lst-ctn-kix_list_10-0 0
    }

    .lst-kix_list_15-6>li:before {
        content: "\u2022"
    }

    .lst-kix_list_22-4>li {
        counter-increment: lst-ctn-kix_list_22-4
    }

    .lst-kix_list_10-2>li:before {
        content: "\u2022"
    }

    .lst-kix_list_20-7>li:before {
        content: "\u2022"
    }

    .lst-kix_list_4-2>li:before {
        content: "\u2022"
    }

    .lst-kix_list_4-6>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_23-6.start {
        counter-reset: lst-ctn-kix_list_23-6 0
    }

    .lst-kix_list_15-2>li:before {
        content: "\u2022"
    }

    .lst-kix_list_10-6>li:before {
        content: "\u2022"
    }

    .lst-kix_list_9-1>li:before {
        content: "\u2022"
    }

    .lst-kix_list_9-5>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_22-0.start {
        counter-reset: lst-ctn-kix_list_22-0 0
    }

    .lst-kix_list_24-0>li {
        counter-increment: lst-ctn-kix_list_24-0
    }

    .lst-kix_list_12-2>li:before {
        content: "\u2022"
    }

    .lst-kix_list_11-6>li:before {
        content: "\u2022"
    }

    .lst-kix_list_20-3>li:before {
        content: "\u2022"
    }

    .lst-kix_list_1-2>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_23-5.start {
        counter-reset: lst-ctn-kix_list_23-5 0
    }

    .lst-kix_list_21-1>li {
        counter-increment: lst-ctn-kix_list_21-1
    }

    .lst-kix_list_1-0>li {
        counter-increment: lst-ctn-kix_list_1-0
    }

    .lst-kix_list_1-6>li:before {
        content: "\u2022"
    }

    .lst-kix_list_12-6>li:before {
        content: "\u2022"
    }

    ol.lst-kix_list_23-4.start {
        counter-reset: lst-ctn-kix_list_23-4 0
    }

    .lst-kix_list_2-2>li:before {
        content: "\u2022"
    }

    .lst-kix_list_13-2>li:before {
        content: "\u2022"
    }

    ol {
        margin: 0;
        padding: 0
    }

    table td,
    table th {
        padding: 0
    }

    .c33 {
        border-right-style: solid;
        padding: 0pt 5.8pt 0pt 5.8pt;
        border-bottom-color: #000000;
        border-top-width: 0pt;
        border-right-width: 0pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 0pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 0pt;
        width: 301.8pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c31 {
        border-right-style: solid;
        padding: 2.8pt 2.8pt 2.8pt 72pt;
        border-bottom-color: #000000;
        border-top-width: 0pt;
        border-right-width: 0pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 0pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 0pt;
        width: 226.8pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c21 {
        border-right-style: solid;
        padding: 0pt 5.8pt 0pt 5.8pt;
        border-bottom-color: #000000;
        border-top-width: 0pt;
        border-right-width: 0pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 0pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 0pt;
        width: 194.1pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c40 {
        border-right-style: solid;
        padding: 2.8pt 2.8pt 2.8pt 36pt;
        border-bottom-color: #000000;
        border-top-width: 0pt;
        border-right-width: 0pt;
        border-left-color: #000000;
        vertical-align: top;
        border-right-color: #000000;
        border-left-width: 0pt;
        border-top-style: solid;
        border-left-style: solid;
        border-bottom-width: 0pt;
        width: 227.6pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c1 {
        color: #000000;
        font-weight: 400;
        text-decoration: none;
        vertical-align: baseline;
        font-size: 13pt;
        font-family: "Times New Roman";
        font-style: normal
    }

    .c11 {
        color: #000000;
        font-weight: 400;
        text-decoration: none;
        vertical-align: baseline;
        font-size: 11pt;
        font-family: "Times New Roman";
        font-style: normal
    }

    .c0 {
        color: #000000;
        font-weight: 700;
        text-decoration: none;
        vertical-align: baseline;
        font-size: 13pt;
        font-family: "Times New Roman";
        font-style: normal
    }

    .c20 {
        color: #000000;
        font-weight: 400;
        text-decoration: none;
        vertical-align: baseline;
        font-size: 1pt;
        font-family: "Times New Roman";
        font-style: normal
    }

    .c23 {
        color: #000000;
        font-weight: 400;
        text-decoration: none;
        vertical-align: baseline;
        font-size: 8pt;
        font-family: "Times New Roman";
        font-style: normal
    }

    .c12 {
        color: #000000;
        font-weight: 700;
        text-decoration: none;
        vertical-align: baseline;
        font-size: 11pt;
        font-family: "Times New Roman";
        font-style: normal
    }

    .c13 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.2;
        text-indent: 28.4pt;
        text-align: justify;
        height: 11pt
    }

    .c19 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.15;
        text-align: left;
        height: 11pt
    }

    .c8 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.1500000000000001;
        /* text-indent: 28.4pt; */
        text-align: left;
        /* padding-left: 28.4pt; */
    }

    .c4 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.2;
        text-indent: 28.4pt;
        text-align: center
    }

    .c17 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 0.06;
        text-align: left;
        height: 11pt
    }

    .c6 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.1500000000000001;
        /* text-indent: 28.4pt; */
        text-align: justify;
        /* padding-left: 28.4pt; */
    }

    .c22 {
        color: #000000;
        text-decoration: none;
        vertical-align: baseline;
        font-family: "Times New Roman";
        font-style: italic
    }

    .c34 {
        color: #000000;
        text-decoration: none;
        vertical-align: baseline;
        font-family: "Arial";
        font-style: normal
    }

    .c15 {
        color: #ff0000;
        font-weight: 400;
        text-decoration: none;
        vertical-align: baseline;
        font-family: "Times New Roman"
    }

    .c10 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.2;
        text-align: left
    }

    .c35 {
        width: 100%;
        border-spacing: 0;
        border-collapse: collapse;
        margin-right: auto
    }

    .c36 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.1500000000000001;
        text-align: left
    }

    .c39 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.0;
        text-align: left
    }

    .c32 {
        margin-left: -0.8pt;
        border-spacing: 0;
        border-collapse: collapse;
        margin-right: auto
    }

    .c5 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.2;
        text-align: center;
    }

    .c30 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.2;
        text-align: right
    }

    .c7 {
        background-color: #ffffff;
        max-width: 600.7pt;
        margin-top: 3rem;
        padding: 54pt;
        border-radius: 24pt;
        font-family: "Times New Roman";
    }

    .c41 {
        text-decoration-skip-ink: none;
        -webkit-text-decoration-skip: none;
        text-decoration: underline
    }

    .c9 {
        font-size: 13pt;
        font-weight: 700
    }

    .c2 {
        font-size: 13pt;
        font-style: italic
    }

    .c18 {
        height: 24.2pt
    }

    .c28 {
        font-style: italic
    }

    .c16 {
        text-indent: 28.4pt
    }

    .c25 {
        height: 11pt
    }

    .c37 {
        height: 12.8pt
    }

    .c26 {
        font-size: 13pt
    }

    .c24 {
        font-size: 11pt
    }

    .c14 {
        font-weight: 700
    }

    .c29 {
        font-weight: 400
    }

    .c27 {
        height: 0pt
    }

    .c3 {
        height: 6.2pt
    }

    .c38 {
        height: 14.7pt
    }

    .title {
        padding-top: 24pt;
        color: #000000;
        font-weight: 700;
        font-size: 36pt;
        padding-bottom: 6pt;
        font-family: "Times New Roman";
        line-height: 1.0;
        page-break-after: avoid;
        text-align: left
    }

    .subtitle {
        padding-top: 18pt;
        color: #666666;
        font-size: 24pt;
        padding-bottom: 4pt;
        font-family: "Georgia";
        line-height: 1.0;
        page-break-after: avoid;
        font-style: italic;
        text-align: left
    }

    li {
        color: #000000;
        font-size: 11pt;
        font-family: "Times New Roman"
    }

    p {
        margin: 0;
        color: #000000;
        font-size: 11pt;
        font-family: "Times New Roman"
    }

    h1 {
        padding-top: 2.3pt;
        color: #000000;
        font-weight: 700;
        font-size: 13pt;
        padding-bottom: 0pt;
        font-family: "Times New Roman";
        line-height: 1.0;
        text-align: center
    }

    h2 {
        padding-top: 0pt;
        color: #000000;
        font-weight: 700;
        font-size: 12pt;
        padding-bottom: 0pt;
        font-family: "Times New Roman";
        line-height: 1.0;
        text-align: left
    }

    h3 {
        padding-top: 0pt;
        color: #000000;
        font-size: 12pt;
        padding-bottom: 0pt;
        font-family: "Times New Roman";
        line-height: 1.0;
        text-align: left
    }

    h4 {
        padding-top: 3.2pt;
        color: #000000;
        font-weight: 700;
        font-size: 9pt;
        padding-bottom: 0pt;
        font-family: "Times New Roman";
        line-height: 1.0;
        text-align: left
    }

    h5 {
        padding-top: 11pt;
        color: #000000;
        font-weight: 700;
        font-size: 11pt;
        padding-bottom: 2pt;
        font-family: "Times New Roman";
        line-height: 1.0;
        page-break-after: avoid;
        text-align: left
    }

    h6 {
        padding-top: 10pt;
        color: #000000;
        font-weight: 700;
        font-size: 10pt;
        padding-bottom: 2pt;
        font-family: "Times New Roman";
        line-height: 1.0;
        page-break-after: avoid;
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
    .c42 {
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
    .c42 input[type="radio"] {
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
    .c42 input[type="radio"]:checked + .radio-box-check::after {
      content: "✓";
      position: absolute;
      top: 0;
      left: 1pt;
      font-size: 14pt;
      color: #000000ff;
      font-weight: bold;
    }
    `;

  return (
    <>
      <style>{customStyles}</style>
      <div className="c7 doc-content">
        <p className="c19">
          <span className="c24 c29 c34"></span>
        </p>
        <table className="c35">
          <tbody>
            <tr className="c38">
              <td className="c21" colSpan="1" rowSpan="1">
                <p className="c10 c25">
                  <span className="c11"></span>
                </p>
              </td>
              <td className="c33" colSpan="1" rowSpan="1">
                <p className="c16 c30">
                  <span className="c22 c24 c29">Mẫu số 08/TCCN</span>
                </p>
              </td>
            </tr>
            <tr className="c37">
              <td className="c21" colSpan="1" rowSpan="2">
                <p className="c5">
                  <span className="c12">NGÂN HÀNG HỢP TÁC XÃ VIỆT NAM</span>
                </p>
                <p className="c5" style={{ marginTop: "-10pt" }}>
                  <span
                    style={{
                      overflow: "hidden",
                      display: "inline-block",
                      margin: "0px 0px",
                      border: "1px solid #000000",
                      transform: "rotate(0rad) translateZ(0px)",
                      WebkitTransform: "rotate(0rad) translateZ(0px)",
                      width: "153.33px",
                      height: "1.33px",
                    }}
                  >
                    <img
                      alt=""
                      src="https://lh3.googleusercontent.com/fife/ALs6j_Egzj__am4C2zFNUv8BzCFckNeu9evuOchjlq7AA6VeBL3sspaSX5hfyRVI47Vr4ShNLBPumkbMu_3Poj2i4JKNcGdZG73qEOep7KdX3UVXQd9F5NRia0VaJweJWIMi_6tqRIOAtqsGJeAtQdpnyhab7Enid8Hk9SSVocFo1ejdfgQ7Eh3VEPis9cCV7Bi9j25HgOkdXbaVuHEE2BMeb1gxHKk-0lLntiQioxbuVwxGdSq7KexQ5Z5BQ2kalVHOGD37oFhWeMDIwjYsLyAeHDOsmBG39nBSnUS80vUJnOn0DBm-xuRp_sDknfWXwOlmmFdyrYnC-BIJYWE1jWd77iNLrVB2TGFBQ8nfDmhXvrbVi1egv6SLS8UneZp4urW9iFQjXh4_xh57KzfSI6s64EQHpSlvAjQAbH5uha_vkuwY6w5FDv5qzIrgf5BmmIMyOqBV83QF1bM8TgHf7HZcwiY_1nTSaaKETWh9XJFwq_tuvwe0F_UV7FwFgvZulkpiuQTeybPPTrmyVaYVct-1GA-bM0QWU0lFiQGGYsiHMAm6k2A3bIeM18UETvZb26GTYfXBWHhWdLuVremp3BR3qWlwHtTtKyz8FCkfpYhgGMvs9wmAKH8P7UIOAJ7KZD29DV_5CoiZZ3XpOcUgA1eV9_QHs237JBmvcHaZALCT_IGHl7Wm0uUoTx07lXZu_6fS48Jh-RrpSDDkgI2fSeIslcfwfDxvvCNv4eKNJIoaarMYJdhaXPAiNMQznzFur78442YZvli2FmOH3MFKCZdin4SXRLihUrLXNH-2lALKxGZeLGAJLe_Sjf-A7ANH1KtEG_Q4LSPZfUQVWWVY9PjnsuQ__P2rTuKwDSijllCy6qb9EtlvCG7MFQqehuYFs-0G2pYuhf0OTUAxQyg5olPAVxmiGM8HK1nNaR_WGFBK5Dh756rxoXonX8HuPXF5EVb9e8nX92B9zoJ2vLzVsy_TjeQ-TW1zqPRST5_p5gTQuYCgcbYWi7asV6KEYqmAqGogrpthbCKW_Fnu9mSRv8sDaIxCzaxpIDd5N_RNxvIHcoOcvqj946qE9AveFhFt7X_Wxtm9ocIimkkiWq9_qdlcpLCe6m5XKhjYsZj1k4fUdr-kGItIDiQuwjIbaQlVk9-XpxzfYrGmyqnpr-4y9T_K5BLMawVK7GLObEZACuy9t-GjRHW-BcI-drE_mbUxqwBhoD9Th-_tF5rrQr4E_uErA8RhGgUJ1RnaL6_frso7Q7Py8VU2CEoHk8hGGiTo0PQUhwlVlHPdkgFy6Ij_OPUinRkqSLNSmt0zYqF9g8f5Zz5r5KbqB-pFJFtxau9YGDoUf55LigFd-lcFNnu5sdzVnBlZzkhycayuOX553RoVYv3okpjYAKGiRwyBkZ8GhKOtAaMA-favzHI6BR_cHMkOPbLrz_g7DgmVAoye0Qxa5grDRcoH1LpcAEBorndIzu957CLcO3DghME8jNe-JTuejsLr4xI1Ui2pWy_8mi5csSjnov7oc7zfMotQr5defgFSyjwPRLzfjrM9QPNdscr6GWqwKTsKdJNJqcg_FpMIZ59ZvcU-rXmpDAMx0bfsjF76pn71Pu6Jjx9KS8a0HLSfCuJdgKNUaqOmJcMbpyaH66x7-kXrz0goZwEz9jWiCWaWW_CqLSx3FEy4lA=w1105-h889?auditContext=forDisplay"
                      style={{
                        width: "153.33px",
                        height: "1.33px",
                        marginLeft: "0px",
                        marginTop: "0px",
                        transform: "rotate(0rad) translateZ(0px)",
                        WebkitTransform: "rotate(0rad) translateZ(0px)",
                      }}
                    />
                  </span>
                </p>
                <p className="c5" style={{ marginTop: "4px" }}>
                  <span className="c14" style={{ textAlign: "center" }}>
                    Chi nhánh {formData.branch_name}
                  </span>
                </p>
              </td>
              <td className="c33" colSpan="1" rowSpan="1">
                <p className="c5">
                  <span className="c12">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </span>
                </p>
              </td>
            </tr>
            <tr className="c3">
              <td className="c33" colSpan="1" rowSpan="1">
                <p className="c5">
                  <span className="c0">Độc lập - Tự do - Hạnh Phúc</span>
                  <span
                    style={{
                      overflow: "hidden",
                      display: "inline-block",
                      margin: "0px 1px",
                      marginBottom: "8pt",
                      border: "1px solid #000000",
                      transform: "rotate(0rad) translateZ(0px)",
                      WebkitTransform: "rotate(0rad) translateZ(0px)",
                      width: "170px",
                      height: "1.33px",
                    }}
                  >
                    <img
                      alt=""
                      src="https://lh3.googleusercontent.com/fife/ALs6j_Egzj__am4C2zFNUv8BzCFckNeu9evuOchjlq7AA6VeBL3sspaSX5hfyRVI47Vr4ShNLBPumkbMu_3Poj2i4JKNcGdZG73qEOep7KdX3UVXQd9F5NRia0VaJweJWIMi_6tqRIOAtqsGJeAtQdpnyhab7Enid8Hk9SSVocFo1ejdfgQ7Eh3VEPis9cCV7Bi9j25HgOkdXbaVuHEE2BMeb1gxHKk-0lLntiQioxbuVwxGdSq7KexQ5Z5BQ2kalVHOGD37oFhWeMDIwjYsLyAeHDOsmBG39nBSnUS80vUJnOn0DBm-xuRp_sDknfWXwOlmmFdyrYnC-BIJYWE1jWd77iNLrVB2TGFBQ8nfDmhXvrbVi1egv6SLS8UneZp4urW9iFQjXh4_xh57KzfSI6s64EQHpSlvAjQAbH5uha_vkuwY6w5FDv5qzIrgf5BmmIMyOqBV83QF1bM8TgHf7HZcwiY_1nTSaaKETWh9XJFwq_tuvwe0F_UV7FwFgvZulkpiuQTeybPPTrmyVaYVct-1GA-bM0QWU0lFiQGGYsiHMAm6k2A3bIeM18UETvZb26GTYfXBWHhWdLuVremp3BR3qWlwHtTtKyz8FCkfpYhgGMvs9wmAKH8P7UIOAJ7KZD29DV_5CoiZZ3XpOcUgA1eV9_QHs237JBmvcHaZALCT_IGHl7Wm0uUoTx07lXZu_6fS48Jh-RrpSDDkgI2fSeIslcfwfDxvvCNv4eKNJIoaarMYJdhaXPAiNMQznzFur78442YZvli2FmOH3MFKCZdin4SXRLihUrLXNH-2lALKxGZeLGAJLe_Sjf-A7ANH1KtEG_Q4LSPZfUQVWWVY9PjnsuQ__P2rTuKwDSijllCy6qb9EtlvCG7MFQqehuYFs-0G2pYuhf0OTUAxQyg5olPAVxmiGM8HK1nNaR_WGFBK5Dh756rxoXonX8HuPXF5EVb9e8nX92B9zoJ2vLzVsy_TjeQ-TW1zqPRST5_p5gTQuYCgcbYWi7asV6KEYqmAqGogrpthbCKW_Fnu9mSRv8sDaIxCzaxpIDd5N_RNxvIHcoOcvqj946qE9AveFhFt7X_Wxtm9ocIimkkiWq9_qdlcpLCe6m5XKhjYsZj1k4fUdr-kGItIDiQuwjIbaQlVk9-XpxzfYrGmyqnpr-4y9T_K5BLMawVK7GLObEZACuy9t-GjRHW-BcI-drE_mbUxqwBhoD9Th-_tF5rrQr4E_uErA8RhGgUJ1RnaL6_frso7Q7Py8VU2CEoHk8hGGiTo0PQUhwlVlHPdkgFy6Ij_OPUinRkqSLNSmt0zYqF9g8f5Zz5r5KbqB-pFJFtxau9YGDoUf55LigFd-lcFNnu5sdzVnBlZzkhycayuOX553RoVYv3okpjYAKGiRwyBkZ8GhKOtAaMA-favzHI6BR_cHMkOPbLrz_g7DgmVAoye0Qxa5grDRcoH1LpcAEBorndIzu957CLcO3DghME8jNe-JTuejsLr4xI1Ui2pWy_8mi5csSjnov7oc7zfMotQr5defgFSyjwPRLzfjrM9QPNdscr6GWqwKTsKdJNJqcg_FpMIZ59ZvcU-rXmpDAMx0bfsjF76pn71Pu6Jjx9KS8a0HLSfCuJdgKNUaqOmJcMbpyaH66x7-kXrz0goZwEz9jWiCWaWW_CqLSx3FEy4lA=w1105-h889?auditContext=forDisplay"
                      style={{
                        width: "170px",
                        height: "1.33px",
                        marginLeft: "0px",
                        marginTop: "0px",
                        transform: "rotate(0rad) translateZ(0px)",
                        WebkitTransform: "rotate(0rad) translateZ(0px)",
                      }}
                    />
                  </span>
                </p>
              </td>
            </tr>
            <tr className="c18">
              <td className="c21" colSpan="1" rowSpan="1">
                <p className="c10">
                  <span className="c9">
                    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;{" "}
                  </span>
                </p>
              </td>
              <td className="c33" colSpan="1" rowSpan="1">
                <p className="c10 c25">
                  <span className="c23"></span>
                </p>
                <p className="c4">
                  <span className="c1">
                    &nbsp; &nbsp; {formData.document_location},{" "}
                    {formData.document_date}
                  </span>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="c10 c16 c25">
          <span className="c11"></span>
        </p>
        <p className="c4">
          <span className="c0">
            &#272;&#7872; NGH&#7882; T&#7840;M D&#7914;NG/ M&#7902; L&#7840;I/
            CH&#7844;M D&#7912;T{" "}
          </span>
        </p>
        <p className="c4">
          <span className="c0">
            CHO VAY THEO H&#7840;N M&#7912;C TH&#7844;U CHI
          </span>
        </p>
        <p className="c4">
          <span className="c22 c26 c29">
            (M&#7851;u bi&#7875;u d&agrave;nh cho kh&aacute;ch h&agrave;ng
            &#273;&#7873; ngh&#7883;)
          </span>
        </p>
        <p className="c10 c25">
          <span className="c1"></span>
        </p>
        <p className="c10 c16" style={{}}>
          <span className="c9 c41">K&iacute;nh g&#7917;i</span>
          <span className="c9">
            : Ng&acirc;n ha&#768;ng H&#417;&#803;p ta&#769;c x&atilde;
            Vi&#7879;t Nam- Chi nh&aacute;nh
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "148pt", fontWeight: "bold" }}
              type="text"
              name="branch_name"
              id="branch_name"
              value={formData.branch_name || ""}
              onChange={(e) => handleChange("branch_name", e.target.value)}
              onFocus={(e) => handleInputFocus("branch_name", e.target)}
            />
          </span>
        </p>
        <p className="c8" style={{ marginTop: "8px" }}>
          <span className="c1">Tên tôi là: {idData.full_name}</span>.
        </p>
        <p className="c8">
          <span className="c1">
            Ngày sinh: {idData.date_of_birth}; N&#417;i sinh:
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "310pt" }}
              type="text"
              name="borrower_place_of_birth"
              id="borrower_place_of_birth"
              value={formData.borrower_place_of_birth || ""}
              onChange={(e) =>
                handleChange("borrower_place_of_birth", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("borrower_place_of_birth", e.target)
              }
            />
          </span>
        </p>
        <p className="c36">
          <span className="c1">Địa chỉ: {idData.place_of_residence}</span>
        </p>
        <p className="c8">
          <span className="c1">CCCD/Hộ chiếu số: {idData.eid_number}</span>
        </p>
        <p className="c8">
          <span className="c1">
            Ngày cấp: {idData.date_of_issue}. Nơi cấp: {idData.place_of_issue}.
          </span>
        </p>
        <p className="c8">
          <span className="c1">
            S&#7889; t&agrave;i kho&#7843;n thanh to&aacute;n:
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "180pt" }}
              type="text"
              name="borrower_bank_account"
              id="borrower_bank_account"
              value={formData.borrower_bank_account || ""}
              onChange={(e) =>
                handleChange("borrower_bank_account", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("borrower_bank_account", e.target)
              }
            />
            t&#7841;i Ng&acirc;n h&agrave;ng H&#7907;p t&aacute;c x&atilde;
            Vi&#7879;t Nam (NHHTX) - Chi nh&aacute;nh: {formData.branch_name}
          </span>
        </p>
        <p className="c6">
          <span className="c9">
            &#272;&#7873; ngh&#7883; NHHTX cho t&ocirc;i &#273;&#432;&#7907;c{" "}
          </span>
          <span className="c2">
            (&#272;&#7873; ngh&#7883; Qu&yacute; kh&aacute;ch h&agrave;ng
            &#273;&aacute;nh d&#7845;u (
          </span>
          <span className="c2">
            &#10003;) v&agrave;o &ocirc; tr&#7889;ng v&agrave; &#273;i&#7873;n
            &#273;&#7847;y &#273;&#7911; c&aacute;c th&ocirc;ng tin y&ecirc;u
            c&#7847;u theo m&#7851;u d&#432;&#7899;i &#273;&acirc;y):
          </span>
        </p>
        <p className="c6">
          <label className="c42" style={{ cursor: "pointer" }}>
            <input
              type="radio"
              name="hmtc_request_type"
              id="cham_dut"
              checked={formData.hmtc_request_type === "Chấm dứt"}
              onChange={() => handleChange("hmtc_request_type", "Chấm dứt")}
            />
            <span className="radio-box radio-box-check"></span>
            <span className="c9"> Ch&#7845;m d&#7913;t</span>
            <span className="c1">
              (tr&#432;&#7899;c h&#7841;n) h&#7841;n m&#7913;c cho vay
              th&#7845;u chi tr&ecirc;n t&agrave;i kho&#7843;n thanh to&aacute;n
            </span>
          </label>
        </p>
        <p className="c6">
          <label className="c42" style={{ cursor: "pointer" }}>
            <input
              type="radio"
              name="hmtc_request_type"
              id="tam_dung"
              checked={formData.hmtc_request_type === "Tạm dừng"}
              onChange={() => handleChange("hmtc_request_type", "Tạm dừng")}
            />
            <span className="radio-box radio-box-check"></span>
            <span className="c9">
              {" "}
              T&#7841;m d&#7915;ng
              <span className="c1">
                &nbsp;h&#7841;n m&#7913;c cho vay th&#7845;u chi tr&ecirc;n
                t&agrave;i kho&#7843;n thanh to&aacute;n{" "}
              </span>
            </span>
          </label>
        </p>
        <p className="c6">
          <label className="c42" style={{ cursor: "pointer" }}>
            <input
              type="radio"
              name="hmtc_request_type"
              id="mo_lai"
              checked={formData.hmtc_request_type === "Mở lại"}
              onChange={() => handleChange("hmtc_request_type", "Mở lại")}
            />
            <span className="radio-box radio-box-check"></span>
            <span className="c9">
              M&#7903; l&#7841;i
              <span className="c1">
                &nbsp;h&#7841;n m&#7913;c cho vay th&#7845;u chi tr&ecirc;n
                t&agrave;i kho&#7843;n thanh to&aacute;n{" "}
              </span>
            </span>
          </label>
        </p>
        <p className="c6">
          <span className="c0">v&#7899;i n&#7897;i dung sau:</span>
        </p>
        <p className="c8">
          <span className="c1">
            H&#7907;p &#273;&#7891;ng cho vay theo h&#7841;n m&#7913;c
            th&#7845;u chi s&#7889;:
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "70pt" }}
              type="number"
              name="hmtc_contract_number"
              id="hmtc_contract_number"
              value={formData.hmtc_contract_number || ""}
              onChange={(e) =>
                handleChange("hmtc_contract_number", e.target.value)
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
              onFocus={(e) => handleInputFocus("hmtc_contract_date", e.target)}
            />
          </span>
        </p>
        <p className="c8">
          <span className="c1">
            H&#7841;n m&#7913;c cho vay th&#7845;u chi:
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "280pt" }}
              type="text"
              name="hmtc_limit_amount"
              id="hmtc_limit_amount"
              value={formData.hmtc_limit_amount || ""}
              onChange={(e) =>
                handleChange("hmtc_limit_amount", e.target.value)
              }
              onFocus={(e) => handleInputFocus("hmtc_limit_amount", e.target)}
            />
            &#273;&#7891;ng.
          </span>
        </p>
        <p className="c8" id="h.gfka5r7ei2oy">
          <span className="c1">
            B&#7857;ng ch&#7919;:
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "420pt" }}
              type="text"
              name="hmtc_limit_amount_text"
              id="hmtc_limit_amount_text"
              value={formData.hmtc_limit_amount_text || ""}
              onChange={(e) =>
                handleChange("hmtc_limit_amount_text", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("hmtc_limit_amount_text", e.target)
              }
            />
          </span>
        </p>
        <p className="c8">
          <span className="c1">
            Th&#7901;i h&#7841;n hi&#7879;u l&#7921;c c&#7911;a h&#7841;n
            m&#7913;c cho vay th&#7845;u chi:
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="date"
              name="hmtc_effective_duration"
              id="hmtc_effective_duration"
              value={formData.hmtc_effective_duration || ""}
              onChange={(e) =>
                handleChange("hmtc_effective_duration", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("hmtc_effective_duration", e.target)
              }
            />
          </span>
        </p>
        <p className="c8">
          <span className="c1">
            L&yacute; do t&#7841;m d&#7915;ng/ch&#7845;m d&#7913;t
            (tr&#432;&#7899;c h&#7841;n) h&#7841;n m&#7913;c th&#7845;u chi:
            <textarea
              rows={4}
              className="form_control"
              style={{ margin: "4pt", width: "100%" }}
              name="hmtc_suspension_reason"
              id="hmtc_suspension_reason"
              value={formData.hmtc_suspension_reason || ""}
              onChange={(e) =>
                handleChange("hmtc_suspension_reason", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("hmtc_suspension_reason", e.target)
              }
            />
          </span>
        </p>
        <p className="c6">
          <span className="c1">
            T&ocirc;i cam k&#7871;t: Thanh to&aacute;n &#273;&#7847;y
            &#273;&#7911; m&#7885;i kho&#7843;n n&#7907; g&#7889;c, ph&iacute;,
            l&atilde;i vay th&#7845;u chi cho &#273;&#7871;n th&#7901;i
            &#273;i&#7875;m t&#7841;m d&#7915;ng/ch&#7845;m d&#7913;t h&#7841;n
            m&#7913;c theo h&#7907;p &#273;&#7891;ng cho vay &#273;&atilde;
            k&yacute;.
          </span>
        </p>
        <p className="c13">
          <span className="c1"></span>
        </p>
        <table className="c32">
          <tbody>
            <tr className="c27">
              <td className="c40" colSpan="1" rowSpan="1">
                <p className="c10">
                  <span className="c9 c22">N&#417;i nh&#7853;n:</span>
                </p>
                <p className="c10">
                  <span className="c22 c24 c29">- Nh&#432; tr&ecirc;n</span>
                </p>
              </td>
              <td className="c31" colSpan="1" rowSpan="1">
                <p className="c5">
                  <span className="c0">
                    NG&#431;&#7900;I &#272;&#7872; NGH&#7882;
                  </span>
                </p>
                <p className="c5">
                  <span className="c28">
                    (K&yacute;, ghi r&otilde; h&#7885; t&ecirc;n)
                  </span>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="c25 c39">
          <span className="c11"></span>
        </p>
        <div>
          <p className="c17">
            <span className="c20"></span>
          </p>
        </div>
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

export default Mau_8;
