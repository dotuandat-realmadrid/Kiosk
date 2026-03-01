require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { WebSocketServer } = require('ws');

const app = express();

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// 1. CORS - Phải đặt đầu tiên
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// 2. Helmet
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// 3. Parse JSON và URL-encoded - PHẢI ĐẶT TRƯỚC middleware log
app.use(express.json({ 
  limit: '50mb',
  strict: false
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb' 
}));

// 4. MIDDLEWARE LOG REQUEST (sau khi parse)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  // console.log(`\n${'='.repeat(70)}`);
  // console.log(`📥 [${timestamp}] ${req.method} ${req.url}`);
  // console.log(`📍 From: ${req.ip || req.connection.remoteAddress}`);
  // console.log(`📋 Headers:`, {
  //   'content-type': req.headers['content-type'],
  //   'content-length': req.headers['content-length'],
  //   'user-agent': req.headers['user-agent']
  // });
  
  if (req.body && Object.keys(req.body).length > 0) {
    // console.log(`📦 Body Keys:`, Object.keys(req.body));
    // console.log(`📦 Body Preview:`, JSON.stringify(req.body).substring(0, 200));
  } else {
    console.log(`⚠️ Body: EMPTY`);
  }
  // console.log(`${'='.repeat(70)}\n`);
  
  next();
});

// 5. Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { 
    success: false, 
    message: 'Quá nhiều requests, vui lòng thử lại sau' 
  }
});
app.use('/api/', limiter);

// 6. Config view engine (nếu có)
const configViewEngine = require('./configs/view.engine');
configViewEngine(app, express, path);

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================
const db = require("./models");

db.sequelize.sync({ alter: false })
  .then(() => {
    // console.log("✅ Database synced successfully");
  })
  .catch((err) => {
    console.error("❌ Failed to sync database:", err.message);
    process.exit(1);
  });

// ============================================================================
// ROUTES
// ============================================================================

// 1. ✨ CCCDINFO API routes
require("./routes/api.cccd_info.routes")(app);

// 2. ✨ CCCDINFOBACKUP API routes
require("./routes/api.cccd_info_backup.routes")(app);

// 3. ✨ PDF routes
require('./routes/pdf.routes')(app);

// 4. ✨ Print routes
require('./routes/print.routes')(app);

// 5. ✨ Auth routes
require("./routes/api.auth.routes")(app);

// 6. ✨ User routes
require("./routes/api.user.routes")(app);

// 7. ✨ Role routes
require("./routes/api.role.routes")(app);

// 8. ✨ UserRole routes
require("./routes/api.user_role.routes")(app);

// 9. ✨ Password routes
require("./routes/api.password.routes")(app);

// 10. ✨ Province routes
require("./routes/api.province.routes")(app);

// 11. ✨ District routes
require("./routes/api.district.routes")(app);

// 12. ✨ Position routes
require("./routes/api.position.routes")(app);

// 13. ✨ Transaction Office routes
require("./routes/api.transaction_office.routes")(app);

// 14. ✨ User Transaction Office routes
require("./routes/api.user_transaction_office.routes")(app);

// 15. ✨ Ticket Format routes
require("./routes/api.ticket_format.routes")(app);

// 16. ✨ Service routes
require("./routes/api.service.routes")(app);

// 17. ✨ Service Group routes
require("./routes/api.service_group.routes")(app);

// 18. ✨ Service Group Mapping routes
require("./routes/api.service_group_mapping.routes")(app);

// 19. ✨ Branch routes
require("./routes/api.branch.routes")(app);

// 20. ✨ Kiosk routes
require("./routes/api.kiosk.routes")(app);

// 21. ✨ Counter routes
require("./routes/api.counter.routes")(app);

// 22. ✨ Transaction routes
require("./routes/api.transaction.routes")(app);

// 23. ✨ E Center Board routes
require("./routes/api.e_center_board.routes")(app);

