// ==========================================
// models/index.js (UPDATED - WITH TRANSACTIONS)
// ==========================================
const dbConfig = require("../configs/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: 0,
  port: dbConfig.PORT,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ==================== IMPORT MODELS ====================
db.cccdInfo = require("./cccd_info.model.js")(sequelize, Sequelize);
db.cccdInfoBackup = require("./cccd_info_backup.model.js")(sequelize, Sequelize);
db.users = require("./user.model.js")(sequelize, Sequelize);
db.invalidatedTokens = require("./invalidated_token.model.js")(sequelize, Sequelize);
db.roles = require("./role.model.js")(sequelize, Sequelize);
db.userRoles = require("./user_role.model.js")(sequelize, Sequelize);
db.positions = require("./position.model.js")(sequelize, Sequelize);
db.provinces = require("./province.model.js")(sequelize, Sequelize);
db.districts = require("./district.model.js")(sequelize, Sequelize);
db.transactionOffices = require("./transaction_office.model.js")(sequelize, Sequelize);
db.userTransactionOffices = require("./user_transaction_office.model.js")(sequelize, Sequelize);
db.ticketFormats = require("./ticket_format.model.js")(sequelize, Sequelize);
db.services = require("./service.model.js")(sequelize, Sequelize);
db.serviceGroups = require("./service_group.model.js")(sequelize, Sequelize);
db.serviceGroupMappings = require("./service_group_mapping.model.js")(sequelize, Sequelize);

// ==================== BRANCH MODELS ====================
db.branches = require("./branch.model.js")(sequelize, Sequelize);
db.branchServices = require("./branch_service.model.js")(sequelize, Sequelize);
db.branchServiceGroups = require("./branch_service_group.model.js")(sequelize, Sequelize);
db.branchQueueConfigs = require("./branch_queue_config.model.js")(sequelize, Sequelize);
db.branchReportConfigs = require("./branch_report_config.model.js")(sequelize, Sequelize);

// ==================== KIOSK MODELS ====================
db.kiosks = require("./kiosk.model.js")(sequelize, Sequelize);
db.kioskServices = require("./kiosk_service.model.js")(sequelize, Sequelize);
db.kioskServiceGroups = require("./kiosk_service_group.model.js")(sequelize, Sequelize);

// ==================== COUNTER MODELS ====================
db.counters = require("./counter.model.js")(sequelize, Sequelize);
db.counterServices = require("./counter_service.model.js")(sequelize, Sequelize);

// ==================== TRANSACTION MODEL ====================
db.transactions = require("./transaction.model.js")(sequelize, Sequelize);

// ==================== E CENTER BOARD MODEL ====================
db.eCenterBoards        = require("./e_center_board.model.js")(sequelize, Sequelize);
db.eCenterBoardVideos   = require("./e_center_board_video.model.js")(sequelize, Sequelize);
db.eCenterBoardSliders  = require("./e_center_board_image_slider.model.js")(sequelize, Sequelize);
db.eCenterBoardCounters = require("./e_center_board_counter.model.js")(sequelize, Sequelize);

// ==================== RELATIONSHIPS ====================

// --------------------------------------------------
// 1. InvalidatedToken - User (N-1)
// --------------------------------------------------
db.invalidatedTokens.belongsTo(db.users, {
  foreignKey: 'user_id',
  as: 'users',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.users.hasMany(db.invalidatedTokens, {
  foreignKey: 'user_id',
  as: 'invalidated_tokens',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// --------------------------------------------------
// 2. User - Role (N-N) through UserRole
// --------------------------------------------------
db.users.belongsToMany(db.roles, {
  through: db.userRoles,
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.roles.belongsToMany(db.users, {
  through: db.userRoles,
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.userRoles.belongsTo(db.users, {
  foreignKey: 'user_id',
  as: 'users'
});

db.userRoles.belongsTo(db.roles, {
  foreignKey: 'role_id',
  as: 'roles'
});

// --------------------------------------------------
// 3. User - Position (N-1)
// --------------------------------------------------
db.users.belongsTo(db.positions, {
  foreignKey: 'position_id',
  as: 'position',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

db.positions.hasMany(db.users, {
  foreignKey: 'position_id',
  as: 'users',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// --------------------------------------------------
// 4. Province - District (1-N)
// --------------------------------------------------
db.provinces.hasMany(db.districts, {
  foreignKey: 'province_id',
  as: 'districts',
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT'
});

db.districts.belongsTo(db.provinces, {
  foreignKey: 'province_id',
  as: 'province',
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT'
});

// --------------------------------------------------
// 5. District - TransactionOffice (1-N)
// --------------------------------------------------
db.districts.hasMany(db.transactionOffices, {
  foreignKey: 'district_id',
  as: 'transaction_offices',
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT'
});

db.transactionOffices.belongsTo(db.districts, {
  foreignKey: 'district_id',
  as: 'district',
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT'
});

// --------------------------------------------------
// 6. User - TransactionOffice (N-N) through UserTransactionOffice
// --------------------------------------------------
db.users.belongsToMany(db.transactionOffices, {
  through: db.userTransactionOffices,
  foreignKey: 'user_id',
  otherKey: 'transaction_office_id',
  as: 'transaction_offices',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.transactionOffices.belongsToMany(db.users, {
  through: db.userTransactionOffices,
  foreignKey: 'transaction_office_id',
  otherKey: 'user_id',
  as: 'users',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.userTransactionOffices.belongsTo(db.users, {
  foreignKey: 'user_id',
  as: 'users'
});

db.users.hasMany(db.userTransactionOffices, {
  foreignKey: 'user_id',
  as: 'user_offices'
});

db.userTransactionOffices.belongsTo(db.transactionOffices, {
  foreignKey: 'transaction_office_id',
  as: 'offices'
});

db.transactionOffices.hasMany(db.userTransactionOffices, {
  foreignKey: 'transaction_office_id',
  as: 'office_users'
});

// --------------------------------------------------
// 7. TicketFormat - Service (1-N)
// --------------------------------------------------
db.ticketFormats.hasMany(db.services, {
  foreignKey: 'format_id',
  as: 'services',
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT'
});

db.services.belongsTo(db.ticketFormats, {
  foreignKey: 'format_id',
  as: 'ticket_format',
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT'
});

// --------------------------------------------------
// 8. Service - ServiceGroup (N-N) through ServiceGroupMapping
// --------------------------------------------------
db.services.belongsToMany(db.serviceGroups, {
  through: db.serviceGroupMappings,
  foreignKey: 'service_id',
  otherKey: 'service_group_id',
  as: 'service_groups',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.serviceGroups.belongsToMany(db.services, {
  through: db.serviceGroupMappings,
  foreignKey: 'service_group_id',
  otherKey: 'service_id',
  as: 'services',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.serviceGroupMappings.belongsTo(db.services, {
  foreignKey: 'service_id',
  as: 'service'
});

db.serviceGroupMappings.belongsTo(db.serviceGroups, {
  foreignKey: 'service_group_id',
  as: 'service_group'
});

// ==================== BRANCH RELATIONSHIPS ====================

// --------------------------------------------------
// 9. Branch - TransactionOffice (1-1)
// --------------------------------------------------
db.branches.belongsTo(db.transactionOffices, {
  foreignKey: 'transaction_office_id',
  as: 'transaction_office',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

db.transactionOffices.hasOne(db.branches, {
  foreignKey: 'transaction_office_id',
  as: 'branch',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// --------------------------------------------------
// 10. Branch - Service (N-N) through BranchService
// --------------------------------------------------
db.branches.belongsToMany(db.services, {
  through: db.branchServices,
  foreignKey: 'branch_id',
  otherKey: 'service_id',
  as: 'services',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.services.belongsToMany(db.branches, {
  through: db.branchServices,
  foreignKey: 'service_id',
  otherKey: 'branch_id',
  as: 'branches',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.branchServices.belongsTo(db.branches, {
  foreignKey: 'branch_id',
  as: 'branch'
});

db.branchServices.belongsTo(db.services, {
  foreignKey: 'service_id',
  as: 'service'
});

// --------------------------------------------------
// 11. Branch - ServiceGroup (N-N) through BranchServiceGroup
// --------------------------------------------------
db.branches.belongsToMany(db.serviceGroups, {
  through: db.branchServiceGroups,
  foreignKey: 'branch_id',
  otherKey: 'service_group_id',
  as: 'service_groups',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.serviceGroups.belongsToMany(db.branches, {
  through: db.branchServiceGroups,
  foreignKey: 'service_group_id',
  otherKey: 'branch_id',
  as: 'branches',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.branchServiceGroups.belongsTo(db.branches, {
  foreignKey: 'branch_id',
  as: 'branch'
});

db.branchServiceGroups.belongsTo(db.serviceGroups, {
  foreignKey: 'service_group_id',
  as: 'service_group'
});

// --------------------------------------------------
// 12. Branch - BranchQueueConfig (1-1)
// --------------------------------------------------
db.branches.hasOne(db.branchQueueConfigs, {
  foreignKey: 'branch_id',
  as: 'queue_config',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.branchQueueConfigs.belongsTo(db.branches, {
  foreignKey: 'branch_id',
  as: 'branch',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// --------------------------------------------------
// 13. Branch - BranchReportConfig (1-1)
// --------------------------------------------------
db.branches.hasOne(db.branchReportConfigs, {
  foreignKey: 'branch_id',
  as: 'report_config',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.branchReportConfigs.belongsTo(db.branches, {
  foreignKey: 'branch_id',
  as: 'branch',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// ==================== KIOSK RELATIONSHIPS ====================

// --------------------------------------------------
// 14. Kiosk - TransactionOffice (N-1)
// --------------------------------------------------
db.kiosks.belongsTo(db.transactionOffices, {
  foreignKey: 'transaction_office_id',
  as: 'transaction_office',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

db.transactionOffices.hasMany(db.kiosks, {
  foreignKey: 'transaction_office_id',
  as: 'kiosks',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// --------------------------------------------------
// 15. Kiosk - Service (N-N) through KioskService
// --------------------------------------------------
db.kiosks.belongsToMany(db.services, {
  through: db.kioskServices,
  foreignKey: 'kiosk_id',
  otherKey: 'service_id',
  as: 'services',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.services.belongsToMany(db.kiosks, {
  through: db.kioskServices,
  foreignKey: 'service_id',
  otherKey: 'kiosk_id',
  as: 'kiosks',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.kioskServices.belongsTo(db.kiosks, {
  foreignKey: 'kiosk_id',
  as: 'kiosk'
});

db.kioskServices.belongsTo(db.services, {
  foreignKey: 'service_id',
  as: 'service'
});

// --------------------------------------------------
// 16. Kiosk - ServiceGroup (N-N) through KioskServiceGroup
// --------------------------------------------------
db.kiosks.belongsToMany(db.serviceGroups, {
  through: db.kioskServiceGroups,
  foreignKey: 'kiosk_id',
  otherKey: 'service_group_id',
  as: 'service_groups',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.serviceGroups.belongsToMany(db.kiosks, {
  through: db.kioskServiceGroups,
  foreignKey: 'service_group_id',
  otherKey: 'kiosk_id',
  as: 'kiosks',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.kioskServiceGroups.belongsTo(db.kiosks, {
  foreignKey: 'kiosk_id',
  as: 'kiosk'
});

db.kioskServiceGroups.belongsTo(db.serviceGroups, {
  foreignKey: 'service_group_id',
  as: 'service_group'
});

// ==================== COUNTER RELATIONSHIPS ====================

// --------------------------------------------------
// 17. Counter - TransactionOffice (N-1)
// --------------------------------------------------
db.counters.belongsTo(db.transactionOffices, {
  foreignKey: 'transaction_office_id',
  as: 'transaction_office',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

db.transactionOffices.hasMany(db.counters, {
  foreignKey: 'transaction_office_id',
  as: 'counters',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// --------------------------------------------------
// 18. Counter - Service (N-N) through CounterService
// --------------------------------------------------
db.counters.belongsToMany(db.services, {
  through: db.counterServices,
  foreignKey: 'counter_id',
  otherKey: 'service_id',
  as: 'services',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.services.belongsToMany(db.counters, {
  through: db.counterServices,
  foreignKey: 'service_id',
  otherKey: 'counter_id',
  as: 'counters',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.counterServices.belongsTo(db.counters, {
  foreignKey: 'counter_id',
  as: 'counter'
});

db.counterServices.belongsTo(db.services, {
  foreignKey: 'service_id',
  as: 'service'
});

// --------------------------------------------------
// 19. User - Counter (1-1) 
// --------------------------------------------------
db.users.belongsTo(db.counters, {
  foreignKey: 'counter_id',
  as: 'counter',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

db.counters.hasOne(db.users, {
  foreignKey: 'counter_id',
  as: 'user',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// ==================== TRANSACTION RELATIONSHIPS ====================

// --------------------------------------------------
// 20. Transaction - Service (N-1)
// --------------------------------------------------
db.transactions.belongsTo(db.services, {
  foreignKey: 'service_id',
  as: 'service',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

db.services.hasMany(db.transactions, {
  foreignKey: 'service_id',
  as: 'transactions',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// --------------------------------------------------
// 21. Transaction - User (N-1)
// --------------------------------------------------
db.transactions.belongsTo(db.users, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

db.users.hasMany(db.transactions, {
  foreignKey: 'user_id',
  as: 'transactions',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// --------------------------------------------------
// 22. Transaction - Counter (N-1)
// --------------------------------------------------
db.transactions.belongsTo(db.counters, {
  foreignKey: 'counter_id',
  as: 'counter',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

db.counters.hasMany(db.transactions, {
  foreignKey: 'counter_id',
  as: 'transactions',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// --------------------------------------------------
// 23. Transaction - CCCDInfoBackup (N-1)
// --------------------------------------------------
db.transactions.belongsTo(db.cccdInfoBackup, {
  foreignKey: 'cccd_info_backup_id',
  as: 'cccd_info',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

db.cccdInfoBackup.hasMany(db.transactions, {
  foreignKey: 'cccd_info_backup_id',
  as: 'transactions',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// --------------------------------------------------
// 24. ECenterBoard (N-N) - Counter qua ECenterBoardCounter
// Một bảng điện tử có thể gắn nhiều quầy
// Một quầy có thể gắn nhiều bảng điện tử
// --------------------------------------------------
db.eCenterBoards.belongsToMany(db.counters, {
  through: db.eCenterBoardCounters,
  foreignKey: 'e_center_board_id',
  otherKey: 'counter_id',
  as: 'counters',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.counters.belongsToMany(db.eCenterBoards, {
  through: db.eCenterBoardCounters,
  foreignKey: 'counter_id',
  otherKey: 'e_center_board_id',
  as: 'e_center_boards',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.eCenterBoardCounters.belongsTo(db.eCenterBoards, {
  foreignKey: 'e_center_board_id',
  as: 'e_center_board'
});

db.eCenterBoardCounters.belongsTo(db.counters, {
  foreignKey: 'counter_id',
  as: 'counter'
});

// --------------------------------------------------
// 25. ECenterBoard (1) - ECenterBoardVideo (N)
// --------------------------------------------------
db.eCenterBoardVideos.belongsTo(db.eCenterBoards, {
  foreignKey: 'e_center_board_id', as: 'e_center_board',
  onDelete: 'CASCADE', onUpdate: 'CASCADE'
});
db.eCenterBoards.hasMany(db.eCenterBoardVideos, {
  foreignKey: 'e_center_board_id', as: 'videos',
  onDelete: 'CASCADE', onUpdate: 'CASCADE'
});

// --------------------------------------------------
// 26. ECenterBoard (1) - ECenterBoardImageSlider (N)
// --------------------------------------------------
db.eCenterBoardSliders.belongsTo(db.eCenterBoards, {
  foreignKey: 'e_center_board_id', as: 'e_center_board',
  onDelete: 'CASCADE', onUpdate: 'CASCADE'
});
db.eCenterBoards.hasMany(db.eCenterBoardSliders, {
  foreignKey: 'e_center_board_id', as: 'image_sliders',
  onDelete: 'CASCADE', onUpdate: 'CASCADE'
});

module.exports = db;