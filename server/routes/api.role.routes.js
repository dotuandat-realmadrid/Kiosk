// role.routes.js
module.exports = app => {
  const roles = require("../controllers/api.role.controller.js");
  const { authenticateToken } = require("../middlewares/auth.middleware.js");
  var router = require("express").Router();

  // // Tất cả routes đều yêu cầu authentication
  // router.use(authenticateToken);

  // ========== ROLE CRUD (Admin only) ==========
  
  // Create a new Role
  router.post("/", roles.create);

  // Retrieve all Roles
  router.get("/", roles.findAll);

  // Find role by code
  router.get("/code/:code", roles.findByCode);

  // Get all users with a specific role
  router.get("/:roleId/users", roles.getUsersByRole);

  // Retrieve a single Role with id
  router.get("/:id", roles.findOne);

  // Update a Role with id
  router.put("/:id", roles.update);

  // Toggle role active status
  router.put("/:id/toggle", roles.toggleActive);

  // Delete a Role with id (safe delete - check if used)
  router.delete("/:id", authenticateToken, roles.delete);

  // Force delete a Role (delete even if has users)
  router.delete("/:id/force", authenticateToken, roles.forceDelete);

  // Delete all Roles
  router.delete("/", authenticateToken, roles.deleteAll);

  app.use('/api/roles', router);
};