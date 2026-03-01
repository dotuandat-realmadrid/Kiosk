import { message } from "antd";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";
import { validateInput } from "../utils/ValidateInputUtil";

/**
 * Tìm kiếm chức danh với phân trang
 */
export const searchPositions = async (request, page = 1, size = 20) => {
  try {
    const params = new URLSearchParams();
    
    // Thêm các filter params
    if (request.id) params.append('id', request.id);
    if (request.code) params.append('code', request.code);
    if (request.name) params.append('name', request.name);
    if (request.is_active !== undefined && request.is_active !== null) {
      params.append('is_active', request.is_active);
    }
    
    // Thêm pagination params
    params.append('page', page);
    params.append('size', size);

    const url = `${API}/positions?${params.toString()}`;
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
        errorData.message || "Tải danh sách chức danh thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    console.error("Search positions error:", error);
    message.error(error.message);
    throw error;
  }
};

/**
 * Lấy thông tin chức danh theo ID
 */
export const getPositionById = async (id) => {
  try {
    const response = await fetch(`${API}/positions/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải thông tin chức danh thất bại!"
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

/**
 * Lấy tất cả chức danh đang hoạt động (không phân trang)
 */
export const getAllActivePositions = async () => {
  try {
    const response = await fetch(`${API}/positions/active`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải danh sách chức danh thất bại!"
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

/**
 * Thêm mới chức danh
 */
export const createPosition = async (data) => {
  try {
    const response = await fetch(`${API}/positions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tạo chức danh thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Tạo chức danh thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Cập nhật chức danh
 */
export const updatePosition = async (data, id) => {
  try {
    const response = await fetch(`${API}/positions/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật chức danh thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Cập nhật chức danh thành công!");
    console.log("Update position result:", result);
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều chức danh
 */
export const deletePositions = async (ids) => {
  try {
    // Chuyển single ID thành array
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/positions`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: idArray }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Xóa chức danh thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Xóa chức danh thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Bật/tắt trạng thái nhiều chức danh
 */
export const togglePositions = async (ids, is_active) => {
  try {
    // Chuyển single ID thành array
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/positions/toggle`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        ids: idArray,
        is_active: is_active
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Cập nhật trạng thái chức danh thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Cập nhật trạng thái chức danh thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};