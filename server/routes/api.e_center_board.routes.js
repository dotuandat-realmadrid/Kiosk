// ==========================================
// routes/api.e_center_board.routes.js (UPDATED - N-N Counter)
// ==========================================
module.exports = (app) => {

    var router = require("express").Router();
    const boardController = require('../controllers/api.e_center_board.controller');
    const { authenticateToken } = require('../middlewares/auth.middleware');
    const { uploadBoardVideo, uploadBoardSlider, handleUploadError } = require('../middlewares/upload.middleware');

    // ==================== SEARCH & READ ====================

    /**
     * @route   GET /api/e-center-boards
     * @desc    Tìm kiếm bảng điện tử với phân trang
     * @access  Private
     * @query   id, code, name, counter_id, transaction_office_id,
     *          district_id, district_code, province_id, province_code,
     *          is_video_enabled, is_slider_enabled, voice_type, is_active, page, size
     */
    router.get('', boardController.searchBoards);

    /**
     * @route   GET /api/e-center-boards/:code
     * @desc    Lấy thông tin chi tiết bảng điện tử theo CODE
     *          Response: { ...board, counters: [...] }
     * @access  Private
     */
    router.get('/code/:code', boardController.getBoardByCode);

    /**
     * @route   GET /api/e-center-boards/:id
     * @desc    Lấy thông tin chi tiết bảng điện tử theo ID
     *          Response: { ...board, counters: [...] }
     * @access  Private
     */
    router.get('/:id', boardController.getBoardById);

    // ==================== COUNTER MANAGEMENT (N-N) ====================

    /**
     * @route   GET /api/e-center-boards/:id/counters
     * @desc    Lấy danh sách quầy gắn với bảng điện tử
     * @access  Private
     */
    router.get('/:id/counters', boardController.getCounters);

    /**
     * @route   POST /api/e-center-boards/:id/counters
     * @desc    Thêm quầy vào bảng điện tử (không xóa cái cũ)
     * @access  Private (Admin)
     * @body    { counter_ids: string[] }
     */
    router.post('/:id/counters', authenticateToken, boardController.addCounters);

    /**
     * @route   DELETE /api/e-center-boards/:id/counters
     * @desc    Xóa quầy khỏi bảng điện tử
     * @access  Private (Admin)
     * @body    { counter_ids: string[] }
     */
    router.delete('/:id/counters', authenticateToken, boardController.removeCounters);

    // ==================== VIDEO MANAGEMENT ====================

    /**
     * @route   GET /api/e-center-boards/:id/videos
     * @desc    Lấy danh sách video của bảng điện tử
     * @access  Private
     */
    router.get('/:id/videos', boardController.getVideos);

    /**
     * @route   POST /api/e-center-boards/:id/videos
     * @desc    Thêm video vào bảng điện tử (nhận JSON file_path)
     * @access  Private (Admin)
     * @body    { videos: [{ file_path: string, description?: string }] }
     */
    router.post('/:id/videos', authenticateToken, boardController.addVideos);

    /**
     * @route   POST /api/e-center-boards/:id/videos/upload
     * @desc    Upload file video + lưu vào DB trong 1 request
     * @access  Private (Admin)
     * @body    multipart/form-data { videos: File[], description?: string, description_0?: string, ... }
     */
    router.post(
        '/:id/videos/upload',
        authenticateToken,
        (req, res, next) => uploadBoardVideo.array('videos', 5)(req, res, (err) => handleUploadError(err, req, res, next)),
        boardController.uploadVideos
    );

    /**
     * @route   DELETE /api/e-center-boards/:id/videos/clear
     * @desc    Xóa toàn bộ video của bảng điện tử
     * @access  Private (Admin)
     */
    router.delete('/:id/videos/clear', authenticateToken, boardController.clearVideos);

    /**
     * @route   DELETE /api/e-center-boards/:id/videos
     * @desc    Xóa một hoặc nhiều video khỏi bảng điện tử
     * @access  Private (Admin)
     * @body    { ids: string[] }
     */
    router.delete('/:id/videos', authenticateToken, boardController.removeVideos);

    // ==================== IMAGE SLIDER MANAGEMENT ====================

    /**
     * @route   GET /api/e-center-boards/:id/image-sliders
     * @desc    Lấy danh sách ảnh slider của bảng điện tử
     * @access  Private
     */
    router.get('/:id/image-sliders', boardController.getImageSliders);

    /**
     * @route   POST /api/e-center-boards/:id/image-sliders
     * @desc    Thêm ảnh slider vào bảng điện tử (nhận JSON file_path)
     * @access  Private (Admin)
     * @body    { image_sliders: [{ file_path: string, description?: string }] }
     */
    router.post('/:id/image-sliders', authenticateToken, boardController.addImageSliders);

    /**
     * @route   POST /api/e-center-boards/:id/image-sliders/upload
     * @desc    Upload file ảnh + lưu vào DB trong 1 request
     * @access  Private (Admin)
     * @body    multipart/form-data { image_sliders: File[], description?: string, description_0?: string, ... }
     */
    router.post(
        '/:id/image-sliders/upload',
        authenticateToken,
        (req, res, next) => uploadBoardSlider.array('image_sliders', 20)(req, res, (err) => handleUploadError(err, req, res, next)),
        boardController.uploadImageSliders
    );

    /**
     * @route   DELETE /api/e-center-boards/:id/image-sliders/clear
     * @desc    Xóa toàn bộ ảnh slider của bảng điện tử
     * @access  Private (Admin)
     */
    router.delete('/:id/image-sliders/clear', authenticateToken, boardController.clearImageSliders);

    /**
     * @route   DELETE /api/e-center-boards/:id/image-sliders
     * @desc    Xóa một hoặc nhiều ảnh slider khỏi bảng điện tử
     * @access  Private (Admin)
     * @body    { ids: string[] }
     */
    router.delete('/:id/image-sliders', authenticateToken, boardController.removeImageSliders);

    // ==================== CREATE ====================

    /**
     * @route   POST /api/e-center-boards
     * @desc    Thêm mới bảng điện tử
     * @access  Private (Admin)
     * @body    {
     *            code: string,
     *            name: string,
     *            counter_ids: string[],       ← mảng UUID (N-N)
     *            is_video_enabled?: boolean,
     *            is_slider_enabled?: boolean,
     *            voice_type?: string,         ← 'Hà Nội' | 'Hồ Chí Minh' | 'Đà Nẵng' | 'Huế'
     *            is_active?: boolean,
     *            videos?: [{ file_path: string, description?: string }],
     *            image_sliders?: [{ file_path: string, description?: string }]
     *          }
     */
    router.post('', authenticateToken, boardController.createBoard);

    // ==================== UPDATE ====================

    /**
     * @route   PUT /api/e-center-boards/:id
     * @desc    Cập nhật thông tin bảng điện tử
     * @access  Private (Admin)
     * @body    {
     *            code?, name?,
     *            counter_ids?: string[],      ← nếu truyền sẽ sync lại toàn bộ danh sách quầy
     *            is_video_enabled?, is_slider_enabled?,
     *            voice_type?, is_active?
     *          }
     */
    router.put('/:id', authenticateToken, boardController.updateBoard);

    /**
     * @route   PATCH /api/e-center-boards/toggle
     * @desc    Bật/tắt trạng thái nhiều bảng điện tử
     * @access  Private (Admin)
     * @body    { ids: string[], is_active: boolean }
     */
    router.patch('/toggle', authenticateToken, boardController.toggleBoards);

    // ==================== DELETE ====================

    /**
     * @route   DELETE /api/e-center-boards
     * @desc    Xóa một hoặc nhiều bảng điện tử
     * @access  Private (Admin)
     * @body    { ids: string[] }
     */
    router.delete('', authenticateToken, boardController.deleteBoards);


    app.use('/api/e-center-boards', router);
};