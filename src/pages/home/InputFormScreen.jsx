import React, { useState, useRef, useEffect } from "react";
import { TEMPLATE_MAPPING } from "../../assets/js/template_mapping";
import {
  VIETNAM_PROVINCES,
  VIETNAM_WARDS,
} from "../../../assets/js/provinces_ward";
import VirtualKeyboard, { processVietnameseInput } from "./VirtualKeyboard";
import IndustryModal from "./IndustryModal";

const InputFormScreen = ({ serviceKey, serviceName, onSubmit, onCancel }) => {
  // ===== STATE MANAGEMENT =====
  const [collapsedSections, setCollapsedSections] = useState({});
  const [activeDropdownField, setActiveDropdownField] = useState(null);
  const [filteredOptionsMap, setFilteredOptionsMap] = useState({});
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [selectedModalCell, setSelectedModalCell] = useState(null); // { fieldName, rowIndex, columnName }
  const activeInputRef = useRef(null);

  const initializeFormData = () => {
    const template = TEMPLATE_MAPPING[serviceKey];

    if (!template) {
      return {};
    }

    const data = {};
    template.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.type === "checkbox-single" && field.options) {
          if (field.multiple === true) {
            const checkedOptions = [];
            field.options.forEach((opt) => {
              if (
                typeof opt === "object" &&
                opt !== null &&
                opt.checked === true
              ) {
                checkedOptions.push(opt.value || opt.label);
              }
            });
            data[field.name] = checkedOptions;
          } else {
            let checkedValue = "";
            for (let opt of field.options) {
              if (
                typeof opt === "object" &&
                opt !== null &&
                opt.checked === true
              ) {
                checkedValue = opt.value || opt.label;
                break;
              }
            }
            data[field.name] = checkedValue;
          }
        }
        // ✅ THÊM: Xử lý khởi tạo cho table
        else if (field.type === "table") {
          // Tạo mảng với 1 hàng mặc định có ĐẦY ĐỦ các trường
          const defaultRow = { ...field.defaultRow };
          // Đảm bảo TẤT CẢ các column đều có giá trị
          field.columns.forEach((col) => {
            if (!defaultRow.hasOwnProperty(col.name)) {
              defaultRow[col.name] = "";
            }
          });
          // ✅ Tự động set STT = "1" cho hàng đầu tiên
          if (field.columns.some((c) => c.name === "stt")) {
            defaultRow.stt = "1";
          }
          data[field.name] = [defaultRow];
        } else {
          data[field.name] = field.defaultValue || "";
        }
      });
    });

    return data;
  };

  const [formData, setFormData] = useState(initializeFormData);

  useEffect(() => {}, []);

  // ===== HANDLE CHANGE =====
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Filter dropdown tỉnh/thành, phường/xã
    if (field.endsWith("_province") || field === "document_location") {
      const filtered = VIETNAM_PROVINCES.filter((p) =>
        p.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptionsMap((prev) => ({ ...prev, [field]: filtered }));

      if (field.endsWith("_province")) {
        const wardField = field.replace("_province", "_ward");
        setFormData((prev) => ({ ...prev, [wardField]: "" }));
      }
    } else if (field.endsWith("_ward")) {
      const provinceField = field.replace("_ward", "_province");
      const province = formData[provinceField];
      if (province && VIETNAM_WARDS[province]) {
        const filtered = VIETNAM_WARDS[province].filter((w) =>
          w.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOptionsMap((prev) => ({ ...prev, [field]: filtered }));
      }
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
        handleChange(tableName, updated);
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
      handleChange(tableName, updated);
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

  const handleSubmit = () => {
    let processed = { ...formData };
    const date = processed.document_date || "";
    const parts = date.split("-");
    processed.year = parts[0] || ".......";
    processed.month = parts[1] || ".......";
    processed.day = parts[2] || ".......";

    Object.keys(processed).forEach((k) => {
      // BỎ QUA các trường table - không ghi đè chúng
      if (Array.isArray(processed[k])) {
        return; // Giữ nguyên dữ liệu table
      }

      if (k === "document_location" && !processed[k]) {
        processed[k] = "..........";
      } else if (!processed[k]) {
        processed[k] = "...................................";
      }
    });

    onSubmit(processed);
  };

  const toggleSection = (idx) => {
    setCollapsedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const shouldShowField = (field) => {
    if (!field.conditional) return true;
    return formData[field.conditional.field] === field.conditional.value;
  };

  // ===== MODAL HANDLERS (DI CHUYỂN RA NGOÀI) =====
  const handleOpenModal = (fieldName, rowIndex, columnName) => {
    setSelectedModalCell({ fieldName, rowIndex, columnName });
    setShowIndustryModal(true);
  };

  const handleModalSelect = (selectedIndustry) => {
    if (!selectedModalCell) return;

    const { fieldName, rowIndex, columnName } = selectedModalCell;
    const tableData = formData[fieldName] || [];

    // console.log("TRƯỚC KHI UPDATE:", tableData[rowIndex]);

    const updated = [...tableData];

    // ✅ Nếu row chưa tồn tại, tạo mới với ĐẦY ĐỦ các trường từ template
    if (!updated[rowIndex]) {
      const template = TEMPLATE_MAPPING[serviceKey];
      const tableField = template.sections
        .flatMap((s) => s.fields)
        .find((f) => f.name === fieldName);

      if (tableField) {
        updated[rowIndex] = { ...tableField.defaultRow };
        // Đảm bảo có tất cả các column
        tableField.columns.forEach((col) => {
          if (!updated[rowIndex].hasOwnProperty(col.name)) {
            updated[rowIndex][col.name] = "";
          }
        });
        // ✅ Tự động set STT dựa trên rowIndex
        if (tableField.columns.some((c) => c.name === "stt")) {
          updated[rowIndex].stt = (rowIndex + 1).toString();
        }
      } else {
        updated[rowIndex] = {};
      }
    }

    // Bây giờ mới cập nhật industry fields
    updated[rowIndex] = {
      ...updated[rowIndex], // ← Giờ đã có đầy đủ trường để spread
      industry_code: selectedIndustry.industry_code || "",
      industry_name: selectedIndustry.industry_name || "",
    };

    // console.log("SAU KHI UPDATE:", updated[rowIndex]);

    handleChange(fieldName, updated);
    setShowIndustryModal(false);
    setSelectedModalCell(null);
  };

  // ===== RENDER FIELD =====
  const renderField = (field) => {
    if (!shouldShowField(field)) return null;
    const colClass = field.col ? `col-md-${field.col}` : "col-12";

    switch (field.type) {
      case "text":
      case "email":
        return (
          <div key={field.name} className={colClass}>
            <label className="form-label">
              {field.label}{" "}
              {field.required && <span className="text-danger">*</span>}
            </label>
            <input
              type="text"
              className="form-control"
              placeholder={field.placeholder || ""}
              value={formData[field.name] || ""}
              onFocus={(e) => handleInputFocus(field.name, e.target)}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case "tel":
        return (
          <div key={field.name} className={colClass}>
            <label className="form-label">
              {field.label}{" "}
              {field.required && <span className="text-danger">*</span>}
            </label>
            <input
              type="tel"
              className="form-control"
              placeholder={field.placeholder || ""}
              value={formData[field.name] || ""}
              inputMode="numeric"
              pattern="[0-9]*"
              onFocus={(e) => handleInputFocus(field.name, e.target)}
              onChange={(e) => {
                const onlyNumber = e.target.value.replace(/[^0-9]/g, "");
                handleChange(field.name, onlyNumber);
              }}
              required={field.required}
            />
          </div>
        );

      case "date":
        return (
          <div key={field.name} className={colClass}>
            <label className="form-label">
              {field.label}{" "}
              {field.required && <span className="text-danger">*</span>}
            </label>
            <input
              type="date"
              className="form-control"
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className={colClass}>
            <label className="form-label">
              {field.label}{" "}
              {field.required && <span className="text-danger">*</span>}
            </label>
            <textarea
              className="form-control"
              rows={field.rows || 3}
              placeholder={field.placeholder || ""}
              value={formData[field.name] || ""}
              onFocus={(e) => handleInputFocus(field.name, e.target)}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
            ></textarea>
          </div>
        );

      case "select":
        return (
          <div key={field.name} className={colClass}>
            <label className="form-label">
              {field.label}{" "}
              {field.required && <span className="text-danger">*</span>}
            </label>
            <select
              className="form-select"
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
            >
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "select-with-input":
        const isWardField = field.name.endsWith("_ward");
        const isProvinceField =
          field.name.endsWith("_province") ||
          field.name === "document_location";

        let dropdownOptions = [];
        if (isProvinceField) {
          dropdownOptions = VIETNAM_PROVINCES;
        } else if (isWardField) {
          const provinceFieldName = field.name.replace("_ward", "_province");
          const selectedProvince = formData[provinceFieldName];
          if (selectedProvince && VIETNAM_WARDS[selectedProvince]) {
            dropdownOptions = VIETNAM_WARDS[selectedProvince];
          }
        }

        const isDropdownActive = activeDropdownField === field.name;
        const filtered = filteredOptionsMap[field.name] || [];

        return (
          <div
            key={field.name}
            className={colClass}
            style={{ position: "relative" }}
          >
            <label className="form-label">
              {field.label}{" "}
              {field.required && <span className="text-danger">*</span>}
            </label>
            <input
              type="text"
              className="form-control"
              placeholder={field.placeholder}
              value={formData[field.name] || ""}
              onChange={(e) => {
                handleChange(field.name, e.target.value);
                const filteredList = dropdownOptions.filter((opt) =>
                  opt.toLowerCase().includes(e.target.value.toLowerCase())
                );
                setFilteredOptionsMap((prev) => ({
                  ...prev,
                  [field.name]: filteredList,
                }));
              }}
              onFocus={(e) => {
                setActiveDropdownField(field.name);
                setFilteredOptionsMap((prev) => ({
                  ...prev,
                  [field.name]: dropdownOptions,
                }));
                handleInputFocus(field.name, e.target);
              }}
              required={field.required}
              autoComplete="off"
            />
            {isDropdownActive && filtered.length > 0 && (
              <div className="province-dropdown">
                {filtered.map((option) => (
                  <div
                    key={option}
                    className="province-item"
                    onClick={() => {
                      handleChange(field.name, option);
                      setActiveDropdownField(null);
                      setFilteredOptionsMap((prev) => ({
                        ...prev,
                        [field.name]: [],
                      }));
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
            {isDropdownActive && (
              <div
                className="province-overlay"
                onClick={() => {
                  setActiveDropdownField(null);
                  setFilteredOptionsMap((prev) => ({
                    ...prev,
                    [field.name]: [],
                  }));
                }}
              />
            )}
          </div>
        );

      case "radio":
        return (
          <div key={field.name} className={colClass}>
            <label className="form-label">
              {field.label}{" "}
              {field.required && <span className="text-danger">*</span>}
            </label>
            <div
              className={
                field.vertical ? "d-flex flex-column gap-2" : "checkbox-group"
              }
            >
              {field.options.map((opt) => (
                <div key={opt.value} className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name={field.name}
                    id={`${field.name}-${opt.value}`}
                    checked={formData[field.name] === opt.value}
                    onChange={() => handleChange(field.name, opt.value)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`${field.name}-${opt.value}`}
                  >
                    {opt.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case "checkbox-single":
        const normalizedOptions = field.options.map((opt) => {
          if (typeof opt === "string") {
            return {
              label: opt,
              value: opt,
              checked: false,
              showInput: false,
            };
          }
          return {
            label: opt.label || opt.value,
            value: opt.value || opt.label,
            checked: opt.checked || false,
            showInput: opt.showInput || false,
          };
        });

        const hasOtherOption = normalizedOptions.some(
          (opt) =>
            opt.label === "Khác" ||
            opt.value === "Khác" ||
            opt.showInput === true
        );
        const otherFieldName = `${field.name}_other`;
        const isMultiple = field.multiple === true;

        if (isMultiple) {
          const selectedValues = Array.isArray(formData[field.name])
            ? formData[field.name]
            : [];
          const isOtherSelected = selectedValues.includes("Khác");

          return (
            <div key={field.name} className={colClass}>
              <label className="form-label">
                {field.label}{" "}
                {field.required && <span className="text-danger">*</span>}
              </label>
              <div
                className={
                  field.vertical ? "d-flex flex-column gap-2" : "checkbox-group"
                }
              >
                {normalizedOptions.map((opt) => {
                  const isChecked = selectedValues.includes(opt.value);

                  return (
                    <div key={opt.value} className="checkbox-item">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`${field.name}-${opt.value}`}
                          checked={isChecked}
                          onChange={(e) => {
                            let newValues;
                            if (e.target.checked) {
                              newValues = [...selectedValues, opt.value];
                            } else {
                              newValues = selectedValues.filter(
                                (v) => v !== opt.value
                              );
                              if (opt.showInput) {
                                handleChange(otherFieldName, "");
                              }
                            }
                            handleChange(field.name, newValues);
                          }}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`${field.name}-${opt.value}`}
                        >
                          {opt.label}
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasOtherOption && isOtherSelected && (
                <div className="mt-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Vui lòng ghi rõ"
                    value={formData[otherFieldName] || ""}
                    onFocus={(e) => handleInputFocus(otherFieldName, e.target)}
                    onChange={(e) =>
                      handleChange(otherFieldName, e.target.value)
                    }
                  />
                </div>
              )}
            </div>
          );
        }

        const selectedOption = normalizedOptions.find(
          (opt) => opt.value === formData[field.name]
        );

        const isOtherSelected = selectedOption?.showInput === true;

        return (
          <div key={field.name} className={colClass}>
            <label className="form-label">
              {field.label}{" "}
              {field.required && <span className="text-danger">*</span>}
            </label>
            <div
              className={
                field.vertical ? "d-flex flex-column gap-2" : "checkbox-group"
              }
            >
              {normalizedOptions.map((opt) => {
                const isChecked = formData[field.name] === opt.value;

                return (
                  <div key={opt.value} className="checkbox-item">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`${field.name}-${opt.value}`}
                        checked={isChecked}
                        onChange={(e) => {
                          handleChange(
                            field.name,
                            e.target.checked ? opt.value : ""
                          );
                          if (opt.showInput && !e.target.checked) {
                            handleChange(otherFieldName, "");
                          }
                        }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`${field.name}-${opt.value}`}
                      >
                        {opt.label}
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            {isOtherSelected && (
              <div className="mt-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Vui lòng ghi rõ"
                  value={formData[otherFieldName] || ""}
                  onFocus={(e) => handleInputFocus(otherFieldName, e.target)}
                  onChange={(e) => handleChange(otherFieldName, e.target.value)}
                />
              </div>
            )}
          </div>
        );

      case "table":
        const tableData =
          Array.isArray(formData[field.name]) && formData[field.name].length > 0
            ? formData[field.name]
            : (() => {
                const defaultRow = { ...field.defaultRow };
                field.columns.forEach((col) => {
                  if (!defaultRow.hasOwnProperty(col.name)) {
                    defaultRow[col.name] = "";
                  }
                });
                // ✅ Tự động set STT = "1"
                if (field.columns.some((c) => c.name === "stt")) {
                  defaultRow.stt = "1";
                }
                return [defaultRow];
              })();

        const handleTableChange = (rowIdx, colName, val) => {
          const updated = [...tableData];
          updated[rowIdx] = { ...updated[rowIdx], [colName]: val };
          updated.forEach((r, i) => {
            if (field.columns.some((c) => c.name === "stt"))
              r.stt = (i + 1).toString();
          });
          handleChange(field.name, updated);
        };

        const addRow = () => {
          const newRow = { ...field.defaultRow };
          // Đảm bảo có TẤT CẢ các trường từ columns
          field.columns.forEach((col) => {
            if (!newRow.hasOwnProperty(col.name)) {
              newRow[col.name] = "";
            }
          });

          const updated = [...tableData, newRow];

          // ✅ Cập nhật lại STT cho TẤT CẢ các hàng
          updated.forEach((r, i) => {
            if (field.columns.some((c) => c.name === "stt")) {
              r.stt = (i + 1).toString();
            }
          });

          handleChange(field.name, updated);
        };

        const deleteRow = (rowIdx) => {
          if (tableData.length <= (field.minRows || 1)) return;
          let updated = tableData.filter((_, i) => i !== rowIdx);
          updated.forEach((r, i) => {
            if (field.columns.some((c) => c.name === "stt"))
              r.stt = (i + 1).toString();
          });
          handleChange(field.name, updated);
        };

        return (
          <div key={field.name} className={colClass}>
            <label className="form-label">
              {field.label}{" "}
              {field.required && <span className="text-danger">*</span>}
            </label>
            <div
              className="table-responsive"
              style={{ paddingBottom: "24px", overflowX: "auto" }}
            >
              <table
                className="table table-bordered"
                style={{ tableLayout: "fixed", minWidth: "100%" }}
              >
                <thead>
                  <tr>
                    {field.columns.map((col) => (
                      <th
                        key={col.name}
                        style={{
                          width: col.width || "auto",
                          minWidth: col.width || "auto",
                          backgroundColor: "#f8f9fa",
                          wordWrap: "break-word" /* Tự động xuống dòng */,
                          wordBreak: "break-word" /* Ngắt từ dài */,
                          whiteSpace: "pre-line" /* Cho phép xuống dòng */,
                          verticalAlign: "middle" /* Căn trên cùng */,
                        }}
                      >
                        {col.label}
                      </th>
                    ))}
                    <th
                      style={{
                        width: "80px",
                        minWidth: "80px",
                        backgroundColor: "#f8f9fa",
                        verticalAlign: "middle" /* Căn trên cùng */,
                      }}
                    >
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {field.columns.map((col) => {
                        const cellKey = `${field.name}_${rowIdx}_${col.name}`;
                        return (
                          <td
                            key={col.name}
                            style={{
                              verticalAlign: "middle",
                              width: col.width || "auto",
                              minWidth: col.width || "auto",
                              wordWrap: "break-word" /* Tự động xuống dòng */,
                              wordBreak: "break-word" /* Ngắt từ dài */,
                              whiteSpace: "pre-line" /* Cho phép xuống dòng */,
                            }}
                          >
                            {col.name === "stt" ? (
                              <div className="text-center">{rowIdx + 1}</div>
                            ) : col.type === "checkbox" ? (
                              <div className="text-center">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={!!row[col.name]}
                                  onChange={(e) =>
                                    handleTableChange(
                                      rowIdx,
                                      col.name,
                                      e.target.checked ? "x" : ""
                                    )
                                  }
                                />
                              </div>
                            ) : col.type === "date" ? (
                              <input
                                type="date"
                                className="form-control form-control-sm"
                                value={row[col.name] || ""}
                                onChange={(e) =>
                                  handleTableChange(
                                    rowIdx,
                                    col.name,
                                    e.target.value
                                  )
                                }
                              />
                            ) : col.type === "select-with-input" ? (
                              // === SELECT-WITH-INPUT TRONG TABLE ===
                              <div style={{ position: "relative" }}>
                                {(() => {
                                  const isWard = col.name.endsWith("_ward");
                                  const isProv = col.name.endsWith("_province");
                                  let opts = [];
                                  if (isProv) opts = VIETNAM_PROVINCES;
                                  else if (isWard) {
                                    const pField = col.name.replace(
                                      "_ward",
                                      "_province"
                                    );
                                    const p = row[pField];
                                    if (p && VIETNAM_WARDS[p])
                                      opts = VIETNAM_WARDS[p];
                                  }

                                  const active =
                                    activeDropdownField === cellKey;
                                  const filtered =
                                    filteredOptionsMap[cellKey] || [];

                                  return (
                                    <>
                                      <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder={
                                          col.placeholder || "Chọn..."
                                        }
                                        value={row[col.name] || ""}
                                        onChange={(e) => {
                                          handleTableChange(
                                            rowIdx,
                                            col.name,
                                            e.target.value
                                          );
                                          const f = opts.filter((o) =>
                                            o
                                              .toLowerCase()
                                              .includes(
                                                e.target.value.toLowerCase()
                                              )
                                          );
                                          setFilteredOptionsMap((prev) => ({
                                            ...prev,
                                            [cellKey]: f,
                                          }));
                                        }}
                                        onFocus={(e) => {
                                          setActiveDropdownField(cellKey);
                                          setFilteredOptionsMap((prev) => ({
                                            ...prev,
                                            [cellKey]: opts,
                                          }));
                                          handleInputFocus(cellKey, e.target);
                                        }}
                                        autoComplete="off"
                                      />
                                      {active && filtered.length > 0 && (
                                        <div
                                          className="province-dropdown"
                                          style={{ zIndex: 1050 }}
                                        >
                                          {filtered.map((opt) => (
                                            <div
                                              key={opt}
                                              className="province-item"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const updated = [...tableData];
                                                updated[rowIdx][col.name] = opt;
                                                if (isProv) {
                                                  const wField =
                                                    col.name.replace(
                                                      "_province",
                                                      "_ward"
                                                    );
                                                  updated[rowIdx][wField] = "";
                                                }
                                                handleChange(
                                                  field.name,
                                                  updated
                                                );
                                                setActiveDropdownField(null);
                                                setFilteredOptionsMap(
                                                  (prev) => ({
                                                    ...prev,
                                                    [cellKey]: [],
                                                  })
                                                );
                                              }}
                                            >
                                              {opt}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {active && (
                                        <div
                                          className="province-overlay"
                                          style={{ zIndex: 1040 }}
                                          onClick={() => {
                                            setActiveDropdownField(null);
                                            setFilteredOptionsMap((prev) => ({
                                              ...prev,
                                              [cellKey]: [],
                                            }));
                                          }}
                                        />
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            ) : col.type === "modal-select" ? (
                              // === MODAL-SELECT TRONG TABLE ===
                              <div style={{ position: "relative" }}>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={row[col.name] || ""}
                                  readOnly
                                  placeholder="Chọn"
                                  onClick={() =>
                                    handleOpenModal(
                                      field.name,
                                      rowIdx,
                                      col.name
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
                                      field.name,
                                      rowIdx,
                                      col.name
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
                            ) : col.type === "textarea" ? (
                              <textarea
                                className="form-control form-control-sm"
                                rows={col.rows || 2}
                                value={row[col.name] || ""}
                                onChange={(e) =>
                                  handleTableChange(
                                    rowIdx,
                                    col.name,
                                    e.target.value
                                  )
                                }
                                onFocus={(e) =>
                                  handleInputFocus(cellKey, e.target)
                                }
                              />
                            ) : (
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={row[col.name] || ""}
                                onChange={(e) =>
                                  handleTableChange(
                                    rowIdx,
                                    col.name,
                                    e.target.value
                                  )
                                }
                                onFocus={(e) =>
                                  handleInputFocus(cellKey, e.target)
                                }
                              />
                            )}
                          </td>
                        );
                      })}
                      <td className="text-center align-middle">
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteRow(rowIdx)}
                          disabled={tableData.length <= (field.minRows || 1)}
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
              <button
                type="button"
                className="btn btn-sm btn-outline-primary mt-2"
                onClick={addRow}
              >
                <svg
                  style={{ width: "14px", height: "14px", marginRight: "4px" }}
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
                Thêm hàng
              </button>
            </div>

            {/* Modal */}
            <IndustryModal
              show={showIndustryModal}
              onClose={() => {
                setShowIndustryModal(false);
                setSelectedModalCell(null);
              }}
              onSelect={handleModalSelect}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const template = TEMPLATE_MAPPING[serviceKey];

  if (!template) {
    return (
      <div className="gradient-bg d-flex align-items-center justify-content-center p-4">
        <div className="alert alert-warning">
          Không tìm thấy template cho dịch vụ này.
        </div>
      </div>
    );
  }

  const customStyles = `
    .gradient-bg {
      // background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #ecfeff 100%);
      min-height: 100vh;
    }
    .form-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: 24px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .form-section {
      border-left: 3px solid #2563eb;
      padding-left: 1rem;
      margin-bottom: 2rem;
    }
    .form-section.collapsible {
      cursor: pointer;
    }
    .form-section.collapsible .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .form-label {
      font-weight: 500;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }
    .form-control, .form-select {
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.625rem 0.875rem;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .form-control:focus, .form-select:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 246, 0.1);
    }
    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .checkbox-item {
      flex: 1;
      min-width: 200px;
    }
    .form-check-input:checked {
      background-color: #2563eb;
      border-color: #2563eb;
    }
    .btn-primary {
      background: linear-gradient(135deg, #2563eb, #06b6d4);
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 12px;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(37, 99, 246, 0.3);
    }
    .btn-secondary {
      border: 1.5px solid #cbd5e1;
      background: white;
      padding: 0.75rem 2rem;
      border-radius: 12px;
      font-weight: 500;
      color: #475569;
      transition: all 0.3s ease;
    }
    .btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(37, 99, 246, 0.3);
    }
    
    .province-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 999;
    }
    .province-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 4px;
      background: white;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      max-height: 150px;
      overflow-y: auto;
      z-index: 1000;
    }
    .province-item {
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 1px solid #f1f5f9;
    }
    .province-item:last-child {
      border-bottom: none;
    }
    .province-item:hover {
      background: #f1f5f9;
      color: #2563eb;
    }
    .province-dropdown::-webkit-scrollbar {
      width: 6px;
    }
    .province-dropdown::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 8px;
    }
    .province-dropdown::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 8px;
    }
    .province-dropdown::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .table td, .table th {
      white-space: nowrap;
    }
  `;

  return (
    <>
      <style>{customStyles}</style>
      <div className="gradient-bg d-flex align-items-center justify-content-center p-4">
        <div className="form-card" style={{ maxWidth: "900px", width: "100%" }}>
          <div className="p-4 border-bottom">
            <div className="d-flex align-items-center gap-3 mb-2">
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "linear-gradient(135deg, #2563eb, #06b6d4)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  className="text-white"
                  style={{ width: "24px", height: "24px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="mb-1 fw-bold" style={{ color: "#1e293b" }}>
                  Nhập thông tin bổ sung
                </h3>
                <p className="mb-0 text-muted small">{serviceName}</p>
              </div>
            </div>
          </div>

          <div
            className="p-4"
            style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}
          >
            <div className="alert alert-info mb-4">
              <small>
                <strong>Lưu ý:</strong> Vui lòng điền các thông tin còn thiếu để
                hoàn thiện biểu mẫu. Thông tin từ CCCD đã được tự động điền.
              </small>
            </div>

            {template.sections.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className={`form-section ${
                  section.collapsible ? "collapsible" : ""
                }`}
              >
                <div
                  className={section.collapsible ? "section-header" : ""}
                  onClick={
                    section.collapsible
                      ? () => toggleSection(sectionIndex)
                      : undefined
                  }
                >
                  <h6
                    className="fw-bold mb-2"
                    style={{ color: "#2563eb", whiteSpace: "pre-line" }}
                  >
                    {section.title}
                  </h6>
                  {section.collapsible && (
                    <svg
                      style={{
                        width: "20px",
                        height: "20px",
                        transform: collapsedSections[sectionIndex]
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </div>

                {(!section.collapsible || !collapsedSections[sectionIndex]) && (
                  <div className="row g-3">
                    {section.fields.map((field) => renderField(field))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-top d-flex justify-content-end gap-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              <svg
                style={{ width: "16px", height: "16px", marginRight: "8px" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              <svg
                style={{ width: "16px", height: "16px", marginRight: "8px" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Tiếp tục tạo PDF
            </button>
          </div>
        </div>
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

            // Kiểm tra nếu là field trong table
            const tableMatch = activeField.match(/^(.+)_(\d+)_(.+)$/);
            if (tableMatch) {
              const [, tableName, rowIdx, colName] = tableMatch;
              const tableData = formData[tableName] || [];
              return tableData[parseInt(rowIdx)]?.[colName] || "";
            }

            // Field thông thường
            return formData[activeField] || "";
          })()}
        />
      )}
    </>
  );
};

export default InputFormScreen;
