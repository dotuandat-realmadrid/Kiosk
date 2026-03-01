// ==========================================
// models/counter_transaction_office.model.js (MỚI)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const CounterTransactionOffice = sequelize.define("counter_transaction_offices", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
      comment: 'Primary key'
    },
    counter_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID quầy'
    },
    transaction_office_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID phòng giao dịch'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Trạng thái kích hoạt'
    }
  }, {
    tableName: 'counter_transaction_offices',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_counter_transaction_office',
        unique: true,
        fields: ['counter_id', 'transaction_office_id']
      },
      {
        name: 'idx_cto_counter_id',
        fields: ['counter_id']
      },
      {
        name: 'idx_cto_transaction_office_id',
        fields: ['transaction_office_id']
      }
    ]
  });

  return CounterTransactionOffice;
};