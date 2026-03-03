// ==========================================
// server/services/user.service.js (UPDATED - THÊM COUNTER)
// ==========================================
const db = require("../models");
const User = db.users;
const Role = db.roles;
const UserRole = db.userRoles;
const Position = db.positions;
const TransactionOffice = db.transactionOffices;
const UserTransactionOffice = db.userTransactionOffices;
const Counter = db.counters;
const Op = db.Sequelize.Op;
const validator = require('validator');

const {
  validateEmail,
  validatePassword,
  validatePhone,
  hashPassword
} = require("../utils/auth.util");

/**
 * Validate dữ liệu user (dùng chung cho create và update)
 */
exports.validateUserData = async (data, isUpdate = false) => {
  const { username, password, full_name, email, phone, gender, position_id, roles, transaction_offices } = data;

  // Required fields cho create
  if (!isUpdate) {
    if (!username || !password || !full_name || !email) {
      return {
        valid: false,
        message: 'username, password, full_name và email là bắt buộc'
      };
    }
  }

  if (username && !/^[^\s]{3,30}$/.test(username)) {
    return {
      valid: false,
      message: 'Username phải từ 3-30 ký tự và không được chứa khoảng trắng'
    };
  }

  if (email && !validateEmail(email)) {
    return {
      valid: false,
      message: 'Email không hợp lệ'
    };
  }

  if (password && !validatePassword(password)) {
    return {
      valid: false,
      message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
    };
  }

  if (phone && !validatePhone(phone)) {
    return {
      valid: false,
      message: 'Số điện thoại không hợp lệ'
    };
  }

  if (gender && !['Nam', 'Nữ', 'Khác'].includes(gender)) {
    return {
      valid: false,
      message: 'Giới tính phải là Nam, Nữ hoặc Khác'
    };
  }

  if (roles && !Array.isArray(roles)) {
    return {
      valid: false,
      message: 'Roles phải là một mảng'
    };
  }

  if (transaction_offices && !Array.isArray(transaction_offices)) {
    return {
      valid: false,
      message: 'Transaction offices phải là một mảng'
    };
  }

  if (position_id) {
    const position = await Position.findByPk(position_id);
    if (!position) {
      return { valid: false, message: 'Chức danh không tồn tại' };
    }
    if (!position.is_active) {
      return { valid: false, message: 'Chức danh đã bị vô hiệu hóa' };
    }
  }

  return { valid: true };
};

/**
 * Check exists (dùng chung)
 */
exports.checkUsernameExists = async (username, excludeUserId = null) => {
  const where = { username };
  if (excludeUserId) where.id = { [Op.ne]: excludeUserId };
  const user = await User.findOne({ where });
  return !!user;
};

exports.checkEmailExists = async (email, excludeUserId = null) => {
  const where = { email };
  if (excludeUserId) where.id = { [Op.ne]: excludeUserId };
  const user = await User.findOne({ where });
  return !!user;
};

/**
 * Format date (dùng chung)
 */
exports.formatDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) return null;

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateOfBirth)) {
    const [day, month, year] = dateOfBirth.split('/');
    return `${year}-${month}-${day}`;
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    return dateOfBirth;
  }
  return null;
};

/**
 * Tạo user
 */
exports.createUser = async (userData) => {
  const {
    username,
    password,
    full_name,
    email,
    phone,
    gender,
    date_of_birth,
    address,
    position_id,
    is_active
  } = userData;

  const hashedPassword = await hashPassword(password);
  const formattedDateOfBirth = this.formatDateOfBirth(date_of_birth);

  const user = await User.create({
    username: validator.escape(username),
    password: hashedPassword,
    full_name: validator.escape(full_name),
    email: email ? validator.normalizeEmail(email) : null,
    phone: phone ? validator.escape(phone) : null,
    gender: gender || null,
    date_of_birth: formattedDateOfBirth,
    address: address || null,
    position_id: position_id || null,
    is_active: is_active !== undefined ? is_active : true,
    login_attempts: 0
  });

  return user;
};

/**
 * Validate và gán roles (dùng chung)
 */
