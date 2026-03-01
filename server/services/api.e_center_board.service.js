// ==========================================
// services/api.e_center_board.service.js (UPDATED - N-N Counter)
// ==========================================
const db = require("../models");
const ECenterBoard = db.eCenterBoards;
const Op = db.Sequelize.Op;

// ==================== INCLUDES ====================

/**
 * Build counters include (N-N qua ECenterBoardCounters)
 */
const buildCountersInclude = (required = false) => ({
  model: db.counters,
  as: 'counters',
  attributes: ['id', 'code', 'name', 'counter_number', 'led_board_number'],
  required,
  through: { attributes: [] }, // ẩn junction table
  include: [
    {
      model: db.transactionOffices,
      as: 'transaction_office',
      attributes: ['id', 'code', 'name', 'address'],
      required: false,
      include: [
        {
          model: db.districts,
          as: 'district',
          attributes: ['id', 'code', 'name'],
          required: false,
          include: [
            {
              model: db.provinces,
              as: 'province',
              attributes: ['id', 'code', 'name'],
              required: false
            }
          ]
        }
      ]
    }
  ]
});

const buildMediaIncludes = () => [
  {
    model: db.eCenterBoardVideos,
    as: 'videos',
    attributes: ['id', 'description', 'file_path', 'created_at'],
    required: false
  },
  {
    model: db.eCenterBoardSliders,
    as: 'image_sliders',
    attributes: ['id', 'description', 'file_path', 'created_at'],
    required: false
  }
];

// ==================== FORMAT ====================

/**
 * Format board data — counters là mảng
 */
const formatBoardData = (board) => {
  const boardData = board.toJSON();

  if (boardData.counters && Array.isArray(boardData.counters)) {
    boardData.counters = boardData.counters.map((counter) => {
      const transactionOffice = counter?.transaction_office;
      const district = transactionOffice?.district;
      const province = district?.province;

      return {
        id: counter.id,
        code: counter.code,
        name: counter.name,
        counter_number: counter.counter_number,
        led_board_number: counter.led_board_number || null,
        transaction_office_id: transactionOffice?.id || null,
        transaction_office_code: transactionOffice?.code || null,
        transaction_office_name: transactionOffice?.name || null,
        transaction_office_address: transactionOffice?.address || null,
        district_id: district?.id || null,
        district_code: district?.code || null,
        district_name: district?.name || null,
        province_id: province?.id || null,
        province_code: province?.code || null,
        province_name: province?.name || null
      };
    });
  }

  return boardData;
};

// ==================== SEARCH ====================

exports.searchBoards = async (filters, pagination) => {
  try {
    const {
      id, code, name,
      counter_id,
      transaction_office_id,
      district_id, district_code,
      province_id, province_code,
      is_video_enabled, is_slider_enabled,
      voice_type, is_active
    } = filters;

    const { page = 1, size = 20 } = pagination;
    const currentPage = parseInt(page);
    const pageSize = parseInt(size);
    const offset = (currentPage - 1) * pageSize;

    const where = {};

    if (id) where.id = id;
    if (code) where.code = { [Op.like]: `%${code}%` };
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (voice_type) where.voice_type = voice_type;

    if (is_video_enabled !== undefined && is_video_enabled !== null && is_video_enabled !== '') {
      where.is_video_enabled = is_video_enabled === 'true' || is_video_enabled === true;
    }
    if (is_slider_enabled !== undefined && is_slider_enabled !== null && is_slider_enabled !== '') {
      where.is_slider_enabled = is_slider_enabled === 'true' || is_slider_enabled === true;
    }
    if (is_active !== undefined && is_active !== null && is_active !== '') {
      where.is_active = is_active === 'true' || is_active === true;
    }

    // Filter theo counter / transaction_office / district / province
    // → tìm board_id qua junction table
    if (counter_id || transaction_office_id || district_id || district_code || province_id || province_code) {
      const counterWhere = {};
      if (counter_id) counterWhere.id = counter_id;
      if (transaction_office_id) counterWhere.transaction_office_id = transaction_office_id;

      const counterQuery = {
        attributes: ['id'],
        where: Object.keys(counterWhere).length > 0 ? counterWhere : undefined,
        include: []
      };

      // Join sâu hơn khi filter theo district / province
      if (district_id || district_code || province_id || province_code) {
        const districtWhere = {};
        if (district_id) districtWhere.id = district_id;
        if (district_code) districtWhere.code = district_code;

        const districtInclude = {
          model: db.districts,
          as: 'district',
          attributes: [],
          required: true,
          where: Object.keys(districtWhere).length > 0 ? districtWhere : undefined,
          include: []
        };

        if (province_id || province_code) {
          const provinceWhere = {};
          if (province_id) provinceWhere.id = province_id;
          if (province_code) provinceWhere.code = province_code;
          districtInclude.include.push({
            model: db.provinces,
            as: 'province',
            attributes: [],
            where: provinceWhere,
            required: true
          });
        }

        counterQuery.include.push({
          model: db.transactionOffices,
          as: 'transaction_office',
          attributes: [],
          required: true,
          include: [districtInclude]
        });
      }

      const validCounters = await db.counters.findAll(counterQuery);
      const validCounterIds = validCounters.map(c => c.id);

      if (validCounterIds.length === 0) {
        return { totalPage: 0, pageSize, currentPage, totalElements: 0, data: [] };
      }

      // Tìm board_id từ junction table
      const junctionRows = await db.eCenterBoardCounters.findAll({
        where: { counter_id: { [Op.in]: validCounterIds } },
        attributes: ['e_center_board_id']
      });

      const boardIds = [...new Set(junctionRows.map(r => r.e_center_board_id))];
      if (boardIds.length === 0) {
        return { totalPage: 0, pageSize, currentPage, totalElements: 0, data: [] };
      }

      where.id = { [Op.in]: boardIds };
    }

    const totalElements = await ECenterBoard.count({ where });

    const rows = await ECenterBoard.findAll({
      where,
      limit: pageSize,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        buildCountersInclude(),
        ...buildMediaIncludes()
      ]
    });

    return {
      totalPage: Math.ceil(totalElements / pageSize),
      pageSize,
      currentPage,
      totalElements,
      data: rows.map(formatBoardData)
    };
  } catch (error) {
    console.error('Search boards error:', error);
    throw error;
  }
};

