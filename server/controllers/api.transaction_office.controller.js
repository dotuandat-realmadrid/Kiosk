// server/controllers/api.transaction_office.controller.js
const transactionOfficeService = require('../services/api.transaction_office.service');

// TÌM KIẾM PHÒNG GIAO DỊCH
exports.searchTransactionOffices = async (req, res) => {
  try {
    const { id, district_id, district_code, province_id, province_code, code, name, address, is_active } = req.query;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;

    const result = await transactionOfficeService.searchTransactionOffices(
      { id, district_id, district_code, province_id, province_code, code, name, address, is_active },
      page,
      pageSize
    );

    res.json({
      success: true,
      message: 'Lấy danh sách phòng giao dịch thành công',
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      totalElements: result.totalElements,
      totalPage: result.totalPage,
      data: result.data,
    });

  } catch (error) {
    console.error('Search transaction offices error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// LẤY THÔNG TIN PHÒNG GIAO DỊCH THEO ID
exports.getTransactionOfficeById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await transactionOfficeService.getTransactionOfficeById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Lấy thông tin phòng giao dịch thành công',
      data: result.office
    });

  } catch (error) {
    console.error('Get transaction office error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// LẤY DANH SÁCH PHÒNG GIAO DỊCH THEO QUẬN/HUYỆN
exports.getOfficesByDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;

    const result = await transactionOfficeService.getOfficesByDistrict(districtId);

    res.json({
      success: true,
      message: 'Lấy danh sách phòng giao dịch theo quận/huyện thành công',
      data: result.offices
    });

  } catch (error) {
    console.error('Get offices by district error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// LẤY TẤT CẢ PHÒNG GIAO DỊCH ĐANG HOẠT ĐỘNG
exports.getAllActiveOffices = async (req, res) => {
  try {
    const result = await transactionOfficeService.getAllActiveOffices();

    res.json({
      success: true,
      message: 'Lấy danh sách phòng giao dịch đang hoạt động thành công',
      data: result.offices
    });

  } catch (error) {
    console.error('Get all active offices error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// THÊM MỚI PHÒNG GIAO DỊCH
exports.createTransactionOffice = async (req, res) => {
  try {
    const { district_id, code, name, address, latitude, longitude, is_active } = req.body;

    // Validate required fields
    if (!district_id || !code || !name || !address) {
      return res.status(400).json({
        success: false,
        message: 'Quận/huyện, mã, tên và địa chỉ là bắt buộc'
      });
    }

    const result = await transactionOfficeService.createTransactionOffice({
      district_id,
      code,
      name,
      address,
      latitude,
      longitude,
      is_active
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thêm phòng giao dịch thành công',
      data: result.office
    });

  } catch (error) {
    console.error('Create transaction office error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// CẬP NHẬT PHÒNG GIAO DỊCH
exports.updateTransactionOffice = async (req, res) => {
  try {
    const { id } = req.params;
    const { district_id, code, name, address, latitude, longitude, is_active } = req.body;

    const result = await transactionOfficeService.updateTransactionOffice(id, {
      district_id,
      code,
      name,
      address,
      latitude,
      longitude,
      is_active
    });

    if (!result.success) {
      const statusCode = result.notFound ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật phòng giao dịch thành công',
      data: result.office
    });

  } catch (error) {
    console.error('Update transaction office error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// XÓA MỘT HOẶC NHIỀU PHÒNG GIAO DỊCH
exports.deleteTransactionOffices = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID cần xóa'
      });
    }

    const result = await transactionOfficeService.deleteTransactionOffices(ids);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã xóa ${result.deletedCount} phòng giao dịch thành công`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Delete transaction offices error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// BẬT/TẮT TRẠNG THÁI NHIỀU PHÒNG GIAO DỊCH
exports.toggleTransactionOffices = async (req, res) => {
  try {
    const { ids, is_active } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID'
      });
    }

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái is_active phải là boolean'
      });
    }

    const result = await transactionOfficeService.toggleTransactionOffices(ids, is_active);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: `Đã ${is_active ? 'kích hoạt' : 'vô hiệu hóa'} ${result.updatedCount} phòng giao dịch`,
      updatedCount: result.updatedCount
    });

  } catch (error) {
    console.error('Toggle transaction offices error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};