// server/routes/api.district.routes.js
module.exports = (app) => {

    var router = require("express").Router();
    const districtController = require('../controllers/api.district.controller');
    const { authenticateToken } = require('../middlewares/auth.middleware');

    /**
     * @route   GET /api/districts
     * @desc    Tìm kiếm quận/huyện với phân trang
     * @access  Private
     * @query   id, province_id, code, name, is_active, page, pageSize
     */
    router.get('', authenticateToken, districtController.searchDistricts);

    /**
     * @route   GET /api/districts/:id
     * @desc    Lấy thông tin chi tiết quận/huyện theo ID
     * @access  Private
     */
    router.get('/:id', authenticateToken, districtController.getDistrictById);

    /**
     * @route   GET /api/districts/province/:provinceId
     * @desc    Lấy danh sách quận/huyện theo tỉnh
     * @access  Private
     */
    router.get('/province/:provinceId', authenticateToken, districtController.getDistrictsByProvince);

    /**
     * @route   POST /api/districts
     * @desc    Thêm mới quận/huyện
     * @access  Private (Admin)
     * @body    province_id, code, name, is_active
     */
    router.post('', authenticateToken, districtController.createDistrict);

    /**
     * @route   PUT /api/districts/:id
     * @desc    Cập nhật thông tin quận/huyện
     * @access  Private (Admin)
     * @body    province_id, code, name, is_active
     */
    router.put('/:id', authenticateToken, districtController.updateDistrict);

    /**
     * @route   DELETE /api/districts
     * @desc    Xóa một hoặc nhiều quận/huyện
     * @access  Private (Admin)
     * @body    ids (array)
     */
    router.delete('', authenticateToken, districtController.deleteDistricts);

    /**
     * @route   PATCH /api/districts/toggle
     * @desc    Bật/tắt trạng thái nhiều quận/huyện
     * @access  Private (Admin)
     * @body    ids (array), is_active (boolean)
     */
    router.patch('/toggle', authenticateToken, districtController.toggleDistricts);

    
  app.use('/api/districts', router);
}