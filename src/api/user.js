// ==========================================
// user.js (UPDATED - THÊM COUNTER MANAGEMENT)
// ==========================================
import { message } from "antd";
import { setUserInfo } from "../reducers/userReducer";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";
import { validateInput } from "../utils/ValidateInputUtil";

export const createUser = async (data) => {
  try {
    const response = await fetch(`${API}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tạo tài khoản thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Tạo tài khoản thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

export const updateUser = async (data, id) => {
  try {
    const response = await fetch(`${API}/users/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật thông tin thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Cập nhật tài khoản thành công!");
    console.log("Update user result:", result);
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

export const getMyInfo = (accessToken, forceReload = false) => {
  return async (dispatch, getState) => {
    const { user } = getState();
    
    // Chỉ skip nếu đã có user và không force reload
    if (user.id && !forceReload) {
      return;
    }

    try {
      const response = await fetch(`${API}/users/myInfo`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Tải thông tin người dùng thất bại!"
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("get my info failed");
      }

      dispatch(setUserInfo(result.data));
    } catch (error) {
      console.error(error.message);
    }
  };
};

export const searchUser = async (request, page, size) => {
  try {
    // Xử lý params để tránh undefined
    const params = new URLSearchParams();
    
    // Thêm params một cách chính xác
    if (request.id) params.append('id', request.id);
    if (request.username) params.append('username', request.username);
    if (request.full_name) params.append('full_name', request.full_name);
    if (request.email) params.append('email', request.email);
    if (request.phone) params.append('phone', request.phone);
    
    // Role - truyền đúng giá trị
    if (request.role_id) params.append('role_id', request.role_id);
    if (request.role_code) params.append('role_code', request.role_code);
    
    // Position - truyền đúng giá trị  
    if (request.position_id) params.append('position_id', request.position_id);
    if (request.position_code) params.append('position_code', request.position_code);
    
    // Transaction Office - truyền đúng giá trị
    if (request.transaction_offices_id) params.append('transaction_offices_id', request.transaction_offices_id);
    if (request.transaction_offices_code) params.append('transaction_offices_code', request.transaction_offices_code);
    
    // Province & District
    if (request.transaction_offices_province_id) params.append('transaction_offices_province_id', request.transaction_offices_province_id);
    if (request.transaction_offices_province_code) params.append('transaction_offices_province_code', request.transaction_offices_province_code);
    if (request.transaction_offices_district_id) params.append('transaction_offices_district_id', request.transaction_offices_district_id);
    if (request.transaction_offices_district_code) params.append('transaction_offices_district_code', request.transaction_offices_district_code);
    
    params.append('page', page);
    params.append('size', size);

    const url = `${API}/users?${params.toString()}`;
    console.log("Calling API:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải thông tin người dùng thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    // Trả về toàn bộ result
    return result;
  } catch (error) {
    console.error("Search user error:", error);
    message.error(error.message);
    throw error;
  }
};

export const deleteUser = async (ids) => {
  try {
    const response = await fetch(`${API}/users/${ids}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Xoá thông tin người dùng thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Xóa tài khoản thành công");
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await fetch(`${API}/users/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải thông tin người dùng thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

export const toggleUser = async (ids) => {
  try {
    // Chuyển single ID thành array
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/users/toggle`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: idArray })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Cập nhật trạng thái tài khoản thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Cập nhật trạng thái tài khoản thành công");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

// ==========================================
// ✅ COUNTER MANAGEMENT - HÀM MỚI
// ==========================================

/**
 * Cập nhật counter cho user
 * @param {string} userId - ID của user
 * @param {string|null} counterId - ID của counter (null để hủy gán)
 * @param {boolean} showMessage - Có hiển thị message không (default: true)
 * @returns {Promise<Object>} - Kết quả cập nhật
 */
export const updateUserCounter = async (userId, counterId, showMessage = true) => {
  try {
    const response = await fetch(`${API}/users/${userId}/counter`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ counter_id: counterId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Cập nhật quầy thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    if (showMessage) {
      message.success(result.message || "Cập nhật quầy thành công!");
    }
    
    console.log("Update counter result:", result);
    return result;
  } catch (error) {
    if (showMessage) {
      message.error(error.message);
    }
    throw error;
  }
};

/**
 * Gán counter cho user
 * @param {string} userId - ID của user
 * @param {string} counterId - ID của counter
 * @returns {Promise<Object>} - Kết quả gán counter
 */
export const assignCounter = async (userId, counterId) => {
  return updateUserCounter(userId, counterId, true);
};

/**
 * Hủy gán counter của user
 * @param {string} userId - ID của user
 * @returns {Promise<Object>} - Kết quả hủy gán
 */
export const unassignCounter = async (userId) => {
  return updateUserCounter(userId, null, true);
};

/**
 * Lấy thông tin counter của user (từ getUserById)
 * @param {string} userId - ID của user
 * @returns {Promise<Object|null>} - Thông tin counter hoặc null
 */
export const getUserCounter = async (userId) => {
  try {
    const userData = await getUserById(userId);
    return userData.counter || null;
  } catch (error) {
    console.error("Get user counter error:", error);
    throw error;
  }
};