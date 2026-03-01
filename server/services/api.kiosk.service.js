// ==========================================
// services/api.kiosk.service.js (FIXED - N-1 RELATIONSHIP)
// ==========================================
const db = require("../models");
const Kiosk = db.kiosks;
const Op = db.Sequelize.Op;

/**
 * Helper function để format kiosk data
 */
const formatKioskData = (kiosk) => {
  const kioskData = kiosk.toJSON();
  
  // Format transaction_office với district, province
  if (kioskData.transaction_office) {
    const transactionOffice = kioskData.transaction_office;
    const district = transactionOffice?.district;
    const province = district?.province;
    
    kioskData.transaction_office = {
      id: transactionOffice.id,
      code: transactionOffice.code,
      name: transactionOffice.name,
      address: transactionOffice.address,
      latitude: transactionOffice.latitude || null,
      longitude: transactionOffice.longitude || null,
      district_id: district?.id || null,
      district_code: district?.code || null,
      district_name: district?.name || null,
      province_id: province?.id || null,
      province_code: province?.code || null,
      province_name: province?.name || null
    };
  }

  // Loại bỏ kiosk_services wrapper
  if (kioskData.services && Array.isArray(kioskData.services)) {
    kioskData.services = kioskData.services.map(service => {
      const serviceData = { ...service };
      delete serviceData.kiosk_services;
      return serviceData;
    });
  }

  // Loại bỏ kiosk_service_groups wrapper
  if (kioskData.service_groups && Array.isArray(kioskData.service_groups)) {
    kioskData.service_groups = kioskData.service_groups.map(group => {
      const groupData = { ...group };
      delete groupData.kiosk_service_groups;
      return groupData;
    });
  }
  
  return kioskData;
};

/**
 * Validate: Services và service_groups phải thuộc branch của transaction_office
 */
const validateServicesAgainstBranch = async (transactionOfficeId, serviceIds = [], serviceGroupIds = []) => {
  // Lấy branch của transaction_office
  const branch = await db.branches.findOne({
    where: { transaction_office_id: transactionOfficeId },
    include: [
      {
        model: db.services,
        as: 'services',
        attributes: ['id'],
        through: { attributes: [] },
        required: false
      },
      {
        model: db.serviceGroups,
        as: 'service_groups',
        attributes: ['id'],
        through: { attributes: [] },
        required: false
      }
    ]
  });

  if (!branch) {
    return {
      valid: false,
      message: 'Phòng giao dịch này chưa có chi nhánh được cấu hình'
    };
  }

  const branchServiceIds = branch.services.map(s => s.id);
  const branchServiceGroupIds = branch.service_groups.map(sg => sg.id);

  // Kiểm tra services
  if (serviceIds.length > 0) {
    const invalidServices = serviceIds.filter(id => !branchServiceIds.includes(id));
    if (invalidServices.length > 0) {
      return {
        valid: false,
        message: 'Một số dịch vụ không thuộc cấu hình của chi nhánh'
      };
    }
  }

  // Kiểm tra service_groups
  if (serviceGroupIds.length > 0) {
    const invalidGroups = serviceGroupIds.filter(id => !branchServiceGroupIds.includes(id));
    if (invalidGroups.length > 0) {
      return {
        valid: false,
        message: 'Một số nhóm dịch vụ không thuộc cấu hình của chi nhánh'
      };
    }
  }

  return { valid: true };
};

/**
 * Tìm kiếm kiosks với phân trang
 */
exports.searchKiosks = async (filters, pagination) => {
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
      is_active
    } = filters;

    const { page = 1, size = 20 } = pagination;

    const currentPage = parseInt(page);
    const pageSize = parseInt(size);
    const offset = (currentPage - 1) * pageSize;

    const where = {};

    // ================= KIOSK FILTER =================
    if (id) {
      where.id = id;
    }

    if (code) {
      where.code = { [Op.like]: `%${code}%` };
    }

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
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

    // 2. Services (N-N)
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

    // ================= COUNT =================
    const totalElements = await db.kiosks.count({
      where,
      distinct: true,
      col: 'id'
    });

    // ================= DATA =================
    const rows = await db.kiosks.findAll({
      where,
      limit: pageSize,
      offset,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['transaction_office_id'] },
      include: includes
    });

    // ================= FORMAT =================
    const formattedData = rows.map(kiosk => formatKioskData(kiosk));

    return {
      totalPage: Math.ceil(totalElements / pageSize),
      pageSize,
      currentPage,
      totalElements,
      data: formattedData
    };
  } catch (error) {
    console.error('Search kiosks error:', error);
    throw error;
  }
};

