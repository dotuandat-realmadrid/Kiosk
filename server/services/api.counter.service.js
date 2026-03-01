// ==========================================
// services/api.counter.service.js (FIXED - N-1 RELATIONSHIP)
// ==========================================
const db = require("../models");
const Counter = db.counters;
const Service = db.services;
const Op = db.Sequelize.Op;

/**
 * Helper function để format counter data
 */
const formatCounterData = (counter) => {
  const counterData = counter.toJSON();
  
  // Format transaction_office với district, province
  if (counterData.transaction_office) {
    const transactionOffice = counterData.transaction_office;
    const district = transactionOffice?.district;
    const province = district?.province;
    
    counterData.transaction_office = {
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

  // Format services và tách priority services
  if (counterData.services && Array.isArray(counterData.services)) {
    counterData.services = counterData.services.map(service => {
      const serviceData = { ...service };
      const isPriority = service.counter_services?.is_priority || false;
      
      delete serviceData.counter_services;
      
      return {
        ...serviceData,
        is_priority: isPriority
      };
    });
    
    // Tách ra danh sách priority services
    counterData.priority_services = counterData.services.filter(s => s.is_priority);
  }

  return counterData;
};

/**
 * Validate: Services phải thuộc branch của transaction_office
 */
const validateServicesAgainstBranch = async (transactionOfficeId, serviceIds = []) => {
  if (!serviceIds || serviceIds.length === 0) {
    return { valid: true };
  }

  const branch = await db.branches.findOne({
    where: { transaction_office_id: transactionOfficeId },
    include: [
      {
        model: db.services,
        as: 'services',
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
  const invalidServices = serviceIds.filter(id => !branchServiceIds.includes(id));
  
  if (invalidServices.length > 0) {
    return {
      valid: false,
      message: 'Một số dịch vụ không thuộc cấu hình của chi nhánh'
    };
  }

  return { valid: true };
};

/**
 * Tìm kiếm counters với phân trang
 */
exports.searchCounters = async (filters, pagination) => {
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
      is_active
    } = filters;

    const { page = 1, size = 20 } = pagination;

    const currentPage = parseInt(page);
    const pageSize = parseInt(size);
    const offset = (currentPage - 1) * pageSize;

    const where = {};

    // ================= COUNTER FILTER =================
    if (id) {
      where.id = id;
    }

    if (code) {
      where.code = { [Op.like]: `%${code}%` };
    }

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }

    if (counter_number) {
      where.counter_number = counter_number;
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

    // 2. Services (N-N) với is_priority
    includes.push({
      model: db.services,
      as: 'services',
      attributes: ['id', 'code', 'format_id', 'name_vi', 'name_en', 'representative_image'],
      through: { attributes: ['is_priority', 'is_active'] },
      required: false
    });

    // ================= COUNT =================
    const totalElements = await db.counters.count({
      where,
      distinct: true,
      col: 'id'
    });

    // ================= DATA =================
    const rows = await db.counters.findAll({
      where,
      limit: pageSize,
      offset,
      order: [['counter_number', 'ASC'], ['created_at', 'DESC']],
      attributes: { exclude: ['transaction_office_id'] },
      include: includes
    });

    // ================= FORMAT =================
    const formattedData = rows.map(counter => formatCounterData(counter));

    return {
      totalPage: Math.ceil(totalElements / pageSize),
      pageSize,
      currentPage,
      totalElements,
      data: formattedData
    };
  } catch (error) {
    console.error('Search counters error:', error);
    throw error;
  }
};

/**
 * Lấy thông tin counter theo ID
 */
exports.getCounterById = async (id) => {
  try {
    const counter = await Counter.findByPk(id, {
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
          through: { attributes: ['is_priority', 'is_active'] },
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
    });

    if (!counter) {
      return {
        success: false,
        message: 'Không tìm thấy quầy'
      };
    }

    return {
      success: true,
      counter: formatCounterData(counter)
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

  const existing = await Counter.findOne({ where });
  return !!existing;
};

/**
 * Thêm mới counter
 */
exports.createCounter = async (data) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { 
      code,
      name,
      counter_number,
      led_board_number,
      transaction_office_id,
      service_ids = [],
      priority_service_ids = [],
      is_active
    } = data;

    // Kiểm tra code đã tồn tại
    if (await this.checkCodeExists(code)) {
      return {
        success: false,
        message: 'Mã quầy đã tồn tại'
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

    // Validate: Services phải thuộc branch
    const branchValidation = await validateServicesAgainstBranch(
      transaction_office_id, 
      service_ids
    );
    if (!branchValidation.valid) {
      return {
        success: false,
        message: branchValidation.message
      };
    }

    // Kiểm tra priority_service_ids phải nằm trong service_ids
    const invalidPriorityIds = priority_service_ids.filter(
      id => !service_ids.includes(id)
    );
    if (invalidPriorityIds.length > 0) {
      return {
        success: false,
        message: 'Dịch vụ ưu tiên phải thuộc danh sách dịch vụ của quầy'
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

    // Tạo counter
    const counter = await Counter.create({
      code,
      name,
      counter_number,
      led_board_number,
      transaction_office_id,
      is_active: is_active !== undefined ? is_active : true
    }, { transaction });

    // Thêm services với is_priority flag
    if (service_ids.length > 0) {
      for (const serviceId of service_ids) {
        const isPriority = priority_service_ids.includes(serviceId);
        
        await db.counterServices.create({
          counter_id: counter.id,
          service_id: serviceId,
          is_priority: isPriority,
          is_active: true
        }, { transaction });
      }
    }

    await transaction.commit();

    const result = await this.getCounterById(counter.id);
    
    return {
      success: true,
      counter: result.counter
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Cập nhật counter
 */
exports.updateCounter = async (id, data) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const counter = await Counter.findByPk(id);

    if (!counter) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy quầy'
      };
    }

    const { code, name, counter_number, led_board_number, transaction_office_id, is_active } = data;
    const updateData = {};

    // Validate và cập nhật code
    if (code !== undefined) {
      if (await this.checkCodeExists(code, id)) {
        return {
          success: false,
          message: 'Mã quầy đã tồn tại'
        };
      }
      updateData.code = code;
    }

    // Cập nhật name
    if (name !== undefined) {
      updateData.name = name;
    }

    // Cập nhật counter_number
    if (counter_number !== undefined) {
      updateData.counter_number = counter_number;
    }

    // Cập nhật led_board_number
    if (led_board_number !== undefined) {
      updateData.led_board_number = led_board_number;
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

    await counter.update(updateData, { transaction });

    await transaction.commit();

    const result = await this.getCounterById(id);
    
    return {
      success: true,
      counter: result.counter
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều counters
 */
exports.deleteCounters = async (ids) => {
  try {
    const deletedCount = await Counter.destroy({
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
 * Bật/tắt trạng thái nhiều counters
 */
exports.toggleCounters = async (ids, is_active) => {
  try {
    const [updatedCount] = await Counter.update(
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
 * Lấy cấu hình services
 */
exports.getServiceConfig = async (counterId) => {
  try {
    const counter = await Counter.findByPk(counterId, {
      include: [
        {
          model: db.services,
          as: 'services',
          attributes: ['id', 'code', 'format_id', 'name_vi', 'name_en', 'representative_image'],
          through: { attributes: ['is_priority', 'is_active'] },
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
    });

    if (!counter) {
      return {
        success: false,
        message: 'Không tìm thấy quầy'
      };
    }

    // Format services
    const services = counter.services.map(service => {
      const serviceData = service.toJSON();
      const isPriority = serviceData.counter_services?.is_priority || false;
      delete serviceData.counter_services;
      return {
        ...serviceData,
        is_priority: isPriority
      };
    });

    return {
      success: true,
      data: {
        services,
        priority_services: services.filter(s => s.is_priority)
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Set services (replace toàn bộ)
 */
exports.setServiceConfig = async (counterId, serviceIds = [], priorityServiceIds = []) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const counter = await Counter.findByPk(counterId);
    if (!counter) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy quầy'
      };
    }

    // Validate: Services phải thuộc branch
    const branchValidation = await validateServicesAgainstBranch(
      counter.transaction_office_id, 
      serviceIds
    );
    if (!branchValidation.valid) {
      return {
        success: false,
        message: branchValidation.message
      };
    }

    // Validate priority_service_ids phải nằm trong service_ids
    const invalidPriorityIds = priorityServiceIds.filter(
      id => !serviceIds.includes(id)
    );
    if (invalidPriorityIds.length > 0) {
      return {
        success: false,
        message: 'Dịch vụ ưu tiên phải thuộc danh sách dịch vụ của quầy'
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

    // Xóa tất cả services cũ
    await db.counterServices.destroy({
      where: { counter_id: counterId },
      transaction
    });

    // Thêm services mới
    if (serviceIds.length > 0) {
      for (const serviceId of serviceIds) {
        const isPriority = priorityServiceIds.includes(serviceId);
        
        await db.counterServices.create({
          counter_id: counterId,
          service_id: serviceId,
          is_priority: isPriority,
          is_active: true
        }, { transaction });
      }
    }

    await transaction.commit();

    const result = await this.getServiceConfig(counterId);
    
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
exports.addServices = async (counterId, serviceIds, priorityServiceIds = []) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const counter = await Counter.findByPk(counterId);
    if (!counter) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy quầy'
      };
    }

    // Validate: Services phải thuộc branch
    const branchValidation = await validateServicesAgainstBranch(
      counter.transaction_office_id, 
      serviceIds
    );
    if (!branchValidation.valid) {
      return {
        success: false,
        message: branchValidation.message
      };
    }

    // Validate priority_service_ids phải nằm trong service_ids
    const invalidPriorityIds = priorityServiceIds.filter(
      id => !serviceIds.includes(id)
    );
    if (invalidPriorityIds.length > 0) {
      return {
        success: false,
        message: 'Dịch vụ ưu tiên phải thuộc danh sách dịch vụ đang thêm'
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

    // Thêm services
    for (const serviceId of serviceIds) {
      const isPriority = priorityServiceIds.includes(serviceId);
      
      // Kiểm tra đã tồn tại chưa
      const existing = await db.counterServices.findOne({
        where: { counter_id: counterId, service_id: serviceId }
      });

      if (!existing) {
        await db.counterServices.create({
          counter_id: counterId,
          service_id: serviceId,
          is_priority: isPriority,
          is_active: true
        }, { transaction });
      }
    }

    await transaction.commit();

    const result = await this.getServiceConfig(counterId);
    
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
exports.removeServices = async (counterId, serviceIds) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const counter = await Counter.findByPk(counterId);
    if (!counter) {
      return {
        success: false,
        message: 'Không tìm thấy quầy'
      };
    }

    await db.counterServices.destroy({
      where: { 
        counter_id: counterId,
        service_id: { [Op.in]: serviceIds }
      },
      transaction
    });

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
 * Xóa tất cả cấu hình services
 */
exports.clearServiceConfig = async (counterId) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const counter = await Counter.findByPk(counterId);
    if (!counter) {
      return {
        success: false,
        message: 'Không tìm thấy quầy'
      };
    }

    await db.counterServices.destroy({
      where: { counter_id: counterId },
      transaction
    });

    await transaction.commit();

    return {
      success: true,
      data: {
        services: [],
        priority_services: []
      }
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Cập nhật priority services
 */
exports.updatePriorityServices = async (counterId, priorityServiceIds = []) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const counter = await Counter.findByPk(counterId);
    if (!counter) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy quầy'
      };
    }

    // Lấy tất cả services của counter
    const counterServices = await db.counterServices.findAll({
      where: { counter_id: counterId }
    });

    const existingServiceIds = counterServices.map(cs => cs.service_id);

    // Validate: priority services phải thuộc danh sách services
    const invalidPriorityServices = priorityServiceIds.filter(
      id => !existingServiceIds.includes(id)
    );

    if (invalidPriorityServices.length > 0) {
      return {
        success: false,
        message: 'Dịch vụ ưu tiên phải thuộc danh sách dịch vụ của quầy'
      };
    }

    // Reset tất cả is_priority về false
    await db.counterServices.update(
      { is_priority: false },
      { 
        where: { counter_id: counterId },
        transaction 
      }
    );

    // Set is_priority = true cho các service được chọn
    if (priorityServiceIds.length > 0) {
      await db.counterServices.update(
        { is_priority: true },
        { 
          where: { 
            counter_id: counterId,
            service_id: { [Op.in]: priorityServiceIds }
          },
          transaction 
        }
      );
    }

    await transaction.commit();

    const result = await this.getCounterById(counterId);
    
    return {
      success: true,
      counter: result.counter
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};