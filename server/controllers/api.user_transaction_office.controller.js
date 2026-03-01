// server/controllers/api.user_transaction_office.controller.js
const userTransactionOfficeService = require('../services/api.user_transaction_office.service');

// GÁN NGƯỜI DÙNG VÀO PHÒNG GIAO DỊCH
exports.assignUserToOffice = async (req, res) => {
  try {
    const { user_id, transaction_office_id, is_primary } = req.body;

    if (!user_id || !transaction_office_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID và Transaction Office ID là bắt buộc'
      });
    }

    const result = await userTransactionOfficeService.assignUserToOffice({
      user_id,
      transaction_office_id,
      is_primary
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Gán người dùng vào phòng giao dịch thành công',
      data: result.assignment
    });

  } catch (error) {
    console.error('Assign user to office error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// GÁN NHIỀU NGƯỜI DÙNG VÀO MỘT PHÒNG GIAO DỊCH
exports.assignMultipleUsersToOffice = async (req, res) => {
  try {
    const { user_ids, transaction_office_id } = req.body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách User IDs là bắt buộc'
      });
    }

    if (!transaction_office_id) {
      return res.status(400).json({
        success: false,
        message: 'Transaction Office ID là bắt buộc'
      });
    }

    const result = await userTransactionOfficeService.assignMultipleUsersToOffice(user_ids, transaction_office_id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(201).json({
      success: true,
      message: `Đã gán ${result.assignedCount} người dùng vào phòng giao dịch`,
      assignedCount: result.assignedCount,
      skippedCount: result.skippedCount
    });

  } catch (error) {
    console.error('Assign multiple users to office error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// CẬP NHẬT TRẠNG THÁI PRIMARY
exports.updatePrimaryOffice = async (req, res) => {
  try {
    const { user_id, transaction_office_id } = req.body;

    if (!user_id || !transaction_office_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID và Transaction Office ID là bắt buộc'
      });
    }

    const result = await userTransactionOfficeService.updatePrimaryOffice(user_id, transaction_office_id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật phòng giao dịch chính thành công'
    });

  } catch (error) {
    console.error('Update primary office error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// XÓA NGƯỜI DÙNG KHỎI PHÒNG GIAO DỊCH
exports.removeUserFromOffice = async (req, res) => {
  try {
    const { user_id, transaction_office_id } = req.body;

    if (!user_id || !transaction_office_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID và Transaction Office ID là bắt buộc'
      });
    }

    const result = await userTransactionOfficeService.removeUserFromOffice(user_id, transaction_office_id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Xóa người dùng khỏi phòng giao dịch thành công'
    });

  } catch (error) {
    console.error('Remove user from office error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// XÓA NHIỀU NGƯỜI DÙNG KHỎI PHÒNG GIAO DỊCH
exports.removeMultipleUsersFromOffice = async (req, res) => {
  try {
    const { user_ids, transaction_office_id } = req.body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách User IDs là bắt buộc'
      });
    }

    if (!transaction_office_id) {
      return res.status(400).json({
        success: false,
        message: 'Transaction Office ID là bắt buộc'
      });
    }

    const result = await userTransactionOfficeService.removeMultipleUsersFromOffice(user_ids, transaction_office_id);

    res.json({
      success: true,
      message: `Đã xóa ${result.removedCount} người dùng khỏi phòng giao dịch`,
      removedCount: result.removedCount
    });

  } catch (error) {
    console.error('Remove multiple users from office error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// LẤY DANH SÁCH NGƯỜI DÙNG THEO PHÒNG GIAO DỊCH
exports.getUsersByOffice = async (req, res) => {
  try {
    const { officeId } = req.params;

    const result = await userTransactionOfficeService.getUsersByOffice(officeId);

    res.json({
      success: true,
      message: 'Lấy danh sách người dùng theo phòng giao dịch thành công',
      data: result.users
    });

  } catch (error) {
    console.error('Get users by office error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// LẤY DANH SÁCH PHÒNG GIAO DỊCH THEO NGƯỜI DÙNG
exports.getOfficesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await userTransactionOfficeService.getOfficesByUser(userId);

    res.json({
      success: true,
      message: 'Lấy danh sách phòng giao dịch theo người dùng thành công',
      data: result.offices
    });

  } catch (error) {
    console.error('Get offices by user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// LẤY PHÒNG GIAO DỊCH CHÍNH CỦA NGƯỜI DÙNG
exports.getPrimaryOfficeByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await userTransactionOfficeService.getPrimaryOfficeByUser(userId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Lấy phòng giao dịch chính thành công',
      data: result.office
    });

  } catch (error) {
    console.error('Get primary office by user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};