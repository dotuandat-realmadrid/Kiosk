// ==========================================
// models/user_transaction_office.model.js (BỎ REFERENCES)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const UserTransactionOffice = sequelize.define("user_transaction_offices", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
      comment: 'Primary key'
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID người dùng'
      // ✅ BỎ references
    },
    transaction_office_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID phòng giao dịch'
      // ✅ BỎ references
    },
    assigned_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      comment: 'Thời gian được gán'
    },
    is_primary: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Phòng giao dịch chính của user'
    }
  }, {
    tableName: 'user_transaction_offices',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_user_office',
        fields: ['user_id', 'transaction_office_id'],
        unique: true
      },
      {
        name: 'idx_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_office_id',
        fields: ['transaction_office_id']
      }
    ]
  });
  return UserTransactionOffice;
};