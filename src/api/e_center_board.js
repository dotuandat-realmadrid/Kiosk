// ==========================================
// e_center_board.js (Frontend API - UPDATED N-N Counter)
// ==========================================
import { message } from "antd";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";
import { validateInput } from "../utils/ValidateInputUtil";

// ==================== VOICE TYPE MAP ====================
export const VOICE_TYPE_OPTIONS = [
  { value: "hanoi", label: "Hà Nội" },
  { value: "hochiminh", label: "Hồ Chí Minh" },
  { value: "danang", label: "Đà Nẵng" },
  { value: "hue", label: "Huế" },
];

export const VOICE_TYPE_LABEL = {
  hanoi: "Hà Nội",
  hochiminh: "Hồ Chí Minh",
  danang: "Đà Nẵng",
  hue: "Huế",
};

// ==================== SEARCH & READ ====================

export const searchBoards = async (request, page = 1, pageSize = 20) => {
  try {
    const params = new URLSearchParams();

    if (request.id) params.append("id", request.id);
    if (request.code) params.append("code", request.code);
    if (request.name) params.append("name", request.name);
    // ← counter_id vẫn giữ để filter theo 1 counter cụ thể
    if (request.counter_id) params.append("counter_id", request.counter_id);
    if (request.transaction_office_id) params.append("transaction_office_id", request.transaction_office_id);
    if (request.district_id) params.append("district_id", request.district_id);
    if (request.district_code) params.append("district_code", request.district_code);
    if (request.province_id) params.append("province_id", request.province_id);
    if (request.province_code) params.append("province_code", request.province_code);
    if (request.voice_type) params.append("voice_type", request.voice_type);
    if (request.is_video_enabled !== undefined && request.is_video_enabled !== null && request.is_video_enabled !== "") {
      params.append("is_video_enabled", request.is_video_enabled);
    }
    if (request.is_slider_enabled !== undefined && request.is_slider_enabled !== null && request.is_slider_enabled !== "") {
      params.append("is_slider_enabled", request.is_slider_enabled);
    }
    if (request.is_active !== undefined && request.is_active !== null && request.is_active !== "") {
      params.append("is_active", request.is_active);
    }

    params.append("page", page);
    params.append("size", pageSize);

    const url = `${API}/e-center-boards?${params.toString()}`;
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
      throw new Error(errorData.message || "Tải danh sách bảng điện tử thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result;
  } catch (error) {
    console.error("Search boards error:", error);
    message.error(error.message);
    throw error;
  }
};

export const getBoardByCode = async (code) => {
  try {
    const response = await fetch(`${API}/e-center-boards/code/${code}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải thông tin bảng điện tử thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
    // result.data.counters = mảng các counter gắn với board
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

export const getBoardById = async (id) => {
  try {
    const response = await fetch(`${API}/e-center-boards/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải thông tin bảng điện tử thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
    // result.data.counters = mảng các counter gắn với board
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

// ==================== CREATE / UPDATE / DELETE ====================

/**
 * Thêm mới bảng điện tử
 * @param {Object} data - {
 *   code, name,
 *   counter_ids: string[],   // ← mảng UUID thay vì counter_id đơn
 *   is_video_enabled?,
 *   is_slider_enabled?,
 *   voice_type?,             // 'hanoi' | 'hochiminh' | 'danang' | 'hue'
 *   is_active?,
 *   videos?: [{ file_path, description? }],
 *   image_sliders?: [{ file_path, description? }]
 * }
 */
export const createBoard = async (data) => {
  try {
    const payload = {
      code: data.code,
      name: data.name,
      counter_ids: data.counter_ids || [],   // ← mảng thay vì counter_id đơn
      is_video_enabled: data.is_video_enabled ?? false,
      is_slider_enabled: data.is_slider_enabled ?? false,
      voice_type: data.voice_type || "hanoi",
      is_active: data.is_active ?? true,
      ...(data.videos && { videos: data.videos }),
      ...(data.image_sliders && { image_sliders: data.image_sliders }),
    };

    const response = await fetch(`${API}/e-center-boards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(validateInput(payload)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tạo bảng điện tử thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    setTimeout(() => message.success("Tạo bảng điện tử thành công!"), 100);
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Cập nhật bảng điện tử
 * @param {Object} data - {
 *   code?, name?,
 *   counter_ids?: string[],  // nếu truyền vào sẽ sync lại toàn bộ danh sách counter
 *   is_video_enabled?, is_slider_enabled?,
 *   voice_type?, is_active?
 * }
 */
export const updateBoard = async (id, data) => {
  try {
    const payload = {};
    if (data.code !== undefined) payload.code = data.code;
    if (data.name !== undefined) payload.name = data.name;
    if (data.counter_ids !== undefined) payload.counter_ids = data.counter_ids; // ← mảng
    if (data.is_video_enabled !== undefined) payload.is_video_enabled = data.is_video_enabled;
    if (data.is_slider_enabled !== undefined) payload.is_slider_enabled = data.is_slider_enabled;
    if (data.voice_type !== undefined) payload.voice_type = data.voice_type;
    if (data.is_active !== undefined) payload.is_active = data.is_active;

    const response = await fetch(`${API}/e-center-boards/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(payload)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật bảng điện tử thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    message.success("Cập nhật bảng điện tử thành công!");
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

export const deleteBoards = async (ids) => {
  try {
    const idArray = Array.isArray(ids) ? ids : [ids];

    const response = await fetch(`${API}/e-center-boards`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: idArray }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Xóa bảng điện tử thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    message.success(result.message || "Xóa bảng điện tử thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

export const toggleBoards = async (ids, is_active) => {
  try {
    const idArray = Array.isArray(ids) ? ids : [ids];

    const response = await fetch(`${API}/e-center-boards/toggle`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: idArray, is_active }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật trạng thái bảng điện tử thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    message.success(result.message || "Cập nhật trạng thái thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

// ==================== COUNTER MANAGEMENT ====================

/**
 * Lấy danh sách counters của board
 */
export const getBoardCounters = async (boardId) => {
  try {
    const response = await fetch(`${API}/e-center-boards/${boardId}/counters`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải danh sách quầy thất bại!");
    }
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Thêm counters vào board (không xóa cái cũ)
 * @param {string[]} counterIds - mảng UUID của counter
 */
export const addBoardCounters = async (boardId, counterIds) => {
  try {
    const idArray = Array.isArray(counterIds) ? counterIds : [counterIds];

    const response = await fetch(`${API}/e-center-boards/${boardId}/counters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ counter_ids: idArray }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Thêm quầy thất bại!");
    }
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    message.success("Thêm quầy thành công!");
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

/**
 * Xóa counters khỏi board
 * @param {string[]} counterIds - mảng UUID của counter cần xóa
 */
export const removeBoardCounters = async (boardId, counterIds) => {
  try {
    const idArray = Array.isArray(counterIds) ? counterIds : [counterIds];

    const response = await fetch(`${API}/e-center-boards/${boardId}/counters`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ counter_ids: idArray }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Xóa quầy thất bại!");
    }
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    message.success("Xóa quầy khỏi bảng điện tử thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

// ==================== VIDEO MANAGEMENT ====================

export const getVideos = async (boardId) => {
  try {
    const response = await fetch(`${API}/e-center-boards/${boardId}/videos`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải danh sách video thất bại!");
    }
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

export const uploadVideos = async (boardId, files, descriptions = "") => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("videos", file));

    if (Array.isArray(descriptions)) {
      descriptions.forEach((desc, index) => {
        if (desc) formData.append(`description_${index}`, desc);
      });
    } else if (descriptions) {
      formData.append("description", descriptions);
    }

    const response = await fetch(`${API}/e-center-boards/${boardId}/videos/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Upload video thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    message.success(result.message || "Upload video thành công!");
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

export const addVideos = async (boardId, videos) => {
  try {
    const response = await fetch(`${API}/e-center-boards/${boardId}/videos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ videos }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Thêm video thất bại!");
    }
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    message.success("Thêm video thành công!");
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

export const removeVideos = async (boardId, ids) => {
  try {
    const idArray = Array.isArray(ids) ? ids : [ids];
    const response = await fetch(`${API}/e-center-boards/${boardId}/videos`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ids: idArray }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Xóa video thất bại!");
    }
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    message.success("Xóa video thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

export const clearVideos = async (boardId) => {
  try {
    const response = await fetch(`${API}/e-center-boards/${boardId}/videos/clear`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Xóa toàn bộ video thất bại!");
    }
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    message.success("Đã xóa toàn bộ video!");
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

// ==================== IMAGE SLIDER MANAGEMENT ====================

export const getImageSliders = async (boardId) => {
  try {
    const response = await fetch(`${API}/e-center-boards/${boardId}/image-sliders`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải danh sách ảnh slider thất bại!");
    }
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

export const uploadImageSliders = async (boardId, files, descriptions = "") => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("image_sliders", file));

    if (Array.isArray(descriptions)) {
      descriptions.forEach((desc, index) => {
        if (desc) formData.append(`description_${index}`, desc);
      });
    } else if (descriptions) {
      formData.append("description", descriptions);
    }

    const response = await fetch(`${API}/e-center-boards/${boardId}/image-sliders/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Upload ảnh slider thất bại!");
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    message.success(result.message || "Upload ảnh slider thành công!");
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

export const addImageSliders = async (boardId, image_sliders) => {
  try {
    const response = await fetch(`${API}/e-center-boards/${boardId}/image-sliders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ image_sliders }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Thêm ảnh slider thất bại!");
    }
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    message.success("Thêm ảnh slider thành công!");
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

export const removeImageSliders = async (boardId, ids) => {
  try {
    const idArray = Array.isArray(ids) ? ids : [ids];
    const response = await fetch(`${API}/e-center-boards/${boardId}/image-sliders`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ids: idArray }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Xóa ảnh slider thất bại!");
    }
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    message.success("Xóa ảnh slider thành công!");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

export const clearImageSliders = async (boardId) => {
  try {
    const response = await fetch(`${API}/e-center-boards/${boardId}/image-sliders/clear`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Xóa toàn bộ ảnh slider thất bại!");
    }
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    message.success("Đã xóa toàn bộ ảnh slider!");
    return result.data;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};