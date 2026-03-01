// ==========================================
// controllers/api.branch.controller.js (UPDATED - THEO MODEL MỚI)
// ==========================================
const branchService = require('../services/api.branch.service');

// TÌM KIẾM BRANCHES
exports.searchBranches = async (req, res) => {
  try {
    const { 
      id, 
      transaction_office_id, 
      district_id, 
      district_code,
      province_id, 
      province_code,
      is_active,
      page, 
      size 
    } = req.query;

    const result = await branchService.searchBranches(
      { 
        id, 
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
    console.error('Search branches error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách chi nhánh'
    });
  }
};

// LẤY THÔNG TIN BRANCH THEO ID
exports.getBranchById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await branchService.getBranchById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Lấy thông tin chi nhánh thành công',
      data: result.branch
    });

  } catch (error) {
    console.error('Get branch error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin chi nhánh'
    });
  }
};

// THÊM MỚI BRANCH
exports.createBranch = async (req, res) => {
  try {
    const { 
      transaction_office_id,
      service_ids,
      service_group_ids,
      is_active,
      queue_config,
      report_config
    } = req.body;

    if (!transaction_office_id) {
      return res.status(400).json({
        success: false,
        message: 'ID phòng giao dịch là bắt buộc'
      });
    }

    const result = await branchService.createBranch({
      transaction_office_id,
      service_ids,
      service_group_ids,
      is_active,
      queue_config,
      report_config
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thêm chi nhánh thành công',
      data: result.branch
    });

  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thêm chi nhánh'
    });
  }
};

// CẬP NHẬT BRANCH
exports.updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      transaction_office_id,
      is_active
    } = req.body;

    const result = await branchService.updateBranch(id, {
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
      message: 'Cập nhật chi nhánh thành công',
      data: result.branch
    });

  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật chi nhánh'
    });
  }
};

// XÓA MỘT HOẶC NHIỀU BRANCHES
exports.deleteBranches = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID cần xóa'
      });
    }

    const result = await branchService.deleteBranches(ids);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã xóa ${result.deletedCount} chi nhánh thành công`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Delete branches error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa chi nhánh'
    });
  }
};

// BẬT/TẮT TRẠNG THÁI NHIỀU BRANCHES
exports.toggleBranches = async (req, res) => {
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

    const result = await branchService.toggleBranches(ids, is_active);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã ${is_active ? 'kích hoạt' : 'vô hiệu hóa'} ${result.updatedCount} chi nhánh`,
      updatedCount: result.updatedCount
    });

  } catch (error) {
    console.error('Toggle branches error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thay đổi trạng thái chi nhánh'
    });
  }
};

// ==================== SERVICE CONFIG MANAGEMENT ====================

// LẤY CẤU HÌNH SERVICES VÀ SERVICE_GROUPS
exports.getServiceConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await branchService.getServiceConfig(id);

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

    const result = await branchService.setServiceConfig(id, service_ids, service_group_ids);

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

    const result = await branchService.addServices(id, service_ids);

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

    const result = await branchService.removeServices(id, service_ids);

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

    const result = await branchService.addServiceGroups(id, service_group_ids);

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

    const result = await branchService.removeServiceGroups(id, service_group_ids);

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

    const result = await branchService.clearServiceConfig(id);

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

// ==================== CONFIG ====================

exports.getQueueConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await branchService.getQueueConfig(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Lấy cấu hình quầy thành công',
      data: result.config
    });

  } catch (error) {
    console.error('Get queue config error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy cấu hình quầy'
    });
  }
};

exports.updateQueueConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const configData = req.body;

    const result = await branchService.updateQueueConfig(id, configData);

    if (!result.success) {
      const statusCode = result.notFound ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật cấu hình quầy thành công',
      data: result.config
    });

  } catch (error) {
    console.error('Update queue config error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật cấu hình quầy'
    });
  }
};

exports.getReportConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await branchService.getReportConfig(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Lấy cấu hình báo cáo thành công',
      data: result.config
    });

  } catch (error) {
    console.error('Get report config error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy cấu hình báo cáo'
    });
  }
};

exports.updateReportConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const configData = req.body;

    const result = await branchService.updateReportConfig(id, configData);

    if (!result.success) {
      const statusCode = result.notFound ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật cấu hình báo cáo thành công',
      data: result.config
    });

  } catch (error) {
    console.error('Update report config error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật cấu hình báo cáo'
    });
  }
};