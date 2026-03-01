// server/routes/api.user_transaction_office.routes.js
module.exports = (app) => {
    var router = require("express").Router();
    const userTransactionOfficeController = require('../controllers/api.user_transaction_office.controller');
    const { authenticateToken } = require('../middlewares/auth.middleware');

    /**
     * @route   POST /api/assign
     * @desc    Gán người dùng vào phòng giao dịch
     * @access  Private (Admin)
     * @body    user_id, transaction_office_id, is_primary
     */
    router.post('/assign', authenticateToken, userTransactionOfficeController.assignUserToOffice);

    /**
     * @route   POST /api/assign-multiple
     * @desc    Gán nhiều người dùng vào một phòng giao dịch
     * @access  Private (Admin)
     * @body    user_ids (array), transaction_office_id
     */
    router.post('/assign-multiple', authenticateToken, userTransactionOfficeController.assignMultipleUsersToOffice);

    /**
     * @route   PATCH /api/set-primary
     * @desc    Cập nhật phòng giao dịch chính cho người dùng
     * @access  Private (Admin)
     * @body    user_id, transaction_office_id
     */
    router.patch('/set-primary', authenticateToken, userTransactionOfficeController.updatePrimaryOffice);

    /**
     * @route   DELETE /api/remove
     * @desc    Xóa người dùng khỏi phòng giao dịch
     * @access  Private (Admin)
     * @body    user_id, transaction_office_id
     */
    router.delete('/remove', authenticateToken, userTransactionOfficeController.removeUserFromOffice);

    /**
     * @route   DELETE /api/remove-multiple
     * @desc    Xóa nhiều người dùng khỏi phòng giao dịch
     * @access  Private (Admin)
     * @body    user_ids (array), transaction_office_id
     */
    router.delete('/remove-multiple', authenticateToken, userTransactionOfficeController.removeMultipleUsersFromOffice);

    /**
     * @route   GET /api/office/:officeId/users
     * @desc    Lấy danh sách người dùng theo phòng giao dịch
     * @access  Private
     */
    router.get('/office/:officeId/users', authenticateToken, userTransactionOfficeController.getUsersByOffice);

    /**
     * @route   GET /api/user/:userId/offices
     * @desc    Lấy danh sách phòng giao dịch theo người dùng
     * @access  Private
     */
    router.get('/user/:userId/offices', authenticateToken, userTransactionOfficeController.getOfficesByUser);

    /**
     * @route   GET /api/user/:userId/primary-office
     * @desc    Lấy phòng giao dịch chính của người dùng
     * @access  Private
     */
    router.get('/user/:userId/primary-office', authenticateToken, userTransactionOfficeController.getPrimaryOfficeByUser);

    
  app.use('/api/user-transaction-offices', router);
}