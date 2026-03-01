// server/controllers/api.auth.controller.js
const authService = require('../services/api.auth.service');

// ĐĂNG KÝ
exports.register = async (req, res) => {
  try {
    const { username, password, full_name, phone, roles } = req.body;

    // Validate required fields
    if (!username || !password || !full_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'username, password và full_name là bắt buộc' 
      });
    }

    // Gọi service để đăng ký
    const result = await authService.registerUser({
      username,
      password,
      full_name,
      phone,
      roles
    });

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công. Vui lòng đăng nhập để tiếp tục',
      data: result.user
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
};

// ĐĂNG NHẬP
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng nhập username và password' 
      });
    }

    // Gọi service để đăng nhập
    const result = await authService.login(username, password);

    if (!result.success) {
      if (result.locked) {
        return res.status(423).json({
          success: false,
          message: result.message
        });
      }

      return res.status(401).json({
        success: false,
        message: result.message,
        attemptsLeft: result.attemptsLeft
      });
    }

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: result.user
      },
      token: result.token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
};

// KIỂM TRA TOKEN HỢP LỆ (INTROSPECT)
exports.introspect = async (req, res) => {
  try {
    // Lấy token từ body hoặc header
    let token = req.body.token;
    
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(200).json({ 
        code: 1001,
        message: 'Không tìm thấy token',
        result: {
          valid: false
        }
      });
    }

    // Gọi service để verify token
    const result = await authService.verifyToken(token);

    if (!result.valid) {
      return res.status(200).json({
        code: 1002,
        message: result.message,
        result: {
          valid: false,
          expired: result.expired,
          locked: result.locked,
          lock_until: result.lock_until
        }
      });
    }

    // Token hợp lệ - Trả về cả roles
    res.status(200).json({
      code: 1000,
      message: 'Token hợp lệ',
      result: {
        valid: true,
        user_id: result.decoded.user_id,
        roles: result.decoded.roles, // Thêm roles vào đây
        exp: result.decoded.exp,
        iat: result.decoded.iat
      }
    });

  } catch (error) {
    console.error('Introspect error:', error);
    res.status(500).json({ 
      code: 5000,
      message: 'Lỗi server: ' + error.message,
      result: {
        valid: false
      }
    });
  }
};

// LÀM MỚI TOKEN
exports.refreshToken = async (req, res) => {
  try {
    // Lấy token từ body hoặc header
    let token = req.body.token;
    
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Không có token để làm mới' 
      });
    }

    // Gọi service để refresh token
    const result = await authService.refreshToken(token);

    if (!result.success) {
      const statusCode = result.expired ? 401 : 403;
      return res.status(statusCode).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Làm mới token thành công!',
      data: {
        refreshToken: result.newToken
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
};

// ĐĂNG XUẤT
exports.logout = async (req, res) => {
  try {
    // Lấy token từ body hoặc header
    let token = req.body.token;
    
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không tìm thấy token để đăng xuất' 
      });
    }

    // Gọi service để logout
    const result = await authService.logout(token);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Đăng xuất thành công. Token đã bị vô hiệu hóa'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
};

// ĐỔI MẬT KHẨU
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng nhập đầy đủ thông tin' 
      });
    }

    // Lấy token hiện tại
    const authHeader = req.headers['authorization'];
    const currentToken = authHeader && authHeader.split(' ')[1];

    // Gọi service để đổi mật khẩu
    const result = await authService.changePassword(
      req.userId, 
      currentPassword, 
      newPassword, 
      currentToken, 
    );

    if (!result.success) {
      const statusCode = result.notFound ? 404 : 401;
      return res.status(statusCode).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại với mật khẩu mới'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
};