// xx. ✨ Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Coop-bank Kiosk Server is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
    database: 'MySQL',
    endpoints: {
      pdf: '/api/pdf/fill-template',
      print: '/api/print/printer',
      users: '/api/id-info/'
    }
  });
});

// ============================================================================
// SERVER & WEBSOCKET INITIALIZATION
// ============================================================================
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`✅ Server đang chạy trên port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📊 Database: MySQL`);
  console.log(`\n📡 Available Endpoints:`);
  console.log(`   GET  /api/health            - Health check`);
  console.log(`   GET  /api/latest            - Lấy bản ghi CCCD mới nhất`);
  console.log(`   POST /api/id-info/          - Nhận dữ liệu từ thiết bị đọc CCCD`);
  console.log(`   GET  /api/cccd/:id          - Tìm CCCD theo ID`);
  console.log(`\n📄 PDF Endpoints:`);
  console.log(`   POST /api/pdf/fill-template - Tạo PDF từ template`);
  console.log(`   GET  /api/pdf/list-pdfs     - Danh sách PDF`);
  console.log(`   GET  /api/pdf/view-pdf/:filename - Xem PDF`);
  console.log(`   POST /api/pdf/convert-html-to-pdf - In PDF`);
  console.log(`\n🖨️  Print Endpoints:`);
  console.log(`   POST /api/print/printer     - In phiếu nhiệt`);
  console.log(`   GET  /api/print/thermal-status - Trạng thái máy in`);
  console.log(`${'='.repeat(70)}\n`);
  console.log(`⏳ Đang chờ dữ liệu từ thiết bị TrustID...\n`);
});

// WebSocket Server Setup
const wss = new WebSocketServer({ server });
global.wss = wss;

// ✨ WebSocket helper function
function getClientStats() {
  let total = 0;
  let kiosk = 0;
  wss.clients.forEach((client) => {
    total += 1;
    if (client.kioskRoom) kiosk += 1;
  });
  return { total, kiosk };
}

function broadcastToKiosk(messageObj) {
  const payload = JSON.stringify(messageObj);
  const { total, kiosk } = getClientStats();
  console.log('📡 [WS] Broadcasting to kiosk clients', { totalClients: total, kioskClients: kiosk });
  let sent = 0;
  wss.clients.forEach((client) => {
    try {
      if (client.readyState === 1 && client.kioskRoom) { // 1 = OPEN
        client.send(payload);
        sent += 1;
      }
    } catch (err) {
      console.error('❌ [WS] Error sending to a client:', err?.message || err);
    }
  });
  console.log('✅ [WS] Broadcast complete. Sent to', sent, 'client(s).');
}

// Expose helper via app for routes
app.set('wsBroadcastToKiosk', broadcastToKiosk);
app.set('wss', wss);

wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log('🔌 WebSocket: Client kết nối từ:', clientIP);
  
  // Set up keepalive
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  
  ws.send(JSON.stringify({
    event: 'connected',
    message: 'Kết nối WebSocket thành công',
    timestamp: new Date().toISOString()
  }));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`📨 WebSocket nhận từ ${clientIP}:`, data);
      
      // Handle join-kiosk message
      if (data.type === 'join-kiosk') {
        ws.kioskRoom = true;
        console.log('🏦 Client joined kiosk room');
        ws.send(JSON.stringify({ type: 'joined', message: 'Joined kiosk room' }));
      }
    } catch (error) {
      console.error('❌ Error parsing message:', error);
      console.log('Raw message:', message.toString());
    }
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error từ', clientIP, ':', error);
  });
  
  ws.on('close', (code, reason) => {
    console.log(`❌ WebSocket ngắt kết nối - IP: ${clientIP}, Code: ${code}`);
  });
});

// Keepalive ping (giống index.js)
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.warn('⚠️ [WS] Terminating stale client');
      return ws.terminate();
    }
    ws.isAlive = false;
    try {
      ws.ping(() => {});
    } catch (_) {}
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// ============================================================================
// GLOBAL ERROR HANDLERS
// ============================================================================
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Export
module.exports = { app, server, wss };