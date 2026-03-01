module.exports = (sequelize, Sequelize) => {
  const Transaction = sequelize.define("transaction", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
      comment: 'Primary key UUID'
    },
    
    // Ticket information
    ticket_code: {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: 'Số vé (ví dụ: A001, B023)'
    },
    ticket_type: {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'Offline',
      comment: 'Loại vé (Offline, Online, Appointment, etc.)'
    },
    
    // Date and time fields
    print_date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      comment: 'Ngày in vé (YYYY-MM-DD)'
    },
    print_time: {
      type: Sequelize.TIME,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      comment: 'Giờ in vé (HH:mm:ss)'
    },
    call_time: {
      type: Sequelize.TIME,
      allowNull: true,
      comment: 'Giờ gọi vé (HH:mm:ss)'
    },
    wait_status: {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Trạng thái đợi (normal, long, overdue)'
    },
    end_time: {
      type: Sequelize.TIME,
      allowNull: true,
      comment: 'Giờ kết thúc phục vụ (HH:mm:ss)'
    },
    
    // Status
    status: {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'waiting',
      comment: 'Trạng thái giao dịch (waiting, serving, completed, cancelled)'
    },
    
    // Foreign keys
    service_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID dịch vụ (FK to services table)'
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: true,
      comment: 'ID nhân viên phục vụ (FK to users table)'
    },
    counter_id: {
      type: Sequelize.UUID,
      allowNull: true,
      comment: 'ID quầy phục vụ (FK to counters table)'
    },
    cccd_info_backup_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID thông tin CCCD (FK to cccd_info_backup table)'
    },
    thumbnail_base64: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'Ảnh chân dung từ chip (base64)'
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
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_ticket_code',
        fields: ['ticket_code']
      },
      {
        name: 'idx_print_date',
        fields: ['print_date']
      },
      {
        name: 'idx_status',
        fields: ['status']
      },
      {
        name: 'idx_service_id',
        fields: ['service_id']
      },
      {
        name: 'idx_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_counter_id',
        fields: ['counter_id']
      },
      {
        name: 'idx_cccd_info_backup_id',
        fields: ['cccd_info_backup_id']
      },
      {
        name: 'idx_print_date_status',
        fields: ['print_date', 'status']
      }
    ]
  });
  
  return Transaction;
};