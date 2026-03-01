// server/services/auth.service.js
const db = require("../models");
const User = db.users;
const Role = db.roles;
const UserRole = db.userRoles;
const InvalidatedToken = db.invalidatedTokens;
const jwt = require('jsonwebtoken');
const validator = require('validator');

const {
  validatePassword,
  validatePhone,
  hashPassword,
  verifyPassword,
  generateAccessToken,
  JWT_SECRET
} = require("../utils/auth.util");

const userService = require('./api.user.service');

/**
 * Đăng ký user mới
 */
exports.registerUser = async (userData) => {
  const { username, password, full_name, phone, roles } = userData;

  try {
    // Validate username (3-30 characters, alphanumeric and underscore only)
    if (!/^[^\s]{3,30}$/.test(username)) {
      return {
        valid: false,
        message: 'Username phải từ 3-30 ký tự và không được chứa khoảng trắng'
      };
    }

    // Validate password
    if (!validatePassword(password)) {
      return {
        valid: false,
        message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
      };
    }

    // Validate phone if provided
    if (phone && !validatePhone(phone)) {
      return {
        valid: false,
        message: 'Số điện thoại không hợp lệ'
      };
    }

    // Validate roles if provided
    if (roles && !Array.isArray(roles)) {
      return {
        valid: false,
        message: 'Roles phải là một mảng'
      };
    }

    // Check if username exists - dùng userService
    if (await userService.checkUsernameExists(username)) {
      return {
        valid: false,
        message: 'Username đã tồn tại'
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      username: validator.escape(username),
      password: hashedPassword,
      full_name: validator.escape(full_name),
      phone: phone ? validator.escape(phone) : null,
      is_active: true,
      login_attempts: 0
    });

    // Gán roles nếu có - dùng userService
    let assignedRoles = [];
    
    if (roles && Array.isArray(roles) && roles.length > 0) {
      const roleResult = await userService.validateAndAssignRoles(user.id, roles);
      if (!roleResult.success) {
        await user.destroy();
        return {
          valid: false,
          message: roleResult.message
        };
      }
      assignedRoles = roleResult.roles;
    }

    return {
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        phone: user.phone,
        is_active: user.is_active,
        roles: assignedRoles
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Đăng nhập
 */
exports.login = async (username, password) => {
  try {
    // Tìm user với roles
    const user = await User.findOne({
      where: { username },
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['id', 'code', 'name', 'description'],
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return {
        success: false,
        message: 'Username hoặc password không đúng'
      };
    }

    // Check account locked
    if (user.lock_until && user.lock_until > new Date()) {
      const minutesLeft = Math.ceil((user.lock_until - new Date()) / 60000);
      return {
        success: false,
        locked: true,
        message: `Tài khoản bị khóa tạm thời. Vui lòng thử lại sau ${minutesLeft} phút`
      };
    }

    // Check account active
    if (!user.is_active) {
      return {
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa'
      };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      user.login_attempts += 1;
      if (user.login_attempts >= 5) {
        user.lock_until = new Date(Date.now() + 30 * 60 * 1000);
      }
      await user.save();

      return {
        success: false,
        message: 'Username hoặc password không đúng',
        attemptsLeft: user.login_attempts >= 5 ? 0 : 5 - user.login_attempts
      };
    }

    // Reset login attempts
    user.login_attempts = 0;
    user.lock_until = null;
    await user.save();

    // Tạo access token
    const accessToken = generateAccessToken(
      user.id,
      user.username,
      user.roles.map(r => r.code)
    );

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        is_active: user.is_active,
        roles: user.roles || []
      },
      token: accessToken
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Verify token (introspect)
 */
exports.verifyToken = async (token) => {
  try {
    // Check blacklist
    const blacklisted = await InvalidatedToken.findOne({
      where: { 
        token: token,
        is_valid: false 
      }
    });

    if (blacklisted) {
      return { 
        valid: false, 
        message: 'Token đã bị vô hiệu hóa' 
      };
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return { 
          valid: false, 
          message: 'Token đã hết hạn', 
          expired: true 
        };
      }
      return { 
        valid: false, 
        message: 'Token không hợp lệ' 
      };
    }

    // Kiểm tra type của token
    if (decoded.type !== 'access') {
      return { 
        valid: false, 
        message: 'Loại token không hợp lệ' 
      };
    }

    // Kiểm tra user còn tồn tại và active
    const user = await User.findByPk(decoded.user_id);

    if (!user) {
      return { 
        valid: false, 
        message: 'User không tồn tại' 
      };
    }

    if (!user.is_active) {
      return { 
        valid: false, 
        message: 'Tài khoản đã bị vô hiệu hóa' 
      };
    }

    // Kiểm tra tài khoản có bị khóa
    if (user.lock_until && user.lock_until > new Date()) {
      return {
        valid: false,
        message: 'Tài khoản đang bị khóa',
        locked: true,
        lock_until: user.lock_until
      };
    }

    return {
      valid: true,
      decoded
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Refresh token
 */
exports.refreshToken = async (token) => {
  try {
    // Kiểm tra token có bị blacklist
    const blacklisted = await InvalidatedToken.findOne({
      where: { 
        token: token,
        is_valid: false 
      }
    });

    if (blacklisted) {
      return {
        success: false,
        message: 'Token đã bị vô hiệu hóa. Vui lòng đăng nhập lại'
      };
    }

    // Verify token cũ
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return {
          success: false,
          expired: true,
          message: 'Token đã hết hạn. Vui lòng đăng nhập lại'
        };
      }
      return {
        success: false,
        message: 'Token không hợp lệ'
      };
    }

    if (decoded.type !== 'access') {
      return {
        success: false,
        message: 'Token không hợp lệ'
      };
    }

    // Kiểm tra user còn tồn tại và active
    const user = await User.findByPk(decoded.user_id);
    if (!user || !user.is_active) {
      return {
        success: false,
        message: 'User không tồn tại hoặc đã bị vô hiệu hóa'
      };
    }

    // Vô hiệu hóa token cũ
    const expired_at = new Date(decoded.exp * 1000);
    await InvalidatedToken.create({
      token: token,
      user_id: decoded.user_id,
      expired_at: expired_at,
      is_valid: false
    });

    // Tạo access token mới
    const newToken = generateAccessToken(decoded.user_id, decoded.username, decoded.roles);

    return {
      success: true,
      newToken
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Logout - vô hiệu hóa token
 */
exports.logout = async (token) => {
  try {
    // Decode token để lấy thời gian hết hạn
    const decoded = jwt.decode(token);
    
    if (!decoded || !decoded.exp) {
      return {
        success: false,
        message: 'Token không hợp lệ'
      };
    }

    // Thêm token vào blacklist
    const expired_at = new Date(decoded.exp * 1000);

    await InvalidatedToken.create({
      token: token,
      user_id: decoded.user_id,
      expired_at: expired_at,
      is_valid: false
    });

    return {
      success: true
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Đổi mật khẩu
 */
exports.changePassword = async (userId, currentPassword, newPassword, currentToken) => {
  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return {
        success: false,
        notFound: true,
        message: 'User không tồn tại'
      };
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password);

    if (!isValidPassword) {
      return {
        success: false,
        message: 'Mật khẩu hiện tại không đúng'
      };
    }

    // Validate new password
    if (!validatePassword(newPassword)) {
      return {
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
      };
    }

    // Hash new password
    user.password = await hashPassword(newPassword);
    await user.save();

    // Vô hiệu hóa token hiện tại nếu có
    if (currentToken) {
      const decoded = jwt.decode(currentToken);
      const expired_at = new Date(decoded.exp * 1000);

      await InvalidatedToken.create({
        token: currentToken,
        user_id: user.id,
        expired_at: expired_at,
        is_valid: false
      });
    }

    return {
      success: true
    };
  } catch (error) {
    throw error;
  }
};