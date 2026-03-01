// ==========================================
// services/api.branch.service.js (UPDATED - BỎ VALIDATION SERVICE_GROUP)
// ==========================================
const db = require("../models");
const Branch = db.branches;
const BranchService = db.branchServices;
const BranchServiceGroup = db.branchServiceGroups;
const BranchQueueConfig = db.branchQueueConfigs;
const BranchReportConfig = db.branchReportConfigs;
const Op = db.Sequelize.Op;

/**
 * Helper function để format branch data
 */
const formatBranchData = (branch) => {
  const branchData = branch.toJSON();
  
  // Làm phẳng transaction_office với district và province
  if (branchData.transaction_office) {
    const district = branchData.transaction_office.district;
    const province = district?.province;
    
    branchData.transaction_office = {
      id: branchData.transaction_office.id,
      code: branchData.transaction_office.code,
      name: branchData.transaction_office.name,
      address: branchData.transaction_office.address,
      latitude: branchData.transaction_office.latitude || null,
      longitude: branchData.transaction_office.longitude || null,
      district_id: district?.id || null,
      district_code: district?.code || null,
      district_name: district?.name || null,
      province_id: province?.id || null,
      province_code: province?.code || null,
      province_name: province?.name || null
    };
  }
  
  // Loại bỏ branch_services wrapper nếu có services
  if (branchData.services && Array.isArray(branchData.services)) {
    branchData.services = branchData.services.map(service => {
      const serviceData = { ...service };
      delete serviceData.branch_services;
      return serviceData;
    });
  }

  // Loại bỏ branch_service_groups wrapper nếu có service_groups
  if (branchData.service_groups && Array.isArray(branchData.service_groups)) {
    branchData.service_groups = branchData.service_groups.map(group => {
      const groupData = { ...group };
      delete groupData.branch_service_groups;
      return groupData;
    });
  }
  
  // Loại bỏ created_at, updated_at, branch_id từ configs
  if (branchData.queue_config) {
    const { created_at, updated_at, branch_id, ...queueConfig } = branchData.queue_config;
    branchData.queue_config = queueConfig;
  }
  
  if (branchData.report_config) {
    const { created_at, updated_at, branch_id, ...reportConfig } = branchData.report_config;
    branchData.report_config = reportConfig;
  }
  
  return branchData;
};

/**
 * Tìm kiếm branches với phân trang
 */
