// ==========================================
// controllers/api.kiosk.controller.js (UPDATED - THEO MODEL MỚI)
// ==========================================
const kioskService = require('../services/api.kiosk.service');

// TÌM KIẾM KIOSKS
exports.searchKiosks = async (req, res) => {
  try {
    const { 
      id,
      code,
      name,
      transaction_office_id, 
      district_id, 
      district_code,
      province_id, 
      province_code,
      is_active, 
      page, 
      size 
    } = req.query;

    const result = await kioskService.searchKiosks(
      { 
        id,
        code,
        name,
        transaction_office_id, 
        district_id, 
        district_code,
        province_id, 
        province_code,
        is_active 
      },
      { page, size }
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Search kiosks error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách kiosk'
    });
  }
};

// LẤY THÔNG TIN KIOSK THEO ID
exports.getKioskById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await kioskService.getKioskById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Lấy thông tin kiosk thành công',
      data: result.kiosk
    });

  } catch (error) {
    console.error('Get kiosk error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin kiosk'
    });
  }
};

// THÊM MỚI KIOSK
exports.createKiosk = async (req, res) => {
  try {
    const { 
      code,
      name,
      transaction_office_id,
      service_ids,
      service_group_ids,
      is_active
    } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Mã kiosk là bắt buộc'
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tên kiosk là bắt buộc'
      });
    }

    if (!transaction_office_id) {
      return res.status(400).json({
        success: false,
        message: 'ID phòng giao dịch là bắt buộc'
      });
    }

    const result = await kioskService.createKiosk({
      code,
      name,
      transaction_office_id,
      service_ids,
      service_group_ids,
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
      message: 'Thêm kiosk thành công',
      data: result.kiosk
    });

  } catch (error) {
    console.error('Create kiosk error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thêm kiosk'
    });
  }
};

// CẬP NHẬT KIOSK
exports.updateKiosk = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      code,
      name,
      transaction_office_id,
      is_active
    } = req.body;

    const result = await kioskService.updateKiosk(id, {
      code,
      name,
      transaction_office_id,
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
      message: 'Cập nhật kiosk thành công',
      data: result.kiosk
    });

  } catch (error) {
    console.error('Update kiosk error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật kiosk'
    });
  }
};

// XÓA MỘT HOẶC NHIỀU KIOSKS
exports.deleteKiosks = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID cần xóa'
      });
    }

    const result = await kioskService.deleteKiosks(ids);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã xóa ${result.deletedCount} kiosk thành công`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Delete kiosks error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa kiosk'
    });
  }
};

// BẬT/TẮT TRẠNG THÁI NHIỀU KIOSKS
exports.toggleKiosks = async (req, res) => {
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

    const result = await kioskService.toggleKiosks(ids, is_active);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã ${is_active ? 'kích hoạt' : 'vô hiệu hóa'} ${result.updatedCount} kiosk`,
      updatedCount: result.updatedCount
    });

  } catch (error) {
    console.error('Toggle kiosks error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thay đổi trạng thái kiosk'
    });
  }
};

// ==================== SERVICE CONFIG MANAGEMENT ====================

// LẤY CẤU HÌNH SERVICES VÀ SERVICE_GROUPS
exports.getServiceConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await kioskService.getServiceConfig(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Lấy cấu hình dịch vụ thành công',
      data: result.data
    });

  } catch (error) {
    console.error('Get service config error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy cấu hình dịch vụ'
    });
  }
};

// SET SERVICES VÀ SERVICE_GROUPS (replace toàn bộ)
exports.setServiceConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_ids = [], service_group_ids = [] } = req.body;

    const result = await kioskService.setServiceConfig(id, service_ids, service_group_ids);

    if (!result.success) {
      const statusCode = result.notFound ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Cấu hình dịch vụ thành công',
      data: result.data
    });

  } catch (error) {
    console.error('Set service config error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cấu hình dịch vụ'
    });
  }
};

// THÊM SERVICES
exports.addServices = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_ids } = req.body;

    if (!service_ids || !Array.isArray(service_ids) || service_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID dịch vụ'
      });
    }

    const result = await kioskService.addServices(id, service_ids);

    if (!result.success) {
      const statusCode = result.notFound ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Thêm dịch vụ thành công',
      data: result.data
    });

  } catch (error) {
    console.error('Add services error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thêm dịch vụ'
    });
  }
};

// XÓA SERVICES
exports.removeServices = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_ids } = req.body;

    if (!service_ids || !Array.isArray(service_ids) || service_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID dịch vụ'
      });
    }

    const result = await kioskService.removeServices(id, service_ids);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Xóa dịch vụ thành công'
    });

  } catch (error) {
    console.error('Remove services error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa dịch vụ'
    });
  }
};

// THÊM SERVICE_GROUPS
exports.addServiceGroups = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_group_ids } = req.body;

    if (!service_group_ids || !Array.isArray(service_group_ids) || service_group_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID nhóm dịch vụ'
      });
    }

    const result = await kioskService.addServiceGroups(id, service_group_ids);

    if (!result.success) {
      const statusCode = result.notFound ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Thêm nhóm dịch vụ thành công',
      data: result.data
    });

  } catch (error) {
    console.error('Add service groups error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thêm nhóm dịch vụ'
    });
  }
};

// XÓA SERVICE_GROUPS
exports.removeServiceGroups = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_group_ids } = req.body;

    if (!service_group_ids || !Array.isArray(service_group_ids) || service_group_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID nhóm dịch vụ'
      });
    }

    const result = await kioskService.removeServiceGroups(id, service_group_ids);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Xóa nhóm dịch vụ thành công'
    });

  } catch (error) {
    console.error('Remove service groups error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa nhóm dịch vụ'
    });
  }
};

// XÓA TẤT CẢ CẤU HÌNH
exports.clearServiceConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await kioskService.clearServiceConfig(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa cấu hình dịch vụ',
      data: result.data
    });

  } catch (error) {
    console.error('Clear service config error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa cấu hình dịch vụ'
    });
  }
};

// LẤY THÔNG TIN KIOSK THEO CODE
exports.getKioskByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const result = await kioskService.getKioskByCode(code);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Lấy thông tin kiosk thành công',
      data: result.kiosk
    });

  } catch (error) {
    console.error('Get kiosk by code error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin kiosk'
    });
  }
};