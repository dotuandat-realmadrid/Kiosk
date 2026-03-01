// ==========================================
// server/controllers/api.service_group_mapping.controller.js (NEW)
// ==========================================
const serviceGroupMappingService = require('../services/api.service_group_mapping.service');

// LẤY DANH SÁCH DỊCH VỤ THUỘC NHÓM
exports.getServicesByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page, size } = req.query;

    const result = await serviceGroupMappingService.getServicesByGroup(
      groupId,
      { page, size }
    );

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Lấy danh sách dịch vụ thuộc nhóm thành công',
      ...result
    });

  } catch (error) {
    console.error('Get services by group error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách dịch vụ thuộc nhóm'
    });
  }
};

// LẤY DANH SÁCH NHÓM MÀ DỊCH VỤ THUỘC VỀ
exports.getGroupsByService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { page, size } = req.query;

    const result = await serviceGroupMappingService.getGroupsByService(
      serviceId,
      { page, size }
    );

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Lấy danh sách nhóm của dịch vụ thành công',
      ...result
    });

  } catch (error) {
    console.error('Get groups by service error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách nhóm của dịch vụ'
    });
  }
};

// TÌM KIẾM TẤT CẢ MAPPING
exports.searchMappings = async (req, res) => {
  try {
    const { service_id, service_group_id, page, size } = req.query;

    const result = await serviceGroupMappingService.searchMappings(
      { service_id, service_group_id },
      { page, size }
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Search mappings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tìm kiếm mapping'
    });
  }
};

// THÊM DỊCH VỤ VÀO NHÓM
exports.addServicesToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { service_ids } = req.body;

    if (!service_ids || !Array.isArray(service_ids) || service_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID dịch vụ'
      });
    }

    const result = await serviceGroupMappingService.addServicesToGroup(groupId, service_ids);

    if (!result.success) {
      const statusCode = result.notFound ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.message
      });
    }

    res.status(201).json({
      success: true,
      message: `Đã thêm ${result.addedCount} dịch vụ vào nhóm`,
      addedCount: result.addedCount,
      details: result.details
    });

  } catch (error) {
    console.error('Add services to group error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thêm dịch vụ vào nhóm'
    });
  }
};

// XÓA DỊCH VỤ KHỎI NHÓM
exports.removeServicesFromGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { service_ids } = req.body;

    if (!service_ids || !Array.isArray(service_ids) || service_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID dịch vụ'
      });
    }

    const result = await serviceGroupMappingService.removeServicesFromGroup(groupId, service_ids);

    if (!result.success) {
      const statusCode = result.notFound ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã xóa ${result.removedCount} dịch vụ khỏi nhóm`,
      removedCount: result.removedCount
    });

  } catch (error) {
    console.error('Remove services from group error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa dịch vụ khỏi nhóm'
    });
  }
};

// THÊM NHÓM CHO DỊCH VỤ
exports.addGroupsToService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { group_ids } = req.body;

    if (!group_ids || !Array.isArray(group_ids) || group_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID nhóm'
      });
    }

    const result = await serviceGroupMappingService.addGroupsToService(serviceId, group_ids);

    if (!result.success) {
      const statusCode = result.notFound ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.message
      });
    }

    res.status(201).json({
      success: true,
      message: `Đã thêm dịch vụ vào ${result.addedCount} nhóm`,
      addedCount: result.addedCount,
      details: result.details
    });

  } catch (error) {
    console.error('Add groups to service error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thêm nhóm cho dịch vụ'
    });
  }
};

// XÓA DỊCH VỤ KHỎI CÁC NHÓM
exports.removeGroupsFromService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { group_ids } = req.body;

    if (!group_ids || !Array.isArray(group_ids) || group_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID nhóm'
      });
    }

    const result = await serviceGroupMappingService.removeGroupsFromService(serviceId, group_ids);

    if (!result.success) {
      const statusCode = result.notFound ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã xóa dịch vụ khỏi ${result.removedCount} nhóm`,
      removedCount: result.removedCount
    });

  } catch (error) {
    console.error('Remove groups from service error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa nhóm khỏi dịch vụ'
    });
  }
};

// XÓA TẤT CẢ DỊCH VỤ KHỎI NHÓM
exports.removeAllServicesFromGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const result = await serviceGroupMappingService.removeAllServicesFromGroup(groupId);

    if (!result.success) {
      const statusCode = result.notFound ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã xóa tất cả ${result.removedCount} dịch vụ khỏi nhóm`,
      removedCount: result.removedCount
    });

  } catch (error) {
    console.error('Remove all services from group error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa tất cả dịch vụ khỏi nhóm'
    });
  }
};

// XÓA DỊCH VỤ KHỎI TẤT CẢ NHÓM
exports.removeServiceFromAllGroups = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const result = await serviceGroupMappingService.removeServiceFromAllGroups(serviceId);

    if (!result.success) {
      const statusCode = result.notFound ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã xóa dịch vụ khỏi tất cả ${result.removedCount} nhóm`,
      removedCount: result.removedCount
    });

  } catch (error) {
    console.error('Remove service from all groups error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa dịch vụ khỏi tất cả nhóm'
    });
  }
};