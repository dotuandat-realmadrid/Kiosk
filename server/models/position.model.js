// models/position.model.js
module.exports = (sequelize, Sequelize) => {
  const Position = sequelize.define("positions", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
      comment: 'Primary key auto increment'
    },
    code: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Mã chức danh (VD: TP, NV, GD)'
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Tên chức danh (VD: Trưởng phòng, Nhân viên, Giám đốc)'
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Mô tả chi tiết về chức danh'
    },
    // level: {
    //   type: Sequelize.INTEGER,
    //   allowNull: true,
    //   defaultValue: 1,
    //   comment: 'Cấp bậc chức danh (1: Thấp nhất, càng cao càng quan trọng)'
    // },
    // department: {
    //   type: Sequelize.STRING(100),
    //   allowNull: true,
    //   comment: 'Phòng ban (VD: Kinh doanh, Kỹ thuật, Hành chính)'
    // },
    // salary_range_min: {
    //   type: Sequelize.DECIMAL(15, 2),
    //   allowNull: true,
    //   comment: 'Mức lương tối thiểu'
    // },
    // salary_range_max: {
    //   type: Sequelize.DECIMAL(15, 2),
    //   allowNull: true,
    //   comment: 'Mức lương tối đa'
    // },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Trạng thái kích hoạt (true: đang sử dụng, false: ngừng sử dụng)'
    }
  }, {
    tableName: 'positions',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_code',
        fields: ['code'],
        unique: true
      },
      {
        name: 'idx_name',
        fields: ['name']
      },
    //   {
    //     name: 'idx_department',
    //     fields: ['department']
    //   },
    //   {
    //     name: 'idx_level',
    //     fields: ['level']
    //   },
      {
        name: 'idx_is_active',
        fields: ['is_active']
      }
    ]
  });

  return Position;
};