module.exports = (app) => {

    var router = require("express").Router();
    const branchController = require('../controllers/api.branch.controller');
    const { authenticateToken } = require('../middlewares/auth.middleware');

    // ==================== SEARCH ====================
    
    /**
     * @route   GET /api/branches
     * @desc    Tìm kiếm chi nhánh với phân trang
     */
    router.get('', authenticateToken, branchController.searchBranches);

    // ==================== SERVICE CONFIG - ĐẶT TRƯỚC CÁC ROUTE CỤ THỂ ====================

    /**
     * @route   GET /api/branches/:id/service-config
     */
    router.get('/:id/service-config', authenticateToken, branchController.getServiceConfig);

    /**
     * @route   PUT /api/branches/:id/service-config
     */
    router.put('/:id/service-config', authenticateToken, branchController.setServiceConfig);

    /**
     * @route   DELETE /api/branches/:id/service-config
     */
    router.delete('/:id/service-config', authenticateToken, branchController.clearServiceConfig);

    /**
     * @route   POST /api/branches/:id/services
     */
    router.post('/:id/services', authenticateToken, branchController.addServices);

    /**
     * @route   DELETE /api/branches/:id/services
     */
    router.delete('/:id/services', authenticateToken, branchController.removeServices);

    /**
     * @route   POST /api/branches/:id/service-groups
     */
    router.post('/:id/service-groups', authenticateToken, branchController.addServiceGroups);

    /**
     * @route   DELETE /api/branches/:id/service-groups
     */
    router.delete('/:id/service-groups', authenticateToken, branchController.removeServiceGroups);

    // ==================== QUEUE CONFIG ====================

    /**
     * @route   GET /api/branches/:id/queue-config
     */
    router.get('/:id/queue-config', authenticateToken, branchController.getQueueConfig);

    /**
     * @route   PUT /api/branches/:id/queue-config
     */
    router.put('/:id/queue-config', authenticateToken, branchController.updateQueueConfig);

    // ==================== REPORT CONFIG ====================

    /**
     * @route   GET /api/branches/:id/report-config
     */
    router.get('/:id/report-config', authenticateToken, branchController.getReportConfig);

    /**
     * @route   PUT /api/branches/:id/report-config
     */
    router.put('/:id/report-config', authenticateToken, branchController.updateReportConfig);

    // ==================== TOGGLE (PHẢI TRƯỚC /:id) ====================

    /**
     * @route   PATCH /api/branches/toggle
     */
    router.patch('/toggle', authenticateToken, branchController.toggleBranches);

    // ==================== BASIC CRUD - ĐẶT CUỐI ====================

    /**
     * @route   GET /api/branches/:id
     */
    router.get('/:id', authenticateToken, branchController.getBranchById);

    /**
     * @route   POST /api/branches
     */
    router.post('', authenticateToken, branchController.createBranch);

    /**
     * @route   PUT /api/branches/:id
     */
    router.put('/:id', authenticateToken, branchController.updateBranch);

    /**
     * @route   DELETE /api/branches
     */
    router.delete('', authenticateToken, branchController.deleteBranches);

    
    app.use('/api/branches', router);
};