/**
 * Lấy thông tin kiosk theo ID
 */
exports.getKioskById = async (id) => {
  try {
    const kiosk = await Kiosk.findByPk(id, {
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
        }
      ]
    });

    if (!kiosk) {
      return {
        success: false,
        message: 'Không tìm thấy kiosk'
      };
    }

    return {
      success: true,
      kiosk: formatKioskData(kiosk)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Kiểm tra code đã tồn tại chưa
 */
exports.checkCodeExists = async (code, excludeId = null) => {
  const where = { code };
  
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  const existing = await Kiosk.findOne({ where });
  return !!existing;
};

/**
 * Thêm mới kiosk
 */
exports.createKiosk = async (data) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { 
      code,
      name,
      transaction_office_id,
      service_ids = [],
      service_group_ids = [],
      is_active
    } = data;

    // Kiểm tra code đã tồn tại
    if (await this.checkCodeExists(code)) {
      return {
        success: false,
        message: 'Mã kiosk đã tồn tại'
      };
    }

    // Kiểm tra transaction_office tồn tại
    const transactionOffice = await db.transactionOffices.findByPk(transaction_office_id);
    if (!transactionOffice) {
      return {
        success: false,
        message: 'Phòng giao dịch không tồn tại'
      };
    }

    // Validate: Services và service_groups phải thuộc branch
    const branchValidation = await validateServicesAgainstBranch(
      transaction_office_id, 
      service_ids, 
      service_group_ids
    );
    if (!branchValidation.valid) {
      return {
        success: false,
        message: branchValidation.message
      };
    }

    // Kiểm tra services có tồn tại không
    if (service_ids.length > 0) {
      const services = await db.services.findAll({
        where: { id: { [Op.in]: service_ids } }
      });

      if (services.length !== service_ids.length) {
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
        return {
          success: false,
          message: 'Một số nhóm dịch vụ không tồn tại'
        };
      }
    }

    // Tạo kiosk
    const kiosk = await Kiosk.create({
      code,
      name,
      transaction_office_id,
      is_active: is_active !== undefined ? is_active : true
    }, { transaction });

    // Thêm services (N-N)
    if (service_ids.length > 0) {
      const services = await db.services.findAll({
        where: { id: { [Op.in]: service_ids } }
      });
      await kiosk.addServices(services, { transaction });
    }

    // Thêm service_groups (N-N)
    if (service_group_ids.length > 0) {
      const serviceGroups = await db.serviceGroups.findAll({
        where: { id: { [Op.in]: service_group_ids } }
      });
      await kiosk.addService_groups(serviceGroups, { transaction });
    }

    await transaction.commit();

    const result = await this.getKioskById(kiosk.id);
    
    return {
      success: true,
      kiosk: result.kiosk
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Cập nhật kiosk
 */
exports.updateKiosk = async (id, data) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const kiosk = await Kiosk.findByPk(id);

    if (!kiosk) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy kiosk'
      };
    }

    const { code, name, transaction_office_id, is_active } = data;
    const updateData = {};

    // Validate và cập nhật code
    if (code !== undefined) {
      if (await this.checkCodeExists(code, id)) {
        return {
          success: false,
          message: 'Mã kiosk đã tồn tại'
        };
      }
      updateData.code = code;
    }

    // Cập nhật name
    if (name !== undefined) {
      updateData.name = name;
    }

    // Validate và cập nhật transaction_office_id
    if (transaction_office_id !== undefined) {
      const transactionOffice = await db.transactionOffices.findByPk(transaction_office_id);
      if (!transactionOffice) {
        return {
          success: false,
          message: 'Phòng giao dịch không tồn tại'
        };
      }

      updateData.transaction_office_id = transaction_office_id;
    }

    // Cập nhật is_active
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    await kiosk.update(updateData, { transaction });

    await transaction.commit();

    const result = await this.getKioskById(id);
    
    return {
      success: true,
      kiosk: result.kiosk
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều kiosks
 */
exports.deleteKiosks = async (ids) => {
  try {
    const deletedCount = await Kiosk.destroy({
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
 * Bật/tắt trạng thái nhiều kiosks
 */
exports.toggleKiosks = async (ids, is_active) => {
  try {
    const [updatedCount] = await Kiosk.update(
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
exports.getServiceConfig = async (kioskId) => {
  try {
    const kiosk = await Kiosk.findByPk(kioskId, {
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

    if (!kiosk) {
      return {
        success: false,
        message: 'Không tìm thấy kiosk'
      };
    }

    return {
      success: true,
      data: {
        services: kiosk.services || [],
        service_groups: kiosk.service_groups || []
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Set services và service_groups (replace toàn bộ)
 */
exports.setServiceConfig = async (kioskId, serviceIds = [], serviceGroupIds = []) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const kiosk = await Kiosk.findByPk(kioskId);
    if (!kiosk) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy kiosk'
      };
    }

    // Validate: Services và service_groups phải thuộc branch
    const branchValidation = await validateServicesAgainstBranch(
      kiosk.transaction_office_id, 
      serviceIds, 
      serviceGroupIds
    );
    if (!branchValidation.valid) {
      return {
        success: false,
        message: branchValidation.message
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
    await db.kioskServices.destroy({
      where: { kiosk_id: kioskId },
      transaction
    });

    // Xóa tất cả service_groups cũ
    await db.kioskServiceGroups.destroy({
      where: { kiosk_id: kioskId },
      transaction
    });

    // Thêm services mới
    if (serviceIds.length > 0) {
      const services = await db.services.findAll({
        where: { id: { [Op.in]: serviceIds } }
      });
      await kiosk.addServices(services, { transaction });
    }

    // Thêm service_groups mới
    if (serviceGroupIds.length > 0) {
      const serviceGroups = await db.serviceGroups.findAll({
        where: { id: { [Op.in]: serviceGroupIds } }
      });
      await kiosk.addService_groups(serviceGroups, { transaction });
    }

    await transaction.commit();

    const result = await this.getServiceConfig(kioskId);
    
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
exports.addServices = async (kioskId, serviceIds) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const kiosk = await Kiosk.findByPk(kioskId);
    if (!kiosk) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy kiosk'
      };
    }

    // Validate: Services phải thuộc branch
    const branchValidation = await validateServicesAgainstBranch(
      kiosk.transaction_office_id, 
      serviceIds, 
      []
    );
    if (!branchValidation.valid) {
      return {
        success: false,
        message: branchValidation.message
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

    await kiosk.addServices(services, { transaction });

    await transaction.commit();

    const result = await this.getServiceConfig(kioskId);
    
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
exports.removeServices = async (kioskId, serviceIds) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const kiosk = await Kiosk.findByPk(kioskId);
    if (!kiosk) {
      return {
        success: false,
        message: 'Không tìm thấy kiosk'
      };
    }

    const services = await db.services.findAll({
      where: { id: { [Op.in]: serviceIds } }
    });

    await kiosk.removeServices(services, { transaction });

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
exports.addServiceGroups = async (kioskId, serviceGroupIds) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const kiosk = await Kiosk.findByPk(kioskId);
    if (!kiosk) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy kiosk'
      };
    }

    // Validate: Service_groups phải thuộc branch
    const branchValidation = await validateServicesAgainstBranch(
      kiosk.transaction_office_id, 
      [], 
      serviceGroupIds
    );
    if (!branchValidation.valid) {
      return {
        success: false,
        message: branchValidation.message
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

    await kiosk.addService_groups(serviceGroups, { transaction });

    await transaction.commit();

    const result = await this.getServiceConfig(kioskId);
    
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
exports.removeServiceGroups = async (kioskId, serviceGroupIds) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const kiosk = await Kiosk.findByPk(kioskId);
    if (!kiosk) {
      return {
        success: false,
        message: 'Không tìm thấy kiosk'
      };
    }

    const serviceGroups = await db.serviceGroups.findAll({
      where: { id: { [Op.in]: serviceGroupIds } }
    });

    await kiosk.removeService_groups(serviceGroups, { transaction });

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
 * Xóa tất cả cấu hình
 */
exports.clearServiceConfig = async (kioskId) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const kiosk = await Kiosk.findByPk(kioskId);
    if (!kiosk) {
      return {
        success: false,
        message: 'Không tìm thấy kiosk'
      };
    }

    await db.kioskServices.destroy({
      where: { kiosk_id: kioskId },
      transaction
    });

    await db.kioskServiceGroups.destroy({
      where: { kiosk_id: kioskId },
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

/**
 * Lấy thông tin kiosk theo code
 */
exports.getKioskByCode = async (code) => {
  try {
    const kiosk = await Kiosk.findOne({
      where: { code },
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
        }
      ]
    });

    if (!kiosk) {
      return {
        success: false,
        message: 'Không tìm thấy kiosk'
      };
    }

    return {
      success: true,
      kiosk: formatKioskData(kiosk)
    };
  } catch (error) {
    throw error;
  }
};