// server/controllers/api.ticket_format.controller.js
const ticketFormatService = require('../services/api.ticket_format.service');

// TÌM KIẾM ĐỊNH DẠNG VÉ
exports.searchTicketFormats = async (req, res) => {
  try {
    const { id, code, format_pattern, is_active, page, size } = req.query;

    const result = await ticketFormatService.searchTicketFormats(
      { id, code, format_pattern, is_active },
      { page, size }
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Search ticket formats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách định dạng vé'
    });
  }
};

// LẤY THÔNG TIN ĐỊNH DẠNG VÉ THEO ID
exports.getTicketFormatById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await ticketFormatService.getTicketFormatById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Lấy thông tin định dạng vé thành công',
      data: result.ticketFormat
    });

  } catch (error) {
    console.error('Get ticket format error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin định dạng vé'
    });
  }
};

// THÊM MỚI ĐỊNH DẠNG VÉ
exports.createTicketFormat = async (req, res) => {
  try {
    const { code, format_pattern, start_number, max_number, is_active } = req.body;

    if (!code || !format_pattern || start_number === undefined || max_number === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Mã, định dạng mẫu, số bắt đầu và số lớn nhất là bắt buộc'
      });
    }

    const result = await ticketFormatService.createTicketFormat({
      code,
      format_pattern,
      start_number,
      max_number,
      is_active
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thêm định dạng vé thành công',
      data: result.ticketFormat
    });

  } catch (error) {
    console.error('Create ticket format error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thêm định dạng vé'
    });
  }
};

// CẬP NHẬT ĐỊNH DẠNG VÉ
exports.updateTicketFormat = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, format_pattern, start_number, max_number, is_active } = req.body;

    const result = await ticketFormatService.updateTicketFormat(id, {
      code,
      format_pattern,
      start_number,
      max_number,
      is_active
    });

    if (!result.success) {
      const statusCode = result.notFound ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật định dạng vé thành công',
      data: result.ticketFormat
    });

  } catch (error) {
    console.error('Update ticket format error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật định dạng vé'
    });
  }
};

// XÓA MỘT HOẶC NHIỀU ĐỊNH DẠNG VÉ
exports.deleteTicketFormats = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID cần xóa'
      });
    }

    const result = await ticketFormatService.deleteTicketFormats(ids);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã xóa ${result.deletedCount} định dạng vé thành công`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Delete ticket formats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa định dạng vé'
    });
  }
};

// BẬT/TẮT TRẠNG THÁI NHIỀU ĐỊNH DẠNG VÉ
exports.toggleTicketFormats = async (req, res) => {
  try {
    const { ids, is_active } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID'
      });
    }

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái is_active phải là boolean'
      });
    }

    const result = await ticketFormatService.toggleTicketFormats(ids, is_active);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã ${is_active ? 'kích hoạt' : 'vô hiệu hóa'} ${result.updatedCount} định dạng vé`,
      updatedCount: result.updatedCount
    });

  } catch (error) {
    console.error('Toggle ticket formats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thay đổi trạng thái định dạng vé'
    });
  }
};