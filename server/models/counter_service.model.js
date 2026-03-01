// ==========================================
// models/counter_service.model.js (UPDATED - CHỈ CÓ is_priority)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const CounterService = sequelize.define("counter_services", {
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
    service_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID dịch vụ'
    },
    is_priority: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Đánh dấu dịch vụ ưu tiên'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Trạng thái dịch vụ tại quầy'
    }
  }, {
    tableName: 'counter_services',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['counter_id', 'service_id'],
        name: 'idx_unique_counter_service'
      },
      {
        name: 'idx_counter_service_counter_id',
        fields: ['counter_id']
      },
      {
        name: 'idx_counter_service_service_id',
        fields: ['service_id']
      },
      {
        name: 'idx_counter_service_is_priority',
        fields: ['counter_id', 'is_priority']
      }
    ]
  });

  return CounterService;
};