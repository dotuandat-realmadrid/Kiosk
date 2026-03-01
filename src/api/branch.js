// ==========================================
// branch.js (Frontend API - UPDATED - THEO BACKEND MỚI)
// ==========================================
import { message } from "antd";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";
import { validateInput } from "../utils/ValidateInputUtil";

/**
 * Tìm kiếm chi nhánh với phân trang
 */
export const searchBranches = async (request, page = 1, pageSize = 20) => {
  try {
    const params = new URLSearchParams();
    
    // Thêm các filter params
    if (request.id) params.append('id', request.id);
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

    const url = `${API}/branches?${params.toString()}`;
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
        errorData.message || "Tải danh sách chi nhánh thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    console.error("Search branches error:", error);
    message.error(error.message);
    throw error;
  }
};

/**
 * Lấy thông tin chi nhánh theo ID
 */
export const getBranchById = async (id) => {
  try {
    const response = await fetch(`${API}/branches/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải thông tin chi nhánh thất bại!"
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
 * Thêm mới chi nhánh
 */
export const createBranch = async (data) => {
  try {
    const response = await fetch(`${API}/branches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tạo chi nhánh thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }
    
    setTimeout(() => {
      message.success("Tạo chi nhánh thành công!");
    }, 100);

    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Cập nhật chi nhánh
 */
export const updateBranch = async (id, data) => {
  try {
    const response = await fetch(`${API}/branches/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật chi nhánh thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Cập nhật chi nhánh thành công!");
    console.log("Update branch result:", result);
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều chi nhánh
 */
export const deleteBranches = async (ids) => {
  try {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/branches`, {
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
        errorData.message || "Xóa chi nhánh thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Xóa chi nhánh thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Bật/tắt trạng thái nhiều chi nhánh
 */
export const toggleBranches = async (ids, is_active) => {
  try {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const response = await fetch(`${API}/branches/toggle`, {
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
        errorData.message || "Cập nhật trạng thái chi nhánh thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Cập nhật trạng thái chi nhánh thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

// ==================== SERVICE CONFIG MANAGEMENT ====================

/**
 * Lấy cấu hình dịch vụ của chi nhánh
 * Endpoint: GET /branches/:id/service-config
 */
export const getServiceConfig = async (branchId) => {
  try {
    const response = await fetch(`${API}/branches/${branchId}/service-config`, {
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
 * Endpoint: PUT /branches/:id/service-config
 */
export const setServiceConfig = async (branchId, serviceIds = [], serviceGroupIds = []) => {
  try {
    const response = await fetch(`${API}/branches/${branchId}/service-config`, {
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
 * Endpoint: POST /branches/:id/services
 */
export const addServices = async (branchId, serviceIds) => {
  try {
    const response = await fetch(`${API}/branches/${branchId}/services`, {
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
 * Endpoint: DELETE /branches/:id/services
 */
export const removeServices = async (branchId, serviceIds) => {
  try {
    const response = await fetch(`${API}/branches/${branchId}/services`, {
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
 * Endpoint: POST /branches/:id/service-groups
 */
export const addServiceGroups = async (branchId, serviceGroupIds) => {
  try {
    const response = await fetch(`${API}/branches/${branchId}/service-groups`, {
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
 * Endpoint: DELETE /branches/:id/service-groups
 */
export const removeServiceGroups = async (branchId, serviceGroupIds) => {
  try {
    const response = await fetch(`${API}/branches/${branchId}/service-groups`, {
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
 * Endpoint: DELETE /branches/:id/service-config
 */
export const clearServiceConfig = async (branchId) => {
  try {
    const response = await fetch(`${API}/branches/${branchId}/service-config`, {
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

// ==================== QUEUE CONFIG ====================

/**
 * Lấy cấu hình quầy của chi nhánh
 * Endpoint: GET /branches/:id/queue-config
 */
export const getBranchQueueConfig = async (branchId) => {
  try {
    const response = await fetch(`${API}/branches/${branchId}/queue-config`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải cấu hình quầy thất bại!"
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
 * Cập nhật cấu hình quầy
 * Endpoint: PUT /branches/:id/queue-config
 */
export const updateBranchQueueConfig = async (branchId, configData) => {
  try {
    const response = await fetch(`${API}/branches/${branchId}/queue-config`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(configData)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật cấu hình quầy thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Cập nhật cấu hình quầy thành công!");
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

// ==================== REPORT CONFIG ====================

/**
 * Lấy cấu hình báo cáo của chi nhánh
 * Endpoint: GET /branches/:id/report-config
 */
export const getBranchReportConfig = async (branchId) => {
  try {
    const response = await fetch(`${API}/branches/${branchId}/report-config`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải cấu hình báo cáo thất bại!"
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
 * Cập nhật cấu hình báo cáo
 * Endpoint: PUT /branches/:id/report-config
 */
export const updateBranchReportConfig = async (branchId, configData) => {
  try {
    const response = await fetch(`${API}/branches/${branchId}/report-config`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(configData)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật cấu hình báo cáo thất bại!");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success("Cập nhật cấu hình báo cáo thành công!");
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};