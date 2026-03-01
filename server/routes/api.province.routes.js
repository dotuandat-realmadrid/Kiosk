// server/routes/api.province.routes.js
module.exports = (app) => {
    const provinceController = require('../controllers/api.province.controller');
    const { authenticateToken } = require('../middlewares/auth.middleware');
    var router = require("express").Router();

    /**
     * @route   GET /api/provinces
     * @desc    Tìm kiếm tỉnh/thành phố với phân trang
     * @access  Private
     * @query   id, code, name, is_active, page, pageSize
     */
    router.get('/', authenticateToken, provinceController.searchProvinces);

    /**
     * @route   GET /api/provinces/:id
     * @desc    Lấy thông tin chi tiết tỉnh/thành phố theo ID
     * @access  Private
     */
    router.get('/:id', authenticateToken, provinceController.getProvinceById);

    /**
     * @route   POST /api/provinces
     * @desc    Thêm mới tỉnh/thành phố
     * @access  Private (Admin)
     * @body    code, name, is_active
     */
    router.post('/', authenticateToken, provinceController.createProvince);

    /**
     * @route   PUT /api/provinces/:id
     * @desc    Cập nhật thông tin tỉnh/thành phố
     * @access  Private (Admin)
     * @body    code, name, is_active
     */
    router.put('/:id', authenticateToken, provinceController.updateProvince);

    /**
     * @route   DELETE /api/provinces
     * @desc    Xóa một hoặc nhiều tỉnh/thành phố
     * @access  Private (Admin)
     * @body    ids (array)
     */
    router.delete('/', authenticateToken, provinceController.deleteProvinces);

    /**
     * @route   PATCH /api/provinces/toggle
     * @desc    Bật/tắt trạng thái nhiều tỉnh/thành phố
     * @access  Private (Admin)
     * @body    ids (array), is_active (boolean)
     */
    router.patch('/toggle', authenticateToken, provinceController.toggleProvinces);

    
    app.use('/api/provinces', router);
}