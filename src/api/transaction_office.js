import { message } from "antd";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";
import { validateInput } from "../utils/ValidateInputUtil";

/**
 * Tìm kiếm phòng giao dịch với phân trang
 */
export const searchTransactionOffices = async (request, page = 1, pageSize = 20) => {
  try {
    const params = new URLSearchParams();
    
    // Thêm các filter params
    if (request.id) params.append('id', request.id);
    if (request.district_id) params.append('district_id', request.district_id);
    if (request.district_code) params.append('district_code', request.district_code);
    if (request.province_id) params.append('province_id', request.province_id);
    if (request.province_code) params.append('province_code', request.province_code);
    if (request.code) params.append('code', request.code);
    if (request.name) params.append('name', request.name);
    if (request.address) params.append('address', request.address);
    if (request.is_active !== undefined && request.is_active !== null && request.is_active !== '') {
      params.append('is_active', request.is_active);
    }
    
    // Thêm pagination params
    params.append('page', page);
    params.append('pageSize', pageSize);

    const url = `${API}/transaction-offices?${params.toString()}`;
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
        errorData.message || "Tải danh sách phòng giao dịch thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    console.error("Search transaction offices error:", error);
    message.error(error.message);
    throw error;
  }
};

/**
 * Lấy thông tin phòng giao dịch theo ID
 */
export const getTransactionOfficeById = async (id) => {
  try {
    const response = await fetch(`${API}/transaction-offices/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải thông tin phòng giao dịch thất bại!"
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
 * Lấy danh sách phòng giao dịch theo quận/huyện
 */
export const getOfficesByDistrict = async (districtId) => {
  try {
    const response = await fetch(`${API}/transaction-offices/district/${districtId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải danh sách phòng giao dịch thất bại!"
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
 * Lấy tất cả phòng giao dịch đang hoạt động
 */
export const getAllActiveOffices = async () => {
  try {
    const response = await fetch(`${API}/transaction-offices/active`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải danh sách phòng giao dịch thất bại!"
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
 * Thêm mới phòng giao dịch
 */
export const createTransactionOffice = async (data) => {
  try {
    const response = await fetch(`${API}/transaction-offices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tạo phòng giao dịch thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }
    setTimeout(() => {
      message.success("Tạo phòng giao dịch thành công!");
    }, 100);

    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Cập nhật phòng giao dịch
 */
export const updateTransactionOffice = async (data, id) => {
  try {
    const response = await fetch(`${API}/transaction-offices/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật phòng giao dịch thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Cập nhật phòng giao dịch thành công!");
    console.log("Update transaction office result:", result);
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều phòng giao dịch
 */
export const deleteTransactionOffices = async (ids) => {
  try {
    // Chuyển single ID thành array
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/transaction-offices`, {
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
        errorData.message || "Xóa phòng giao dịch thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Xóa phòng giao dịch thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Bật/tắt trạng thái nhiều phòng giao dịch
 */
export const toggleTransactionOffices = async (ids, is_active) => {
  try {
    // Chuyển single ID thành array
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/transaction-offices/toggle`, {
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
        errorData.message || "Cập nhật trạng thái phòng giao dịch thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Cập nhật trạng thái phòng giao dịch thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};