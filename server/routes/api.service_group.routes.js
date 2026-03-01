// ==========================================
// server/routes/api.service_group.routes.js
// ==========================================
module.exports = (app) => {

    var router = require("express").Router();
    const serviceGroupController = require('../controllers/api.service_group.controller');
    const { authenticateToken } = require('../middlewares/auth.middleware');

    /**
     * @route   GET /api/service-groups
     * @desc    Tìm kiếm nhóm dịch vụ với phân trang
     * @access  Private
     * @query   id, code, name_vi, is_active, page, size
     */
    router.get('', authenticateToken, serviceGroupController.searchServiceGroups);

    /**
     * @route   GET /api/service-groups/active
     * @desc    Lấy danh sách tất cả nhóm dịch vụ đang active
     * @access  Private
     */
    router.get('/active', authenticateToken, serviceGroupController.getAllActiveServiceGroups);

    /**
     * @route   GET /api/service-groups/:id
     * @desc    Lấy thông tin chi tiết nhóm dịch vụ theo ID
     * @access  Private
     */
    router.get('/:id', authenticateToken, serviceGroupController.getServiceGroupById);

    /**
     * @route   POST /api/service-groups
     * @desc    Thêm mới nhóm dịch vụ
     * @access  Private (Admin)
     * @body    code, name_vi, name_en, name_ja, name_cn, name_sp, representative_image, is_active
     */
    router.post('', authenticateToken, serviceGroupController.createServiceGroup);

    /**
     * @route   PUT /api/service-groups/:id
     * @desc    Cập nhật thông tin nhóm dịch vụ
     * @access  Private (Admin)
     * @body    code, name_vi, name_en, name_ja, name_cn, name_sp, representative_image, is_active
     */
    router.put('/:id', authenticateToken, serviceGroupController.updateServiceGroup);

    /**
     * @route   DELETE /api/service-groups
     * @desc    Xóa một hoặc nhiều nhóm dịch vụ
     * @access  Private (Admin)
     * @body    ids (array)
     */
    router.delete('', authenticateToken, serviceGroupController.deleteServiceGroups);

    /**
     * @route   PATCH /api/service-groups/toggle
     * @desc    Bật/tắt trạng thái nhiều nhóm dịch vụ
     * @access  Private (Admin)
     * @body    ids (array), is_active (boolean)
     */
    router.patch('/toggle', authenticateToken, serviceGroupController.toggleServiceGroups);

    
    app.use('/api/service-groups', router);
}