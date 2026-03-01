// server/controllers/api.cccd_info.controller.js
const cccdInfoService = require('../services/api.cccd_info.service');

// @route   POST /api/id-info/
// @desc    Lưu thông tin căn cước công dân từ thiết bị đọc
// @access  Public
exports.create = async (req, res) => {
  try {
    // Log incoming request
    console.log('🔍 [API] Received ID Info request:');
    console.log('📊 Request Body Size:', JSON.stringify(req.body).length, 'characters');
    console.log('📊 Request Body:', JSON.stringify(req.body, null, 2));

    // Handle device error reports early
    if (cccdInfoService.isDeviceError(req.body)) {
      const { description } = req.body;
      console.warn('⚠️ [API] Device reported error:', description);

      // Broadcast to WebSocket
      cccdInfoService.broadcastDeviceError(description);

      return res.status(200).json({
        success: false,
        message: 'Device error received',
        description: description || null
      });
    }

    // Validate required fields
    const validation = cccdInfoService.validateDeviceData(req.body);
    if (!validation.valid) {
      console.log('❌ [API] Validation failed - Missing required fields');
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const personalInfo = req.body.data.personalInfo;
    console.log('✅ [API] Validation passed');
    console.log('👤 Personal Info:', JSON.stringify(personalInfo, null, 2));
    console.log('➕ [API] Creating new record for citizen ID:', personalInfo.eIDNumber);

    // Create new record in MySQL
    console.log('💾 [API] Creating new record in MySQL...');
    const result = await cccdInfoService.createIdRecord(req.body);
    
    console.log('✅ [API] MySQL record created successfully with ID:', result.data.id);

    // Broadcast new record via WebSocket
    cccdInfoService.broadcastNewIdRecord(result.data.id);

    return res.status(201).json({
      success: true,
      message: 'Lưu thông tin căn cước công dân thành công',
      data: {
        id: result.data.id,
        eid_number: result.data.eid_number,
        full_name: result.data.full_name,
        result: result.data.result
      }
    });

  } catch (error) {
    console.error('❌ [API] ID Info save error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lưu thông tin căn cước công dân',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   GET /api/id-info/latest
// @desc    Lấy bản ghi mới nhất
// @access  Public
exports.getLatest = async (req, res) => {
  try {
    console.log('🔍 [API] GET Latest created_at Info request');

    const latest = await cccdInfoService.getLatestRecord();

    if (!latest) {
      console.log('❌ [API] No records found');
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy dữ liệu'
      });
    }

    console.log('✅ [API] Latest record found:', latest.eid_number);

    res.json({
      success: true,
      data: latest
    });

  } catch (error) {
    console.error('❌ [API] Get latest error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
};

// @route   GET /api/id-info/:id
// @desc    Lấy bản ghi theo ID
// @access  Public
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`🔍 [API] GET ID Info by ID request: ${id}`);
    
    const record = await cccdInfoService.getRecordById(id);

    if (!record) {
      console.log('❌ [API] Record not found for ID:', id);
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy dữ liệu'
      });
    }
    
    console.log('✅ [API] Record found for ID:', id);

    res.json({
      success: true,
      data: record
    });
    
  } catch (error) {
    console.error('❌ [API] Get by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
};