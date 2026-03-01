// ==========================================
// models/user_role.model.js (THÊM INDEX)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define("roles", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
      comment: 'Primary key auto increment'
    },
    code: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Mã vai trò (VD: ADMIN, USER, EDITOR)',
      set(value) {
        // ✅ Tự động uppercase khi set
        this.setDataValue('code', value.toUpperCase());
      }
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Tên vai trò'
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Mô tả vai trò'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Trạng thái kích hoạt'
    }
  }, {
    tableName: 'roles',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_code', // ✅ THÊM: Đặt tên index rõ ràng
        fields: ['code'],
        unique: true // ✅ THÊM: Đảm bảo unique ở index level
      },
      {
        name: 'idx_name', // ✅ THÊM: Index cho name (hay query)
        fields: ['name']
      },
      {
        name: 'idx_is_active', // ✅ THÊM: Index cho is_active (hay filter)
        fields: ['is_active']
      }
    ]
  });

  return Role;
};