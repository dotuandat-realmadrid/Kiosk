// ==========================================
// server/services/api.transaction.service.js
// ==========================================
const db = require("../models");
const Transaction = db.transactions;
const Service = db.services;
const User = db.users;
const Counter = db.counters;
const CCCDInfoBackup = db.cccdInfoBackup;
const TicketFormat = db.ticketFormats;
const Op = db.Sequelize.Op;

// ==========================================
// CONSTANTS
// ==========================================

const VALID_STATUSES      = ['waiting', 'serving', 'completed', 'cancelled'];
const VALID_WAIT_STATUSES = ['normal', 'long', 'overdue'];
const VALID_TICKET_TYPES  = ['Offline', 'Online', 'Appointment'];

// ==========================================
// VALIDATION
// ==========================================

exports.validateFields = (reqBody, isUpdate = false) => {
  if (!reqBody || Object.keys(reqBody).length === 0) {
    return { valid: false, message: 'Body request không được rỗng' };
  }

  if (!isUpdate) {
    const requiredFields = ['ticket_type', 'service_id', 'cccd_info_backup_id'];
    const missingFields = requiredFields.filter(f => !reqBody[f]);
    if (missingFields.length > 0) {
      return { valid: false, message: `Thiếu thông tin bắt buộc: ${missingFields.join(', ')}` };
    }
  }

  if (reqBody.status && !VALID_STATUSES.includes(reqBody.status)) {
    return {
      valid: false,
      message: `Trạng thái không hợp lệ. Chỉ chấp nhận: ${VALID_STATUSES.join(', ')}`
    };
  }

  if (reqBody.wait_status && !VALID_WAIT_STATUSES.includes(reqBody.wait_status)) {
    return {
      valid: false,
      message: `Trạng thái chờ không hợp lệ. Chỉ chấp nhận: ${VALID_WAIT_STATUSES.join(', ')}`
    };
  }

  if (reqBody.ticket_type && !VALID_TICKET_TYPES.includes(reqBody.ticket_type)) {
    return {
      valid: false,
      message: `Loại vé không hợp lệ. Chỉ chấp nhận: ${VALID_TICKET_TYPES.join(', ')}`
    };
  }

  if (reqBody.print_date && !/^\d{4}-\d{2}-\d{2}$/.test(reqBody.print_date)) {
    return { valid: false, message: 'print_date phải có định dạng YYYY-MM-DD' };
  }

  return { valid: true };
};

exports.validateForeignKeys = async (data) => {
  const { service_id, user_id, counter_id, cccd_info_backup_id } = data;

  if (service_id) {
    const service = await Service.findByPk(service_id);
    if (!service) return { valid: false, message: 'Dịch vụ không tồn tại' };
  }

  if (user_id) {
    const user = await User.findByPk(user_id);
    if (!user)           return { valid: false, message: 'Nhân viên không tồn tại' };
    if (!user.is_active) return { valid: false, message: 'Nhân viên đã bị vô hiệu hóa' };
  }

  if (counter_id) {
    const counter = await Counter.findByPk(counter_id);
    if (!counter)           return { valid: false, message: 'Quầy không tồn tại' };
    if (!counter.is_active) return { valid: false, message: 'Quầy đã bị vô hiệu hóa' };
  }

  if (cccd_info_backup_id) {
    const cccd = await CCCDInfoBackup.findByPk(cccd_info_backup_id);
    if (!cccd) return { valid: false, message: 'Thông tin CCCD không tồn tại' };
  }

  return { valid: true };
};

// ==========================================
// HELPERS (private)
// ==========================================

const buildFullInclude = () => [
  {
    model: Service,
    as: 'service',
    attributes: ['id', 'code', 'name_vi', 'name_en', 'format_id'],
    required: false
  },
  {
    model: User,
    as: 'user',
    attributes: ['id', 'username', 'full_name', 'email', 'phone'],
    required: false,
    include: [
      {
        model: db.positions,
        as: 'position',
        attributes: ['id', 'code', 'name'],
        required: false
      },
      {
        model: db.transactionOffices,
        as: 'transaction_offices',
        attributes: ['id', 'code', 'name'],
        through: { attributes: [] },
        required: false
      }
    ]
  },
  {
    model: Counter,
    as: 'counter',
    attributes: ['id', 'code', 'name', 'counter_number', 'led_board_number'],
    required: false
  },
  {
    model: CCCDInfoBackup,
    as: 'cccd_info',
    required: false
  }
];

