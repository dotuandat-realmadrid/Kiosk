// ==========================================
// models/service.model.js (UPDATED)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const Service = sequelize.define("services", {
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
      comment: 'Mã dịch vụ'
    },
    format_id: {
      type: Sequelize.UUID,
      allowNull: false,
      comment: 'ID định dạng vé'
    },
    name_vi: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Tên tiếng Việt'
    },
    name_en: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Tên English'
    },
    name_ja: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Tên Japan'
    },
    name_cn: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Tên China'
    },
    name_sp: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Tên Spain'
    },
    representative_image: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'Ảnh đại diện (base64)'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Trạng thái'
    }
  }, {
    tableName: 'services',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Service;
};