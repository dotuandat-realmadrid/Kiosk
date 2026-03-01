// server/routes/password.routes.js
module.exports = app => {
  const passwordController = require("../controllers/api.password.controller.js");
  const { authenticateToken, checkRole } = require("../middlewares/auth.middleware.js");

  const router = require("express").Router();

  // Đặt mật khẩu lần đầu (user chưa có password)
  router.put("/set", authenticateToken, passwordController.setPassword);

  // Đổi mật khẩu (user đã có password)
  router.put("/change", authenticateToken, passwordController.changePassword);

  // Reset mật khẩu về mặc định (chỉ admin)
  router.put("/reset/:id", authenticateToken, checkRole("ADMIN"), passwordController.resetPassword);

  // Kiểm tra user có password chưa
  router.get("/has-password", authenticateToken, passwordController.hasPassword);

  app.use('/api/password', router);
};