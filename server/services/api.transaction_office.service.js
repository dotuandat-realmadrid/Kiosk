// server/services/api.transaction_office.service.js
const db = require("../models");
const TransactionOffice = db.transactionOffices;
const Province = db.provinces;
const District = db.districts;
const UserTransactionOffice = db.userTransactionOffices;
const Op = db.Sequelize.Op;
const validator = require('validator');

/**
 * Tìm kiếm phòng giao dịch với phân trang
 */
exports.searchTransactionOffices = async (filters, page = 1, pageSize = 20) => {
  try {
    const { id, district_id, district_code, province_id, province_code, code, name, address, is_active } = filters;
    
    const where = {};
    const districtWhere = {};
    const provinceWhere = {};

    // Filter cho transaction office
    if (id) {
      where.id = id;
    }

    if (district_id) {
      where.district_id = district_id;
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

    if (address) {
      where.address = {
        [Op.like]: `%${address}%`
      };
    }

    if (is_active !== undefined && is_active !== null && is_active !== '') {
      where.is_active = is_active === 'true' || is_active === true;
    }

    // Filter cho district
    if (district_code) {
      districtWhere.code = {
        [Op.like]: `%${district_code}%`
      };
    }

    // Filter cho province
    if (province_id) {
      provinceWhere.id = province_id;
    }

    if (province_code) {
      provinceWhere.code = {
        [Op.like]: `%${province_code}%`
      };
    }

    // Nếu có filter theo district hoặc province, cần tìm các district_id phù hợp trước
    if (Object.keys(districtWhere).length > 0 || Object.keys(provinceWhere).length > 0) {
      const districtQuery = {
        where: districtWhere,
        attributes: ['id']
      };

      // Nếu có filter province, thêm vào include
      if (Object.keys(provinceWhere).length > 0) {
        districtQuery.include = [
          {
            model: Province,
            as: 'province',
            where: provinceWhere,
            attributes: []
          }
        ];
      }

      const validDistricts = await District.findAll(districtQuery);
      const validDistrictIds = validDistricts.map(d => d.id);

      if (validDistrictIds.length === 0) {
        // Không tìm thấy district nào phù hợp
        return {
          data: [],
          currentPage: page,
          pageSize,
          totalElements: 0,
          totalPage: 0
        };
      }

      // Thêm filter district_id vào where của transaction_office
      if (where.district_id) {
        // Nếu đã có district_id trong filter, giao 2 tập hợp
        where.district_id = {
          [Op.and]: [
            where.district_id,
            { [Op.in]: validDistrictIds }
          ]
        };
      } else {
        where.district_id = {
          [Op.in]: validDistrictIds
        };
      }
    }

    const offset = (page - 1) * pageSize;

    const { count, rows } = await TransactionOffice.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      distinct: true,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: District,
          as: 'district',
          attributes: ['id', 'code', 'name'],
          include: [
            {
              model: Province,
              as: 'province',
              attributes: ['id', 'code', 'name']
            }
          ]
        }
      ]
    });

    // Transform data để trả về theo định dạng mong muốn
    const transformedData = rows.map(office => {
      const plainOffice = office.get({ plain: true });
      
      return {
        id: plainOffice.id,
        district_id: plainOffice.district_id,
        district_code: plainOffice.district?.code || null,
        district_name: plainOffice.district?.name || null,
        province_id: plainOffice.district?.province?.id || null,
        province_code: plainOffice.district?.province?.code || null,
        province_name: plainOffice.district?.province?.name || null,
        code: plainOffice.code,
        name: plainOffice.name,
        address: plainOffice.address,
        latitude: plainOffice.latitude,
        longitude: plainOffice.longitude,
        is_active: plainOffice.is_active,
        created_at: plainOffice.created_at,
        updated_at: plainOffice.updated_at
      };
    });

    return {
      currentPage: page,
      pageSize,
      totalElements: count,
      totalPage: Math.ceil(count / pageSize),
      data: transformedData,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy thông tin phòng giao dịch theo ID
 */
exports.getTransactionOfficeById = async (id) => {
  try {
    const office = await TransactionOffice.findByPk(id, {
      include: [
        {
          model: District,
          as: 'district',
          attributes: ['id', 'code', 'name'],
          include: [
            {
              model: Province,
              as: 'province',
              attributes: ['id', 'code', 'name']
            }
          ]
        }
      ]
    });

    if (!office) {
      return {
        success: false,
        message: 'Không tìm thấy phòng giao dịch'
      };
    }

    // Transform data
    const plainOffice = office.get({ plain: true });
    const transformedOffice = {
      id: plainOffice.id,
      district_id: plainOffice.district_id,
      district_code: plainOffice.district?.code || null,
      district_name: plainOffice.district?.name || null,
      province_id: plainOffice.district?.province?.id || null,
      province_code: plainOffice.district?.province?.code || null,
      province_name: plainOffice.district?.province?.name || null,
      code: plainOffice.code,
      name: plainOffice.name,
      address: plainOffice.address,
      latitude: plainOffice.latitude,
      longitude: plainOffice.longitude,
      is_active: plainOffice.is_active,
      created_at: plainOffice.created_at,
      updated_at: plainOffice.updated_at
    };

    return {
      success: true,
      office: transformedOffice
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách phòng giao dịch theo quận/huyện
 */
exports.getOfficesByDistrict = async (districtId) => {
  try {
    const offices = await TransactionOffice.findAll({
      where: {
        district_id: districtId,
        is_active: true
      },
      order: [['name', 'ASC']],
      attributes: ['id', 'code', 'name', 'address']
    });

    return {
      success: true,
      offices
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy tất cả phòng giao dịch đang hoạt động
 */
exports.getAllActiveOffices = async () => {
  try {
    const offices = await TransactionOffice.findAll({
      where: {
        is_active: true
      },
      order: [['name', 'ASC']],
      attributes: ['id', 'code', 'name', 'address', 'district_id'],
      include: [
        {
          model: District,
          as: 'district',
          attributes: ['id', 'code', 'name'],
          include: [
            {
              model: Province,
              as: 'province',
              attributes: ['id', 'code', 'name']
            }
          ]
        }
      ]
    });

    // Transform data
    const transformedOffices = offices.map(office => {
      const plainOffice = office.get({ plain: true });
      
      return {
        id: plainOffice.id,
        district_id: plainOffice.district_id,
        district_code: plainOffice.district?.code || null,
        district_name: plainOffice.district?.name || null,
        province_id: plainOffice.district?.province?.id || null,
        province_code: plainOffice.district?.province?.code || null,
        province_name: plainOffice.district?.province?.name || null,
        code: plainOffice.code,
        name: plainOffice.name,
        address: plainOffice.address
      };
    });

    return {
      success: true,
      offices: transformedOffices
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Kiểm tra mã phòng giao dịch đã tồn tại
 */
exports.checkCodeExists = async (code, excludeId = null) => {
  const where = { code };
  
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  const existing = await TransactionOffice.findOne({ where });
  return !!existing;
};

/**
 * Thêm mới phòng giao dịch
 */
exports.createTransactionOffice = async (data) => {
  try {
    const { district_id, code, name, address, latitude, longitude, is_active } = data;

    // Kiểm tra district tồn tại
    const district = await District.findByPk(district_id, {
      include: [
        {
          model: Province,
          as: 'province',
          attributes: ['id', 'code', 'name']
        }
      ]
    });

    if (!district) {
      return {
        success: false,
        message: 'Quận/huyện không tồn tại'
      };
    }

    // Validate mã code (2-50 ký tự, không khoảng trắng)
    if (!/^[^\s]{2,50}$/.test(code)) {
      return {
        success: false,
        message: 'Mã phòng giao dịch phải từ 2-50 ký tự và không chứa khoảng trắng'
      };
    }

    // Validate tên (2-200 ký tự)
    if (!name || name.trim().length < 2 || name.trim().length > 200) {
      return {
        success: false,
        message: 'Tên phòng giao dịch phải từ 2-200 ký tự'
      };
    }

    // Validate địa chỉ (5-500 ký tự)
    if (!address || address.trim().length < 5 || address.trim().length > 500) {
      return {
        success: false,
        message: 'Địa chỉ phòng giao dịch phải từ 5-500 ký tự'
      };
    }

    // Kiểm tra trùng mã
    if (await this.checkCodeExists(code)) {
      return {
        success: false,
        message: 'Mã phòng giao dịch đã tồn tại'
      };
    }

    const office = await TransactionOffice.create({
      district_id,
      code: validator.escape(code.trim()),
      name: validator.escape(name.trim()),
      address: validator.escape(address.trim()),
      latitude: latitude || null,
      longitude: longitude || null,
      is_active: is_active !== undefined ? is_active : true
    });

    // Lấy lại với thông tin district và province
    const createdOffice = await TransactionOffice.findByPk(office.id, {
      include: [
        {
          model: District,
          as: 'district',
          attributes: ['id', 'code', 'name'],
          include: [
            {
              model: Province,
              as: 'province',
              attributes: ['id', 'code', 'name']
            }
          ]
        }
      ]
    });

    // Transform data
    const plainOffice = createdOffice.get({ plain: true });
    const transformedOffice = {
      id: plainOffice.id,
      district_id: plainOffice.district_id,
      district_code: plainOffice.district?.code || null,
      district_name: plainOffice.district?.name || null,
      province_id: plainOffice.district?.province?.id || null,
      province_code: plainOffice.district?.province?.code || null,
      province_name: plainOffice.district?.province?.name || null,
      code: plainOffice.code,
      name: plainOffice.name,
      address: plainOffice.address,
      latitude: plainOffice.latitude,
      longitude: plainOffice.longitude,
      is_active: plainOffice.is_active,
      created_at: plainOffice.created_at,
      updated_at: plainOffice.updated_at
    };

    return {
      success: true,
      office: transformedOffice
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật phòng giao dịch
 */
exports.updateTransactionOffice = async (id, data) => {
  try {
    const office = await TransactionOffice.findByPk(id);

    if (!office) {
      return {
        success: false,
        notFound: true,
        message: 'Không tìm thấy phòng giao dịch'
      };
    }

    const { district_id, code, name, address, latitude, longitude, is_active } = data;
    const updateData = {};

    // Validate và cập nhật district_id
    if (district_id !== undefined) {
      const district = await District.findByPk(district_id);

      if (!district) {
        return {
          success: false,
          message: 'Quận/huyện không tồn tại'
        };
      }

      updateData.district_id = district_id;
    }

    // Validate và cập nhật code
    if (code !== undefined) {
      if (!/^[^\s]{2,50}$/.test(code)) {
        return {
          success: false,
          message: 'Mã phòng giao dịch phải từ 2-50 ký tự và không chứa khoảng trắng'
        };
      }

      if (await this.checkCodeExists(code, id)) {
        return {
          success: false,
          message: 'Mã phòng giao dịch đã tồn tại'
        };
      }

      updateData.code = validator.escape(code.trim());
    }

    // Validate và cập nhật name
    if (name !== undefined) {
      if (!name || name.trim().length < 2 || name.trim().length > 200) {
        return {
          success: false,
          message: 'Tên phòng giao dịch phải từ 2-200 ký tự'
        };
      }

      updateData.name = validator.escape(name.trim());
    }

    // Validate và cập nhật address
    if (address !== undefined) {
      if (!address || address.trim().length < 5 || address.trim().length > 500) {
        return {
          success: false,
          message: 'Địa chỉ phòng giao dịch phải từ 5-500 ký tự'
        };
      }

      updateData.address = validator.escape(address.trim());
    }

    // Cập nhật latitude, longitude
    if (latitude !== undefined) updateData.latitude = latitude || null;
    if (longitude !== undefined) updateData.longitude = longitude || null;

    // Cập nhật is_active
    if (is_active !== undefined) updateData.is_active = is_active;

    await office.update(updateData);

    // Lấy lại với thông tin district và province
    const updatedOffice = await TransactionOffice.findByPk(id, {
      include: [
        {
          model: District,
          as: 'district',
          attributes: ['id', 'code', 'name'],
          include: [
            {
              model: Province,
              as: 'province',
              attributes: ['id', 'code', 'name']
            }
          ]
        }
      ]
    });

    // Transform data
    const plainOffice = updatedOffice.get({ plain: true });
    const transformedOffice = {
      id: plainOffice.id,
      district_id: plainOffice.district_id,
      district_code: plainOffice.district?.code || null,
      district_name: plainOffice.district?.name || null,
      province_id: plainOffice.district?.province?.id || null,
      province_code: plainOffice.district?.province?.code || null,
      province_name: plainOffice.district?.province?.name || null,
      code: plainOffice.code,
      name: plainOffice.name,
      address: plainOffice.address,
      latitude: plainOffice.latitude,
      longitude: plainOffice.longitude,
      is_active: plainOffice.is_active,
      created_at: plainOffice.created_at,
      updated_at: plainOffice.updated_at
    };

    return {
      success: true,
      office: transformedOffice
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa một hoặc nhiều phòng giao dịch
 */
exports.deleteTransactionOffices = async (ids) => {
  try {
    // Kiểm tra xem có user nào đang được gán không
    const assignmentsCount = await UserTransactionOffice.count({
      where: {
        transaction_office_id: {
          [Op.in]: ids
        }
      }
    });

    if (assignmentsCount > 0) {
      return {
        success: false,
        message: 'Không thể xóa vì có người dùng đang được gán vào phòng giao dịch này'
      };
    }

    const deletedCount = await TransactionOffice.destroy({
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
 * Bật/tắt trạng thái nhiều phòng giao dịch
 */
exports.toggleTransactionOffices = async (ids, is_active) => {
  try {
    const [updatedCount] = await TransactionOffice.update(
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