import React from 'react';

const Footer = () => {
  return (
    <footer
      className="fixed-bottom bg-light border-top"
      style={{
        padding: '12px 24px',
        fontSize: '13px',
        color: '#6b7280',
        height: '4rem', zIndex: 100
      }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center h-100">

        {/* Left: Copyright */}
        <div className="text-muted fs-6">
          © 2025 Coop-bank • Hệ thống Kiosk tự động
        </div>

        {/* Right: Version + Security */}
        <div className="d-flex align-items-center gap-3 text-muted fs-6">
          <span>Phiên bản 1.0.0</span>
          <span className="text-secondary">•</span>
          <span className="d-flex align-items-center gap-1">
            Bảo mật cao
          </span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;