// server/routes/api.service.routes.js
module.exports = (app) => {

    var router = require("express").Router();
    const serviceController = require('../controllers/api.service.controller');
    const { authenticateToken } = require('../middlewares/auth.middleware');

    /**
     * @route   GET /api/services
     * @desc    Tìm kiếm dịch vụ với phân trang
     * @access  Private
     * @query   id, format_id, code, name_vi, is_active, page, size
     */
    router.get('', authenticateToken, serviceController.searchServices);

    /**
     * @route   GET /api/services/:id
     * @desc    Lấy thông tin chi tiết dịch vụ theo ID
     * @access  Private
     */
    router.get('/:id', authenticateToken, serviceController.getServiceById);

    /**
     * @route   GET /api/services/ticket-format/:formatId
     * @desc    Lấy danh sách dịch vụ theo định dạng vé
     * @access  Private
     */
    router.get('/ticket-format/:formatId', authenticateToken, serviceController.getServicesByTicketFormat);

    /**
     * @route   POST /api/services
     * @desc    Thêm mới dịch vụ
     * @access  Private (Admin)
     * @body    format_id, code, name_vi, name_en, name_ja, name_cn, name_sp, representative_image, is_active
     */
    router.post('', authenticateToken, serviceController.createService);

    /**
     * @route   PUT /api/services/:id
     * @desc    Cập nhật thông tin dịch vụ
     * @access  Private (Admin)
     * @body    format_id, code, name_vi, name_en, name_ja, name_cn, name_sp, representative_image, is_active
     */
    router.put('/:id', authenticateToken, serviceController.updateService);

    /**
     * @route   DELETE /api/services
     * @desc    Xóa một hoặc nhiều dịch vụ
     * @access  Private (Admin)
     * @body    ids (array)
     */
    router.delete('', authenticateToken, serviceController.deleteServices);

    /**
     * @route   PATCH /api/services/toggle
     * @desc    Bật/tắt trạng thái nhiều dịch vụ
     * @access  Private (Admin)
     * @body    ids (array), is_active (boolean)
     */
    router.patch('/toggle', authenticateToken, serviceController.toggleServices);

    
  app.use('/api/services', router);
}