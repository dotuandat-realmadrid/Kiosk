// ==========================================
// models/district.model.js (BỎ REFERENCES)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const District = sequelize.define("districts", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
      comment: 'Primary key auto increment'
    },
    province_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID tỉnh/thành phố'
      // ✅ BỎ references - Để associations xử lý
    },
    code: {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: 'Mã quận/huyện'
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'Tên quận/huyện'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Trạng thái kích hoạt'
    }
  }, {
    tableName: 'districts',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_province_id',
        fields: ['province_id']
      },
      {
        name: 'idx_code',
        fields: ['code']
      },
      {
        name: 'idx_province_code',
        fields: ['province_id', 'code'],
        unique: true
      }
    ]
  });
  return District;
};