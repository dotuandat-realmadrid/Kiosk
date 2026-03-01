import { message } from "antd";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";
import { validateInput } from "../utils/ValidateInputUtil";

/**
 * Tìm kiếm định dạng vé với phân trang
 */
export const searchTicketFormats = async (request, page, size) => {
  try {
    // Xử lý params để tránh undefined
    const params = new URLSearchParams();
    
    if (request.id) params.append('id', request.id);
    if (request.code) params.append('code', request.code);
    if (request.format_pattern) params.append('format_pattern', request.format_pattern);
    if (request.is_active !== undefined && request.is_active !== null && request.is_active !== '') {
      params.append('is_active', request.is_active);
    }
    
    params.append('page', page);
    params.append('size', size);

    const url = `${API}/ticket-formats?${params.toString()}`;
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
        errorData.message || "Tải danh sách định dạng vé thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    // Trả về toàn bộ result
    return result;
  } catch (error) {
    console.error("Search ticket formats error:", error);
    message.error(error.message);
    throw error;
  }
};

/**
 * Lấy thông tin định dạng vé theo ID
 */
export const getTicketFormatById = async (id) => {
  try {
    const response = await fetch(`${API}/ticket-formats/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải thông tin định dạng vé thất bại!"
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
 * Thêm mới định dạng vé
 */
export const createTicketFormat = async (data) => {
  try {
    const response = await fetch(`${API}/ticket-formats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tạo định dạng vé thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Thêm định dạng vé thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Cập nhật định dạng vé
 */
export const updateTicketFormat = async (data, id) => {
  try {
    const response = await fetch(`${API}/ticket-formats/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật định dạng vé thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Cập nhật định dạng vé thành công!");
    console.log("Update ticket format result:", result);
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều định dạng vé
 */
export const deleteTicketFormats = async (ids) => {
  try {
    // Chuyển single ID thành array nếu cần
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/ticket-formats`, {
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
        errorData.message || "Xóa định dạng vé thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Xóa định dạng vé thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Bật/tắt trạng thái nhiều định dạng vé
 */
export const toggleTicketFormats = async (ids, is_active) => {
  try {
    // Chuyển single ID thành array nếu cần
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/ticket-formats/toggle`, {
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
        errorData.message || "Cập nhật trạng thái định dạng vé thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Cập nhật trạng thái định dạng vé thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};