exports.validateAndAssignRoles = async (userId, roleCodes) => {
  if (!roleCodes || !Array.isArray(roleCodes) || roleCodes.length === 0) {
    return { success: true, roles: [] };
  }

  const foundRoles = await Role.findAll({ where: { code: roleCodes } });

  if (foundRoles.length === 0) {
    return {
      success: false,
      message: 'Không tìm thấy role nào với các code đã cung cấp'
    };
  }

  const foundRoleCodes = foundRoles.map(r => r.code);
  const invalidRoles = roleCodes.filter(code => !foundRoleCodes.includes(code));

  if (invalidRoles.length > 0) {
    return {
      success: false,
      message: `Các role không tồn tại: ${invalidRoles.join(', ')}`
    };
  }

  await Promise.all(
    foundRoles.map(role =>
      UserRole.create({
        user_id: userId,
        role_id: role.id
      })
    )
  );

  return {
    success: true,
    roles: foundRoles.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description
    }))
  };
};

/**
 * Validate và gán transaction offices
 */
exports.validateAndAssignTransactionOffices = async (userId, officeCodes) => {
  if (!officeCodes || !Array.isArray(officeCodes) || officeCodes.length === 0) {
    return { success: true, offices: [] };
  }

  const foundOffices = await TransactionOffice.findAll({ 
    where: { code: officeCodes } 
  });

  if (foundOffices.length === 0) {
    return {
      success: false,
      message: 'Không tìm thấy phòng giao dịch nào với các code đã cung cấp'
    };
  }

  const foundOfficeCodes = foundOffices.map(o => o.code);
  const invalidOffices = officeCodes.filter(code => !foundOfficeCodes.includes(code));

  if (invalidOffices.length > 0) {
    return {
      success: false,
      message: `Các phòng giao dịch không tồn tại: ${invalidOffices.join(', ')}`
    };
  }

  // Kiểm tra phòng giao dịch có active không
  const inactiveOffices = foundOffices.filter(o => !o.is_active);
  if (inactiveOffices.length > 0) {
    return {
      success: false,
      message: `Các phòng giao dịch đã bị vô hiệu hóa: ${inactiveOffices.map(o => o.code).join(', ')}`
    };
  }

  // Tạo quan hệ user - transaction office
  // Đánh dấu phòng đầu tiên là primary
  await Promise.all(
    foundOffices.map((office, index) =>
      UserTransactionOffice.create({
        user_id: userId,
        transaction_office_id: office.id,
        is_primary: index === 0 // Phòng đầu tiên là primary
      })
    )
  );

  return {
    success: true,
    offices: foundOffices.map(o => ({
      id: o.id,
      code: o.code,
      name: o.name,
      address: o.address
    }))
  };
};

/**
 * ✅ Lấy user với details (UPDATED - THÊM COUNTER)
 */
exports.getUserWithDetails = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'login_attempts', 'lock_until'] },
    include: [
      {
        model: Role,
        as: 'roles',
        attributes: ['id', 'code', 'name', 'description'],
        through: { attributes: [] }
      },
      {
        model: Position,
        as: 'position',
        attributes: ['id', 'code', 'name', 'description']
      },
      {
        model: Counter,  // ✅ THÊM COUNTER
        as: 'counter',
        attributes: ['id', 'code', 'name', 'counter_number', 'led_board_number', 'transaction_office_id', 'is_active']
      },
      {
        model: TransactionOffice,
        as: 'transaction_offices',
        attributes: ['id', 'code', 'name', 'address', 'district_id', 'latitude', 'longitude'],
        through: { 
          attributes: ['is_primary', 'assigned_at']
        },
        include: [
          {
            model: db.districts,
            as: 'district',
            attributes: ['id', 'code', 'name'],
            include: [
              {
                model: db.provinces,
                as: 'province',
                attributes: ['id', 'code', 'name']
              }
            ]
          }
        ]
      }
    ]
  });

  // ✅ Transform transaction_offices để flatten
  if (user) {
    const userJson = user.toJSON();
    
    if (userJson.transaction_offices && userJson.transaction_offices.length > 0) {
      userJson.transaction_offices = userJson.transaction_offices.map(office => ({
        id: office.id,
        code: office.code,
        name: office.name,
        address: office.address,
        latitude: office.latitude,
        longitude: office.longitude,
        district_id: office.district?.id || null,
        district_code: office.district?.code || null,
        district_name: office.district?.name || null,
        province_id: office.district?.province?.id || null,
        province_code: office.district?.province?.code || null,
        province_name: office.district?.province?.name || null,
      }));
    }
    
    return userJson;
  }
  
  return user;
};

