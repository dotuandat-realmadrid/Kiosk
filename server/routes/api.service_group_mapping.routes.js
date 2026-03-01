// ==========================================
// server/routes/api.service_group_mapping.routes.js
// ==========================================
module.exports = (app) => {

    var router = require("express").Router();
    const serviceGroupMappingController = require('../controllers/api.service_group_mapping.controller');
    const { authenticateToken } = require('../middlewares/auth.middleware');

    // ==================== MAPPING QUERIES ====================

    /**
     * @route   GET /api/service-group-mappings
     * @desc    Tìm kiếm tất cả mapping với phân trang
     * @access  Private
     * @query   service_id, service_group_id, page, size
     */
    router.get('', authenticateToken, serviceGroupMappingController.searchMappings);

    /**
     * @route   GET /api/service-group-mappings/group/:groupId/services
     * @desc    Lấy danh sách dịch vụ thuộc nhóm
     * @access  Private
     * @query   page, size
     */
    router.get('/group/:groupId/services', authenticateToken, serviceGroupMappingController.getServicesByGroup);

    /**
     * @route   GET /api/service-group-mappings/service/:serviceId/groups
     * @desc    Lấy danh sách nhóm mà dịch vụ thuộc về
     * @access  Private
     * @query   page, size
     */
    router.get('/service/:serviceId/groups', authenticateToken, serviceGroupMappingController.getGroupsByService);

    // ==================== GROUP OPERATIONS ====================

    /**
     * @route   POST /api/service-group-mappings/group/:groupId/services
     * @desc    Thêm nhiều dịch vụ vào nhóm
     * @access  Private (Admin)
     * @body    service_ids (array)
     */
    router.post('/group/:groupId/services', authenticateToken, serviceGroupMappingController.addServicesToGroup);

    /**
     * @route   DELETE /api/service-group-mappings/group/:groupId/services
     * @desc    Xóa nhiều dịch vụ khỏi nhóm
     * @access  Private (Admin)
     * @body    service_ids (array)
     */
    router.delete('/group/:groupId/services', authenticateToken, serviceGroupMappingController.removeServicesFromGroup);

    /**
     * @route   DELETE /api/service-group-mappings/group/:groupId/services/all
     * @desc    Xóa tất cả dịch vụ khỏi nhóm
     * @access  Private (Admin)
     */
    router.delete('/group/:groupId/services/all', authenticateToken, serviceGroupMappingController.removeAllServicesFromGroup);

    // ==================== SERVICE OPERATIONS ====================

    /**
     * @route   POST /api/service-group-mappings/service/:serviceId/groups
     * @desc    Thêm dịch vụ vào nhiều nhóm
     * @access  Private (Admin)
     * @body    group_ids (array)
     */
    router.post('/service/:serviceId/groups', authenticateToken, serviceGroupMappingController.addGroupsToService);

    /**
     * @route   DELETE /api/service-group-mappings/service/:serviceId/groups
     * @desc    Xóa dịch vụ khỏi nhiều nhóm
     * @access  Private (Admin)
     * @body    group_ids (array)
     */
    router.delete('/service/:serviceId/groups', authenticateToken, serviceGroupMappingController.removeGroupsFromService);

    /**
     * @route   DELETE /api/service-group-mappings/service/:serviceId/groups/all
     * @desc    Xóa dịch vụ khỏi tất cả nhóm
     * @access  Private (Admin)
     */
    router.delete('/service/:serviceId/groups/all', authenticateToken, serviceGroupMappingController.removeServiceFromAllGroups);

    
    app.use('/api/service-group-mappings', router);
}