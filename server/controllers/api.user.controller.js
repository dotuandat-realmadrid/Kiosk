// ==========================================
// server/controllers/user.controller.js (UPDATED - THÊM COUNTER)
// ==========================================
const userService = require('../services/api.user.service');

// ==================== CREATE USER ====================
exports.create = async (req, res) => {
  try {
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
      roles,
      transaction_offices,
      is_active
    } = req.body;

    // Validate
    const validation = await userService.validateUserData(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Check username exists
    if (await userService.checkUsernameExists(username)) {
      return res.status(409).json({
        success: false,
        message: 'Username đã tồn tại'
      });
    }

    // Check email exists
    if (await userService.checkEmailExists(email)) {
      return res.status(409).json({
        success: false,
        message: 'Email đã được đăng ký'
      });
    }

    // Create user
    const user = await userService.createUser({
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
    });

    // Assign roles
    if (roles && Array.isArray(roles) && roles.length > 0) {
      const roleResult = await userService.validateAndAssignRoles(user.id, roles);
      if (!roleResult.success) {
        await user.destroy();
        return res.status(404).json({
          success: false,
          message: roleResult.message
        });
      }
    }

    // Assign transaction offices
    if (transaction_offices && Array.isArray(transaction_offices) && transaction_offices.length > 0) {
      const officeResult = await userService.validateAndAssignTransactionOffices(user.id, transaction_offices);
      if (!officeResult.success) {
        await user.destroy();
        return res.status(404).json({
          success: false,
          message: officeResult.message
        });
      }
    }

    // Fetch user with details
    const userWithDetails = await userService.getUserWithDetails(user.id);

    res.status(201).json({
      success: true,
      message: 'Tạo user thành công',
      data: userWithDetails
    });

  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi tạo user"
    });
  }
};

// ==================== FIND ALL USERS ====================
exports.findAll = async (req, res) => {
  try {
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
      is_active,
      page, 
      size 
    } = req.query;

    const result = await userService.findAllUsers(
      { 
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
      },
      { page, size }
    );

    res.json({
      success: true,
      ...result
    });

  } catch (err) {
    console.error('Find all users error:', err);
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi lấy danh sách users"
    });
  }
};

// ==================== FIND ONE USER ====================
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await userService.getUserWithDetails(id);

    if (user) {
      res.json({
        success: true,
        data: user
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy user với id=" + id
      });
    }

  } catch (err) {
    console.error('Find one user error:', err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin user với id=" + req.params.id
    });
  }
};

// ==================== GET MY INFO ====================
exports.getMyInfo = async (req, res) => {
  try {
    const user = await userService.getUserWithDetails(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User không tồn tại'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// ==================== UPDATE USER ====================
exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    // Không cho phép update password, login_attempts, lock_until, username
    const {
      password,
      login_attempts,
      lock_until,
      username,
      roles,
      transaction_offices,
      ...allowedFields
    } = req.body;

    // Check user exists
    const user = await userService.getUserWithDetails(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User không tồn tại'
      });
    }

    // Update user info
    const updateResult = await userService.updateUser(id, allowedFields);
    if (!updateResult.success) {
      return res.status(400).json({
        success: false,
        message: updateResult.message
      });
    }

    // Update roles if provided
    if (roles !== undefined) {
      if (!Array.isArray(roles)) {
        return res.status(400).json({
          success: false,
          message: 'Roles phải là một mảng'
        });
      }

      const roleResult = await userService.updateUserRoles(id, roles);
      if (!roleResult.success) {
        return res.status(404).json({
          success: false,
          message: roleResult.message
        });
      }
    }

    // Update transaction offices if provided
    if (transaction_offices !== undefined) {
      if (!Array.isArray(transaction_offices)) {
        return res.status(400).json({
          success: false,
          message: 'Transaction offices phải là một mảng'
        });
      }

      const officeResult = await userService.updateUserTransactionOffices(id, transaction_offices);
      if (!officeResult.success) {
        return res.status(404).json({
          success: false,
          message: officeResult.message
        });
      }
    }

    // Fetch updated user
    const updatedUser = await userService.getUserWithDetails(id);

    res.json({
      success: true,
      message: "Cập nhật user thành công",
      data: updatedUser
    });

  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật user với id=" + req.params.id
    });
  }
};

// ==================== DELETE USER ====================
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await userService.deleteUser(id);

    if (deleted) {
      res.json({
        success: true,
        message: "Xóa user thành công!"
      });
    } else {
      res.status(404).json({
        success: false,
        message: `Không thể xóa user với id=${id}. User không tồn tại!`
      });
    }

  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({
      success: false,
      message: "Không thể xóa user với id=" + req.params.id
    });
  }
};

// ==================== FIND ALL ACTIVE USERS ====================
exports.findAllActive = async (req, res) => {
  try {
    const result = await userService.findAllUsers(
      { is_active: true },
      { page: 1, size: 1000 }
    );

    res.json({
      success: true,
      count: result.totalElements,
      data: result.data
    });

  } catch (err) {
    console.error('Find active users error:', err);
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi lấy danh sách users đang hoạt động"
    });
  }
};

// ==================== TOGGLE ACTIVE STATUS ====================
exports.toggleActive = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID users'
      });
    }

    const result = await userService.toggleActiveStatus(ids);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json(result);

  } catch (err) {
    console.error('Toggle user active error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};

// ==================== UNLOCK ACCOUNT ====================
exports.unlockAccount = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await userService.unlockAccount(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Mở khóa tài khoản thành công',
      data: result.data
    });

  } catch (err) {
    console.error('Unlock account error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};

// ==========================================
// ✅ COUNTER MANAGEMENT - ENDPOINT RIÊNG BIỆT
// ==========================================

/**
 * Cập nhật counter cho user
 * PUT /api/users/:id/counter
 * Body: 
 * - { "counter_id": "uuid" } => Gán counter mới
 * - { "counter_id": null } => Hủy gán counter
 */
exports.updateCounter = async (req, res) => {
  try {
    const userId = req.params.id;
    const { counter_id } = req.body;
    
    // Validate input
    if (counter_id === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp counter_id (có thể là UUID hoặc null)'
      });
    }
    
    // Cập nhật counter
    const result = await userService.updateUserCounter(userId, counter_id);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    // Lấy thông tin user đầy đủ sau khi cập nhật
    const updatedUser = await userService.getUserWithDetails(userId);
    
    res.json({
      success: true,
      message: result.message,
      data: updatedUser
    });
    
  } catch (error) {
    console.error('Update counter error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

/**
 * Lấy user theo counter_id
 * GET /api/users/counter/:counterId
 */
exports.getUserByCounterId = async (req, res) => {
  try {
    const { counterId } = req.params;

    const result = await userService.getUserByCounterId(counterId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Controller - Get user by counter_id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message,
      data: null
    });
  }
};

/**
 * Lấy user theo counter code
 * GET /api/users/counter-code/:counterCode
 */
exports.getUserByCounterCode = async (req, res) => {
  try {
    const { counterCode } = req.params;

    const result = await userService.getUserByCounterCode(counterCode);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Controller - Get user by counter code error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message,
      data: null
    });
  }
};