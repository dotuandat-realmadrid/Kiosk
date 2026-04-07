// ==========================================
// controllers/api.e_center_board.controller.js (UPDATED - broadcast board-updated)
// ==========================================
const boardService = require('../services/api.e_center_board.service');
const { getRelativePath, deleteFile } = require('../middlewares/upload.middleware');

// ─── Broadcast tới tất cả WS client đang OPEN ───────────────────────────────
// Gửi { type: "board-updated", data: { id, code? } } để ECenterBoard biết reload
const broadcastBoardEvent = (eventType, data) => {
  if (!global.wss) return;
  const wsData = JSON.stringify({ type: eventType, data });
  global.wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(wsData);
  });
};

// ==================== CRUD CHÍNH ====================

exports.searchBoards = async (req, res) => {
  try {
    const { id, code, name, counter_id, transaction_office_id, district_id, district_code, province_id, province_code, is_video_enabled, is_slider_enabled, voice_type, is_active, page, size } = req.query;
    const result = await boardService.searchBoards({ id, code, name, counter_id, transaction_office_id, district_id, district_code, province_id, province_code, is_video_enabled, is_slider_enabled, voice_type, is_active }, { page, size });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy danh sách bảng điện tử' });
  }
};

exports.getBoardById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await boardService.getBoardById(id);
    if (!result.success) return res.status(404).json({ success: false, message: result.message });
    res.json({ success: true, message: 'Lấy thông tin bảng điện tử thành công', data: result.board });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy thông tin bảng điện tử' });
  }
};

exports.getBoardByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const result = await boardService.getBoardByCode(code);
    if (!result.success) return res.status(404).json({ success: false, message: result.message });
    res.json({ success: true, message: 'Lấy thông tin bảng điện tử thành công', data: result.board });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy thông tin bảng điện tử' });
  }
};

exports.createBoard = async (req, res) => {
  try {
    const { code, name, counter_ids, is_video_enabled, is_slider_enabled, voice_type, is_active, videos, image_sliders } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Mã bảng điện tử là bắt buộc' });
    if (!name) return res.status(400).json({ success: false, message: 'Tên bảng điện tử là bắt buộc' });
    if (!counter_ids || !Array.isArray(counter_ids) || counter_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất một quầy (counter_ids)' });
    }
    const result = await boardService.createBoard({ code, name, counter_ids, is_video_enabled, is_slider_enabled, voice_type, is_active, videos, image_sliders });
    if (!result.success) return res.status(400).json({ success: false, message: result.message });
    broadcastBoardEvent('board-updated', { id: result.board.id, code: result.board.code });
    res.status(201).json({ success: true, message: 'Thêm bảng điện tử thành công', data: result.board });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi thêm bảng điện tử' });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, counter_ids, is_video_enabled, is_slider_enabled, voice_type, is_active } = req.body;
    const result = await boardService.updateBoard(id, { code, name, counter_ids, is_video_enabled, is_slider_enabled, voice_type, is_active });
    if (!result.success) {
      return res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
    }
    // ─── Broadcast: ECenterBoard đang chạy với code này sẽ tự reload ──────────
    broadcastBoardEvent('board-updated', { id, code: result.board.code });
    res.json({ success: true, message: 'Cập nhật bảng điện tử thành công', data: result.board });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi cập nhật bảng điện tử' });
  }
};

exports.deleteBoards = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp danh sách ID cần xóa' });
    }
    const result = await boardService.deleteBoards(ids);
    if (!result.success) return res.status(400).json({ success: false, message: result.message });
    ids.forEach((id) => broadcastBoardEvent('board-updated', { id, deleted: true }));
    res.json({ success: true, message: `Đã xóa ${result.deletedCount} bảng điện tử thành công`, deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi xóa bảng điện tử' });
  }
};

exports.toggleBoards = async (req, res) => {
  try {
    const { ids, is_active } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp danh sách ID' });
    }
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Trạng thái is_active phải là boolean' });
    }
    const result = await boardService.toggleBoards(ids, is_active);
    if (!result.success) return res.status(400).json({ success: false, message: result.message });
    ids.forEach((id) => broadcastBoardEvent('board-updated', { id }));
    res.json({ success: true, message: `Đã ${is_active ? 'kích hoạt' : 'vô hiệu hóa'} ${result.updatedCount} bảng điện tử`, updatedCount: result.updatedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi thay đổi trạng thái bảng điện tử' });
  }
};

// ==================== COUNTER MANAGEMENT ====================

exports.getCounters = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await boardService.getCounters(id);
    if (!result.success) return res.status(404).json({ success: false, message: result.message });
    res.json({ success: true, message: 'Lấy danh sách quầy thành công', data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy danh sách quầy' });
  }
};

