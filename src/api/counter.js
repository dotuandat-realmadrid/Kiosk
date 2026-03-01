// ==========================================
// counter.js (Frontend API - UPDATED - HỖ TRỢ NHIỀU PRIORITY SERVICES)
// ==========================================
import { message } from "antd";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";
import { validateInput } from "../utils/ValidateInputUtil";

/**
 * Tìm kiếm quầy với phân trang
 */
export const searchCounters = async (request, page = 1, pageSize = 20) => {
  try {
    const params = new URLSearchParams();
    
    // Thêm các filter params
    if (request.id) params.append('id', request.id);
    if (request.code) params.append('code', request.code);
    if (request.name) params.append('name', request.name);
    if (request.counter_number) params.append('counter_number', request.counter_number);
    if (request.transaction_office_id) params.append('transaction_office_id', request.transaction_office_id);
    if (request.district_id) params.append('district_id', request.district_id);
    if (request.district_code) params.append('district_code', request.district_code);
    if (request.province_id) params.append('province_id', request.province_id);
    if (request.province_code) params.append('province_code', request.province_code);
    if (request.is_active !== undefined && request.is_active !== null && request.is_active !== '') {
      params.append('is_active', request.is_active);
    }
    
    // Thêm pagination params
    params.append('page', page);
    params.append('size', pageSize);

    const url = `${API}/counters?${params.toString()}`;
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
        errorData.message || "Tải danh sách quầy thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    console.error("Search counters error:", error);
    message.error(error.message);
    throw error;
  }
};

/**
 * Lấy thông tin quầy theo ID
 */
export const getCounterById = async (id) => {
  try {
    const response = await fetch(`${API}/counters/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải thông tin quầy thất bại!"
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
 * Thêm mới quầy
 */
export const createCounter = async (data) => {
  try {
    const response = await fetch(`${API}/counters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tạo quầy thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }
    
    setTimeout(() => {
      message.success("Tạo quầy thành công!");
    }, 100);

    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Cập nhật quầy
 */
export const updateCounter = async (id, data) => {
  try {
    const response = await fetch(`${API}/counters/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật quầy thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Cập nhật quầy thành công!");
    console.log("Update counter result:", result);
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều quầy
 */
export const deleteCounters = async (ids) => {
  try {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/counters`, {
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
        errorData.message || "Xóa quầy thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Xóa quầy thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Bật/tắt trạng thái nhiều quầy
 */
export const toggleCounters = async (ids, is_active) => {
  try {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/counters/toggle`, {
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
        errorData.message || "Cập nhật trạng thái quầy thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Cập nhật trạng thái quầy thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

// ==================== SERVICE CONFIG MANAGEMENT ====================

/**
 * Lấy cấu hình dịch vụ của quầy
 * Endpoint: GET /counters/:id/service-config
 * Response: { services: [], priority_services: [] }
 */
export const getServiceConfig = async (counterId) => {
  try {
    const response = await fetch(`${API}/counters/${counterId}/service-config`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải cấu hình dịch vụ thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data; // { services: [], priority_services: [] }
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Set cấu hình dịch vụ (replace toàn bộ)
 * Endpoint: PUT /counters/:id/service-config
 * Body: { service_ids: [], priority_service_ids: [] }
 */
export const setServiceConfig = async (counterId, serviceIds = [], priorityServiceIds = []) => {
  try {
    const response = await fetch(`${API}/counters/${counterId}/service-config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ 
        service_ids: serviceIds,
        priority_service_ids: priorityServiceIds 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cấu hình dịch vụ thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Cấu hình dịch vụ thành công!");
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Thêm services (không xóa cũ)
 * Endpoint: POST /counters/:id/services
 * Body: { service_ids: [], priority_service_ids: [] }
 */
export const addServices = async (counterId, serviceIds, priorityServiceIds = []) => {
  try {
    const response = await fetch(`${API}/counters/${counterId}/services`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ 
        service_ids: serviceIds,
        priority_service_ids: priorityServiceIds 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Thêm dịch vụ thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Thêm dịch vụ thành công!");
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa services
 * Endpoint: DELETE /counters/:id/services
 * Body: { service_ids: [] }
 */
export const removeServices = async (counterId, serviceIds) => {
  try {
    const response = await fetch(`${API}/counters/${counterId}/services`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ service_ids: serviceIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Xóa dịch vụ thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Xóa dịch vụ thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa tất cả cấu hình dịch vụ
 * Endpoint: DELETE /counters/:id/service-config
 */
export const clearServiceConfig = async (counterId) => {
  try {
    const response = await fetch(`${API}/counters/${counterId}/service-config`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Xóa cấu hình dịch vụ thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Đã xóa cấu hình dịch vụ!");
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Cập nhật dịch vụ ưu tiên (HỖ TRỢ NHIỀU - MẢNG)
 * Endpoint: PUT /counters/:id/priority-services
 * Body: { priority_service_ids: [] }
 */
export const updatePriorityServices = async (counterId, priorityServiceIds) => {
  try {
    const response = await fetch(`${API}/counters/${counterId}/priority-services`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ 
        priority_service_ids: Array.isArray(priorityServiceIds) ? priorityServiceIds : [priorityServiceIds]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật dịch vụ ưu tiên thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Cập nhật dịch vụ ưu tiên thành công!");
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};