/**
 * ✅ UPDATED V2: Lấy danh sách users với filter linh hoạt (THÊM COUNTER)
 * - Filter để LỌC USER nào được trả về
 * - Nhưng MỖI USER sẽ trả về TẤT CẢ roles và transaction_offices của user đó
 */
exports.findAllUsers = async (filters, pagination) => {
  const { 
    id, 
    username, 
    full_name, 
    email, 
    phone, 
    gender,
    position_code,
    position_id,
    role_code,
    role_id,
    transaction_offices_id,
    transaction_offices_code,
    transaction_offices_province_code,
    transaction_offices_province_id,
    transaction_offices_district_code,
    transaction_offices_district_id,
    is_active 
  } = filters;
  
  const { page = 1, size = 10 } = pagination;

  const currentPage = parseInt(page);
  const pageSize = parseInt(size);
  const offset = (currentPage - 1) * pageSize;

  // ========== ĐIỀU KIỆN CHO BẢNG USER CHÍNH ==========
  let condition = {};
  
  if (id) condition.id = id;
  if (username) condition.username = { [Op.like]: `%${username}%` };
  if (email) condition.email = { [Op.like]: `%${email}%` };
  if (full_name) condition.full_name = { [Op.like]: `%${full_name}%` };
  if (phone !== undefined) condition.phone = { [Op.like]: `%${phone}%` };
  if (gender) condition.gender = gender;
  if (is_active !== undefined) condition.is_active = is_active;

  // ========== BUILD NESTED INCLUDES CHO FILTERING ==========
  
  // ✅ Kiểm tra có filter province không
  const hasProvinceFilter = !!(transaction_offices_province_code || transaction_offices_province_id);
  
  // ✅ Kiểm tra có filter district không
  const hasDistrictFilter = !!(transaction_offices_district_code || transaction_offices_district_id);
  
  // ✅ Include cho Province (để filter)
  const provinceIncludeFilter = {
    model: db.provinces,
    as: 'province',
    attributes: ['id', 'code', 'name'],
    required: false
  };
  
  if (hasProvinceFilter) {
    const provinceWhere = {};
    if (transaction_offices_province_code) {
      provinceWhere.code = transaction_offices_province_code;
    }
    if (transaction_offices_province_id) {
      provinceWhere.id = transaction_offices_province_id;
    }
    provinceIncludeFilter.where = provinceWhere;
    provinceIncludeFilter.required = true; // ✅ INNER JOIN province
  }

  // ✅ Include cho District (để filter)
  const districtIncludeFilter = {
    model: db.districts,
    as: 'district',
    attributes: ['id', 'code', 'name'],
    required: false,
    include: [provinceIncludeFilter]
  };
  
  if (hasDistrictFilter) {
    const districtWhere = {};
    if (transaction_offices_district_code) {
      districtWhere.code = transaction_offices_district_code;
    }
    if (transaction_offices_district_id) {
      districtWhere.id = transaction_offices_district_id;
    }
    districtIncludeFilter.where = districtWhere;
    districtIncludeFilter.required = true; // ✅ INNER JOIN district
  }

  // ✅ CRITICAL: Nếu filter province, district cũng phải required
  // Vì province nested trong district
  if (hasProvinceFilter) {
    districtIncludeFilter.required = true; // ✅ INNER JOIN district khi filter province
  }

  // ========== BUILD MAIN INCLUDES CHO FILTERING ==========
  
  let includeConditionsFilter = [
    // 1. ✅ Roles (để filter user)
    {
      model: db.roles,
      as: 'roles',
      attributes: ['id', 'code', 'name', 'description'],
      through: { attributes: [] },
      required: false
    },
    
    // 2. ✅ Position (để filter user)
    {
      model: db.positions,
      as: 'position',
      attributes: ['id', 'code', 'name', 'description'],
      required: false
    },
    
    // 3. ✅ Transaction Offices (để filter user)
    {
      model: db.transactionOffices,
      as: 'transaction_offices',
      attributes: ['id', 'code', 'name', 'address', 'district_id', 'latitude', 'longitude'],
      through: { attributes: [] },
      required: false,
      include: [districtIncludeFilter]
    }
  ];

  // ========== APPLY FILTERS ==========
  
  // ✅ Filter Role (code HOẶC id) - để lọc USER
  if (role_code || role_id) {
    const roleWhere = {};
    if (role_code) roleWhere.code = role_code;
    if (role_id) roleWhere.id = role_id;
    includeConditionsFilter[0].where = roleWhere;
    includeConditionsFilter[0].required = true;
  }

  // ✅ Filter Position (code HOẶC id) - để lọc USER
  if (position_code || position_id) {
    const positionWhere = {};
    if (position_code) positionWhere.code = position_code;
    if (position_id) positionWhere.id = position_id;
    includeConditionsFilter[1].where = positionWhere;
    includeConditionsFilter[1].required = true;
  }

  // ✅ Filter Transaction Office (code) - để lọc USER
  if (transaction_offices_code || transaction_offices_id) {
    const transactionOfficesWhere = {};
    if (transaction_offices_code) transactionOfficesWhere.code = transaction_offices_code;
    if (transaction_offices_id) transactionOfficesWhere.id = transaction_offices_id;
    includeConditionsFilter[2].where = transactionOfficesWhere;
    includeConditionsFilter[2].required = true;
  }

  // ✅ CRITICAL: Nếu filter theo province hoặc district
  // TransactionOffice PHẢI required để JOIN chain hoạt động
  // User -> TransactionOffice -> District -> Province
  if (hasProvinceFilter || hasDistrictFilter) {
    includeConditionsFilter[2].required = true; // ✅ INNER JOIN transaction_offices
  }

  // ========== QUERY DATABASE - LẤY DANH SÁCH USER IDs ==========
  
  const result = await db.users.findAndCountAll({
    where: condition,
    attributes: ['id'], // ✅ CHỈ LẤY ID để filter
    include: includeConditionsFilter,
    limit: pageSize,
    offset: offset,
    distinct: true,
    subQuery: false,
    order: [['created_at', 'DESC']]
  });

  // ========== NẾU KHÔNG CÓ USER NÀO ==========
  if (result.rows.length === 0) {
    return {
      totalPage: 0,
      pageSize,
      currentPage,
      totalElements: 0,
      data: []
    };
  }

  // ========== LẤY TOÀN BỘ THÔNG TIN CỦA CÁC USER ĐÃ LỌC ==========
  
  const userIds = result.rows.map(user => user.id);
  
  // ✅ Include cho Province (KHÔNG filter - lấy hết)
  const provinceIncludeFull = {
    model: db.provinces,
    as: 'province',
    attributes: ['id', 'code', 'name'],
    required: false
  };

  // ✅ Include cho District (KHÔNG filter - lấy hết)
  const districtIncludeFull = {
    model: db.districts,
    as: 'district',
    attributes: ['id', 'code', 'name'],
    required: false,
    include: [provinceIncludeFull]
  };

  // ✅ Query lại để lấy TOÀN BỘ thông tin
  const usersWithFullData = await db.users.findAll({
    where: { id: { [Op.in]: userIds } },
    attributes: { exclude: ['password', 'login_attempts', 'lock_until'] },
    include: [
      // 1. ✅ TẤT CẢ Roles của user (KHÔNG filter)
      {
        model: db.roles,
        as: 'roles',
        attributes: ['id', 'code', 'name', 'description'],
        through: { attributes: [] },
        required: false
      },
      
      // 2. ✅ Position của user (KHÔNG filter)
      {
        model: db.positions,
        as: 'position',
        attributes: ['id', 'code', 'name', 'description'],
        required: false
      },
      
      // 3. ✅ COUNTER của user (KHÔNG filter)
      {
        model: db.counters,
        as: 'counter',
        attributes: ['id', 'code', 'name', 'counter_number', 'led_board_number', 'transaction_office_id', 'is_active'],
        required: false
      },
      
      // 4. ✅ TẤT CẢ Transaction Offices của user (KHÔNG filter)
      {
        model: db.transactionOffices,
        as: 'transaction_offices',
        attributes: ['id', 'code', 'name', 'address', 'district_id', 'latitude', 'longitude'],
        through: { attributes: [] },
        required: false,
        include: [districtIncludeFull]
      }
    ],
    order: [['created_at', 'DESC']]
  });

  // ========== TRANSFORM DATA (FLATTEN) ==========
  
  const transformedData = usersWithFullData.map(user => {
    const userJson = user.toJSON();
    
    // ✅ Transform TẤT CẢ transaction_offices của user
    const transformedOffices = userJson.transaction_offices?.map(office => ({
      id: office.id,
      code: office.code,
      name: office.name,
      address: office.address,
      latitude: office.latitude,
      longitude: office.longitude,
      district_id: office.district?.id || null,
      district_code: office.district?.code || null,
      district_name: office.district?.name || null,
      province_id: office.district?.province?.id || null,
      province_code: office.district?.province?.code || null,
      province_name: office.district?.province?.name || null
    })) || [];
    
    return {
      id: userJson.id,
      username: userJson.username,
      full_name: userJson.full_name,
      email: userJson.email,
      gender: userJson.gender,
      date_of_birth: userJson.date_of_birth,
      phone: userJson.phone,
      is_active: userJson.is_active,
      created_at: userJson.created_at,
      updated_at: userJson.updated_at,
      position: userJson.position,
      counter: userJson.counter || null,  // ✅ THÊM COUNTER
      roles: userJson.roles, // ✅ TẤT CẢ roles
      transaction_offices: transformedOffices // ✅ TẤT CẢ offices
    };
  });

  return {
    totalPage: Math.ceil(result.count / pageSize),
    pageSize,
    currentPage,
    totalElements: result.count,
    data: transformedData
  };
};

