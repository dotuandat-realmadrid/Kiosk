// ==========================================
// server/services/api.service_group_mapping.service.js (NEW)
// ==========================================
const db = require("../models");
const Service = db.services;
const ServiceGroup = db.serviceGroups;
const ServiceGroupMapping = db.serviceGroupMappings;
const TicketFormat = db.ticketFormats;
const Op = db.Sequelize.Op;

/**
 * Lấy danh sách dịch vụ thuộc nhóm
 */
exports.getServicesByGroup = async (groupId, pagination = {}) => {
  try {
    const { page = 1, size = 20 } = pagination;
    const currentPage = parseInt(page);
    const pageSize = parseInt(size);
    const offset = (currentPage - 1) * pageSize;

    // Kiểm tra nhóm tồn tại
    const group = await ServiceGroup.findByPk(groupId);
    if (!group) {
      return {
        success: false,
        message: 'Không tìm thấy nhóm dịch vụ'
      };
    }

    const result = await Service.findAndCountAll({
      include: [{
        model: ServiceGroup,
        as: 'service_groups',
        where: { id: groupId },
        attributes: [],
        through: { attributes: [] }
      }],
      limit: pageSize,
      offset,
      distinct: true,
      order: [['name_vi', 'ASC']],
      attributes: ['id', 'code', 'name_vi', 'name_en', 'name_ja', 'name_cn', 'name_sp', 'representative_image', 'is_active', 'created_at']
    });

    return {
      success: true,
      totalPage: Math.ceil(result.count / pageSize),
      pageSize,
      currentPage,
      totalElements: result.count,
      data: result.rows
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách nhóm mà dịch vụ thuộc về
 */
exports.getGroupsByService = async (serviceId, pagination = {}) => {
  try {
    const { page = 1, size = 20 } = pagination;
    const currentPage = parseInt(page);
    const pageSize = parseInt(size);
    const offset = (currentPage - 1) * pageSize;

    // Kiểm tra dịch vụ tồn tại
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return {
        success: false,
        message: 'Không tìm thấy dịch vụ'
      };
    }

    const result = await ServiceGroup.findAndCountAll({
      include: [{
        model: Service,
        as: 'services',
        where: { id: serviceId },
        attributes: [],
        through: { attributes: [] }
      }],
      limit: pageSize,
      offset,
      distinct: true,
      order: [['name_vi', 'ASC']],
      attributes: ['id', 'code', 'name_vi', 'name_en', 'name_ja', 'name_cn', 'name_sp', 'representative_image', 'is_active', 'created_at']
    });

    return {
      success: true,
      totalPage: Math.ceil(result.count / pageSize),
      pageSize,
      currentPage,
      totalElements: result.count,
      data: result.rows
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Tìm kiếm tất cả mapping
 */
exports.searchMappings = async (filters, pagination) => {
  try {
    const { service_id, service_group_id } = filters;
    const { page = 1, size = 20 } = pagination;

    const currentPage = parseInt(page);
    const pageSize = parseInt(size);
    const offset = (currentPage - 1) * pageSize;
    
    const where = {};

    if (service_id) {
      where.service_id = service_id;
    }

    if (service_group_id) {
      where.service_group_id = service_group_id;
    }

    const result = await ServiceGroupMapping.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      distinct: true,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'code', 'name_vi', 'is_active']
        },
        {
          model: ServiceGroup,
          as: 'service_group',
          attributes: ['id', 'code', 'name_vi', 'is_active']
        }
      ]
    });

    return {
      totalPage: Math.ceil(result.count / pageSize),
      pageSize,
      currentPage,
      totalElements: result.count,
      data: result.rows
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Thêm dịch vụ vào nhóm
 */
exports.addServicesToGroup = async (groupId, serviceIds) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    // Kiểm tra nhóm tồn tại
    const group = await ServiceGroup.findByPk(groupId);
    if (!group) {
      await transaction.rollback();
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy nhóm dịch vụ'
      };
    }

    // Kiểm tra tất cả dịch vụ tồn tại
    const services = await Service.findAll({
      where: {
        id: { [Op.in]: serviceIds }
      }
    });

    if (services.length !== serviceIds.length) {
      await transaction.rollback();
      return {
        success: false,
        message: 'Một hoặc nhiều dịch vụ không tồn tại'
      };
    }

    // Lấy danh sách mapping đã tồn tại
    const existingMappings = await ServiceGroupMapping.findAll({
      where: {
        service_group_id: groupId,
        service_id: { [Op.in]: serviceIds }
      },
      attributes: ['service_id']
    });

    const existingServiceIds = existingMappings.map(m => m.service_id);
    const newServiceIds = serviceIds.filter(id => !existingServiceIds.includes(id));

    // Tạo mapping mới
    const mappingsToCreate = newServiceIds.map(serviceId => ({
      service_id: serviceId,
      service_group_id: groupId
    }));

    if (mappingsToCreate.length > 0) {
      await ServiceGroupMapping.bulkCreate(mappingsToCreate, { transaction });
    }

    await transaction.commit();

    return {
      success: true,
      addedCount: newServiceIds.length,
      details: {
        total: serviceIds.length,
        added: newServiceIds.length,
        skipped: existingServiceIds.length
      }
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Xóa dịch vụ khỏi nhóm
 */
exports.removeServicesFromGroup = async (groupId, serviceIds) => {
  try {
    // Kiểm tra nhóm tồn tại
    const group = await ServiceGroup.findByPk(groupId);
    if (!group) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy nhóm dịch vụ'
      };
    }

    const removedCount = await ServiceGroupMapping.destroy({
      where: {
        service_group_id: groupId,
        service_id: { [Op.in]: serviceIds }
      }
    });

    return {
      success: true,
      removedCount
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Thêm nhóm cho dịch vụ
 */
exports.addGroupsToService = async (serviceId, groupIds) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    // Kiểm tra dịch vụ tồn tại
    const service = await Service.findByPk(serviceId);
    if (!service) {
      await transaction.rollback();
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy dịch vụ'
      };
    }

    // Kiểm tra tất cả nhóm tồn tại
    const groups = await ServiceGroup.findAll({
      where: {
        id: { [Op.in]: groupIds }
      }
    });

    if (groups.length !== groupIds.length) {
      await transaction.rollback();
      return {
        success: false,
        message: 'Một hoặc nhiều nhóm dịch vụ không tồn tại'
      };
    }

    // Lấy danh sách mapping đã tồn tại
    const existingMappings = await ServiceGroupMapping.findAll({
      where: {
        service_id: serviceId,
        service_group_id: { [Op.in]: groupIds }
      },
      attributes: ['service_group_id']
    });

    const existingGroupIds = existingMappings.map(m => m.service_group_id);
    const newGroupIds = groupIds.filter(id => !existingGroupIds.includes(id));

    // Tạo mapping mới
    const mappingsToCreate = newGroupIds.map(groupId => ({
      service_id: serviceId,
      service_group_id: groupId
    }));

    if (mappingsToCreate.length > 0) {
      await ServiceGroupMapping.bulkCreate(mappingsToCreate, { transaction });
    }

    await transaction.commit();

    return {
      success: true,
      addedCount: newGroupIds.length,
      details: {
        total: groupIds.length,
        added: newGroupIds.length,
        skipped: existingGroupIds.length
      }
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Xóa dịch vụ khỏi các nhóm
 */
exports.removeGroupsFromService = async (serviceId, groupIds) => {
  try {
    // Kiểm tra dịch vụ tồn tại
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy dịch vụ'
      };
    }

    const removedCount = await ServiceGroupMapping.destroy({
      where: {
        service_id: serviceId,
        service_group_id: { [Op.in]: groupIds }
      }
    });

    return {
      success: true,
      removedCount
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa tất cả dịch vụ khỏi nhóm
 */
exports.removeAllServicesFromGroup = async (groupId) => {
  try {
    // Kiểm tra nhóm tồn tại
    const group = await ServiceGroup.findByPk(groupId);
    if (!group) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy nhóm dịch vụ'
      };
    }

    const removedCount = await ServiceGroupMapping.destroy({
      where: {
        service_group_id: groupId
      }
    });

    return {
      success: true,
      removedCount
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa dịch vụ khỏi tất cả nhóm
 */
exports.removeServiceFromAllGroups = async (serviceId) => {
  try {
    // Kiểm tra dịch vụ tồn tại
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy dịch vụ'
      };
    }

    const removedCount = await ServiceGroupMapping.destroy({
      where: {
        service_id: serviceId
      }
    });

    return {
      success: true,
      removedCount
    };
  } catch (error) {
    throw error;
  }
};