const getCurrentTimeStr = () => new Date().toTimeString().slice(0, 8);

// ==========================================
// WEBSOCKET
// ==========================================

exports.broadcastEvent = (eventType, data) => {
  if (!global.wss) {
    console.warn('⚠️ [WS] WebSocket server not available');
    return 0;
  }

  const wsData = JSON.stringify({ type: eventType, data });
  let clientCount = 0;

  global.wss.clients.forEach((client) => {
    // ✅ Chỉ gửi tới client đang OPEN (bỏ check kioskRoom vì dashboard cũng cần nhận)
    if (client.readyState === 1) {
      client.send(wsData);
      clientCount++;
    }
  });

  if (clientCount > 0) {
    console.log(`📡 [WS] Broadcasted "${eventType}" to ${clientCount} client(s)`);
  }

  return clientCount;
};

// ==========================================
// CRUD
// ==========================================

const generateTicketCode = async (serviceId, printDate) => {
  const service = await Service.findByPk(serviceId, {
    include: [{
      model: TicketFormat,
      as: 'ticket_format',
      attributes: ['id', 'format_pattern', 'start_number', 'max_number']
    }]
  });

  if (!service)               throw new Error('Dịch vụ không tồn tại');
  if (!service.ticket_format) throw new Error('Dịch vụ chưa được cấu hình định dạng vé (format_id)');

  const { format_pattern, start_number, max_number } = service.ticket_format;

  const countToday = await Transaction.count({
    where: { service_id: serviceId, print_date: printDate }
  });

  const nextNumber = start_number + countToday;

  if (nextNumber > max_number) {
    throw new Error(`Đã đạt số vé tối đa trong ngày (${max_number}) cho dịch vụ này`);
  }

  const ticket_code = format_pattern.replace(/%0?(\d*)d/, (match, width) => {
    return width ? String(nextNumber).padStart(parseInt(width), '0') : String(nextNumber);
  });

  return ticket_code;
};

/**
 * Tạo transaction mới
 */
exports.createTransaction = async (reqBody) => {
  const now = new Date();
  const printDate = reqBody.print_date || now.toISOString().slice(0, 10);
  const printTime = reqBody.print_time || now.toTimeString().slice(0, 8);

  const ticket_code = await generateTicketCode(reqBody.service_id, printDate);

  const transaction = await Transaction.create({
    ticket_code,
    ticket_type:         reqBody.ticket_type,
    print_date:          printDate,
    print_time:          printTime,
    call_time:           reqBody.call_time   || null,
    wait_status:         reqBody.wait_status || null,
    end_time:            reqBody.end_time    || null,
    status:              reqBody.status      || 'waiting',
    service_id:          reqBody.service_id,
    user_id:             reqBody.user_id             || null,
    counter_id:          reqBody.counter_id          || null,
    cccd_info_backup_id: reqBody.cccd_info_backup_id,
    thumbnail_base64:    reqBody.thumbnail_base64    || null,
    dtime: 0,
    mtime: 0
  });

  return transaction;
};

exports.getTransactionById = async (id) => {
  return await Transaction.findByPk(id, { include: buildFullInclude() });
};

exports.getLatestTransaction = async () => {
  return await Transaction.findOne({
    include: buildFullInclude(),
    order: [['created_at', 'DESC']]
  });
};

/**
 * Lấy danh sách transactions với filter và pagination
 */
