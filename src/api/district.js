import { message } from "antd";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";
import { validateInput } from "../utils/ValidateInputUtil";

/**
 * Tìm kiếm quận/huyện với phân trang
 */
export const searchDistricts = async (request, page, size) => {
  try {
    // Xử lý params để tránh undefined
    const params = new URLSearchParams();
    
    if (request.id) params.append('id', request.id);
    if (request.province_id) params.append('province_id', request.province_id);
    if (request.code) params.append('code', request.code);
    if (request.name) params.append('name', request.name);
    if (request.is_active !== undefined && request.is_active !== null && request.is_active !== '') {
      params.append('is_active', request.is_active);
    }
    
    params.append('page', page);
    params.append('size', size);

    const url = `${API}/districts?${params.toString()}`;
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
        errorData.message || "Tải danh sách quận/huyện thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    // Trả về toàn bộ result
    return result;
  } catch (error) {
    console.error("Search districts error:", error);
    message.error(error.message);
    throw error;
  }
};

/**
 * Lấy thông tin quận/huyện theo ID
 */
export const getDistrictById = async (id) => {
  try {
    const response = await fetch(`${API}/districts/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải thông tin quận/huyện thất bại!"
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
 * Lấy danh sách quận/huyện theo tỉnh
 */
export const getDistrictsByProvince = async (provinceId) => {
  try {
    const response = await fetch(`${API}/districts/province/${provinceId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải danh sách quận/huyện theo tỉnh thất bại!"
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
 * Thêm mới quận/huyện
 */
export const createDistrict = async (data) => {
  try {
    const response = await fetch(`${API}/districts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tạo quận/huyện thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Thêm quận/huyện thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Cập nhật quận/huyện
 */
export const updateDistrict = async (data, id) => {
  try {
    const response = await fetch(`${API}/districts/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật quận/huyện thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Cập nhật quận/huyện thành công!");
    console.log("Update district result:", result);
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều quận/huyện
 */
export const deleteDistricts = async (ids) => {
  try {
    // Chuyển single ID thành array nếu cần
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/districts`, {
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
        errorData.message || "Xóa quận/huyện thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Xóa quận/huyện thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Bật/tắt trạng thái nhiều quận/huyện
 */
export const toggleDistricts = async (ids, is_active) => {
  try {
    // Chuyển single ID thành array nếu cần
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/districts/toggle`, {
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
        errorData.message || "Cập nhật trạng thái quận/huyện thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Cập nhật trạng thái quận/huyện thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};