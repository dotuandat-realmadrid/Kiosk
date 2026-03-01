import React from 'react';
import coopbankLogo from '../../assets/images/logo.png';
import bgLogin from '../../assets/images/bg-login.jpg';

const HomeScreen = ({ variant = "minimal", onStart }) => {
    const [buttonHovered, setButtonHovered] = React.useState(false);

    const buttonStyle = {
        background: buttonHovered 
            ? 'linear-gradient(to right, rgb(110, 231, 183), rgb(94, 234, 212), rgb(103, 232, 249))' 
            : 'linear-gradient(to right, rgb(52, 211, 153), rgb(45, 212, 191), rgb(34, 211, 238))',
        boxShadow: '0 10px 22px -8px rgba(45, 212, 191, 0.35)',
        transition: 'all 0.3s',
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
        <div className="min-vh-100 overflow-hidden">
            <div 
                className="position-absolute top-0 start-0 w-100 h-100" 
                style={{
                    backgroundImage: `url(${bgLogin})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            ></div>
            <div 
                className="position-absolute top-0 start-0 w-100 h-100" 
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            ></div>
            <div 
                className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none" 
                style={{ background: 'radial-gradient(120% 80% at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 100%)' }}
            ></div>

            <div className="position-relative z-3 d-flex flex-column align-items-center justify-content-center min-vh-100 px-3 px-md-4">
                <div 
                    className="card mx-auto text-center border border-light-subtle shadow-lg rounded-4" 
                    style={{
                        maxWidth: '80rem',
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.55)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.6)',
                        boxShadow: '0 18px 54px -10px rgba(0,0,0,0.25)',
                    }}
                >
                    <div className="card-body p-4 p-md-5">
                        <img
                            className="img-fluid mx-auto d-block mb-1"
                            style={{
                                height: '7.5rem',
                                width: 'auto',
                                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                            }}
                            src={coopbankLogo}
                            alt="Coop-bank Logo"
                        />
                        <h1 className="display-4 fw-bolder mb-5 text-dark" style={{ letterSpacing: '-0.025em' }}>
                            Kiosk Ngân hàng
                        </h1>

                        <div className="row g-3 g-md-4 mb-5 text-start">
                            <div className="col-12 col-md-4">
                                <div 
                                    className="card h-100 rounded-3 border border-light-subtle shadow-sm p-3 p-md-4" 
                                    style={{ background: 'rgba(255, 255, 255, 0.9)' }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        {/* Icon Tự động */}
                                        <span 
                                            className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                                            style={{ 
                                                width: '2.5rem', 
                                                height: '2.5rem', 
                                                backgroundColor: 'rgb(224, 242, 254)',
                                                color: '#0369a1'
                                            }}
                                        >
                                            <svg style={{ width: '1.5rem', height: '1.5rem' }} viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 20l9-5-9-5-9 5 9 5z" />
                                                <path d="M12 12l9-5-9-5-9 5 9 5z" />
                                            </svg>
                                        </span>
                                        <div>
                                            <div className="fw-semibold text-dark fs-5 mb-1">
                                                Tự động
                                            </div>
                                            <div className="text-muted fs-6">
                                                Quy trình tự phục vụ mượt mà
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-4">
                                <div 
                                    className="card h-100 rounded-3 border border-light-subtle shadow-sm p-3 p-md-4" 
                                    style={{ background: 'rgba(255, 255, 255, 0.9)' }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        {/* Icon Nhanh chóng */}
                                        <span 
                                            className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                                            style={{ 
                                                width: '2.5rem', 
                                                height: '2.5rem', 
                                                backgroundColor: 'rgb(209, 250, 229)',
                                                color: '#047857'
                                            }}
                                        >
                                            <svg style={{ width: '1.5rem', height: '1.5rem' }} viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
                                            </svg>
                                        </span>
                                        <div>
                                            <div className="fw-semibold text-dark fs-5 mb-1">
                                                Nhanh chóng
                                            </div>
                                            <div className="text-muted fs-6">
                                                Thao tác đơn giản, tiết kiệm thời gian
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-4">
                                <div 
                                    className="card h-100 rounded-3 border border-light-subtle shadow-sm p-3 p-md-4" 
                                    style={{ background: 'rgba(255, 255, 255, 0.9)' }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        {/* Icon Bảo mật */}
                                        <span 
                                            className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                                            style={{ 
                                                width: '2.5rem', 
                                                height: '2.5rem', 
                                                backgroundColor: 'rgb(224, 231, 255)',
                                                color: '#4338ca'
                                            }}
                                        >
                                            <svg style={{ width: '1.5rem', height: '1.5rem' }} viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                            </svg>
                                        </span>
                                        <div>
                                            <div className="fw-semibold text-dark fs-5 mb-1">
                                                Bảo mật
                                            </div>
                                            <div className="text-muted fs-6">
                                                Dữ liệu được bảo vệ nhiều lớp
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn text-white fw-semibold fs-5 px-5 py-2 rounded-pill"
                            style={buttonStyle}
                            onClick={onStart}
                            onMouseEnter={() => setButtonHovered(true)}
                            onMouseLeave={() => setButtonHovered(false)}
                        >
                            Bắt đầu
                        </button>
                    </div>
                </div>
                <div className="text-center pt-4 mb-3">
                    © 2025 Coop-bank. Tất cả quyền được bảo lưu.
                </div>
            </div>
        </div>
    </>
    );
}

export default HomeScreen;