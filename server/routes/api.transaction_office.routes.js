// server/routes/api.transaction_office.routes.js
module.exports = (app) => {
    const transactionOfficeController = require('../controllers/api.transaction_office.controller');
    const { authenticateToken } = require('../middlewares/auth.middleware');
    var router = require("express").Router();
    /**
     * @route   GET /api/transaction-offices
     * @desc    Tìm kiếm phòng giao dịch với phân trang
     * @access  Private
     * @query   id, province_id, district_id, code, name, address, is_active, page, pageSize
     */
    router.get('', authenticateToken, transactionOfficeController.searchTransactionOffices);

    /**
     * @route   GET /api/transaction-offices/active
     * @desc    Lấy tất cả phòng giao dịch đang hoạt động (không phân trang)
     * @access  Private
     */
    router.get('/active', authenticateToken, transactionOfficeController.getAllActiveOffices);

    /**
     * @route   GET /api/transaction-offices/district/:districtId
     * @desc    Lấy danh sách phòng giao dịch theo quận/huyện
     * @access  Private
     */
    router.get('/district/:districtId', authenticateToken, transactionOfficeController.getOfficesByDistrict);

    /**
     * @route   GET /api/transaction-offices/:id
     * @desc    Lấy thông tin chi tiết phòng giao dịch theo ID
     * @access  Private
     */
    router.get('/:id', authenticateToken, transactionOfficeController.getTransactionOfficeById);

    /**
     * @route   POST /api/transaction-offices
     * @desc    Thêm mới phòng giao dịch
     * @access  Private (Admin)
     * @body    province_id, district_id, code, name, address, latitude, longitude, is_active
     */
    router.post('', authenticateToken, transactionOfficeController.createTransactionOffice);

    /**
     * @route   PUT /api/transaction-offices/:id
     * @desc    Cập nhật thông tin phòng giao dịch
     * @access  Private (Admin)
     * @body    province_id, district_id, code, name, address, latitude, longitude, is_active
     */
    router.put('/:id', authenticateToken, transactionOfficeController.updateTransactionOffice);

    /**
     * @route   DELETE /api/transaction-offices
     * @desc    Xóa một hoặc nhiều phòng giao dịch
     * @access  Private (Admin)
     * @body    ids (array)
     */
    router.delete('', authenticateToken, transactionOfficeController.deleteTransactionOffices);

    /**
     * @route   PATCH /api/transaction-offices/toggle
     * @desc    Bật/tắt trạng thái nhiều phòng giao dịch
     * @access  Private (Admin)
     * @body    ids (array), is_active (boolean)
     */
    router.patch('/toggle', authenticateToken, transactionOfficeController.toggleTransactionOffices);

    app.use('/api/transaction-offices', router);
}