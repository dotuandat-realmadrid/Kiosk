import React, { useEffect } from "react";

const ThankYouScreen = ({ onBackToMain }) => {
  useEffect(() => {
    // Tự động quay về màn hình chính sau 5 giây
    const timer = setTimeout(() => {
      onBackToMain();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onBackToMain]);

  return (
    <>
      <style>{`
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        .bg-blob-1 {
          position: absolute;
          top: -10rem;
          right: -10rem;
          width: 20rem;
          height: 20rem;
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(129, 140, 248, 0.2));
          border-radius: 50%;
          filter: blur(60px);
          animation: pulse 3s ease-in-out infinite;
        }

        .bg-blob-2 {
          position: absolute;
          bottom: -10rem;
          left: -10rem;
          width: 20rem;
          height: 20rem;
          background: linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(96, 165, 250, 0.2));
          border-radius: 50%;
          filter: blur(60px);
          animation: pulse 3s ease-in-out infinite;
          animation-delay: 1s;
        }

        .success-circle {
          width: 8rem;
          height: 8rem;
          background: linear-gradient(135deg, #34d399, #10b981);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s ease-in-out infinite;
          margin: 0 auto;
        }

        .success-circle-inner {
          width: 6rem;
          height: 6rem;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .checkmark {
          width: 4rem;
          height: 4rem;
          color: #059669;
          animation: bounce 1s infinite;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          animation: bounce 1s infinite;
        }

        .particle-1 {
          top: -0.5rem;
          right: -0.5rem;
          width: 1rem;
          height: 1rem;
          background: #fbbf24;
          animation-delay: 0.5s;
        }

        .particle-2 {
          bottom: -0.5rem;
          left: -0.5rem;
          width: 0.75rem;
          height: 0.75rem;
          background: #ec4899;
          animation-delay: 1s;
        }

        .particle-3 {
          top: 50%;
          left: -1rem;
          width: 0.5rem;
          height: 0.5rem;
          background: #60a5fa;
          animation-delay: 1.5s;
        }

        .content-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 1.5rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .title-gradient {
          background: linear-gradient(135deg, #059669, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .progress-dot {
          width: 0.75rem;
          height: 0.75rem;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .progress-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .progress-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        .btn-home {
          background: linear-gradient(135deg, #34d399, #5eead4, #22d3ee);
          border: none;
          color: white;
          font-weight: 500;
          box-shadow: 0 10px 22px -8px rgba(45, 212, 191, 0.35);
          transition: all 0.3s ease;
        }

        .btn-home:hover {
          background: linear-gradient(135deg, #6ee7b7, #99f6e4, #67e8f9);
          box-shadow: 0 12px 26px -8px rgba(45, 212, 191, 0.45);
          transform: scale(1.03);
          color: white;
        }

        .btn-home:focus {
          box-shadow: 0 0 0 0.25rem rgba(45, 212, 191, 0.4);
        }
      `}</style>

      <div className="d-flex align-items-center justify-content-center p-3 overflow-hidden">
        {/* Animated background elements */}
        <div className="position-absolute w-100 h-100 top-0 start-0 overflow-hidden">
          <div className="bg-blob-1"></div>
          <div className="bg-blob-2"></div>
        </div>

        <div className="container position-relative" style={{ maxWidth: '56rem' }}>
          <div className="text-center">
            {/* Success Animation */}
            <div className="mb-4">
              <div className="position-relative d-inline-block">
                {/* Success Circle with Checkmark */}
                <div className="success-circle">
                  <div className="success-circle-inner">
                    <svg
                      className="checkmark"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Floating particles */}
                <div className="particle particle-1"></div>
                <div className="particle particle-2"></div>
                <div className="particle particle-3"></div>
              </div>
            </div>

            {/* Main content */}
            <div className="content-card p-4 p-md-5">
              <h1 className="display-5 fw-bold title-gradient mb-4">
                Hoàn thành thành công!
              </h1>

              <div className="mb-4">
                <p className="fs-5 text-dark fw-medium mb-3">
                  Quý khách vui lòng lấy vé và file biểu mẫu
                </p>
                <p className="fs-6 text-secondary">
                  Cảm ơn quý khách đã sử dụng dịch vụ của Coop-Bank
                </p>
              </div>

              {/* Progress indicator */}
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                  <div className="progress-dot"></div>
                  <div className="progress-dot"></div>
                  <div className="progress-dot"></div>
                </div>
                <p className="small text-muted">
                  Hệ thống sẽ tự động quay về màn hình chính sau 5 giây...
                </p>
              </div>

              {/* Action button */}
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <button
                  onClick={onBackToMain}
                  className="btn btn-home btn-lg rounded-3 px-4 py-3 d-inline-flex align-items-center justify-content-center gap-2"
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Về màn hình chính
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 text-center">
              <p className="text-muted small mb-0">
                © 2025 Coop-Bank. Dịch vụ ngân hàng hiện đại
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThankYouScreen;