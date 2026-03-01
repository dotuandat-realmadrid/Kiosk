// auth.routes.js
module.exports = app => {
  const auth = require("../controllers/api.auth.controller.js");
  const { authenticateToken } = require("../middlewares/auth.middleware.js");
  const rateLimit = require('express-rate-limit');
  
  var router = require("express").Router();

  // Rate limiting cho đăng nhập
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5, // 5 requests
    message: { 
      success: false, 
      message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút' 
    }
  });

  // Public routes
  router.post("/register", auth.register);
  router.post("/login", loginLimiter, auth.login);
  router.post('/introspect', auth.introspect);
  router.post("/refresh-token", auth.refreshToken);
  router.post("/logout", auth.logout);

  // Protected routes
  router.put("/change-password", authenticateToken, auth.changePassword);

  app.use('/api/auth', router);
};