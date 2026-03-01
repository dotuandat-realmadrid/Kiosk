import React, { useState, useEffect, useRef } from "react"
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";;
import idrdVideo from "../../assets/images/IDRD-09.mp4";

const LoadingScreen = ({ currentStep }) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setDots((prev) => (prev === "..." ? "" : prev + "."));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      title: "Lấy thông tin GTTT",
      description: "Đang chờ dữ liệu từ thiết bị đọc",
    },
    {
      title: "Hiển thị thông tin",
      description: "Đang xử lý và hiển thị dữ liệu",
    },
    {
      title: "Xác thực khuôn mặt",
      description: "Vui lòng nhìn vào camera để xác thực",
    },
  ];

  const getStatusText = () => {
    if (currentStep === 0) {
      return `Đang chờ dữ liệu từ thiết bị${dots}`;
    } else if (currentStep === 1) {
      return "Đang xử lý dữ liệu...";
    }
    return "Đang xử lý...";
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
  `;

  return (
    <>
    <style>{customStyles}</style>
    <div>
      <Header />

      <div
        className="container-fluid"
        style={{
          paddingTop: "120px",
          paddingBottom: "100px",
          maxWidth: "1400px",
        }}
      >
        <div className="row g-4 px-4">
          {/* Left Section - Process Steps */}
          <div className="col-12 col-lg-auto" style={{ flex: "0 0 360px" }}>
            <div
              className="card shadow-sm border-0 h-100"
              style={{ borderRadius: "24px" }}
            >
              <div className="card-body p-4">
                <h2 className="fs-6 fw-semibold text-dark mb-2 lh-sm text-center">
                  Vui lòng đặt căn cước công dân
                  <br />
                  vào máy đọc
                </h2>

                <p className="text-muted small text-center mb-5">
                  {getStatusText()}
                </p>

                {/* Loading Animation */}
                <div
                  className="position-relative mx-auto mb-5"
                  style={{ width: "80px", height: "80px" }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      opacity: "0.1",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      border: "4px solid #667eea",
                      borderTopColor: "transparent",
                      animation:
                        currentStep < 2 ? "spin 1s linear infinite" : "none",
                    }}
                  ></div>
                  {currentStep < 2 ? (
                    <svg
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "30px",
                        height: "30px",
                        color: "#667eea",
                      }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "35px",
                        height: "35px",
                        color: "#10b981",
                      }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </div>

                {/* Step 1 - Đọc thẻ CCCD */}
                <div className="d-flex align-items-start mb-4">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3"
                    style={{
                      width: "24px",
                      height: "24px",
                      backgroundColor: currentStep > 0 ? "#10b981" : "#667eea",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {currentStep > 0 ? "✓" : "1"}
                  </div>
                  <div>
                    <div className="small fw-semibold text-dark mb-1">
                      Lấy thông tin GTTT
                    </div>
                    <div className="small text-muted">
                      {currentStep > 0 ? "Hoàn thành" : "Đang đọc thẻ căn cước"}
                    </div>
                  </div>
                </div>

                {/* Step 2 - Hiển thị thông tin */}
                <div
                  className="d-flex align-items-start mb-4"
                  style={{ opacity: currentStep >= 1 ? 1 : 0.3 }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3"
                    style={{
                      width: "24px",
                      height: "24px",
                      backgroundColor:
                        currentStep > 1
                          ? "#10b981"
                          : currentStep === 1
                          ? "#667eea"
                          : "#9ca3af",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {currentStep > 1 ? "✓" : "2"}
                  </div>
                  <div>
                    <div className="small fw-semibold text-dark mb-1">
                      Hiển thị thông tin
                    </div>
                    <div className="small text-muted">
                      {currentStep > 1
                        ? "Hoàn thành"
                        : currentStep === 1
                        ? "Đang xử lý"
                        : "Chờ xử lý"}
                    </div>
                  </div>
                </div>

                {/* Step 3 - Xác thực khuôn mặt */}
                <div
                  className="d-flex align-items-start"
                  style={{ opacity: currentStep >= 2 ? 1 : 0.3 }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3"
                    style={{
                      width: "24px",
                      height: "24px",
                      backgroundColor:
                        currentStep === 2 ? "#667eea" : "#9ca3af",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    3
                  </div>
                  <div>
                    <div className="small fw-semibold text-dark mb-1">
                      Xác thực khuôn mặt
                    </div>
                    <div className="small text-muted">
                      Vui lòng nhìn vào camera để xác thực
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div
                    className="progress"
                    style={{
                      height: "8px",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "4px",
                    }}
                  >
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${((currentStep + 1) / steps.length) * 100}%`,
                        background:
                          "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                        transition: "width 0.5s ease",
                        borderRadius: "4px",
                      }}
                      aria-valuenow={((currentStep + 1) / steps.length) * 100}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <div className="text-end small text-muted mt-2">
                    {Math.round(((currentStep + 1) / steps.length) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Instructions */}
          <div className="col-12 col-lg" style={{ flex: "0 0 800px" }}>
            {/* Video/Image Guide */}
            <div
              className="card shadow-sm border-0 mb-4"
              style={{ borderRadius: "24px" }}
            >
              <div className="card-body p-4">
                <h3 className="fs-6 fw-semibold text-dark mb-3">
                  Hướng dẫn sử dụng
                </h3>
                <p className="small text-muted mb-4">
                  Xem video để biết cách đặt thẻ căn cước
                </p>

                <div
                  className="rounded-4 overflow-hidden d-flex align-items-center justify-content-center"
                  style={{
                    width: "100%",
                    height: "400px",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  <video
                    src={idrdVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-100 h-100 rounded-4"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
            </div>

            {/* Tips */}
            <div
              className="card shadow-sm border-0"
              style={{ borderRadius: "24px" }}
            >
              <div className="card-body p-4">
                <h3 className="fs-6 fw-semibold text-dark mb-4">
                  Mẹo thao tác nhanh
                </h3>

                <ul className="list-unstyled mb-0">
                  <li
                    className="small mb-4 position-relative"
                    style={{
                      paddingLeft: "32px",
                      color: "#444",
                      lineHeight: "1",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        color: "#667eea",
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      •
                    </span>
                    Đặt thẻ đúng chiều theo hướng dẫn trên màn hình.
                  </li>
                  <li
                    className="small mb-4 position-relative"
                    style={{
                      paddingLeft: "32px",
                      color: "#444",
                      lineHeight: "1",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        color: "#667eea",
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      •
                    </span>
                    Giữ thẻ ổn định đến khi tải xong 100%.
                  </li>
                  <li
                    className="small position-relative"
                    style={{
                      paddingLeft: "32px",
                      color: "#444",
                      lineHeight: "1",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        color: "#667eea",
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      •
                    </span>
                    Chuẩn bị sẵn nhìn vào camera khi hệ thống yêu cầu.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
    </>
  );
};

export default LoadingScreen;
