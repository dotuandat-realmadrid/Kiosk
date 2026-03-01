// server/services/cccd_info.service.js
const db = require("../models");
const CCCDInfo = db.cccdInfo;
const Op = db.Sequelize.Op;

/**
 * Xác định nơi cấp dựa trên ngày cấp
 */
const determinePlaceOfIssue = (personalInfo) => {
  if (personalInfo.dateOfIssue) {
    return 'Cục trưởng cục cảnh sát quản lý hành chính về trật tự xã hội';
  } else if (personalInfo.dateOfIssueQR) {
    return 'Bộ công an';
  }
  return '';
};

/**
 * Chuẩn bị dữ liệu từ device request
 */
const prepareIdDataFromDevice = (reqBody) => {
  const { result, message, serialNumber, firmwareVersion, type, data } = reqBody;
  const personalInfo = data.personalInfo;
  
  const placeOfIssue = determinePlaceOfIssue(personalInfo);

  return {
    // Device response fields
    result: result,
    message: message,
    serial_number: serialNumber,
    firmware_version: firmwareVersion,
    type: type || 0,
    
    // Image data fields (store as base64 TEXT)
    front_image: data.frontImage,
    back_image: data.backImage,
    dg01: data.dg01,
    dg02: data.dg02,
    dg13: data.dg13,
    dg14: data.dg14,
    dg15: data.dg15,
    dg_com: data.dgCom,
    dg_sod: data.dgSod,
    ds_cert: data.dsCert,
    
    // Personal information fields
    eid_number: personalInfo.eIDNumber,
    full_name: personalInfo.fullName,
    date_of_birth: personalInfo.dateOfBirth,
    sex: personalInfo.sex,
    nationality: personalInfo.nationality || 'Việt Nam',
    ethnicity: personalInfo.ethnicity,
    religion: personalInfo.religion,
    place_of_origin: personalInfo.placeOfOrigin,
    place_of_residence: personalInfo.placeOfResidence,
    place_of_residence_qr: personalInfo.placeOfResidenceQR,
    personal_identification: personalInfo.personalIdentification,
    date_of_issue: personalInfo.dateOfIssue,
    date_of_issue_qr: personalInfo.dateOfIssueQR,
    date_of_expiry: personalInfo.dateOfExpiry,
    father_name: personalInfo.fatherName,
    mother_name: personalInfo.motherName,
    wife_or_husband_name: personalInfo.spouseName,
    old_eid_number: personalInfo.oldEidNumber,
    unknown_number: personalInfo.unknowNumber,
    place_of_issue: placeOfIssue,
    
    // Metadata
    read_timestamp: new Date(),
    dtime: 0,
    mtime: 0
  };
};

/**
 * Validate dữ liệu từ device
 */
exports.validateDeviceData = (reqBody) => {
  const { result, data } = reqBody;
  
  if (result === undefined || !data || !data.personalInfo) {
    return {
      valid: false,
      message: 'Thiếu thông tin bắt buộc: result, data, data.personalInfo'
    };
  }
  
  return { valid: true };
};

/**
 * Kiểm tra xem request có phải là báo lỗi từ device không
 */
exports.isDeviceError = (reqBody) => {
  const { cmdType } = reqBody || {};
  return cmdType === 'Error';
};

/**
 * Broadcast device error qua WebSocket
 */
exports.broadcastDeviceError = (description) => {
  if (!global.wss) {
    console.warn('⚠️ [WS] WebSocket server not available');
    return 0;
  }

  const wsData = {
    type: 'device-error',
    data: {
      description: description || 'Unknown device error',
      message: 'Đọc thẻ không thành công, vui lòng thao tác lại'
    }
  };

  let clientCount = 0;
  global.wss.clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(wsData));
      clientCount++;
    }
  });

  if (clientCount > 0) {
    console.log(`📡 [WS] Error broadcasted to ${clientCount} client(s)`);
  }

  return clientCount;
};

/**
 * Broadcast new ID record qua WebSocket
 */
exports.broadcastNewIdRecord = (recordId) => {
  if (!global.wss) {
    console.warn('⚠️ [WS] WebSocket server not available');
    return 0;
  }

  const wsData = {
    type: 'new-id-record',
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
    console.log(`📡 [WS] New record broadcasted to ${clientCount} client(s)`);
  }

  return clientCount;
};

/**
 * Tạo bản ghi CCCD mới
 */
exports.createIdRecord = async (reqBody) => {
  try {
    const idData = prepareIdDataFromDevice(reqBody);
    const newIdInfo = await CCCDInfo.create(idData);
    
    return {
      success: true,
      data: newIdInfo
    };
  } catch (error) {
    console.error('❌ [Service] Create ID record error:', error);
    throw error;
  }
};

/**
 * Lấy bản ghi mới nhất
 */
exports.getLatestRecord = async () => {
  try {
    const latest = await CCCDInfo.findOne({
      order: [['created_at', 'DESC']],
      raw: true
    });
    
    return latest;
  } catch (error) {
    console.error('❌ [Service] Get latest record error:', error);
    throw error;
  }
};

/**
 * Lấy bản ghi theo ID
 */
exports.getRecordById = async (id) => {
  try {
    const record = await CCCDInfo.findByPk(id, { raw: true });
    return record;
  } catch (error) {
    console.error('❌ [Service] Get record by ID error:', error);
    throw error;
  }
};