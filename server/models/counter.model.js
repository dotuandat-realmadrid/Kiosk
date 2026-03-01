// ==========================================
// models/counter.model.js (UPDATED - N-1 với transaction_offices)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const Counter = sequelize.define("counters", {
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
      comment: 'Mã quầy'
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Tên quầy'
    },
    counter_number: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'Số quầy'
    },
    led_board_number: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Số bảng LED'
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
    tableName: 'counters',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_counter_code',
        unique: true,
        fields: ['code']
      },
      {
        name: 'idx_counter_transaction_office_id',
        fields: ['transaction_office_id']
      },
      {
        name: 'idx_counter_is_active',
        fields: ['is_active']
      },
      {
        name: 'idx_counter_number',
        fields: ['counter_number']
      }
    ]
  });

  return Counter;
};