// server/controllers/api.position.controller.js
const positionService = require('../services/api.position.service');

// TÌM KIẾM CHỨC DANH
exports.searchPositions = async (req, res) => {
  try {
    const { id, code, name, is_active, page, size } = req.query;

    const result = await positionService.searchPositions(
      { id, code, name, is_active },
      { page, size }
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Search positions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách chức danh'
    });
  }
};

// LẤY THÔNG TIN CHỨC DANH THEO ID
exports.getPositionById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await positionService.getPositionById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Lấy thông tin chức danh thành công',
      data: result.position
    });

  } catch (error) {
    console.error('Get position error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin chức danh'
    });
  }
};

// LẤY TẤT CẢ CHỨC DANH ĐANG HOẠT ĐỘNG (KHÔNG PHÂN TRANG)
exports.getAllActivePositions = async (req, res) => {
  try {
    const result = await positionService.getAllActivePositions();

    res.json({
      success: true,
      message: 'Lấy danh sách chức danh đang hoạt động thành công',
      data: result.positions
    });

  } catch (error) {
    console.error('Get all active positions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách chức danh'
    });
  }
};

// THÊM MỚI CHỨC DANH
exports.createPosition = async (req, res) => {
  try {
    const { code, name, description, is_active } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Mã và tên chức danh là bắt buộc'
      });
    }

    const result = await positionService.createPosition({
      code,
      name,
      description,
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
      message: 'Thêm chức danh thành công',
      data: result.position
    });

  } catch (error) {
    console.error('Create position error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thêm chức danh'
    });
  }
};

// CẬP NHẬT CHỨC DANH
exports.updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, is_active } = req.body;

    const result = await positionService.updatePosition(id, {
      code,
      name,
      description,
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
      message: 'Cập nhật chức danh thành công',
      data: result.position
    });

  } catch (error) {
    console.error('Update position error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật chức danh'
    });
  }
};

// XÓA MỘT HOẶC NHIỀU CHỨC DANH
exports.deletePositions = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID cần xóa'
      });
    }

    const result = await positionService.deletePositions(ids);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã xóa ${result.deletedCount} chức danh thành công`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Delete positions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa chức danh'
    });
  }
};

// BẬT/TẮT TRẠNG THÁI NHIỀU CHỨC DANH
exports.togglePositions = async (req, res) => {
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

    const result = await positionService.togglePositions(ids, is_active);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã ${is_active ? 'kích hoạt' : 'vô hiệu hóa'} ${result.updatedCount} chức danh`,
      updatedCount: result.updatedCount
    });

  } catch (error) {
    console.error('Toggle positions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thay đổi trạng thái chức danh'
    });
  }
};