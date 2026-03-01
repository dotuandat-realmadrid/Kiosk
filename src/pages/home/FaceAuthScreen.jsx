import React, { useRef, useState } from "react";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import errorAnim from "../../assets/images/error.json";
import successAnim from "../../assets/images/check_success.json";
import Lottie from "lottie-react";
import Webcam from "react-webcam";

const FaceAuthScreen = ({ onBack, idData, onContinue }) => {
  const webcamRef = useRef(null);
  const [error, setError] = useState(null);
  const [captured, setCaptured] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const translateInvalidMessage = (message) => {
    if (!message) return message;

    const translations = {
      "The portrait photo does not contain a face":
        "Ảnh chân dung không có mặt",
      "Photo contains more than one face": "Ảnh chứa nhiều hơn một mặt người",
      "Wearing sunglasses": "Đeo kính đen",
      "Wearing a hat": "Đội mũ",
      "Wearing a mask": "Đeo khẩu trang",
      "Photo taken from picture, screen, blurred noise or sign of fraud":
        "Ảnh chụp từ bức ảnh khác, màn hình thiết bị, bị mờ nhiễu hoặc có dấu hiệu gian lận",
      "The face in the picture is too small": "Mặt người trong ảnh quá nhỏ",
      "The face in the portrait photo is too close to the margin":
        "Mặt người trong ảnh quá gần với lề",
      "The face in the portrait photo is obscured":
        "Khuôn mặt trong chân dung bị che khuất",
      "The eyes in the portrait photo are closed":
        "Mắt trong ảnh chân dung bị nhắm",
    };

    return translations[message] || message;
  };

  const matchOk = (() => {
    if (!verifyResult) return false;

    const match = Number(verifyResult.data?.match ?? verifyResult.match ?? 0);
    const invalidCode = Number(
      verifyResult.data?.invalidCode ?? verifyResult.invalidCode ?? -1
    );

    if ([5, 6, 7, 8, 9, 10, 11, 12, 13, 14].includes(invalidCode)) {
      return false;
    }

    if (match === -1) {
      return false;
    }

    if ([0, 1, 2, 3, 4, 15].includes(invalidCode) || match === 1) {
      return true;
    }

    return false;
  })();

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
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        margin: "20px", // ✅ Đổi margin responsive
      }}
    >
      <Header />

      <div className="flex-grow-1 d-flex align-items-center justify-content-center py-3">
        <div className="container" style={{ maxWidth: "720px", width: "100%" }}> {/* ✅ Đổi sang maxWidth */}
          {/* Title and Steps */}
          <div className="text-center mb-4 px-3"> {/* ✅ Thêm padding cho mobile */}
            <h1
              className="fw-bold mb-3"
              style={{ fontSize: "clamp(24px, 5vw, 32px)", color: "#1a1a1a" }} // ✅ Responsive font
            >
              Xác thực khuôn mặt
            </h1>
            <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
              Vui lòng nhìn vào camera để hệ thống xác thực.
            </p>

            {/* Steps Indicator */}
            <div className="d-flex flex-wrap justify-content-center align-items-center gap-2 gap-md-3 mb-5"> {/* ✅ Thêm flex-wrap */}
              {/* Step 1 */}
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-semibold"
                  style={{ width: "24px", height: "24px", fontSize: "12px" }}
                >
                  ✓
                </div>
                <span
                  className="fw-medium d-none d-sm-inline" // ✅ Ẩn text trên mobile nhỏ
                  style={{ fontSize: "13px", color: "#1a1a1a" }}
                >
                  Lấy thông tin GTTT
                </span>
              </div>

              {/* Divider */}
              <div
                className="bg-success d-none d-sm-block" // ✅ Ẩn divider trên mobile
                style={{ width: "40px", height: "2px" }}
              ></div>

              {/* Step 2 */}
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-semibold"
                  style={{ width: "24px", height: "24px", fontSize: "12px" }}
                >
                  ✓
                </div>
                <span
                  className="fw-medium d-none d-sm-inline"
                  style={{ fontSize: "13px", color: "#1a1a1a" }}
                >
                  Hiển thị thông tin
                </span>
              </div>

              {/* Divider */}
              <div
                className="d-none d-sm-block"
                style={{
                  width: "40px",
                  height: "2px",
                  backgroundColor: matchOk ? "#10b981" : "#1890ff",
                }}
              ></div>

              {/* Step 3 */}
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle text-white d-flex align-items-center justify-content-center fw-semibold"
                  style={{
                    width: "24px",
                    height: "24px",
                    fontSize: "12px",
                    backgroundColor: matchOk ? "#10b981" : "#1890ff",
                  }}
                >
                  {matchOk ? "✓" : "3"}
                </div>
                <span
                  className="fw-medium d-none d-sm-inline"
                  style={{ fontSize: "13px", color: "#1a1a1a" }}
                >
                  Xác thực khuôn mặt
                </span>
              </div>
            </div>
          </div>

          {/* Main Card - Camera View */}
          {!captured && (
            <>
              <div className="card border-0 rounded-4 shadow mb-4 overflow-hidden"> {/* ✅ Xóa mx-5 */}
                <div className="position-relative bg-dark">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    style={{
                      width: "100%",
                      height: "auto", // ✅ Đổi sang auto
                      aspectRatio: "4/3", // ✅ Thêm aspect ratio
                      objectFit: "cover",
                    }}
                    videoConstraints={{ facingMode: "user" }}
                    screenshotFormat="image/jpeg"
                  />
                  {/* Center guide rectangle */}
                  <div
                    className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center"
                    style={{ pointerEvents: "none" }}
                  >
                    <div
                      style={{
                        width: "min(420px, 80%)", // ✅ Responsive width
                        height: "min(360px, 70%)", // ✅ Responsive height
                        border: "4px solid rgba(16,185,129,0.9)",
                        borderRadius: "12px",
                        boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Buttons outside card */}
              <div className="d-flex gap-3 justify-content-center mb-4">
                <button
                  onClick={onBack}
                  className="btn btn-light border fw-semibold px-3 px-md-4 py-2" // ✅ Responsive padding
                  style={{
                    fontSize: "14px",
                    borderRadius: "8px",
                    transition: "all 0.3s",
                  }}
                >
                  Quay lại
                </button>
                <button
                  onClick={() => {
                    try {
                      const dataUrl = webcamRef.current?.getScreenshot();
                      if (!dataUrl) {
                        setError("Không thể chụp ảnh. Vui lòng thử lại.");
                        return;
                      }
                      const base64 = dataUrl.split(",")[1];
                      setCaptured(base64);
                      setError(null);
                    } catch (e) {
                      setError("Chụp ảnh thất bại");
                    }
                  }}
                  className="btn text-white fw-semibold px-3 px-md-4 py-2"
                  style={{
                    fontSize: "14px",
                    backgroundColor: "#1890ff",
                    border: "none",
                    borderRadius: "8px",
                    transition: "all 0.3s",
                  }}
                >
                  Chụp ảnh
                </button>
              </div>
            </>
          )}

          {/* Comparison Card */}
          {captured && !verifyResult && (
            <div className="card border-0 rounded-4 shadow p-3 p-md-4 mb-4"> {/* ✅ Responsive padding, xóa mx-5 */}
              <div className="row g-3 g-md-4 mb-4"> {/* ✅ Responsive gap */}
                {/* Ảnh từ GTTT */}
                <div className="col-12 col-md-6"> {/* ✅ Full width trên mobile */}
                  <h4
                    className="fw-semibold text-start mb-3"
                    style={{ fontSize: "14px", color: "#1a1a1a" }}
                  >
                    Ảnh từ GTTT
                  </h4>
                  {idData?.dg02 ? (
                    <img
                      src={`data:image/jpeg;base64,${idData.dg02}`}
                      alt="Ảnh GTTT"
                      className="w-100 rounded"
                      style={{
                        height: "auto", // ✅ Auto height
                        maxHeight: "380px", // ✅ Max height
                        objectFit: "contain",
                        backgroundColor: "#f8f9fa",
                      }}
                    />
                  ) : (
                    <div
                      className="w-100 d-flex align-items-center justify-content-center text-muted rounded"
                      style={{ height: "300px", backgroundColor: "#f0f0f0" }} // ✅ Giảm height
                    >
                      Không có ảnh GTTT
                    </div>
                  )}
                </div>

                {/* Ảnh vừa chụp */}
                <div className="col-12 col-md-6">
                  <h4
                    className="fw-semibold text-start mb-3"
                    style={{ fontSize: "14px", color: "#1a1a1a" }}
                  >
                    Ảnh vừa chụp
                  </h4>
                  <img
                    src={`data:image/jpeg;base64,${captured}`}
                    alt="Ảnh chụp"
                    className="w-100 rounded"
                    style={{
                      height: "auto",
                      maxHeight: "380px",
                      objectFit: "contain",
                      backgroundColor: "#f8f9fa",
                    }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="d-flex gap-3 justify-content-center">
                <button
                  onClick={() => setCaptured(null)}
                  className="btn btn-light border fw-semibold px-3 px-md-4 py-2"
                  style={{ fontSize: "14px", borderRadius: "8px" }}
                >
                  Chụp lại
                </button>
                <button
                  disabled={isVerifying}
                  className="btn text-white fw-semibold px-3 px-md-4 py-2"
                  style={{
                    fontSize: "14px",
                    backgroundColor: isVerifying ? "#ccc" : "#1890ff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: isVerifying ? "not-allowed" : "pointer",
                    opacity: isVerifying ? 0.7 : 1,
                  }}
                  onClick={async () => {
                    try {
                      setIsVerifying(true);
                      setVerifyResult(null);
                      const img2 = idData?.dg02 || "";
                      const img1 = captured || "";
                      const username = "LEEON";
                      const token = "aosYc6TiOg6v5wSMxW2zAMB5ZYQNI8C1j";
                      const resp = await fetch(
                        "https://sandbox-api.leeon.vn/ekyc/face_matching",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            img1,
                            img2,
                            username,
                            token,
                          }),
                        }
                      );
                      const text = await resp.text();
                      let json = {};
                      try {
                        json = text ? JSON.parse(text) : {};
                      } catch (_) {}
                      setVerifyResult({
                        ok: resp.ok,
                        status: resp.status,
                        ...json,
                        data: json.data ?? json,
                      });
                    } catch (e) {
                      setVerifyResult({
                        ok: false,
                        error: e?.message || "Lỗi kết nối",
                      });
                    } finally {
                      setIsVerifying(false);
                    }
                  }}
                >
                  {isVerifying ? "Đang xác thực..." : "Xác thực"}
                </button>
              </div>
            </div>
          )}

          {/* Success Result */}
          {matchOk && (
            <div
              className="card border-0 rounded-4 shadow text-center py-4 py-md-5 px-3 px-md-4 mb-4" // ✅ Xóa mx-5, thêm responsive padding
              style={{ background: "#cffff0ff" }}
            >
              <Lottie
                animationData={successAnim}
                loop={true}
                style={{ width: "min(160px, 40vw)", height: "min(160px, 40vw)" }} // ✅ Responsive size
                className="mx-auto"
              />
              <h3
                className="fw-bold mb-4 mb-md-5"
                style={{ fontSize: "clamp(20px, 5vw, 28px)", color: "#10b981" }} // ✅ Responsive font
              >
                Xác thực thành công
              </h3>
              <button
                className="btn text-white fw-semibold mx-auto"
                style={{
                  fontSize: "clamp(14px, 3vw, 16px)",
                  backgroundColor: "#1890ff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 24px",
                }}
                onClick={() => onContinue(captured)}
              >
                Tiếp tục
              </button>
            </div>
          )}

          {/* Error Result */}
          {!matchOk && verifyResult && (
            <div
              className="card border-0 rounded-4 shadow text-center py-4 py-md-5 px-3 px-md-4 mb-4"
              style={{ background: "#fae5e5ff" }}
            >
              <Lottie
                animationData={errorAnim}
                loop={true}
                style={{ width: "min(160px, 40vw)", height: "min(160px, 40vw)" }}
                className="mx-auto"
              />
              <h3
                className="fw-bold mt-3 mb-3"
                style={{ fontSize: "clamp(20px, 5vw, 28px)", color: "#DC2626" }}
              >
                Xác thực thất bại
              </h3>
              {Number(
                verifyResult.data?.invalidCode ?? verifyResult.invalidCode ?? -1
              ) === 9 ? (
                <p
                  className="mb-4 mb-md-5 mx-auto px-3"
                  style={{
                    color: "#EF4444",
                    maxWidth: "500px",
                    fontSize: "15px",
                    lineHeight: "1.6",
                  }}
                >
                  {translateInvalidMessage(
                    verifyResult.data?.invalidMessage ||
                      verifyResult.invalidMessage
                  )}
                </p>
              ) : Number(
                  verifyResult.data?.match ?? verifyResult.match ?? 0
                ) === -1 ? (
                <p
                  className="mb-4 mb-md-5 mx-auto px-3"
                  style={{
                    color: "#EF4444",
                    maxWidth: "500px",
                    fontSize: "15px",
                    lineHeight: "1.6",
                  }}
                >
                  Ảnh khuôn mặt và ảnh trên căn cước không giống nhau
                </p>
              ) : verifyResult.data?.invalidMessage ||
                verifyResult.invalidMessage ? (
                <p
                  className="mb-4 mb-md-5 mx-auto px-3"
                  style={{
                    color: "#EF4444",
                    maxWidth: "500px",
                    fontSize: "15px",
                    lineHeight: "1.6",
                  }}
                >
                  {translateInvalidMessage(
                    verifyResult.data?.invalidMessage ||
                      verifyResult.invalidMessage
                  )}
                </p>
              ) : null}
              <button
                onClick={() => {
                  setCaptured(null);
                  setVerifyResult(null);
                }}
                className="btn btn-light border fw-semibold mx-auto"
                style={{
                  backgroundColor: "#8eb4ff",
                  fontSize: "clamp(14px, 3vw, 16px)",
                  borderRadius: "8px",
                  padding: "10px 24px",
                }}
              >
                Chụp lại
              </button>
            </div>
          )}

          {error && (
            <p
              className="text-center mt-4 px-3"
              style={{ color: "#DC2626", fontSize: "14px" }}
            >
              {error}
            </p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  </>
  );
};

export default FaceAuthScreen;