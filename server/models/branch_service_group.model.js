// ==========================================
// models/branch_service_group.model.js (MỚI - N-N Branch vs ServiceGroup)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const BranchServiceGroup = sequelize.define("branch_service_groups", {
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
    service_group_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID nhóm dịch vụ'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Trạng thái nhóm dịch vụ tại chi nhánh'
    }
  }, {
    tableName: 'branch_service_groups',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['branch_id', 'service_group_id'],
        name: 'idx_unique_branch_service_group'
      },
      {
        name: 'idx_branch_service_group_branch_id',
        fields: ['branch_id']
      },
      {
        name: 'idx_branch_service_group_service_group_id',
        fields: ['service_group_id']
      }
    ]
  });

  return BranchServiceGroup;
};