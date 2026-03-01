import { message } from "antd";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";
import { validateInput } from "../utils/ValidateInputUtil";

/**
 * Tìm kiếm tỉnh/thành phố với phân trang
 */
export const searchProvinces = async (request, page, size) => {
  try {
    // Xử lý params để tránh undefined
    const params = new URLSearchParams();
    
    if (request.id) params.append('id', request.id);
    if (request.code) params.append('code', request.code);
    if (request.name) params.append('name', request.name);
    if (request.is_active !== undefined && request.is_active !== null && request.is_active !== '') {
      params.append('is_active', request.is_active);
    }
    
    params.append('page', page);
    params.append('size', size);

    const url = `${API}/provinces?${params.toString()}`;
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
        errorData.message || "Tải danh sách tỉnh/thành phố thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    // Trả về toàn bộ result
    return result;
  } catch (error) {
    console.error("Search provinces error:", error);
    message.error(error.message);
    throw error;
  }
};

/**
 * Lấy thông tin tỉnh/thành phố theo ID
 */
export const getProvinceById = async (id) => {
  try {
    const response = await fetch(`${API}/provinces/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải thông tin tỉnh/thành phố thất bại!"
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
 * Thêm mới tỉnh/thành phố
 */
export const createProvince = async (data) => {
  try {
    const response = await fetch(`${API}/provinces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tạo tỉnh/thành phố thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Thêm tỉnh/thành phố thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Cập nhật tỉnh/thành phố
 */
export const updateProvince = async (data, id) => {
  try {
    const response = await fetch(`${API}/provinces/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật tỉnh/thành phố thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Cập nhật tỉnh/thành phố thành công!");
    console.log("Update province result:", result);
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều tỉnh/thành phố
 */
export const deleteProvinces = async (ids) => {
  try {
    // Chuyển single ID thành array nếu cần
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/provinces`, {
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
        errorData.message || "Xóa tỉnh/thành phố thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Xóa tỉnh/thành phố thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Bật/tắt trạng thái nhiều tỉnh/thành phố
 */
export const toggleProvinces = async (ids, is_active) => {
  try {
    // Chuyển single ID thành array nếu cần
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/provinces/toggle`, {
      method: "PATCH",
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
        errorData.message || "Cập nhật trạng thái tỉnh/thành phố thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Cập nhật trạng thái tỉnh/thành phố thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};