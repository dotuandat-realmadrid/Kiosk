// server/routes/api.cccd_info.routes.js
module.exports = app => {
  const cccdInfoController = require("../controllers/api.cccd_info.controller.js");
  const router = require("express").Router();

  // @route   POST /api/id-info/
  // @desc    Lưu thông tin căn cước công dân từ thiết bị đọc
  // @access  Public
  router.post("/id-info/", cccdInfoController.create);

  // @route   GET /api/id-info/latest
  // @desc    Lấy bản ghi CCCD mới nhất
  // @access  Public
  router.get("/id-info/latest", cccdInfoController.getLatest);

  // @route   GET /api/id-info/:id
  // @desc    Lấy bản ghi CCCD theo ID
  // @access  Public
  router.get("/id-info/:id", cccdInfoController.getById);

  app.use('/api', router);
};