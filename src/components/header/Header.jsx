import React from 'react';
import coopbankLogo from '../../assets/images/logo.png';

const Header = () => {
  return (
    <header className="fixed-top bg-white border-bottom shadow-sm" style={{ height: '4rem', zIndex: 1000 }}>
      <div className="container-fluid h-100 d-flex align-items-center justify-content-between px-3 px-lg-4">

        {/* Logo + Tagline */}
        <div className="d-flex align-items-center gap-3">
          <a href="/" className="d-block">
            <img
              src={coopbankLogo}
              alt="CoopBank Logo"
              className="img-fluid"
              style={{ height: '3.5rem' }}
            />
          </a>

          <span className="text-secondary fw-medium fs-6">
            Dịch vụ tự động • An toàn • Nhanh chóng
          </span>
        </div>

        {/* Status Indicator */}
        <div className="d-flex align-items-center gap-2 text-success fw-medium fs-6">
          <span
            className="d-inline-block rounded-circle"
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#10b981',
              boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.25)'
            }}
          ></span>
          Hệ thống hoạt động
        </div>

      </div>
    </header>
  );
};

export default Header;