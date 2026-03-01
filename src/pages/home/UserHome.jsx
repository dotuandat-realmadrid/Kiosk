import React, { useState, useEffect, useRef } from "react";
import LoadingScreen from "./LoadingScreen";
import IdDisplayScreen from "./IdDisplayScreen";
import FaceAuthScreen from "./FaceAuthScreen";
import ServiceFormScreen from "./ServiceFormScreen";
import ThankYouScreen from "./ThankYouScreen";
import HomeScreen from "./HomeScreen";

function UserHome() {
  const START_VARIANT = "minimal";
  const [showMainScreen, setShowMainScreen] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [showIdDisplay, setShowIdDisplay] = useState(false);
  const [showFaceAuth, setShowFaceAuth] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [idData, setIdData] = useState(null);
  const [ws, setWs] = useState(null);
  const [capturedFace, setCapturedFace] = useState(null);
  const [isProcessingWebSocket, setIsProcessingWebSocket] = useState(false);
  const [deviceErrorMessage, setDeviceErrorMessage] = useState(null);
  const [deviceErrorVisible, setDeviceErrorVisible] = useState(false);
  const showLoadingRef = useRef(false);
  
  useEffect(() => {
    showLoadingRef.current = showLoadingScreen;
  }, [showLoadingScreen]);

  // WebSocket connection với reconnect logic
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        console.log("🚀 [CLIENT] Initializing WebSocket connection...");
        const newWs = new WebSocket("ws://localhost:8080");
        wsRef.current = newWs;
        setWs(newWs);

        newWs.onopen = () => {
          // console.log("🔌 [CLIENT] WebSocket connected");
          reconnectAttemptsRef.current = 0; // Reset reconnect counter
          newWs.send(
            JSON.stringify({
              type: "join-kiosk",
              clientType: "electron-app",
            })
          );
          // console.log("📤 [CLIENT] Sent join-kiosk message");
        };

        newWs.onmessage = async (event) => {
          // console.log("📨 [CLIENT] Raw message received:", event.data);
          try {
            const message = JSON.parse(event.data);
            // console.log("📨 [CLIENT] Parsed message:", message);

            if (message.type === "joined") {
              // console.log("✅ [CLIENT] Joined kiosk room");
            } else if (message.type === "device-error") {
              if (!showLoadingRef.current) {
                console.log(
                  "📋 [CLIENT] Ignoring device-error - not on Loading screen"
                );
              } else {
                const desc = message?.data?.description;
                const userMessage =
                  message?.data?.message ||
                  "Đọc thẻ không thành công, vui lòng thao tác lại";
                console.warn("⚠️ [CLIENT] Device error received:", {
                  description: desc,
                  userMessage,
                });
                setDeviceErrorMessage(userMessage);
                setDeviceErrorVisible(true);
                setIsProcessingWebSocket(false);
              }
            } else if (message.type === "new-id-record") {
              const data = message.data;
              // console.log(
              //   "📋 [CLIENT] Received new ID record from WebSocket server:"
              // );
              // console.log("  - ID:", data.id);

              // console.log("🔍 [CLIENT] Current screen state:", {
              //   showLoadingScreen: showLoadingRef.current,
              //   showMainScreen,
              //   showIdDisplay,
              //   showFaceAuth,
              //   showServiceForm,
              //   isProcessingWebSocket,
              // });

              if (
                (showLoadingRef.current || showMainScreen) &&
                !isProcessingWebSocket
              ) {
                setIsProcessingWebSocket(true);
                try {
                  // console.log(
                  //   "🔍 [CLIENT] Fetching detailed data for ID:",
                  //   data.id
                  // );

                  const response = await fetch(
                    `http://localhost:8080/api/id-info/${data.id}`
                  );

                  // console.log("🔍 [CLIENT] API Response status:", response.status);

                  const result = await response.json();

                  if (result.success) {
                    // console.log("✅ [CLIENT] Received detailed data from API");

                    setCurrentStep(1);
                    setIdData(result.data);

                    if (!showLoadingRef.current) {
                      setShowMainScreen(false);
                      setShowLoadingScreen(true);
                    }

                    setTimeout(() => {
                      // console.log(
                      //   "🔄 [CLIENT] Transitioning from loading to ID display"
                      // );
                      setShowLoadingScreen(false);
                      setShowIdDisplay(true);
                      setIsProcessingWebSocket(false);
                    }, 1000);
                  } else {
                    console.error(
                      "❌ [CLIENT] Failed to fetch detailed data:",
                      result.message
                    );
                    setIsProcessingWebSocket(false);
                  }
                } catch (error) {
                  console.error("❌ [CLIENT] Error fetching detailed data:", error);
                  setIsProcessingWebSocket(false);
                }
              } else {
                console.log(
                  "📋 [CLIENT] Ignoring WebSocket message - conditions not met"
                );
              }
            }
          } catch (error) {
            console.error("❌ [CLIENT] Error parsing message:", error);
          }
        };

        newWs.onclose = (event) => {
          // console.log("🔌 [CLIENT] WebSocket disconnected. Code:", event.code, "Reason:", event.reason);
          
          // Chỉ reconnect nếu không phải user đóng намеренно
          if (event.code !== 1000 && reconnectAttemptsRef.current < 10) {
            reconnectAttemptsRef.current++;
            const delay = Math.min(1000 * reconnectAttemptsRef.current, 5000);
            // console.log(`🔄 [CLIENT] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})...`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connectWebSocket();
            }, delay);
          }
        };

        newWs.onerror = (error) => {
          console.error("❌ [CLIENT] WebSocket error:", error);
        };
      } catch (error) {
        console.error("❌ [CLIENT] Failed to create WebSocket:", error);
      }
    };

    connectWebSocket();

    return () => {
      // console.log("🧹 [CLIENT] Cleaning up WebSocket...");
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, "Component unmounting");
      }
    };
  }, []);

  const handleStart = () => {
    // console.log("🔄 [CLIENT] handleStart called - moving to loading screen");
    setShowMainScreen(false);
    setShowLoadingScreen(true);
    setCurrentStep(0);
    setIdData(null);
    setShowIdDisplay(false);
    setIsProcessingWebSocket(false);
    try {
      resetInactivity();
    } catch {}
  };

  const handleBackToMain = () => {
    // console.log(
    //   "🔄 [CLIENT] handleBackToMain called - resetting to main screen"
    // );
    setShowIdDisplay(false);
    setShowFaceAuth(false);
    setShowServiceForm(false);
    setShowThankYou(false);
    setShowMainScreen(true);
    setCurrentStep(0);
    setIdData(null);
    setIsProcessingWebSocket(false);
  };

  const handleContinueToFaceAuth = () => {
    setShowIdDisplay(false);
    setShowFaceAuth(true);
  };

  const handleContinueToServiceForm = (capturedBase64) => {
    setShowFaceAuth(false);
    setShowServiceForm(true);
    if (capturedBase64) setCapturedFace(capturedBase64);
  };

  const handlePrintComplete = () => {
    setShowServiceForm(false);
    setShowThankYou(true);
  };

  // Inactivity watcher
  const inactivityTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const resetInactivity = () => {
    lastActivityRef.current = Date.now();
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      if (!showMainScreen) {
        handleBackToMain();
      }
    }, 180000);
  };

  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "click",
      "wheel",
    ];
    events.forEach((evt) =>
      window.addEventListener(evt, resetInactivity, { passive: true })
    );
    resetInactivity();
    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetInactivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [
    showMainScreen,
    showLoadingScreen,
    showIdDisplay,
    showFaceAuth,
    showServiceForm,
    showThankYou,
  ]);

  // Loading timeout
  const loadingTimeoutRef = useRef(null);
  useEffect(() => {
    if (showLoadingScreen) {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = setTimeout(() => {
        if (showLoadingScreen && !isProcessingWebSocket) {
          handleBackToMain();
        }
      }, 180000);
    } else if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [showLoadingScreen, isProcessingWebSocket]);

  // Heartbeat guard
  useEffect(() => {
    const interval = setInterval(() => {
      if (!showMainScreen) {
        const inactiveMs = Date.now() - lastActivityRef.current;
        if (inactiveMs >= 180000) {
          handleBackToMain();
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [showMainScreen]);

  // Đặt useEffect ở cấp độ component, NGOÀI mọi điều kiện
  useEffect(() => {
    if (showLoadingScreen && deviceErrorVisible) {
      const timer = setTimeout(() => {
        setDeviceErrorVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showLoadingScreen, deviceErrorVisible]);

  if (showFaceAuth) {
    return (
      <FaceAuthScreen
        onBack={handleBackToMain}
        idData={idData}
        onContinue={handleContinueToServiceForm}
      />
    );
  }

  if (showIdDisplay) {
    return (
      <IdDisplayScreen
        idData={idData}
        onBack={handleBackToMain}
        onContinue={handleContinueToFaceAuth}
      />
    );
  }

  if (showServiceForm) {
    return (
      <ServiceFormScreen
        onBack={handleBackToMain}
        idData={idData}
        capturedFace={capturedFace}
        onPrintComplete={handlePrintComplete}
      />
    );
  }

  if (showThankYou) {
    return <ThankYouScreen onBackToMain={handleBackToMain} />;
  }

// Sau đó mới có phần render với điều kiện
if (showLoadingScreen) {
    return (
      <>
        <LoadingScreen currentStep={currentStep} />

        {/* Modal lỗi thiết bị – dùng Bootstrap thuần */}
        <div
          className={`modal fade ${deviceErrorVisible ? "show d-block" : ""}`}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
          aria-hidden={!deviceErrorVisible}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg">
              {/* Header đỏ nhạt */}
              <div className="modal-header bg-danger-subtle border-bottom border-danger">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 44, height: 44 }}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h5 className="modal-title text-danger fw-bold mb-0">
                    Thông báo lỗi
                  </h5>
                </div>
              </div>

              {/* Body */}
              <div className="modal-body py-4">
                <p className="text-muted fs-5 mb-0 text-center">
                  {deviceErrorMessage || "Đọc thẻ không thành công, vui lòng thao tác lại"}
                </p>
              </div>

              {/* Footer */}
              <div className="modal-footer bg-light border-top justify-content-center">
                <button
                  type="button"
                  className="btn btn-secondary btn-lg px-4 rounded-pill"
                  onClick={() => setDeviceErrorVisible(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Backdrop khi modal hiện */}
        {deviceErrorVisible && <div className="modal-backdrop fade show"></div>}
      </>
    );
  }

  if (showMainScreen) {
    return <HomeScreen variant={START_VARIANT} onStart={handleStart} />;
  }
}

export default UserHome;