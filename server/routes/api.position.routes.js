// server/routes/api.position.routes.js
module.exports = (app) => {

    var router = require("express").Router();
    const positionController = require('../controllers/api.position.controller');
    const { authenticateToken } = require('../middlewares/auth.middleware');

    /**
     * @route   GET /api/positions
     * @desc    Tìm kiếm chức danh với phân trang
     * @access  Private
     * @query   id, code, name, is_active, page, pageSize
     */
    router.get('', authenticateToken, positionController.searchPositions);

    /**
     * @route   GET /api/positions/active
     * @desc    Lấy tất cả chức danh đang hoạt động (không phân trang)
     * @access  Private
     */
    router.get('/active', authenticateToken, positionController.getAllActivePositions);

    /**
     * @route   GET /api/positions/:id
     * @desc    Lấy thông tin chi tiết chức danh theo ID
     * @access  Private
     */
    router.get('/:id', authenticateToken, positionController.getPositionById);

    /**
     * @route   POST /api/positions
     * @desc    Thêm mới chức danh
     * @access  Private (Admin)
     * @body    code, name, description, is_active
     */
    router.post('', authenticateToken, positionController.createPosition);

    /**
     * @route   PUT /api/positions/:id
     * @desc    Cập nhật thông tin chức danh
     * @access  Private (Admin)
     * @body    code, name, description, is_active
     */
    router.put('/:id', authenticateToken, positionController.updatePosition);

    /**
     * @route   DELETE /api/positions
     * @desc    Xóa một hoặc nhiều chức danh
     * @access  Private (Admin)
     * @body    ids (array)
     */
    router.delete('', authenticateToken, positionController.deletePositions);

    /**
     * @route   PATCH /api/positions/toggle
     * @desc    Bật/tắt trạng thái nhiều chức danh
     * @access  Private (Admin)
     * @body    ids (array), is_active (boolean)
     */
    router.patch('/toggle', authenticateToken, positionController.togglePositions);

    
  app.use('/api/positions', router);
}