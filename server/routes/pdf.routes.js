// server/routes/pdf.routes.js
module.exports = app => {
  const pdfController = require("../controllers/pdf.controller.js");
  const cors = require('cors');
  const express = require('express');
  const router = express.Router();

  // Middleware
  router.use(cors());
  router.use(express.json({ limit: '50mb' }));
  router.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // @route   GET /api/pdf/pdfs/:filename
  // @desc    Serve PDF file from uploads directory
  // @access  Public
  router.get("/pdfs/:filename", pdfController.servePdf);

  // @route   GET /api/pdf/list-pdfs
  // @desc    List all PDF files in monthly directory
  // @access  Public
  router.get("/list-pdfs", pdfController.listPdfs);

  // @route   POST /api/pdf/fill-template
  // @desc    Fill HTML template with customer data and generate PDF
  // @access  Public
  router.post("/fill-template", pdfController.fillTemplate);

  // @route   GET /api/pdf/view-pdf/:filename
  // @desc    View PDF file optimized for iframe embedding
  // @access  Public
  router.get("/view-pdf/:filename", pdfController.viewPdf);

  // @route   POST /api/pdf/convert-html-to-pdf
  // @desc    Print an existing PDF file to connected printer
  // @access  Public
  router.post("/convert-html-to-pdf", pdfController.convertHtmlToPdf);

  // ✅ Di chuyển dòng này VÀO trong hàm module.exports nhưng TRƯỚC khi kết thúc
  app.use('/api/pdf', router);
};