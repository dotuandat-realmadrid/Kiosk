// ==========================================
// models/service_group_mapping.model.js
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const ServiceGroupMapping = sequelize.define("service_group_mappings", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
      comment: 'Primary key'
    },
    service_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID dịch vụ'
    },
    service_group_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID nhóm dịch vụ'
    }
  }, {
    tableName: 'service_group_mappings',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['service_id', 'service_group_id']
      }
    ]
  });

  return ServiceGroupMapping;
};