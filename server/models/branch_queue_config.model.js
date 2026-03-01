// ==========================================
// models/branch_queue_config.model.js
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const BranchQueueConfig = sequelize.define("branch_queue_configs", {
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
      unique: true,
      comment: 'ID chi nhánh (1-1 relationship)'
    },
    waiting_alert_threshold: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 5,
      comment: 'Cảnh báo đợi lâu: Số phút cảnh báo khi khách chờ quá lâu'
    },
    overdue_waiting_threshold: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 10,
      comment: 'Lỗi đợi quá lâu: Số phút coi như quá hạn chờ'
    },
    service_alert_threshold: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 5,
      comment: 'Cảnh báo phục vụ lâu: Số phút cảnh báo khi phục vụ quá lâu'
    },
    overdue_service_threshold: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 10,
      comment: 'Lỗi phục vụ quá lâu: Số phút coi như quá hạn phục vụ'
    }
  }, {
    tableName: 'branch_queue_configs',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_branch_id',
        fields: ['branch_id']
      }
    ]
  });

  return BranchQueueConfig;
};