exports.searchBranches = async (filters, pagination) => {
  try {
    const {
      id,
      transaction_office_id,
      district_id,
      district_code,
      province_id,
      province_code,
      is_active
    } = filters;

    const { page = 1, size = 20 } = pagination;

    const currentPage = parseInt(page);
    const pageSize = parseInt(size);
    const offset = (currentPage - 1) * pageSize;

    const where = {};

    // ================= BRANCH FILTER =================
    if (id) {
      where.id = id;
    }

    if (transaction_office_id) {
      where.transaction_office_id = transaction_office_id;
    }

    if (is_active !== undefined && is_active !== null && is_active !== '') {
      where.is_active = is_active === 'true' || is_active === true;
    }

    // ================= FILTER THEO DISTRICT/PROVINCE =================
    if (district_id || district_code || province_id || province_code) {
      const transactionOfficeQuery = {
        attributes: ['id'],
        include: []
      };

      const districtInclude = {
        model: db.districts,
        as: 'district',
        attributes: [],
        required: true
      };

      const districtWhere = {};
      
      if (district_id) {
        districtWhere.id = district_id;
      }
      
      if (district_code) {
        districtWhere.code = district_code;
      }

      if (province_id || province_code) {
        const provinceWhere = {};
        
        if (province_id) {
          provinceWhere.id = province_id;
        }
        
        if (province_code) {
          provinceWhere.code = province_code;
        }

        districtInclude.include = [{
          model: db.provinces,
          as: 'province',
          attributes: [],
          where: provinceWhere,
          required: true
        }];
      }

      if (Object.keys(districtWhere).length > 0) {
        districtInclude.where = districtWhere;
      }

      transactionOfficeQuery.include.push(districtInclude);

      const validTransactionOffices = await db.transactionOffices.findAll(transactionOfficeQuery);
      const validIds = validTransactionOffices.map(t => t.id);

      if (validIds.length === 0) {
        return {
          totalPage: 0,
          pageSize,
          currentPage,
          totalElements: 0,
          data: []
        };
      }

      where.transaction_office_id = { [Op.in]: validIds };
    }

    // ================= BUILD INCLUDE =================
    const includes = [];

    // 1. Transaction Office
    includes.push({
      model: db.transactionOffices,
      as: 'transaction_office',
      attributes: ['id', 'code', 'name', 'address', 'latitude', 'longitude'],
      required: false,
      include: [
        {
          model: db.districts,
          as: 'district',
          attributes: ['id', 'code', 'name'],
          required: false,
          include: [
            {
              model: db.provinces,
              as: 'province',
              attributes: ['id', 'code', 'name'],
              required: false
            }
          ]
        }
      ]
    });

    // 2. Individual Services (N-N)
    includes.push({
      model: db.services,
      as: 'services',
      attributes: ['id', 'code', 'format_id', 'name_vi', 'name_en', 'representative_image'],
      through: { attributes: [] },
      required: false
    });

    // 3. Service Groups (N-N)
    includes.push({
      model: db.serviceGroups,
      as: 'service_groups',
      attributes: ['id', 'code', 'name_vi', 'name_en', 'representative_image'],
      through: { attributes: [] },
      required: false,
      include: [
        {
          model: db.services,
          as: 'services',
          attributes: ['id', 'code', 'format_id', 'name_vi', 'name_en', 'representative_image'],
          through: { attributes: [] },
          required: false
        }
      ]
    });

    // 4. Queue Config
    includes.push({
      model: db.branchQueueConfigs,
      as: 'queue_config',
      attributes: ['id', 'waiting_alert_threshold', 'overdue_waiting_threshold', 'service_alert_threshold', 'overdue_service_threshold'],
      required: false
    });

    // 5. Report Config
    includes.push({
      model: db.branchReportConfigs,
      as: 'report_config',
      attributes: ['id', 'waiting_alert_threshold', 'overdue_waiting_threshold', 'service_alert_threshold', 'overdue_service_threshold'],
      required: false
    });

    // ================= COUNT =================
    const totalElements = await db.branches.count({
      where,
      distinct: true,
      col: 'id'
    });

    // ================= DATA =================
    const rows = await db.branches.findAll({
      where,
      limit: pageSize,
      offset,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['transaction_office_id'] },
      include: includes
    });

    // ================= FORMAT =================
    const formattedData = rows.map(branch => formatBranchData(branch));

    return {
      totalPage: Math.ceil(totalElements / pageSize),
      pageSize,
      currentPage,
      totalElements,
      data: formattedData
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

/**
 * Lấy thông tin branch theo ID
 */
exports.getBranchById = async (id) => {
  try {
    const branch = await Branch.findByPk(id, {
      attributes: { exclude: ['transaction_office_id'] },
      include: [
        {
          model: db.transactionOffices,
          as: 'transaction_office',
          attributes: ['id', 'code', 'name', 'address', 'latitude', 'longitude'],
          required: false,
          include: [
            {
              model: db.districts,
              as: 'district',
              attributes: ['id', 'code', 'name'],
              required: false,
              include: [
                {
                  model: db.provinces,
                  as: 'province',
                  attributes: ['id', 'code', 'name'],
                  required: false
                }
              ]
            }
          ]
        },
        {
          model: db.services,
          as: 'services',
          attributes: ['id', 'code', 'format_id', 'name_vi', 'name_en', 'representative_image'],
          through: { attributes: [] },
          required: false,
          include: [
            {
              model: db.ticketFormats,
              as: 'ticket_format',
              attributes: ['id', 'code', 'format_pattern'],
              required: false
            }
          ]
        },
        {
          model: db.serviceGroups,
          as: 'service_groups',
          attributes: ['id', 'code', 'name_vi', 'name_en', 'representative_image'],
          through: { attributes: [] },
          required: false,
          include: [
            {
              model: db.services,
              as: 'services',
              attributes: ['id', 'code', 'format_id', 'name_vi', 'name_en', 'representative_image'],
              through: { attributes: [] },
              required: false,
              include: [
                {
                  model: db.ticketFormats,
                  as: 'ticket_format',
                  attributes: ['id', 'code', 'format_pattern'],
                  required: false
                }
              ]
            }
          ]
        },
        {
          model: db.branchQueueConfigs,
          as: 'queue_config',
          attributes: ['id', 'waiting_alert_threshold', 'overdue_waiting_threshold', 'service_alert_threshold', 'overdue_service_threshold', 'created_at', 'updated_at'],
          required: false
        },
        {
          model: db.branchReportConfigs,
          as: 'report_config',
          attributes: ['id', 'waiting_alert_threshold', 'overdue_waiting_threshold', 'service_alert_threshold', 'overdue_service_threshold', 'created_at', 'updated_at'],
          required: false
        }
      ]
    });

    if (!branch) {
      return {
        success: false,
        message: 'Không tìm thấy chi nhánh'
      };
    }

    return {
      success: true,
      branch: formatBranchData(branch)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Kiểm tra transaction_office_id đã có branch chưa
 */
exports.checkTransactionOfficeHasBranch = async (transactionOfficeId, excludeId = null) => {
  const where = { transaction_office_id: transactionOfficeId };
  
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  const existing = await Branch.findOne({ where });
  return !!existing;
};

/**
 * Thêm mới branch
 */
exports.createBranch = async (data) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { 
      transaction_office_id,
      service_ids = [],
      service_group_ids = [],
      is_active,
      queue_config = {},
      report_config = {}
    } = data;

    // Kiểm tra transaction_office tồn tại
    const transactionOffice = await db.transactionOffices.findByPk(transaction_office_id);
    if (!transactionOffice) {
      return {
        success: false,
        message: 'Phòng giao dịch không tồn tại'
      };
    }

    // Kiểm tra transaction_office đã có branch chưa
    if (await this.checkTransactionOfficeHasBranch(transaction_office_id)) {
      return {
        success: false,
        message: 'Phòng giao dịch này đã có chi nhánh'
      };
    }

    // Kiểm tra services có tồn tại không
    if (service_ids.length > 0) {
      const services = await db.services.findAll({
        where: { id: { [Op.in]: service_ids } }
      });

      if (services.length !== service_ids.length) {
        await transaction.rollback();
        return {
          success: false,
          message: 'Một số dịch vụ không tồn tại'
        };
      }
    }

    // Kiểm tra service_groups có tồn tại không
    if (service_group_ids.length > 0) {
      const serviceGroups = await db.serviceGroups.findAll({
        where: { id: { [Op.in]: service_group_ids } }
      });

      if (serviceGroups.length !== service_group_ids.length) {
        await transaction.rollback();
        return {
          success: false,
          message: 'Một số nhóm dịch vụ không tồn tại'
        };
      }
    }

    // Tạo branch
    const branch = await Branch.create({
      transaction_office_id,
      is_active: is_active !== undefined ? is_active : true
    }, { transaction });

    // Thêm services (N-N)
    if (service_ids.length > 0) {
      const services = await db.services.findAll({
        where: { id: { [Op.in]: service_ids } }
      });
      await branch.addServices(services, { transaction });
    }

    // Thêm service_groups (N-N)
    if (service_group_ids.length > 0) {
      const serviceGroups = await db.serviceGroups.findAll({
        where: { id: { [Op.in]: service_group_ids } }
      });
      await branch.addService_groups(serviceGroups, { transaction });
    }

    // Tạo configs
    await this.createDefaultConfigs(branch.id, queue_config, report_config, transaction);

    await transaction.commit();

    const result = await this.getBranchById(branch.id);
    return {
      success: true,
      branch: result.branch
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Helper: Tạo default configs
 */
exports.createDefaultConfigs = async (branchId, queueConfig = {}, reportConfig = {}, transaction) => {
  await db.branchQueueConfigs.create({
    branch_id: branchId,
    waiting_alert_threshold: queueConfig.waiting_alert_threshold || 5,
    overdue_waiting_threshold: queueConfig.overdue_waiting_threshold || 10,
    service_alert_threshold: queueConfig.service_alert_threshold || 5,
    overdue_service_threshold: queueConfig.overdue_service_threshold || 10
  }, { transaction });

  await db.branchReportConfigs.create({
    branch_id: branchId,
    waiting_alert_threshold: reportConfig.waiting_alert_threshold || 5,
    overdue_waiting_threshold: reportConfig.overdue_waiting_threshold || 10,
    service_alert_threshold: reportConfig.service_alert_threshold || 5,
    overdue_service_threshold: reportConfig.overdue_service_threshold || 10
  }, { transaction });
};

/**
 * Cập nhật branch
 */
exports.updateBranch = async (id, data) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const branch = await Branch.findByPk(id);

    if (!branch) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy chi nhánh'
      };
    }

    const { transaction_office_id, is_active } = data;
    const updateData = {};

    if (transaction_office_id !== undefined) {
      const transactionOffice = await db.transactionOffices.findByPk(transaction_office_id);
      if (!transactionOffice) {
        return {
          success: false,
          message: 'Phòng giao dịch không tồn tại'
        };
      }

      if (await this.checkTransactionOfficeHasBranch(transaction_office_id, id)) {
        return {
          success: false,
          message: 'Phòng giao dịch này đã có chi nhánh khác'
        };
      }

      updateData.transaction_office_id = transaction_office_id;
    }

    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    await branch.update(updateData, { transaction });

    await transaction.commit();

    const result = await this.getBranchById(id);
    
    return {
      success: true,
      branch: result.branch
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều branches
 */
exports.deleteBranches = async (ids) => {
  try {
    const deletedCount = await Branch.destroy({
      where: {
        id: {
          [Op.in]: ids
        }
      }
    });

    return {
      success: true,
      deletedCount
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Bật/tắt trạng thái nhiều branches
 */
exports.toggleBranches = async (ids, is_active) => {
  try {
    const [updatedCount] = await Branch.update(
      { is_active },
      {
        where: {
          id: {
            [Op.in]: ids
          }
        }
      }
    );

    return {
      success: true,
      updatedCount
    };
  } catch (error) {
    throw error;
  }
};

// ==================== SERVICE CONFIG MANAGEMENT ====================

/**
 * Lấy cấu hình services và service_groups
 */
exports.getServiceConfig = async (branchId) => {
  try {
    const branch = await Branch.findByPk(branchId, {
      include: [
        {
          model: db.services,
          as: 'services',
          attributes: ['id', 'code', 'format_id', 'name_vi', 'name_en', 'representative_image'],
          through: { attributes: [] },
          required: false,
          include: [
            {
              model: db.ticketFormats,
              as: 'ticket_format',
              attributes: ['id', 'code', 'format_pattern'],
              required: false
            }
          ]
        },
        {
          model: db.serviceGroups,
          as: 'service_groups',
          attributes: ['id', 'code', 'name_vi', 'name_en', 'representative_image'],
          through: { attributes: [] },
          required: false,
          include: [
            {
              model: db.services,
              as: 'services',
              attributes: ['id', 'code', 'format_id', 'name_vi', 'name_en', 'representative_image'],
              through: { attributes: [] },
              required: false,
              include: [
                {
                  model: db.ticketFormats,
                  as: 'ticket_format',
                  attributes: ['id', 'code', 'format_pattern'],
                  required: false
                }
              ]
            }
          ]
        }
      ]
    });

    if (!branch) {
      return {
        success: false,
        message: 'Không tìm thấy chi nhánh'
      };
    }

    return {
      success: true,
      data: {
        services: branch.services || [],
        service_groups: branch.service_groups || []
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Set services và service_groups (replace toàn bộ)
 */
exports.setServiceConfig = async (branchId, serviceIds = [], serviceGroupIds = []) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy chi nhánh'
      };
    }

    // Kiểm tra services có tồn tại không
    if (serviceIds.length > 0) {
      const services = await db.services.findAll({
        where: { id: { [Op.in]: serviceIds } }
      });

      if (services.length !== serviceIds.length) {
        return {
          success: false,
          message: 'Một số dịch vụ không tồn tại'
        };
      }
    }

    // Kiểm tra service_groups có tồn tại không
    if (serviceGroupIds.length > 0) {
      const serviceGroups = await db.serviceGroups.findAll({
        where: { id: { [Op.in]: serviceGroupIds } }
      });

      if (serviceGroups.length !== serviceGroupIds.length) {
        return {
          success: false,
          message: 'Một số nhóm dịch vụ không tồn tại'
        };
      }
    }

    // Xóa tất cả services cũ
    await db.branchServices.destroy({
      where: { branch_id: branchId },
      transaction
    });

    // Xóa tất cả service_groups cũ
    await db.branchServiceGroups.destroy({
      where: { branch_id: branchId },
      transaction
    });

    // Thêm services mới
    if (serviceIds.length > 0) {
      const services = await db.services.findAll({
        where: { id: { [Op.in]: serviceIds } }
      });
      await branch.addServices(services, { transaction });
    }

    // Thêm service_groups mới
    if (serviceGroupIds.length > 0) {
      const serviceGroups = await db.serviceGroups.findAll({
        where: { id: { [Op.in]: serviceGroupIds } }
      });
      await branch.addService_groups(serviceGroups, { transaction });
    }

    await transaction.commit();

    const result = await this.getServiceConfig(branchId);
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Thêm services (không xóa cũ)
 */
exports.addServices = async (branchId, serviceIds) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy chi nhánh'
      };
    }

    const services = await db.services.findAll({
      where: { id: { [Op.in]: serviceIds } }
    });

    if (services.length !== serviceIds.length) {
      return {
        success: false,
        message: 'Một số dịch vụ không tồn tại'
      };
    }

    await branch.addServices(services, { transaction });

    await transaction.commit();

    const result = await this.getServiceConfig(branchId);
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Xóa services
 */
exports.removeServices = async (branchId, serviceIds) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return {
        success: false,
        message: 'Không tìm thấy chi nhánh'
      };
    }

    const services = await db.services.findAll({
      where: { id: { [Op.in]: serviceIds } }
    });

    await branch.removeServices(services, { transaction });

    await transaction.commit();

    return {
      success: true
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Thêm service_groups (không xóa cũ)
 */
exports.addServiceGroups = async (branchId, serviceGroupIds) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy chi nhánh'
      };
    }

    const serviceGroups = await db.serviceGroups.findAll({
      where: { id: { [Op.in]: serviceGroupIds } }
    });

    if (serviceGroups.length !== serviceGroupIds.length) {
      return {
        success: false,
        message: 'Một số nhóm dịch vụ không tồn tại'
      };
    }

    await branch.addService_groups(serviceGroups, { transaction });

    await transaction.commit();

    const result = await this.getServiceConfig(branchId);
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Xóa service_groups
 */
exports.removeServiceGroups = async (branchId, serviceGroupIds) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return {
        success: false,
        message: 'Không tìm thấy chi nhánh'
      };
    }

    const serviceGroups = await db.serviceGroups.findAll({
      where: { id: { [Op.in]: serviceGroupIds } }
    });

    await branch.removeService_groups(serviceGroups, { transaction });

    await transaction.commit();

    return {
      success: true
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Xóa tất cả cấu hình services và service_groups
 */
exports.clearServiceConfig = async (branchId) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return {
        success: false,
        message: 'Không tìm thấy chi nhánh'
      };
    }

    await db.branchServices.destroy({
      where: { branch_id: branchId },
      transaction
    });

    await db.branchServiceGroups.destroy({
      where: { branch_id: branchId },
      transaction
    });

    await transaction.commit();

    return {
      success: true,
      data: {
        services: [],
        service_groups: []
      }
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ==================== CONFIG METHODS (giữ nguyên) ====================

exports.getQueueConfig = async (branchId) => {
  try {
    const branch = await Branch.findByPk(branchId, {
      include: [
        {
          model: db.branchQueueConfigs,
          as: 'queue_config',
          attributes: { exclude: ['branch_id'] },
          required: false
        }
      ]
    });

    if (!branch) {
      return {
        success: false,
        message: 'Không tìm thấy chi nhánh'
      };
    }

    return {
      success: true,
      config: branch.queue_config
    };
  } catch (error) {
    throw error;
  }
};

exports.updateQueueConfig = async (branchId, configData) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy chi nhánh'
      };
    }

    let queueConfig = await db.branchQueueConfigs.findOne({
      where: { branch_id: branchId }
    });

    const updateData = {};
    if (configData.waiting_alert_threshold !== undefined) {
      if (configData.waiting_alert_threshold < 1) {
        return {
          success: false,
          message: 'Cảnh báo đợi lâu phải >= 1 phút'
        };
      }
      updateData.waiting_alert_threshold = configData.waiting_alert_threshold;
    }
    if (configData.overdue_waiting_threshold !== undefined) {
      if (configData.overdue_waiting_threshold < 1) {
        return {
          success: false,
          message: 'Lỗi đợi quá lâu phải >= 1 phút'
        };
      }
      updateData.overdue_waiting_threshold = configData.overdue_waiting_threshold;
    }
    if (configData.service_alert_threshold !== undefined) {
      if (configData.service_alert_threshold < 1) {
        return {
          success: false,
          message: 'Cảnh báo phục vụ lâu phải >= 1 phút'
        };
      }
      updateData.service_alert_threshold = configData.service_alert_threshold;
    }
    if (configData.overdue_service_threshold !== undefined) {
      if (configData.overdue_service_threshold < 1) {
        return {
          success: false,
          message: 'Lỗi phục vụ quá lâu phải >= 1 phút'
        };
      }
      updateData.overdue_service_threshold = configData.overdue_service_threshold;
    }

    if (queueConfig) {
      await queueConfig.update(updateData, { transaction });
    } else {
      queueConfig = await db.branchQueueConfigs.create({
        branch_id: branchId,
        ...updateData
      }, { transaction });
    }

    await transaction.commit();

    return {
      success: true,
      config: queueConfig
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.getReportConfig = async (branchId) => {
  try {
    const branch = await Branch.findByPk(branchId, {
      include: [
        {
          model: db.branchReportConfigs,
          as: 'report_config',
          attributes: { exclude: ['branch_id'] },
          required: false
        }
      ]
    });

    if (!branch) {
      return {
        success: false,
        message: 'Không tìm thấy chi nhánh'
      };
    }

    return {
      success: true,
      config: branch.report_config
    };
  } catch (error) {
    throw error;
  }
};

exports.updateReportConfig = async (branchId, configData) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy chi nhánh'
      };
    }

    let reportConfig = await db.branchReportConfigs.findOne({
      where: { branch_id: branchId }
    });

    const updateData = {};
    if (configData.waiting_alert_threshold !== undefined) {
      if (configData.waiting_alert_threshold < 1) {
        return {
          success: false,
          message: 'Cảnh báo đợi lâu phải >= 1 phút'
        };
      }
      updateData.waiting_alert_threshold = configData.waiting_alert_threshold;
    }
    if (configData.overdue_waiting_threshold !== undefined) {
      if (configData.overdue_waiting_threshold < 1) {
        return {
          success: false,
          message: 'Lỗi đợi quá lâu phải >= 1 phút'
        };
      }
      updateData.overdue_waiting_threshold = configData.overdue_waiting_threshold;
    }
    if (configData.service_alert_threshold !== undefined) {
      if (configData.service_alert_threshold < 1) {
        return {
          success: false,
          message: 'Cảnh báo phục vụ lâu phải >= 1 phút'
        };
      }
      updateData.service_alert_threshold = configData.service_alert_threshold;
    }
    if (configData.overdue_service_threshold !== undefined) {
      if (configData.overdue_service_threshold < 1) {
        return {
          success: false,
          message: 'Lỗi phục vụ quá lâu phải >= 1 phút'
        };
      }
      updateData.overdue_service_threshold = configData.overdue_service_threshold;
    }

    if (reportConfig) {
      await reportConfig.update(updateData, { transaction });
    } else {
      reportConfig = await db.branchReportConfigs.create({
        branch_id: branchId,
        ...updateData
      }, { transaction });
    }

    await transaction.commit();

    return {
      success: true,
      config: reportConfig
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};