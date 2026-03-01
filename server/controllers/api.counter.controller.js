// ==========================================
// controllers/api.counter.controller.js (UPDATED)
// ==========================================
const counterService = require('../services/api.counter.service');

// TÌM KIẾM COUNTERS
exports.searchCounters = async (req, res) => {
  try {
    const { 
      id,
      code,
      name,
      counter_number,
      transaction_office_id, 
      district_id, 
      district_code,
      province_id, 
      province_code,
      is_active, 
      page, 
      size 
    } = req.query;

    const result = await counterService.searchCounters(
      { 
        id,
        code,
        name,
        counter_number,
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
    console.error('Search counters error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách quầy'
    });
  }
};

// LẤY THÔNG TIN COUNTER THEO ID
exports.getCounterById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await counterService.getCounterById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Lấy thông tin quầy thành công',
      data: result.counter
    });

  } catch (error) {
    console.error('Get counter error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin quầy'
    });
  }
};

// THÊM MỚI COUNTER
exports.createCounter = async (req, res) => {
  try {
    const { 
      code,
      name,
      counter_number,
      led_board_number,
      transaction_office_id,
      service_ids,
      priority_service_ids, // Mảng ID dịch vụ ưu tiên
      is_active
    } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Mã quầy là bắt buộc'
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tên quầy là bắt buộc'
      });
    }

    if (!counter_number) {
      return res.status(400).json({
        success: false,
        message: 'Số quầy là bắt buộc'
      });
    }

    if (!transaction_office_id) {
      return res.status(400).json({
        success: false,
        message: 'ID phòng giao dịch là bắt buộc'
      });
    }

    const result = await counterService.createCounter({
      code,
      name,
      counter_number,
      led_board_number,
      transaction_office_id,
      service_ids,
      priority_service_ids,
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
      message: 'Thêm quầy thành công',
      data: result.counter
    });

  } catch (error) {
    console.error('Create counter error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thêm quầy'
    });
  }
};

// CẬP NHẬT COUNTER
exports.updateCounter = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      code,
      name,
      counter_number,
      led_board_number,
      transaction_office_id,
      is_active
    } = req.body;

    const result = await counterService.updateCounter(id, {
      code,
      name,
      counter_number,
      led_board_number,
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
      message: 'Cập nhật quầy thành công',
      data: result.counter
    });

  } catch (error) {
    console.error('Update counter error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật quầy'
    });
  }
};

// XÓA MỘT HOẶC NHIỀU COUNTERS
exports.deleteCounters = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID cần xóa'
      });
    }

    const result = await counterService.deleteCounters(ids);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã xóa ${result.deletedCount} quầy thành công`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Delete counters error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa quầy'
    });
  }
};

// BẬT/TẮT TRẠNG THÁI NHIỀU COUNTERS
exports.toggleCounters = async (req, res) => {
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

    const result = await counterService.toggleCounters(ids, is_active);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã ${is_active ? 'kích hoạt' : 'vô hiệu hóa'} ${result.updatedCount} quầy`,
      updatedCount: result.updatedCount
    });

  } catch (error) {
    console.error('Toggle counters error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thay đổi trạng thái quầy'
    });
  }
};

// ==================== SERVICE CONFIG MANAGEMENT ====================

// LẤY CẤU HÌNH SERVICES
exports.getServiceConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await counterService.getServiceConfig(id);

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

// SET SERVICES (replace toàn bộ)
exports.setServiceConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_ids = [], priority_service_ids = [] } = req.body;

    const result = await counterService.setServiceConfig(id, service_ids, priority_service_ids);

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
    const { service_ids, priority_service_ids = [] } = req.body;

    if (!service_ids || !Array.isArray(service_ids) || service_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID dịch vụ'
      });
    }

    const result = await counterService.addServices(id, service_ids, priority_service_ids);

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

    const result = await counterService.removeServices(id, service_ids);

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

// XÓA TẤT CẢ CẤU HÌNH
exports.clearServiceConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await counterService.clearServiceConfig(id);

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

// CẬP NHẬT PRIORITY SERVICES
exports.updatePriorityServices = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority_service_ids } = req.body;

    if (!Array.isArray(priority_service_ids)) {
      return res.status(400).json({
        success: false,
        message: 'priority_service_ids phải là mảng'
      });
    }

    const result = await counterService.updatePriorityServices(id, priority_service_ids);

    if (!result.success) {
      const statusCode = result.notFound ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật dịch vụ ưu tiên thành công',
      data: result.counter
    });

  } catch (error) {
    console.error('Update priority services error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật dịch vụ ưu tiên'
    });
  }
};