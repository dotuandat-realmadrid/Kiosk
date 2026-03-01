// server/controllers/api.province.controller.js
const provinceService = require('../services/api.province.service');

// TÌM KIẾM TỈNH/THÀNH PHỐ
exports.searchProvinces = async (req, res) => {
  try {
    const { id, code, name, is_active, page, size } = req.query;

    const result = await provinceService.searchProvinces(
      { id, code, name, is_active },
      { page, size }
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Search provinces error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách tỉnh/thành phố'
    });
  }
};

// LẤY THÔNG TIN TỈNH/THÀNH PHỐ THEO ID
exports.getProvinceById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await provinceService.getProvinceById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Lấy thông tin tỉnh/thành phố thành công',
      data: result.province
    });

  } catch (error) {
    console.error('Get province error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin tỉnh/thành phố'
    });
  }
};

// THÊM MỚI TỈNH/THÀNH PHỐ
exports.createProvince = async (req, res) => {
  try {
    const { code, name, is_active } = req.body;

    // Validate required fields
    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Mã và tên tỉnh/thành phố là bắt buộc'
      });
    }

    const result = await provinceService.createProvince({
      code,
      name,
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
      message: 'Thêm tỉnh/thành phố thành công',
      data: result.province
    });

  } catch (error) {
    console.error('Create province error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thêm tỉnh/thành phố'
    });
  }
};

// CẬP NHẬT TỈNH/THÀNH PHỐ
exports.updateProvince = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, is_active } = req.body;

    const result = await provinceService.updateProvince(id, {
      code,
      name,
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
      message: 'Cập nhật tỉnh/thành phố thành công',
      data: result.province
    });

  } catch (error) {
    console.error('Update province error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật tỉnh/thành phố'
    });
  }
};

// XÓA MỘT HOẶC NHIỀU TỈNH/THÀNH PHỐ
exports.deleteProvinces = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID cần xóa'
      });
    }

    const result = await provinceService.deleteProvinces(ids);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã xóa ${result.deletedCount} tỉnh/thành phố thành công`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Delete provinces error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa tỉnh/thành phố'
    });
  }
};

// BẬT/TẮT TRẠNG THÁI NHIỀU TỈNH/THÀNH PHỐ
exports.toggleProvinces = async (req, res) => {
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

    const result = await provinceService.toggleProvinces(ids, is_active);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã ${is_active ? 'kích hoạt' : 'vô hiệu hóa'} ${result.updatedCount} tỉnh/thành phố`,
      updatedCount: result.updatedCount
    });

  } catch (error) {
    console.error('Toggle provinces error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thay đổi trạng thái tỉnh/thành phố'
    });
  }
};