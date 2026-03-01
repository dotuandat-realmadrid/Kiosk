// ==========================================
// models/e_center_board_counter.model.js
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const ECenterBoardCounter = sequelize.define("e_center_board_counters", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
      comment: 'Primary key'
    },
    e_center_board_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID bảng điện tử'
    },
    counter_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID quầy'
    }
  }, {
    tableName: 'e_center_board_counters',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_ecb_counter_unique',
        unique: true,
        fields: ['e_center_board_id', 'counter_id']
      },
      {
        name: 'idx_ecb_counter_board_id',
        fields: ['e_center_board_id']
      },
      {
        name: 'idx_ecb_counter_counter_id',
        fields: ['counter_id']
      }
    ]
  });

  return ECenterBoardCounter;
};