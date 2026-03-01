// server/controllers/api.password.controller.js
const passwordService = require('../services/api.password.service');
const authService = require('../services/api.auth.service');

// ĐặT MẬT KHẨU LẦN ĐẦU
exports.setPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.userId;

    if (!password) {
      return res.status(400).json({
        code: 1001,
        success: false,
        message: 'Vui lòng nhập mật khẩu'
      });
    }

    const result = await passwordService.setPassword(userId, password);

    if (!result.success) {
      return res.status(result.code === 1002 ? 404 : 400).json(result);
    }

    res.json({
      code: 1000,
      success: true,
      message: 'Đặt mật khẩu thành công'
    });

  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({
      code: 5000,
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// ĐỔI MẬT KHẨU
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId;
    const currentToken = req.token;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        code: 1001,
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    const result = await passwordService.changePassword(userId, oldPassword, newPassword);

    if (!result.success) {
      const statusCode = result.code === 1002 ? 404 : result.code === 1005 ? 401 : 400;
      return res.status(statusCode).json(result);
    }

    // Vô hiệu hóa token hiện tại
    if (currentToken) {
      await authService.invalidateToken(currentToken, userId);
    }

    res.json({
      code: 1000,
      success: true,
      message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      code: 5000,
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// RESET MẬT KHẨU (ADMIN)
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.userId;

    const result = await passwordService.resetPassword(id, adminId);

    if (!result.success) {
      const statusCode = result.code === 1002 ? 404 : 400;
      return res.status(statusCode).json(result);
    }

    res.json({
      code: 1000,
      success: true,
      message: `Reset mật khẩu thành công. Mật khẩu mới: ${result.data.defaultPassword}`,
      data: result.data
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      code: 5000,
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// KIỂM TRA USER CÓ MẬT KHẨU CHƯA
exports.hasPassword = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await passwordService.checkHasPassword(userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({
      code: 1000,
      success: true,
      data: {
        hasPassword: result.hasPassword
      }
    });

  } catch (error) {
    console.error('Check password error:', error);
    res.status(500).json({
      code: 5000,
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};