exports.findAllTransactions = async (filters, pagination) => {
  const {
    ticket_code, ticket_type, status, wait_status,
    service_id, user_id, counter_id, cccd_info_backup_id,
    print_date, print_date_from, print_date_to,
    position_id, position_code,
    transaction_office_id, transaction_office_code
  } = filters;

  const { page = 1, size = 10 } = pagination;
  const currentPage = parseInt(page);
  const pageSize    = parseInt(size);
  const offset      = (currentPage - 1) * pageSize;

  const condition = {};

  if (ticket_code)         condition.ticket_code         = { [Op.like]: `%${ticket_code}%` };
  if (ticket_type)         condition.ticket_type         = ticket_type;
  if (status)              condition.status              = status;
  if (wait_status)         condition.wait_status         = wait_status;
  if (service_id)          condition.service_id          = service_id;
  if (user_id)             condition.user_id             = user_id;
  if (counter_id)          condition.counter_id          = counter_id;
  if (cccd_info_backup_id) condition.cccd_info_backup_id = cccd_info_backup_id;

  if (print_date) {
    condition.print_date = print_date;
  } else if (print_date_from || print_date_to) {
    condition.print_date = {};
    if (print_date_from) condition.print_date[Op.gte] = print_date_from;
    if (print_date_to)   condition.print_date[Op.lte] = print_date_to;
  }

  const hasPositionFilter          = !!(position_id || position_code);
  const hasTransactionOfficeFilter = !!(transaction_office_id || transaction_office_code);
  const hasUserFilter              = hasPositionFilter || hasTransactionOfficeFilter;

  const positionInclude = {
    model: db.positions,
    as: 'position',
    attributes: ['id', 'code', 'name'],
    required: false
  };
  if (hasPositionFilter) {
    const posWhere = {};
    if (position_id)   posWhere.id   = position_id;
    if (position_code) posWhere.code = position_code;
    positionInclude.where    = posWhere;
    positionInclude.required = true;
  }

  const transactionOfficeInclude = {
    model: db.transactionOffices,
    as: 'transaction_offices',
    attributes: ['id', 'code', 'name'],
    through: { attributes: [] },
    required: false
  };
  if (hasTransactionOfficeFilter) {
    const offWhere = {};
    if (transaction_office_id)   offWhere.id   = transaction_office_id;
    if (transaction_office_code) offWhere.code = transaction_office_code;
    transactionOfficeInclude.where    = offWhere;
    transactionOfficeInclude.required = true;
  }

  const userInclude = {
    model: User,
    as: 'user',
    attributes: ['id', 'username', 'full_name', 'email', 'phone'],
    required: hasUserFilter,
    include: [positionInclude, transactionOfficeInclude]
  };

  const includeWithFilter = [
    {
      model: Service,
      as: 'service',
      attributes: ['id', 'code', 'name_vi', 'name_en', 'format_id'],
      required: false
    },
    userInclude,
    {
      model: Counter,
      as: 'counter',
      attributes: ['id', 'code', 'name', 'counter_number', 'led_board_number'],
      required: false
    },
    {
      model: CCCDInfoBackup,
      as: 'cccd_info',
      required: false
    }
  ];

  const result = await Transaction.findAndCountAll({
    where:    condition,
    include:  includeWithFilter,
    limit:    pageSize,
    offset,
    distinct: true,
    subQuery: false,
    order: [['print_date', 'DESC'], ['print_time', 'DESC']]
  });

  return {
    totalPage:     Math.ceil(result.count / pageSize),
    pageSize,
    currentPage,
    totalElements: result.count,
    data:          result.rows
  };
};

/**
 * Cập nhật transaction
 * Các trường được phép update: call_time, wait_status, end_time,
 * status, user_id, counter_id, service_id
 */
exports.updateTransaction = async (id, updateData) => {
  const ALLOWED_FIELDS = [
    'call_time',
    'wait_status',
    'end_time',
    'status',
    'user_id',
    'counter_id',
    'service_id'       // <–– cho phép thay đổi dịch vụ
  ];

  const data = {};
  ALLOWED_FIELDS.forEach(field => {
    if (updateData[field] !== undefined) data[field] = updateData[field];
  });

  if (Object.keys(data).length === 0) {
    return { success: false, message: 'Không có trường hợp lệ để cập nhật' };
  }

  // Nếu có service_id, kiểm tra tồn tại (một lớp bảo vệ nữa, mặc dù
  // controller thường đã gọi validateForeignKeys)
  if (data.service_id) {
    const svc = await Service.findByPk(data.service_id);
    if (!svc) return { success: false, message: 'Dịch vụ không tồn tại' };
  }

  data.mtime = Math.floor(Date.now() / 1000);

  const [updated] = await Transaction.update(data, { where: { id } });
  if (updated === 0) return { success: false, message: 'Không tìm thấy transaction để cập nhật' };

  return { success: true };
};

exports.deleteTransaction = async (id) => {
  const num = await Transaction.destroy({ where: { id } });
  return num === 1;
};

