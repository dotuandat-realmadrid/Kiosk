// server/services/api.user_transaction_office.service.js
const db = require("../models");
const UserTransactionOffice = db.userTransactionOffices;
const TransactionOffice = db.transactionOffices;
const User = db.users;
const Province = db.provinces;
const District = db.districts;
const Op = db.Sequelize.Op;

/**
 * Gán người dùng vào phòng giao dịch
 */
exports.assignUserToOffice = async (data) => {
  try {
    const { user_id, transaction_office_id, is_primary } = data;

    // Kiểm tra user tồn tại
    const user = await User.findByPk(user_id);
    if (!user) {
      return {
        success: false,
        message: 'Người dùng không tồn tại'
      };
    }

    // Kiểm tra office tồn tại
    const office = await TransactionOffice.findByPk(transaction_office_id);
    if (!office) {
      return {
        success: false,
        message: 'Phòng giao dịch không tồn tại'
      };
    }

    // Kiểm tra đã được gán chưa
    const existing = await UserTransactionOffice.findOne({
      where: {
        user_id,
        transaction_office_id
      }
    });

    if (existing) {
      return {
        success: false,
        message: 'Người dùng đã được gán vào phòng giao dịch này'
      };
    }

    // Nếu is_primary = true, cập nhật tất cả các gán khác thành false
    if (is_primary) {
      await UserTransactionOffice.update(
        { is_primary: false },
        {
          where: {
            user_id
          }
        }
      );
    }

    const assignment = await UserTransactionOffice.create({
      user_id,
      transaction_office_id,
      is_primary: is_primary || false
    });

    return {
      success: true,
      assignment
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Gán nhiều người dùng vào một phòng giao dịch
 */
exports.assignMultipleUsersToOffice = async (user_ids, transaction_office_id) => {
  try {
    // Kiểm tra office tồn tại
    const office = await TransactionOffice.findByPk(transaction_office_id);
    if (!office) {
      return {
        success: false,
        message: 'Phòng giao dịch không tồn tại'
      };
    }

    let assignedCount = 0;
    let skippedCount = 0;

    for (const user_id of user_ids) {
      // Kiểm tra user tồn tại
      const user = await User.findByPk(user_id);
      if (!user) {
        skippedCount++;
        continue;
      }

      // Kiểm tra đã được gán chưa
      const existing = await UserTransactionOffice.findOne({
        where: {
          user_id,
          transaction_office_id
        }
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      // Tạo gán mới
      await UserTransactionOffice.create({
        user_id,
        transaction_office_id,
        is_primary: false
      });

      assignedCount++;
    }

    return {
      success: true,
      assignedCount,
      skippedCount
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật phòng giao dịch chính cho người dùng
 */
exports.updatePrimaryOffice = async (user_id, transaction_office_id) => {
  try {
    // Kiểm tra assignment tồn tại
    const assignment = await UserTransactionOffice.findOne({
      where: {
        user_id,
        transaction_office_id
      }
    });

    if (!assignment) {
      return {
        success: false,
        message: 'Người dùng chưa được gán vào phòng giao dịch này'
      };
    }

    // Cập nhật tất cả các office khác thành not primary
    await UserTransactionOffice.update(
      { is_primary: false },
      {
        where: {
          user_id
        }
      }
    );

    // Cập nhật office này thành primary
    await assignment.update({ is_primary: true });

    return {
      success: true
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa người dùng khỏi phòng giao dịch
 */
exports.removeUserFromOffice = async (user_id, transaction_office_id) => {
  try {
    const deleted = await UserTransactionOffice.destroy({
      where: {
        user_id,
        transaction_office_id
      }
    });

    if (deleted === 0) {
      return {
        success: false,
        message: 'Không tìm thấy gán này'
      };
    }

    return {
      success: true
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa nhiều người dùng khỏi phòng giao dịch
 */
exports.removeMultipleUsersFromOffice = async (user_ids, transaction_office_id) => {
  try {
    const removedCount = await UserTransactionOffice.destroy({
      where: {
        user_id: {
          [Op.in]: user_ids
        },
        transaction_office_id
      }
    });

    return {
      success: true,
      removedCount
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách người dùng theo phòng giao dịch
 */
exports.getUsersByOffice = async (officeId) => {
  try {
    const assignments = await UserTransactionOffice.findAll({
      where: {
        transaction_office_id: officeId
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'full_name', 'email', 'phone', 'is_active']
      }],
      order: [['is_primary', 'DESC'], ['assigned_at', 'ASC']]
    });

    const users = assignments.map(a => ({
      ...a.user.toJSON(),
      is_primary: a.is_primary,
      assigned_at: a.assigned_at
    }));

    return {
      success: true,
      users
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách phòng giao dịch theo người dùng
 */
exports.getOfficesByUser = async (userId) => {
  try {
    const assignments = await UserTransactionOffice.findAll({
      where: {
        user_id: userId
      },
      include: [{
        model: TransactionOffice,
        as: 'transactionOffice',
        attributes: ['id', 'code', 'name', 'address', 'is_active'],
        include: [
          {
            model: Province,
            as: 'province',
            attributes: ['id', 'code', 'name']
          },
          {
            model: District,
            as: 'district',
            attributes: ['id', 'code', 'name']
          }
        ]
      }],
      order: [['is_primary', 'DESC'], ['assigned_at', 'ASC']]
    });

    const offices = assignments.map(a => ({
      ...a.transactionOffice.toJSON(),
      is_primary: a.is_primary,
      assigned_at: a.assigned_at
    }));

    return {
      success: true,
      offices
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy phòng giao dịch chính của người dùng
 */
exports.getPrimaryOfficeByUser = async (userId) => {
  try {
    const assignment = await UserTransactionOffice.findOne({
      where: {
        user_id: userId,
        is_primary: true
      },
      include: [{
        model: TransactionOffice,
        as: 'transactionOffice',
        attributes: ['id', 'code', 'name', 'address', 'is_active'],
        include: [
          {
            model: Province,
            as: 'province',
            attributes: ['id', 'code', 'name']
          },
          {
            model: District,
            as: 'district',
            attributes: ['id', 'code', 'name']
          }
        ]
      }]
    });

    if (!assignment) {
      return {
        success: false,
        message: 'Người dùng chưa có phòng giao dịch chính'
      };
    }

    return {
      success: true,
      office: {
        ...assignment.transactionOffice.toJSON(),
        assigned_at: assignment.assigned_at
      }
    };
  } catch (error) {
    throw error;
  }
};