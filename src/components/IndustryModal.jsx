import React, { useState } from "react";
import { INDUSTRY_LIST } from "../assets/js/industry_list";

const IndustryModal = ({ show, onClose, onSelect }) => {
  const [expandedNodes, setExpandedNodes] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  if (!show) return null;

  const toggleNode = (code) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  // Kiểm tra xem có thể chọn được không (chỉ cho phép mức 4 hoặc 5)
  const isSelectable = (industry) => {
    if (!industry.code) return false;
    const codeLength = industry.code.length;
    return codeLength === 4 || codeLength === 5;
  };

  const handleSelect = (industry, parentIndustry = null) => {
    if (!isSelectable(industry)) return;

    const codeLength = industry.code.length;

    if (codeLength === 5 && parentIndustry) {
      // Mức 5: Lấy code mức 4, name hiển thị 2 dòng
      onSelect({
        industry_code: parentIndustry.code, // Code mức 4
        industry_name: `${parentIndustry.name}.\nChi tiết: ${industry.name}.`, // Name mức 4 + mức 5
      });
    } else if (codeLength === 4) {
      // Mức 4: Hiển thị bình thường
      onSelect({
        industry_code: industry.code,
        industry_name: industry.name,
      });
    }

    onClose();
  };

  const filterIndustries = (industries, term) => {
    if (!term) return industries;

    return industries.filter((industry) => {
      // Bỏ qua các node detail
      if (industry.content && industry.detail) return false;

      const matchesCurrent =
        industry.code?.toLowerCase().includes(term.toLowerCase()) ||
        industry.name?.toLowerCase().includes(term.toLowerCase());

      const hasMatchingChildren =
        industry.children &&
        filterIndustries(industry.children, term).length > 0;

      return matchesCurrent || hasMatchingChildren;
    });
  };

  const renderTreeNode = (industry, level = 0, parentIndustry = null) => {
    // Kiểm tra nếu là node detail
    if (industry.content && industry.detail) {
      const paddingLeft = level * 20 + 10;
      return (
        <div
          key={`detail-${level}`}
          style={{
            paddingLeft: `${paddingLeft}px`,
            paddingTop: "8px",
            paddingBottom: "8px",
            paddingRight: "10px",
          }}
        >
          <div
            style={{
              padding: "12px",
              background: "#fef3c7",
              borderRadius: "6px",
              borderLeft: "3px solid #f59e0b",
            }}
          >
            <div
              style={{
                fontWeight: "600",
                color: "#92400e",
                marginBottom: "6px",
                fontSize: "13px",
              }}
            >
              {industry.content}
            </div>
            <div
              style={{
                color: "#78350f",
                fontSize: "13px",
                lineHeight: "1.6",
                whiteSpace: "pre-line",
                textAlign: "justify",
              }}
            >
              {industry.detail}
            </div>
          </div>
        </div>
      );
    }

    const hasChildren = industry.children && industry.children.length > 0;
    const isExpanded = expandedNodes[industry.code];
    const paddingLeft = level * 20 + 10;
    const canSelect = isSelectable(industry);
    const codeLength = industry.code?.length || 0;

    const filteredChildren = searchTerm
      ? filterIndustries(industry.children || [], searchTerm)
      : industry.children || [];

    // Nếu mức 4 thì parent của mức 5 chính là nó
    const currentParent = codeLength === 4 ? industry : parentIndustry;

    return (
      <div key={industry.code}>
        <div
          className="industry-item"
          style={{
            paddingLeft: `${paddingLeft}px`,
            paddingTop: "8px",
            paddingBottom: "8px",
            borderBottom: "1px solid #f1f5f9",
            cursor: canSelect ? "pointer" : "default",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (canSelect) {
              e.currentTarget.style.backgroundColor = "#f8fafc";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "white";
          }}
        >
          <div className="d-flex align-items-center">
            {hasChildren ? (
              <button
                className="btn btn-sm p-0 me-2"
                style={{
                  width: "20px",
                  height: "20px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(industry.code);
                }}
              >
                <span style={{ fontSize: "14px", lineHeight: 1 }}>
                  {isExpanded ? "-" : "+"}
                </span>
              </button>
            ) : (
              <div
                className="btn btn-sm p-0 me-2"
                style={{
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  justifyContent: "center",
                  fontSize: "14px",
                  lineHeight: "1",
                }}
              >
                <span style={{ fontSize: "14px", lineHeight: 1 }}>-</span>
              </div>
            )}
            <div
              className="flex-grow-1"
              onClick={() => canSelect && handleSelect(industry, currentParent)}
            >
              <span
                style={{
                  fontWeight: level === 0 ? "600" : "500",
                  marginRight: "12px",
                  color: "#dc2626",
                  fontSize: level === 0 ? "15px" : "14px",
                }}
              >
                {industry.code}
              </span>
              <span
                style={{
                  color: "#1e293b",
                  fontSize: level === 0 ? "15px" : "14px",
                }}
              >
                {industry.name}
              </span>
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {filteredChildren.map((child) =>
              renderTreeNode(child, level + 1, currentParent)
            )}
          </div>
        )}
      </div>
    );
  };

  const filteredIndustries = filterIndustries(INDUSTRY_LIST, searchTerm);

  return (
    <>
      <div
        className="modal-backdrop"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1040,
          animation: "fadeIn 0.3s ease",
          width: "min-content",
          height: "min-content",
        }}
        onClick={onClose}
      />
      <div
        className="modal"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1050,
          width: "90%",
          maxWidth: "900px",
          maxHeight: "80vh",
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          animation: "slideIn 0.3s ease",
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h5 className="mb-0" style={{ color: "#1e293b", fontWeight: "600" }}>
            Chọn ngành nghề kinh doanh
          </h5>
          <button
            className="btn-close"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div
          style={{ padding: "16px 24px", borderBottom: "1px solid #e2e8f0" }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm theo mã hoặc tên ngành..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: "1.5px solid #e2e8f0",
              borderRadius: "8px",
              padding: "10px 16px",
            }}
          />
        </div>

        {/* Body */}
        <div
          className="modal-body"
          style={{
            padding: "0",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {filteredIndustries.length > 0 ? (
            filteredIndustries.map((industry) => renderTreeNode(industry))
          ) : (
            <div
              style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}
            >
              Không tìm thấy kết quả phù hợp
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="modal-footer"
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            className="btn btn-secondary"
            onClick={onClose}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "1.5px solid #cbd5e1",
              background: "white",
              color: "#475569",
            }}
          >
            Đóng
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
        .modal-body::-webkit-scrollbar {
          width: 8px;
        }
        .modal-body::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .modal-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .modal-body::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
};

export default IndustryModal;
