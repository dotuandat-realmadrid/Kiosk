// ==========================================
// models/branch.model.js (UPDATED - N-N với cả services và service_groups)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const Branch = sequelize.define("branches", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
      comment: 'Primary key'
    },
    transaction_office_id: {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
      comment: 'ID phòng giao dịch (1-1 relationship)'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Trạng thái kích hoạt'
    }
  }, {
    tableName: 'branches',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_branch_transaction_office_id',
        unique: true,
        fields: ['transaction_office_id']
      },
      {
        name: 'idx_branch_is_active',
        fields: ['is_active']
      }
    ]
  });

  return Branch;
};