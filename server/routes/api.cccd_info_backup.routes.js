// server/routes/api.cccd_info_backup.routes.js
module.exports = app => {
  const cccdInfoBackupController = require("../controllers/api.cccd_info_backup.controller.js");
  const router = require("express").Router();

  // @route   POST /api/id-info/
  // @desc    Lưu thông tin căn cước công dân
  // @access  Public
  router.post("/id-info-backup/", cccdInfoBackupController.create);

  // @route   GET /api/id-info/latest
  // @desc    Lấy bản ghi CCCD mới nhất
  // @access  Public
  router.get("/id-info-backup/latest", cccdInfoBackupController.getLatest);

  // @route   GET /api/id-info/:id
  // @desc    Lấy bản ghi CCCD theo ID
  // @access  Public
  router.get("/id-info-backup/:id", cccdInfoBackupController.getById);

  app.use('/api', router);
};