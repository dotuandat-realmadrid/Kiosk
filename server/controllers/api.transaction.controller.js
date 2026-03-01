// ==========================================
// server/controllers/api.transaction.controller.js
// ==========================================
const transactionService = require('../services/api.transaction.service');

// ==========================================
// CREATE
// ==========================================

/**
 * POST /api/transactions
 * Body: ticket_type, service_id, cccd_info_backup_id
 *       [print_date, print_time, user_id, counter_id, status, wait_status, call_time, end_time]
 */
exports.create = async (req, res) => {
  try {
    console.log('🔍 [API] Create Transaction request');

    const validation = transactionService.validateFields(req.body);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const fkValidation = await transactionService.validateForeignKeys(req.body);
    if (!fkValidation.valid) {
      return res.status(404).json({ success: false, message: fkValidation.message });
    }

    const transaction = await transactionService.createTransaction(req.body);

    console.log('✅ [API] Transaction created with ID:', transaction.id);

    transactionService.broadcastEvent('new-transaction', {
      id:          transaction.id,
      ticket_code: transaction.ticket_code,
      status:      transaction.status
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo transaction thành công',
      data:    transaction
    });

  } catch (error) {
    console.error('❌ [API] Create transaction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==========================================
// READ ALL
// ==========================================

/**
 * GET /api/transactions
 * Query: ticket_code, ticket_type, status, wait_status,
 *        service_id, user_id, counter_id, cccd_info_backup_id,
 *        print_date | (print_date_from + print_date_to),
 *        position_id, position_code,
 *        transaction_office_id, transaction_office_code,
 *        page, size
 */
exports.findAll = async (req, res) => {
  try {
    const {
      ticket_code, ticket_type, status, wait_status,
      service_id, user_id, counter_id, cccd_info_backup_id,
      print_date, print_date_from, print_date_to,
      position_id, position_code,
      transaction_office_id, transaction_office_code,
      page, size
    } = req.query;

    const result = await transactionService.findAllTransactions(
      {
        ticket_code, ticket_type, status, wait_status,
        service_id, user_id, counter_id, cccd_info_backup_id,
        print_date, print_date_from, print_date_to,
        position_id, position_code,
        transaction_office_id, transaction_office_code
      },
      { page, size }
    );

    return res.json({ success: true, ...result });

  } catch (error) {
    console.error('❌ [API] Find all transactions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==========================================
// READ ONE
// ==========================================

/** GET /api/transactions/:id */
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 [API] GET Transaction by ID: ${id}`);

    const transaction = await transactionService.getTransactionById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy transaction với id=${id}`
      });
    }

    return res.json({ success: true, data: transaction });

  } catch (error) {
    console.error('❌ [API] Find one transaction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==========================================
// READ LATEST
// ==========================================

/** GET /api/transactions/latest */
exports.getLatest = async (req, res) => {
  try {
    console.log('🔍 [API] GET Latest transaction');

    const transaction = await transactionService.getLatestTransaction();

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
    }

    return res.json({ success: true, data: transaction });

  } catch (error) {
    console.error('❌ [API] Get latest transaction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==========================================
// UPDATE
// ==========================================

/**
 * PUT /api/transactions/:id
 * Các trường được phép update: call_time, wait_status, end_time, status, user_id, counter_id
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 [API] UPDATE Transaction ID: ${id}`);

    const validation = transactionService.validateFields(req.body, true);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    if (req.body.user_id || req.body.counter_id) {
      const fkValidation = await transactionService.validateForeignKeys(req.body);
      if (!fkValidation.valid) {
        return res.status(404).json({ success: false, message: fkValidation.message });
      }
    }

    const existing = await transactionService.getTransactionById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy transaction với id=${id}`
      });
    }

    const result = await transactionService.updateTransaction(id, req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    const updated = await transactionService.getTransactionById(id);

    transactionService.broadcastEvent('update-transaction', {
      id,
      status: updated.status
    });

    return res.json({
      success: true,
      message: 'Cập nhật transaction thành công',
      data:    updated
    });

  } catch (error) {
    console.error('❌ [API] Update transaction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==========================================
// DELETE
// ==========================================

/** DELETE /api/transactions/:id */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 [API] DELETE Transaction ID: ${id}`);

    const deleted = await transactionService.deleteTransaction(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy transaction với id=${id}`
      });
    }

    return res.json({ success: true, message: 'Xóa transaction thành công' });

  } catch (error) {
    console.error('❌ [API] Delete transaction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/** PATCH /api/transactions/:id/soft-delete */
exports.softDelete = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await transactionService.softDeleteTransaction(id);
    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }

    return res.json({ success: true, message: 'Đánh dấu xóa transaction thành công' });

  } catch (error) {
    console.error('❌ [API] Soft delete transaction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi soft delete transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==========================================
// STATUS MANAGEMENT
// ==========================================

/**
 * PATCH /api/transactions/:id/status
 *
 * Body:
 *   status (bắt buộc): waiting | serving | completed | cancelled
 *
 *   Khi status = "serving":
 *     - call_time (optional, mặc định giờ hiện tại)
 *     - user_id   (optional)
 *     - counter_id (optional)
 *
 *   Khi status = "completed" | "cancelled":
 *     - end_time (optional, mặc định giờ hiện tại)
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...extraData } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp status' });
    }

    const result = await transactionService.updateStatus(id, status, extraData);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    console.log(`✅ [API] Transaction ${id} → "${status}"`);

    transactionService.broadcastEvent('status-changed', {
      id,
      status,
      ticket_code: result.data?.ticket_code
    });

    return res.json({
      success: true,
      message: `Cập nhật trạng thái thành "${status}" thành công`,
      data:    result.data
    });

  } catch (error) {
    console.error('❌ [API] Update status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==========================================
// STATISTICS
// ==========================================

/** GET /api/transactions/stats?date=YYYY-MM-DD */
exports.getStats = async (req, res) => {
  try {
    const { date } = req.query;
    const stats = await transactionService.getStatsByDate(date);
    return res.json({ success: true, data: stats });

  } catch (error) {
    console.error('❌ [API] Get stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/** GET /api/transactions/waiting?service_id=uuid */
exports.getWaiting = async (req, res) => {
  try {
    const { service_id } = req.query;
    const transactions = await transactionService.getWaitingTransactions(service_id);

    return res.json({
      success: true,
      count: transactions.length,
      data:  transactions
    });

  } catch (error) {
    console.error('❌ [API] Get waiting transactions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách chờ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==========================================
// TRANSACTIONS THEO USER
// ==========================================

/** GET /api/transactions/user/:userId/active */
exports.getActiveByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔍 [API] GET active transactions for user: ${userId}`);

    const result = await transactionService.getActiveTransactionsByUser(userId);

    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }

    return res.json({
      success: true,
      user_counter_id: result.user_counter_id,
      count: result.data.length,
      data:  result.data
    });

  } catch (error) {
    console.error('❌ [API] Get active transactions by user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy giao dịch đang xử lý',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/** GET /api/transactions/user/:userId/cancelled */
exports.getCancelledByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔍 [API] GET cancelled transactions for user: ${userId}`);

    const result = await transactionService.getCancelledTransactionsByUser(userId);

    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }

    return res.json({
      success: true,
      user_counter_id: result.user_counter_id,
      count: result.data.length,
      data:  result.data
    });

  } catch (error) {
    console.error('❌ [API] Get cancelled transactions by user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy giao dịch đã hủy',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};