// server/services/api.province.service.js
const db = require("../models");
const Province = db.provinces;
const District = db.districts;
const Op = db.Sequelize.Op;
const validator = require('validator');

/**
 * Tìm kiếm tỉnh/thành phố với phân trang
 */
exports.searchProvinces = async (filters, pagination) => {
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

    const result = await Province.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      distinct: true, // ✅ Thêm distinct để đếm đúng khi có include
      order: [['created_at', 'DESC']],
      include: [{
        model: District,
        as: 'districts',
        attributes: ['id', 'code', 'name', 'is_active'],
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
    console.error('Search provinces error:', error);
    throw error;
  }
};

/**
 * Lấy thông tin tỉnh/thành phố theo ID
 */
exports.getProvinceById = async (id) => {
  try {
    const province = await Province.findByPk(id, {
      include: [{
        model: District,
        as: 'districts',
        attributes: ['id', 'code', 'name', 'is_active']
      }]
    });

    if (!province) {
      return {
        success: false,
        message: 'Không tìm thấy tỉnh/thành phố'
      };
    }

    return {
      success: true,
      province
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Kiểm tra mã tỉnh/thành phố đã tồn tại
 */
exports.checkCodeExists = async (code, excludeId = null) => {
  const where = { code };
  
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  const existing = await Province.findOne({ where });
  return !!existing;
};

/**
 * Kiểm tra tên tỉnh/thành phố đã tồn tại
 */
exports.checkNameExists = async (name, excludeId = null) => {
  const where = { name };
  
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  const existing = await Province.findOne({ where });
  return !!existing;
};

/**
 * Thêm mới tỉnh/thành phố
 */
exports.createProvince = async (data) => {
  try {
    const { code, name, is_active } = data;

    // Validate mã code (2-50 ký tự, không khoảng trắng)
    if (!/^[^\s]{2,50}$/.test(code)) {
      return {
        success: false,
        message: 'Mã tỉnh/thành phố phải từ 2-50 ký tự và không chứa khoảng trắng'
      };
    }

    // Validate tên (2-100 ký tự)
    if (!name || name.trim().length < 2 || name.trim().length > 100) {
      return {
        success: false,
        message: 'Tên tỉnh/thành phố phải từ 2-100 ký tự'
      };
    }

    // Kiểm tra trùng mã
    if (await this.checkCodeExists(code)) {
      return {
        success: false,
        message: 'Mã tỉnh/thành phố đã tồn tại'
      };
    }

    // Kiểm tra trùng tên
    if (await this.checkNameExists(name)) {
      return {
        success: false,
        message: 'Tên tỉnh/thành phố đã tồn tại'
      };
    }

    const province = await Province.create({
      code: validator.escape(code.trim()),
      name: validator.escape(name.trim()),
      is_active: is_active !== undefined ? is_active : true
    });

    return {
      success: true,
      province
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật tỉnh/thành phố
 */
exports.updateProvince = async (id, data) => {
  try {
    const province = await Province.findByPk(id);

    if (!province) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy tỉnh/thành phố'
      };
    }

    const { code, name, is_active } = data;
    const updateData = {};

    // Validate và cập nhật code
    if (code !== undefined) {
      if (!/^[^\s]{2,50}$/.test(code)) {
        return {
          success: false,
          message: 'Mã tỉnh/thành phố phải từ 2-50 ký tự và không chứa khoảng trắng'
        };
      }

      if (await this.checkCodeExists(code, id)) {
        return {
          success: false,
          message: 'Mã tỉnh/thành phố đã tồn tại'
        };
      }

      updateData.code = validator.escape(code.trim());
    }

    // Validate và cập nhật name
    if (name !== undefined) {
      if (!name || name.trim().length < 2 || name.trim().length > 100) {
        return {
          success: false,
          message: 'Tên tỉnh/thành phố phải từ 2-100 ký tự'
        };
      }

      if (await this.checkNameExists(name, id)) {
        return {
          success: false,
          message: 'Tên tỉnh/thành phố đã tồn tại'
        };
      }

      updateData.name = validator.escape(name.trim());
    }

    // Cập nhật is_active
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    await province.update(updateData);

    return {
      success: true,
      province
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều tỉnh/thành phố
 */
exports.deleteProvinces = async (ids) => {
  try {
    // Kiểm tra xem có quận/huyện nào đang sử dụng không
    const districtsCount = await District.count({
      where: {
        province_id: {
          [Op.in]: ids
        }
      }
    });

    if (districtsCount > 0) {
      return {
        success: false,
        message: 'Không thể xóa vì có quận/huyện đang sử dụng tỉnh/thành phố này'
      };
    }

    const deletedCount = await Province.destroy({
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
 * Bật/tắt trạng thái nhiều tỉnh/thành phố
 */
exports.toggleProvinces = async (ids, is_active) => {
  try {
    const [updatedCount] = await Province.update(
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