// ==========================================
// routes/api.kiosk.routes.js (UPDATED - THEO MODEL MỚI)
// ==========================================
module.exports = (app) => {

    var router = require("express").Router();
    const kioskController = require('../controllers/api.kiosk.controller');
    const { authenticateToken } = require('../middlewares/auth.middleware');

    // ==================== SEARCH & READ ====================

    /**
     * @route   GET /api/kiosks
     * @desc    Tìm kiếm kiosk với phân trang
     * @access  Private
     * @query   id, code, name, transaction_office_id, district_id, district_code, province_id, province_code, is_active, page, size
     */
    router.get('', authenticateToken, kioskController.searchKiosks);

    /**
     * @route   GET /api/kiosks/code/:code
     * @desc    Lấy thông tin kiosk theo code
     * @access  Private
     */
    router.get('/get-by-kiosk-code/:code', kioskController.getKioskByCode);

    /**
     * @route   GET /api/kiosks/:id
     * @desc    Lấy thông tin chi tiết kiosk theo ID
     * @access  Private
     */
    router.get('/:id', authenticateToken, kioskController.getKioskById);

    // ==================== SERVICE CONFIG MANAGEMENT ====================

    /**
     * @route   GET /api/kiosks/:id/service-config
     * @desc    Lấy cấu hình dịch vụ và nhóm dịch vụ của kiosk
     * @access  Private
     * @return  { services: [...], service_groups: [...] }
     */
    router.get('/:id/service-config', authenticateToken, kioskController.getServiceConfig);

    /**
     * @route   PUT /api/kiosks/:id/service-config
     * @desc    Cấu hình services và service_groups (replace toàn bộ)
     * @access  Private (Admin)
     * @body    { service_ids: [...], service_group_ids: [...] }
     */
    router.put('/:id/service-config', authenticateToken, kioskController.setServiceConfig);

    /**
     * @route   POST /api/kiosks/:id/services
     * @desc    Thêm services vào kiosk (không xóa cũ)
     * @access  Private (Admin)
     * @body    { service_ids: [...] }
     */
    router.post('/:id/services', authenticateToken, kioskController.addServices);

    /**
     * @route   DELETE /api/kiosks/:id/services
     * @desc    Xóa services khỏi kiosk
     * @access  Private (Admin)
     * @body    { service_ids: [...] }
     */
    router.delete('/:id/services', authenticateToken, kioskController.removeServices);

    /**
     * @route   POST /api/kiosks/:id/service-groups
     * @desc    Thêm service_groups vào kiosk (không xóa cũ)
     * @access  Private (Admin)
     * @body    { service_group_ids: [...] }
     */
    router.post('/:id/service-groups', authenticateToken, kioskController.addServiceGroups);

    /**
     * @route   DELETE /api/kiosks/:id/service-groups
     * @desc    Xóa service_groups khỏi kiosk
     * @access  Private (Admin)
     * @body    { service_group_ids: [...] }
     */
    router.delete('/:id/service-groups', authenticateToken, kioskController.removeServiceGroups);

    /**
     * @route   DELETE /api/kiosks/:id/service-config
     * @desc    Xóa tất cả cấu hình services và service_groups
     * @access  Private (Admin)
     */
    router.delete('/:id/service-config', authenticateToken, kioskController.clearServiceConfig);

    // ==================== CREATE ====================

    /**
     * @route   POST /api/kiosks
     * @desc    Thêm mới kiosk
     * @access  Private (Admin)
     * @body    {
     *            code: string,
     *            name: string,
     *            transaction_office_id: 'uuid',
     *            service_ids?: [...],
     *            service_group_ids?: [...],
     *            is_active: boolean
     *          }
     */
    router.post('', authenticateToken, kioskController.createKiosk);

    // ==================== UPDATE ====================

    /**
     * @route   PUT /api/kiosks/:id
     * @desc    Cập nhật thông tin kiosk
     * @access  Private (Admin)
     * @body    code, name, transaction_office_id, is_active
     */
    router.put('/:id', authenticateToken, kioskController.updateKiosk);

    /**
     * @route   PATCH /api/kiosks/toggle
     * @desc    Bật/tắt trạng thái nhiều kiosk
     * @access  Private (Admin)
     * @body    ids (array), is_active (boolean)
     */
    router.patch('/toggle', authenticateToken, kioskController.toggleKiosks);

    // ==================== DELETE ====================

    /**
     * @route   DELETE /api/kiosks
     * @desc    Xóa một hoặc nhiều kiosk
     * @access  Private (Admin)
     * @body    ids (array)
     */
    router.delete('', authenticateToken, kioskController.deleteKiosks);

    
    app.use('/api/kiosks', router);
};