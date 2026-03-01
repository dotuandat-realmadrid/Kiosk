// user.role.routes.js
module.exports = app => {
  const userRoles = require("../controllers/api.user_role.controller.js");
  const { authenticateToken } = require("../middlewares/auth.middleware.js");
  var router = require("express").Router();

  // Tất cả routes đều yêu cầu authentication
  router.use(authenticateToken);

  // ========== USER-ROLE ASSIGNMENT (Admin only) ==========
  
  // Get all assignments (Admin only)
  router.get("/", userRoles.getAllAssignments);

  // Assign single role to user
  router.post("/assign", userRoles.assignRole);

  // Remove single role from user
  router.delete("/remove", userRoles.removeRole);

  // Get users by role
  router.get("/role/:roleId/users", userRoles.getUsersByRole);

  // Get all roles of a user
  router.get("/users/:userId/roles", userRoles.getUserRoles);

  // Assign multiple roles to user (Replace existing)
  router.put("/users/:userId/roles", userRoles.assignRoles);

  // Add multiple roles to user (Keep existing)
  router.post("/users/:userId/roles", userRoles.addRoles);

  // Remove multiple roles from user
  router.delete("/users/:userId/roles", userRoles.removeRoles);

  // Check if user has a specific role
  router.get("/users/:userId/roles/:roleId/check", userRoles.checkUserRole);

  app.use('/api/user-roles', router);
};