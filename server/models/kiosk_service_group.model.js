// ==========================================
// models/kiosk_service_group.model.js (MỚI - N-N Kiosk vs ServiceGroup)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const KioskServiceGroup = sequelize.define("kiosk_service_groups", {
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
    service_group_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID nhóm dịch vụ'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Trạng thái nhóm dịch vụ tại kiosk'
    }
  }, {
    tableName: 'kiosk_service_groups',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['kiosk_id', 'service_group_id'],
        name: 'idx_unique_kiosk_service_group'
      },
      {
        name: 'idx_kiosk_service_group_kiosk_id',
        fields: ['kiosk_id']
      },
      {
        name: 'idx_kiosk_service_group_service_group_id',
        fields: ['service_group_id']
      }
    ]
  });

  return KioskServiceGroup;
};