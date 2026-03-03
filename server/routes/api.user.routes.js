// ==========================================
// user.routes.js (UPDATED - THÊM COUNTER ENDPOINT)
// ==========================================
module.exports = app => {
  const users = require("../controllers/api.user.controller.js");
  const { authenticateToken, checkRole, checkAllRoles, checkAnyRole } = require("../middlewares/auth.middleware.js");
  const express = require('express');
  var router = express.Router();

  // ========== USER CRUD ==========

  // Create a new User
  router.post("/", authenticateToken, checkRole("ADMIN"), users.create);

  // Retrieve all Users
  router.get("/", authenticateToken, checkAnyRole(["ADMIN", "MANAGER"]), users.findAll);

  // Retrieve my info
  router.get("/myInfo", authenticateToken, users.getMyInfo);

  // Retrieve all active Users
  router.get("/active", authenticateToken, checkRole("ADMIN"), users.findAllActive);

  // Retrieve a single User with id
  router.get("/:id", authenticateToken, users.findOne);

  // Toggle user active status
  router.put("/toggle", authenticateToken, checkRole("ADMIN"), users.toggleActive);

  // Unlock user account
  router.put("/:id/unlock", authenticateToken, checkRole("ADMIN"), users.unlockAccount);

  // ✅ UPDATE COUNTER - THÊM MỚI (đặt TRƯỚC route /:id để tránh conflict)
  router.put("/:id/counter", authenticateToken, checkRole("USER"), users.updateCounter);

  // Update a User with id
  router.put("/:id", authenticateToken, users.update);

  // Delete a User with id
  router.delete("/:id", authenticateToken, checkRole("ADMIN"), users.delete);

  /**
   * Lấy user theo counter_id
   * GET /api/users/counter/:counterId
   */
  router.get('/counter/:counterId', authenticateToken, users.getUserByCounterId);

  /**
   * Lấy user theo counter code
   * GET /api/users/counter-code/:counterCode
   */
  router.get('/counter-code/:counterCode', authenticateToken, users.getUserByCounterCode);

  app.use('/api/users', router);
};