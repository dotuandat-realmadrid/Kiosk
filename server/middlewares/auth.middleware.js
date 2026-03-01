// server/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const db = require('../models');
const InvalidatedToken = db.invalidatedTokens;
const User = db.users;
const Role = db.roles;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware xác thực token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Không có token xác thực' 
      });
    }

    // Kiểm tra token có bị blacklist không
    const blacklistedToken = await InvalidatedToken.findOne({
      where: { 
        token: token,
        is_valid: false
      }
    });

    if (blacklistedToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token đã bị vô hiệu hóa. Vui lòng đăng nhập lại' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type !== 'access') {
      return res.status(403).json({ 
        success: false, 
        message: 'Token không hợp lệ' 
      });
    }

    // Lưu thông tin user vào request
    req.userId = decoded.user_id;
    req.username = decoded.username;
    req.userRoles = decoded.roles || [];
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token đã hết hạn. Vui lòng đăng nhập lại' 
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Token không hợp lệ' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi xác thực token' 
    });
  }
};

// Middleware kiểm tra role (chấp nhận một role)
const checkRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!req.userRoles) {
        return res.status(401).json({
          success: false,
          message: 'Chưa xác thực người dùng'
        });
      }

      const hasRole = req.userRoles.includes(requiredRole);

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message: `Bạn không có quyền truy cập. Yêu cầu role: ${requiredRole}`
        });
      }

      next();
    } catch (error) {
      console.error('Check role error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra quyền truy cập'
      });
    }
  };
};

// Middleware kiểm tra nhiều roles (chỉ cần có 1 trong các role)
const checkAnyRole = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Cấu hình role không hợp lệ'
        });
      }

      if (!req.userRoles) {
        return res.status(401).json({
          success: false,
          message: 'Chưa xác thực người dùng'
        });
      }

      const hasAnyRole = requiredRoles.some(role => req.userRoles.includes(role));

      if (!hasAnyRole) {
        return res.status(403).json({
          success: false,
          message: `Bạn không có quyền truy cập. Yêu cầu một trong các role: ${requiredRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Check any role error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra quyền truy cập'
      });
    }
  };
};

// Middleware kiểm tra nhiều roles (phải có tất cả các role)
const checkAllRoles = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Cấu hình role không hợp lệ'
        });
      }

      if (!req.userRoles) {
        return res.status(401).json({
          success: false,
          message: 'Chưa xác thực người dùng'
        });
      }

      const hasAllRoles = requiredRoles.every(role => req.userRoles.includes(role));

      if (!hasAllRoles) {
        return res.status(403).json({
          success: false,
          message: `Bạn không có đủ quyền truy cập. Yêu cầu tất cả các role: ${requiredRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Check all roles error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra quyền truy cập'
      });
    }
  };
};

// Middleware kiểm tra quyền owner (chỉ owner mới được truy cập)
const checkOwner = (userIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceUserId = req.params[userIdParam] || req.body[userIdParam];
      
      if (!resourceUserId) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy thông tin người dùng'
        });
      }

      // Admin có thể truy cập mọi tài nguyên
      if (req.userRoles && req.userRoles.includes('ADMIN')) {
        return next();
      }

      // ✅ SỬA: So sánh UUID strings, không dùng parseInt
      if (resourceUserId !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập tài nguyên này'
        });
      }

      next();
    } catch (error) {
      console.error('Check owner error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra quyền sở hữu'
      });
    }
  };
};

// Middleware làm mới thông tin roles từ database (khi cần cập nhật realtime)
const refreshRoles = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực người dùng'
      });
    }

    // Lấy roles mới nhất từ database
    const user = await User.findByPk(req.userId, {
      include: [{
        model: Role,
        as: 'roles', // ✅ ĐÃ ĐÚNG theo index.js
        attributes: ['code'],
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    // Cập nhật roles mới
    req.userRoles = user.roles.map(r => r.code);
    
    next();
  } catch (error) {
    console.error('Refresh roles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật thông tin quyền'
    });
  }
};

module.exports = { 
  authenticateToken,
  checkRole,
  checkAnyRole,
  checkAllRoles,
  checkOwner,
  refreshRoles
};