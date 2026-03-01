import React, { useState, useRef, useEffect } from "react";
import VirtualKeyboard, {
  processVietnameseInput,
} from "./../VirtualKeyboard";

const Mau_7 = ({ idData, initialFormData, onSubmit, onCancel }) => {
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
    const currentDate = `ngày ${day}/${month}/${year}`;

    return {
      branch_name: "",
      document_location: "Hà Nội",
      document_date: currentDate,
      day: day,
      month: month,
      year: year,
      borrower_name: "",
      lender_address: "",
      lender_cooperative_code: "",
      lender_phone: "",
      lender_fax: "",
      lender_representative: "",
      lender_representative_position: "",
      lender_authorization_number: "",
      lender_authorization_issuer: "",
      lender_authorization_issuer_position: "",
      lender_authorization_issuer_date: "",
      borrower_workplace: "",
      borrower_phone: "",
      borrower_tax_code: "",
      borrower_bank_account_number: "",
      borrower_bank_name: "",
      borrower_bank_account: "",
      hmtc_limit_amount: "",
      hmtc_limit_amount_text: "",
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
      
    .lst-kix_list_1-3 > li:before {
    content: "\u25cf   ";
    }

    .lst-kix_list_1-4 > li:before {
    content: "o  ";
    }

    ul.lst-kix_list_1-0 {
    list-style-type: none;
    }

    .lst-kix_list_1-7 > li:before {
    content: "o  ";
    }

    .lst-kix_list_1-5 > li:before {
    content: "\u25aa   ";
    }

    .lst-kix_list_1-6 > li:before {
    content: "\u25cf   ";
    }

    ul.lst-kix_list_1-3 {
    list-style-type: none;
    }

    .lst-kix_list_1-0 > li:before {
    content: "-  ";
    }

    ul.lst-kix_list_1-4 {
    list-style-type: none;
    }

    .lst-kix_list_1-8 > li:before {
    content: "\u25aa   ";
    }

    ul.lst-kix_list_1-1 {
    list-style-type: none;
    }

    ul.lst-kix_list_1-2 {
    list-style-type: none;
    }

    ul.lst-kix_list_1-7 {
    list-style-type: none;
    }

    .lst-kix_list_1-1 > li:before {
    content: "o  ";
    }

    .lst-kix_list_1-2 > li:before {
    content: "\u25aa   ";
    }

    ul.lst-kix_list_1-8 {
    list-style-type: none;
    }

    ul.lst-kix_list_1-5 {
    list-style-type: none;
    }

    ul.lst-kix_list_1-6 {
    list-style-type: none;
    }

    ol {
    margin: 0;
    padding: 0;
    }

    table td,
    table th {
    padding: 0;
    }

    .c19 {
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
    width: 262.3pt;
    border-top-color: #000000;
    border-bottom-style: solid;
    }

    .c15 {
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
    width: 283.5pt;
    border-top-color: #000000;
    border-bottom-style: solid;
    }

    .c8 {
    color: #000000;
    font-weight: 700;
    text-decoration: none;
    vertical-align: baseline;
    font-size: 10pt;
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

    .c17 {
    color: #000000;
    font-weight: 400;
    text-decoration: none;
    vertical-align: baseline;
    font-size: 12pt;
    font-family: "Times New Roman";
    font-style: normal;
    }

    .c1 {
    color: #000000;
    font-weight: 700;
    text-decoration: none;
    vertical-align: baseline;
    font-size: 11pt;
    font-family: "Times New Roman";
    font-style: normal;
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

    .c20 {
    padding-top: 6pt;
    text-indent: 270pt;
    padding-bottom: 6pt;
    line-height: 1;
    orphans: 2;
    widows: 2;
    text-align: left;
    }

    .c25 {
    color: #000000;
    font-weight: 700;
    text-decoration: none;
    vertical-align: baseline;
    font-size: 10.5pt;
    font-family: "Times New Roman";
    font-style: normal;
    }

    .c3 {
    color: #000000;
    font-weight: 400;
    text-decoration: none;
    vertical-align: baseline;
    font-size: 11pt;
    font-family: "Times New Roman";
    font-style: normal;
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

    .c21 {
    color: #000000;
    font-weight: 400;
    text-decoration: none;
    vertical-align: baseline;
    font-size: 10pt;
    font-family: "Times New Roman";
    font-style: normal;
    }

    .c10 {
    padding-top: 6pt;
    padding-bottom: 6pt;
    line-height: 1;
    orphans: 2;
    widows: 2;
    text-align: left;
    height: 12pt;
    }

    .c4 {
    padding-top: 4pt;
    padding-bottom: 4pt;
    line-height: 1;
    orphans: 2;
    widows: 2;
    text-align: justify;
    }

    .c27 {
    padding-top: 0pt;
    padding-bottom: 0pt;
    line-height: 1;
    orphans: 2;
    widows: 2;
    text-align: right;
    }

    .c14 {
    padding-top: 0pt;
    padding-bottom: 0pt;
    line-height: 1;
    orphans: 2;
    widows: 2;
    text-align: center;
    }

    .c29 {
    padding-top: 6pt;
    padding-bottom: 6pt;
    line-height: 1;
    orphans: 2;
    widows: 2;
    text-align: left;
    }

    .c12 {
    padding-top: 2.4pt;
    padding-bottom: 2.4pt;
    line-height: 1;
    orphans: 2;
    widows: 2;
    text-align: center;
    }

    .c6 {
    padding-top: 6pt;
    padding-bottom: 6pt;
    line-height: 1;
    orphans: 2;
    widows: 2;
    text-align: center;
    }

    .c28 {
    padding-top: 0pt;
    padding-bottom: 0pt;
    line-height: 1;
    orphans: 2;
    widows: 2;
    text-align: left;
    }

    .c13 {
    padding-top: 2.4pt;
    padding-bottom: 2.4pt;
    line-height: 1;
    page-break-after: avoid;
    text-align: center;
    }

    .c24 {
    margin-left: -48.2pt;
    border-spacing: 0;
    border-collapse: collapse;
    margin-right: auto;
    }

    .c5 {
    font-size: 11pt;
    font-weight: 400;
    font-family: "Times New Roman";
    }

    .c18 {
    font-size: 13pt;
    font-weight: 400;
    font-family: "Times New Roman";
    }

    .c7 {
      background-color: #ffffff;
      max-width: 660.7pt;
      margin-top: 3rem;
      padding: 24pt;
      border-radius: 24pt;
      font-family: "Times New Roman";
    }

    .c22 {
    font-size: 11pt;
    font-weight: 700;
    font-family: "Times New Roman";
    }

    .c2 {
    height: 0pt;
    }

    .c16 {
    height: 12pt;
    }

    .c11 {
    font-style: italic;
    }

    .c26 {
    color: #000000;
    }

    .title {
    padding-top: 24pt;
    color: #000000;
    font-weight: 700;
    font-size: 36pt;
    padding-bottom: 6pt;
    font-family: "Times New Roman";
    line-height: 1;
    page-break-after: avoid;
    orphans: 2;
    widows: 2;
    text-align: left;
    }

    .subtitle {
    padding-top: 18pt;
    color: #666666;
    font-size: 24pt;
    padding-bottom: 4pt;
    font-family: "Georgia";
    line-height: 1;
    page-break-after: avoid;
    font-style: italic;
    orphans: 2;
    widows: 2;
    text-align: left;
    }

    li {
    color: #000000;
    font-size: 12pt;
    font-family: "Times New Roman";
    }

    p {
    margin: 0;
    color: #000000;
    font-size: 12pt;
    font-family: "Times New Roman";
    }

    h1 {
    padding-top: 24pt;
    color: #000000;
    font-weight: 700;
    font-size: 24pt;
    padding-bottom: 6pt;
    font-family: "Times New Roman";
    line-height: 1;
    page-break-after: avoid;
    orphans: 2;
    widows: 2;
    text-align: left;
    }

    h2 {
    padding-top: 0pt;
    color: #000000;
    font-weight: 700;
    font-size: 13pt;
    padding-bottom: 0pt;
    font-family: "VNI-Avo";
    line-height: 1;
    page-break-after: avoid;
    text-align: center;
    }

    h3 {
    padding-top: 14pt;
    color: #000000;
    font-weight: 700;
    font-size: 14pt;
    padding-bottom: 4pt;
    font-family: "Times New Roman";
    line-height: 1;
    page-break-after: avoid;
    orphans: 2;
    widows: 2;
    text-align: left;
    }

    h4 {
    padding-top: 12pt;
    color: #000000;
    font-weight: 700;
    font-size: 12pt;
    padding-bottom: 2pt;
    font-family: "Times New Roman";
    line-height: 1;
    page-break-after: avoid;
    orphans: 2;
    widows: 2;
    text-align: left;
    }

    h5 {
    padding-top: 11pt;
    color: #000000;
    font-weight: 700;
    font-size: 11pt;
    padding-bottom: 2pt;
    font-family: "Times New Roman";
    line-height: 1;
    page-break-after: avoid;
    orphans: 2;
    widows: 2;
    text-align: left;
    }

    h6 {
    padding-top: 10pt;
    color: #000000;
    font-weight: 700;
    font-size: 10pt;
    padding-bottom: 2pt;
    font-family: "Times New Roman";
    line-height: 1;
    page-break-after: avoid;
    orphans: 2;
    widows: 2;
    text-align: left;
    }

    @page {
    margin: 15mm 10mm 10mm 15mm;
    /* top, right, bottom, left */
    }

    /* dùng để ngăn bị phân tách nội dung k đều khi ngắt trang */
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
            <span className="c0">M&#7851;u s&#7889; 07/TCCN</span>
          </p>
        </div>
        <p className="c13">
          <span className="c25">
            C&#7896;NG HO&Agrave; X&Atilde; H&#7896;I CH&#7910; NGH&#296;A
            VI&#7878;T NAM
          </span>
        </p>
        <p className="c14">
          <span className="c25">
            &#272;&#7897;c l&#7853;p &ndash; T&#7921; do &ndash; H&#7841;nh
            ph&uacute;c
          </span>
        </p>
        <p className="c28" style={{ textAlign: "center" }}>
          <span
            style={{
              overflow: "hidden",
              display: "inline-block",
              margin: "0px 0px",
              border: "1px solid #000000",
              transform: "rotate(0rad) translateZ(0px)",
              WebkitTransform: "rotate(0rad) translateZ(0px)",
              width: "124px",
              height: "1.33px",
            }}
          >
            <img
              alt=""
              src="https://lh3.googleusercontent.com/fife/ALs6j_Egzj__am4C2zFNUv8BzCFckNeu9evuOchjlq7AA6VeBL3sspaSX5hfyRVI47Vr4ShNLBPumkbMu_3Poj2i4JKNcGdZG73qEOep7KdX3UVXQd9F5NRia0VaJweJWIMi_6tqRIOAtqsGJeAtQdpnyhab7Enid8Hk9SSVocFo1ejdfgQ7Eh3VEPis9cCV7Bi9j25HgOkdXbaVuHEE2BMeb1gxHKk-0lLntiQioxbuVwxGdSq7KexQ5Z5BQ2kalVHOGD37oFhWeMDIwjYsLyAeHDOsmBG39nBSnUS80vUJnOn0DBm-xuRp_sDknfWXwOlmmFdyrYnC-BIJYWE1jWd77iNLrVB2TGFBQ8nfDmhXvrbVi1egv6SLS8UneZp4urW9iFQjXh4_xh57KzfSI6s64EQHpSlvAjQAbH5uha_vkuwY6w5FDv5qzIrgf5BmmIMyOqBV83QF1bM8TgHf7HZcwiY_1nTSaaKETWh9XJFwq_tuvwe0F_UV7FwFgvZulkpiuQTeybPPTrmyVaYVct-1GA-bM0QWU0lFiQGGYsiHMAm6k2A3bIeM18UETvZb26GTYfXBWHhWdLuVremp3BR3qWlwHtTtKyz8FCkfpYhgGMvs9wmAKH8P7UIOAJ7KZD29DV_5CoiZZ3XpOcUgA1eV9_QHs237JBmvcHaZALCT_IGHl7Wm0uUoTx07lXZu_6fS48Jh-RrpSDDkgI2fSeIslcfwfDxvvCNv4eKNJIoaarMYJdhaXPAiNMQznzFur78442YZvli2FmOH3MFKCZdin4SXRLihUrLXNH-2lALKxGZeLGAJLe_Sjf-A7ANH1KtEG_Q4LSPZfUQVWWVY9PjnsuQ__P2rTuKwDSijllCy6qb9EtlvCG7MFQqehuYFs-0G2pYuhf0OTUAxQyg5olPAVxmiGM8HK1nNaR_WGFBK5Dh756rxoXonX8HuPXF5EVb9e8nX92B9zoJ2vLzVsy_TjeQ-TW1zqPRST5_p5gTQuYCgcbYWi7asV6KEYqmAqGogrpthbCKW_Fnu9mSRv8sDaIxCzaxpIDd5N_RNxvIHcoOcvqj946qE9AveFhFt7X_Wxtm9ocIimkkiWq9_qdlcpLCe6m5XKhjYsZj1k4fUdr-kGItIDiQuwjIbaQlVk9-XpxzfYrGmyqnpr-4y9T_K5BLMawVK7GLObEZACuy9t-GjRHW-BcI-drE_mbUxqwBhoD9Th-_tF5rrQr4E_uErA8RhGgUJ1RnaL6_frso7Q7Py8VU2CEoHk8hGGiTo0PQUhwlVlHPdkgFy6Ij_OPUinRkqSLNSmt0zYqF9g8f5Zz5r5KbqB-pFJFtxau9YGDoUf55LigFd-lcFNnu5sdzVnBlZzkhycayuOX553RoVYv3okpjYAKGiRwyBkZ8GhKOtAaMA-favzHI6BR_cHMkOPbLrz_g7DgmVAoye0Qxa5grDRcoH1LpcAEBorndIzu957CLcO3DghME8jNe-JTuejsLr4xI1Ui2pWy_8mi5csSjnov7oc7zfMotQr5defgFSyjwPRLzfjrM9QPNdscr6GWqwKTsKdJNJqcg_FpMIZ59ZvcU-rXmpDAMx0bfsjF76pn71Pu6Jjx9KS8a0HLSfCuJdgKNUaqOmJcMbpyaH66x7-kXrz0goZwEz9jWiCWaWW_CqLSx3FEy4lA=w1105-h889?auditContext=forDisplay"
              style={{
                width: "124px",
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
        <p className="c13">
          <span className="c23">
            PH&#7908; L&#7908;C H&#7906;P &#272;&#7890;NG CHO VAY THEO H&#7840;N
            M&#7912;C TH&#7844;U CHI
          </span>
        </p>
        <p className="c12">
          <span className="c1">
            &nbsp;(Thu&#7897;c H&#7907;p &#273;&#7891;ng cho vay theo h&#7841;n
            m&#7913;c th&#7845;u chi {formData.document_date})
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            C&#259;n c&#7913; H&#7907;p &#273;&#7891;ng cho vay theo h&#7841;n
            m&#7913;c th&#7845;u chi k&yacute; {formData.document_date}{" "}
            gi&#7919;a Ng&acirc;n h&agrave;ng H&#7907;p t&aacute;c x&atilde;
            Vi&#7879;t Nam v&agrave; &Ocirc;ng/B&agrave;
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "180pt" }}
              type="text"
              name="borrower_name"
              id="borrower_name"
              value={formData.borrower_name || ""}
              onChange={(e) => handleChange("borrower_name", e.target.value)}
              onFocus={(e) => handleInputFocus("borrower_name", e.target)}
            />
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            H&ocirc;m nay, ngày {formData.day} tháng {formData.month} năm{" "}
            {formData.year}, t&#7841;i Ng&acirc;n h&agrave;ng H&#7907;p
            t&aacute;c x&atilde; Vi&#7879;t Nam Chi nh&aacute;nh{" "}
            {formData.branch_name}, ch&uacute;ng t&ocirc;i g&#7891;m c&oacute;:
          </span>
        </p>
        <p className="c4">
          <span className="c1">B&Ecirc;N CHO VAY (B&ecirc;n A):</span>
          <span className="c3">&nbsp;</span>
          <span className="c1">
            Ng&acirc;n h&agrave;ng H&#7907;p t&aacute;c x&atilde; Vi&#7879;t Nam
            (NHHTX) Chi nh&aacute;nh
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "180pt" }}
              type="text"
              name="branch_name"
              id="branch_name"
              value={formData.branch_name || ""}
              onChange={(e) => handleChange("branch_name", e.target.value)}
              onFocus={(e) => handleInputFocus("branch_name", e.target)}
            />
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            - &#272;&#7883;a ch&#7881;:
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "89%" }}
              type="text"
              name="lender_address"
              id="lender_address"
              value={formData.lender_address || ""}
              onChange={(e) => handleChange("lender_address", e.target.value)}
              onFocus={(e) => handleInputFocus("lender_address", e.target)}
            />
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            - M&atilde; s&#7889; h&#7907;p t&aacute;c x&atilde;:
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "82%" }}
              type="text"
              name="lender_cooperative_code"
              id="lender_cooperative_code"
              value={formData.lender_cooperative_code || ""}
              onChange={(e) =>
                handleChange("lender_cooperative_code", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("lender_cooperative_code", e.target)
              }
            />
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            - &#272;i&#7879;n tho&#7841;i:
            <input
              className="form_control"
              style={{ marginLeft: "4pt", marginRight: "28pt", width: "240pt" }}
              type="text"
              name="lender_phone"
              id="lender_phone"
              value={formData.lender_phone || ""}
              onChange={(e) => handleChange("lender_phone", e.target.value)}
              onFocus={(e) => handleInputFocus("lender_phone", e.target)}
            />{" "}
            Fax:
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "240pt" }}
              type="text"
              name="lender_fax"
              id="lender_fax"
              value={formData.lender_fax || ""}
              onChange={(e) => handleChange("lender_fax", e.target.value)}
              onFocus={(e) => handleInputFocus("lender_fax", e.target)}
            />
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            - Ng&#432;&#7901;i &#273;&#7841;i di&#7879;n &Ocirc;ng (B&agrave;) :
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "180pt" }}
              type="text"
              name="lender_representative"
              id="lender_representative"
              value={formData.lender_representative || ""}
              onChange={(e) =>
                handleChange("lender_representative", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("lender_representative", e.target)
              }
            />
            Ch&#7913;c v&#7909;
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "240pt" }}
              type="text"
              name="lender_representative_position"
              id="lender_representative_position"
              value={formData.lender_representative_position || ""}
              onChange={(e) =>
                handleChange("lender_representative_position", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("lender_representative_position", e.target)
              }
            />
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            - Gi&#7845;y u&#7927; quy&#7873;n s&#7889;:
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "70pt" }}
              type="text" // dùng text thay number để tránh arrow lên/xuống và dễ validate
              inputMode="numeric" // bàn phím số trên mobile
              pattern="[0-9]*" // chỉ cho phép số
              name="lender_authorization_number"
              id="lender_authorization_number"
              value={formData.lender_authorization_number || ""}
              onChange={(e) =>
                handleChange("lender_authorization_number", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("lender_authorization_number", e.target)
              }
            />
            do &Ocirc;ng (B&agrave;)
            <input
              className="form_control"
              style={{
                marginLeft: "4pt",
                marginRight: "120pt",
                width: "260pt",
              }}
              type="text"
              name="lender_authorization_issuer"
              id="lender_authorization_issuer"
              value={formData.lender_authorization_issuer || ""}
              onChange={(e) =>
                handleChange("lender_authorization_issuer", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("lender_authorization_issuer", e.target)
              }
            />
            Ch&#7913;c v&#7909;
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "240pt" }}
              type="text"
              name="lender_authorization_issuer_position"
              id="lender_authorization_issuer_position"
              value={formData.lender_authorization_issuer_position || ""}
              onChange={(e) =>
                handleChange(
                  "lender_authorization_issuer_position",
                  e.target.value
                )
              }
              onFocus={(e) =>
                handleInputFocus(
                  "lender_authorization_issuer_position",
                  e.target
                )
              }
            />
            k&yacute; ng&agrave;y
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="date"
              name="lender_authorization_issuer_date"
              id="lender_authorization_issuer_date"
              value={formData.lender_authorization_issuer_date || ""}
              onChange={(e) =>
                handleChange("lender_authorization_issuer_date", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("lender_authorization_issuer_date", e.target)
              }
            />
            (tr&#432;&#7901;ng h&#7907;p &#273;&#432;&#7907;c &#7911;y
            quy&#7873;n)
          </span>
        </p>
        <p className="c4">
          <span className="c1">BÊN ĐI VAY (BÊN B):</span>
        </p>
        <p className="c4">
          <span className="c3">
            {" "}
            - Tên khách hàng vay vốn: {idData.full_name} - Năm sinh:{" "}
            {idData.date_of_birth}
          </span>
        </p>
        <p className="c4">
          <span className="c3">- Địa chỉ: {idData.place_of_residence}</span>
        </p>
        <p className="c4">
          <span className="c3">
            {" "}
            - Hiện đang công tác tại:
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "78%" }}
              type="text"
              name="borrower_workplace"
              id="borrower_workplace"
              value={formData.borrower_workplace || ""}
              onChange={(e) =>
                handleChange("borrower_workplace", e.target.value)
              }
              onFocus={(e) => handleInputFocus("borrower_workplace", e.target)}
            />
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            {" "}
            - Điện thoại:
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "160pt" }}
              type="tel"
              name="borrower_phone"
              id="borrower_phone"
              value={formData.borrower_phone || ""}
              onChange={(e) => handleChange("borrower_phone", e.target.value)}
              onFocus={(e) => handleInputFocus("borrower_phone", e.target)}
            />
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            - CCCD/Hộ chiếu/CMND số: {idData.eid_number} do:{" "}
            {idData.place_of_issue} cấp ngày: {idData.date_of_issue}
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            {" "}
            - M&atilde; s&#7889; thu&#7871; c&#7911;a kh&aacute;ch h&agrave;ng
            (n&#7871;u c&oacute;):
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "240pt" }}
              type="text"
              name="borrower_tax_code"
              id="borrower_tax_code"
              value={formData.borrower_tax_code || ""}
              onChange={(e) =>
                handleChange("borrower_tax_code", e.target.value)
              }
              onFocus={(e) => handleInputFocus("borrower_tax_code", e.target)}
            />
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            {" "}
            - T&agrave;i kho&#7843;n ng&acirc;n h&agrave;ng (VND, USD&hellip;)
            s&#7889;:
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "200pt" }}
              type="text"
              name="borrower_bank_account_number"
              id="borrower_bank_account_number"
              value={formData.borrower_bank_account_number || ""}
              onChange={(e) =>
                handleChange("borrower_bank_account_number", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("borrower_bank_account_number", e.target)
              }
            />{" "}
            t&#7841;i ng&acirc;n h&agrave;ng:
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "140pt" }}
              type="text"
              name="borrower_bank_name"
              id="borrower_bank_name"
              value={formData.borrower_bank_name || ""}
              onChange={(e) =>
                handleChange("borrower_bank_name", e.target.value)
              }
              onFocus={(e) => handleInputFocus("borrower_bank_name", e.target)}
            />
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            {" "}
            - T&agrave;i kho&#7843;n Ng&acirc;n h&agrave;ng:
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "240pt" }}
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
          </span>
        </p>
        <p className="c4">
          <span className="c3">
            Sau khi th&#7843;o lu&#7853;n, hai b&ecirc;n th&#7887;a thu&#7853;n
            k&yacute; Ph&#7909; l&#7909;c H&#7907;p &#273;&#7891;ng cho vay theo
            h&#7841;n m&#7913;c th&#7845;u chi &nbsp;theo c&aacute;c
            &#273;i&#7873;u kho&#7843;n sau:
          </span>
        </p>
        <p className="c4">
          <span className="c22">&#272;i&ecirc;&#768;u 1. </span>
          <span className="c5">
            S&#7917;a &#273;&#7893;i, b&#7893; sung kho&#7843;n 1
            &#272;i&#7873;u 2 c&#7911;a H&#7907;p &#273;&#7891;ng cho vay theo
            h&#7841;n m&#7913;c th&#7845;u chi k&yacute;{" "}
            {formData.document_date}
          </span>
          <span className="c5 c26">
            {" "}
            gi&#7919;a NHHTX - Chi nh&aacute;nh {formData.branch_name}
          </span>
          <span className="c3">
            {" "}
            v&agrave; &Ocirc;ng/B&agrave; {formData.borrower_name} nh&#432;
            sau&nbsp;:
          </span>
        </p>
        <p className="c4">
          <span className="c18">&ldquo;</span>
          <span className="c5">
            &nbsp;1. B&ecirc;n B &#273;&#7873; ngh&#7883; B&ecirc;n A ch&#7845;p
            thu&#7853;n cho B&ecirc;n B vay theo h&#7841;n m&#7913;c th&#7845;u
            chi tr&ecirc;n t&agrave;i kho&#7843;n thanh to&aacute;n l&agrave;:
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "240pt" }}
              type="text"
              name="hmtc_limit_amount"
              id="hmtc_limit_amount"
              value={formData.hmtc_limit_amount || ""}
              onChange={(e) =>
                handleChange("hmtc_limit_amount", e.target.value)
              }
              onFocus={(e) => handleInputFocus("hmtc_limit_amount", e.target)}
            />
            VND{" "}
          </span>
          <span className="c5 c11">
            (B&#7857;ng ch&#7919;&nbsp;:
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "240pt" }}
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
            )
          </span>
          <span className="c18 c11">&rdquo;</span>
          <span className="c0">.</span>
        </p>
        <p className="c4">
          <span className="c0">
            (S&#7917;a &#273;&#7893;i, b&#7893; sung &#272;i&#7873;u Kho&#7843;n
            n&agrave;o c&#7911;a H&#7907;p &#273;&#7891;ng cho vay theo
            h&#7841;n m&#7913;c th&#7845;u chi, C&aacute;n b&#7897; ch&#7885;n
            s&#7917;a &#273;&#7893;i, b&#7893; sung t&#7841;i &#272;i&#7873;u 1
            c&#7911;a Ph&#7909; l&#7909;c H&#7907;p &#273;&#7891;ng cho vay theo
            h&#7841;n m&#7913;c th&#7845;u chi n&agrave;y.)
          </span>
        </p>
        <p className="c4" id="h.1tgx361ttuh0">
          <span className="c1">&#272;i&#7873;u 2.</span>
          <span className="c3">
            &nbsp;C&aacute;c n&#7897;i dung kh&aacute;c c&#7911;a H&#7907;p
            &#273;&#7891;ng cho vay theo h&#7841;n m&#7913;c th&#7845;u chi{" "}
            {formData.document_date} &#273;&#432;&#7907;c k&yacute; gi&#7919;a
            NHHTX - Chi nh&aacute;nh {formData.branch_name} v&agrave; B&ecirc;n
            B v&#7851;n gi&#7919; nguy&ecirc;n gi&aacute; tr&#7883; hi&#7879;u
            l&#7921;c.
          </span>
        </p>
        <p className="c4">
          <span className="c1">&#272;i&#7873;u 3</span>
          <span className="c3">
            . Ph&#7909; l&#7909;c n&agrave;y c&oacute; hi&#7879;u l&#7921;c
            t&#7915; ng&agrave;y k&yacute; v&agrave; l&agrave; m&#7897;t
            ph&#7847;n kh&ocirc;ng th&#7875; t&aacute;ch r&#7901;i c&#7911;a
            H&#7907;p &#273;&#7891;ng cho vay theo h&#7841;n m&#7913;c
            th&#7845;u chi {formData.document_date} &#273;&#432;&#7907;c
            k&yacute; gi&#7919;a NHHTX - Chi nh&aacute;nh {formData.branch_name}{" "}
            v&agrave; B&ecirc;n B.
          </span>
        </p>
        <p className="c29">
          <span className="c3">
            Ph&#7909; l&#7909;c n&agrave;y &#273;&#432;&#7907;c l&#7853;p
            th&agrave;nh hai (02) b&#7843;n c&oacute; gi&aacute; tr&#7883;
            ph&aacute;p l&yacute; nh&#432; nhau. B&ecirc;n B gi&#7919; 01
            (m&#7897;t) b&#7843;n, Ng&acirc;n h&agrave;ng H&#7907;p t&aacute;c
            chi nh&aacute;nh {formData.branch_name} gi&#7919; 01 (m&#7897;t)
            b&#7843;n &#273;&#7875; th&#7921;c hi&#7879;n.&nbsp;
          </span>
        </p>
        <table className="c24" style={{ width: "100%" }}>
          <tbody>
            <tr className="c2">
              <td className="c15" colSpan="1" rowSpan="1">
                <p className="c6">
                  <span className="c8">
                    &#272;&#7840;I DI&#7878;N B&Ecirc;N A
                  </span>
                </p>
                <p className="c6">
                  <span className="c8">
                    (K&yacute;, ghi r&otilde; h&#7885; t&ecirc;n,
                    &#273;&oacute;ng d&#7845;u)
                  </span>
                </p>
              </td>
              <td
                className="c19"
                colSpan="1"
                rowSpan="1"
                style={{ paddingLeft: "98pt" }}
              >
                <p className="c6">
                  <span className="c8">
                    &#272;&#7840;I DI&#7878;N B&Ecirc;N B
                  </span>
                </p>
                <p className="c6">
                  <span className="c8">
                    (K&yacute;, ghi r&otilde; h&#7885; t&ecirc;n)
                  </span>
                </p>
                <p className="c10">
                  <span className="c3"></span>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
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

export default Mau_7;