/**
 * Update user
 */
exports.updateUser = async (userId, updateData) => {
  const data = {};

  if (updateData.full_name) {
    data.full_name = validator.escape(updateData.full_name);
  }

  if (updateData.email) {
    if (!validateEmail(updateData.email)) {
      return { success: false, message: 'Email không hợp lệ' };
    }
    if (await this.checkEmailExists(updateData.email, userId)) {
      return { success: false, message: 'Email đã được sử dụng' };
    }
    data.email = validator.normalizeEmail(updateData.email);
  }

  if (updateData.phone) {
    if (!validatePhone(updateData.phone)) {
      return { success: false, message: 'Số điện thoại không hợp lệ' };
    }
    data.phone = validator.escape(updateData.phone);
  }

  if (updateData.address) {
    data.address = validator.escape(updateData.address);
  }

  if (updateData.gender) {
    if (!['Nam', 'Nữ', 'Khác'].includes(updateData.gender)) {
      return { success: false, message: 'Giới tính phải là Nam, Nữ hoặc Khác' };
    }
    data.gender = updateData.gender;
  }

  if (updateData.date_of_birth !== undefined) {
    const formatted = this.formatDateOfBirth(updateData.date_of_birth);
    if (updateData.date_of_birth && !formatted) {
      return {
        success: false,
        message: 'Ngày sinh phải có định dạng DD/MM/YYYY hoặc YYYY-MM-DD'
      };
    }
    data.date_of_birth = formatted;
  }

  if (updateData.position_id !== undefined) {
    if (updateData.position_id) {
      const position = await Position.findByPk(updateData.position_id);
      if (!position) {
        return { success: false, message: 'Chức danh không tồn tại' };
      }
      if (!position.is_active) {
        return { success: false, message: 'Chức danh đã bị vô hiệu hóa' };
      }
      data.position_id = updateData.position_id;
    } else {
      data.position_id = null;
    }
  }

  if (updateData.is_active !== undefined) {
    data.is_active = updateData.is_active;
  }

  await User.update(data, { where: { id: userId } });
  return { success: true };
};

