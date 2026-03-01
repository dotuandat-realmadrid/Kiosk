// server/services/cccd_info_backup.service.js
const db = require("../models");
const CCCDInfoBackup = db.cccdInfoBackup;
const Op = db.Sequelize.Op;

/**
 * Validate các trường bắt buộc
 */
exports.validateRequiredFields = (reqBody) => {
  if (!reqBody || Object.keys(reqBody).length === 0) {
    return {
      valid: false,
      message: 'Body request không được rỗng'
    };
  }

  const requiredFields = ['result', 'eid_number', 'full_name', 'date_of_birth', 'sex', 'nationality'];
  const missingFields = requiredFields.filter(field => !reqBody[field] && reqBody[field] !== 0);
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      message: `Thiếu thông tin bắt buộc: ${missingFields.join(', ')}`
    };
  }

  return { valid: true };
};

/**
 * Chuẩn bị dữ liệu từ request body
 */
const prepareRecordData = (reqBody) => {
  return {
    // Device response fields
    result: reqBody.result,
    message: reqBody.message || null,
    serial_number: reqBody.serial_number || null,
    firmware_version: reqBody.firmware_version || null,
    type: reqBody.type || 0,
    
    // Image data fields
    front_image: reqBody.front_image || null,
    back_image: reqBody.back_image || null,
    dg01: reqBody.dg01 || null,
    dg02: reqBody.dg02 || null,
    dg13: reqBody.dg13 || null,
    dg14: reqBody.dg14 || null,
    dg15: reqBody.dg15 || null,
    dg_com: reqBody.dg_com || null,
    dg_sod: reqBody.dg_sod || null,
    ds_cert: reqBody.ds_cert || null,
    
    // Personal information fields
    eid_number: reqBody.eid_number,
    full_name: reqBody.full_name,
    date_of_birth: reqBody.date_of_birth,
    sex: reqBody.sex,
    nationality: reqBody.nationality,
    ethnicity: reqBody.ethnicity || null,
    religion: reqBody.religion || null,
    place_of_origin: reqBody.place_of_origin || null,
    place_of_residence: reqBody.place_of_residence || null,
    place_of_residence_qr: reqBody.place_of_residence_qr || null,
    personal_identification: reqBody.personal_identification || null,
    date_of_issue: reqBody.date_of_issue || null,
    date_of_issue_qr: reqBody.date_of_issue_qr || null,
    date_of_expiry: reqBody.date_of_expiry || null,
    father_name: reqBody.father_name || null,
    mother_name: reqBody.mother_name || null,
    wife_or_husband_name: reqBody.wife_or_husband_name || null,
    old_eid_number: reqBody.old_eid_number || null,
    unknown_number: reqBody.unknown_number || null,
    place_of_issue: reqBody.place_of_issue || null,
    template_data: reqBody.template_data || null,
    
    // Metadata
    read_timestamp: reqBody.read_timestamp || new Date(),
    dtime: reqBody.dtime || 0,
    mtime: reqBody.mtime || 0
  };
};

/**
 * Broadcast new backup record qua WebSocket
 */
exports.broadcastNewBackupRecord = (recordId) => {
  if (!global.wss) {
    console.warn('⚠️ [WS] WebSocket server not available');
    return 0;
  }

  const wsData = {
    type: 'new-id-record-backup',
    data: { id: recordId }
  };

  let clientCount = 0;
  global.wss.clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(wsData));
      clientCount++;
    }
  });

  if (clientCount > 0) {
    console.log(`📡 [WS] Broadcasted to ${clientCount} client(s)`);
  }

  return clientCount;
};

/**
 * Tạo bản ghi backup
 */
exports.createBackupRecord = async (reqBody) => {
  try {
    const recordData = prepareRecordData(reqBody);
    const newRecord = await CCCDInfoBackup.create(recordData);
    
    return {
      success: true,
      data: newRecord
    };
  } catch (error) {
    console.error('❌ [Service] Create backup record error:', error);
    throw error;
  }
};

/**
 * Lấy bản ghi mới nhất
 */
exports.getLatestRecord = async () => {
  try {
    const latest = await CCCDInfoBackup.findOne({
      order: [['created_at', 'DESC']]
    });
    
    return latest;
  } catch (error) {
    console.error('❌ [Service] Get latest backup record error:', error);
    throw error;
  }
};

/**
 * Lấy bản ghi theo ID
 */
exports.getRecordById = async (id) => {
  try {
    const record = await CCCDInfoBackup.findByPk(id);
    return record;
  } catch (error) {
    console.error('❌ [Service] Get backup record by ID error:', error);
    throw error;
  }
};