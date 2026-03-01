// ==========================================
// models/user_role.model.js (BỎ REFERENCES)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const UserRole = sequelize.define("userRole", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false
      // ✅ BỎ references
    },
    role_id: {
      type: Sequelize.UUID,
      allowNull: false
      // ✅ BỎ references
    }
  }, {
    tableName: 'user_roles',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'role_id'],
        name: 'unique_user_role'
      }
    ]
  });
  return UserRole;
};