/**
 * Update roles
 */
exports.updateUserRoles = async (userId, roleCodes) => {
  await UserRole.destroy({ where: { user_id: userId } });

  if (roleCodes && roleCodes.length > 0) {
    return await this.validateAndAssignRoles(userId, roleCodes);
  }

  return { success: true };
};

/**
 * Update transaction offices
 */
exports.updateUserTransactionOffices = async (userId, officeCodes) => {
  await UserTransactionOffice.destroy({ where: { user_id: userId } });

  if (officeCodes && officeCodes.length > 0) {
    return await this.validateAndAssignTransactionOffices(userId, officeCodes);
  }

  return { success: true };
};

/**
 * Delete user
 */
exports.deleteUser = async (userId) => {
  const num = await User.destroy({ where: { id: userId } });
  return num === 1;
};

/**
 * Toggle active
 */
exports.toggleActiveStatus = async (ids) => {
  const users = await User.findAll({ where: { id: { [Op.in]: ids } } });

  if (users.length === 0) {
    return { success: false, message: 'Không tìm thấy user nào' };
  }

  const foundIds = users.map(u => u.id);
  const notFoundIds = ids.filter(id => !foundIds.includes(id));

  const results = await Promise.all(
    users.map(async (user) => {
      user.is_active = !user.is_active;
      await user.save();
      return {
        id: user.id,
        username: user.username,
        is_active: user.is_active,
        status: user.is_active ? 'Đã kích hoạt' : 'Đã vô hiệu hóa'
      };
    })
  );

  const activatedCount = results.filter(r => r.is_active).length;
  const deactivatedCount = results.length - activatedCount;

  let message = '';
  if (activatedCount > 0 && deactivatedCount > 0) {
    message = `Đã kích hoạt ${activatedCount} user và vô hiệu hóa ${deactivatedCount} user`;
  } else if (activatedCount > 0) {
    message = `Đã kích hoạt ${activatedCount} user`;
  } else {
    message = `Đã vô hiệu hóa ${deactivatedCount} user`;
  }

  return {
    success: true,
    message,
    data: {
      total: ids.length,
      succeeded: results.length,
      failed: notFoundIds.length,
      results,
      notFound: notFoundIds
    }
  };
};

