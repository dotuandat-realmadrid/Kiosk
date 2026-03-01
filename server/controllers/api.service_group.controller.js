// ==========================================
// server/controllers/api.service_group.controller.js (FIXED)
// ==========================================
const serviceGroupService = require('../services/api.service_group.service');

// TÌM KIẾM NHÓM DỊCH VỤ
exports.searchServiceGroups = async (req, res) => {
  try {
    const { id, code, name_vi, is_active, page, size } = req.query;

    const result = await serviceGroupService.searchServiceGroups(
      { id, code, name_vi, is_active },
      { page, size }
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Search service groups error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách nhóm dịch vụ'
    });
  }
};

// LẤY THÔNG TIN NHÓM DỊCH VỤ THEO ID
exports.getServiceGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await serviceGroupService.getServiceGroupById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Lấy thông tin nhóm dịch vụ thành công',
      data: result.serviceGroup
    });

  } catch (error) {
    console.error('Get service group error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin nhóm dịch vụ'
    });
  }
};

// LẤY DANH SÁCH TẤT CẢ NHÓM DỊCH VỤ ĐANG ACTIVE
exports.getAllActiveServiceGroups = async (req, res) => {
  try {
    const result = await serviceGroupService.getAllActiveServiceGroups();

    res.json({
      success: true,
      message: 'Lấy danh sách nhóm dịch vụ active thành công',
      data: result.serviceGroups
    });

  } catch (error) {
    console.error('Get all active service groups error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách nhóm dịch vụ active'
    });
  }
};

// THÊM MỚI NHÓM DỊCH VỤ
exports.createServiceGroup = async (req, res) => {
  try {
    const { 
      code, 
      name_vi, 
      name_en, 
      name_ja, 
      name_cn, 
      name_sp, 
      representative_image,
      is_active
    } = req.body;

    if (!code || !name_vi) {
      return res.status(400).json({
        success: false,
        message: 'Mã và tên tiếng Việt là bắt buộc'
      });
    }

    const result = await serviceGroupService.createServiceGroup({
      code,
      name_vi,
      name_en,
      name_ja,
      name_cn,
      name_sp,
      representative_image,
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
      message: 'Thêm nhóm dịch vụ thành công',
      data: result.serviceGroup
    });

  } catch (error) {
    console.error('Create service group error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thêm nhóm dịch vụ'
    });
  }
};

// CẬP NHẬT NHÓM DỊCH VỤ
exports.updateServiceGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      code, 
      name_vi, 
      name_en, 
      name_ja, 
      name_cn, 
      name_sp, 
      representative_image,
      is_active 
    } = req.body;

    const result = await serviceGroupService.updateServiceGroup(id, {
      code,
      name_vi,
      name_en,
      name_ja,
      name_cn,
      name_sp,
      representative_image,
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
      message: 'Cập nhật nhóm dịch vụ thành công',
      data: result.serviceGroup
    });

  } catch (error) {
    console.error('Update service group error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật nhóm dịch vụ'
    });
  }
};

// XÓA MỘT HOẶC NHIỀU NHÓM DỊCH VỤ
exports.deleteServiceGroups = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID cần xóa'
      });
    }

    const result = await serviceGroupService.deleteServiceGroups(ids);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã xóa ${result.deletedCount} nhóm dịch vụ thành công`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Delete service groups error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa nhóm dịch vụ'
    });
  }
};

// BẬT/TẮT TRẠNG THÁI NHIỀU NHÓM DỊCH VỤ
exports.toggleServiceGroups = async (req, res) => {
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

    const result = await serviceGroupService.toggleServiceGroups(ids, is_active);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã ${is_active ? 'kích hoạt' : 'vô hiệu hóa'} ${result.updatedCount} nhóm dịch vụ`,
      updatedCount: result.updatedCount
    });

  } catch (error) {
    console.error('Toggle service groups error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thay đổi trạng thái nhóm dịch vụ'
    });
  }
};