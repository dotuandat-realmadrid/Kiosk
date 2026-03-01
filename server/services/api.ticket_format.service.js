// server/services/api.ticket_format.service.js
const db = require("../models");
const TicketFormat = db.ticketFormats;
const Service = db.services;
const Op = db.Sequelize.Op;
const validator = require('validator');

/**
 * Tìm kiếm định dạng vé với phân trang
 */
exports.searchTicketFormats = async (filters, pagination) => {
  try {
    const { id, code, format_pattern, is_active } = filters;
    const { page = 1, size = 20 } = pagination;

    const currentPage = parseInt(page);
    const pageSize = parseInt(size);
    const offset = (currentPage - 1) * pageSize;
    
    const where = {};

    if (id) {
      where.id = id;
    }

    if (code) {
      where.code = {
        [Op.like]: `%${code}%`
      };
    }

    if (format_pattern) {
      where.format_pattern = {
        [Op.like]: `%${format_pattern}%`
      };
    }

    if (is_active !== undefined && is_active !== null && is_active !== '') {
      where.is_active = is_active === 'true' || is_active === true;
    }

    const result = await TicketFormat.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      distinct: true,
      order: [['created_at', 'DESC']],
      include: [{
        model: Service,
        as: 'services',
        attributes: ['id', 'code', 'name_vi', 'is_active'],
        required: false
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
 * Lấy thông tin định dạng vé theo ID
 */
exports.getTicketFormatById = async (id) => {
  try {
    const ticketFormat = await TicketFormat.findByPk(id, {
      include: [{
        model: Service,
        as: 'services',
        attributes: ['id', 'code', 'name_vi', 'is_active']
      }]
    });

    if (!ticketFormat) {
      return {
        success: false,
        message: 'Không tìm thấy định dạng vé'
      };
    }

    return {
      success: true,
      ticketFormat
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Kiểm tra mã định dạng vé đã tồn tại
 */
exports.checkCodeExists = async (code, excludeId = null) => {
  const where = { code };
  
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  const existing = await TicketFormat.findOne({ where });
  return !!existing;
};

/**
 * Kiểm tra mẫu định dạng đã tồn tại
 */
exports.checkFormatPatternExists = async (format_pattern, excludeId = null) => {
  const where = { format_pattern };
  
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  const existing = await TicketFormat.findOne({ where });
  return !!existing;
};

/**
 * Thêm mới định dạng vé
 */
exports.createTicketFormat = async (data) => {
  try {
    const { code, format_pattern, start_number, max_number, is_active } = data;

    // Validate mã code (2-50 ký tự, không khoảng trắng)
    if (!/^[^\s]{2,50}$/.test(code)) {
      return {
        success: false,
        message: 'Mã định dạng vé phải từ 2-50 ký tự và không chứa khoảng trắng'
      };
    }

    // Validate format_pattern (2-100 ký tự)
    if (!format_pattern || format_pattern.trim().length < 2 || format_pattern.trim().length > 100) {
      return {
        success: false,
        message: 'Định dạng mẫu phải từ 2-100 ký tự'
      };
    }

    // Validate start_number
    if (start_number === undefined || start_number < 1) {
      return {
        success: false,
        message: 'Số bắt đầu phải lớn hơn hoặc bằng 1'
      };
    }

    // Validate max_number
    if (max_number === undefined || max_number < start_number) {
      return {
        success: false,
        message: 'Số lớn nhất phải lớn hơn hoặc bằng số bắt đầu'
      };
    }

    // Kiểm tra trùng mã
    if (await this.checkCodeExists(code)) {
      return {
        success: false,
        message: 'Mã định dạng vé đã tồn tại'
      };
    }

    // Kiểm tra trùng format_pattern
    if (await this.checkFormatPatternExists(format_pattern)) {
      return {
        success: false,
        message: 'Định dạng mẫu đã tồn tại'
      };
    }

    const ticketFormat = await TicketFormat.create({
      code: validator.escape(code.trim()),
      format_pattern: validator.escape(format_pattern.trim()),
      start_number,
      max_number,
      is_active: is_active !== undefined ? is_active : true
    });

    return {
      success: true,
      ticketFormat
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật định dạng vé
 */
exports.updateTicketFormat = async (id, data) => {
  try {
    const ticketFormat = await TicketFormat.findByPk(id);

    if (!ticketFormat) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy định dạng vé'
      };
    }

    const { code, format_pattern, start_number, max_number, is_active } = data;
    const updateData = {};

    // Validate và cập nhật code
    if (code !== undefined) {
      if (!/^[^\s]{2,50}$/.test(code)) {
        return {
          success: false,
          message: 'Mã định dạng vé phải từ 2-50 ký tự và không chứa khoảng trắng'
        };
      }

      if (await this.checkCodeExists(code, id)) {
        return {
          success: false,
          message: 'Mã định dạng vé đã tồn tại'
        };
      }

      updateData.code = validator.escape(code.trim());
    }

    // Validate và cập nhật format_pattern
    if (format_pattern !== undefined) {
      if (!format_pattern || format_pattern.trim().length < 2 || format_pattern.trim().length > 100) {
        return {
          success: false,
          message: 'Định dạng mẫu phải từ 2-100 ký tự'
        };
      }

      if (await this.checkFormatPatternExists(format_pattern, id)) {
        return {
          success: false,
          message: 'Định dạng mẫu đã tồn tại'
        };
      }

      updateData.format_pattern = validator.escape(format_pattern.trim());
    }

    // Validate và cập nhật start_number
    if (start_number !== undefined) {
      if (start_number < 1) {
        return {
          success: false,
          message: 'Số bắt đầu phải lớn hơn hoặc bằng 1'
        };
      }

      const targetMaxNumber = max_number !== undefined ? max_number : ticketFormat.max_number;
      if (start_number > targetMaxNumber) {
        return {
          success: false,
          message: 'Số bắt đầu phải nhỏ hơn hoặc bằng số lớn nhất'
        };
      }

      updateData.start_number = start_number;
    }

    // Validate và cập nhật max_number
    if (max_number !== undefined) {
      const targetStartNumber = start_number !== undefined ? start_number : ticketFormat.start_number;
      if (max_number < targetStartNumber) {
        return {
          success: false,
          message: 'Số lớn nhất phải lớn hơn hoặc bằng số bắt đầu'
        };
      }

      updateData.max_number = max_number;
    }

    // Cập nhật is_active
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    await ticketFormat.update(updateData);

    return {
      success: true,
      ticketFormat
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều định dạng vé
 */
exports.deleteTicketFormats = async (ids) => {
  try {
    // Kiểm tra xem có dịch vụ nào đang sử dụng không
    const servicesCount = await Service.count({
      where: {
        format_id: {
          [Op.in]: ids
        }
      }
    });

    if (servicesCount > 0) {
      return {
        success: false,
        message: 'Không thể xóa vì có dịch vụ đang sử dụng định dạng vé này'
      };
    }

    const deletedCount = await TicketFormat.destroy({
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
 * Bật/tắt trạng thái nhiều định dạng vé
 */
exports.toggleTicketFormats = async (ids, is_active) => {
  try {
    const [updatedCount] = await TicketFormat.update(
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