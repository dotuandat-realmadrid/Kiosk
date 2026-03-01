import { GoogleOutlined } from "@ant-design/icons";
import { Button, Card, Space } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import React, { useEffect } from "react";
import { FaFacebookF } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { introspect, login, register } from "../api/auth";
import UserForm from "../components/UserForm";
import { getToken } from "../services/localStorageService";
import { useDispatch } from "react-redux";

dayjs.extend(customParseFormat);
const dateFormat = "YYYY-MM-DD";
const customFormat = (value) => (value ? `${value.format(dateFormat)}` : null);

export default function Register() {
  const navigate = useNavigate();
  const token = getToken();
  const dispatch = useDispatch();

  const handleContinueWithFacebook = () => {
    // const callbackUrl = OAuthConfig.redirectUri;
    // const facebookAuthUrl = OAuthConfig.authUri_facebook;
    // const facebookClientId = OAuthConfig.clientId_facebook;

    // // Lưu provider vào localStorage
    // localStorage.setItem("oauth_provider", "facebook");

    // const targetUrl = `${facebookAuthUrl}?redirect_uri=${encodeURIComponent(
    //   callbackUrl
    // )}&response_type=code&client_id=${facebookClientId}&scope=email%20public_profile`;

    // window.location.href = targetUrl;
  };

  const handleContinueWithGoogle = () => {
    // const callbackUrl = OAuthConfig.redirectUri;
    // const googleAuthUrl = OAuthConfig.authUri_google;
    // const googleClientId = OAuthConfig.clientId_google;

    // // Lưu provider vào localStorage
    // localStorage.setItem("oauth_provider", "google");

    // const targetUrl = `${googleAuthUrl}?redirect_uri=${encodeURIComponent(
    //   callbackUrl
    // )}&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile`;

    // window.location.href = targetUrl;
  };

  useEffect(() => {
    const checkTokenValidity = async () => {
      try {
        const response = await introspect(token); // Trả về {valid: boolean, roles: array}

        if (response.valid) { // ✅ Đúng - check property valid
          navigate("/user/settings");
        }
      } catch (error) {
        console.error(error.message);
      }
    };

    if (token) {
      checkTokenValidity();
    }
  }, [navigate, token]);

  const handleRegister = async (values) => {
    const dob = customFormat(values.dob);

    const data = {
      username: values.username,
      password: values.password,
      full_name: values.full_name,
      phone: values.phone,
      roles: ["USER"],
    };

    const loginData = {
      username: data.username,
      password: data.password,
    };
    
    try {
      await register(data);
    } catch (e) {
      return;
    }

    login(loginData, navigate, dispatch);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundImage: "url(src/assets/images/bg-login.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Card
          style={{
            minWidth: 420,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: 10,
            padding: "20px 20px 0px 20px",
            color: "var(--primary-color)",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: 20 }}>Đăng ký</h2>
          <UserForm
            onSubmit={handleRegister}
            submitButtonText="Đăng ký"
            isDisabled={false}
          />

          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <span
              style={{
                fontSize: "16px",
              }}
            >
              Hoặc đăng nhập bằng
            </span>
          </div>

          <Space orientation="vertical" style={{ width: "100%" }}>
            <Button
              icon={<FaFacebookF style={{ fontSize: "18px" }} />}
              onClick={handleContinueWithFacebook}
              block
              style={{
                backgroundColor: "#0866FF",
                color: "#fff",
              }}
            >
              Continue with Facebook
            </Button>
            <Button
              icon={<GoogleOutlined style={{ fontSize: "18px" }} />}
              onClick={handleContinueWithGoogle}
              block
              style={{
                backgroundColor: "#E34133",
                color: "#fff",
              }}
            >
              Continue with Google
            </Button>
            <div style={{ fontSize: 16, textAlign: "center", marginTop: "20px" }}>
              Bạn đã có tài khoản?
              <Link to={"/login"}> Đăng nhập ngay</Link>
            </div>
          </Space>
        </Card>
      </div>
    </>
  );
}
