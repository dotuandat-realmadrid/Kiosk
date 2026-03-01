// server/routes/api.ticket_format.routes.js
module.exports = (app) => {

    var router = require("express").Router();
    const ticketFormatController = require('../controllers/api.ticket_format.controller');
    const { authenticateToken } = require('../middlewares/auth.middleware');

    /**
     * @route   GET /api/ticket-formats
     * @desc    Tìm kiếm định dạng vé với phân trang
     * @access  Private
     * @query   id, code, format_pattern, is_active, page, size
     */
    router.get('', authenticateToken, ticketFormatController.searchTicketFormats);

    /**
     * @route   GET /api/ticket-formats/:id
     * @desc    Lấy thông tin chi tiết định dạng vé theo ID
     * @access  Private
     */
    router.get('/:id', authenticateToken, ticketFormatController.getTicketFormatById);

    /**
     * @route   POST /api/ticket-formats
     * @desc    Thêm mới định dạng vé
     * @access  Private (Admin)
     * @body    code, format_pattern, start_number, max_number, is_active
     */
    router.post('', authenticateToken, ticketFormatController.createTicketFormat);

    /**
     * @route   PUT /api/ticket-formats/:id
     * @desc    Cập nhật thông tin định dạng vé
     * @access  Private (Admin)
     * @body    code, format_pattern, start_number, max_number, is_active
     */
    router.put('/:id', authenticateToken, ticketFormatController.updateTicketFormat);

    /**
     * @route   DELETE /api/ticket-formats
     * @desc    Xóa một hoặc nhiều định dạng vé
     * @access  Private (Admin)
     * @body    ids (array)
     */
    router.delete('', authenticateToken, ticketFormatController.deleteTicketFormats);

    /**
     * @route   PATCH /api/ticket-formats/toggle
     * @desc    Bật/tắt trạng thái nhiều định dạng vé
     * @access  Private (Admin)
     * @body    ids (array), is_active (boolean)
     */
    router.patch('/toggle', authenticateToken, ticketFormatController.toggleTicketFormats);

    
  app.use('/api/ticket-formats', router);
}