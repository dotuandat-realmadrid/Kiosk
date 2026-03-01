import React, { useState, useRef, useEffect } from "react";
import VirtualKeyboard, {
  processVietnameseInput,
} from "./../VirtualKeyboard";

const Mau_1 = ({ idData, initialFormData, onSubmit, onCancel }) => {
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
    const currentDate = `${day}/${month}/${year}`;

    return {
      document_location: "",
      gender: "",
      branch_name: "",
      hskh_number: "",
      resident_status: "",
      id_type: "",
      id_type_other: "",
      current_address: "",
      phone: "",
      email: "",
      tax_code: "",
      occupation: "",
      position: "",
      workplace: "",
      representative_full_name: "",
      representative_gender: "",
      representative_date_of_birth: "",
      representative_nation: "",
      representative_resident_status: "",
      representative_id_type: "",
      representative_id_type_other: "",
      representative_nation_no: "",
      representative_date_of_issue: "",
      representative_expired_date: "",
      representative_place_of_issue: "",
      representative_address: "",
      representative_current_address: "",
      representative_phone: "",
      representative_email: "",
      representative_tax_code: "",
      representative_occupation: "",
      representative_position: "",
      representative_workplace: "",
      currency_type: "",
      currency_type_other: "",
      mobile_banking_register: "",
      mobile_banking_package: "",
      mobile_banking_fee_account: "",
      password_method: "",
      sms_banking_register: "",
      sms_banking_fee_account: "",
      sms_services: ["Tin nhắn Thanh toán (Mặc định)"],
      debit_card_register: "",
      main_card_print_name: "",
      main_card_linked_account: "",
      fee_payment_method: "",
      sub_card1_full_name: "",
      sub_card1_relationship: "",
      sub_card1_date_of_birth: "",
      sub_card1_gender: "",
      sub_card1_id_type: "",
      sub_card1_id_type_other: "",
      sub_card1_id_number: "",
      sub_card1_id_issue_date: "",
      sub_card1_id_issue_place: "",
      sub_card1_id_expire_date: "",
      sub_card1_contact_address: "",
      sub_card1_email: "",
      sub_card1_phone: "",
      sub_card1_print_name: "",
      sub_card2_full_name: "",
      sub_card2_relationship: "",
      sub_card2_date_of_birth: "",
      sub_card2_gender: "",
      sub_card2_id_type: "",
      sub_card2_id_type_other: "",
      sub_card2_id_number: "",
      sub_card2_id_issue_date: "",
      sub_card2_id_issue_place: "",
      sub_card2_id_expire_date: "",
      sub_card2_contact_address: "",
      sub_card2_email: "",
      sub_card2_phone: "",
      sub_card2_print_name: "",
      sub_card3_full_name: "",
      sub_card3_relationship: "",
      sub_card3_date_of_birth: "",
      sub_card3_gender: "",
      sub_card3_id_type: "",
      sub_card3_id_type_other: "",
      sub_card3_id_number: "",
      sub_card3_id_issue_date: "",
      sub_card3_id_issue_place: "",
      sub_card3_id_expire_date: "",
      sub_card3_contact_address: "",
      sub_card3_email: "",
      sub_card3_phone: "",
      sub_card3_print_name: "",
      alias_type: "",
      alias_account: "",
      linked_payment_account: "",
      qtdnd: "",
      bank_account_number: "",
      account_open_date: "",
      card_number: "",
      document_date: currentDate,
    };
  };

  useEffect(() => {
    setFormData(initializeFormData());
  }, []);

  // ===== HANDLE CHANGE =====
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    const representative_date_of_birth =
      processed.representative_date_of_birth || "";
    if (representative_date_of_birth) {
      const parts = representative_date_of_birth.split("-");
      processed.representative_date_of_birth = `${parts[2] || ".."}/${
        parts[1] || ".."
      }/${parts[0] || "...."}`;
    } else {
      processed.representative_date_of_birth = "../../....";
    }

    const representative_date_of_issue =
      processed.representative_date_of_issue || "";
    if (representative_date_of_issue) {
      const parts = representative_date_of_issue.split("-");
      processed.representative_date_of_issue = `${parts[2] || ".."}/${
        parts[1] || ".."
      }/${parts[0] || "...."}`;
    } else {
      processed.representative_date_of_issue = "../../....";
    }

    const representative_expired_date =
      processed.representative_expired_date || "";
    if (representative_expired_date) {
      const parts = representative_expired_date.split("-");
      processed.representative_expired_date = `${parts[2] || ".."}/${
        parts[1] || ".."
      }/${parts[0] || "...."}`;
    } else {
      processed.representative_expired_date = "../../....";
    }

    const sub_card1_date_of_birth = processed.sub_card1_date_of_birth || "";
    if (sub_card1_date_of_birth) {
      const parts = sub_card1_date_of_birth.split("-");
      processed.sub_card1_date_of_birth = `${parts[2] || ".."}/${
        parts[1] || ".."
      }/${parts[0] || "...."}`;
    } else {
      processed.sub_card1_date_of_birth = "../../....";
    }

    const sub_card1_id_issue_date = processed.sub_card1_id_issue_date || "";
    if (sub_card1_id_issue_date) {
      const parts = sub_card1_id_issue_date.split("-");
      processed.sub_card1_id_issue_date = `${parts[2] || ".."}/${
        parts[1] || ".."
      }/${parts[0] || "...."}`;
    } else {
      processed.sub_card1_id_issue_date = "../../....";
    }

    const sub_card1_id_expire_date = processed.sub_card1_id_expire_date || "";
    if (sub_card1_id_expire_date) {
      const parts = sub_card1_id_expire_date.split("-");
      processed.sub_card1_id_expire_date = `${parts[2] || ".."}/${
        parts[1] || ".."
      }/${parts[0] || "...."}`;
    } else {
      processed.sub_card1_id_expire_date = "../../....";
    }

    const sub_card2_id_issue_date = processed.sub_card2_id_issue_date || "";
    if (sub_card2_id_issue_date) {
      const parts = sub_card2_id_issue_date.split("-");
      processed.sub_card2_id_issue_date = `${parts[2] || ".."}/${
        parts[1] || ".."
      }/${parts[0] || "...."}`;
    } else {
      processed.sub_card2_id_issue_date = "../../....";
    }

    const sub_card2_id_expire_date = processed.sub_card2_id_expire_date || "";
    if (sub_card2_id_expire_date) {
      const parts = sub_card2_id_expire_date.split("-");
      processed.sub_card2_id_expire_date = `${parts[2] || ".."}/${
        parts[1] || ".."
      }/${parts[0] || "...."}`;
    } else {
      processed.sub_card2_id_expire_date = "../../....";
    }

    const sub_card3_date_of_birth = processed.sub_card3_date_of_birth || "";
    if (sub_card3_date_of_birth) {
      const parts = sub_card3_date_of_birth.split("-");
      processed.sub_card3_date_of_birth = `${parts[2] || ".."}/${
        parts[1] || ".."
      }/${parts[0] || "...."}`;
    } else {
      processed.sub_card3_date_of_birth = "../../....";
    }

    const sub_card3_id_issue_date = processed.sub_card3_id_issue_date || "";
    if (sub_card3_id_issue_date) {
      const parts = sub_card3_id_issue_date.split("-");
      processed.sub_card3_id_issue_date = `${parts[2] || ".."}/${
        parts[1] || ".."
      }/${parts[0] || "...."}`;
    } else {
      processed.sub_card3_id_issue_date = "../../....";
    }

    const sub_card3_id_expire_date = processed.sub_card3_id_expire_date || "";
    if (sub_card3_id_expire_date) {
      const parts = sub_card3_id_expire_date.split("-");
      processed.sub_card3_id_expire_date = `${parts[2] || ".."}/${
        parts[1] || ".."
      }/${parts[0] || "...."}`;
    } else {
      processed.sub_card3_id_expire_date = "../../....";
    }

    const account_open_date = processed.account_open_date || "";
    if (account_open_date) {
      const parts = account_open_date.split("-");
      processed.account_open_date = `${parts[2] || ".."}/${parts[1] || ".."}/${
        parts[0] || "...."
      }`;
    } else {
      processed.account_open_date = "../../....";
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
    * {
      margin: 0;
      padding: 0;
      text-indent: 0;
      font-family: "Times New Roman";
    }
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
    .c7 {
      background-color: #ffffff;
      max-width: 951.4pt;
      margin-top: 3rem;
      padding: 24pt;
      border-radius: 24pt;
      font-family: "Times New Roman";
    }
    .s1 {
        color: #0069AF;
        font-family: "Times New Roman", serif;
        font-style: italic;
        font-weight: normal;
        text-decoration: none;
        font-size: 9pt;
    }

    .s2 {
        color: #0069AF;
        font-family: "Times New Roman", serif;
        font-style: normal;
        font-weight: bold;
        text-decoration: none;
        font-size: 11pt;
    }

    .s3 {
        color: #0069AF;
        font-family: "Times New Roman", serif;
        font-style: italic;
        font-weight: normal;
        text-decoration: none;
        font-size: 11pt;
    }

    .s4 {
        color: #0069AF;
        font-family: "Times New Roman", serif;
        font-style: italic;
        font-weight: normal;
        text-decoration: none;
        font-size: 7pt;
    }

    .s5 {
        color: #17365D;
        font-family: "Times New Roman", serif;
        font-style: normal;
        font-weight: bold;
        text-decoration: none;
        font-size: 11pt;
    }

    .s6 {
        color: #17365D;
        font-family: "Times New Roman", serif;
        font-style: normal;
        font-weight: normal;
        text-decoration: none;
        font-size: 8pt;
    }

    .h1,
    h1 {
        color: black;
        font-family: "Times New Roman", serif;
        font-style: normal;
        font-weight: bold;
        text-decoration: none;
        font-size: 11pt;
    }

    .s7 {
        color: black;
        font-family: "Times New Roman", serif;
        font-style: normal;
        font-weight: normal;
        text-decoration: none;
        font-size: 11pt;
    }

    .s8 {
        color: black;
        font-family: "Times New Roman", serif;
        font-style: italic;
        font-weight: normal;
        text-decoration: none;
        font-size: 11pt;
    }

    .p,
    p {
        color: black;
        font-family: "Times New Roman", serif;
        font-style: normal;
        font-weight: normal;
        text-decoration: none;
        font-size: 10pt;
        margin: 0pt;
    }

    .s9 {
        color: black;
        font-family: "Segoe UI Symbol", sans-serif;
        font-style: normal;
        font-weight: normal;
        text-decoration: none;
        font-size: 11pt;
    }

    .s10 {
        color: black;
        font-family: "Times New Roman", serif;
        font-style: italic;
        font-weight: normal;
        text-decoration: none;
        font-size: 8pt;
    }

    .s11 {
        color: black;
        font-family: "Times New Roman", serif;
        font-style: normal;
        font-weight: bold;
        text-decoration: none;
        font-size: 11pt;
    }

    .s12 {
        color: black;
        font-family: "Times New Roman", serif;
        font-style: normal;
        font-weight: normal;
        text-decoration: none;
        font-size: 9pt;
    }

    .s13 {
        color: black;
        font-family: Wingdings;
        font-style: normal;
        font-weight: normal;
        text-decoration: none;
        font-size: 11pt;
    }

    li {
        display: block;
    }

    #l1 {
        padding-left: 0pt;
    }

    #l1>li>*:first-child:before {
        content: "- ";
        color: black;
        font-family: "Times New Roman", serif;
        font-style: normal;
        font-weight: normal;
        text-decoration: none;
    }

    li {
        display: block;
    }

    #l2 {
        padding-left: 0pt;
        counter-reset: d1 1;
    }

    #l2>li>*:first-child:before {
        counter-increment: d1;
        content: counter(d1, decimal)". ";
        color: black;
        font-family: "Times New Roman", serif;
        font-style: normal;
        font-weight: bold;
        text-decoration: none;
        font-size: 11pt;
    }

    #l2>li:first-child>*:first-child:before {
        counter-increment: d1 0;
    }

    li {
        display: block;
    }

    #l3 {
        padding-left: 0pt;
        counter-reset: e1 1;
    }

    #l3>li>*:first-child:before {
        counter-increment: e1;
        content: counter(e1, decimal)". ";
        color: black;
        font-family: "Times New Roman", serif;
        font-style: normal;
        font-weight: bold;
        text-decoration: none;
        font-size: 11pt;
    }

    #l3>li:first-child>*:first-child:before {
        counter-increment: e1 0;
    }

    li {
        display: block;
    }

    #l4 {
        padding-left: 0pt;
        counter-reset: f1 1;
    }

    #l4>li>*:first-child:before {
        counter-increment: f1;
        content: counter(f1, decimal)". ";
        color: black;
        font-family: "Times New Roman", serif;
        font-style: normal;
        font-weight: bold;
        text-decoration: none;
        font-size: 11pt;
    }

    #l4>li:first-child>*:first-child:before {
        counter-increment: f1 0;
    }

    #l5 {
        padding-left: 0pt;
    }

    #l5>li>*:first-child:before {
        content: "☐ ";
        color: black;
        font-family: "Segoe UI Symbol", sans-serif;
        font-style: normal;
        font-weight: normal;
        text-decoration: none;
        font-size: 11pt;
    }

    li {
        display: block;
    }

    #l6 {
        padding-left: 0pt;
        counter-reset: g1 1;
    }

    #l6>li>*:first-child:before {
        counter-increment: g1;
        content: counter(g1, decimal)". ";
        color: black;
        font-family: "Times New Roman", serif;
        font-style: normal;
        font-weight: bold;
        text-decoration: none;
        font-size: 11pt;
    }

    #l6>li:first-child>*:first-child:before {
        counter-increment: g1 0;
    }

    li {
        display: block;
    }

    #l7 {
        padding-left: 0pt;
        counter-reset: h1 1;
    }

    #l7>li>*:first-child:before {
        counter-increment: h1;
        content: counter(h1, decimal)". ";
        color: black;
        font-family: "Times New Roman", serif;
        font-style: normal;
        font-weight: bold;
        text-decoration: none;
        font-size: 11pt;
    }

    #l7>li:first-child>*:first-child:before {
        counter-increment: h1 0;
    }

    #l8 {
        padding-left: 0pt;
        counter-reset: h2 1;
    }

    #l8>li>*:first-child:before {
        counter-increment: h2;
        content: counter(h2, decimal)". ";
        color: black;
        font-family: "Times New Roman", serif;
        font-style: normal;
        font-weight: bold;
        text-decoration: none;
        font-size: 11pt;
    }

    #l8>li:first-child>*:first-child:before {
        counter-increment: h2 0;
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
      <div className="c7 doc-content">
        <style>{customStyles}</style>
        <div style={{ display: "flex", gap: "43px" }}>
          <table border="0" cellSpacing="0" cellPadding="0">
            <tbody>
              <tr>
                <td>
                  <img
                    width="165"
                    height="39"
                    src="data:image/png;base64,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"
                    alt=""
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div>
            <p
              className="s1"
              style={{
                paddingTop: "4pt",
                textIndent: "0pt",
                textAlign: "right",
              }}
            >
              Mẫu 01/CN-NHHT
            </p>
            <p
              className="s2"
              style={{
                paddingTop: "7pt",
                textIndent: "0pt",
                textAlign: "center",
              }}
            >
              THỎA THUẬN MỞ HỒ SƠ THÔNG TIN KHÁCH HÀNG, TÀI KHOẢN THANH TOÁN VÀ
              ĐĂNG KÝ SỬ DỤNG DỊCH VỤ NGÂN HÀNG
            </p>
            <p
              className="s3"
              style={{ textIndent: "0pt", textAlign: "center" }}
            >
              (Dành cho khách hàng cá nhân)
              <br />
              Ngày{" "}
              <span style={{ paddingRight: "8pt" }}>
                {" "}
                {formData.document_date}
              </span>
              Số HSKH:{" "}
              <span>
                <input
                  className="form_control"
                  type="text" // dùng text thay number để tránh arrow lên/xuống và dễ validate
                  inputMode="numeric" // bàn phím số trên mobile
                  pattern="[0-9]*" // chỉ cho phép số
                  name="hskh_number"
                  id="hskh_number"
                  style={{ width: "50pt", fontStyle: "italic" }}
                  value={formData.hskh_number || ""}
                  onChange={(e) =>
                    handleChange(
                      "hskh_number",
                      e.target.value.replace(/[^0-9]/g, "")
                    )
                  }
                  onFocus={(e) => handleInputFocus("hskh_number", e.target)}
                />
              </span>
            </p>
          </div>
        </div>

        <p
          className="s5"
          style={{
            paddingTop: "6pt",
            paddingLeft: "25pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Kính gửi: Ngân hàng Hợp tác xã Việt Nam (Co-opBank) Chi nhánh{" "}
          <span style={{ fontWeight: "bold" }}>
            {/* {{BRANCH_NAME}} */}
            <input
              className="form_control"
              type="text"
              name="branch_name"
              id="branch_name"
              value={formData.branch_name || ""}
              onChange={(e) => handleChange("branch_name", e.target.value)}
              onFocus={(e) => handleInputFocus("branch_name", e.target)}
            />
          </span>
        </p>

        <p style={{ paddingTop: "7pt", textIndent: "0pt", textAlign: "left" }}>
          <br />
        </p>

        <div style={{ border: "1px solid black", padding: "11pt 11pt 11pt 0" }}>
          <h1
            style={{
              paddingLeft: "11pt",
              textIndent: "0pt",
              textAlign: "left",
            }}
          >
            THÔNG TIN CHI TIẾT KHÁCH HÀNG
          </h1>

          <p
            className="s7"
            style={{
              paddingTop: "4pt",
              paddingLeft: "11pt",
              textIndent: "0pt",
              textAlign: "left",
            }}
          >
            Họ và tên <i>(chữ in hoa)</i>:{" "}
            <span
              className="p"
              style={{
                display: "inline-block",
                width: "150px",
                marginRight: "41px",
                textTransform: "uppercase",
              }}
            >
              {" "}
              {idData?.full_name}
            </span>
            Giới tính: Nam{" "}
            <input
              type="radio"
              name="gender"
              value="Nam"
              defaultChecked={idData.sex === "Nam"}
              onChange={() => handleChange("gender", "Nam")}
            />
            Nữ{" "}
            <input
              type="radio"
              name="gender"
              value="Nữ"
              defaultChecked={idData.sex === "Nữ"}
              onChange={() => handleChange("gender", "Nữ")}
            />
          </p>

          <p
            className="s7"
            style={{
              paddingTop: "2pt",
              paddingLeft: "11pt",
              textIndent: "0pt",
              lineHeight: "113%",
              textAlign: "left",
            }}
          >
            Ngày sinh:{" "}
            <span className="p" style={{ marginRight: "80px" }}>
              {idData?.date_of_birth}
            </span>
            Quốc tịch: <span className="p">{idData?.nationality}</span>
            <span style={{ marginLeft: "80px", marginRight: "20px" }}>
              Đối tượng:{" "}
              <span className="s9" style={{ marginLeft: "9px" }}>
                <input
                  className="form_control"
                  type="radio"
                  name="resident_status"
                  id="resident_status_ct"
                  checked={formData.resident_status === "Cư trú"}
                  onChange={() => handleChange("resident_status", "Cư trú")}
                />
              </span>
              Cư trú{" "}
              <span className="s9" style={{ marginLeft: "8px" }}>
                <input
                  className="form_control"
                  type="radio"
                  name="resident_status"
                  id="resident_status_kct"
                  checked={formData.resident_status === "Không cư trú"}
                  onChange={() =>
                    handleChange("resident_status", "Không cư trú")
                  }
                />
              </span>
              Không cư trú
            </span>
          </p>

          <p
            className="s7"
            style={{
              paddingTop: "2pt",
              paddingLeft: "11pt",
              textIndent: "0pt",
              lineHeight: "113%",
              textAlign: "left",
            }}
          >
            Loại GTTT:
            <span className="s9" style={{ marginLeft: "44px" }}></span>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="id_type"
              id="id_type_tcc"
              checked={formData.id_type === "Thẻ căn cước"}
              onChange={() => handleChange("id_type", "Thẻ căn cước")}
            />{" "}
            Thẻ căn cước
            <span className="s9" style={{ marginLeft: "36px" }}></span>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="id_type"
              id="id_type_cccd"
              checked={formData.id_type === "Căn cước công dân"}
              onChange={() => handleChange("id_type", "Căn cước công dân")}
            />{" "}
            CCCD
            <span className="s9" style={{ marginLeft: "36px" }}></span>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="id_type"
              id="id_type_hc"
              checked={formData.id_type === "Hộ chiếu"}
              onChange={() => handleChange("id_type", "Hộ chiếu")}
            />{" "}
            Hộ chiếu
            <span className="s9" style={{ marginLeft: "36px" }}></span>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="id_type"
              id="id_type_khac"
              checked={formData.id_type === "Khác"}
              onChange={() => handleChange("id_type", "Khác")}
            />{" "}
            Khác:
            <span className="p">
              {" "}
              <input
                className="form_control"
                type="text"
                name="id_type_other"
                id="id_type_other"
                value={formData.id_type_other || ""}
                onChange={(e) => handleChange("id_type_other", e.target.value)}
                onFocus={(e) => handleInputFocus("id_type_other", e.target)}
              />
            </span>
          </p>

          <p
            className="s7"
            style={{
              paddingTop: "2pt",
              paddingLeft: "11pt",
              textIndent: "0pt",
              lineHeight: "113%",
              textAlign: "left",
            }}
          >
            Số GTTT:{" "}
            <span className="p" style={{ marginRight: "90px" }}>
              {idData?.eid_number}
            </span>{" "}
            Ngày cấp: <span className="p">{idData?.date_of_issue}</span>
          </p>

          <p
            className="s7"
            style={{
              paddingLeft: "11pt",
              textIndent: "0pt",
              textAlign: "left",
            }}
          >
            Ngày hết hạn:{" "}
            <span className="p" style={{ marginRight: "92px" }}>
              {" "}
              {idData?.date_of_expiry}
            </span>{" "}
            Nơi cấp: <span className="p"> {idData?.place_of_issue}</span>
          </p>

          <p
            className="s7"
            style={{
              paddingTop: "1pt",
              paddingLeft: "11pt",
              textIndent: "0pt",
              textAlign: "left",
            }}
          >
            Địa chỉ đăng ký hộ khẩu thường trú:
            <span className="p"> {idData?.place_of_residence}</span>
          </p>

          <p
            className="s7"
            style={{
              paddingTop: "1pt",
              paddingLeft: "11pt",
              textIndent: "0pt",
              textAlign: "left",
            }}
          >
            Nơi ở hiện nay:{" "}
            <span className="p">
              {/* {{CURRENT_ADDRESS}} */}
              <input
                className="form_control"
                style={{ width: "420pt" }}
                type="text"
                name="current_address"
                id="current_address"
                value={formData.current_address || ""}
                onChange={(e) =>
                  handleChange("current_address", e.target.value)
                }
                onFocus={(e) => handleInputFocus("current_address", e.target)}
              />
            </span>
          </p>

          <p
            className="s7"
            style={{
              paddingTop: "1pt",
              paddingLeft: "11pt",
              textIndent: "0pt",
              textAlign: "left",
            }}
          >
            Điện thoại <i>(*)</i>:
            <span className="p" style={{ marginRight: "92px" }}>
              {/* {{PHONE}} */}
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
            </span>
            Email <i>(**)</i>:{" "}
            <span className="p" style={{ marginRight: "92px" }}>
              {/* {{EMAIL}} */}
              <input
                className="form_control"
                type="text"
                name="email"
                id="email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                onFocus={(e) => handleInputFocus("email", e.target)}
              />
            </span>
            Mã số thuế:{" "}
            <span className="p">
              {/* {{TAX_CODE}} */}
              <input
                className="form_control"
                type="text"
                name="tax_code"
                id="tax_code"
                value={formData.tax_code || ""}
                onChange={(e) => handleChange("tax_code", e.target.value)}
                onFocus={(e) => handleInputFocus("tax_code", e.target)}
              />
            </span>
          </p>

          <p
            className="s7"
            style={{
              paddingTop: "1pt",
              paddingLeft: "11pt",
              textIndent: "0pt",
              textAlign: "left",
            }}
          >
            Nghề nghiệp:{" "}
            <span className="p" style={{ marginRight: "80px" }}>
              {/* {{OCCUPATION}} */}
              <input
                className="form_control"
                type="text"
                name="occupation"
                id="occupation"
                value={formData.occupation || ""}
                onChange={(e) => handleChange("occupation", e.target.value)}
                onFocus={(e) => handleInputFocus("occupation", e.target)}
              />
            </span>
            Chức vụ:{" "}
            <span className="p" style={{ marginRight: "80px" }}>
              {/* {{POSITION}} */}
              <input
                className="form_control"
                type="text"
                name="position"
                id="position"
                value={formData.position || ""}
                onChange={(e) => handleChange("position", e.target.value)}
                onFocus={(e) => handleInputFocus("position", e.target)}
              />
            </span>
            Nơi công tác:{" "}
            <span className="p">
              {/* {{WORKPLACE}} */}
              <input
                className="form_control"
                type="text"
                name="workplace"
                id="workplace"
                value={formData.workplace || ""}
                onChange={(e) => handleChange("workplace", e.target.value)}
                onFocus={(e) => handleInputFocus("workplace", e.target)}
              />
            </span>
          </p>

          <h1
            style={{
              paddingTop: "2pt",
              paddingLeft: "11pt",
              textIndent: "0pt",
              textAlign: "left",
            }}
          >
            THÔNG TIN NGƯỜI ĐẠI DIỆN
          </h1>

          <p
            className="s7"
            style={{
              paddingTop: "1pt",
              paddingLeft: "11pt",
              textIndent: "0pt",
              textAlign: "left",
            }}
          >
            Họ và tên <i>(chữ in hoa)</i>:{" "}
            <span className="p">
              {/* {{REPRESENTATIVE_FULL_NAME}} */}
              <input
                className="form_control"
                type="text"
                name="representative_full_name"
                id="representative_full_name"
                value={formData.representative_full_name || ""}
                onChange={(e) =>
                  handleChange("representative_full_name", e.target.value)
                }
                onFocus={(e) =>
                  handleInputFocus("representative_full_name", e.target)
                }
              />
            </span>
            Giới tính:{" "}
            <span className="s9" style={{ marginLeft: "12px" }}>
              <input
                className="form_control"
                type="radio"
                name="representative_gender"
                id="representative_gender_male"
                checked={formData.representative_gender === "Nam"}
                onChange={(e) => handleChange("representative_gender", "Nam")}
              />{" "}
            </span>{" "}
            Nam{" "}
            <span className="s9" style={{ marginLeft: "17px" }}>
              <input
                className="form_control"
                type="radio"
                name="representative_gender"
                id="representative_gender_female"
                checked={formData.representative_gender === "Nữ"}
                onChange={(e) => handleChange("representative_gender", "Nữ")}
              />{" "}
            </span>{" "}
            Nữ
          </p>

          <p
            className="s7"
            style={{
              paddingTop: "2pt",
              paddingLeft: "11pt",
              textIndent: "0pt",
              lineHeight: "113%",
              textAlign: "left",
            }}
          >
            Ngày sinh:{" "}
            <span className="p" style={{ marginRight: "80px" }}>
              {/* {{REPRESENTATIVE_DATE_OF_BIRTH}} */}
              <input
                className="form_control"
                type="date"
                name="representative_date_of_birth"
                id="representative_date_of_birth"
                value={formData.representative_date_of_birth || ""}
                onChange={(e) =>
                  handleChange("representative_date_of_birth", e.target.value)
                }
                onFocus={(e) =>
                  handleInputFocus("representative_date_of_birth", e.target)
                }
              />
            </span>
            Quốc tịch:{" "}
            <span className="p" style={{ marginRight: "80px" }}>
              {/* {{REPRESENTATIVE_NATION}} */}
              <input
                className="form_control"
                type="text"
                name="representative_nation"
                id="representative_nation"
                value={formData.representative_nation || ""}
                onChange={(e) =>
                  handleChange("representative_nation", e.target.value)
                }
                onFocus={(e) =>
                  handleInputFocus("representative_nation", e.target)
                }
              />
            </span>
            <span style={{ marginLeft: "80px", marginRight: "20px" }}>
              Đối tượng:{" "}
              <span className="s9" style={{ marginLeft: "9px" }}>
                <input
                  className="form_control"
                  type="radio"
                  name="representative_resident_status"
                  id="representative_resident_status_ct"
                  checked={formData.representative_resident_status === "Cư trú"}
                  onChange={() =>
                    handleChange("representative_resident_status", "Cư trú")
                  }
                />
              </span>
              Cư trú{" "}
              <span className="s9" style={{ marginLeft: "8px" }}>
                <input
                  className="form_control"
                  type="radio"
                  name="representative_resident_status"
                  id="representative_resident_status_kct"
                  checked={
                    formData.representative_resident_status === "Không cư trú"
                  }
                  onChange={() =>
                    handleChange(
                      "representative_resident_status",
                      "Không cư trú"
                    )
                  }
                />
              </span>
              Không cư trú
            </span>
          </p>

          <p
            className="s7"
            style={{
              paddingTop: "2pt",
              paddingLeft: "11pt",
              textIndent: "0pt",
              lineHeight: "113%",
              textAlign: "left",
            }}
          >
            Loại GTTT: {/* {{REPRESENTATIVE_ID_TYPE_OTHER}} */}
            <span className="s9" style={{ marginLeft: "44px" }}></span>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="representative_id_type"
              id="representative_id_type_tcc"
              checked={formData.representative_id_type === "Thẻ căn cước"}
              onChange={() =>
                handleChange("representative_id_type", "Thẻ căn cước")
              }
            />{" "}
            Thẻ căn cước
            <span className="s9" style={{ marginLeft: "36px" }}></span>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="representative_id_type"
              id="representative_id_type_cccd"
              checked={formData.representative_id_type === "Căn cước công dân"}
              onChange={() =>
                handleChange("representative_id_type", "Căn cước công dân")
              }
            />{" "}
            CCCD
            <span className="s9" style={{ marginLeft: "36px" }}></span>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="representative_id_type"
              id="representative_id_type_hc"
              checked={formData.representative_id_type === "Hộ chiếu"}
              onChange={() =>
                handleChange("representative_id_type", "Hộ chiếu")
              }
            />{" "}
            Hộ chiếu
            <span className="s9" style={{ marginLeft: "36px" }}></span>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="representative_id_type"
              id="representative_id_type_khac"
              checked={formData.representative_id_type === "Khác"}
              onChange={() => handleChange("representative_id_type", "Khác")}
            />{" "}
            Khác:
            <span className="p">
              {" "}
              <input
                className="form_control"
                type="text"
                name="representative_id_type_other"
                id="representative_id_type_other"
                value={formData.representative_id_type_other || ""}
                onChange={(e) =>
                  handleChange("representative_id_type_other", e.target.value)
                }
                onFocus={(e) =>
                  handleInputFocus("representative_id_type_other", e.target)
                }
              />
            </span>
          </p>

          <p
            className="s7"
            style={{
              paddingTop: "2pt",
              paddingLeft: "11pt",
              textIndent: "0pt",
              lineHeight: "113%",
              textAlign: "left",
            }}
          >
            <span>
              Số GTTT:
              <span className="p" style={{ marginRight: "90px" }}>
                {/* {{REPRESENTATIVE_NATION_NO}} */}
                <input
                  className="form_control"
                  type="text"
                  name="representative_nation_no"
                  id="representative_nation_no"
                  value={formData.representative_nation_no || ""}
                  onChange={(e) =>
                    handleChange("representative_nation_no", e.target.value)
                  }
                  onFocus={(e) =>
                    handleInputFocus("representative_nation_no", e.target)
                  }
                />
              </span>
            </span>
            <span>
              Ngày cấp:{" "}
              <span className="p">
                {/* {{REPRESENTATIVE_DATE_OF_ISSUE}} */}
                <input
                  className="form_control"
                  type="date"
                  name="representative_date_of_issue"
                  id="representative_date_of_issue"
                  value={formData.representative_date_of_issue || ""}
                  onChange={(e) =>
                    handleChange("representative_date_of_issue", e.target.value)
                  }
                  onFocus={(e) =>
                    handleInputFocus("representative_date_of_issue", e.target)
                  }
                />
              </span>
            </span>
          </p>

          <p
            className="s7"
            style={{
              paddingLeft: "11pt",
              textIndent: "0pt",
              textAlign: "left",
              display: "flex",
            }}
          >
            Ngày hết hạn:{" "}
            <span className="p" style={{ marginRight: "90px" }}>
              {/* {{REPRESENTATIVE_EXPIRED_DATE}} */}
              <input
                className="form_control"
                type="date"
                name="representative_expired_date"
                id="representative_expired_date"
                value={formData.representative_expired_date || ""}
                onChange={(e) =>
                  handleChange("representative_expired_date", e.target.value)
                }
                onFocus={(e) =>
                  handleInputFocus("representative_expired_date", e.target)
                }
              />
            </span>
            Nơi cấp:{" "}
            <span className="p">
              {/* {{REPRESENTATIVE_PLACE_OF_ISSUE}} */}
              <input
                className="form_control"
                type="text"
                name="representative_place_of_issue"
                id="representative_place_of_issue"
                value={formData.representative_place_of_issue || ""}
                onChange={(e) =>
                  handleChange("representative_place_of_issue", e.target.value)
                }
                onFocus={(e) =>
                  handleInputFocus("representative_place_of_issue", e.target)
                }
              />
            </span>
          </p>

          <p
            className="s7"
            style={{
              paddingTop: "1pt",
              paddingLeft: "11pt",
              textIndent: "0pt",
              textAlign: "left",
            }}
          >
            Địa chỉ đăng ký hộ khẩu thường trú:{" "}
            <span className="p">
              {/* {{REPRESENTATIVE_ADDRESS}} */}
              <input
                className="form_control"
                style={{ width: "388pt" }}
                type="text"
                name="representative_address"
                id="representative_address"
                value={formData.representative_address || ""}
                onChange={(e) =>
                  handleChange("representative_address", e.target.value)
                }
                onFocus={(e) =>
                  handleInputFocus("representative_address", e.target)
                }
              />
            </span>
          </p>

          <p
            className="s7"
            style={{
              paddingTop: "1pt",
              paddingLeft: "11pt",
              textIndent: "0pt",
              textAlign: "left",
            }}
          >
            Nơi ở hiện nay:{" "}
            <span className="p">
              {/* {{REPRESENTATIVE_CURRENT_ADDRESS}} */}
              <input
                className="form_control"
                style={{ width: "480pt" }}
                type="text"
                name="representative_current_address"
                id="representative_current_address"
                value={formData.representative_current_address || ""}
                onChange={(e) =>
                  handleChange("representative_current_address", e.target.value)
                }
                onFocus={(e) =>
                  handleInputFocus("representative_current_address", e.target)
                }
              />
            </span>
          </p>

          <p
            className="s7"
            style={{
              paddingTop: "1pt",
              paddingLeft: "11pt",
              textIndent: "0pt",
              textAlign: "left",
            }}
          >
            Điện thoại <i>(*)</i>:{" "}
            <span className="p" style={{ marginRight: "90px" }}>
              {/* {{REPRESENTATIVE_PHONE}} */}
              <input
                className="form_control"
                type="text"
                name="representative_phone"
                id="representative_phone"
                value={formData.representative_phone || ""}
                onChange={(e) =>
                  handleChange(
                    "representative_phone",
                    e.target.value.replace(/[^0-9]/g, "")
                  )
                }
                onFocus={(e) =>
                  handleInputFocus("representative_phone", e.target)
                }
              />
            </span>
            Email <i>(**)</i>:{" "}
            <span className="p" style={{ marginRight: "90px" }}>
              {/* {{REPRESENTATIVE_EMAIL}} */}
              <input
                className="form_control"
                type="text"
                name="representative_email"
                id="representative_email"
                value={formData.representative_email || ""}
                onChange={(e) =>
                  handleChange("representative_email", e.target.value)
                }
                onFocus={(e) =>
                  handleInputFocus("representative_email", e.target)
                }
              />
            </span>
            Mã số thuế:{" "}
            <span className="p">
              {/* {{REPRESENTATIVE_TAX_CODE}} */}
              <input
                className="form_control"
                type="text"
                name="representative_tax_code"
                id="representative_tax_code"
                value={formData.representative_tax_code || ""}
                onChange={(e) =>
                  handleChange("representative_tax_code", e.target.value)
                }
                onFocus={(e) =>
                  handleInputFocus("representative_tax_code", e.target)
                }
              />
            </span>
          </p>

          <p
            className="s7"
            style={{
              paddingTop: "2pt",
              paddingLeft: "11pt",
              textIndent: "0pt",
              textAlign: "left",
            }}
          >
            Nghề nghiệp:{" "}
            <span className="p" style={{ marginRight: "80px" }}>
              {/* {{REPRESENTATIVE_OCCUPATION}} */}
              <input
                className="form_control"
                type="text"
                name="representative_occupation"
                id="representative_occupation"
                value={formData.representative_occupation || ""}
                onChange={(e) =>
                  handleChange("representative_occupation", e.target.value)
                }
                onFocus={(e) =>
                  handleInputFocus("representative_occupation", e.target)
                }
              />
            </span>
            Chức vụ:{" "}
            <span className="p" style={{ marginRight: "80px" }}>
              {/* {{REPRESENTATIVE_POSITION}} */}
              <input
                className="form_control"
                type="text"
                name="representative_position"
                id="representative_position"
                value={formData.representative_position || ""}
                onChange={(e) =>
                  handleChange("representative_position", e.target.value)
                }
                onFocus={(e) =>
                  handleInputFocus("representative_position", e.target)
                }
              />
            </span>
            Nơi công tác:{" "}
            <span className="p">
              {/* {{REPRESENTATIVE_WORKPLACE}} */}
              <input
                className="form_control"
                type="text"
                name="representative_workplace"
                id="representative_workplace"
                value={formData.representative_workplace || ""}
                onChange={(e) =>
                  handleChange("representative_workplace", e.target.value)
                }
                onFocus={(e) =>
                  handleInputFocus("representative_workplace", e.target)
                }
              />
            </span>
          </p>

          <p
            style={{ paddingTop: "3pt", textIndent: "0pt", textAlign: "left" }}
          >
            <br />
          </p>

          <ul id="l1">
            <li data-list-text="-">
              <p
                className="s10"
                style={{
                  paddingLeft: "15pt",
                  textIndent: "-4pt",
                  textAlign: "left",
                }}
              >
                {" "}
                Quý khách kê khai ngày tháng năm theo định dạng dd/mm/yyyy
              </p>
            </li>
            <li data-list-text="-">
              <p
                className="s10"
                style={{
                  paddingTop: "1pt",
                  paddingLeft: "15pt",
                  textIndent: "-4pt",
                  textAlign: "left",
                }}
              >
                {" "}
                (*) là số điện thoại mặc định để đăng ký các dịch vụ Ngân hàng
                và nhận các thông báo về dịch vụ từ Co-opBank
              </p>
            </li>
            <li data-list-text="-">
              <p
                className="s10"
                style={{
                  paddingTop: "1pt",
                  paddingLeft: "15pt",
                  textIndent: "-4pt",
                  textAlign: "left",
                }}
              >
                {" "}
                (**) là địa chỉ email mặc định đăng ký dịch vụ Ngân hàng và/hoặc
                nhận thông tin dịch vụ Thẻ ghi nợ, OTP (one time password) từ
                Co-opBank
              </p>
            </li>
          </ul>
        </div>

        <p style={{ paddingTop: "1pt", textIndent: "0pt", textAlign: "left" }}>
          <br />
        </p>

        <h1
          style={{ paddingLeft: "11pt", textIndent: "0pt", textAlign: "left" }}
        >
          TÔI ĐỀ NGHỊ CO-OPBANK MỞ TÀI KHOẢN THANH TOÁN VÀ ĐĂNG KÝ SỬ DỤNG CÁC
          DỊCH VỤ SAU ĐÂY
        </h1>

        <p
          style={{
            paddingTop: "2pt",
            paddingLeft: "5pt",
            textIndent: "0pt",
            textAlign: "left",
            backgroundColor: "#94B3D6",
          }}
        >
          <span className="s11"> I - DỊCH VỤ MỞ TÀI KHOẢN THANH TOÁN </span>
        </p>

        <ol id="l2">
          <li data-list-text="1.">
            <p
              className="s7"
              style={{
                paddingTop: "3pt",
                paddingLeft: "25pt",
                textIndent: "-11pt",
                textAlign: "left",
              }}
            >
              Loại tiền:{" "}
              <span className="s9" style={{ marginLeft: "120px" }}>
                <input
                  className="form_control"
                  style={{ margin: "0 4pt" }}
                  type="radio"
                  name="currency_type"
                  id="currency_type_VND"
                  checked={formData.currency_type === "VND"}
                  onChange={(e) => handleChange("currency_type", "VND")}
                />{" "}
              </span>
              VND{" "}
              <span className="s9" style={{ marginLeft: "160px" }}>
                <input
                  className="form_control"
                  style={{ margin: "0 4pt" }}
                  type="radio"
                  name="currency_type"
                  id="currency_type_khac"
                  checked={formData.currency_type === "Khác"}
                  onChange={(e) => handleChange("currency_type", "Khác")}
                />{" "}
              </span>
              Khác:{" "}
              <span className="p">
                <input
                  className="form_control"
                  type="text"
                  name="currency_type_other"
                  id="currency_type_other"
                  value={formData.currency_type_other || ""}
                  onChange={(e) =>
                    handleChange("currency_type_other", e.target.value)
                  }
                  onFocus={(e) =>
                    handleInputFocus("currency_type_other", e.target)
                  }
                />
              </span>
            </p>
          </li>
          <li data-list-text="2.">
            <p
              className="s7"
              style={{
                paddingTop: "2pt",
                paddingLeft: "25pt",
                textIndent: "-11pt",
                textAlign: "left",
              }}
            >
              Đăng ký chữ ký mẫu:
            </p>
          </li>
        </ol>

        <div
          style={{
            display: "flex",
            flexDirection: "row-reverse",
            width: "fit-content",
            gap: "6px",
          }}
        >
          <div style={{ display: "flex", gap: "6px" }}>
            <div
              className="textbox"
              style={{
                border: "0.2pt solid #000000",
                display: "block",
                minHeight: "66.0pt",
                width: "93.8pt",
              }}
            >
              <p
                className="s12"
                style={{
                  paddingTop: "3pt",
                  paddingLeft: "17pt",
                  textIndent: "0pt",
                  textAlign: "left",
                }}
              >
                Chữ ký thứ nhất
              </p>
            </div>
            <div
              className="textbox"
              style={{
                border: "0.2pt solid #000000",
                display: "block",
                minHeight: "66.0pt",
                width: "93.8pt",
              }}
            >
              <p
                className="s12"
                style={{
                  paddingTop: "3pt",
                  paddingLeft: "19pt",
                  textIndent: "0pt",
                  textAlign: "left",
                }}
              >
                Chữ ký thứ hai
              </p>
            </div>
          </div>
          <div>
            <h1
              style={{
                paddingTop: "2pt",
                paddingLeft: "14pt",
                textIndent: "0pt",
                textAlign: "left",
              }}
            >
              Chủ tài khoản:
              <span className="s7">
                ..........................................................................................
              </span>
            </h1>
            <p
              className="s7"
              style={{
                paddingTop: "1pt",
                paddingLeft: "16pt",
                textIndent: "0pt",
                textAlign: "left",
              }}
            >
              ....................................................................................................................
            </p>
            <p
              className="s7"
              style={{
                paddingTop: "1pt",
                paddingLeft: "16pt",
                textIndent: "0pt",
                textAlign: "left",
              }}
            >
              ....................................................................................................................
            </p>
            <p
              className="s7"
              style={{
                paddingTop: "1pt",
                paddingLeft: "16pt",
                textIndent: "0pt",
                textAlign: "left",
              }}
            >
              ....................................................................................................................
            </p>
            <p
              className="s7"
              style={{
                paddingTop: "1pt",
                paddingLeft: "16pt",
                textIndent: "0pt",
                textAlign: "left",
              }}
            >
              ....................................................................................................................
            </p>
          </div>
        </div>

        <p style={{ paddingTop: "4pt", textIndent: "0pt", textAlign: "left" }}>
          <br />
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "row-reverse",
            width: "fit-content",
            gap: "6px",
          }}
        >
          <div style={{ display: "flex", gap: "6px" }}>
            <div
              className="textbox"
              style={{
                border: "0.2pt solid #000000",
                display: "block",
                minHeight: "66.0pt",
                width: "93.8pt",
              }}
            >
              <p
                className="s12"
                style={{
                  paddingTop: "3pt",
                  paddingLeft: "17pt",
                  textIndent: "0pt",
                  textAlign: "left",
                }}
              >
                Chữ ký thứ nhất
              </p>
            </div>
            <div
              className="textbox"
              style={{
                border: "0.2pt solid #000000",
                display: "block",
                minHeight: "66.0pt",
                width: "93.8pt",
              }}
            >
              <p
                className="s12"
                style={{
                  paddingTop: "3pt",
                  paddingLeft: "19pt",
                  textIndent: "0pt",
                  textAlign: "left",
                }}
              >
                Chữ ký thứ hai
              </p>
            </div>
          </div>
          <div>
            <h1
              style={{
                paddingTop: "2pt",
                paddingLeft: "14pt",
                textIndent: "0pt",
                textAlign: "left",
              }}
            >
              Người đại diện:
              <span className="s7">
                ..........................................................................................
              </span>
            </h1>
            <p
              className="s7"
              style={{
                paddingTop: "1pt",
                paddingLeft: "16pt",
                textIndent: "0pt",
                textAlign: "left",
              }}
            >
              ....................................................................................................................
            </p>
            <p
              className="s7"
              style={{
                paddingTop: "1pt",
                paddingLeft: "16pt",
                textIndent: "0pt",
                textAlign: "left",
              }}
            >
              ....................................................................................................................
            </p>
            <p
              className="s7"
              style={{
                paddingTop: "1pt",
                paddingLeft: "16pt",
                textIndent: "0pt",
                textAlign: "left",
              }}
            >
              ....................................................................................................................
            </p>
            <p
              className="s7"
              style={{
                paddingTop: "1pt",
                paddingLeft: "16pt",
                textIndent: "0pt",
                textAlign: "left",
              }}
            >
              ....................................................................................................................
            </p>
          </div>
        </div>

        <p
          style={{
            marginTop: "4px",
            paddingLeft: "5pt",
            textIndent: "0pt",
            textAlign: "left",
            backgroundColor: "#94B3D6",
          }}
        >
          <span className="s11"> II - DỊCH VỤ MOBILE BANKING </span>
        </p>

        <ol id="l3">
          <li data-list-text="1.">
            <p
              className="s7"
              style={{
                paddingTop: "5pt",
                paddingLeft: "23pt",
                textIndent: "-11pt",
                textAlign: "left",
              }}
            >
              Đăng ký dịch vụ:{" "}
              <span className="s9" style={{ marginLeft: "382px" }}>
                <input
                  className="form_control"
                  style={{ margin: "0 4pt" }}
                  type="radio"
                  name="mobile_banking_register"
                  id="mobile_banking_register_yes"
                  checked={formData.mobile_banking_register === "Có"}
                  onChange={(e) =>
                    handleChange("mobile_banking_register", "Có")
                  }
                />
              </span>
              Có{" "}
              <span className="s9" style={{ marginLeft: "60px" }}>
                <input
                  className="form_control"
                  style={{ margin: "0 4pt" }}
                  type="radio"
                  name="mobile_banking_register"
                  id="mobile_banking_register_no"
                  checked={formData.mobile_banking_register === "Không"}
                  onChange={(e) =>
                    handleChange("mobile_banking_register", "Không")
                  }
                />
              </span>
              Không
            </p>
          </li>
          <li data-list-text="2.">
            <p
              className="s7"
              style={{
                paddingTop: "1pt",
                paddingLeft: "23pt",
                textIndent: "-11pt",
                textAlign: "left",
              }}
            >
              Gói dịch vụ:{" "}
              <span className="p">
                <input
                  className="form_control"
                  style={{ margin: "0 4pt", width: "446pt" }}
                  type="text"
                  name="mobile_banking_package"
                  id="mobile_banking_package"
                  value={formData.mobile_banking_package || ""}
                  onChange={(e) =>
                    handleChange("mobile_banking_package", e.target.value)
                  }
                  onFocus={(e) =>
                    handleInputFocus("mobile_banking_package", e.target)
                  }
                />
              </span>
            </p>
          </li>
          <li data-list-text="3.">
            <p
              className="s7"
              style={{
                paddingTop: "1pt",
                paddingLeft: "23pt",
                textIndent: "-11pt",
                textAlign: "left",
              }}
            >
              Số tài khoản thanh toán thu phí:{" "}
              <span className="p">
                <input
                  className="form_control"
                  style={{ margin: "0 4pt", width: "360pt" }}
                  type="text"
                  name="mobile_banking_fee_account"
                  id="mobile_banking_fee_account"
                  value={formData.mobile_banking_fee_account || ""}
                  onChange={(e) =>
                    handleChange("mobile_banking_fee_account", e.target.value)
                  }
                  onFocus={(e) =>
                    handleInputFocus("mobile_banking_fee_account", e.target)
                  }
                />
              </span>
            </p>
          </li>
          <li data-list-text="4.">
            <p
              className="s7"
              style={{
                paddingTop: "2pt",
                paddingLeft: "23pt",
                textIndent: "-11pt",
                textAlign: "left",
              }}
            >
              Phương thức nhận mật khẩu (<i>bắt buộc chọn 01 phương thức</i>):{" "}
              <span className="s9" style={{ marginLeft: "24px" }}>
                <input
                  className="form_control"
                  style={{ margin: "0 4pt" }}
                  type="radio"
                  name="password_method"
                  id="password_method_tai_quay"
                  checked={formData.password_method === "Tại quầy"}
                  onChange={(e) => handleChange("password_method", "Tại quầy")}
                />
              </span>
              Tại quầy{" "}
              <span className="s9" style={{ marginLeft: "24px" }}>
                <input
                  className="form_control"
                  style={{ margin: "0 4pt" }}
                  type="radio"
                  name="password_method"
                  id="password_method_qua_sms"
                  checked={formData.password_method === "Qua SMS"}
                  onChange={(e) => handleChange("password_method", "Qua SMS")}
                />
              </span>
              Qua SMS{" "}
              <span className="s9" style={{ marginLeft: "18px" }}>
                <input
                  className="form_control"
                  style={{ margin: "0 4pt" }}
                  type="radio"
                  name="password_method"
                  id="password_method_qua_email"
                  checked={formData.password_method === "Qua Email"}
                  onChange={(e) => handleChange("password_method", "Qua Email")}
                />
              </span>
              Qua Email
            </p>
          </li>
        </ol>

        <p
          style={{
            paddingTop: "3pt",
            paddingLeft: "5pt",
            textIndent: "0pt",
            textAlign: "left",
            backgroundColor: "#94B3D6",
          }}
        >
          <span className="s11"> III - DỊCH VỤ SMS BANKING </span>
        </p>

        <ol id="l4">
          <li data-list-text="1.">
            <p
              className="s7"
              style={{
                paddingTop: "4pt",
                paddingLeft: "20pt",
                textIndent: "-11pt",
                textAlign: "left",
              }}
            >
              Đăng ký dịch vụ:{" "}
              <span className="s9" style={{ marginLeft: "384px" }}>
                <input
                  className="form_control"
                  style={{ margin: "0 4pt" }}
                  type="radio"
                  name="sms_banking_register"
                  id="sms_banking_register_yes"
                  checked={formData.sms_banking_register === "Có"}
                  onChange={(e) => handleChange("sms_banking_register", "Có")}
                />
              </span>
              Có{" "}
              <span className="s9" style={{ marginLeft: "60px" }}>
                <input
                  className="form_control"
                  style={{ margin: "0 4pt" }}
                  type="radio"
                  name="sms_banking_register"
                  id="sms_banking_register_no"
                  checked={formData.sms_banking_register === "Không"}
                  onChange={(e) =>
                    handleChange("sms_banking_register", "Không")
                  }
                />
              </span>
              Không
            </p>
          </li>
          <li data-list-text="2.">
            <p
              className="s7"
              style={{
                paddingTop: "1pt",
                paddingLeft: "20pt",
                textIndent: "-11pt",
                textAlign: "left",
              }}
            >
              Số tài khoản thanh toán thu phí:{" "}
              <span className="p">
                <input
                  className="form_control"
                  style={{ margin: "0 4pt", width: "366pt" }}
                  type="text"
                  name="sms_banking_fee_account"
                  id="sms_banking_fee_account"
                  value={formData.sms_banking_fee_account || ""}
                  onChange={(e) =>
                    handleChange("sms_banking_fee_account", e.target.value)
                  }
                  onFocus={(e) =>
                    handleInputFocus("sms_banking_fee_account", e.target)
                  }
                />
              </span>
            </p>
          </li>
          <li data-list-text="3.">
            <p
              className="s7"
              style={{
                paddingTop: "2pt",
                paddingLeft: "20pt",
                textIndent: "-11pt",
                textAlign: "left",
                display: "flex",
              }}
            >
              <span style={{ marginRight: "24pt" }}>
                Yêu cầu cung cấp các dịch vụ:{" "}
              </span>
              <input
                className="form_control"
                style={{ margin: "0 4pt" }}
                type="checkbox"
                name="sms_services"
                id="tin_nhan_thanh_toan_mac_dinh"
                checked={formData.sms_services?.includes(
                  "Tin nhắn Thanh toán (Mặc định)"
                )}
                onChange={(e) =>
                  handleCheckboxChange(
                    "sms_services",
                    "Tin nhắn Thanh toán (Mặc định)"
                  )
                }
              />{" "}
              <span>
                Tin nhắn Thanh toán{" "}
                <span style={{ fontStyle: "italic", marginRight: "14pt" }}>
                  (Mặc định)
                </span>
              </span>
              <input
                className="form_control"
                style={{ margin: "0 4pt" }}
                type="checkbox"
                name="sms_services"
                id="tin_nhan_tin_dung"
                checked={formData.sms_services?.includes("Tin nhắn Tín dụng")}
                onChange={(e) =>
                  handleCheckboxChange("sms_services", "Tin nhắn Tín dụng")
                }
              />
              <span>Tin nhắn Tín dụng</span>
            </p>
            <p style={{ marginLeft: "178pt" }}>
              <input
                className="form_control"
                style={{ margin: "0 4pt" }}
                type="checkbox"
                name="sms_services"
                id="dich_vu_tin_nhan_phi_tai_chinh"
                checked={formData.sms_services?.includes(
                  "Dịch vụ tin nhắn Phi tài chính"
                )}
                onChange={(e) =>
                  handleCheckboxChange(
                    "sms_services",
                    "Dịch vụ tin nhắn Phi tài chính"
                  )
                }
              />
              <span style={{ marginRight: "37.7pt" }}>
                Dịch vụ tin nhắn Phi tài chính
              </span>
              <input
                className="form_control"
                style={{ margin: "0 4pt" }}
                type="checkbox"
                name="sms_services"
                id="dich_vu_tin_nhan_tiet_kiem"
                checked={formData.sms_services?.includes(
                  "Dịch vụ tin nhắn Tiết kiệm"
                )}
                onChange={(e) =>
                  handleCheckboxChange(
                    "sms_services",
                    "Dịch vụ tin nhắn Tiết kiệm"
                  )
                }
              />
              <span>Dịch vụ tin nhắn Tiết kiệm</span>
            </p>
            <p style={{ marginLeft: "178pt" }}>
              <input
                className="form_control"
                style={{ margin: "0 4pt" }}
                type="checkbox"
                name="sms_services"
                id="bien_dong_so_du_qua_email"
                checked={formData.sms_services?.includes(
                  "Biến động số dư qua Email"
                )}
                onChange={(e) =>
                  handleCheckboxChange(
                    "sms_services",
                    "Biến động số dư qua Email"
                  )
                }
              />
              <span>Biến động số dư qua Email</span>
            </p>
          </li>
        </ol>
        <p
          style={{
            marginTop: "5pt",
            paddingLeft: "5pt",
            textIndent: "0pt",
            textAlign: "left",
            backgroundColor: "#94B3D6",
          }}
        >
          <span className="s11"> IV - DỊCH VỤ THẺ </span>
        </p>

        <ol id="l6">
          <li data-list-text="1.">
            <p
              className="s9"
              style={{
                paddingTop: "3pt",
                paddingLeft: "20pt",
                textIndent: "-11pt",
                textAlign: "left",
              }}
            >
              <span className="h1" style={{ marginRight: "366px" }}>
                Thẻ ghi nợ nội địa:{" "}
              </span>
              <input
                className="form_control"
                style={{ margin: "0 4pt" }}
                type="radio"
                name="debit_card_register"
                id="debit_card_register_yes"
                checked={formData.debit_card_register === "Có"}
                onChange={(e) => handleChange("debit_card_register", "Có")}
              />
              <span className="s7" style={{ marginRight: "64px" }}>
                Có{" "}
              </span>
              <input
                className="form_control"
                style={{ margin: "0 4pt" }}
                type="radio"
                name="debit_card_register"
                id="debit_card_register_no"
                checked={formData.debit_card_register === "Không"}
                onChange={(e) => handleChange("debit_card_register", "Không")}
              />
              <span className="s7"> Không</span>
            </p>
          </li>
          <li data-list-text="2.">
            <h1
              style={{
                paddingTop: "2pt",
                paddingLeft: "20pt",
                textIndent: "-11pt",
                textAlign: "left",
              }}
            >
              Thông tin thẻ chính:
            </h1>
            <p
              className="s7"
              style={{
                paddingLeft: "9pt",
                textIndent: "0pt",
                textAlign: "left",
              }}
            >
              Tên in trên thẻ <i>(chữ in hoa không dấu) (***)</i>:{" "}
              <span className="p">
                <input
                  className="form_control"
                  style={{ margin: "0 4pt", width: "320pt" }}
                  type="text"
                  name="main_card_print_name"
                  id="main_card_print_name"
                  value={formData.main_card_print_name || ""}
                  onChange={(e) =>
                    handleChange("main_card_print_name", e.target.value)
                  }
                  onFocus={(e) =>
                    handleInputFocus("main_card_print_name", e.target)
                  }
                />
              </span>
            </p>
            <p
              className="s7"
              style={{
                paddingTop: "3pt",
                paddingLeft: "9pt",
                textIndent: "0pt",
                textAlign: "left",
              }}
            >
              Số TK liên kết thẻ:{" "}
              <span className="p">
                <input
                  className="form_control"
                  style={{ margin: "0 4pt", width: "436pt" }}
                  type="text"
                  name="main_card_linked_account"
                  id="main_card_linked_account"
                  value={formData.main_card_linked_account || ""}
                  onChange={(e) =>
                    handleChange("main_card_linked_account", e.target.value)
                  }
                  onFocus={(e) =>
                    handleInputFocus("main_card_linked_account", e.target)
                  }
                />
              </span>
            </p>
            <p
              className="s7"
              style={{
                paddingTop: "1pt",
                paddingLeft: "9pt",
                textIndent: "0pt",
                textAlign: "left",
              }}
            >
              Hình thức thanh toán phí phát hành:{" "}
              <span className="s9" style={{ marginLeft: "50px" }}>
                <input
                  className="form_control"
                  style={{ margin: "0 4pt" }}
                  type="radio"
                  name="fee_payment_method"
                  id="fee_payment_method_ghi_no_tai_khoan"
                  checked={formData.fee_payment_method === "Ghi Nợ Tài khoản"}
                  onChange={(e) =>
                    handleChange("fee_payment_method", "Ghi Nợ Tài khoản")
                  }
                />
              </span>
              Ghi Nợ Tài khoản{" "}
              <span className="s9" style={{ marginLeft: "109px" }}>
                <input
                  className="form_control"
                  style={{ margin: "0 4pt" }}
                  type="radio"
                  name="fee_payment_method"
                  id="fee_payment_method_nop_tien_mat"
                  checked={formData.fee_payment_method === "Nộp tiền mặt"}
                  onChange={(e) =>
                    handleChange("fee_payment_method", "Nộp tiền mặt")
                  }
                />
              </span>
              Nộp tiền mặt
            </p>
          </li>
          <li data-list-text="3.">
            <p
              className="s7"
              style={{
                paddingTop: "2pt",
                paddingLeft: "20pt",
                textIndent: "-11pt",
                textAlign: "left",
              }}
            >
              <span className="h1">Thông tin thẻ phụ:</span>
            </p>
          </li>
        </ol>

        <h1
          style={{ paddingLeft: "9pt", textIndent: "0pt", textAlign: "left" }}
        >
          CHỦ THẺ PHỤ 1
        </h1>
        <p
          className="s7"
          style={{ paddingLeft: "9pt", textIndent: "0pt", textAlign: "left" }}
        >
          Họ và tên <i>(chữ in hoa)</i>:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="text"
              name="sub_card1_full_name"
              id="sub_card1_full_name"
              value={formData.sub_card1_full_name || ""}
              onChange={(e) =>
                handleChange("sub_card1_full_name", e.target.value)
              }
              onFocus={(e) => handleInputFocus("sub_card1_full_name", e.target)}
            />
          </span>
          Quan hệ với chủ thẻ chính:
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="text"
              name="sub_card1_relationship"
              id="sub_card1_relationship"
              value={formData.sub_card1_relationship || ""}
              onChange={(e) =>
                handleChange("sub_card1_relationship", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card1_relationship", e.target)
              }
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "1pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Ngày sinh:
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt", marginRight: "72pt" }}
              type="date"
              name="sub_card1_date_of_birth"
              id="sub_card1_date_of_birth"
              value={formData.sub_card1_date_of_birth || ""}
              onChange={(e) =>
                handleChange("sub_card1_date_of_birth", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card1_date_of_birth", e.target)
              }
            />
          </span>
          Giới tính:{" "}
          <span className="s9" style={{ marginLeft: "10px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card1_gender"
              id="sub_card1_gender_male"
              checked={formData.sub_card1_gender === "Nam"}
              onChange={(e) => handleChange("sub_card1_gender", "Nam")}
            />
          </span>
          Nam{" "}
          <span className="s9" style={{ marginLeft: "58px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card1_gender"
              id="sub_card1_gender_female"
              checked={formData.sub_card1_gender === "Nữ"}
              onChange={(e) => handleChange("sub_card1_gender", "Nữ")}
            />
          </span>
          Nữ
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "1pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Loại GTTT:{" "}
          <span className="s9" style={{ marginLeft: "24px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card1_id_type"
              id="sub_card1_id_type_tcc"
              checked={formData.sub_card1_id_type === "Thẻ căn cước"}
              onChange={(e) =>
                handleChange("sub_card1_id_type", "Thẻ căn cước")
              }
            />
          </span>
          Thẻ căn cước{" "}
          <span className="s9" style={{ marginLeft: "24px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card1_id_type"
              id="sub_card1_id_type_cccd"
              checked={formData.sub_card1_id_type === "CCCD"}
              onChange={(e) => handleChange("sub_card1_id_type", "CCCD")}
            />
          </span>
          CCCD{" "}
          <span className="s9" style={{ marginLeft: "24px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card1_id_type"
              id="sub_card1_id_type_hc"
              checked={formData.sub_card1_id_type === "Hộ chiếu"}
              onChange={(e) => handleChange("sub_card1_id_type", "Hộ chiếu")}
            />
          </span>
          Hộ chiếu{" "}
          <span className="s9" style={{ marginLeft: "24px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card1_id_type"
              id="sub_card1_id_type_khac"
              checked={formData.sub_card1_id_type === "Khác"}
              onChange={(e) => handleChange("sub_card1_id_type", "Khác")}
            />
          </span>
          Khác:
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="text"
              name="sub_card1_id_type_other"
              id="sub_card1_id_type_other"
              value={formData.sub_card1_id_type_other || ""}
              onChange={(e) =>
                handleChange("sub_card1_id_type_other", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card1_id_type_other", e.target)
              }
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "2pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Số GTTT:
          <span className="p" style={{ marginRight: "24pt" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "240pt" }}
              type="text"
              name="sub_card1_id_number"
              id="sub_card1_id_number"
              value={formData.sub_card1_id_number || ""}
              onChange={(e) =>
                handleChange(
                  "sub_card1_id_number",
                  e.target.value.replace(/[^0-9]/g, "")
                )
              }
              onFocus={(e) => handleInputFocus("sub_card1_id_number", e.target)}
            />
          </span>
          Ngày cấp:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="date"
              name="sub_card1_id_issue_date"
              id="sub_card1_id_issue_date"
              value={formData.sub_card1_id_issue_date || ""}
              onChange={(e) =>
                handleChange("sub_card1_id_issue_date", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card1_id_issue_date", e.target)
              }
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "3pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Nơi cấp:{" "}
          <span className="p" style={{ marginRight: "28pt" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "240pt" }}
              type="text"
              name="sub_card1_id_issue_place"
              id="sub_card1_id_issue_place"
              value={formData.sub_card1_id_issue_place || ""}
              onChange={(e) =>
                handleChange("sub_card1_id_issue_place", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card1_id_issue_place", e.target)
              }
            />
          </span>
          Ngày hết hạn:
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="date"
              name="sub_card1_id_expire_date"
              id="sub_card1_id_expire_date"
              value={formData.sub_card1_id_expire_date || ""}
              onChange={(e) =>
                handleChange("sub_card1_id_expire_date", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card1_id_expire_date", e.target)
              }
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "3pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Địa chỉ liên hệ:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "360pt" }}
              type="text"
              name="sub_card1_contact_address"
              id="sub_card1_contact_address"
              value={formData.sub_card1_contact_address || ""}
              onChange={(e) =>
                handleChange("sub_card1_contact_address", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card1_contact_address", e.target)
              }
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "3pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Email:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="text"
              name="sub_card1_email"
              id="sub_card1_email"
              value={formData.sub_card1_email || ""}
              onChange={(e) => handleChange("sub_card1_email", e.target.value)}
              onFocus={(e) => handleInputFocus("sub_card1_email", e.target)}
            />
          </span>
          Điện thoại liên hệ:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="text"
              name="sub_card1_phone"
              id="sub_card1_phone"
              value={formData.sub_card1_phone || ""}
              onChange={(e) =>
                handleChange(
                  "sub_card1_phone",
                  e.target.value.replace(/[^0-9]/g, "")
                )
              }
              onFocus={(e) => handleInputFocus("sub_card1_phone", e.target)}
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "3pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Tên in trên thẻ <i>(chữ in hoa không dấu) (***)</i>:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "320pt" }}
              type="text"
              name="sub_card1_print_name"
              id="sub_card1_print_name"
              value={formData.sub_card1_print_name || ""}
              onChange={(e) =>
                handleChange("sub_card1_print_name", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card1_print_name", e.target)
              }
            />
          </span>
        </p>

        <h1
          style={{
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
            marginTop: "1rem",
          }}
        >
          CHỦ THẺ PHỤ 2
        </h1>
        <p
          className="s7"
          style={{ paddingLeft: "9pt", textIndent: "0pt", textAlign: "left" }}
        >
          Họ và tên <i>(chữ in hoa)</i>:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="text"
              name="sub_card2_full_name"
              id="sub_card2_full_name"
              value={formData.sub_card2_full_name || ""}
              onChange={(e) =>
                handleChange("sub_card2_full_name", e.target.value)
              }
              onFocus={(e) => handleInputFocus("sub_card2_full_name", e.target)}
            />
          </span>
          Quan hệ với chủ thẻ chính:
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="text"
              name="sub_card2_relationship"
              id="sub_card2_relationship"
              value={formData.sub_card2_relationship || ""}
              onChange={(e) =>
                handleChange("sub_card2_relationship", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card2_relationship", e.target)
              }
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "1pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Ngày sinh:
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt", marginRight: "72pt" }}
              type="date"
              name="sub_card2_date_of_birth"
              id="sub_card2_date_of_birth"
              value={formData.sub_card2_date_of_birth || ""}
              onChange={(e) =>
                handleChange("sub_card2_date_of_birth", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card2_date_of_birth", e.target)
              }
            />
          </span>
          Giới tính:{" "}
          <span className="s9" style={{ marginLeft: "10px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card2_gender"
              id="sub_card2_gender_male"
              checked={formData.sub_card2_gender === "Nam"}
              onChange={(e) => handleChange("sub_card2_gender", "Nam")}
            />
          </span>
          Nam{" "}
          <span className="s9" style={{ marginLeft: "58px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card2_gender"
              id="sub_card2_gender_female"
              checked={formData.sub_card2_gender === "Nữ"}
              onChange={(e) => handleChange("sub_card2_gender", "Nữ")}
            />
          </span>
          Nữ
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "1pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Loại GTTT:{" "}
          <span className="s9" style={{ marginLeft: "24px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card2_id_type"
              id="sub_card2_id_type_tcc"
              checked={formData.sub_card2_id_type === "Thẻ căn cước"}
              onChange={(e) =>
                handleChange("sub_card2_id_type", "Thẻ căn cước")
              }
            />
          </span>
          Thẻ căn cước{" "}
          <span className="s9" style={{ marginLeft: "24px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card2_id_type"
              id="sub_card2_id_type_cccd"
              checked={formData.sub_card2_id_type === "CCCD"}
              onChange={(e) => handleChange("sub_card2_id_type", "CCCD")}
            />
          </span>
          CCCD{" "}
          <span className="s9" style={{ marginLeft: "24px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card2_id_type"
              id="sub_card2_id_type_hc"
              checked={formData.sub_card2_id_type === "Hộ chiếu"}
              onChange={(e) => handleChange("sub_card2_id_type", "Hộ chiếu")}
            />
          </span>
          Hộ chiếu{" "}
          <span className="s9" style={{ marginLeft: "24px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card2_id_type"
              id="sub_card2_id_type_khac"
              checked={formData.sub_card2_id_type === "Khác"}
              onChange={(e) => handleChange("sub_card2_id_type", "Khác")}
            />
          </span>
          Khác:
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="text"
              name="sub_card2_id_type_other"
              id="sub_card2_id_type_other"
              value={formData.sub_card2_id_type_other || ""}
              onChange={(e) =>
                handleChange("sub_card2_id_type_other", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card2_id_type_other", e.target)
              }
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "2pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Số GTTT:
          <span className="p" style={{ marginRight: "24pt" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "240pt" }}
              type="text"
              name="sub_card2_id_number"
              id="sub_card2_id_number"
              value={formData.sub_card2_id_number || ""}
              onChange={(e) =>
                handleChange(
                  "sub_card2_id_number",
                  e.target.value.replace(/[^0-9]/g, "")
                )
              }
              onFocus={(e) => handleInputFocus("sub_card2_id_number", e.target)}
            />
          </span>
          Ngày cấp:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="date"
              name="sub_card2_id_issue_date"
              id="sub_card2_id_issue_date"
              value={formData.sub_card2_id_issue_date || ""}
              onChange={(e) =>
                handleChange("sub_card2_id_issue_date", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card2_id_issue_date", e.target)
              }
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "3pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Nơi cấp:{" "}
          <span className="p" style={{ marginRight: "28pt" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "240pt" }}
              type="text"
              name="sub_card2_id_issue_place"
              id="sub_card2_id_issue_place"
              value={formData.sub_card2_id_issue_place || ""}
              onChange={(e) =>
                handleChange("sub_card2_id_issue_place", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card2_id_issue_place", e.target)
              }
            />
          </span>
          Ngày hết hạn:
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="date"
              name="sub_card2_id_expire_date"
              id="sub_card2_id_expire_date"
              value={formData.sub_card2_id_expire_date || ""}
              onChange={(e) =>
                handleChange("sub_card2_id_expire_date", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card2_id_expire_date", e.target)
              }
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "3pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Địa chỉ liên hệ:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "360pt" }}
              type="text"
              name="sub_card2_contact_address"
              id="sub_card2_contact_address"
              value={formData.sub_card2_contact_address || ""}
              onChange={(e) =>
                handleChange("sub_card2_contact_address", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card2_contact_address", e.target)
              }
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "3pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Email:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="text"
              name="sub_card2_email"
              id="sub_card2_email"
              value={formData.sub_card2_email || ""}
              onChange={(e) => handleChange("sub_card2_email", e.target.value)}
              onFocus={(e) => handleInputFocus("sub_card2_email", e.target)}
            />
          </span>
          Điện thoại liên hệ:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="text"
              name="sub_card2_phone"
              id="sub_card2_phone"
              value={formData.sub_card2_phone || ""}
              onChange={(e) =>
                handleChange(
                  "sub_card2_phone",
                  e.target.value.replace(/[^0-9]/g, "")
                )
              }
              onFocus={(e) => handleInputFocus("sub_card2_phone", e.target)}
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "3pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Tên in trên thẻ <i>(chữ in hoa không dấu) (***)</i>:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "320pt" }}
              type="text"
              name="sub_card2_print_name"
              id="sub_card2_print_name"
              value={formData.sub_card2_print_name || ""}
              onChange={(e) =>
                handleChange("sub_card2_print_name", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card2_print_name", e.target)
              }
            />
          </span>
        </p>

        <h1
          style={{
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
            marginTop: "1rem",
          }}
        >
          CHỦ THẺ PHỤ 3
        </h1>
        <p
          className="s7"
          style={{ paddingLeft: "9pt", textIndent: "0pt", textAlign: "left" }}
        >
          Họ và tên <i>(chữ in hoa)</i>:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="text"
              name="sub_card3_full_name"
              id="sub_card3_full_name"
              value={formData.sub_card3_full_name || ""}
              onChange={(e) =>
                handleChange("sub_card3_full_name", e.target.value)
              }
              onFocus={(e) => handleInputFocus("sub_card3_full_name", e.target)}
            />
          </span>
          Quan hệ với chủ thẻ chính:
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="text"
              name="sub_card3_relationship"
              id="sub_card3_relationship"
              value={formData.sub_card3_relationship || ""}
              onChange={(e) =>
                handleChange("sub_card3_relationship", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card3_relationship", e.target)
              }
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "1pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Ngày sinh:
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt", marginRight: "72pt" }}
              type="date"
              name="sub_card3_date_of_birth"
              id="sub_card3_date_of_birth"
              value={formData.sub_card3_date_of_birth || ""}
              onChange={(e) =>
                handleChange("sub_card3_date_of_birth", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card3_date_of_birth", e.target)
              }
            />
          </span>
          Giới tính:{" "}
          <span className="s9" style={{ marginLeft: "10px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card3_gender"
              id="sub_card3_gender_male"
              checked={formData.sub_card3_gender === "Nam"}
              onChange={(e) => handleChange("sub_card3_gender", "Nam")}
            />
          </span>
          Nam{" "}
          <span className="s9" style={{ marginLeft: "58px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card3_gender"
              id="sub_card3_gender_female"
              checked={formData.sub_card3_gender === "Nữ"}
              onChange={(e) => handleChange("sub_card3_gender", "Nữ")}
            />
          </span>
          Nữ
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "1pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Loại GTTT:{" "}
          <span className="s9" style={{ marginLeft: "24px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card3_id_type"
              id="sub_card3_id_type_tcc"
              checked={formData.sub_card3_id_type === "Thẻ căn cước"}
              onChange={(e) =>
                handleChange("sub_card3_id_type", "Thẻ căn cước")
              }
            />
          </span>
          Thẻ căn cước{" "}
          <span className="s9" style={{ marginLeft: "24px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card3_id_type"
              id="sub_card3_id_type_cccd"
              checked={formData.sub_card3_id_type === "CCCD"}
              onChange={(e) => handleChange("sub_card3_id_type", "CCCD")}
            />
          </span>
          CCCD{" "}
          <span className="s9" style={{ marginLeft: "24px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card3_id_type"
              id="sub_card3_id_type_hc"
              checked={formData.sub_card3_id_type === "Hộ chiếu"}
              onChange={(e) => handleChange("sub_card3_id_type", "Hộ chiếu")}
            />
          </span>
          Hộ chiếu{" "}
          <span className="s9" style={{ marginLeft: "24px" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="radio"
              name="sub_card3_id_type"
              id="sub_card3_id_type_khac"
              checked={formData.sub_card3_id_type === "Khác"}
              onChange={(e) => handleChange("sub_card3_id_type", "Khác")}
            />
          </span>
          Khác:
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="text"
              name="sub_card3_id_type_other"
              id="sub_card3_id_type_other"
              value={formData.sub_card3_id_type_other || ""}
              onChange={(e) =>
                handleChange("sub_card3_id_type_other", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card3_id_type_other", e.target)
              }
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "2pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Số GTTT:
          <span className="p" style={{ marginRight: "24pt" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "240pt" }}
              type="text"
              name="sub_card3_id_number"
              id="sub_card3_id_number"
              value={formData.sub_card3_id_number || ""}
              onChange={(e) =>
                handleChange(
                  "sub_card3_id_number",
                  e.target.value.replace(/[^0-9]/g, "")
                )
              }
              onFocus={(e) => handleInputFocus("sub_card3_id_number", e.target)}
            />
          </span>
          Ngày cấp:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="date"
              name="sub_card3_id_issue_date"
              id="sub_card3_id_issue_date"
              value={formData.sub_card3_id_issue_date || ""}
              onChange={(e) =>
                handleChange("sub_card3_id_issue_date", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card3_id_issue_date", e.target)
              }
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "3pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Nơi cấp:{" "}
          <span className="p" style={{ marginRight: "28pt" }}>
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "240pt" }}
              type="text"
              name="sub_card3_id_issue_place"
              id="sub_card3_id_issue_place"
              value={formData.sub_card3_id_issue_place || ""}
              onChange={(e) =>
                handleChange("sub_card3_id_issue_place", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card3_id_issue_place", e.target)
              }
            />
          </span>
          Ngày hết hạn:
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="date"
              name="sub_card3_id_expire_date"
              id="sub_card3_id_expire_date"
              value={formData.sub_card3_id_expire_date || ""}
              onChange={(e) =>
                handleChange("sub_card3_id_expire_date", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card3_id_expire_date", e.target)
              }
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "3pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Địa chỉ liên hệ:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "360pt" }}
              type="text"
              name="sub_card3_contact_address"
              id="sub_card3_contact_address"
              value={formData.sub_card3_contact_address || ""}
              onChange={(e) =>
                handleChange("sub_card3_contact_address", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card3_contact_address", e.target)
              }
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "3pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Email:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="text"
              name="sub_card3_email"
              id="sub_card3_email"
              value={formData.sub_card3_email || ""}
              onChange={(e) => handleChange("sub_card3_email", e.target.value)}
              onFocus={(e) => handleInputFocus("sub_card3_email", e.target)}
            />
          </span>
          Điện thoại liên hệ:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt" }}
              type="text"
              name="sub_card3_phone"
              id="sub_card3_phone"
              value={formData.sub_card3_phone || ""}
              onChange={(e) =>
                handleChange(
                  "sub_card3_phone",
                  e.target.value.replace(/[^0-9]/g, "")
                )
              }
              onFocus={(e) => handleInputFocus("sub_card3_phone", e.target)}
            />
          </span>
        </p>
        <p
          className="s7"
          style={{
            paddingTop: "3pt",
            paddingLeft: "9pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Tên in trên thẻ <i>(chữ in hoa không dấu) (***)</i>:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "320pt" }}
              type="text"
              name="sub_card3_print_name"
              id="sub_card3_print_name"
              value={formData.sub_card3_print_name || ""}
              onChange={(e) =>
                handleChange("sub_card3_print_name", e.target.value)
              }
              onFocus={(e) =>
                handleInputFocus("sub_card3_print_name", e.target)
              }
            />
          </span>
        </p>

        <p
          className="s10"
          style={{
            paddingTop: "6pt",
            paddingLeft: "11pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          (***) Tên in trên thẻ tối đa 25 ký tự bao gồm cả khoảng trắng, trường
          hợp quá 25 ký tự yêu cầu viết tắt tên đệm
        </p>

        <p
          style={{
            marginTop: "8pt",
            paddingLeft: "5pt",
            textIndent: "0pt",
            textAlign: "left",
            backgroundColor: "#94B3D6",
          }}
        >
          <span className="s11"> V - DỊCH VỤ TÀI KHOẢN ĐỊNH DANH (ALIAS) </span>
        </p>

        <ol id="l7">
          <li data-list-text="1.">
            <p
              className="s7"
              style={{
                paddingTop: "5pt",
                paddingLeft: "20pt",
                textIndent: "-11pt",
                textAlign: "left",
              }}
            >
              Loại tài khoản Alias:{" "}
              <span className="s9" style={{ marginLeft: "84px" }}>
                <input
                  className="form_control"
                  style={{ margin: "0 4pt" }}
                  type="radio"
                  name="alias_type"
                  id="day_so_tuy_chon"
                  checked={formData.alias_type === "Dãy số tùy chọn"}
                  onChange={(e) =>
                    handleChange("alias_type", "Dãy số tùy chọn")
                  }
                />
              </span>
              Dãy số tùy chọn{" "}
              <span className="s9" style={{ marginLeft: "64px" }}>
                <input
                  className="form_control"
                  style={{ margin: "0 4pt" }}
                  type="radio"
                  name="alias_type"
                  id="nickname"
                  checked={formData.alias_type === "Nickname"}
                  onChange={(e) => handleChange("alias_type", "Nickname")}
                />
              </span>
              Nickname{" "}
              <span className="s9" style={{ marginLeft: "94px" }}>
                <input
                  className="form_control"
                  style={{ margin: "0 4pt" }}
                  type="radio"
                  name="alias_type"
                  id="shopname"
                  checked={formData.alias_type === "Shopname"}
                  onChange={(e) => handleChange("alias_type", "Shopname")}
                />
              </span>
              Shopname
            </p>
          </li>
          <li data-list-text="2.">
            <p
              className="s7"
              style={{
                paddingTop: "3pt",
                paddingLeft: "20pt",
                textIndent: "-11pt",
                textAlign: "left",
              }}
            >
              Tài khoản định danh (Alias):
              <input
                className="form_control"
                style={{ margin: "0 4pt", width: "360pt" }}
                type="text"
                name="alias_account"
                id="alias_account"
                value={formData.alias_account || ""}
                onChange={(e) =>
                  handleChange(
                    "alias_account",
                    e.target.value.replace(/[^0-9]/g, "")
                  )
                }
                onFocus={(e) => handleInputFocus("alias_account", e.target)}
              />
            </p>
          </li>
          <li data-list-text="3.">
            <p
              className="s7"
              style={{
                paddingTop: "3pt",
                paddingLeft: "20pt",
                textIndent: "-11pt",
                textAlign: "left",
              }}
            >
              Số tài khoản thanh toán liên kết:
              <input
                className="form_control"
                style={{ margin: "0 4pt", width: "345pt" }}
                type="text"
                name="linked_payment_account"
                id="linked_payment_account"
                value={formData.linked_payment_account || ""}
                onChange={(e) =>
                  handleChange(
                    "linked_payment_account",
                    e.target.value.replace(/[^0-9]/g, "")
                  )
                }
                onFocus={(e) =>
                  handleInputFocus("linked_payment_account", e.target)
                }
              />
            </p>
          </li>
        </ol>

        <h1
          style={{
            marginTop: "56pt",
            paddingTop: "8px",
            paddingLeft: "2pt",
            textIndent: "0pt",
            textAlign: "center",
          }}
        >
          CAM KẾT CỦA KHÁCH HÀNG
        </h1>

        <ol id="l8">
          <li data-list-text="1.">
            <p
              className="s7"
              style={{
                paddingTop: "1pt",
                paddingLeft: "16pt",
                textIndent: "0pt",
                lineHeight: "114%",
                textAlign: "justify",
              }}
            >
              Với mọi trách nhiệm thuộc về mình, Tôi cam đoan mọi thông tin đưa
              ra tại Thỏa thuận này đều đầy đủ và trung thực. Tôi hiểu và đồng ý
              rằng Co-opBank có thể yêu cầu thêm thông tin để xác thực các thông
              tin mà tôi xác nhận ở trên, thay mặt tôi cung cấp thông tin cho
              các cơ quan nhà nước có thẩm quyền theo quy định của pháp luật. Đề
              nghị Co-opBank cung cấp các dịch vụ mà Tôi đã đăng ký ở trên.
            </p>
          </li>
          <li data-list-text="2.">
            <p
              className="s7"
              style={{
                paddingLeft: "16pt",
                textIndent: "0pt",
                lineHeight: "114%",
                textAlign: "justify",
              }}
            >
              Bằng việc đồng ý sử dụng các dịch vụ Ngân hàng nêu trên, Tôi xác
              nhận và đồng ý rằng: (i) đã được Co-opBank cung cấp đầy đủ thông
              tin về Thỏa thuận theo mẫu; Điều khoản, điều kiện các dịch vụ đăng
              ký tại Thỏa thuận này; (ii) Co-opBank được xác thực thông tin trên
              giấy tờ tùy thân hợp pháp và xử lý dữ liệu cá nhân của Tôi theo
              quy định pháp luật từ bất kỳ giải pháp nào mà Co-opBank có được để
              phục vụ mục đích tuân thủ quy định pháp luật về nhận biết khách
              hàng; cung cấp cho bên thứ ba (bao gồm nhưng không giới hạn các
              đối tác…) hợp tác với Co-opBank để phát triển và cung cấp các sản
              phẩm, dịch vụ của Co-opBank; hoặc sử dụng thông tin với mục đích
              nghiên cứu đánh giá để hiểu về nhu cầu sử dụng sản phẩm dịch vụ
              ngân hàng của Tôi để phục vụ các nghiệp vụ ngân hàng; (iii) đã
              đọc, hiểu rõ, tự nguyện đồng ý và cam kết thực hiện Điều kiện,
              điều khoản các dịch vụ đăng ký tại Thỏa thuận này và đồng ý rằng
              khi đại diện của Co-opBank ký vào "Phần dành cho Ngân hàng" tại
              văn bản này thì văn bản này và Điều kiện, điều khoản các dịch vụ
              đăng ký tại Thỏa thuận này được coi là Hợp đồng và có giá trị ràng
              buộc các bên.
            </p>
            <p
              className="s7"
              style={{
                paddingLeft: "16pt",
                textIndent: "0pt",
                lineHeight: "114%",
                textAlign: "justify",
              }}
            >
              Tôi chịu trách nhiệm cập nhật và tự nguyện chấp thuận không kèm
              theo bất kỳ điều kiện nào đối với các Điều kiện, điều khoản nói
              trên được sửa đổi và đăng tải trên website chính thức của
              Co-opBank trong từng thời kỳ và/hoặc thông báo đến Tôi thông qua
              các kênh cung cấp dịch vụ của Co-opBank.
            </p>
          </li>
          <li data-list-text="3.">
            <p
              className="s7"
              style={{
                paddingLeft: "16pt",
                textIndent: "0pt",
                lineHeight: "114%",
                textAlign: "justify",
              }}
            >
              Tôi cam kết chịu trách nhiệm quản lý, sử dụng tài khoản và các
              dịch vụ Ngân hàng theo quy định của pháp luật và của Co-opBank.
              Trường hợp số điện thoại liên hệ của Tôi không phải số điện thoại
              di động chính chủ, Co-opBank được miễn trách nhiệm trong việc gửi
              thông tin cho Tôi qua số điện thoại liên hệ đã khai báo ở trên.
            </p>
          </li>
        </ol>

        <h1
          style={{
            paddingLeft: "375pt",
            textIndent: "0pt",
            lineHeight: "12pt",
            textAlign: "center",
          }}
        >
          Người đề nghị
        </h1>
        <p
          className="s8"
          style={{
            paddingLeft: "376pt",
            textIndent: "0pt",
            lineHeight: "13pt",
            textAlign: "center",
          }}
        >
          (Ký và ghi rõ họ tên)
        </p>

        <p style={{ textIndent: "0pt", textAlign: "left", height: "100px" }}>
          <br />
        </p>

        <p
          style={{
            paddingLeft: "11pt",
            textIndent: "0pt",
            lineHeight: "1pt",
            textAlign: "left",
            border: "1px solid",
          }}
        ></p>

        <h1
          style={{
            paddingTop: "4pt",
            paddingLeft: "13pt",
            textIndent: "0pt",
            textAlign: "justify",
          }}
        >
          PHẦN DÀNH CHO QTDND
        </h1>

        <div style={{ display: "flex", gap: "91px" }}>
          <div style={{ flex: "0.9" }}>
            <p
              className="s7"
              style={{
                paddingTop: "1pt",
                paddingLeft: "13pt",
                textIndent: "0pt",
                textAlign: "justify",
              }}
            >
              QTDND
              <input
                className="form_control"
                style={{ margin: "0 4pt", width: "320pt" }}
                type="text"
                name="qtdnd"
                id="qtdnd"
                value={formData.qtdnd || ""}
                onChange={(e) => handleChange("qtdnd", e.target.value)}
                onFocus={(e) => handleInputFocus("qtdnd", e.target)}
              />
            </p>
            <p
              className="s7"
              style={{
                paddingTop: "1pt",
                paddingLeft: "13pt",
                textIndent: "0pt",
                lineHeight: "115%",
                textAlign: "justify",
              }}
            >
              xác nhận tư vấn, giới thiệu cho khách hàng và xác thực đúng các
              thông tin trong hồ sơ khách hàng, xác thực đúng chữ ký khách hàng
              và chịu trách nhiệm trước pháp luật về tính xác thực trên
            </p>
          </div>
          <div>
            <h1
              style={{
                paddingLeft: "18pt",
                textIndent: "0pt",
                textAlign: "left",
              }}
            >
              Đại diện hợp pháp QTDND
            </h1>
            <p
              className="s8"
              style={{
                paddingLeft: "13pt",
                textIndent: "0pt",
                textAlign: "left",
              }}
            >
              (Ký, ghi rõ họ tên và đóng dấu)
            </p>
          </div>
        </div>

        <p style={{ textIndent: "0pt", textAlign: "left", height: "60px" }}>
          <br />
        </p>

        <p
          style={{
            paddingLeft: "11pt",
            textIndent: "0pt",
            lineHeight: "1pt",
            textAlign: "left",
            border: "1px solid",
          }}
        />

        <h1
          style={{
            paddingTop: "3pt",
            paddingLeft: "13pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          PHẦN DÀNH CHO NGÂN HÀNG
        </h1>

        <h1
          style={{
            paddingTop: "1pt",
            paddingLeft: "13pt",
            textIndent: "0pt",
            lineHeight: "114%",
            textAlign: "left",
          }}
        >
          Co-opBank đồng ý với những thông tin đăng ký mở hồ sơ thông tin khách
          hàng, tài khoản thanh toán và sử dụng dịch vụ của khách hàng tại
          Co-opBank.
        </h1>

        <p
          className="s7"
          style={{
            paddingLeft: "13pt",
            textIndent: "0pt",
            lineHeight: "12pt",
            textAlign: "left",
          }}
        >
          Số tài khoản:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "416pt" }}
              type="text"
              name="bank_account_number"
              id="bank_account_number"
              value={formData.bank_account_number || ""}
              onChange={(e) =>
                handleChange(
                  "bank_account_number",
                  e.target.value.replace(/[^0-9]/g, "")
                )
              }
              onFocus={(e) => handleInputFocus("bank_account_number", e.target)}
            />
          </span>
        </p>

        <p
          className="s7"
          style={{
            paddingTop: "1pt",
            paddingLeft: "13pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Ngày hoạt động tài khoản:
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "360pt" }}
              type="text"
              name="account_open_date"
              id="account_open_date"
              value={formData.account_open_date || ""}
              onChange={(e) =>
                handleChange("account_open_date", e.target.value)
              }
              onFocus={(e) => handleInputFocus("account_open_date", e.target)}
            />
          </span>
        </p>

        <p
          className="s7"
          style={{
            paddingTop: "2pt",
            paddingLeft: "13pt",
            textIndent: "0pt",
            textAlign: "left",
          }}
        >
          Số thẻ:{" "}
          <span className="p">
            <input
              className="form_control"
              style={{ margin: "0 4pt", width: "444pt" }}
              type="text"
              name="card_number"
              id="card_number"
              value={formData.card_number || ""}
              onChange={(e) =>
                handleChange(
                  "card_number",
                  e.target.value.replace(/[^0-9]/g, "")
                )
              }
              onFocus={(e) => handleInputFocus("card_number", e.target)}
            />
          </span>
        </p>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h1
              style={{
                paddingTop: "7pt",
                textIndent: "0pt",
                lineHeight: "13pt",
                textAlign: "center",
              }}
            >
              Giao dịch viên
            </h1>
            <p
              className="s8"
              style={{
                textIndent: "0pt",
                lineHeight: "13pt",
                textAlign: "center",
              }}
            >
              (Ký và ghi rõ họ tên)
            </p>
          </div>
          <div>
            <h1
              style={{
                paddingTop: "7pt",
                textIndent: "0pt",
                lineHeight: "13pt",
                textAlign: "center",
              }}
            >
              Kiểm soát viên
            </h1>
            <p
              className="s8"
              style={{
                textIndent: "0pt",
                lineHeight: "13pt",
                textAlign: "center",
              }}
            >
              (Ký và ghi rõ họ tên)
            </p>
          </div>
          <div>
            <h1
              style={{
                paddingTop: "7pt",
                textIndent: "0pt",
                lineHeight: "13pt",
                textAlign: "center",
              }}
            >
              Đại diện Co-opBank
            </h1>
            <p
              className="s8"
              style={{
                textIndent: "0pt",
                lineHeight: "13pt",
                textAlign: "center",
              }}
            >
              (Kí và đóng dấu)
            </p>
          </div>
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

export default Mau_1;
