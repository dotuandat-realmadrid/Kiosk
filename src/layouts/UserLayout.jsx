import { Badge, Layout, Menu, theme } from "antd";
import { Content } from "antd/es/layout/layout";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "../components/header/AdminHeader";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { hasPermission } from "../services/authService";
import {
  HomeOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { MdOutlineMonitor } from "react-icons/md";

const { Sider } = Layout;

const UserLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Hàm tạo menu item
  function getItem(label, key, icon, count = 0, children) {
    const labelWithBadge =
      count > 0 ? (
        <span>
          {label} <Badge size="small" count={count} style={{ marginLeft: 8 }} />
        </span>
      ) : (
        label
      );

    return {
      key,
      icon,
      children,
      label: labelWithBadge,
    };
  }

  // Cấu hình menu items
  const items = [
    ...(hasPermission(["USER"])
      ? [getItem("TRANG CHỦ", "/user", <HomeOutlined />)]
      : []),
    ...(hasPermission(["USER"])
      ? [getItem("GIÁM SÁT", "/user/monitors", <MdOutlineMonitor />)]
      : []),
    ...(hasPermission(["USER"])
      ? [getItem("CẤU HÌNH", "/user/settings", <SettingOutlined />)]
      : []),
  ];

  // Tìm menu key được chọn và submenu mở
  const getSelectedKeys = () => {
    return [location.pathname];
  };

  const getDefaultOpenKeys = () => {
    const path = location.pathname;

    // // Xác định submenu nào cần mở dựa trên path hiện tại
    // if (path.includes("/admin/ticket-formats") || 
    //     path.includes("/admin/services") || 
    //     path.includes("/admin/service-groups")) {
    //   return ["services-manager"];
    // }
    // if (path.includes("/admin/provinces") || 
    //     path.includes("/admin/districts") || 
    //     path.includes("/admin/transaction-offices") || 
    //     path.includes("/admin/branches")) {
    //   return ["branches-manager"];
    // }
    // if (path.includes("/admin/kiosk") || 
    //     path.includes("/admin/counter") || 
    //     // path.includes("/admin/feedback") || 
    //     // path.includes("/admin/smart-lcd") || 
    //     path.includes("/admin/e-center-board")) {
    //   return ["devices-manager"];
    // }
    // if (path.includes("/admin/users")) {
    //   return ["users-manager"];
    // }

    return [];
  };

  // Cập nhật openKeys khi location thay đổi
  useEffect(() => {
    setOpenKeys(getDefaultOpenKeys());
  }, [location.pathname]);

  // Xử lý khi mở/đóng submenu - chỉ cho phép mở 1 submenu tại 1 thời điểm
  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    
    // Danh sách các submenu keys
    const rootSubmenuKeys = [
      "services-manager",
      "branches-manager",
      "devices-manager",
      "users-manager",
    ];

    if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  return (
    <div className="nice-admin-layout">
      <AdminHeader
        collapsed={collapsed}
        toggleSidebar={() => setCollapsed(!collapsed)}
      />

      <div className="nice-admin-container">
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          className="nice-admin-sidebar"
          trigger={null}
          width={220}
          collapsedWidth={56}
        >
          <Menu
            theme="light"
            mode="inline"
            items={items}
            selectedKeys={getSelectedKeys()}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            onClick={(e) => navigate(e.key)}
            className="nice-admin-menu"
          />
        </Sider>

        <Layout className="nice-admin-content-container">
          <Content className="nice-admin-content">
            <div
              className="nice-admin-content-inner"
              style={{
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              <Outlet />
            </div>
          </Content>
        </Layout>
      </div>

      <ScrollToTopButton />

      <style>{`
        .nice-admin-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .nice-admin-container {
          display: flex;
          flex: 1;
          margin-top: 60px;
        }

        .nice-admin-sidebar {
          background-color: #fff !important;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
          border-right: 1px solid #f0f0f0 !important;
          height: calc(100vh - 60px);
          position: fixed !important;
          left: 0;
          top: 60px;
          z-index: 996;
          overflow: auto;
        }

        .nice-admin-sidebar .ant-layout-sider-children {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        /* Scrollbar styling */
        .nice-admin-sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .nice-admin-sidebar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .nice-admin-sidebar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }

        .nice-admin-sidebar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        .nice-admin-menu {
          border-right: none !important;
          flex: 1;
        }

        /* Menu item cha */
        .nice-admin-menu .ant-menu-item,
        .nice-admin-menu .ant-menu-submenu-title {
          height: 48px !important;
          line-height: 48px !important;
          margin: 4px 8px !important;
          padding: 0 16px !important;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
        }

        /* Menu item con */
        .nice-admin-menu .ant-menu-sub .ant-menu-item {
          height: 42px !important;
          line-height: 42px !important;
          margin: 2px 8px !important;
          padding-left: 48px !important;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 400;
        }

        /* Hover effect */
        .nice-admin-menu .ant-menu-item:hover,
        .nice-admin-menu .ant-menu-submenu-title:hover {
          background-color: #f0f5ff !important;
          color: #1890ff !important;
        }

        .nice-admin-menu .ant-menu-sub .ant-menu-item:hover {
          background-color: #f0f5ff !important;
          color: #1890ff !important;
        }

        /* Selected item */
        .nice-admin-menu .ant-menu-item-selected {
          background-color: #e6f4ff !important;
          color: #1890ff !important;
          font-weight: 600;
        }

        .nice-admin-menu .ant-menu-item-selected::after {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 70%;
          background-color: #1890ff;
          border-radius: 0 2px 2px 0;
        }

        /* Submenu selected */
        .nice-admin-menu .ant-menu-submenu-selected > .ant-menu-submenu-title {
          color: #1890ff !important;
        }

        /* Icon styling */
        .nice-admin-menu .ant-menu-item .anticon,
        .nice-admin-menu .ant-menu-submenu-title .anticon {
          font-size: 16px;
        }

        /* Collapsed state */
        .nice-admin-sidebar.ant-layout-sider-collapsed .ant-menu-item,
        .nice-admin-sidebar.ant-layout-sider-collapsed .ant-menu-submenu-title {
          padding: 0 !important;
          text-align: center;
        }

        .nice-admin-sidebar.ant-layout-sider-collapsed .ant-menu-item .anticon,
        .nice-admin-sidebar.ant-layout-sider-collapsed .ant-menu-submenu-title .anticon {
          margin: 0 10px;
          font-size: 18px;
        }

        /* Content area */
        .nice-admin-content-container {
          margin-left: ${collapsed ? "56px" : "220px"};
          transition: margin-left 0.2s;
          min-height: calc(100vh - 60px);
        }

        .nice-admin-content {
          padding: 24px;
        }

        .nice-admin-content-inner {
          padding: 24px;
          min-height: calc(100vh - 108px);
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03),
                      0 1px 6px -1px rgba(0, 0, 0, 0.02),
                      0 2px 4px 0 rgba(0, 0, 0, 0.02);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nice-admin-sidebar {
            position: fixed !important;
            z-index: 1000;
          }

          .nice-admin-content-container {
            margin-left: 0 !important;
          }

          .nice-admin-sidebar.ant-layout-sider-collapsed {
            width: 0 !important;
            min-width: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default UserLayout;