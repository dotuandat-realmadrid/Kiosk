// server/routes/print.routes.js
module.exports = app => {
  const printController = require("../controllers/print.controller.js");
  const router = require("express").Router();

  // @route   POST /api/print/printer
  // @desc    Generate and print thermal receipt ticket
  // @access  Public
  router.post("/printer", printController.printTicket);

  // @route   GET /api/print/thermal-status
  // @desc    Check thermal printer status and list available printers
  // @access  Public
  router.get("/thermal-status", printController.getThermalStatus);

  // @route   GET /api/print/thermal-test
  // @desc    Test thermal printer with sample data
  // @access  Public
  router.get("/thermal-test", printController.thermalTest);

  app.use('/api/print', router);
};