// server/services/role.service.js
const db = require("../models");
const Role = db.roles;
const User = db.users;
const UserRole = db.userRoles;
const Op = db.Sequelize.Op;
const validator = require('validator');

/**
 * Validate dữ liệu role
 */
exports.validateRoleData = (data, isUpdate = false) => {
  const { code, name } = data;

  if (!isUpdate && (!code || !name)) {
    return {
      valid: false,
      message: 'Mã vai trò (code) và tên vai trò (name) là bắt buộc'
    };
  }

  if (code && !/^[a-zA-Z0-9_-]{2,50}$/.test(code)) {
    return {
      valid: false,
      message: 'Mã vai trò phải từ 2-50 ký tự và chỉ chứa chữ, số, gạch dưới, gạch ngang'
    };
  }

  if (name && (name.length < 3 || name.length > 100)) {
    return {
      valid: false,
      message: 'Tên vai trò phải từ 3-100 ký tự'
    };
  }

  return { valid: true };
};

/**
 * Check exists
 */
exports.checkCodeExists = async (code, excludeRoleId = null) => {
  const where = { code: code.toUpperCase() };
  if (excludeRoleId) where.id = { [Op.ne]: excludeRoleId };
  const role = await Role.findOne({ where });
  return !!role;
};

exports.checkNameExists = async (name, excludeRoleId = null) => {
  const where = { name };
  if (excludeRoleId) where.id = { [Op.ne]: excludeRoleId };
  const role = await Role.findOne({ where });
  return !!role;
};

/**
 * Tạo role
 */
exports.createRole = async (data) => {
  const { code, name, description, is_active } = data;

  return await Role.create({
    code: validator.escape(code),
    name: validator.escape(name),
    description: description ? validator.escape(description) : null,
    is_active: is_active !== undefined ? is_active : true
  });
};

/**
 * Lấy roles
 */
exports.findAllRoles = async (filters) => {
  const { code, name, is_active } = filters;
  let condition = {};

  if (code) condition.code = { [Op.like]: `%${code.toUpperCase()}%` };
  if (name) condition.name = { [Op.like]: `%${name}%` };
  if (is_active !== undefined) condition.is_active = is_active === 'true';

  return await Role.findAll({
    where: condition,
    attributes: ['id', 'code', 'name', 'description']
  });
};

/**
 * Lấy role theo ID
 */
exports.findRoleById = async (roleId, includeUsers = false) => {
  const options = {};
  if (includeUsers) {
    options.include = [{
      model: User,
      as: 'users',
      attributes: ['id', 'username', 'full_name', 'email', 'is_active'],
      through: { attributes: [] }
    }];
  }
  return await Role.findByPk(roleId, options);
};

/**
 * Lấy role theo code
 */
exports.findRoleByCode = async (code, includeUsers = false) => {
  const options = { where: { code: code.toUpperCase() } };
  if (includeUsers) {
    options.include = [{
      model: User,
      as: 'users',
      attributes: ['id', 'username', 'full_name', 'email', 'is_active'],
      through: { attributes: [] }
    }];
  }
  return await Role.findOne(options);
};

/**
 * Update role
 */
exports.updateRole = async (roleId, updateData) => {
  const data = {};

  if (updateData.code) data.code = validator.escape(updateData.code);
  if (updateData.name) data.name = validator.escape(updateData.name);
  if (updateData.description !== undefined) {
    data.description = updateData.description ? validator.escape(updateData.description) : null;
  }
  if (updateData.is_active !== undefined) data.is_active = updateData.is_active;

  const [num] = await Role.update(data, { where: { id: roleId } });
  return num === 1;
};

/**
 * Check role đang được sử dụng
 */
exports.isRoleInUse = async (roleId) => {
  const count = await UserRole.count({ where: { role_id: roleId } });
  return { inUse: count > 0, count };
};

/**
 * Delete role
 */
exports.deleteRole = async (roleId, force = false) => {
  if (!force) {
    const { inUse, count } = await this.isRoleInUse(roleId);
    if (inUse) {
      return {
        success: false,
        message: `Không thể xóa vai trò này vì đang có ${count} user sử dụng. Vui lòng xóa hoặc chuyển các user sang vai trò khác trước.`
      };
    }
  }

  const num = await Role.destroy({ where: { id: roleId } });
  return {
    success: num === 1,
    message: num === 1 ? 'Xóa vai trò thành công' : 'Vai trò không tồn tại'
  };
};

/**
 * Lấy users theo role
 */
exports.getUsersByRole = async (roleId) => {
  const role = await Role.findByPk(roleId, {
    include: [{
      model: User,
      as: 'users',
      attributes: ['id', 'username', 'full_name', 'email', 'is_active', 'phone', 'address'],
      through: { attributes: [] }
    }]
  });

  if (!role) return null;

  return {
    roleId: role.id,
    roleCode: role.code,
    roleName: role.name,
    description: role.description,
    isActive: role.is_active,
    totalUsers: role.users.length,
    users: role.users
  };
};

/**
 * Toggle active
 */
exports.toggleActiveStatus = async (roleId) => {
  const role = await Role.findByPk(roleId);

  if (!role) {
    return { success: false, message: 'Vai trò không tồn tại' };
  }

  role.is_active = !role.is_active;
  await role.save();

  return {
    success: true,
    message: `Vai trò đã được ${role.is_active ? 'kích hoạt' : 'vô hiệu hóa'}`,
    data: role
  };
};