// ==========================================
// models/e_center_board_image_slider.model.js
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const ECenterBoardImageSlider = sequelize.define("e_center_board_image_sliders", {
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
      comment: 'ID bảng điện tử (N-1 relationship)'
    },
    description: {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Mô tả ảnh'
    },
    file_path: {
      type: Sequelize.STRING(500),
      allowNull: false,
      comment: 'Đường dẫn lưu trữ file ảnh'
    }
  }, {
    tableName: 'e_center_board_image_sliders',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_eboard_slider_board_id',
        fields: ['e_center_board_id']
      }
    ]
  });

  return ECenterBoardImageSlider;
};