// ==========================================
// models/branch_service.model.js (UPDATED - Bỏ validation cũ)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const BranchService = sequelize.define("branch_services", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
      comment: 'Primary key'
    },
    branch_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID chi nhánh'
    },
    service_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID dịch vụ'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Trạng thái dịch vụ tại chi nhánh'
    }
  }, {
    tableName: 'branch_services',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['branch_id', 'service_id'],
        name: 'idx_unique_branch_service'
      },
      {
        name: 'idx_branch_service_branch_id',
        fields: ['branch_id']
      },
      {
        name: 'idx_branch_service_service_id',
        fields: ['service_id']
      }
    ]
  });

  return BranchService;
};