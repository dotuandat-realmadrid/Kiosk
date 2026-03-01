// ==========================================
// models/kiosk_service.model.js (MỚI - N-N Kiosk vs Service)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const KioskService = sequelize.define("kiosk_services", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
      comment: 'Primary key'
    },
    kiosk_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID kiosk'
    },
    service_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID dịch vụ'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Trạng thái dịch vụ tại kiosk'
    }
  }, {
    tableName: 'kiosk_services',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['kiosk_id', 'service_id'],
        name: 'idx_unique_kiosk_service'
      },
      {
        name: 'idx_kiosk_service_kiosk_id',
        fields: ['kiosk_id']
      },
      {
        name: 'idx_kiosk_service_service_id',
        fields: ['service_id']
      }
    ]
  });

  return KioskService;
};