// ==========================================
// middlewares/upload.middleware.js
// ==========================================
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==================== HELPER ====================

/**
 * Tạo thư mục nếu chưa tồn tại
 */
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Tạo tên file unique: timestamp_random_originalname
 */
const generateFileName = (originalname) => {
  const ext = path.extname(originalname);
  const baseName = path.basename(originalname, ext)
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-]/g, '');
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e6);
  return `${timestamp}_${random}_${baseName}${ext}`;
};

/**
 * Lấy đường dẫn tương đối để lưu vào DB
 * Input:  "D:/project/public/uploads/e-center-boards/videos/abc.mp4"
 * Output: "/uploads/e-center-boards/videos/abc.mp4"
 */
const getRelativePath = (absolutePath) => {
  const normalized = absolutePath.replace(/\\/g, '/');
  const publicIndex = normalized.indexOf('/public/');
  if (publicIndex === -1) return '/' + normalized.split('/uploads/').pop();
  return normalized.slice(publicIndex + '/public'.length);
};

// ==================== STORAGE CONFIG ====================

/**
 * Tạo storage động theo destination folder
 */
const createStorage = (destinationFolder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads', destinationFolder);
      ensureDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, generateFileName(file.originalname));
    }
  });
};

// ==================== FILE FILTERS ====================

const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh: jpeg, jpg, png, gif, webp'), false);
  }
};

const videoFilter = (req, file, cb) => {
  const allowedMimes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file video: mp4, mpeg, mov, avi, webm'), false);
  }
};

// ==================== UPLOAD INSTANCES ====================

// Upload ảnh slider cho e_center_board (max 10MB/file, tối đa 20 ảnh)
const uploadBoardSlider = multer({
  storage: createStorage('e-center-boards/sliders'),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 20
  }
});

// Upload video cho e_center_board (max 200MB/file, tối đa 5 video)
const uploadBoardVideo = multer({
  storage: createStorage('e-center-boards/videos'),
  fileFilter: videoFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB
    files: 5
  }
});

// ==================== ERROR HANDLER ====================

/**
 * Middleware xử lý lỗi multer
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File quá lớn, vượt quá giới hạn cho phép' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ success: false, message: 'Số lượng file vượt quá giới hạn' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

// ==================== HELPER XÓA FILE ====================

/**
 * Xóa file khỏi server theo file_path đã lưu trong DB
 * @param {string} filePath - đường dẫn tương đối, vd: /uploads/e-center-boards/videos/abc.mp4
 */
const deleteFile = (filePath) => {
  try {
    // filePath = "/uploads/..." → absolute = .../public/uploads/...
    const absolutePath = path.join(__dirname, '..', '..', 'public', filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log(`Deleted file: ${absolutePath}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};

module.exports = {
  uploadBoardSlider,
  uploadBoardVideo,
  handleUploadError,
  deleteFile,
  getRelativePath
};