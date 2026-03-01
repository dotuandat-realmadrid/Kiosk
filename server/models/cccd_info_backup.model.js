module.exports = (sequelize, Sequelize) => {
  const CCCDInfo = sequelize.define("cccd_info_backup", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
      comment: 'Primary key auto increment'
    },
    // Device response fields
    result: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'Kết quả đọc thẻ: 0=success, 1=false'
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Thông báo từ thiết bị'
    },
    serial_number: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Số serial thiết bị'
    },
    firmware_version: {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Phiên bản firmware thiết bị'
    },
    type: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Loại thẻ: 0=CCCD Việt Nam, 1=Passport'
    },
    
    // Image data fields (stored as base64 TEXT in MySQL)
    front_image: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'Ảnh mặt trước CCCD (base64)'
    },
    back_image: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'Ảnh mặt sau CCCD (base64)'
    },
    dg01: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'Dữ liệu thô dg01 (base64)'
    },
    dg02: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'Ảnh chân dung từ chip (base64)'
    },
    dg13: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'Dữ liệu thô dg13 (base64)'
    },
    dg14: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'Dữ liệu thô dg14 (base64)'
    },
    dg15: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'Dữ liệu thô dg15 (base64)'
    },
    dg_com: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'Dữ liệu thô dgCom (base64)'
    },
    dg_sod: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'Dữ liệu thô dgSod (base64)'
    },
    ds_cert: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'Dữ liệu kiểm tra với Rar Center (base64)'
    },
    
    // Personal information fields (giữ tên trường theo chuẩn MySQL snake_case)
    eid_number: {
      type: Sequelize.STRING(20),
      allowNull: false,
      comment: 'Số căn cước công dân'
    },
    full_name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'Họ và tên'
    },
    date_of_birth: {
      type: Sequelize.STRING(20),
      allowNull: false,
      comment: 'Ngày sinh (dd-mm-yyyy)'
    },
    sex: {
      type: Sequelize.STRING(10),
      allowNull: false,
      comment: 'Giới tính'
    },
    nationality: {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'Việt Nam',
      comment: 'Quốc tịch'
    },
    ethnicity: {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Dân tộc'
    },
    religion: {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Tôn giáo'
    },
    place_of_origin: {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: 'Quê quán'
    },
    place_of_residence: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Nơi thường trú'
    },
    place_of_residence_qr: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Nơi thường trú từ QR code'
    },
    personal_identification: {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: 'Đặc điểm nhận dạng'
    },
    date_of_issue: {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Ngày cấp (dd-mm-yyyy)'
    },
    date_of_issue_qr: {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Ngày cấp từ QR code (dd-mm-yyyy)'
    },
    date_of_expiry: {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Ngày hết hạn (dd-mm-yyyy)'
    },
    father_name: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Họ tên cha'
    },
    mother_name: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Họ tên mẹ'
    },
    wife_or_husband_name: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Họ tên vợ/chồng'
    },
    old_eid_number: {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Số CCCD cũ'
    },
    unknown_number: {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Số không xác định'
    },
    place_of_issue: {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: 'Nơi cấp căn cước công dân'
    },

    template_data: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Dữ liệu từ template (JSON format) - Mỗi template có fields khác nhau'
    },
    
    // Metadata
    read_timestamp: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      comment: 'Thời gian đọc thẻ'
    },
    
    // Soft delete and manual timestamps
    dtime: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Thời điểm xóa (epoch seconds), 0 = chưa xóa'
    },
    mtime: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Thời điểm cập nhật thủ công (epoch seconds), 0 = chưa đặt'
    }
  }, {
    tableName: 'cccd_info_backup',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_eid_number',
        fields: ['eid_number']
      },
      {
        name: 'idx_read_timestamp',
        fields: ['read_timestamp']
      },
      {
        name: 'idx_result',
        fields: ['result']
      }
    ]
  });
  
  return CCCDInfo;
};