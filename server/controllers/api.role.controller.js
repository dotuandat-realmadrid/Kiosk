// server/controllers/role.controller.js
const roleService = require('../services/api.role.service');

// ==================== CREATE ROLE ====================
exports.create = async (req, res) => {
  try {
    const { code, name, description, is_active } = req.body;

    // Validate
    const validation = roleService.validateRoleData({ code, name });
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Check code exists
    if (await roleService.checkCodeExists(code)) {
      return res.status(409).json({
        success: false,
        message: 'Mã vai trò đã tồn tại'
      });
    }

    // Check name exists
    if (await roleService.checkNameExists(name)) {
      return res.status(409).json({
        success: false,
        message: 'Tên vai trò đã tồn tại'
      });
    }

    // Create role
    const newRole = await roleService.createRole({ code, name, description, is_active });

    res.status(201).json({
      success: true,
      message: 'Tạo vai trò thành công',
      data: newRole
    });

  } catch (error) {
    console.error("Create role error:", error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// ==================== FIND ALL ROLES ====================
exports.findAll = async (req, res) => {
  try {
    const { code, name, is_active } = req.query;

    const roles = await roleService.findAllRoles({ code, name, is_active });

    res.json({
      success: true,
      data: roles
    });

  } catch (err) {
    console.error("Find all roles error:", err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};

// ==================== FIND ONE ROLE ====================
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    const role = await roleService.findRoleById(id, true);

    if (role) {
      res.json({
        success: true,
        data: role
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò với id=' + id
      });
    }

  } catch (err) {
    console.error("Find one role error:", err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};

// ==================== FIND BY CODE ====================
exports.findByCode = async (req, res) => {
  try {
    const code = req.params.code;

    const role = await roleService.findRoleByCode(code, true);

    if (role) {
      res.json({
        success: true,
        data: role
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò với code=' + code
      });
    }

  } catch (err) {
    console.error("Find role by code error:", err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};

// ==================== UPDATE ROLE ====================
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { code, name, description, is_active } = req.body;

    // Validate if provided
    if (code || name) {
      const validation = roleService.validateRoleData({ code, name }, true);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message
        });
      }
    }

    // Check code exists
    if (code && await roleService.checkCodeExists(code, id)) {
      return res.status(409).json({
        success: false,
        message: 'Mã vai trò đã tồn tại'
      });
    }

    // Check name exists
    if (name && await roleService.checkNameExists(name, id)) {
      return res.status(409).json({
        success: false,
        message: 'Tên vai trò đã tồn tại'
      });
    }

    // Update
    const updated = await roleService.updateRole(id, { code, name, description, is_active });

    if (updated) {
      const updatedRole = await roleService.findRoleById(id);
      res.json({
        success: true,
        message: 'Cập nhật vai trò thành công',
        data: updatedRole
      });
    } else {
      res.status(404).json({
        success: false,
        message: `Không thể cập nhật vai trò với id=${id}. Vai trò không tồn tại!`
      });
    }

  } catch (err) {
    console.error("Update role error:", err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};

// ==================== DELETE ROLE ====================
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await roleService.deleteRole(id, false);

    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }

  } catch (err) {
    console.error("Delete role error:", err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};

// ==================== FORCE DELETE ROLE ====================
exports.forceDelete = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await roleService.deleteRole(id, true);

    if (result.success) {
      res.json({
        success: true,
        message: 'Xóa vai trò thành công (bao gồm cả các liên kết với users)'
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }

  } catch (err) {
    console.error("Force delete role error:", err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};



// Delete all Roles from the database
exports.deleteAll = async (req, res) => {
  try {
    const nums = await Role.destroy({
      where: {},
      truncate: false
    });

    res.json({
      success: true,
      message: `${nums} vai trò đã được xóa thành công!`
    });

  } catch (err) {
    console.error("Delete all roles error:", err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};

// ==================== GET USERS BY ROLE ====================
exports.getUsersByRole = async (req, res) => {
  try {
    const roleId = req.params.roleId;

    const result = await roleService.getUsersByRole(roleId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Vai trò không tồn tại'
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

// ==================== TOGGLE ACTIVE ====================
exports.toggleActive = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await roleService.toggleActiveStatus(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json(result);

  } catch (err) {
    console.error('Toggle role active error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + err.message
    });
  }
};