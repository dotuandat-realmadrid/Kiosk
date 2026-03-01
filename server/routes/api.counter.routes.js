// ==========================================
// routes/api.counter.routes.js (FIXED)
// ==========================================
module.exports = (app) => {

    var router = require("express").Router();
    const counterController = require('../controllers/api.counter.controller');
    const { authenticateToken } = require('../middlewares/auth.middleware');

    // ==================== SEARCH & READ ====================

    /**
     * @route   GET /api/counters
     * @desc    Tìm kiếm quầy với phân trang
     * @access  Private
     * @query   id, code, name, counter_number, transaction_office_id, district_id, district_code, province_id, province_code, is_active, page, size
     */
    router.get('', authenticateToken, counterController.searchCounters);

    /**
     * @route   GET /api/counters/:id
     * @desc    Lấy thông tin chi tiết quầy theo ID
     * @access  Private
     */
    router.get('/:id', authenticateToken, counterController.getCounterById);

    // ==================== SERVICE CONFIG MANAGEMENT ====================

    /**
     * @route   GET /api/counters/:id/service-config
     * @desc    Lấy cấu hình dịch vụ của quầy
     * @access  Private
     * @return  { services: [...], priority_services: [...] }
     */
    router.get('/:id/service-config', authenticateToken, counterController.getServiceConfig);

    /**
     * @route   PUT /api/counters/:id/service-config
     * @desc    Cấu hình services (replace toàn bộ)
     * @access  Private (Admin)
     * @body    { service_ids: [...], priority_service_ids: [...] }
     */
    router.put('/:id/service-config', authenticateToken, counterController.setServiceConfig);

    /**
     * @route   POST /api/counters/:id/services
     * @desc    Thêm services vào quầy (không xóa cũ)
     * @access  Private (Admin)
     * @body    { service_ids: [...], priority_service_ids: [...] }
     */
    router.post('/:id/services', authenticateToken, counterController.addServices);

    /**
     * @route   DELETE /api/counters/:id/services
     * @desc    Xóa services khỏi quầy
     * @access  Private (Admin)
     * @body    { service_ids: [...] }
     */
    router.delete('/:id/services', authenticateToken, counterController.removeServices);

    /**
     * @route   DELETE /api/counters/:id/service-config
     * @desc    Xóa tất cả cấu hình services
     * @access  Private (Admin)
     */
    router.delete('/:id/service-config', authenticateToken, counterController.clearServiceConfig);

    /**
     * @route   PUT /api/counters/:id/priority-services
     * @desc    Cập nhật danh sách dịch vụ ưu tiên của quầy
     * @access  Private (Admin)
     * @body    { priority_service_ids: [...] }
     */
    router.put('/:id/priority-services', authenticateToken, counterController.updatePriorityServices);

    // ==================== CREATE ====================

    /**
     * @route   POST /api/counters
     * @desc    Thêm mới quầy
     * @access  Private (Admin)
     * @body    {
     *            code: string,
     *            name: string,
     *            counter_number: number,
     *            led_board_number?: number,
     *            transaction_office_id: 'uuid',
     *            service_ids?: [...],
     *            priority_service_ids?: [...],
     *            is_active: boolean
     *          }
     */
    router.post('', authenticateToken, counterController.createCounter);

    // ==================== UPDATE ====================

    /**
     * @route   PUT /api/counters/:id
     * @desc    Cập nhật thông tin quầy
     * @access  Private (Admin)
     * @body    code, name, counter_number, led_board_number, transaction_office_id, is_active
     */
    router.put('/:id', authenticateToken, counterController.updateCounter);

    /**
     * @route   PATCH /api/counters/toggle
     * @desc    Bật/tắt trạng thái nhiều quầy
     * @access  Private (Admin)
     * @body    { ids: [...], is_active: boolean }
     */
    router.patch('/toggle', authenticateToken, counterController.toggleCounters);

    // ==================== DELETE ====================

    /**
     * @route   DELETE /api/counters
     * @desc    Xóa một hoặc nhiều quầy
     * @access  Private (Admin)
     * @body    { ids: [...] }
     */
    router.delete('', authenticateToken, counterController.deleteCounters);

    
    app.use('/api/counters', router);
};