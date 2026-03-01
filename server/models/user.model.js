// ==========================================
// models/user.model.js (THÊM counter_id)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
      comment: 'Primary key auto increment'
    },
    username: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Tên đăng nhập'
    },
    password: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Mật khẩu (đã mã hóa)'
    },
    full_name: {
      type: Sequelize.STRING(200),
      allowNull: false,
      comment: 'Họ và tên đầy đủ'
    },
    email: {
      type: Sequelize.STRING(150),
      allowNull: true,
      unique: true,
      comment: 'Địa chỉ email'
    },
    gender: {
      type: Sequelize.ENUM('Nam', 'Nữ', 'Khác'),
      allowNull: true,
      comment: 'Giới tính'
    },
    date_of_birth: {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: 'Ngày sinh'
    },
    phone: {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: 'Số điện thoại'
    },
    address: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "Địa chỉ"
    },
    position_id: {
      type: Sequelize.UUID,
      allowNull: true,
      comment: 'ID chức danh'
    },
    counter_id: {  // ✅ THÊM FIELD NÀY
      type: Sequelize.UUID,
      allowNull: true,
      comment: 'ID quầy được phân công'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Trạng thái kích hoạt'
    },
    login_attempts: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Số lần đăng nhập thất bại liên tiếp'
    },
    lock_until: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Thời gian mở khóa tài khoản'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_full_name',
        fields: ['full_name']
      },
      {
        name: 'idx_phone',
        fields: ['phone']
      },
      {
        name: 'idx_position_id',
        fields: ['position_id']
      },
      {
        name: 'idx_counter_id',  // ✅ THÊM INDEX
        unique: true,
        fields: ['counter_id']
      },
      {
        name: 'idx_is_active',
        fields: ['is_active']
      },
      {
        name: 'idx_active_created',
        fields: ['is_active', 'created_at']
      }
    ]
  });
  return User;
};