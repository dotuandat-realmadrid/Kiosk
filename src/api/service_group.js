import { message } from "antd";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";
import { validateInput } from "../utils/ValidateInputUtil";

// ==========================================
// SERVICE GROUP API CALLS
// ==========================================

/**
 * Tìm kiếm nhóm dịch vụ với phân trang
 */
export const searchServiceGroups = async (request, page, size) => {
  try {
    // Xử lý params để tránh undefined
    const params = new URLSearchParams();
    
    if (request.id) params.append('id', request.id);
    if (request.code) params.append('code', request.code);
    if (request.name_vi) params.append('name_vi', request.name_vi);
    if (request.is_active !== undefined && request.is_active !== null && request.is_active !== '') {
      params.append('is_active', request.is_active);
    }
    
    params.append('page', page);
    params.append('size', size);

    const url = `${API}/service-groups?${params.toString()}`;
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
        errorData.message || "Tải danh sách nhóm dịch vụ thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    // Trả về toàn bộ result
    return result;
  } catch (error) {
    console.error("Search service groups error:", error);
    message.error(error.message);
    throw error;
  }
};

/**
 * Lấy danh sách tất cả nhóm dịch vụ đang active
 */
export const getAllActiveServiceGroups = async () => {
  try {
    const response = await fetch(`${API}/service-groups/active`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải danh sách nhóm dịch vụ active thất bại!"
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
 * Lấy thông tin nhóm dịch vụ theo ID
 */
export const getServiceGroupById = async (id) => {
  try {
    const response = await fetch(`${API}/service-groups/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải thông tin nhóm dịch vụ thất bại!"
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
 * Thêm mới nhóm dịch vụ
 */
export const createServiceGroup = async (data) => {
  try {
    const response = await fetch(`${API}/service-groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tạo nhóm dịch vụ thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Thêm nhóm dịch vụ thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Cập nhật nhóm dịch vụ
 */
export const updateServiceGroup = async (data, id) => {
  try {
    const response = await fetch(`${API}/service-groups/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật nhóm dịch vụ thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    // message.success("Cập nhật nhóm dịch vụ thành công!");
    console.log("Update service group result:", result);
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều nhóm dịch vụ
 */
export const deleteServiceGroups = async (ids) => {
  try {
    // Chuyển single ID thành array nếu cần
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/service-groups`, {
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
        errorData.message || "Xóa nhóm dịch vụ thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Xóa nhóm dịch vụ thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Bật/tắt trạng thái nhiều nhóm dịch vụ
 */
export const toggleServiceGroups = async (ids, is_active) => {
  try {
    // Chuyển single ID thành array nếu cần
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/service-groups/toggle`, {
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
        errorData.message || "Cập nhật trạng thái nhóm dịch vụ thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Cập nhật trạng thái nhóm dịch vụ thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};