// ==================== GET BY ID ====================

exports.getBoardById = async (id) => {
  try {
    const board = await ECenterBoard.findByPk(id, {
      include: [
        buildCountersInclude(),
        ...buildMediaIncludes()
      ]
    });

    if (!board) {
      return { success: false, message: 'Không tìm thấy bảng điện tử' };
    }

    return { success: true, board: formatBoardData(board) };
  } catch (error) {
    throw error;
  }
};

// ==================== GET BY CODE (FOR DISPLAY) ====================
exports.getBoardByCode = async (code) => {
  try {
    const board = await ECenterBoard.findOne({
      where: { code },
      include: [
        buildCountersInclude(),
        ...buildMediaIncludes()
      ]
    });

    if (!board) {
      return { success: false, message: 'Không tìm thấy bảng điện tử' };
    }

    return { success: true, board: formatBoardData(board) };
  } catch (error) {
    throw error;
  }
};

// ==================== HELPERS ====================

exports.checkCodeExists = async (code, excludeId = null) => {
  const where = { code };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  const existing = await ECenterBoard.findOne({ where });
  return !!existing;
};

/**
 * Đồng bộ danh sách counter cho một board (xóa cũ, thêm mới)
 */
const syncCounters = async (boardId, counterIds = [], transaction) => {
  // Xóa toàn bộ liên kết cũ
  await db.eCenterBoardCounters.destroy({
    where: { e_center_board_id: boardId },
    transaction
  });

  if (counterIds.length === 0) return;

  // Kiểm tra các counter tồn tại
  const existingCounters = await db.counters.findAll({
    where: { id: { [Op.in]: counterIds } },
    attributes: ['id']
  });

  const existingIds = existingCounters.map(c => c.id);
  const invalidIds = counterIds.filter(cid => !existingIds.includes(cid));
  if (invalidIds.length > 0) {
    throw new Error(`Quầy không tồn tại: ${invalidIds.join(', ')}`);
  }

  // Thêm liên kết mới
  await db.eCenterBoardCounters.bulkCreate(
    counterIds.map(cid => ({
      e_center_board_id: boardId,
      counter_id: cid
    })),
    { transaction, ignoreDuplicates: true }
  );
};

// ==================== CREATE ====================

