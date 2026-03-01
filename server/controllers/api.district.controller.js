// server/controllers/api.district.controller.js
const districtService = require('../services/api.district.service');

// TÌM KIẾM QUẬN/HUYỆN
exports.searchDistricts = async (req, res) => {
  try {
    const { id, province_id, code, name, is_active, page, size } = req.query;

    const result = await districtService.searchDistricts(
      { id, province_id, code, name, is_active },
      { page, size }
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Search districts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách quận/huyện'
    });
  }
};

// LẤY THÔNG TIN QUẬN/HUYỆN THEO ID
exports.getDistrictById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await districtService.getDistrictById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Lấy thông tin quận/huyện thành công',
      data: result.district
    });

  } catch (error) {
    console.error('Get district error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin quận/huyện'
    });
  }
};

// LẤY DANH SÁCH QUẬN/HUYỆN THEO TỈNH
exports.getDistrictsByProvince = async (req, res) => {
  try {
    const { provinceId } = req.params;

    const result = await districtService.getDistrictsByProvince(provinceId);

    res.json({
      success: true,
      message: 'Lấy danh sách quận/huyện theo tỉnh thành công',
      data: result.districts
    });

  } catch (error) {
    console.error('Get districts by province error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách quận/huyện theo tỉnh'
    });
  }
};

// THÊM MỚI QUẬN/HUYỆN
exports.createDistrict = async (req, res) => {
  try {
    const { province_id, code, name, is_active } = req.body;

    if (!province_id || !code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Tỉnh/thành phố, mã và tên quận/huyện là bắt buộc'
      });
    }

    const result = await districtService.createDistrict({
      province_id,
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
      message: 'Thêm quận/huyện thành công',
      data: result.district
    });

  } catch (error) {
    console.error('Create district error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thêm quận/huyện'
    });
  }
};

// CẬP NHẬT QUẬN/HUYỆN
exports.updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { province_id, code, name, is_active } = req.body;

    const result = await districtService.updateDistrict(id, {
      province_id,
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
      message: 'Cập nhật quận/huyện thành công',
      data: result.district
    });

  } catch (error) {
    console.error('Update district error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật quận/huyện'
    });
  }
};

// XÓA MỘT HOẶC NHIỀU QUẬN/HUYỆN
exports.deleteDistricts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID cần xóa'
      });
    }

    const result = await districtService.deleteDistricts(ids);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã xóa ${result.deletedCount} quận/huyện thành công`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Delete districts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa quận/huyện'
    });
  }
};

// BẬT/TẮT TRẠNG THÁI NHIỀU QUẬN/HUYỆN
exports.toggleDistricts = async (req, res) => {
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

    const result = await districtService.toggleDistricts(ids, is_active);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã ${is_active ? 'kích hoạt' : 'vô hiệu hóa'} ${result.updatedCount} quận/huyện`,
      updatedCount: result.updatedCount
    });

  } catch (error) {
    console.error('Toggle districts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thay đổi trạng thái quận/huyện'
    });
  }
};