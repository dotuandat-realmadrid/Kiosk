// ==========================================
// models/province.model.js (NO CHANGES)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const Province = sequelize.define("provinces", {
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
      comment: 'Mã tỉnh/thành phố'
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Tên tỉnh/thành phố'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Trạng thái kích hoạt'
    }
  }, {
    tableName: 'provinces',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return Province;
};