// server/controllers/api.cccd_info_backup.controller.js
const cccdInfoBackupService = require('../services/api.cccd_info_backup.service');

// @route   POST /api/id-info-backup/
// @desc    Lưu thông tin căn cước công dân từ body request
// @access  Public
exports.create = async (req, res) => {
  try {
    console.log('🔍 [API] Received ID Info Backup request');
    console.log('📊 Request Body:', JSON.stringify(req.body, null, 2));

    // Validate required fields
    const validation = cccdInfoBackupService.validateRequiredFields(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Create backup record
    const result = await cccdInfoBackupService.createBackupRecord(req.body);

    // console.log('✅ [API] Record created successfully with ID:', result.data.id);

    // // Broadcast via WebSocket
    // cccdInfoBackupService.broadcastNewBackupRecord(result.data.id);

    return res.status(201).json({
      success: true,
      message: 'Lưu thông tin thành công',
      data: {
        id: result.data.id,
        eid_number: result.data.eid_number,
        full_name: result.data.full_name,
        template_data: result.data.template_data
      }
    });

  } catch (error) {
    console.error('❌ [API] Save error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lưu thông tin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   GET /api/id-info-backup/latest
// @desc    Lấy bản ghi mới nhất
// @access  Public
exports.getLatest = async (req, res) => {
  try {
    console.log('🔍 [API] GET Latest record');

    const latest = await cccdInfoBackupService.getLatestRecord();

    if (!latest) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dữ liệu'
      });
    }

    res.json({
      success: true,
      data: latest
    });

  } catch (error) {
    console.error('❌ [API] Get latest error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   GET /api/id-info-backup/:id
// @desc    Lấy bản ghi theo ID
// @access  Public
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`🔍 [API] GET record by ID: ${id}`);
    
    const record = await cccdInfoBackupService.getRecordById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dữ liệu'
      });
    }

    res.json({
      success: true,
      data: record
    });
    
  } catch (error) {
    console.error('❌ [API] Get by ID error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};