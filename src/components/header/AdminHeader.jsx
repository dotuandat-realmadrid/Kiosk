import { useEffect, useState } from "react";
import { MdHome, MdOutlineMenu, MdOutlinePerson, MdArrowDropUp, 
  MdSearch, MdArrowDropDown, MdLogout, MdSettings  } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getToken } from "../../services/localStorageService";
import { Button, Input, Space } from "antd";
import { introspect, logout as logoutAction } from "../../api/auth";
import "./Header.css";

export default function AdminHeader({ collapsed, toggleSidebar }) {
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const myInfo = useSelector((state) => state.user);
  const token = getToken();
  const [query, setQuery] = useState("");

  // Kiểm tra token và authentication
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const isValid = await introspect(token);
        if (!isValid) {
          navigate("/login");
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [token, navigate]);

  useEffect(() => {
    if (myInfo.id) {
      setLoading(false);
    }
  }, [myInfo]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutAction());
      setShowProfileMenu(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  // Toggle dropdown khi click vào profile
  const toggleProfileMenu = (e) => {
    e.stopPropagation(); // Ngăn event bubbling
    // console.log("Toggle clicked! Current state:", showProfileMenu);
    setShowProfileMenu(!showProfileMenu);
  };

  // const onSearch = (event) => {
  //   event.preventDefault();
  //   navigate(``);
  // };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-dropdown-wrapper')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showProfileMenu]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60px',
        background: '#fff'
      }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  return (
    <header className="nice-admin-header">
      <div className="header-container">
        <div
          className="sidebar-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "50px",
            padding: "0 0",
          }}
        >
          <a
            href="/admin"
            className="logo d-flex align-items-center"
            style={{ display: "flex", alignItems: "center" }}
          >
            <img
              src="/logo/logo.png?v=1.0.0"
              alt="logo"
              style={{ maxHeight: 26, marginRight: 6 }}
            />
            <span style={{ fontSize: 30, fontWeight: 500, marginRight: 0 }}>
              {myInfo?.roles?.[0]?.code}
            </span>
          </a>

          <button
            className="toggle-sidebar-btn"
            onClick={toggleSidebar}
            style={{
              display: "flex",
              alignItems: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <MdOutlineMenu size={30} />
          </button>
        </div>
        
        {/* <div className="input-search">
          <form onSubmit={onSearch}>
            <Space.Compact
              style={{
                // width: "100%",
                width: "500px",
                marginLeft: "20px",
              }}
            >
              <Input
                placeholder="Search..."
                allowClear
                size="large"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  borderTopLeftRadius: "20px",
                  borderBottomLeftRadius: "20px",
                  padding: "0 30px",
                }}
              />
              <Button
                size="large"
                type="primary"
                htmlType="submit"
                style={{
                  backgroundColor: "var(--primary-color)",
                  border: "1px solid var(--secondary-color)",
                  borderTopRightRadius: "20px",
                  borderBottomRightRadius: "20px",
                }}
              >
                <MdSearch size={20} />
              </Button>
            </Space.Compact>
          </form>
        </div> */}

        <nav className="header-nav">
          <ul className="d-flex align-items-center">
            <li className="nav-item nav-item-dropdown profile-dropdown-wrapper">
              <div
                className="nav-link profile"
                onClick={toggleProfileMenu}
                style={{ cursor: 'pointer' }}
              >
                <span className="profile-name">{myInfo.full_name}</span>
                <span style={{ marginLeft: '4px', fontSize: '12px' }}>
                  {showProfileMenu ? <MdArrowDropUp /> : <MdArrowDropDown />}
                </span>
              </div>

              {showProfileMenu && (
                <div className="profile-dropdown-menu">
                  <div className="dropdown-header">
                    Xin chào, {myInfo.full_name}
                  </div>
                  <div className="dropdown-divider"></div>
                  
                  <Link 
                    className="dropdown-item" 
                    to="/admin/my-profiles"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <span className="dropdown-icon"><MdOutlinePerson /></span>
                    <span>Thông tin tài khoản</span>
                  </Link>

                  <Link 
                    className="dropdown-item" 
                    to="/admin/settings"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <span className="dropdown-icon"><MdSettings /></span>
                    <span>Cài đặt</span>
                  </Link>
                  
                  <div 
                    className="dropdown-item"
                    onClick={handleLogout}
                  >
                    <span className="dropdown-icon"><MdLogout /></span>
                    <span>Đăng xuất</span>
                  </div>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>

      <style>{`
        .nice-admin-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: #fff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          padding: 0 20px;
          z-index: 9999 !important;
        }
        
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          position: relative;
        }
        
        .toggle-sidebar-btn {
          border: none;
          background: none;
          font-size: 24px;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          color: #012970;
          transition: all 0.3s ease;
        }
        
        .toggle-sidebar-btn:hover {
          background-color: #f6f9ff;
        }
        
        .header-nav {
          margin-left: auto;
        }
        
        .header-nav ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
        }
        
        .nav-item {
          margin-left: 20px;
          position: relative;
        }
        
        .nav-item-dropdown {
          position: relative !important;
        }
        
        .profile-dropdown-wrapper {
          position: relative !important;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          color: #012970;
          cursor: pointer;
          position: relative;
          padding: 8px 12px;
          text-decoration: none;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        
        .nav-link svg {
          font-size: 20px;
          margin-right: 5px;
        }
        
        .nav-link:hover {
          color: #4154f1;
          background-color: #f6f9ff;
        }
        
        .profile {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .profile-name {
          color: #012970;
          font-size: 16px;
          line-height: 24px;
          font-weight: 400;
        }
        
        .profile-name:hover {
          color: #4154f1;
          background-color: #f6f9ff;
        }
        
        /* DROPDOWN MENU - QUAN TRỌNG */
        .profile-dropdown-menu {
          position: absolute !important;
          right: 0 !important;
          top: calc(100% + 12px) !important;
          background: #fff !important;
          box-shadow: 0 4px 20px rgba(1, 41, 112, 0.2) !important;
          border-radius: 8px !important;
          padding: 0 !important;
          min-width: 240px !important;
          z-index: 9999 !important;
          border: 1px solid #e6e9f0 !important;
          animation: slideDown 0.2s ease-out !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .dropdown-header {
          padding: 14px 16px !important;
          color: #012970 !important;
          font-size: 16px !important;
          text-align: center !important;
          font-weight: 600 !important;
          margin-bottom: 0 !important;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
          border-radius: 8px 8px 0 0 !important;
        }
        
        .dropdown-divider {
          border-top: 1px solid #e6e9f0 !important;
          margin: 0 !important;
          height: 1px !important;
        }
        
        .dropdown-item {
          display: flex !important;
          align-items: center !important;
          padding: 12px 16px !important;
          color: #012970 !important;
          font-size: 16px !important;
          text-decoration: none !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
          background: transparent !important;
        }
        
        .dropdown-item:hover {
          background-color: #f6f9ff !important;
          color: #4154f1 !important;
        }
        
        .dropdown-item:last-child {
          border-radius: 0 0 8px 8px !important;
        }
        
        .dropdown-icon {
          margin-right: 10px !important;
          font-size: 20px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 20px !important;
        }
      `}</style>
    </header>
  );
}