/**
 * Unlock account
 */
exports.unlockAccount = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    return { success: false, message: 'User không tồn tại' };
  }

  user.login_attempts = 0;
  user.lock_until = null;
  await user.save();

  return {
    success: true,
    data: {
      id: user.id,
      username: user.username,
      login_attempts: user.login_attempts,
      lock_until: user.lock_until
    }
  };
};

// ==========================================
// ✅ COUNTER MANAGEMENT - HÀM RIÊNG BIỆT
// ==========================================

/**
 * Validate counter tồn tại và có thể gán
 */
exports.validateCounterForAssignment = async (counterId, excludeUserId = null) => {
  // Kiểm tra counter tồn tại
  const counter = await Counter.findByPk(counterId);
  
  if (!counter) {
    return {
      valid: false,
      message: 'Quầy không tồn tại'
    };
  }
  
  // Kiểm tra counter có active không
  if (!counter.is_active) {
    return {
      valid: false,
      message: 'Quầy đã bị vô hiệu hóa'
    };
  }
  
  // Kiểm tra counter đã được gán cho user khác chưa
  const whereCondition = { counter_id: counterId };
  if (excludeUserId) {
    whereCondition.id = { [Op.ne]: excludeUserId };
  }
  
  const existingUser = await User.findOne({
    where: whereCondition,
    attributes: ['id', 'username', 'full_name']
  });
  
  if (existingUser) {
    return {
      valid: false,
      message: `Quầy đã được gán cho user "${existingUser.username}" (${existingUser.full_name})`
    };
  }
  
  return { 
    valid: true, 
    counter 
  };
};

/**
 * Cập nhật counter cho user
 */
exports.updateUserCounter = async (userId, counterId) => {
  try {
    // Kiểm tra user tồn tại
    const user = await User.findByPk(userId);
    
    if (!user) {
      return {
        success: false,
        message: 'User không tồn tại'
      };
    }
    
    // Nếu counterId là null => hủy gán counter
    if (counterId === null || counterId === undefined || counterId === '') {
      if (!user.counter_id) {
        return {
          success: false,
          message: 'User chưa được gán quầy nào'
        };
      }
      
      const oldCounterId = user.counter_id;
      user.counter_id = null;
      await user.save();
      
      return {
        success: true,
        message: 'Hủy gán quầy thành công',
        data: {
          user_id: userId,
          old_counter_id: oldCounterId,
          new_counter_id: null
        }
      };
    }
    
    // Nếu có counterId => validate và gán counter
    const validation = await this.validateCounterForAssignment(counterId, userId);
    
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message
      };
    }
    
    // Lưu counter_id cũ để trả về
    const oldCounterId = user.counter_id;
    
    // Cập nhật counter mới
    user.counter_id = counterId;
    await user.save();
    
    return {
      success: true,
      message: oldCounterId 
        ? 'Cập nhật quầy thành công' 
        : 'Gán quầy cho user thành công',
      data: {
        user_id: userId,
        old_counter_id: oldCounterId,
        new_counter_id: counterId
      }
    };
    
  } catch (error) {
    console.error('Update user counter error:', error);
    return {
      success: false,
      message: 'Lỗi khi cập nhật quầy: ' + error.message
    };
  }
};

