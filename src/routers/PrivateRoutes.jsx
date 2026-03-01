import { Navigate } from "react-router-dom";
import { getToken } from "../services/localStorageService";
import { useEffect, useState } from "react";
import { introspect } from "../api/auth";
import { message, Space, Spin, Typography } from "antd";
import { hasPermission } from "../services/authService";

const PrivateRoute = ({ element, requiredRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const token = getToken();

  useEffect(() => {
    const isValidToken = async () => {
      if (token) {
        try {
          const result = await introspect(token); // ← result là {valid, roles}
          setIsLogin(result.valid); // ← Sửa: lấy result.valid thay vì cả object
        } catch (error) {
          console.error("lỗi ở private route:", error);
          setIsLogin(false);
        }
      } else {
        setIsLogin(false);
      }

      setIsLoading(false);
    };

    isValidToken();
  }, [token]);

  if (isLoading) {
    return (
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
    );
  }

  if (!isLogin) {
    message.error("Vui lòng đăng nhập!");
    return <Navigate to="/login" />;
  }

  if (!hasPermission(requiredRoles)) {
    message.error("Bạn không được ủy quyền!");
    return <Navigate to="/admin" />;
  }

  return element;
};

export default PrivateRoute;