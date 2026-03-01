// ==========================================
// models/e_center_board.model.js
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const ECenterBoard = sequelize.define("e_center_boards", {
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
      comment: 'Mã bảng điện tử'
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Tên bảng điện tử'
    },
    is_video_enabled: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Hiển thị video (true: bật, false: tắt)'
    },
    is_slider_enabled: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Hiển thị slider ảnh (true: bật, false: tắt)'
    },
    voice_type: {
      type: Sequelize.STRING(50),
      defaultValue: 'Hà Nội',
      allowNull: false,
      comment: 'Giọng gọi số: Hà Nội, Hồ Chí Minh, Đà Nẵng, Huế'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: 'Trạng thái kích hoạt'
    }
  }, {
    tableName: 'e_center_boards',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_e_center_board_code',
        unique: true,
        fields: ['code']
      },
      {
        name: 'idx_e_center_board_is_active',
        fields: ['is_active']
      }
    ]
  });

  return ECenterBoard;
};