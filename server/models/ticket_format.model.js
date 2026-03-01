// ==========================================
// models/ticket_format.model.js (FIXED)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const TicketFormat = sequelize.define("ticket_formats", {
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
      comment: 'Mã'
    },
    format_pattern: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Định dạng mẫu'
    },
    start_number: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Số bắt đầu'
    },
    max_number: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'Số lớn nhất'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Trạng thái'
    }
  }, {
    tableName: 'ticket_formats',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return TicketFormat;
};
