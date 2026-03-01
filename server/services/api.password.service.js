// server/services/password.service.js
const db = require("../models");
const User = db.users;
const InvalidatedToken = db.invalidatedTokens;

const {
  validatePassword,
  hashPassword,
  verifyPassword
} = require("../utils/auth.util");

/**
 * Đặt mật khẩu lần đầu
 */
exports.setPassword = async (userId, password) => {
  const user = await User.findByPk(userId);

  if (!user) {
    return { success: false, code: 1002, message: 'User không tồn tại' };
  }

  if (user.password) {
    return {
      success: false,
      code: 1003,
      message: 'User đã có mật khẩu. Vui lòng sử dụng chức năng đổi mật khẩu'
    };
  }

  if (!validatePassword(password)) {
    return {
      success: false,
      code: 1004,
      message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
    };
  }

  user.password = await hashPassword(password);
  await user.save();

  return { success: true, code: 1000 };
};

/**
 * Đổi mật khẩu
 */
exports.changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findByPk(userId);

  if (!user) {
    return { success: false, code: 1002, message: 'User không tồn tại' };
  }

  if (!user.password) {
    return {
      success: false,
      code: 1003,
      message: 'User chưa có mật khẩu. Vui lòng đặt mật khẩu trước'
    };
  }

  const isValidPassword = await verifyPassword(oldPassword, user.password);
  if (!isValidPassword) {
    return { success: false, code: 1005, message: 'Mật khẩu cũ không đúng' };
  }

  const isSamePassword = await verifyPassword(newPassword, user.password);
  if (isSamePassword) {
    return {
      success: false,
      code: 1006,
      message: 'Mật khẩu mới phải khác mật khẩu cũ'
    };
  }

  if (!validatePassword(newPassword)) {
    return {
      success: false,
      code: 1004,
      message: 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
    };
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  return { success: true, code: 1000 };
};

/**
 * Reset mật khẩu về mặc định (admin only)
 */
exports.resetPassword = async (userId, adminId, defaultPassword = '12345678') => {
  const user = await User.findByPk(userId);

  if (!user) {
    return { success: false, code: 1002, message: 'User không tồn tại' };
  }

  if (parseInt(user.id) === parseInt(adminId)) {
    return {
      success: false,
      code: 1007,
      message: 'Không thể reset mật khẩu của chính bạn'
    };
  }

  user.password = await hashPassword(defaultPassword);
  user.login_attempts = 0;
  user.lock_until = null;
  await user.save();

  // Vô hiệu hóa tất cả tokens
  await InvalidatedToken.update(
    { is_valid: false },
    { where: { user_id: user.id, is_valid: true } }
  );

  return {
    success: true,
    code: 1000,
    data: {
      userId: user.id,
      username: user.username,
      defaultPassword
    }
  };
};

/**
 * Kiểm tra user có mật khẩu chưa
 */
exports.checkHasPassword = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'username', 'password']
  });

  if (!user) {
    return { success: false, code: 1002, message: 'User không tồn tại' };
  }

  return {
    success: true,
    code: 1000,
    hasPassword: !!user.password
  };
};