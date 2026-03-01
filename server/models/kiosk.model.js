// ==========================================
// models/kiosk.model.js (UPDATED - N-1 với transaction_offices)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const Kiosk = sequelize.define("kiosks", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
      comment: 'Primary key'
    },
    code: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Mã kiosk'
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Tên kiosk'
    },
    transaction_office_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID phòng giao dịch (N-1 relationship)'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Trạng thái kích hoạt'
    }
  }, {
    tableName: 'kiosks',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_kiosk_code',
        unique: true,
        fields: ['code']
      },
      {
        name: 'idx_kiosk_transaction_office_id',
        fields: ['transaction_office_id']
      },
      {
        name: 'idx_kiosk_is_active',
        fields: ['is_active']
      }
    ]
  });

  return Kiosk;
};