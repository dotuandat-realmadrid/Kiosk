// server/services/api.district.service.js
const db = require("../models");
const District = db.districts;
const Province = db.provinces;
const Op = db.Sequelize.Op;
const validator = require('validator');

/**
 * Tìm kiếm quận/huyện với phân trang
 */
exports.searchDistricts = async (filters, pagination) => {
  try {
    const { id, province_id, code, name, is_active } = filters;
    const { page = 1, size = 20 } = pagination;

    const currentPage = parseInt(page);
    const pageSize = parseInt(size);
    const offset = (currentPage - 1) * pageSize;
    
    const where = {};

    if (id) {
      where.id = id;
    }

    if (province_id) {
      where.province_id = province_id;
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

    const result = await District.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      distinct: true, // ✅ Thêm distinct để đếm đúng khi có include
      order: [['created_at', 'DESC']],
      include: [{
        model: Province,
        as: 'province',
        attributes: ['id', 'code', 'name', 'is_active']
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
 * Lấy thông tin quận/huyện theo ID
 */
exports.getDistrictById = async (id) => {
  try {
    const district = await District.findByPk(id, {
      include: [{
        model: Province,
        as: 'province',
        attributes: ['id', 'code', 'name', 'is_active']
      }]
    });

    if (!district) {
      return {
        success: false,
        message: 'Không tìm thấy quận/huyện'
      };
    }

    return {
      success: true,
      district
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách quận/huyện theo tỉnh
 */
exports.getDistrictsByProvince = async (provinceId) => {
  try {
    const districts = await District.findAll({
      where: {
        province_id: provinceId,
        is_active: true
      },
      order: [['name', 'ASC']],
      attributes: ['id', 'code', 'name', 'is_active']
    });

    return {
      success: true,
      districts
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Kiểm tra mã quận/huyện đã tồn tại trong tỉnh
 */
exports.checkCodeExistsInProvince = async (province_id, code, excludeId = null) => {
  const where = { 
    province_id,
    code 
  };
  
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  const existing = await District.findOne({ where });
  return !!existing;
};

/**
 * Thêm mới quận/huyện
 */
exports.createDistrict = async (data) => {
  try {
    const { province_id, code, name, is_active } = data;

    // Kiểm tra tỉnh/thành phố tồn tại
    const province = await Province.findByPk(province_id);
    if (!province) {
      return {
        success: false,
        message: 'Tỉnh/thành phố không tồn tại'
      };
    }

    // Validate mã code (2-50 ký tự, không khoảng trắng)
    if (!/^[^\s]{2,50}$/.test(code)) {
      return {
        success: false,
        message: 'Mã quận/huyện phải từ 2-50 ký tự và không chứa khoảng trắng'
      };
    }

    // Validate tên (2-100 ký tự)
    if (!name || name.trim().length < 2 || name.trim().length > 100) {
      return {
        success: false,
        message: 'Tên quận/huyện phải từ 2-100 ký tự'
      };
    }

    // Kiểm tra trùng mã trong cùng tỉnh
    if (await this.checkCodeExistsInProvince(province_id, code)) {
      return {
        success: false,
        message: 'Mã quận/huyện đã tồn tại trong tỉnh/thành phố này'
      };
    }

    const district = await District.create({
      province_id,
      code: validator.escape(code.trim()),
      name: validator.escape(name.trim()),
      is_active: is_active !== undefined ? is_active : true
    });

    // Lấy lại với thông tin province
    const createdDistrict = await District.findByPk(district.id, {
      include: [{
        model: Province,
        as: 'province',
        attributes: ['id', 'code', 'name', 'is_active']
      }]
    });

    return {
      success: true,
      district: createdDistrict
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật quận/huyện
 */
exports.updateDistrict = async (id, data) => {
  try {
    const district = await District.findByPk(id);

    if (!district) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy quận/huyện'
      };
    }

    const { province_id, code, name, is_active } = data;
    const updateData = {};

    // Validate và cập nhật province_id
    if (province_id !== undefined) {
      const province = await Province.findByPk(province_id);
      if (!province) {
        return {
          success: false,
          message: 'Tỉnh/thành phố không tồn tại'
        };
      }
      updateData.province_id = province_id;
    }

    const targetProvinceId = province_id !== undefined ? province_id : district.province_id;

    // Validate và cập nhật code
    if (code !== undefined) {
      if (!/^[^\s]{2,50}$/.test(code)) {
        return {
          success: false,
          message: 'Mã quận/huyện phải từ 2-50 ký tự và không chứa khoảng trắng'
        };
      }

      if (await this.checkCodeExistsInProvince(targetProvinceId, code, id)) {
        return {
          success: false,
          message: 'Mã quận/huyện đã tồn tại trong tỉnh/thành phố này'
        };
      }

      updateData.code = validator.escape(code.trim());
    }

    // Validate và cập nhật name
    if (name !== undefined) {
      if (!name || name.trim().length < 2 || name.trim().length > 100) {
        return {
          success: false,
          message: 'Tên quận/huyện phải từ 2-100 ký tự'
        };
      }

      updateData.name = validator.escape(name.trim());
    }

    // Cập nhật is_active
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    await district.update(updateData);

    // Lấy lại với thông tin province
    const updatedDistrict = await District.findByPk(id, {
      include: [{
        model: Province,
        as: 'province',
        attributes: ['id', 'code', 'name', 'is_active']
      }]
    });

    return {
      success: true,
      district: updatedDistrict
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều quận/huyện
 */
exports.deleteDistricts = async (ids) => {
  try {
    const deletedCount = await District.destroy({
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
 * Bật/tắt trạng thái nhiều quận/huyện
 */
exports.toggleDistricts = async (ids, is_active) => {
  try {
    const [updatedCount] = await District.update(
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