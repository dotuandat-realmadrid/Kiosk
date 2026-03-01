import { message } from "antd";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";
import { validateInput } from "../utils/ValidateInputUtil";

/**
 * Tìm kiếm dịch vụ với phân trang
 */
export const searchServices = async (request, page, size) => {
  try {
    // Xử lý params để tránh undefined
    const params = new URLSearchParams();
    
    if (request.id) params.append('id', request.id);
    if (request.format_id) params.append('format_id', request.format_id);
    if (request.code) params.append('code', request.code);
    if (request.name_vi) params.append('name_vi', request.name_vi);
    if (request.is_active !== undefined && request.is_active !== null && request.is_active !== '') {
      params.append('is_active', request.is_active);
    }
    
    params.append('page', page);
    params.append('size', size);

    const url = `${API}/services?${params.toString()}`;
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
        errorData.message || "Tải danh sách dịch vụ thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    // Trả về toàn bộ result
    return result;
  } catch (error) {
    console.error("Search services error:", error);
    message.error(error.message);
    throw error;
  }
};

/**
 * Lấy thông tin dịch vụ theo ID
 */
export const getServiceById = async (id) => {
  try {
    const response = await fetch(`${API}/services/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải thông tin dịch vụ thất bại!"
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
 * Lấy danh sách dịch vụ theo định dạng vé
 */
export const getServicesByTicketFormat = async (formatId) => {
  try {
    const response = await fetch(`${API}/services/ticket-format/${formatId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải danh sách dịch vụ theo định dạng vé thất bại!"
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
 * Thêm mới dịch vụ
 */
export const createService = async (data) => {
  try {
    const response = await fetch(`${API}/services`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tạo dịch vụ thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Thêm dịch vụ thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Cập nhật dịch vụ
 */
export const updateService = async (data, id) => {
  try {
    const response = await fetch(`${API}/services/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật dịch vụ thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Cập nhật dịch vụ thành công!");
    console.log("Update service result:", result);
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều dịch vụ
 */
export const deleteServices = async (ids) => {
  try {
    // Chuyển single ID thành array nếu cần
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/services`, {
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
        errorData.message || "Xóa dịch vụ thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Xóa dịch vụ thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Bật/tắt trạng thái nhiều dịch vụ
 */
export const toggleServices = async (ids, is_active) => {
  try {
    // Chuyển single ID thành array nếu cần
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/services/toggle`, {
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
        errorData.message || "Cập nhật trạng thái dịch vụ thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Cập nhật trạng thái dịch vụ thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};