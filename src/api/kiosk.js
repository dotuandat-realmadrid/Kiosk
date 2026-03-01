// ==========================================
// kiosk.js (Frontend API - UPDATED - THEO BACKEND MỚI)
// ==========================================
import { message } from "antd";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";
import { validateInput } from "../utils/ValidateInputUtil";

/**
 * Tìm kiếm kiosk với phân trang
 */
export const searchKiosks = async (request, page = 1, pageSize = 20) => {
  try {
    const params = new URLSearchParams();
    
    // Thêm các filter params
    if (request.id) params.append('id', request.id);
    if (request.code) params.append('code', request.code);
    if (request.name) params.append('name', request.name);
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

    const url = `${API}/kiosks?${params.toString()}`;
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
        errorData.message || "Tải danh sách kiosk thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    console.error("Search kiosks error:", error);
    message.error(error.message);
    throw error;
  }
};

/**
 * Lấy thông tin kiosk theo ID
 */
export const getKioskById = async (id) => {
  try {
    const response = await fetch(`${API}/kiosks/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải thông tin kiosk thất bại!"
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
 * Thêm mới kiosk
 */
export const createKiosk = async (data) => {
  try {
    const response = await fetch(`${API}/kiosks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tạo kiosk thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }
    
    setTimeout(() => {
      message.success("Tạo kiosk thành công!");
    }, 100);

    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Cập nhật kiosk
 */
export const updateKiosk = async (id, data) => {
  try {
    const response = await fetch(`${API}/kiosks/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật kiosk thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Cập nhật kiosk thành công!");
    console.log("Update kiosk result:", result);
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều kiosk
 */
export const deleteKiosks = async (ids) => {
  try {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/kiosks`, {
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
        errorData.message || "Xóa kiosk thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Xóa kiosk thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Bật/tắt trạng thái nhiều kiosk
 */
export const toggleKiosks = async (ids, is_active) => {
  try {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/kiosks/toggle`, {
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
        errorData.message || "Cập nhật trạng thái kiosk thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Cập nhật trạng thái kiosk thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

// ==================== SERVICE CONFIG MANAGEMENT ====================

/**
 * Lấy cấu hình dịch vụ của kiosk
 * Endpoint: GET /kiosks/:id/service-config
 */
export const getServiceConfig = async (kioskId) => {
  try {
    const response = await fetch(`${API}/kiosks/${kioskId}/service-config`, {
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

    return result.data; // { services: [], service_groups: [] }
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Set cấu hình dịch vụ (replace toàn bộ)
 * Endpoint: PUT /kiosks/:id/service-config
 */
export const setServiceConfig = async (kioskId, serviceIds = [], serviceGroupIds = []) => {
  try {
    const response = await fetch(`${API}/kiosks/${kioskId}/service-config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ 
        service_ids: serviceIds,
        service_group_ids: serviceGroupIds
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
 * Endpoint: POST /kiosks/:id/services
 */
export const addServices = async (kioskId, serviceIds) => {
  try {
    const response = await fetch(`${API}/kiosks/${kioskId}/services`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ service_ids: serviceIds }),
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
 * Endpoint: DELETE /kiosks/:id/services
 */
export const removeServices = async (kioskId, serviceIds) => {
  try {
    const response = await fetch(`${API}/kiosks/${kioskId}/services`, {
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
 * Thêm service groups (không xóa cũ)
 * Endpoint: POST /kiosks/:id/service-groups
 */
export const addServiceGroups = async (kioskId, serviceGroupIds) => {
  try {
    const response = await fetch(`${API}/kiosks/${kioskId}/service-groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ service_group_ids: serviceGroupIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Thêm nhóm dịch vụ thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Thêm nhóm dịch vụ thành công!");
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa service groups
 * Endpoint: DELETE /kiosks/:id/service-groups
 */
export const removeServiceGroups = async (kioskId, serviceGroupIds) => {
  try {
    const response = await fetch(`${API}/kiosks/${kioskId}/service-groups`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ service_group_ids: serviceGroupIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Xóa nhóm dịch vụ thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Xóa nhóm dịch vụ thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa tất cả cấu hình dịch vụ
 * Endpoint: DELETE /kiosks/:id/service-config
 */
export const clearServiceConfig = async (kioskId) => {
  try {
    const response = await fetch(`${API}/kiosks/${kioskId}/service-config`, {
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