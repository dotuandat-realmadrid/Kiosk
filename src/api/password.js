import { message } from "antd";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";

export const setPassword = async (body) => {
  try {
    const response = await fetch(`${API}/password/set`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    // ✅ Check success từ response
    if (!result.success) {
      throw new Error(result.message || "Đặt mật khẩu thất bại!");
    }

    message.success("Đặt mật khẩu thành công");
    window.location.reload();
  } catch (error) {
    message.error(error.message);
    throw error; // Re-throw để component có thể handle
  }
};

export const changePassword = async (body) => {
  try {
    const response = await fetch(`${API}/auth/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    // ✅ Check success từ response thay vì code
    if (!result.success) {
      throw new Error(result.message || "Thay đổi mật khẩu thất bại!");
    }

    // ✅ Hiển thị message xanh khi thành công
    message.success(result.message || "Thay đổi mật khẩu thành công");
    
    // ✅ Đăng xuất sau khi đổi mật khẩu thành công
    setTimeout(() => {
      localStorage.clear();
      window.location.href = '/login';
    }, 1500);
    
  } catch (error) {
    message.error(error.message);
    throw error; // Re-throw để component có thể handle
  }
};

export const resetPassword = async (id) => {
  try {
    const response = await fetch(`${API}/password/reset/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const result = await response.json();

    // ✅ Check success từ response
    if (!result.success) {
      throw new Error(result.message || "Reset mật khẩu thất bại!");
    }

    message.success(result.message || "Đã đặt lại mật khẩu mặc định");
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};