exports.softDeleteTransaction = async (id) => {
  const transaction = await Transaction.findByPk(id);
  if (!transaction) return { success: false, message: 'Không tìm thấy transaction' };

  transaction.dtime = Math.floor(Date.now() / 1000);
  await transaction.save();

  return { success: true };
};

// ==========================================
// STATUS MANAGEMENT
// ==========================================

/**
 * Cập nhật trạng thái transaction
 *
 * waiting  → serving   : ghi call_time, gán user_id/counter_id nếu có
 * serving  → completed : ghi end_time
 * serving  → cancelled : ghi end_time
 * waiting  → cancelled : ghi end_time
 */
exports.updateStatus = async (id, status, extraData = {}) => {
  const transaction = await Transaction.findByPk(id);
  if (!transaction) return { success: false, message: 'Không tìm thấy transaction' };

  if (!VALID_STATUSES.includes(status)) {
    return {
      success: false,
      message: `Trạng thái không hợp lệ. Chỉ chấp nhận: ${VALID_STATUSES.join(', ')}`
    };
  }

  const updateData = { status };
  const now = getCurrentTimeStr();

  if (status === 'serving') {
    updateData.call_time = extraData.call_time || now;
    if (extraData.user_id)    updateData.user_id    = extraData.user_id;
    if (extraData.counter_id) updateData.counter_id = extraData.counter_id;
  }

  if (status === 'completed' || status === 'cancelled') {
    updateData.end_time = extraData.end_time || now;
  }

  updateData.mtime = Math.floor(Date.now() / 1000);

  await Transaction.update(updateData, { where: { id } });

  const updated = await Transaction.findByPk(id, { include: buildFullInclude() });
  return { success: true, data: updated };
};

// ==========================================
// STATISTICS
// ==========================================

exports.getStatsByDate = async (date) => {
  const targetDate = date || new Date().toISOString().slice(0, 10);

  const [total, waiting, serving, completed, cancelled] = await Promise.all([
    Transaction.count({ where: { print_date: targetDate } }),
    Transaction.count({ where: { print_date: targetDate, status: 'waiting'   } }),
    Transaction.count({ where: { print_date: targetDate, status: 'serving'   } }),
    Transaction.count({ where: { print_date: targetDate, status: 'completed' } }),
    Transaction.count({ where: { print_date: targetDate, status: 'cancelled' } })
  ]);

  return { date: targetDate, total, waiting, serving, completed, cancelled };
};

exports.getWaitingTransactions = async (serviceId = null) => {
  const today = new Date().toISOString().slice(0, 10);
  const where = { status: 'waiting', print_date: today };
  if (serviceId) where.service_id = serviceId;

  return await Transaction.findAll({
    where,
    include: buildFullInclude(),
    order: [['print_date', 'ASC'], ['print_time', 'ASC']]
  });
};

// ==========================================
// TRANSACTIONS THEO USER
// ==========================================

exports.getActiveTransactionsByUser = async (userId) => {
  const user = await User.findByPk(userId, { attributes: ['id', 'counter_id'] });
  if (!user) return { success: false, message: 'Nhân viên không tồn tại' };

  const today = new Date().toISOString().slice(0, 10);

  const transactions = await Transaction.findAll({
    where: {
      print_date: today,
      status: { [Op.in]: ['waiting', 'serving'] },
      [Op.or]: [{ counter_id: null }, { counter_id: user.counter_id }]
    },
    include: buildFullInclude(),
    order: [['print_date', 'ASC'], ['print_time', 'ASC']]
  });

  return { success: true, user_counter_id: user.counter_id, data: transactions };
};

exports.getCancelledTransactionsByUser = async (userId) => {
  const user = await User.findByPk(userId, { attributes: ['id', 'counter_id'] });
  if (!user) return { success: false, message: 'Nhân viên không tồn tại' };

  const today = new Date().toISOString().slice(0, 10);

  const transactions = await Transaction.findAll({
    where: {
      print_date: today,
      status: 'cancelled',
      [Op.or]: [{ counter_id: null }, { counter_id: user.counter_id }]
    },
    include: buildFullInclude(),
    order: [['print_date', 'DESC'], ['print_time', 'DESC']]
  });

  return { success: true, user_counter_id: user.counter_id, data: transactions };
};