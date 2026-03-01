// server/services/user_role.service.js
const db = require("../models");
const UserRole = db.userRoles;
const User = db.users;
const Role = db.roles;

/**
 * Gán single role
 */
exports.assignRole = async (userId, roleId) => {
  const userRole = await UserRole.create({
    user_id: userId,
    role_id: roleId
  });

  const user = await User.findByPk(userId);
  const role = await Role.findByPk(roleId);

  return {
    id: userRole.id,
    user_id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: {
      code: role.code,
      name: role.name
    }
  };
};

/**
 * Gán multiple roles (replace)
 */
exports.assignRoles = async (userId, roleIds) => {
  const roles = await Role.findAll({ where: { id: roleIds } });

  if (roles.length !== roleIds.length) {
    return { success: false, message: 'Một hoặc nhiều role không tồn tại' };
  }

  await UserRole.destroy({ where: { user_id: userId } });

  await Promise.all(
    roles.map(role =>
      UserRole.create({
        user_id: userId,
        role_id: role.id
      })
    )
  );

  const user = await User.findByPk(userId);

  return {
    success: true,
    data: {
      user_id: user.id,
      username: user.username,
      full_name: user.full_name,
      roles: roles.map(r => ({
        code: r.code,
        name: r.name,
        description: r.description
      }))
    }
  };
};

/**
 * Thêm roles (keep existing)
 */
exports.addRoles = async (userId, roleIds) => {
  const roles = await Role.findAll({ where: { id: roleIds } });

  if (roles.length === 0) {
    return { success: false, message: 'Không tìm thấy role nào' };
  }

  const existingAssignments = await UserRole.findAll({
    where: { user_id: userId, role_id: roleIds }
  });

  const existingRoleIds = existingAssignments.map(a => a.role_id);
  const newRoleIds = roleIds.filter(id => !existingRoleIds.includes(id));

  const assignments = await Promise.all(
    newRoleIds.map(role_id =>
      UserRole.create({ user_id: userId, role_id })
    )
  );

  const user = await User.findByPk(userId);

  return {
    success: true,
    data: {
      user_id: user.id,
      username: user.username,
      full_name: user.full_name,
      newRolesAdded: assignments.length,
      existingRoles: existingRoleIds.length
    }
  };
};

/**
 * Xóa role
 */
exports.removeRole = async (userId, roleId) => {
  const num = await UserRole.destroy({
    where: { user_id: userId, role_id: roleId }
  });
  return num === 1;
};

/**
 * Xóa roles
 */
exports.removeRoles = async (userId, roleIds) => {
  return await UserRole.destroy({
    where: { user_id: userId, role_id: roleIds }
  });
};

/**
 * Lấy roles của user
 */
exports.getUserRoles = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'login_attempts', 'lock_until'] },
    include: [{
      model: Role,
      as: 'roles',
      attributes: ['id', 'code', 'name', 'description', 'is_active'],
      through: { attributes: [] }
    }]
  });

  if (!user) return null;

  return {
    user_id: user.id,
    username: user.username,
    full_name: user.full_name,
    email: user.email,
    is_active: user.is_active,
    totalRoles: user.roles.length,
    roles: user.roles
  };
};

/**
 * Check user có role không
 */
exports.checkUserHasRole = async (userId, roleId) => {
  const userRole = await UserRole.findOne({
    where: { user_id: userId, role_id: roleId }
  });

  return {
    user_id: userId,
    role_id: roleId,
    hasRole: !!userRole
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
      attributes: { exclude: ['password', 'login_attempts', 'lock_until'] },
      through: { attributes: [] }
    }]
  });

  if (!role) return null;

  return {
    role_id: role.id,
    role_code: role.code,
    role_name: role.name,
    description: role.description,
    totalUsers: role.users.length,
    users: role.users
  };
};

/**
 * Lấy tất cả assignments
 */
exports.getAllAssignments = async () => {
  return await UserRole.findAll({
    include: [
      {
        model: User,
        as: 'users',
        attributes: ['id', 'username', 'full_name', 'email', 'is_active']
      },
      {
        model: Role,
        as: 'roles',
        attributes: ['id', 'code', 'name', 'description', 'is_active']
      }
    ]
  });
};

/**
 * Check exists
 */
exports.checkUserExists = async (userId) => {
  const user = await User.findByPk(userId);
  return !!user;
};

exports.checkRoleExists = async (roleId) => {
  const role = await Role.findByPk(roleId);
  return !!role;
};

exports.checkAssignmentExists = async (userId, roleId) => {
  const assignment = await UserRole.findOne({
    where: { user_id: userId, role_id: roleId }
  });
  return !!assignment;
};