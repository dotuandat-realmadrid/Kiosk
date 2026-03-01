// server/services/api.service.service.js
const db = require("../models");
const Service = db.services;
const TicketFormat = db.ticketFormats;
const Op = db.Sequelize.Op;
const validator = require('validator');

/**
 * Tìm kiếm dịch vụ với phân trang
 */
exports.searchServices = async (filters, pagination) => {
  try {
    const { id, format_id, code, name_vi, is_active } = filters;
    const { page = 1, size = 20 } = pagination;

    const currentPage = parseInt(page);
    const pageSize = parseInt(size);
    const offset = (currentPage - 1) * pageSize;
    
    const where = {};

    if (id) {
      where.id = id;
    }

    if (format_id) {
      where.format_id = format_id;
    }

    if (code) {
      where.code = {
        [Op.like]: `%${code}%`
      };
    }

    if (name_vi) {
      where.name_vi = {
        [Op.like]: `%${name_vi}%`
      };
    }

    if (is_active !== undefined && is_active !== null && is_active !== '') {
      where.is_active = is_active === 'true' || is_active === true;
    }

    const result = await Service.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      distinct: true,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['format_id'] },
      include: [{
        model: TicketFormat,
        as: 'ticket_format',
        attributes: ['id', 'code', 'format_pattern', 'is_active']
      }]
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
 * Lấy thông tin dịch vụ theo ID
 */
exports.getServiceById = async (id) => {
  try {
    const service = await Service.findByPk(id, {
      attributes: { exclude: ['format_id'] },
      include: [{
        model: TicketFormat,
        as: 'ticket_format',
        attributes: ['id', 'code', 'format_pattern', 'is_active']
      }]
    });

    if (!service) {
      return {
        success: false,
        message: 'Không tìm thấy dịch vụ'
      };
    }

    return {
      success: true,
      service
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách dịch vụ theo định dạng vé
 */
exports.getServicesByTicketFormat = async (formatId) => {
  try {
    const services = await Service.findAll({
      where: {
        format_id: formatId,
        is_active: true
      },
      order: [['name_vi', 'ASC']],
      attributes: ['id', 'code', 'name_vi', 'name_en', 'name_ja', 'name_cn', 'name_sp', 'is_active']
    });

    return {
      success: true,
      services
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Kiểm tra mã dịch vụ đã tồn tại
 */
exports.checkCodeExists = async (code, excludeId = null) => {
  const where = { code };
  
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  const existing = await Service.findOne({ where });
  return !!existing;
};

/**
 * Thêm mới dịch vụ
 */
exports.createService = async (data) => {
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
    } = data;

    // Kiểm tra định dạng vé tồn tại
    const ticketFormat = await TicketFormat.findByPk(format_id);
    if (!ticketFormat) {
      return {
        success: false,
        message: 'Định dạng vé không tồn tại'
      };
    }

    // Validate mã code (2-50 ký tự, không khoảng trắng)
    if (!/^[^\s]{2,50}$/.test(code)) {
      return {
        success: false,
        message: 'Mã dịch vụ phải từ 2-50 ký tự và không chứa khoảng trắng'
      };
    }

    // Validate tên tiếng Việt (2-255 ký tự)
    if (!name_vi || name_vi.trim().length < 2 || name_vi.trim().length > 255) {
      return {
        success: false,
        message: 'Tên tiếng Việt phải từ 2-255 ký tự'
      };
    }

    // Kiểm tra trùng mã
    if (await this.checkCodeExists(code)) {
      return {
        success: false,
        message: 'Mã dịch vụ đã tồn tại'
      };
    }

    const service = await Service.create({
      format_id,
      code: validator.escape(code.trim()),
      name_vi: validator.escape(name_vi.trim()),
      name_en: name_en ? validator.escape(name_en.trim()) : null,
      name_ja: name_ja ? validator.escape(name_ja.trim()) : null,
      name_cn: name_cn ? validator.escape(name_cn.trim()) : null,
      name_sp: name_sp ? validator.escape(name_sp.trim()) : null,
      representative_image: representative_image || null,
      is_active: is_active !== undefined ? is_active : true
    });

    // Lấy lại với thông tin ticket_format
    const createdService = await Service.findByPk(service.id, {
      attributes: { exclude: ['format_id'] },
      include: [{
        model: TicketFormat,
        as: 'ticket_format',
        attributes: ['id', 'code', 'format_pattern', 'is_active']
      }]
    });

    return {
      success: true,
      service: createdService
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật dịch vụ
 */
exports.updateService = async (id, data) => {
  try {
    const service = await Service.findByPk(id);

    if (!service) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy dịch vụ'
      };
    }

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
    } = data;
    const updateData = {};

    // Validate và cập nhật format_id
    if (format_id !== undefined) {
      const ticketFormat = await TicketFormat.findByPk(format_id);
      if (!ticketFormat) {
        return {
          success: false,
          message: 'Định dạng vé không tồn tại'
        };
      }
      updateData.format_id = format_id;
    }

    // Validate và cập nhật code
    if (code !== undefined) {
      if (!/^[^\s]{2,50}$/.test(code)) {
        return {
          success: false,
          message: 'Mã dịch vụ phải từ 2-50 ký tự và không chứa khoảng trắng'
        };
      }

      if (await this.checkCodeExists(code, id)) {
        return {
          success: false,
          message: 'Mã dịch vụ đã tồn tại'
        };
      }

      updateData.code = validator.escape(code.trim());
    }

    // Validate và cập nhật name_vi
    if (name_vi !== undefined) {
      if (!name_vi || name_vi.trim().length < 2 || name_vi.trim().length > 255) {
        return {
          success: false,
          message: 'Tên tiếng Việt phải từ 2-255 ký tự'
        };
      }

      updateData.name_vi = validator.escape(name_vi.trim());
    }

    // Cập nhật các tên khác
    if (name_en !== undefined) {
      updateData.name_en = name_en ? validator.escape(name_en.trim()) : null;
    }

    if (name_ja !== undefined) {
      updateData.name_ja = name_ja ? validator.escape(name_ja.trim()) : null;
    }

    if (name_cn !== undefined) {
      updateData.name_cn = name_cn ? validator.escape(name_cn.trim()) : null;
    }

    if (name_sp !== undefined) {
      updateData.name_sp = name_sp ? validator.escape(name_sp.trim()) : null;
    }

    // Cập nhật ảnh đại diện
    if (representative_image !== undefined) {
      updateData.representative_image = representative_image || null;
    }

    // Cập nhật is_active
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    await service.update(updateData);

    // Lấy lại với thông tin ticket_format
    const updatedService = await Service.findByPk(id, {
      attributes: { exclude: ['format_id'] },
      include: [{
        model: TicketFormat,
        as: 'ticket_format',
        attributes: ['id', 'code', 'format_pattern', 'is_active']
      }]
    });

    return {
      success: true,
      service: updatedService
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều dịch vụ
 */
exports.deleteServices = async (ids) => {
  try {
    const deletedCount = await Service.destroy({
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
 * Bật/tắt trạng thái nhiều dịch vụ
 */
exports.toggleServices = async (ids, is_active) => {
  try {
    const [updatedCount] = await Service.update(
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