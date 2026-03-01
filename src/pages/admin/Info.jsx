import { Col, Menu, Row, Space, Spin, Typography, Breadcrumb } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { getMyInfo } from "../../api/user";
import { getToken } from "../../services/localStorageService";

export default function Info() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accessToken = getToken();
  const [loading, setLoading] = useState(true);
  const userDetails = useSelector((state) => state.user);

  const menuItems = [
    { key: "1", label: "Thông tin cá nhân", path: "/admin/my-profiles" },
    // { key: "2", label: "Địa chỉ của tôi", path: "/admin/addresses" },
    { key: "3", label: "Mật khẩu và bảo mật", path: "/admin/password" },
  ];

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    } else {
      dispatch(getMyInfo(accessToken, false));
    }
  }, [accessToken, navigate, dispatch]);

  useEffect(() => {
    if (userDetails.id) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [userDetails]);

  // Xử lý khi chọn mục menu
  const handleMenuClick = ({ key }) => {
    const selectedItem = menuItems.find((item) => item.key === key);
    if (selectedItem.redirectTo) {
      navigate(selectedItem.redirectTo);
    }
  };

  // Hàm để lấy item hiện tại dựa trên pathname
  const getCurrentBreadcrumb = () => {
    const currentPath = window.location.pathname;
    const currentItem = menuItems.find(
      (item) => item.path === currentPath || item.redirectTo === currentPath
    );
    return currentItem ? currentItem.label : "Thông tin tài khoản";
  };

  return (
    <>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/admin">Dashboard Admin</Link> },
          { title: <Link to="/admin/my-profiles">Thông tin tài khoản</Link> },
          { title: getCurrentBreadcrumb() },
        ]}
      />

      <h3 style={{ marginBottom: 30 }}>
        Xin chào{" "}
        <span style={{ color: "var(--primary-color)" }}>
          {userDetails.full_name || "Quý khách"}
        </span>{" "}
        !
      </h3>

      <Row gutter={[30]}>
        <Col xl={6}>
          <Menu
            mode="vertical"
            selectedKeys={[
              menuItems.find(
                (item) =>
                  item.path === window.location.pathname ||
                  item.redirectTo === window.location.pathname
              )?.key || "1",
            ]}
            onClick={handleMenuClick}
            items={menuItems.map((item) => ({
              key: item.key,
              label: item.redirectTo ? (
                <span
                  onClick={() => handleMenuClick({ key: item.key })}
                  style={{ fontSize: 16, cursor: "pointer" }}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="primary-link"
                  style={{ fontSize: 16 }}
                >
                  {item.label}
                </Link>
              ),
              className: "custom-menu-item",
            }))}
          />
        </Col>

        <Col xl={18}>
          {loading ? (
            <Space
              orientation="vertical"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
              }}
            >
              <Spin size="large" />
              <Typography>Loading ...</Typography>
            </Space>
          ) : (
            <Outlet context={{ userDetails }} />
          )}
        </Col>
      </Row>
    </>
  );
}