// ==========================================
// Lấy user theo counter_id (dùng cho quầy gọi số)
// =========================================
exports.getUserByCounterId = async (counterId) => {
  try {
    // Kiểm tra counter_id có hợp lệ không
    if (!counterId) {
      return {
        success: false,
        message: 'counter_id là bắt buộc',
        data: null
      };
    }

    // Kiểm tra counter tồn tại
    const counter = await Counter.findByPk(counterId);
    if (!counter) {
      return {
        success: false,
        message: 'Quầy không tồn tại',
        data: null
      };
    }

    const user = await User.findOne({
      where: { counter_id: counterId },
      attributes: { exclude: ['password', 'login_attempts', 'lock_until'] },
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'code', 'name', 'description'],
          through: { attributes: [] }
        },
        {
          model: Position,
          as: 'position',
          attributes: ['id', 'code', 'name', 'description']
        },
        {
          model: Counter,
          as: 'counter',
          attributes: ['id', 'code', 'name', 'counter_number', 'led_board_number', 'transaction_office_id', 'is_active']
        },
        {
          model: TransactionOffice,
          as: 'transaction_offices',
          attributes: ['id', 'code', 'name', 'address'],
          through: { attributes: [] }
        }
      ]
    });

    if (!user) {
      return {
        success: false,
        message: 'Không tìm thấy nhân viên cho quầy này',
        data: null
      };
    }

    return {
      success: true,
      message: 'Lấy thông tin nhân viên thành công',
      data: user.toJSON()
    };

  } catch (error) {
    console.error('Get user by counter_id error:', error);
    return {
      success: false,
      message: 'Lỗi khi lấy thông tin nhân viên: ' + error.message,
      data: null
    };
  }
};

/**
 * ✅ Lấy user theo counter code (dùng cho quầy gọi số)
 */
exports.getUserByCounterCode = async (counterCode) => {
  try {
    // Kiểm tra counter code có hợp lệ không
    if (!counterCode) {
      return {
        success: false,
        message: 'counter code là bắt buộc',
        data: null
      };
    }

    // Kiểm tra counter tồn tại
    const counter = await Counter.findOne({
      where: { code: counterCode }
    });
    
    if (!counter) {
      return {
        success: false,
        message: 'Quầy không tồn tại',
        data: null
      };
    }

    const user = await User.findOne({
      where: { counter_id: counter.id },
      attributes: { exclude: ['password', 'login_attempts', 'lock_until'] },
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'code', 'name', 'description'],
          through: { attributes: [] }
        },
        {
          model: Position,
          as: 'position',
          attributes: ['id', 'code', 'name', 'description']
        },
        {
          model: Counter,
          as: 'counter',
          attributes: ['id', 'code', 'name', 'counter_number', 'led_board_number', 'transaction_office_id', 'is_active']
        },
        {
          model: TransactionOffice,
          as: 'transaction_offices',
          attributes: ['id', 'code', 'name', 'address'],
          through: { attributes: [] }
        }
      ]
    });

    if (!user) {
      return {
        success: false,
        message: 'Không tìm thấy nhân viên cho quầy này',
        data: null
      };
    }

    return {
      success: true,
      message: 'Lấy thông tin nhân viên thành công',
      data: user.toJSON()
    };

  } catch (error) {
    console.error('Get user by counter code error:', error);
    return {
      success: false,
      message: 'Lỗi khi lấy thông tin nhân viên: ' + error.message,
      data: null
    };
  }
};
