// ==========================================
// transaction.routes.js
// ==========================================
module.exports = app => {
  const transactions = require("../controllers/api.transaction.controller.js");
  const { authenticateToken, checkRole, checkAnyRole } = require("../middlewares/auth.middleware.js");
  var router = require("express").Router();

  // ========== STATIC ROUTES (đặt TRƯỚC /:id để tránh conflict) ==========

  // Lấy transaction mới nhất
  // GET /api/transactions/latest
  router.get("/latest", authenticateToken, transactions.getLatest);

  // Lấy danh sách chờ hôm nay (có thể filter theo service_id)
  // GET /api/transactions/waiting?service_id=uuid
  router.get("/waiting", authenticateToken, transactions.getWaiting);

  // Thống kê theo ngày
  // GET /api/transactions/stats?date=YYYY-MM-DD
  router.get("/stats", authenticateToken, checkAnyRole(["ADMIN"]), transactions.getStats);

  // ========== USER-SCOPED ROUTES (đặt TRƯỚC /:id) ==========

  // Lấy giao dịch hôm nay status = waiting | serving theo user
  // GET /api/transactions/user/:userId/active
  router.get("/user/:userId/active", transactions.getActiveByUser);

  // Lấy giao dịch hôm nay status = cancelled theo user
  // GET /api/transactions/user/:userId/cancelled
  router.get("/user/:userId/cancelled", authenticateToken, transactions.getCancelledByUser);

  // ========== TRANSACTION CRUD ==========

  // Tạo transaction mới
  // POST /api/transactions
  router.post("/", transactions.create);

  // Lấy danh sách transactions (filter + pagination)
  // GET /api/transactions
  router.get("/", transactions.findAll);

  // Lấy transaction theo ID
  // GET /api/transactions/:id
  router.get("/:id", transactions.findOne);

  // Cập nhật transaction
  // PUT /api/transactions/:id
  router.put("/:id", authenticateToken, checkAnyRole(["ADMIN", "USER"]), transactions.update);

  // Cập nhật trạng thái transaction
  // PATCH /api/transactions/:id/status
  router.patch("/:id/status", authenticateToken, checkAnyRole(["ADMIN", "USER"]), transactions.updateStatus);

  // Soft delete transaction
  // PATCH /api/transactions/:id/soft-delete
  router.patch("/:id/soft-delete", authenticateToken, checkAnyRole(["ADMIN"]), transactions.softDelete);

  // Xóa transaction (hard delete)
  // DELETE /api/transactions/:id
  router.delete("/:id", authenticateToken, checkRole("ADMIN"), transactions.delete);

  app.use('/api/transactions', router);
};