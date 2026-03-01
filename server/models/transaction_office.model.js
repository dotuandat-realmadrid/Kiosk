// ==========================================
// models/transaction_office.model.js
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const TransactionOffice = sequelize.define("transaction_offices", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
      comment: 'Primary key auto increment'
    },
    district_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID quận/huyện'
    },
    code: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Mã phòng giao dịch'
    },
    name: {
      type: Sequelize.STRING(200),
      allowNull: false,
      comment: 'Tên phòng giao dịch'
    },
    address: {
      type: Sequelize.STRING(500),
      allowNull: false,
      comment: 'Địa chỉ phòng giao dịch'
    },
    latitude: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Vĩ độ (tọa độ maps)'
    },
    longitude: {
      type: Sequelize.DECIMAL(11, 2),
      allowNull: true,
      comment: 'Kinh độ (tọa độ maps)'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Trạng thái kích hoạt'
    }
  }, {
    tableName: 'transaction_offices',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_district_id',
        fields: ['district_id']
      },
      {
        name: 'idx_is_active',
        fields: ['is_active']
      },
      {
        name: 'idx_name',
        fields: ['name']
      }
    ]
  });
  return TransactionOffice;
};