exports.addCounters = async (req, res) => {
  try {
    const { id } = req.params;
    const { counter_ids } = req.body;
    if (!counter_ids || !Array.isArray(counter_ids) || counter_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp danh sách counter_ids' });
    }
    const result = await boardService.addCounters(id, counter_ids);
    if (!result.success) return res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
    broadcastBoardEvent('board-updated', { id });
    res.status(201).json({ success: true, message: 'Thêm quầy vào bảng điện tử thành công', data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi thêm quầy' });
  }
};

exports.removeCounters = async (req, res) => {
  try {
    const { id } = req.params;
    const { counter_ids } = req.body;
    if (!counter_ids || !Array.isArray(counter_ids) || counter_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp danh sách counter_ids cần xóa' });
    }
    const result = await boardService.removeCounters(id, counter_ids);
    if (!result.success) return res.status(404).json({ success: false, message: result.message });
    broadcastBoardEvent('board-updated', { id });
    res.json({ success: true, message: 'Xóa quầy khỏi bảng điện tử thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi xóa quầy' });
  }
};

// ==================== VIDEO MANAGEMENT ====================

exports.getVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await boardService.getVideos(id);
    if (!result.success) return res.status(404).json({ success: false, message: result.message });
    res.json({ success: true, message: 'Lấy danh sách video thành công', data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy danh sách video' });
  }
};

exports.addVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const { videos } = req.body;
    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp danh sách video' });
    }
    const result = await boardService.addVideos(id, videos);
    if (!result.success) return res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
    broadcastBoardEvent('board-updated', { id });
    res.status(201).json({ success: true, message: 'Thêm video thành công', data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi thêm video' });
  }
};

exports.uploadVideos = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file video' });
    }
    const videos = req.files.map((file, index) => ({
      file_path: getRelativePath(file.path),
      description: req.body[`description_${index}`] || req.body.description || null
    }));
    const result = await boardService.addVideos(id, videos);
    if (!result.success) {
      req.files.forEach(f => deleteFile(getRelativePath(f.path)));
      return res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
    }
    // ─── Broadcast: màn hình board tự reload lấy video mới ───────────────────
    broadcastBoardEvent('board-updated', { id });
    res.status(201).json({ success: true, message: `Đã upload và lưu ${videos.length} video thành công`, data: result.data });
  } catch (error) {
    if (req.files) req.files.forEach(f => deleteFile(getRelativePath(f.path)));
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi upload video' });
  }
};

exports.removeVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp danh sách ID video' });
    }
    const result = await boardService.removeVideos(id, ids);
    if (!result.success) return res.status(404).json({ success: false, message: result.message });
    broadcastBoardEvent('board-updated', { id });
    res.json({ success: true, message: 'Xóa video thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi xóa video' });
  }
};

exports.clearVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await boardService.clearVideos(id);
    if (!result.success) return res.status(404).json({ success: false, message: result.message });
    broadcastBoardEvent('board-updated', { id });
    res.json({ success: true, message: 'Đã xóa toàn bộ video', data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi xóa toàn bộ video' });
  }
};

// ==================== IMAGE SLIDER MANAGEMENT ====================

exports.getImageSliders = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await boardService.getImageSliders(id);
    if (!result.success) return res.status(404).json({ success: false, message: result.message });
    res.json({ success: true, message: 'Lấy danh sách ảnh slider thành công', data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy danh sách ảnh slider' });
  }
};

exports.addImageSliders = async (req, res) => {
  try {
    const { id } = req.params;
    const { image_sliders } = req.body;
    if (!image_sliders || !Array.isArray(image_sliders) || image_sliders.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp danh sách ảnh slider' });
    }
    const result = await boardService.addImageSliders(id, image_sliders);
    if (!result.success) return res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
    broadcastBoardEvent('board-updated', { id });
    res.status(201).json({ success: true, message: 'Thêm ảnh slider thành công', data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi thêm ảnh slider' });
  }
};

exports.uploadImageSliders = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh' });
    }
    const image_sliders = req.files.map((file, index) => ({
      file_path: getRelativePath(file.path),
      description: req.body[`description_${index}`] || req.body.description || null
    }));
    const result = await boardService.addImageSliders(id, image_sliders);
    if (!result.success) {
      req.files.forEach(f => deleteFile(getRelativePath(f.path)));
      return res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
    }
    // ─── Broadcast: màn hình board tự reload lấy ảnh slider mới ─────────────
    broadcastBoardEvent('board-updated', { id });
    res.status(201).json({ success: true, message: `Đã upload và lưu ${image_sliders.length} ảnh slider thành công`, data: result.data });
  } catch (error) {
    if (req.files) req.files.forEach(f => deleteFile(getRelativePath(f.path)));
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi upload ảnh slider' });
  }
};

exports.removeImageSliders = async (req, res) => {
  try {
    const { id } = req.params;
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp danh sách ID ảnh slider' });
    }
    const result = await boardService.removeImageSliders(id, ids);
    if (!result.success) return res.status(404).json({ success: false, message: result.message });
    broadcastBoardEvent('board-updated', { id });
    res.json({ success: true, message: 'Xóa ảnh slider thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi xóa ảnh slider' });
  }
};

exports.clearImageSliders = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await boardService.clearImageSliders(id);
    if (!result.success) return res.status(404).json({ success: false, message: result.message });
    broadcastBoardEvent('board-updated', { id });
    res.json({ success: true, message: 'Đã xóa toàn bộ ảnh slider', data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi xóa toàn bộ ảnh slider' });
  }
};