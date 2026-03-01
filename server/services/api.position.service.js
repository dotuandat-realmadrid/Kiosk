// server/services/api.position.service.js
const db = require("../models");
const Position = db.positions;
const Op = db.Sequelize.Op;
const validator = require('validator');

/**
 * Tìm kiếm chức danh với phân trang
 */
exports.searchPositions = async (filters, pagination) => {
  try {
    const { id, code, name, is_active } = filters;
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

    if (name) {
      where.name = {
        [Op.like]: `%${name}%`
      };
    }

    if (is_active !== undefined && is_active !== null && is_active !== '') {
      where.is_active = is_active === 'true' || is_active === true;
    }

    const result = await Position.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'code', 'name', 'description', 'is_active', 'created_at', 'updated_at']
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
 * Lấy thông tin chức danh theo ID
 */
exports.getPositionById = async (id) => {
  try {
    const position = await Position.findByPk(id, {
      attributes: ['id', 'code', 'name', 'description', 'is_active', 'created_at', 'updated_at']
    });

    if (!position) {
      return {
        success: false,
        message: 'Không tìm thấy chức danh'
      };
    }

    return {
      success: true,
      position
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy tất cả chức danh đang hoạt động (không phân trang)
 */
exports.getAllActivePositions = async () => {
  try {
    const positions = await Position.findAll({
      where: {
        is_active: true
      },
      order: [['name', 'ASC']],
      attributes: ['id', 'code', 'name', 'description']
    });

    return {
      success: true,
      positions
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Kiểm tra mã chức danh đã tồn tại
 */
exports.checkCodeExists = async (code, excludeId = null) => {
  const where = { code };
  
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  const existing = await Position.findOne({ where });
  return !!existing;
};

/**
 * Kiểm tra tên chức danh đã tồn tại
 */
exports.checkNameExists = async (name, excludeId = null) => {
  const where = { name };
  
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  const existing = await Position.findOne({ where });
  return !!existing;
};

/**
 * Thêm mới chức danh
 */
exports.createPosition = async (data) => {
  try {
    const { code, name, description, is_active } = data;

    // Validate mã code (2-50 ký tự, không khoảng trắng)
    if (!/^[^\s]{2,50}$/.test(code)) {
      return {
        success: false,
        message: 'Mã chức danh phải từ 2-50 ký tự và không chứa khoảng trắng'
      };
    }

    // Validate tên (2-100 ký tự)
    if (!name || name.trim().length < 2 || name.trim().length > 100) {
      return {
        success: false,
        message: 'Tên chức danh phải từ 2-100 ký tự'
      };
    }

    // Kiểm tra trùng mã
    if (await this.checkCodeExists(code)) {
      return {
        success: false,
        message: 'Mã chức danh đã tồn tại'
      };
    }

    // Kiểm tra trùng tên
    if (await this.checkNameExists(name)) {
      return {
        success: false,
        message: 'Tên chức danh đã tồn tại'
      };
    }

    const position = await Position.create({
      code: validator.escape(code.trim()),
      name: validator.escape(name.trim()),
      description: description ? validator.escape(description.trim()) : null,
      is_active: is_active !== undefined ? is_active : true
    });

    return {
      success: true,
      position
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật chức danh
 */
exports.updatePosition = async (id, data) => {
  try {
    const position = await Position.findByPk(id);

    if (!position) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy chức danh'
      };
    }

    const { code, name, description, is_active } = data;
    const updateData = {};

    // Validate và cập nhật code
    if (code !== undefined) {
      if (!/^[^\s]{2,50}$/.test(code)) {
        return {
          success: false,
          message: 'Mã chức danh phải từ 2-50 ký tự và không chứa khoảng trắng'
        };
      }

      if (await this.checkCodeExists(code, id)) {
        return {
          success: false,
          message: 'Mã chức danh đã tồn tại'
        };
      }

      updateData.code = validator.escape(code.trim());
    }

    // Validate và cập nhật name
    if (name !== undefined) {
      if (!name || name.trim().length < 2 || name.trim().length > 100) {
        return {
          success: false,
          message: 'Tên chức danh phải từ 2-100 ký tự'
        };
      }

      if (await this.checkNameExists(name, id)) {
        return {
          success: false,
          message: 'Tên chức danh đã tồn tại'
        };
      }

      updateData.name = validator.escape(name.trim());
    }

    // Cập nhật description
    if (description !== undefined) {
      updateData.description = description ? validator.escape(description.trim()) : null;
    }

    // Cập nhật is_active
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    await position.update(updateData);

    return {
      success: true,
      position
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều chức danh
 */
exports.deletePositions = async (ids) => {
  try {
    // TODO: Kiểm tra xem có user nào đang sử dụng position này không
    // const usersCount = await User.count({
    //   where: {
    //     position_id: {
    //       [Op.in]: ids
    //     }
    //   }
    // });

    // if (usersCount > 0) {
    //   return {
    //     success: false,
    //     message: 'Không thể xóa vì có người dùng đang sử dụng chức danh này'
    //   };
    // }

    const deletedCount = await Position.destroy({
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
 * Bật/tắt trạng thái nhiều chức danh
 */
exports.togglePositions = async (ids, is_active) => {
  try {
    const [updatedCount] = await Position.update(
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