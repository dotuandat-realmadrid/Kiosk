import React from "react";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";

const IdDisplayScreen = ({ idData, onBack, onContinue }) => {
  // console.log("🔍 [IdDisplayScreen] idData:", idData);

  if (!idData) {
    return (
      <div>
        <Header />
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            paddingTop: "120px",
            paddingBottom: "100px",
            minHeight: "calc(100vh - 220px)",
          }}
        >
          <div className="text-center">
            <div
              className="mx-auto mb-3"
              style={{
                width: "64px",
                height: "64px",
                border: "4px solid #667eea",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <p className="text-muted">Đang chờ dữ liệu từ thiết bị đọc...</p>
          </div>
        </div>
        <Footer />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const getStatusTag = (result) => {
    if (result === 0) {
      return {
        text: "Toàn vẹn dữ liệu",
        bgColor: "#fef3c7",
        textColor: "#92400e",
      };
    } else {
      return {
        text: "Lỗi đọc thẻ",
        bgColor: "#fee2e2",
        textColor: "#991b1b",
      };
    }
  };

  const statusTag = getStatusTag(idData.result);

  const customStyles = `
      body {
          justify-content: center;
          align-items: center;
          background: linear-gradient(180deg, #d4e5ff, #fef5f9);
      }
  `;

  return (
    <>
    <style>{customStyles}</style>
    <div>
      <Header />

      <div
        className="container"
        style={{
          paddingTop: "100px",
          paddingBottom: "100px",
          maxWidth: "1400px",
        }}
      >
        {/* Title Section */}
        <div className="text-center mb-4">
          <h1 className="display-5 fw-bold text-dark mb-3">
            Thông tin căn cước công dân
          </h1>
          <p className="text-muted">
            Dữ liệu được đồng bộ trực tiếp từ thiết bị đọc
          </p>
        </div>

        {/* Progress Steps */}
        <div className="d-flex justify-content-center align-items-center mb-5 gap-3">
          {/* Step 1 - Completed */}
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white"
              style={{
                width: "24px",
                height: "24px",
                backgroundColor: "#10b981",
              }}
            >
              ✓
            </div>
            <span className="small text-dark">Lấy thông tin GTTT</span>
          </div>

          <div
            style={{ width: "48px", height: "2px", backgroundColor: "#10b981" }}
          ></div>

          {/* Step 2 - Current */}
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
              style={{
                width: "24px",
                height: "24px",
                backgroundColor: "#667eea",
                fontSize: "12px",
              }}
            >
              2
            </div>
            <span className="small fw-semibold text-dark">
              Hiển thị thông tin
            </span>
          </div>

          <div
            style={{ width: "48px", height: "2px", backgroundColor: "#9ca3af" }}
          ></div>

          {/* Step 3 - Pending */}
          <div className="d-flex align-items-center gap-2 opacity-50">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
              style={{
                width: "24px",
                height: "24px",
                backgroundColor: "#9ca3af",
                fontSize: "12px",
              }}
            >
              3
            </div>
            <span className="small text-secondary">Xác thực khuôn mặt</span>
          </div>
        </div>

        {/* Main Content Card */}
        <div
          className="card border-0 shadow-sm position-relative"
          style={{
            background: "linear-gradient(135deg, white 0%, #cde7f6ff 100%)",
            borderRadius: "24px",
            padding: "40px",
          }}
        >
          {/* Badge */}
          <div className="position-absolute top-0 end-0 m-4">
            <span
              className="badge rounded-2"
              style={{
                backgroundColor: statusTag.bgColor,
                color: statusTag.textColor,
                fontSize: "12px",
                fontWeight: "600",
                padding: "6px 12px",
              }}
            >
              {statusTag.text}
            </span>
          </div>

          <h2 className="fs-4 fw-bold text-dark mb-4">Thông tin cá nhân</h2>

          <div className="row g-5">
            {/* Left Side - Photo */}
            <div className="col-12 col-lg-auto">
              <div>
                <p className="text-center fw-semibold text-dark mb-3">
                  Ảnh chân dung
                </p>
                <div
                  className="rounded-2 overflow-hidden border"
                  style={{
                    width: "180px",
                    height: "240px",
                    backgroundColor: "#f3f4f6",
                    borderColor: "#e5e7eb",
                  }}
                >
                  {idData.dg02 && idData.dg02.trim() !== "" ? (
                    <img
                      src={`data:image/jpeg;base64,${idData.dg02}`}
                      alt="Ảnh chân dung"
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted small">
                      Ảnh từ chip CCCD
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Information in 2 columns */}
            <div className="col-12 col-lg">
              <div className="row g-4">
                {/* Left Column */}
                <div className="col-12 col-md-6">
                  <div className="d-flex mb-3">
                    <label className="text-dark d-block mb-1">
                      Số CCCD:
                    </label>
                    <p
                      className="fw-semibold text-dark mb-0 ms-1"
                      style={{ fontSize: "15px" }}
                    >
                      {idData.eid_number || "N/A"}
                    </p>
                  </div>

                  <div className="d-flex mb-3">
                    <label className="text-dark d-block mb-1">
                      Ngày sinh:
                    </label>
                    <p
                      className="fw-semibold text-dark mb-0 ms-1"
                      style={{ fontSize: "15px" }}
                    >
                      {idData.date_of_birth || "N/A"}
                    </p>
                  </div>

                  <div className="d-flex -3">
                    <label className="text-dark d-block mb-1">
                      Quốc tịch:
                    </label>
                    <p
                      className="fw-semibold text-dark mb- ms-1"
                      style={{ fontSize: "15px" }}
                    >
                      {idData.nationality || "N/A"}
                    </p>
                  </div>

                  <div className="d-flex mb-3">
                    <label className="text-dark d-block mb-1">
                      Dân tộc:
                    </label>
                    <p
                      className="fw-semibold text-dark mb-0 ms-1"
                      style={{ fontSize: "15px" }}
                    >
                      {idData.ethnicity || "N/A"}
                    </p>
                  </div>

                  <div className="d-flex mb-3">
                    <label className="text-dark d-block mb-1">
                      Nơi thường trú:
                    </label>
                    <p
                      className="fw-semibold text-dark mb-0 ms-1"
                      style={{ fontSize: "15px" }}
                    >
                      {idData.place_of_residence ||
                        idData.place_of_residence_qr ||
                        "N/A"}
                    </p>
                  </div>

                  <div className="d-flex mb-3">
                    <label className="text-dark d-block mb-1">
                      Ngày cấp:
                    </label>
                    <p
                      className="fw-semibold text-dark mb-0 ms-1"
                      style={{ fontSize: "15px" }}
                    >
                      {idData.date_of_issue || idData.date_of_issue_qr || "N/A"}
                    </p>
                  </div>

                  <div className="d-flex mb-3">
                    <label className="text-dark d-block mb-1">
                      Ngày hết hạn:
                    </label>
                    <p
                      className="fw-semibold text-dark mb-0 ms-1"
                      style={{ fontSize: "15px" }}
                    >
                      {idData.date_of_expiry || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-12 col-md-6">
                  <div className="d-flex mb-3">
                    <label className="text-dark d-block mb-1">
                      Họ và tên:
                    </label>
                    <p
                      className="fw-semibold text-dark mb-0 ms-1"
                      style={{ fontSize: "15px" }}
                    >
                      {idData.full_name || "N/A"}
                    </p>
                  </div>

                  <div className="d-flex mb-3">
                    <label className="text-dark d-block mb-1">
                      Giới tính:
                    </label>
                    <p
                      className="fw-semibold text-dark mb-0 ms-1"
                      style={{ fontSize: "15px" }}
                    >
                      {idData.sex || "N/A"}
                    </p>
                  </div>

                  <div className="d-flex mb-3">
                    <label className="text-dark d-block mb-1">
                      Tôn giáo:
                    </label>
                    <p
                      className="fw-semibold text-dark mb-0 ms-1"
                      style={{ fontSize: "15px" }}
                    >
                      {idData.religion || "N/A"}
                    </p>
                  </div>

                  <div className="d-flex mb-3">
                    <label className="text-dark d-block mb-1">
                      Quê quán:
                    </label>
                    <p
                      className="fw-semibold text-dark mb-0 ms-1"
                      style={{ fontSize: "15px" }}
                    >
                      {idData.place_of_origin || "N/A"}
                    </p>
                  </div>

                  <div className="d-flex mb-3">
                    <label className="text-dark d-block mb-1">
                      Đặc điểm nhận dạng:
                    </label>
                    <p
                      className="fw-semibold text-dark mb-0 ms-1"
                      style={{ fontSize: "15px" }}
                    >
                      {idData.personal_identification || "N/A"}
                    </p>
                  </div>

                  <div className="d-flex mb-3">
                    <label className="text-dark d-block mb-1">
                      Nơi cấp:
                    </label>
                    <p
                      className="fw-semibold text-dark mb-0 ms-1"
                      style={{ fontSize: "15px" }}
                    >
                      {idData.date_of_issue
                        ? "Cục trưởng cục cảnh sát quản lý hành chính về trật tự xã hội"
                        : idData.date_of_issue_qr
                        ? "Bộ công an"
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Buttons - Outside Card */}
        <div className="d-flex justify-content-between mt-4">
          <button
            onClick={onBack}
            className="btn btn-secondary rounded-3 px-4 ms-5"
            style={{
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Quay lại
          </button>
          <button
            onClick={onContinue}
            className="btn rounded-3 px-4 text-white me-5"
            style={{
              backgroundColor: "#667eea",
              fontSize: "14px",
              fontWeight: "500",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#5568d3")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#667eea")}
          >
            Tiếp tục
          </button>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
    </>
  );
};

export default IdDisplayScreen;
