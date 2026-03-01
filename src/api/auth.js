import {
  getToken,
  removeToken,
  setToken,
} from "../services/localStorageService";
import { message } from "antd";
import { persistor } from "../store/store";
import { getMyInfo } from "./user";
import { validateInput } from "../utils/ValidateInputUtil";

export const API = `http://localhost:8080/api`;

export const register = async (data) => {
  try {
    const response = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Đăng ký thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Đăng ký thành công!");
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

export const login = async (data, navigate, dispatch) => {
  try {
    const response = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success !== true) {
      throw new Error("Username hoặc mật khẩu không chính xác");
    }

    const token = result.token;
    setToken(token);

    // Lấy thông tin người dùng
    await dispatch(getMyInfo(token, false));

    // Lấy role code từ user info
    const userRoles = result.data.user.roles;
    
    // Kiểm tra role và điều hướng
    if (userRoles && userRoles.length > 0) {
      const roleCode = userRoles[0].code; // Lấy code của role đầu tiên
      
      if (roleCode === "ADMIN") {
        navigate("/admin");
      } else if (roleCode === "USER") {
        navigate("/user/settings");
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }

  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

const LOGOUT = "LOGOUT";

export const logout = () => {
  return async (dispatch) => {
    const data = {
      token: getToken(),
    };

    try {
      const response = await fetch(`${API}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Logout failed!");
      }

      // Xóa token và reset store
      removeToken();
      persistor.purge(); // Dọn dẹp persisted state nếu cần
      dispatch({ type: LOGOUT }); // Dispatch action LOGOUT để reset trạng thái người dùng
    } catch (error) {
      // message.error(error.message); // Hiển thị thông báo lỗi
    }
  };
};

export const introspect = async (token) => {
  const data = { token: token };
  
  try {
    const response = await fetch(`${API}/auth/introspect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.code !== 1000) {
      throw new Error(result.message);
    }

    // Trả về object chứa valid và roles
    return {
      valid: result.result?.valid,
      roles: result.result?.roles
    };
  } catch (error) {
    return {
      valid: false,
      roles: null
    };
  }
};

export const refresh = async (token) => {
  const data = { token: token };
  return await fetch(`${API}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success !== true) {
        removeToken();
        // throw new Error(result.message);
      }

      setToken(result.refreshToken);
    })
    .catch(() => {
      removeToken();
      return;
    });
};
