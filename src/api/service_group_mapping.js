import { message } from "antd";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";

// ==========================================
// SERVICE GROUP MAPPING API CALLS
// ==========================================

/**
 * Tìm kiếm tất cả mapping với phân trang
 */
export const searchMappings = async (request, page, size) => {
  try {
    // Xử lý params để tránh undefined
    const params = new URLSearchParams();
    
    if (request.service_id) params.append('service_id', request.service_id);
    if (request.service_group_id) params.append('service_group_id', request.service_group_id);
    
    params.append('page', page);
    params.append('size', size);

    const url = `${API}/service-group-mappings?${params.toString()}`;
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
        errorData.message || "Tải danh sách mapping thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    // Trả về toàn bộ result
    return result;
  } catch (error) {
    console.error("Search mappings error:", error);
    message.error(error.message);
    throw error;
  }
};

/**
 * Lấy danh sách dịch vụ thuộc nhóm
 */
export const getServicesByGroup = async (groupId, page = 1, size = 20) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);

    const url = `${API}/service-group-mappings/group/${groupId}/services?${params.toString()}`;
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
        errorData.message || "Tải danh sách dịch vụ thuộc nhóm thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    console.error("Get services by group error:", error);
    message.error(error.message);
    throw error;
  }
};

/**
 * Lấy danh sách nhóm mà dịch vụ thuộc về
 */
export const getGroupsByService = async (serviceId, page = 1, size = 20) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);

    const url = `${API}/service-group-mappings/service/${serviceId}/groups?${params.toString()}`;
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
        errorData.message || "Tải danh sách nhóm của dịch vụ thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    console.error("Get groups by service error:", error);
    message.error(error.message);
    throw error;
  }
};

/**
 * Thêm nhiều dịch vụ vào nhóm
 */
export const addServicesToGroup = async (groupId, serviceIds) => {
  try {
    // Chuyển single ID thành array nếu cần
    const idArray = Array.isArray(serviceIds) ? serviceIds : [serviceIds];

    const response = await fetch(`${API}/service-group-mappings/group/${groupId}/services`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ service_ids: idArray }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Thêm dịch vụ vào nhóm thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Thêm dịch vụ vào nhóm thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa nhiều dịch vụ khỏi nhóm
 */
export const removeServicesFromGroup = async (groupId, serviceIds) => {
  try {
    // Chuyển single ID thành array nếu cần
    const idArray = Array.isArray(serviceIds) ? serviceIds : [serviceIds];

    const response = await fetch(`${API}/service-group-mappings/group/${groupId}/services`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ service_ids: idArray }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Xóa dịch vụ khỏi nhóm thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Xóa dịch vụ khỏi nhóm thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa tất cả dịch vụ khỏi nhóm
 */
export const removeAllServicesFromGroup = async (groupId) => {
  try {
    const response = await fetch(`${API}/service-group-mappings/group/${groupId}/services/all`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Xóa tất cả dịch vụ khỏi nhóm thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Xóa tất cả dịch vụ khỏi nhóm thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Thêm dịch vụ vào nhiều nhóm
 */
export const addGroupsToService = async (serviceId, groupIds) => {
  try {
    // Chuyển single ID thành array nếu cần
    const idArray = Array.isArray(groupIds) ? groupIds : [groupIds];

    const response = await fetch(`${API}/service-group-mappings/service/${serviceId}/groups`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ group_ids: idArray }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Thêm dịch vụ vào nhóm thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Thêm dịch vụ vào nhóm thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa dịch vụ khỏi nhiều nhóm
 */
export const removeGroupsFromService = async (serviceId, groupIds) => {
  try {
    // Chuyển single ID thành array nếu cần
    const idArray = Array.isArray(groupIds) ? groupIds : [groupIds];

    const response = await fetch(`${API}/service-group-mappings/service/${serviceId}/groups`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ group_ids: idArray }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Xóa dịch vụ khỏi nhóm thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Xóa dịch vụ khỏi nhóm thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa dịch vụ khỏi tất cả nhóm
 */
export const removeServiceFromAllGroups = async (serviceId) => {
  try {
    const response = await fetch(`${API}/service-group-mappings/service/${serviceId}/groups/all`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Xóa dịch vụ khỏi tất cả nhóm thất bại!"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    message.success(result.message || "Xóa dịch vụ khỏi tất cả nhóm thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};