// server/controllers/user_role.controller.js
const userRoleService = require('../services/api.user_role.service');

// ==================== ASSIGN SINGLE ROLE ====================
exports.assignRole = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;

    if (!user_id || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id và role_id là bắt buộc'
      });
    }

    // Check user exists
    if (!await userRoleService.checkUserExists(user_id)) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Check role exists
    if (!await userRoleService.checkRoleExists(role_id)) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role'
      });
    }

    // Check assignment exists
    if (await userRoleService.checkAssignmentExists(user_id, role_id)) {
      return res.status(409).json({
        success: false,
        message: 'User đã có role này rồi'
      });
    }

    // Assign
    const result = await userRoleService.assignRole(user_id, role_id);

    res.status(201).json({
      success: true,
      message: 'Gán role cho user thành công',
      data: result
    });

  } catch (err) {
    console.error('Assign role error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};

// ==================== ASSIGN MULTIPLE ROLES (REPLACE) ====================
exports.assignRoles = async (req, res) => {
  try {
    const user_id = req.params.userId;
    const { roleIds } = req.body;

    if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'roleIds phải là một mảng và không được rỗng'
      });
    }

    // Check user exists
    if (!await userRoleService.checkUserExists(user_id)) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Assign roles
    const result = await userRoleService.assignRoles(user_id, roleIds);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật roles cho user thành công',
      data: result.data
    });

  } catch (err) {
    console.error('Assign roles error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};

// ==================== ADD ROLES (KEEP EXISTING) ====================
exports.addRoles = async (req, res) => {
  try {
    const user_id = req.params.userId;
    const { roleIds } = req.body;

    if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'roleIds phải là một mảng và không được rỗng'
      });
    }

    // Check user exists
    if (!await userRoleService.checkUserExists(user_id)) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Add roles
    const result = await userRoleService.addRoles(user_id, roleIds);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.status(201).json({
      success: true,
      message: `Đã thêm ${result.data.newRolesAdded} role mới cho user (${result.data.existingRoles} role đã tồn tại)`,
      data: result.data
    });

  } catch (err) {
    console.error('Add roles error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};

// ==================== REMOVE SINGLE ROLE ====================
exports.removeRole = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;

    if (!user_id || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id và role_id là bắt buộc'
      });
    }

    const removed = await userRoleService.removeRole(user_id, role_id);

    if (removed) {
      res.json({
        success: true,
        message: 'Xóa role khỏi user thành công'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy assignment này'
      });
    }

  } catch (err) {
    console.error('Remove role error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};

// ==================== REMOVE MULTIPLE ROLES ====================
exports.removeRoles = async (req, res) => {
  try {
    const user_id = req.params.userId;
    const { roleIds } = req.body;

    if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'roleIds phải là một mảng và không được rỗng'
      });
    }

    const num = await userRoleService.removeRoles(user_id, roleIds);

    res.json({
      success: true,
      message: `Đã xóa ${num} role khỏi user`
    });

  } catch (err) {
    console.error('Remove roles error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};

// ==================== GET USER ROLES ====================
exports.getUserRoles = async (req, res) => {
  try {
    const user_id = req.params.userId;

    const result = await userRoleService.getUserRoles(user_id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error('Get user roles error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};

// ==================== CHECK USER HAS ROLE ====================
exports.checkUserRole = async (req, res) => {
  try {
    const { userId, roleId } = req.params;

    const result = await userRoleService.checkUserHasRole(userId, roleId);

    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error('Check user role error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};

// ==================== GET USERS BY ROLE ====================
exports.getUsersByRole = async (req, res) => {
  try {
    const role_id = req.params.roleId;

    const result = await userRoleService.getUsersByRole(role_id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role'
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error('Get users by role error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};

// ==================== GET ALL ASSIGNMENTS ====================
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await userRoleService.getAllAssignments();

    res.json({
      success: true,
      count: assignments.length,
      data: assignments
    });

  } catch (err) {
    console.error('Get all assignments error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};