exports.createBoard = async (data) => {
  const transaction = await db.sequelize.transaction();

  try {
    const {
      code, name,
      counter_ids = [],   // ← mảng thay vì counter_id đơn
      is_video_enabled,
      is_slider_enabled,
      voice_type,
      is_active,
      videos = [],
      image_sliders = []
    } = data;

    if (await exports.checkCodeExists(code)) {
      await transaction.rollback();
      return { success: false, message: 'Mã bảng điện tử đã tồn tại' };
    }

    // Tạo board (không có counter_id)
    const board = await ECenterBoard.create({
      code,
      name,
      is_video_enabled: is_video_enabled ?? false,
      is_slider_enabled: is_slider_enabled ?? false,
      voice_type: voice_type || 'hanoi',
      is_active: is_active ?? true
    }, { transaction });

    // Gắn counters qua junction table
    if (counter_ids.length > 0) {
      try {
        await syncCounters(board.id, counter_ids, transaction);
      } catch (err) {
        await transaction.rollback();
        return { success: false, message: err.message };
      }
    }

    // Thêm videos
    for (const video of videos) {
      await db.eCenterBoardVideos.create({
        e_center_board_id: board.id,
        description: video.description || null,
        file_path: video.file_path
      }, { transaction });
    }

    // Thêm image sliders
    for (const slider of image_sliders) {
      await db.eCenterBoardSliders.create({
        e_center_board_id: board.id,
        description: slider.description || null,
        file_path: slider.file_path
      }, { transaction });
    }

    await transaction.commit();

    const result = await exports.getBoardById(board.id);
    return { success: true, board: result.board };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ==================== UPDATE ====================

exports.updateBoard = async (id, data) => {
  const transaction = await db.sequelize.transaction();

  try {
    const board = await ECenterBoard.findByPk(id);
    if (!board) {
      await transaction.rollback();
      return { success: false, notFound: true, message: 'Không tìm thấy bảng điện tử' };
    }

    const {
      code, name,
      counter_ids,          // ← mảng (undefined = không thay đổi)
      is_video_enabled,
      is_slider_enabled,
      voice_type,
      is_active
    } = data;

    const updateData = {};

    if (code !== undefined) {
      if (await exports.checkCodeExists(code, id)) {
        await transaction.rollback();
        return { success: false, message: 'Mã bảng điện tử đã tồn tại' };
      }
      updateData.code = code;
    }

    if (name !== undefined) updateData.name = name;
    if (is_video_enabled !== undefined) updateData.is_video_enabled = is_video_enabled;
    if (is_slider_enabled !== undefined) updateData.is_slider_enabled = is_slider_enabled;
    if (voice_type !== undefined) updateData.voice_type = voice_type;
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length > 0) {
      await board.update(updateData, { transaction });
    }

    // Cập nhật counters nếu được truyền vào
    if (counter_ids !== undefined) {
      try {
        await syncCounters(id, counter_ids, transaction);
      } catch (err) {
        await transaction.rollback();
        return { success: false, message: err.message };
      }
    }

    await transaction.commit();

    const result = await exports.getBoardById(id);
    return { success: true, board: result.board };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ==================== DELETE / TOGGLE ====================

exports.deleteBoards = async (ids) => {
  try {
    const deletedCount = await ECenterBoard.destroy({
      where: { id: { [Op.in]: ids } }
    });
    return { success: true, deletedCount };
  } catch (error) {
    throw error;
  }
};

exports.toggleBoards = async (ids, is_active) => {
  try {
    const [updatedCount] = await ECenterBoard.update(
      { is_active },
      { where: { id: { [Op.in]: ids } } }
    );
    return { success: true, updatedCount };
  } catch (error) {
    throw error;
  }
};

// ==================== COUNTER MANAGEMENT ====================

/**
 * Lấy danh sách counters của một board
 */
exports.getCounters = async (boardId) => {
  try {
    const board = await ECenterBoard.findByPk(boardId, {
      include: [buildCountersInclude()]
    });
    if (!board) return { success: false, message: 'Không tìm thấy bảng điện tử' };
    return { success: true, data: formatBoardData(board).counters };
  } catch (error) {
    throw error;
  }
};

/**
 * Thêm counters vào board (không xóa cái cũ)
 */
exports.addCounters = async (boardId, counterIds = []) => {
  const transaction = await db.sequelize.transaction();
  try {
    const board = await ECenterBoard.findByPk(boardId);
    if (!board) return { success: false, notFound: true, message: 'Không tìm thấy bảng điện tử' };

    const existingCounters = await db.counters.findAll({
      where: { id: { [Op.in]: counterIds } },
      attributes: ['id']
    });
    const existingIds = existingCounters.map(c => c.id);
    const invalidIds = counterIds.filter(cid => !existingIds.includes(cid));
    if (invalidIds.length > 0) {
      await transaction.rollback();
      return { success: false, message: `Quầy không tồn tại: ${invalidIds.join(', ')}` };
    }

    await db.eCenterBoardCounters.bulkCreate(
      counterIds.map(cid => ({ e_center_board_id: boardId, counter_id: cid })),
      { transaction, ignoreDuplicates: true }
    );

    await transaction.commit();
    const result = await exports.getCounters(boardId);
    return { success: true, data: result.data };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Xóa counters khỏi board
 */
exports.removeCounters = async (boardId, counterIds = []) => {
  const transaction = await db.sequelize.transaction();
  try {
    const board = await ECenterBoard.findByPk(boardId);
    if (!board) return { success: false, message: 'Không tìm thấy bảng điện tử' };

    await db.eCenterBoardCounters.destroy({
      where: { e_center_board_id: boardId, counter_id: { [Op.in]: counterIds } },
      transaction
    });

    await transaction.commit();
    return { success: true };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ==================== VIDEO MANAGEMENT ====================

exports.getVideos = async (boardId) => {
  try {
    const board = await ECenterBoard.findByPk(boardId);
    if (!board) return { success: false, message: 'Không tìm thấy bảng điện tử' };
    const videos = await db.eCenterBoardVideos.findAll({
      where: { e_center_board_id: boardId },
      attributes: ['id', 'description', 'file_path', 'created_at']
    });
    return { success: true, data: videos };
  } catch (error) {
    throw error;
  }
};

exports.addVideos = async (boardId, videos = []) => {
  const transaction = await db.sequelize.transaction();
  try {
    const board = await ECenterBoard.findByPk(boardId);
    if (!board) return { success: false, notFound: true, message: 'Không tìm thấy bảng điện tử' };
    if (!videos.length) return { success: false, message: 'Danh sách video không được rỗng' };

    const created = [];
    for (const video of videos) {
      if (!video.file_path) {
        await transaction.rollback();
        return { success: false, message: 'file_path là bắt buộc cho mỗi video' };
      }
      const newVideo = await db.eCenterBoardVideos.create({
        e_center_board_id: boardId,
        description: video.description || null,
        file_path: video.file_path
      }, { transaction });
      created.push(newVideo);
    }

    await transaction.commit();
    return { success: true, data: created };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.removeVideos = async (boardId, videoIds) => {
  const transaction = await db.sequelize.transaction();
  try {
    const board = await ECenterBoard.findByPk(boardId);
    if (!board) return { success: false, message: 'Không tìm thấy bảng điện tử' };
    await db.eCenterBoardVideos.destroy({
      where: { e_center_board_id: boardId, id: { [Op.in]: videoIds } },
      transaction
    });
    await transaction.commit();
    return { success: true };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.clearVideos = async (boardId) => {
  const transaction = await db.sequelize.transaction();
  try {
    const board = await ECenterBoard.findByPk(boardId);
    if (!board) return { success: false, message: 'Không tìm thấy bảng điện tử' };
    await db.eCenterBoardVideos.destroy({ where: { e_center_board_id: boardId }, transaction });
    await transaction.commit();
    return { success: true, data: [] };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ==================== IMAGE SLIDER MANAGEMENT ====================

exports.getImageSliders = async (boardId) => {
  try {
    const board = await ECenterBoard.findByPk(boardId);
    if (!board) return { success: false, message: 'Không tìm thấy bảng điện tử' };
    const sliders = await db.eCenterBoardSliders.findAll({
      where: { e_center_board_id: boardId },
      attributes: ['id', 'description', 'file_path', 'created_at']
    });
    return { success: true, data: sliders };
  } catch (error) {
    throw error;
  }
};

exports.addImageSliders = async (boardId, sliders = []) => {
  const transaction = await db.sequelize.transaction();
  try {
    const board = await ECenterBoard.findByPk(boardId);
    if (!board) return { success: false, notFound: true, message: 'Không tìm thấy bảng điện tử' };
    if (!sliders.length) return { success: false, message: 'Danh sách ảnh không được rỗng' };

    const created = [];
    for (const slider of sliders) {
      if (!slider.file_path) {
        await transaction.rollback();
        return { success: false, message: 'file_path là bắt buộc cho mỗi ảnh' };
      }
      const newSlider = await db.eCenterBoardSliders.create({
        e_center_board_id: boardId,
        description: slider.description || null,
        file_path: slider.file_path
      }, { transaction });
      created.push(newSlider);
    }

    await transaction.commit();
    return { success: true, data: created };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.removeImageSliders = async (boardId, sliderIds) => {
  const transaction = await db.sequelize.transaction();
  try {
    const board = await ECenterBoard.findByPk(boardId);
    if (!board) return { success: false, message: 'Không tìm thấy bảng điện tử' };
    await db.eCenterBoardSliders.destroy({
      where: { e_center_board_id: boardId, id: { [Op.in]: sliderIds } },
      transaction
    });
    await transaction.commit();
    return { success: true };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.clearImageSliders = async (boardId) => {
  const transaction = await db.sequelize.transaction();
  try {
    const board = await ECenterBoard.findByPk(boardId);
    if (!board) return { success: false, message: 'Không tìm thấy bảng điện tử' };
    await db.eCenterBoardSliders.destroy({ where: { e_center_board_id: boardId }, transaction });
    await transaction.commit();
    return { success: true, data: [] };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};