// ==========================================
// transaction.js
// ==========================================
import { message } from "antd";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";

// ==========================================
// CREATE
// ==========================================

/**
 * Tạo transaction mới
 * @param {Object} data - { ticket_type, service_id, cccd_info_backup_id,
 *                          [print_date, print_time, user_id, counter_id, status, wait_status, call_time, end_time, thumbnail_base64] }
 */
export const createTransaction = async (data) => {
  try {
    const response = await fetch(`${API}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tạo transaction thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    message.success("Tạo transaction thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

// ==========================================
// READ ALL
// ==========================================

/**
 * Tìm kiếm / lấy danh sách transactions với filter và pagination
 * @param {Object} filters - { ticket_code, ticket_type, status, wait_status, service_id, user_id,
 *                             counter_id, cccd_info_backup_id, print_date, print_date_from,
 *                             print_date_to, position_id, position_code,
 *                             transaction_office_id, transaction_office_code }
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Object>} - { totalPage, pageSize, currentPage, totalElements, data }
 */
export const searchTransaction = async (filters = {}, page = 1, size = 10) => {
  try {
    const params = new URLSearchParams();

    if (filters.ticket_code)         params.append("ticket_code",         filters.ticket_code);
    if (filters.ticket_type)         params.append("ticket_type",         filters.ticket_type);
    if (filters.status)              params.append("status",              filters.status);
    if (filters.wait_status)         params.append("wait_status",         filters.wait_status);
    if (filters.service_id)          params.append("service_id",          filters.service_id);
    if (filters.user_id)             params.append("user_id",             filters.user_id);
    if (filters.counter_id)          params.append("counter_id",          filters.counter_id);
    if (filters.cccd_info_backup_id) params.append("cccd_info_backup_id", filters.cccd_info_backup_id);

    if (filters.print_date)      params.append("print_date",      filters.print_date);
    if (filters.print_date_from) params.append("print_date_from", filters.print_date_from);
    if (filters.print_date_to)   params.append("print_date_to",   filters.print_date_to);

    if (filters.position_id)             params.append("position_id",             filters.position_id);
    if (filters.position_code)           params.append("position_code",           filters.position_code);
    if (filters.transaction_office_id)   params.append("transaction_office_id",   filters.transaction_office_id);
    if (filters.transaction_office_code) params.append("transaction_office_code", filters.transaction_office_code);

    params.append("page", page);
    params.append("size", size);

    const url = `${API}/transactions?${params.toString()}`;
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
      throw new Error(errorData.message || "Tải danh sách transaction thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    return result;
  } catch (error) {
    console.error("Search transaction error:", error);
    message.error(error.message);
    throw error;
  }
};

// ==========================================
// READ ONE
// ==========================================

/** Lấy transaction theo ID */
export const getTransactionById = async (id) => {
  try {
    const response = await fetch(`${API}/transactions/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải thông tin transaction thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

// ==========================================
// READ LATEST
// ==========================================

/** Lấy transaction mới nhất */
export const getLatestTransaction = async () => {
  try {
    const response = await fetch(`${API}/transactions/latest`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải transaction mới nhất thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    return result.data;
  } catch (error) {
    console.error("Get latest transaction error:", error);
    throw error;
  }
};

// ==========================================
// UPDATE
// ==========================================

/**
 * Cập nhật transaction
 * Các trường được phép update: call_time, wait_status, end_time, status, user_id, counter_id
 */
export const updateTransaction = async (id, data) => {
  try {
    const response = await fetch(`${API}/transactions/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật transaction thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    message.success("Cập nhật transaction thành công!");
    console.log("Update transaction result:", result);
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

// ==========================================
// DELETE
// ==========================================

/** Xóa transaction (hard delete) */
export const deleteTransaction = async (id) => {
  try {
    const response = await fetch(`${API}/transactions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Xóa transaction thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    message.success("Xóa transaction thành công!");
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/** Soft delete transaction (đánh dấu dtime) */
export const softDeleteTransaction = async (id) => {
  try {
    const response = await fetch(`${API}/transactions/${id}/soft-delete`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Đánh dấu xóa transaction thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    message.success("Đánh dấu xóa transaction thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

// ==========================================
// STATUS MANAGEMENT
// ==========================================

/**
 * Cập nhật trạng thái transaction
 *
 * - "serving"              : truyền thêm { call_time?, user_id?, counter_id? }
 * - "completed"|"cancelled": truyền thêm { end_time? }
 */
export const updateTransactionStatus = async (id, status, extraData = {}) => {
  try {
    const response = await fetch(`${API}/transactions/${id}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, ...extraData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật trạng thái transaction thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    message.success(result.message || `Cập nhật trạng thái thành "${status}" thành công!`);
    console.log("Update status result:", result);
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Chuyển trạng thái sang "serving" (gọi khách)
 * @param {string} id
 * @param {Object} options - { call_time?, user_id?, counter_id? }
 */
export const callTransaction = async (id, options = {}) => {
  return updateTransactionStatus(id, "serving", options);
};

/**
 * Hoàn tất transaction (completed)
 * @param {string} id
 * @param {Object} options - { end_time? }
 */
export const completeTransaction = async (id, options = {}) => {
  return updateTransactionStatus(id, "completed", options);
};

/**
 * Hủy transaction (cancelled)
 * @param {string} id
 * @param {Object} options - { end_time? }
 */
export const cancelTransaction = async (id, options = {}) => {
  return updateTransactionStatus(id, "cancelled", options);
};

// ==========================================
// STATISTICS
// ==========================================

/**
 * Thống kê transactions theo ngày
 * @param {string|null} date - YYYY-MM-DD, mặc định hôm nay
 * @returns {Promise<Object>} - { date, total, waiting, serving, completed, cancelled }
 */
export const getTransactionStats = async (date = null) => {
  try {
    const params = new URLSearchParams();
    if (date) params.append("date", date);

    const response = await fetch(`${API}/transactions/stats?${params.toString()}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải thống kê transaction thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    return result.data;
  } catch (error) {
    console.error("Get transaction stats error:", error);
    message.error(error.message);
    throw error;
  }
};

/**
 * Lấy danh sách transaction đang chờ gọi hôm nay
 * @param {string|null} serviceId
 */
export const getWaitingTransactions = async (serviceId = null) => {
  try {
    const params = new URLSearchParams();
    if (serviceId) params.append("service_id", serviceId);

    const response = await fetch(`${API}/transactions/waiting?${params.toString()}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải danh sách chờ thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    return result;
  } catch (error) {
    console.error("Get waiting transactions error:", error);
    message.error(error.message);
    throw error;
  }
};

// ==========================================
// TRANSACTIONS THEO USER
// ==========================================

/**
 * Lấy giao dịch hôm nay có status = waiting hoặc serving
 * @param {string} userId
 * @returns {Promise<Object>} - { user_counter_id, count, data }
 */
export const getActiveTransactionsByUser = async (userId) => {
  try {
    const response = await fetch(`${API}/transactions/user/${userId}/active`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải giao dịch đang xử lý thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    return result;
  } catch (error) {
    console.error("Get active transactions by user error:", error);
    message.error(error.message);
    throw error;
  }
};

/**
 * Lấy giao dịch hôm nay có status = cancelled
 * @param {string} userId
 * @returns {Promise<Object>} - { user_counter_id, count, data }
 */
export const getCancelledTransactionsByUser = async (userId) => {
  try {
    const response = await fetch(`${API}/transactions/user/${userId}/cancelled`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải giao dịch đã hủy thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    return result;
  } catch (error) {
    console.error("Get cancelled transactions by user error:", error);
    message.error(error.message);
    throw error;
  }
};