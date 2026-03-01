import React, { useState, useRef, useEffect } from "react";
import VirtualKeyboard, {
  processVietnameseInput,
} from "./../VirtualKeyboard";

const Mau_NHHT = ({ idData, initialFormData, onSubmit, onCancel }) => {
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
    const currentDate = `Ngày ${day} tháng ${month} năm ${year}`;

    return {
      document_location: "Hà Nội",
      document_date: currentDate,
      branch_name: "",
      review_round: "",
      phone: "",
      business_name: "",
      business_license: "",
      business_issue_date: "",
      business_issuer: "",
      amount: "",
      business_address: "",
      business_phone: "",
      transaction_channel: "",
      transaction_type: "",
      transaction_device: "",
      transaction_date: "",
      account_number: "",
      transaction_id: "",
      beneficiary_name: "",
      beneficiary_account: "",
      beneficiary_bank: "",
      transaction_content: "",
      request_type: "",
      request_content: "",
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
    if (field === "amount") {
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

    const business_issue_date = processed.business_issue_date || "";
    if (business_issue_date) {
      const parts = business_issue_date.split("-");
      processed.business_issue_date = `${parts[2] || ".."}/${
        parts[1] || ".."
      }/${parts[0] || "...."}`;
    } else {
      processed.business_issue_date = "../../....";
    }

    const transaction_date = processed.transaction_date || "";
    if (transaction_date) {
      const parts = transaction_date.split("-");
      processed.transaction_date = `${parts[2] || ".."}/${parts[1] || ".."}/${
        parts[0] || "...."
      }`;
    } else {
      processed.transaction_date = "../../....";
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
      
    ol {
        margin: 0;
        padding: 0
    }

    table td,
    table th {
        padding: 0
    }

    .c6 {
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
        width: 216pt;
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
        width: 236.8pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c22 {
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
        width: 254.1pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c24 {
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
        width: 470.1pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c20 {
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
        width: 20.8pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c28 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
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
        width: 173.2pt;
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
        width: 233.3pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c0 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
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
        width: 111.5pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c39 {
        border-right-style: solid;
        padding: 0pt 5.4pt 0pt 5.4pt;
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
        width: 185.9pt;
        border-top-color: #000000;
        border-bottom-style: solid
    }

    .c10 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.0;
        orphans: 2;
        widows: 2;
        text-align: center;
        height: 11pt
    }

    .c8 {
        padding-top: 12pt;
        padding-bottom: 0pt;
        line-height: 1.0;
        orphans: 2;
        widows: 2;
        text-align: center;
        height: 11pt
    }

    .c35 {
        color: #000000;
        font-weight: 400;
        text-decoration: none;
        vertical-align: baseline;
        font-size: 12pt;
        font-family: "Calibri";
        font-style: normal
    }

    .c3 {
        color: #000000;
        font-weight: 400;
        text-decoration: none;
        vertical-align: baseline;
        font-size: 12pt;
        font-family: "Times New Roman";
        font-style: normal
    }

    .c34 {
        color: #000000;
        font-weight: 400;
        text-decoration: none;
        vertical-align: baseline;
        font-size: 11pt;
        font-family: "Times New Roman";
        font-style: normal
    }

    .c1 {
        color: #000000;
        font-weight: 700;
        text-decoration: none;
        vertical-align: baseline;
        font-size: 12pt;
        font-family: "Times New Roman";
        font-style: normal
    }

    .c13 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.0;
        orphans: 2;
        widows: 2;
        text-align: center
    }

    .c9 {
        padding-top: 3pt;
        padding-bottom: 3pt;
        line-height: 1.6666666666666667;
        orphans: 2;
        widows: 2;
        text-align: center
    }

    .c30 {
        padding-top: 0pt;
        padding-bottom: 10pt;
        line-height: 1.1500000000000001;
        orphans: 2;
        widows: 2;
        text-align: justify
    }

    .c42 {
        padding-top: 3pt;
        padding-bottom: 6pt;
        line-height: 1.6666666666666667;
        orphans: 2;
        widows: 2;
        text-align: left
    }

    .c11 {
        padding-top: 3pt;
        padding-bottom: 0pt;
        line-height: 1.0;
        orphans: 2;
        widows: 2;
        text-align: center
    }

    .c27 {
        padding-top: 3pt;
        padding-bottom: 6pt;
        line-height: 1.6666666666666667;
        orphans: 2;
        widows: 2;
        text-align: center
    }

    .c29 {
        padding-top: 3pt;
        padding-bottom: 6pt;
        line-height: 1.6666666666666667;
        orphans: 2;
        widows: 2;
        text-align: justify
    }

    .c2 {
        padding-top: 3pt;
        padding-bottom: 6pt;
        line-height: 1.5;
        orphans: 2;
        widows: 2;
        text-align: justify
    }

    .c19 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.1500000000000001;
        orphans: 2;
        widows: 2;
        text-align: right
    }

    .c40 {
        padding-top: 12pt;
        padding-bottom: 12pt;
        line-height: 1.25;
        orphans: 2;
        widows: 2;
        text-align: center
    }

    .c25 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.4166666666666667;
        orphans: 2;
        widows: 2;
        text-align: center
    }

    .c33 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.5;
        orphans: 2;
        widows: 2;
        text-align: center
    }

    .c18 {
        padding-top: 6pt;
        padding-bottom: 0pt;
        line-height: 1.4166666666666667;
        orphans: 2;
        widows: 2;
        text-align: center
    }

    .c4 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.5;
        orphans: 2;
        widows: 2;
        text-align: justify
    }

    .c23 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.5;
        orphans: 2;
        widows: 2;
        text-align: left
    }

    .c37 {
        padding-top: 6pt;
        padding-bottom: 6pt;
        line-height: 1.0;
        orphans: 2;
        widows: 2;
        text-align: center
    }

    .c14 {
        padding-top: 3pt;
        padding-bottom: 3pt;
        line-height: 1.5;
        orphans: 2;
        widows: 2;
        text-align: justify
    }

    .c36 {
        padding-top: 0pt;
        padding-bottom: 0pt;
        line-height: 1.15;
        text-align: left
    }

    .c38 {
        color: #000000;
        text-decoration: none;
        vertical-align: baseline;
        font-style: italic
    }

    .c32 {
        border-spacing: 0;
        border-collapse: collapse;
        margin-right: auto
    }

    .c15 {
        font-size: 12pt;
        font-weight: 400;
        font-family: "Times New Roman"
    }

    .c31 {
        background-color: #ffffff;
        max-width: 670.6pt;
        margin-top: 3rem;
        padding: 24pt;
        border-radius: 24pt;
        font-family: "Times New Roman";
    }

    .c7 {
        font-size: 12pt;
        font-weight: 700;
        font-family: "Times New Roman"
    }

    .c16 {
        font-size: 12pt;
        font-weight: 400;
        font-family: "Yu Gothic UI"
    }

    .c17 {
        height: 0pt
    }

    .c21 {
        height: 116pt
    }

    .c41 {
        height: 31.6pt
    }

    .c26 {
        height: 11pt
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
        font-size: 12pt;
        padding-bottom: 2pt;
        font-family: "Calibri";
        line-height: 1.1500000000000001;
        page-break-after: avoid;
        orphans: 2;
        widows: 2;
        text-align: left
    }

    h5 {
        padding-top: 11pt;
        color: #000000;
        font-weight: 700;
        font-size: 11pt;
        padding-bottom: 2pt;
        font-family: "Calibri";
        line-height: 1.1500000000000001;
        page-break-after: avoid;
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
    }

    .inline {
        display: inline;
    }

    .inline-flex {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }

    .inline-flex > span {
        display: inline-flex;
        align-items: center;
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
      <div className="c31 doc-content">
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
              margin: "0px 0px",
              border: "0px solid #000000",
              transform: "rotate(0rad) translateZ(0px)",
              WebkitTransform: "rotate(0rad) translateZ(0px)",
              width: "262.6px",
              height: "57.4px",
            }}
          >
            <img
              alt="C:\Users\hoann\Desktop\logo PNG.png"
              src="https://lh3.googleusercontent.com/fife/ALs6j_HLqdUrUtYGcTCBFgLMvuLB9xicVWT3rI1rrPMM0ernTu0rETvY_itxN3imXIOgL-WPPXnrri1LOusg8nGYR2mJLetSprz4xS2yd2X_ONO4QiXMimFXkjj0tu6rG8bqmTTDiTVweW0z4TBWdkYahH6HXg2fLnxet9s3-ITYDADWKv1RKLGJ3EHY7fWCw9EgqdvW5oZD4QqbHgkFIAbyUbib1cdB3quyc6CsxVHgR2mT7xipxkBANLFsFkVLSPQRnjd1jwMRJRrYLdPJizML_ECl7FtP3ROgJRty4dCbFgoPee5H4Z7Y96m2zJ2y0GG0a_GfD7nU4FzJ9FDIvOXuKwfK_PB1B27j_CGgyNd3TVJvTQPQ6K5rkz2aMbgBZSvhD_NPJ8uV9NVzKyEey1_nv-urrKDH2lkl_VQE4DldRz1n_GpG3382ytPrT4XhuqcWqf4oaHI9o0aurA_MRGRklM7P7u_iTPUNoYWKPeSosohqyUwPs7wSxLp5F_qAySy9JXFQEceJ78XXCIA6Fv27_2LK1-bg8jzcolVpq3xGFsIUbNNCLm61B1F3BGXwQ9T114WExPSt11dCc5usE0OCiYxG8Gzx0YA2KptRFrAJc7N5FdNcMnx_Y8l4FdQwiGxWzBDhdWKzj2k50bFjthhvmRQ8XNA6lwGWq6iZGfrPHxDvW2-55MIEbIlaeccF1v0d-sGXimKDElNkcCSObYgXIcDJ6PsmXjtaiNQd-NgKG6y4BlA_ZLcEBzN8EJYvZ1EaTOlu99f6sytSrsbqvKXrJ6onS0HIwyCHoINABP3WTeZpfRcyXbr-nvD4BKrIyhTBzhZAzbNNiXvUE-2ORDp9Ltban2ojGZQtMB0kaYHQfuP5aCrwmNsvswzm9OIq0SvivYqakzmAOaq5UOXetyxz4r4Gf1u9prk1zhb7bYP7osaRgw7U3JzxdBJZEBnJnUqU5ZZYKs3trbf7CIPH7RQiMlkwQxCg2QH57JqWGslnJ3DE1J5-KThsCTEmEoWnv7WP04qa_ukxzFSxo6iNCuJr-HHHGhTl6a6DmaYXEQvzh-4JTVZqMtfSrVfheLzB-NooGzsABql09xF2TZo89jUTRqLZh7_b15PptJYjCJALtEhSpxg9rr9LDLKa97QNlkGoYNU-fQMwfC2cQzXCKQGdD0KwjVnpdzMe1KcIzTM1r-rnvS5JvN7AMjYZGxQOCLpEVlOJozDlaPOz6fuUbNhQI7z587yS-GJ9y8MzZFIJP1mQpSi_6K-qomT-F8up7MIxoBrQNkLkfpZfriSB-ksx6l96KVr4fGzXLhy1Z97WFPYEpeAMWAtM8HB1u_XqiRI2M-3f5V-cqYmQPe5e_DkSoI_R-AGCO-88ZtTANHN4eWpU31T5_63hvisZdINrJnYJYBz89zVIcmBcHpg-TZSgV5zxolWkFsicPdBqtFjjPdi5A73neE8fdtYfWo-BWwWgqd4jaVf0rvYK-yGsWnXig2ZrDvH71nGp_0bL4Y_bRTQSp5c6cyWqaFOhifq1-NaBvMq3adyaAG66EJwOMxNqW8RzkkfseCU7Qg07vXAjlVUv843Mi-kJEB6_fC9FEqlJX50x60HXr387HDWYboubPiAk1RNGJuQb5igXsDf7KxIDPwjLSrCkYS1163uoZw5A4jeiYkY7Ihc_Sg=w1105-h889?auditContext=forDisplay"
              style={{
                width: "165.33px",
                height: "38.93px",
                marginLeft: "0px",
                marginTop: "0px",
                transform: "rotate(0rad) translateZ(0px)",
              }}
              title=""
            />
          </span>
          <table>
            <tbody>
              <tr>
                <td
                  style={{
                    width: "50%",
                    textAlign: "right",
                    verticalAlign: "top",
                    border: "none",
                  }}
                >
                  <span style={{ fontStyle: "italic", fontSize: "14px" }}>
                    M&#7851;u s&#7889;:03/TS-TKTT
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* <p className="c19" id="h.1088ccjsxqf"><span className="c3">M&#7851;u s&#7889;:03/TS-TKTT</span><span
                style={{overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 165.33px; height: 38.93px;"><img
                    alt="C:\Users\hoann\Desktop\logo PNG.png" src="images/image1.png"
                    style={{width: 165.33px; height: 38.93px; margin-left: -0.00px; margin-top: -0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);"
                    title=""></span></p> */}
        <p className="c18">
          <span className="c1">
            Y&Ecirc;U C&#7846;U TRA SO&Aacute;T, KHI&#7870;U N&#7840;I
          </span>
        </p>
        <p className="c25">
          <span className="c1">
            (L&#7847;n {/* {{REVIEW_ROUND}} */}
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "100pt" }}
              type="text" // dùng text thay number để tránh arrow lên/xuống và dễ validate
              inputMode="numeric" // bàn phím số trên mobile
              pattern="[0-9]*" // chỉ cho phép số
              name="review_round"
              id="review_round"
              value={formData.review_round || ""}
              onChange={(e) => {
                const value = e.target.value;
                const numericValue = value.replace(/[^0-9]/g, "");
                handleChange("review_round", numericValue);
              }}
              onFocus={(e) => handleInputFocus("review_round", e.target)}
            />{" "}
            )
          </span>
        </p>
        <p className="c40">
          <span className="c7">
            K&iacute;nh g&#7917;i: NHHT chi nh&aacute;nh
          </span>
          <span className="c3" style={{ fontWeight: "bold" }}>
            {" "}
            {/* {{BRANCH_NAME}} */}
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "160pt" }}
              type="text"
              name="branch_name"
              id="branch_name"
              value={formData.branch_name || ""}
              onChange={(e) => handleChange("branch_name", e.target.value)}
              onFocus={(e) => handleInputFocus("branch_name", e.target)}
            />
          </span>
        </p>
        <p className="c23">
          <span className="c1">
            1.Th&ocirc;ng tin kh&aacute;ch h&agrave;ng:
          </span>
        </p>
        <p className="c23">
          <span className="c1">
            1.1. Kh&aacute;ch h&agrave;ng c&aacute; nh&acirc;n:
          </span>
        </p>
        <p className="c4">
          <span className="c3">Tên khách hàng: {idData?.full_name}</span>
        </p>
        <p className="c4">
          <span className="c3">CCCD/Hộ chiếu số: {idData?.eid_number}</span>
        </p>
        <p className="c4">
          <span className="c3">
            Ngày cấp: {idData?.date_of_issue}. Nơi cấp: {idData?.place_of_issue}
          </span>
        </p>
        <p className="c4">
          <span className="c3">Địa chỉ: {idData?.place_of_residence}</span>
        </p>
        <p className="c4">
          <span className="c3">
            Điện thoại: {/* {{PHONE}} */}
            <input
              className="form_control"
              style={{ margin: "0 4pt", padding: "0 10pt", width: "120pt" }}
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone || ""}
              onChange={(e) =>
                handleChange("phone", e.target.value.replace(/[^0-9]/g, ""))
              }
              onFocus={(e) => handleInputFocus("phone", e.target)}
            />
          </span>
        </p>
        <p className="c23">
          <span className="c1">
            1.2. Kh&aacute;ch h&agrave;ng doanh nghi&#7879;p:
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            T&ecirc;n &#273;&#417;n v&#7883;:
            {/* {{BUSINESS_NAME}} */}
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "514pt" }}
              type="text"
              name="business_name"
              id="business_name"
              value={formData.business_name || ""}
              onChange={(e) => handleChange("business_name", e.target.value)}
              onFocus={(e) => handleInputFocus("business_name", e.target)}
            />
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            Gi&#7845;y ch&#7913;ng nh&#7853;n &#272;KKD:
            {/* {{BUSINESS_LICENSE}}.  */}
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "446.6pt" }}
              type="text"
              name="business_license"
              id="business_license"
              value={formData.business_license || ""}
              onChange={(e) => handleChange("business_license", e.target.value)}
              onFocus={(e) => handleInputFocus("business_license", e.target)}
            />
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            Ng&agrave;y c&#7845;p:
            {/* {{BUSINESS_ISSUE_DATE}}.  */}
            <input
              className="form_control"
              style={{ marginLeft: "4pt", marginRight: "36pt" }}
              type="date"
              name="business_issue_date"
              id="business_issue_date"
              value={formData.business_issue_date || ""}
              onChange={(e) =>
                handleChange("business_issue_date", e.target.value)
              }
              onFocus={(e) => handleInputFocus("business_issue_date", e.target)}
            />
            C&#417; quan c&#7845;p:
            {/* {{BUSINESS_ISSUER}} */}
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "311pt" }}
              type="text"
              name="business_issuer"
              id="business_issuer"
              value={formData.business_issuer || ""}
              onChange={(e) => handleChange("business_issuer", e.target.value)}
              onFocus={(e) => handleInputFocus("business_issuer", e.target)}
            />
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            &#272;&#7883;a ch&#7881;:
            {/* {{BUSINESS_ADDRESS}} */}
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "532pt" }}
              type="text"
              name="business_address"
              id="business_address"
              value={formData.business_address || ""}
              onChange={(e) => handleChange("business_address", e.target.value)}
              onFocus={(e) => handleInputFocus("business_address", e.target)}
            />
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            &#272;i&#7879;n tho&#7841;i:
            {/* {{BUSINESS_PHONE}} */}
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "120pt" }}
              type="tel"
              name="business_phone"
              id="business_phone"
              value={formData.business_phone || ""}
              onChange={(e) =>
                handleChange(
                  "business_phone",
                  e.target.value.replace(/[^0-9]/g, "")
                )
              }
              onFocus={(e) => handleInputFocus("business_phone", e.target)}
            />
          </span>
        </p>
        <p className="c4">
          <span className="c1">
            2. Th&ocirc;ng tin giao d&#7883;ch &#273;&#7873; ngh&#7883; tra
            so&aacute;t/khi&#7871;u n&#7841;i:
          </span>
        </p>
        <p className="c14">
          <span className="c15">- Kênh giao dịch:</span>
          <span
            className="checkbox-group inline-flex"
            style={{ paddingLeft: "3rem" }}
          >
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="transaction_channel"
              id="transaction_channel_the"
              checked={formData.transaction_channel === "Thẻ"}
              onChange={(e) => handleChange("transaction_channel", "Thẻ")}
            />
            <span className="c15" style={{ paddingRight: "5.15rem" }}>
              Thẻ
            </span>

            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="transaction_channel"
              id="transaction_channel_mobile_banking"
              checked={formData.transaction_channel === "Mobile banking"}
              onChange={(e) =>
                handleChange("transaction_channel", "Mobile banking")
              }
            />
            <span className="c15" style={{ paddingRight: "3.4rem" }}>
              Mobile banking
            </span>

            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="transaction_channel"
              id="transaction_channel_quay"
              checked={formData.transaction_channel === "Quầy"}
              onChange={(e) => handleChange("transaction_channel", "Quầy")}
            />
            <span className="c15">Quầy</span>
          </span>
        </p>

        <p className="c14">
          <span className="c15">- Loại giao dịch:</span>
          <span
            className="checkbox-group inline-flex"
            style={{ paddingLeft: "3.35rem" }}
          >
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="transaction_type"
              id="transaction_type_rut_tien"
              checked={formData.transaction_type === "Rút tiền"}
              onChange={(e) => handleChange("transaction_type", "Rút tiền")}
            />
            <span className="c15" style={{ paddingRight: "3.5rem" }}>
              Rút tiền
            </span>

            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="transaction_type"
              id="transaction_type_chuyen_khoan"
              checked={formData.transaction_type === "Chuyển khoản"}
              onChange={(e) => handleChange("transaction_type", "Chuyển khoản")}
            />
            <span className="c15" style={{ paddingRight: "4rem" }}>
              Chuyển khoản
            </span>

            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="transaction_type"
              id="transaction_type_thanh_toan"
              checked={formData.transaction_type === "Thanh toán"}
              onChange={(e) => handleChange("transaction_type", "Thanh toán")}
            />
            <span className="c15">Thanh toán</span>
          </span>
        </p>

        <p className="c14">
          <span className="c15">- Thiết bị giao dịch:</span>
          <span
            className="checkbox-group inline-flex"
            style={{ paddingLeft: "2.07rem" }}
          >
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="transaction_device"
              id="transaction_device_atm/pos"
              checked={formData.transaction_device === "ATM/POS"}
              onChange={(e) => handleChange("transaction_device", "ATM/POS")}
            />
            <span className="c15" style={{ paddingRight: "2.5rem" }}>
              ATM/POS
            </span>

            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="transaction_device"
              id="transaction_device_mobile_banking"
              checked={formData.transaction_device === "Mobile banking"}
              onChange={(e) =>
                handleChange("transaction_device", "Mobile banking")
              }
            />
            <span className="c15" style={{ paddingRight: "3.45rem" }}>
              Mobile banking
            </span>

            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="transaction_device"
              id="transaction_device_quay"
              checked={formData.transaction_device === "Quầy"}
              onChange={(e) => handleChange("transaction_device", "Quầy")}
            />
            <span className="c15">Quầy</span>
          </span>
        </p>
        <p className="c2">
          <span className="c3">
            - Ng&agrave;y giao d&#7883;ch:
            {/* {{TRANSACTION_DATE}}.  */}
            <input
              className="form_control"
              style={{ marginLeft: "4pt", marginRight: "42pt", width: "100pt" }}
              type="date"
              name="transaction_date"
              id="transaction_date"
              value={formData.transaction_date || ""}
              onChange={(e) => handleChange("transaction_date", e.target.value)}
              onFocus={(e) => handleInputFocus("transaction_date", e.target)}
            />
            S&#7889; t&agrave;i kho&#7843;n/S&#7889; th&#7867; giao d&#7883;ch:
            {/* {{ACCOUNT_NUMBER}} */}
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "200pt" }}
              type="text"
              name="account_number"
              id="account_number"
              value={formData.account_number || ""}
              onChange={(e) =>
                handleChange(
                  "account_number",
                  e.target.value.replace(/[^0-9]/g, "")
                )
              }
              onFocus={(e) => handleInputFocus("account_number", e.target)}
            />
          </span>
        </p>
        <p className="c2">
          <span className="c3">
            - S&#7889; ti&#7873;n giao d&#7883;ch:
            {/* {{AMOUNT}}.  */}
            <input
              className="form_control"
              style={{
                marginLeft: "4pt",
                marginRight: "55.6pt",
                width: "180pt",
              }}
              type="text"
              name="amount"
              id="amount"
              value={formData.amount || ""}
              onChange={(e) => handleChange("amount", e.target.value)}
              onFocus={(e) => handleInputFocus("amount", e.target)}
            />
            S&#7889; giao d&#7883;ch:
            {/* {{TRANSACTION_ID}} */}
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "180pt" }}
              type="text"
              name="transaction_id"
              id="transaction_id"
              value={formData.transaction_id || ""}
              onChange={(e) => handleChange("transaction_id", e.target.value)}
              onFocus={(e) => handleInputFocus("transaction_id", e.target)}
            />
          </span>
        </p>
        <p className="c2">
          <span className="c3">
            - S&#7889; t&agrave;i kho&#7843;n ng&#432;&#7901;i h&#432;&#7903;ng
            {/* {{BENEFICIARY_ACCOUNT}} */}
            <input
              className="form_control"
              style={{
                marginLeft: "4pt",
                marginRight: "31.4pt",
                width: "160pt",
              }}
              type="text"
              name="beneficiary_account"
              id="beneficiary_account"
              value={formData.beneficiary_account || ""}
              onChange={(e) =>
                handleChange(
                  "beneficiary_account",
                  e.target.value.replace(/[^0-9]/g, "")
                )
              }
              onFocus={(e) => handleInputFocus("beneficiary_account", e.target)}
            />
            T&ecirc;n ng&#432;&#7901;i h&#432;&#7903;ng:
            {/* {{BENEFICIARY_NAME}} */}
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "160pt" }}
              type="text"
              name="beneficiary_name"
              id="beneficiary_name"
              value={formData.beneficiary_name || ""}
              onChange={(e) => handleChange("beneficiary_name", e.target.value)}
              onFocus={(e) => handleInputFocus("beneficiary_name", e.target)}
            />
          </span>
        </p>
        <p className="c2">
          <span className="c3">
            - Ng&acirc;n h&agrave;ng h&#432;&#7903;ng:
            {/* {{BENEFICIARY_BANK}} */}
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "180pt" }}
              type="text"
              name="beneficiary_bank"
              id="beneficiary_bank"
              value={formData.beneficiary_bank || ""}
              onChange={(e) => handleChange("beneficiary_bank", e.target.value)}
              onFocus={(e) => handleInputFocus("beneficiary_bank", e.target)}
            />
          </span>
        </p>
        <p className="c2">
          <span className="c3">
            - N&#7897;i dung giao d&#7883;ch (n&#7871;u c&oacute;):
            {/* {{TRANSACTION_CONTENT}} */}
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "428pt" }}
              type="text"
              name="transaction_content"
              id="transaction_content"
              value={formData.transaction_content || ""}
              onChange={(e) =>
                handleChange("transaction_content", e.target.value)
              }
              onFocus={(e) => handleInputFocus("transaction_content", e.target)}
            />
          </span>
        </p>
        <p className="c2">
          <span className="c1">
            3. Y&ecirc;u c&#7847;u Ng&acirc;n h&agrave;ng H&#7907;p t&aacute;c:
          </span>
        </p>
        <table className="c32" style={{ width: "100%" }}>
          <tbody>
            <tr className="c41">
              <td className="c39" colSpan="1" rowSpan="1">
                <p className="c27">
                  <span className="checkbox-group inline">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="request_type"
                      id="gd_khong_thanh_cong/hoan_tien"
                      checked={
                        formData.request_type ===
                        "GD không thành công/Hoàn tiền"
                      }
                      onChange={(e) =>
                        handleChange(
                          "request_type",
                          "GD không thành công/Hoàn tiền"
                        )
                      }
                    />
                    <span className="c15">GD không thành công/Hoàn tiền</span>
                  </span>
                </p>
              </td>
              <td className="c0" colSpan="1" rowSpan="1">
                <p className="c27">
                  <span className="checkbox-group inline">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="request_type"
                      id="chuyen_nham"
                      checked={formData.request_type === "Chuyển nhầm"}
                      onChange={(e) =>
                        handleChange("request_type", "Chuyển nhầm")
                      }
                    />
                    <span className="c15">Chuyển nhầm</span>
                  </span>
                </p>
              </td>
              <td className="c28" colSpan="1" rowSpan="1">
                <p className="c9">
                  <span className="checkbox-group inline">
                    <input
                      className="form_control"
                      style={{ margin: "0 4pt" }}
                      type="radio"
                      name="request_type"
                      id="thay_doi_noi_dung_chuyen_tien"
                      checked={
                        formData.request_type ===
                        "Thay đổi nội dung chuyển tiền"
                      }
                      onChange={(e) =>
                        handleChange(
                          "request_type",
                          "Thay đổi nội dung chuyển tiền"
                        )
                      }
                    />
                    <span className="c15">Thay đổi nội dung chuyển tiền</span>
                  </span>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="c42">
          <span className="c3">
            N&#7897;i dung:
            {/* {{REQUEST_CONTENT}} */}
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "524pt" }}
              type="text"
              name="request_content"
              id="request_content"
              value={formData.request_content || ""}
              onChange={(e) => handleChange("request_content", e.target.value)}
              onFocus={(e) => handleInputFocus("request_content", e.target)}
            />
          </span>
        </p>
        {/* <p className="c42"><span
                className="c3">&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;</span>
        </p> */}
        <p className="c29">
          <span className="c1">
            4. Cam k&#7871;t c&#7911;a kh&aacute;ch h&agrave;ng:
          </span>
        </p>
        <p className="c29">
          <span className="c7">- </span>
          <span className="c3">
            T&ocirc;i/ch&uacute;ng t&ocirc;i hi&#7875;u r&#7857;ng
            t&ocirc;i/ch&uacute;ng t&ocirc;i ph&#7843;i t&#7921; ch&#7883;u
            tr&aacute;ch nhi&#7879;m v&#7873; vi&#7879;c chuy&#7875;n ti&#7873;n
            nh&#7847;m cho ng&#432;&#7901;i h&#432;&#7903;ng v&agrave;
            vi&#7879;c ho&agrave;n l&#7841;i ti&#7873;n cho
            t&ocirc;i/ch&uacute;ng t&ocirc;i ph&#7909; thu&#7897;c v&agrave;o
            s&#7921; x&aacute;c nh&#7853;n c&#7911;a ng&#432;&#7901;i
            h&#432;&#7903;ng.
          </span>
        </p>
        <p className="c29">
          <span className="c3">
            - T&ocirc;i/ch&uacute;ng t&ocirc;i &#273;&#7873; ngh&#7883; NHHT
            (trong kh&#7843; n&#259;ng c&oacute; th&#7875;) h&#7895; tr&#7907;
            trong vi&#7879;c &#273;&#7873; ngh&#7883; ng&#432;&#7901;i
            h&#432;&#7903;ng ch&#7845;p nh&#7853;n ho&agrave;n tr&#7843;
            kho&#7843;n ti&#7873;n chuy&#7875;n nh&#7847;m v&agrave; th&#7921;c
            hi&#7879;n chuy&#7875;n l&#7841;i ti&#7873;n v&agrave;o t&agrave;i
            kho&#7843;n c&#7911;a t&ocirc;i/ch&uacute;ng t&ocirc;i sau khi NHHT
            nh&#7853;n &#273;&#432;&#7907;c &#273;&#7873; ngh&#7883;/x&aacute;c
            nh&#7853;n &#273;&#7891;ng &yacute; c&#7911;a ng&#432;&#7901;i
            h&#432;&#7903;ng v&#7873; vi&#7879;c ho&agrave;n tr&#7843;
            ti&#7873;n.
          </span>
        </p>
        <p className="c29">
          <span className="c3">
            - T&ocirc;i/ch&uacute;ng t&ocirc;i ho&agrave;n to&agrave;n
            ch&#7883;u tr&aacute;ch nhi&#7879;m tr&#432;&#7899;c ph&aacute;p
            lu&#7853;t v&agrave; NHHT v&#7873; y&ecirc;u c&#7847;u n&ecirc;u
            tr&ecirc;n.
          </span>
        </p>
        <table className="c32">
          <tbody>
            <tr className="c21">
              <td className="c6" colSpan="1" rowSpan="1">
                <p className="c11">
                  <span className="c1">
                    Ph&#7847;n d&agrave;nh cho kh&aacute;ch h&agrave;ng
                    c&aacute; nh&acirc;n
                  </span>
                </p>
                <p className="c11">
                  <span className="c3">
                    {formData.document_location}, {formData.document_date}
                  </span>
                </p>
                <p className="c11">
                  <span className="c34">
                    (K&yacute;, ghi r&otilde; h&#7885; t&ecirc;n)
                  </span>
                </p>
                <p className="c8">
                  <span className="c3"></span>
                </p>
                <p className="c8">
                  <span className="c3"></span>
                </p>
                <p className="c8">
                  <span className="c3"></span>
                </p>
                <p className="c8">
                  <span className="c3"></span>
                </p>
              </td>
              <td className="c22" colSpan="2" rowSpan="1">
                <p className="c11">
                  <span className="c1">
                    Ph&#7847;n d&agrave;nh cho kh&aacute;ch h&agrave;ng doanh
                    nghi&#7879;p
                  </span>
                </p>
                <p className="c11">
                  <span className="c3">
                    {formData.document_location}, {formData.document_date}
                  </span>
                </p>
                <p className="c11">
                  <span className="c15 c38">
                    &#272;&#7841;i di&#7879;n Doanh nghi&#7879;p
                  </span>
                </p>
                <p className="c11">
                  <span className="c34">
                    (K&yacute; t&ecirc;n, &#273;&oacute;ng d&#7845;u)
                  </span>
                </p>
                <p className="c11 c26">
                  <span className="c3"></span>
                </p>
                <p className="c10">
                  <span className="c3"></span>
                </p>
                <p className="c10">
                  <span className="c3"></span>
                </p>
                <p className="c10">
                  <span className="c3"></span>
                </p>
                <p className="c10">
                  <span className="c1"></span>
                </p>
              </td>
            </tr>
            <tr className="c17">
              <td className="c24" colSpan="3" rowSpan="1">
                <p className="c33">
                  <span className="c1">
                    Ph&#7847;n d&agrave;nh cho ng&acirc;n h&agrave;ng
                  </span>
                </p>
                <p className="c37">
                  <span className="c15">
                    {formData.document_location}, {formData.document_date}
                  </span>
                </p>
              </td>
            </tr>
            <tr className="c17">
              <td className="c12" colSpan="1" rowSpan="1">
                <p className="c13">
                  <span className="c1">Giao d&#7883;ch vi&ecirc;n</span>
                </p>
                <p className="c10">
                  <span className="c1"></span>
                </p>
                <p className="c10">
                  <span className="c1"></span>
                </p>
                <p className="c10">
                  <span className="c1"></span>
                </p>
                <p className="c10">
                  <span className="c1"></span>
                </p>
                <p className="c10">
                  <span className="c1"></span>
                </p>
                <p className="c10">
                  <span className="c1"></span>
                </p>
                <p className="c10">
                  <span className="c1"></span>
                </p>
              </td>
              <td className="c5" colSpan="1" rowSpan="1">
                <p className="c13">
                  <span className="c1">Ki&#7875;m so&aacute;t</span>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="c26 c30">
          <span className="c3"></span>
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

export default Mau_NHHT;
