// ==========================================
// models/invalidated_token.model.js (BỎ REFERENCES)
// ==========================================
module.exports = (sequelize, Sequelize) => {
  const InvalidatedToken = sequelize.define("invalidatedToken", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    token: {
      type: Sequelize.STRING(1000),
      allowNull: false
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false
      // ✅ BỎ references
    },
    expired_at: {
      type: Sequelize.DATE,
      allowNull: false
    },
    is_valid: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'invalidated_tokens',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_expired_at',
        fields: ['expired_at']
      },
      {
        name: 'idx_valid_expired',
        fields: ['is_valid', 'expired_at']
      }
    ]
  });
  return InvalidatedToken;
};