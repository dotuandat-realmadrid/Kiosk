// server/controllers/api.service.controller.js
const serviceService = require('../services/api.service.service');

// TÌM KIẾM DỊCH VỤ
exports.searchServices = async (req, res) => {
  try {
    const { id, format_id, code, name_vi, is_active, page, size } = req.query;

    const result = await serviceService.searchServices(
      { id, format_id, code, name_vi, is_active },
      { page, size }
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Search services error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách dịch vụ'
    });
  }
};

// LẤY THÔNG TIN DỊCH VỤ THEO ID
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await serviceService.getServiceById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Lấy thông tin dịch vụ thành công',
      data: result.service
    });

  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin dịch vụ'
    });
  }
};

// LẤY DANH SÁCH DỊCH VỤ THEO ĐỊNH DẠNG VÉ
exports.getServicesByTicketFormat = async (req, res) => {
  try {
    const { formatId } = req.params;

    const result = await serviceService.getServicesByTicketFormat(formatId);

    res.json({
      success: true,
      message: 'Lấy danh sách dịch vụ theo định dạng vé thành công',
      data: result.services
    });

  } catch (error) {
    console.error('Get services by ticket format error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách dịch vụ theo định dạng vé'
    });
  }
};

// THÊM MỚI DỊCH VỤ
exports.createService = async (req, res) => {
  try {
    const { 
      format_id, 
      code, 
      name_vi, 
      name_en, 
      name_ja, 
      name_cn, 
      name_sp, 
      representative_image,
      is_active 
    } = req.body;

    if (!format_id || !code || !name_vi) {
      return res.status(400).json({
        success: false,
        message: 'Định dạng vé, mã và tên tiếng Việt là bắt buộc'
      });
    }

    const result = await serviceService.createService({
      format_id,
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
      message: 'Thêm dịch vụ thành công',
      data: result.service
    });

  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thêm dịch vụ'
    });
  }
};

// CẬP NHẬT DỊCH VỤ
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      format_id, 
      code, 
      name_vi, 
      name_en, 
      name_ja, 
      name_cn, 
      name_sp, 
      representative_image,
      is_active 
    } = req.body;

    const result = await serviceService.updateService(id, {
      format_id,
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
      message: 'Cập nhật dịch vụ thành công',
      data: result.service
    });

  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật dịch vụ'
    });
  }
};

// XÓA MỘT HOẶC NHIỀU DỊCH VỤ
exports.deleteServices = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID cần xóa'
      });
    }

    const result = await serviceService.deleteServices(ids);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã xóa ${result.deletedCount} dịch vụ thành công`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Delete services error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa dịch vụ'
    });
  }
};

// BẬT/TẮT TRẠNG THÁI NHIỀU DỊCH VỤ
exports.toggleServices = async (req, res) => {
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

    const result = await serviceService.toggleServices(ids, is_active);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã ${is_active ? 'kích hoạt' : 'vô hiệu hóa'} ${result.updatedCount} dịch vụ`,
      updatedCount: result.updatedCount
    });

  } catch (error) {
    console.error('Toggle services error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thay đổi trạng thái dịch vụ'
    });
  }
};