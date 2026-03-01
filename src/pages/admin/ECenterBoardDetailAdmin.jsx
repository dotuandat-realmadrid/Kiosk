// ==========================================
// ECenterBoardDetailAdmin.jsx (UPDATED - N-N Counter)
// ==========================================
import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  DesktopOutlined,
  PlusCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getBoardById,
  updateBoard,
  toggleBoards,
  deleteBoards,
  getVideos,
  uploadVideos,
  removeVideos,
  getImageSliders,
  uploadImageSliders,
  removeImageSliders,
} from "../../api/e_center_board";
import { searchProvinces } from "../../api/province";
import { getDistrictsByProvince } from "../../api/district";
import { searchTransactionOffices } from "../../api/transaction_office";
import { searchCounters } from "../../api/counter";
import { hasPermission } from "../../services/authService";

const { Text, Title } = Typography;
const { confirm } = Modal;

// ==================== SECTION HEADER ====================
const SectionHeader = ({ title }) => (
  <div
    style={{
      background: "#cce5ff",
      padding: "6px 12px",
      fontWeight: 600,
      marginBottom: 16,
      marginTop: 4,
    }}
  >
    {title}
  </div>
);

// ==================== MAIN COMPONENT ====================
function ECenterBoardDetailAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Media states
  const [videos, setVideos] = useState([]);
  const [imageSliders, setImageSliders] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Upload states - Video
  const [videoDescription, setVideoDescription] = useState("");
  const [videoFileList, setVideoFileList] = useState([]);
  const [pendingVideos, setPendingVideos] = useState([]);
  const videoInputRef = useRef(null);

  // Upload states - Slider
  const [sliderDescription, setSliderDescription] = useState("");
  const [sliderFileList, setSliderFileList] = useState([]);
  const [pendingSliders, setPendingSliders] = useState([]);
  const sliderInputRef = useRef(null);

  // Location cascade states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [transactionOffices, setTransactionOffices] = useState([]);
  const [counters, setCounters] = useState([]);

  const [provincesLoading, setProvincesLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [officesLoading, setOfficesLoading] = useState(false);
  const [countersLoading, setCountersLoading] = useState(false);

  const [tempProvinceId, setTempProvinceId] = useState(null);
  const [tempDistrictId, setTempDistrictId] = useState(null);
  const [tempOfficeId, setTempOfficeId] = useState(null);
  // ← N-N: mảng thay vì đơn
  const [selectedCounterIds, setSelectedCounterIds] = useState([]);

  // ==================== LOAD DATA ====================

  useEffect(() => {
    setProvincesLoading(true);
    searchProvinces({}, 1, 1000)
      .then((r) => setProvinces(r.data || []))
      .catch(() => message.error("Không thể tải tỉnh/thành phố"))
      .finally(() => setProvincesLoading(false));
  }, []);

  useEffect(() => {
    const loadBoard = async () => {
      setLoading(true);
      try {
        const data = await getBoardById(id);
        setBoard(data);
      } catch {
        message.error("Không thể tải thông tin bảng điện tử");
      } finally {
        setLoading(false);
      }
    };
    loadBoard();
  }, [id]);

  useEffect(() => {
    if (!board) return;
    const loadMedia = async () => {
      setMediaLoading(true);
      try {
        const [vids, sliders] = await Promise.all([getVideos(id), getImageSliders(id)]);
        setVideos(vids || []);
        setImageSliders(sliders || []);
      } catch {
        // non-critical
      } finally {
        setMediaLoading(false);
      }
    };
    loadMedia();
  }, [board, id]);

  // Set form values khi board load xong
  // board.counters là mảng — lấy counter đầu tiên để init cascade location
  useEffect(() => {
    if (!board) return;

    const firstCounter = board.counters?.[0];
    const provinceId = firstCounter?.province_id;
    const districtId = firstCounter?.district_id;
    const officeId = firstCounter?.transaction_office_id;
    const counterIds = (board.counters || []).map((c) => c.id);

    setTimeout(() => {
      form.setFieldsValue({
        code: board.code,
        name: board.name,
        is_video_enabled: board.is_video_enabled,
        is_slider_enabled: board.is_slider_enabled,
        voice_type: board.voice_type,
        province_id: provinceId,
        district_id: districtId,
        transaction_office_id: officeId,
      });
    }, 0);

    if (provinceId) setTempProvinceId(provinceId);
    if (districtId) setTempDistrictId(districtId);
    if (officeId) setTempOfficeId(officeId);
    setSelectedCounterIds(counterIds);
  }, [board, form]);

  // Load districts
  useEffect(() => {
    if (!tempProvinceId) { setDistricts([]); return; }
    setDistrictsLoading(true);
    getDistrictsByProvince(tempProvinceId)
      .then((l) => setDistricts(l || []))
      .catch(() => setDistricts([]))
      .finally(() => setDistrictsLoading(false));
  }, [tempProvinceId]);

  // Load offices
  useEffect(() => {
    if (!tempDistrictId) { setTransactionOffices([]); return; }
    setOfficesLoading(true);
    searchTransactionOffices({ district_id: tempDistrictId, is_active: true }, 1, 1000)
      .then((r) => setTransactionOffices(r.data || []))
      .catch(() => setTransactionOffices([]))
      .finally(() => setOfficesLoading(false));
  }, [tempDistrictId]);

  // Load counters (chỉ khi đang edit)
  useEffect(() => {
    if (!tempOfficeId || !isEditing) { setCounters([]); return; }
    setCountersLoading(true);
    searchCounters({ transaction_office_id: tempOfficeId, is_active: true }, 1, 1000)
      .then((r) => setCounters(r.data || []))
      .catch(() => setCounters([]))
      .finally(() => setCountersLoading(false));
  }, [tempOfficeId, isEditing]);

  // ==================== HANDLERS ====================

  const handleProvinceChange = (value) => {
    setTempProvinceId(value);
    setTempDistrictId(null);
    setTempOfficeId(null);
    setSelectedCounterIds([]);
    setCounters([]);
    form.setFieldsValue({ district_id: undefined, transaction_office_id: undefined });
  };

  const handleDistrictChange = (value) => {
    setTempDistrictId(value);
    setTempOfficeId(null);
    setSelectedCounterIds([]);
    setCounters([]);
    form.setFieldsValue({ transaction_office_id: undefined });
  };

  const handleOfficeChange = (value) => {
    setTempOfficeId(value);
    setSelectedCounterIds([]);
    setCounters([]);
  };

  // ← Checkbox N-N: toggle từng counter
  const handleCounterCheck = (counterId, checked) => {
    setSelectedCounterIds((prev) =>
      checked ? [...prev, counterId] : prev.filter((cid) => cid !== counterId)
    );
  };

  const handleStartEditing = () => {
    setPendingVideos([]);
    setPendingSliders([]);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (board) {
      const firstCounter = board.counters?.[0];
      form.setFieldsValue({
        code: board.code,
        name: board.name,
        is_video_enabled: board.is_video_enabled,
        is_slider_enabled: board.is_slider_enabled,
        voice_type: board.voice_type,
        province_id: firstCounter?.province_id,
        district_id: firstCounter?.district_id,
        transaction_office_id: firstCounter?.transaction_office_id,
      });
      setTempProvinceId(firstCounter?.province_id);
      setTempDistrictId(firstCounter?.district_id);
      setTempOfficeId(firstCounter?.transaction_office_id);
      setSelectedCounterIds((board.counters || []).map((c) => c.id));
    }
    setPendingVideos([]);
    setPendingSliders([]);
    setIsEditing(false);
  };

  const onSubmit = async (values) => {
    if (selectedCounterIds.length === 0) {
      message.error("Vui lòng chọn ít nhất một quầy!");
      return;
    }

    confirm({
      title: "Xác nhận cập nhật",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn cập nhật thông tin bảng điện tử này?",
      okText: "Cập nhật",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSubmitting(true);

          await updateBoard(id, {
            code: values.code,
            name: values.name,
            counter_ids: selectedCounterIds,           // ← mảng
            is_video_enabled: values.is_video_enabled ?? false,
            is_slider_enabled: values.is_slider_enabled ?? false,
            voice_type: values.voice_type || "Hà Nội", // ← tiếng Việt
          });

          // Upload pending videos
          if (pendingVideos.length > 0) {
            try {
              await uploadVideos(id, pendingVideos.map((v) => v.file), pendingVideos.map((v) => v.description || ""));
            } catch {
              message.warning("Cập nhật thành công nhưng upload video thất bại");
            }
          }

          // Upload pending sliders
          if (pendingSliders.length > 0) {
            try {
              await uploadImageSliders(id, pendingSliders.map((s) => s.file), pendingSliders.map((s) => s.description || ""));
            } catch {
              message.warning("Cập nhật thành công nhưng upload ảnh slider thất bại");
            }
          }

          const updated = await getBoardById(id);
          setBoard(updated);
          const [vids, sliders] = await Promise.all([getVideos(id), getImageSliders(id)]);
          setVideos(vids || []);
          setImageSliders(sliders || []);

          setPendingVideos([]);
          setPendingSliders([]);
          setIsEditing(false);
          message.success("Cập nhật bảng điện tử thành công!");
        } catch (error) {
          message.error(error.message || "Cập nhật thất bại");
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleDelete = () => {
    confirm({
      title: "Xác nhận xóa bảng điện tử",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Bạn có chắc chắn muốn xóa bảng điện tử "${board?.name}" không?`,
      okText: "Xóa", okType: "danger", cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteBoards([id]);
          navigate("/admin/e-center-board");
        } catch {
          message.error("Có lỗi xảy ra khi xóa bảng điện tử");
        }
      },
    });
  };

  const handleRestore = () => {
    confirm({
      title: "Xác nhận khôi phục bảng điện tử",
      icon: <ExclamationCircleOutlined style={{ color: "#52c41a" }} />,
      content: `Bạn có chắc chắn muốn khôi phục bảng điện tử "${board?.name}" không?`,
      okText: "Khôi phục", okType: "primary", cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleBoards([id], true);
          const updated = await getBoardById(id);
          setBoard(updated);
        } catch {
          message.error("Có lỗi xảy ra khi khôi phục bảng điện tử");
        }
      },
    });
  };

  // ---- Video ----
  const handleVideoFileChange = (e) => setVideoFileList(Array.from(e.target.files || []));
  const handleAddPendingVideo = () => {
    if (!videoFileList.length) { message.warning("Vui lòng chọn file video!"); return; }
    setPendingVideos((prev) => [...prev, ...videoFileList.map((f) => ({ name: f.name, file: f, description: videoDescription }))]);
    setVideoFileList([]);
    setVideoDescription("");
    if (videoInputRef.current) videoInputRef.current.value = "";
  };
  const handleRemovePendingVideo = (index) => setPendingVideos((prev) => prev.filter((_, i) => i !== index));
  const handleDeleteExistingVideo = (videoId) => {
    confirm({
      title: "Xóa video?", icon: <ExclamationCircleOutlined />,
      okText: "Xóa", okType: "danger", cancelText: "Hủy",
      onOk: async () => {
        await removeVideos(id, [videoId]);
        setVideos((prev) => prev.filter((v) => v.id !== videoId));
      },
    });
  };

  // ---- Slider ----
  const handleSliderFileChange = (e) => setSliderFileList(Array.from(e.target.files || []));
  const handleAddPendingSlider = () => {
    if (!sliderFileList.length) { message.warning("Vui lòng chọn file ảnh!"); return; }
    setPendingSliders((prev) => [...prev, ...sliderFileList.map((f) => ({ name: f.name, file: f, description: sliderDescription }))]);
    setSliderFileList([]);
    setSliderDescription("");
    if (sliderInputRef.current) sliderInputRef.current.value = "";
  };
  const handleRemovePendingSlider = (index) => setPendingSliders((prev) => prev.filter((_, i) => i !== index));
  const handleDeleteExistingSlider = (sliderId) => {
    confirm({
      title: "Xóa ảnh slider?", icon: <ExclamationCircleOutlined />,
      okText: "Xóa", okType: "danger", cancelText: "Hủy",
      onOk: async () => {
        await removeImageSliders(id, [sliderId]);
        setImageSliders((prev) => prev.filter((s) => s.id !== sliderId));
      },
    });
  };

  // ==================== UTILS ====================

  const getFirstLetter = () => (board?.name ? board.name.charAt(0).toUpperCase() : <DesktopOutlined />);

  const filePickerStyle = {
    flex: 1.5,
    border: "1px solid #d9d9d9",
    borderRadius: 4,
    padding: "4px 11px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#595959",
    height: 32,
    minWidth: 0,
    background: "#fff",
  };

  const mediaColumns = (onRemove) => [
    { title: "STT", key: "stt", width: 60, align: "center", render: (_, __, i) => i + 1 },
    { title: "Tên file", dataIndex: "name", key: "name" },
    {
      title: "", key: "action", width: 60, align: "center",
      render: (_, __, index) => (
        <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => onRemove(index)} />
      ),
    },
  ];

  // Helper: counter đầu tiên để hiển thị location
  const firstCounter = board?.counters?.[0];

  // ==================== RENDER ====================

  if (loading || !board || provincesLoading) {
    return (
      <Spin size="large" tip="Đang tải dữ liệu...">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }} />
      </Spin>
    );
  }

  return (
    <>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/admin">Admin</Link> },
          { title: <Link to="/admin/devices-manager">Quản lý thiết bị</Link> },
          { title: <Link to="/admin/e-center-board">Bảng điện tử</Link> },
          { title: board?.name || "N/A" },
        ]}
      />

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar size={64} style={{ backgroundColor: "#1890ff", marginRight: 16 }}>
              <span style={{ fontSize: 32 }}>{getFirstLetter()}</span>
            </Avatar>
            <div>
              <Title level={4} style={{ margin: 0 }}>{board.name}</Title>
              <div style={{ marginTop: 4 }}>
                {/* ← PGD từ counter đầu tiên */}
                <Text type="secondary">{firstCounter?.transaction_office_name || "N/A"}</Text>
              </div>
              <Space style={{ marginTop: 4 }}>
                <Badge
                  status={board.is_active ? "success" : "error"}
                  text={board.is_active ? "Hoạt động" : "Đã xóa"}
                />
                {board.voice_type && <Tag color="blue">{board.voice_type}</Tag>}
                {board.is_video_enabled && <Tag color="purple">Video</Tag>}
                {board.is_slider_enabled && <Tag color="cyan">Slider</Tag>}
              </Space>
            </div>
          </div>
        }
        extra={
          <Space>
            {board.is_active && (
              <>
                {isEditing ? (
                  <>
                    <Button icon={<CloseOutlined />} onClick={handleCancel}>Hủy</Button>
                    <Button icon={<SaveOutlined />} type="primary" onClick={form.submit} loading={isSubmitting}>Lưu</Button>
                  </>
                ) : (
                  hasPermission(["ADMIN"]) && (
                    <Tooltip title="Chỉnh sửa thông tin">
                      <Button type="primary" icon={<EditOutlined />} onClick={handleStartEditing}>Chỉnh sửa</Button>
                    </Tooltip>
                  )
                )}
                {hasPermission(["ADMIN"]) && (
                  <Tooltip title="Xóa bảng điện tử">
                    <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>Xóa</Button>
                  </Tooltip>
                )}
              </>
            )}
            {!board.is_active && hasPermission(["ADMIN"]) && (
              <Tooltip title="Khôi phục bảng điện tử">
                <Button type="primary" icon={<ReloadOutlined />} onClick={handleRestore}>Khôi phục</Button>
              </Tooltip>
            )}
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Tabs defaultActiveKey="1">

            {/* ========== TAB 1: THÔNG TIN CHUNG ========== */}
            <Tabs.TabPane tab="THÔNG TIN CHUNG" key="1">
              <SectionHeader title="THÔNG TIN CHUNG" />

              {isEditing ? (
                <div style={{ display: "flex", gap: 40 }}>
                  {/* LEFT */}
                  <div style={{ flex: 1 }}>
                    <Form.Item
                      name="province_id"
                      label={<><span style={{ color: "red" }}>*</span> Tỉnh/Thành:</>}
                      rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố!" }]}
                      style={{ marginBottom: 12 }}
                    >
                      <Select
                        placeholder="" showSearch optionFilterProp="children"
                        onChange={handleProvinceChange}
                        filterOption={(input, option) =>
                          (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        style={{ width: "100%" }}
                      >
                        {provinces.map((p) => (
                          <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="district_id"
                      label={<><span style={{ color: "red" }}>*</span> Quận/Huyện:</>}
                      rules={[{ required: true, message: "Vui lòng chọn quận/huyện!" }]}
                      style={{ marginBottom: 12 }}
                    >
                      <Select
                        placeholder="" disabled={!tempProvinceId} loading={districtsLoading}
                        showSearch optionFilterProp="children"
                        onChange={handleDistrictChange}
                        filterOption={(input, option) =>
                          (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        style={{ width: "100%" }}
                      >
                        {districts.map((d) => (
                          <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="transaction_office_id"
                      label={<><span style={{ color: "red" }}>*</span> Phòng giao dịch:</>}
                      rules={[{ required: true, message: "Vui lòng chọn phòng giao dịch!" }]}
                      style={{ marginBottom: 12 }}
                    >
                      <Select
                        placeholder="" disabled={!tempDistrictId} loading={officesLoading}
                        showSearch optionFilterProp="children"
                        onChange={handleOfficeChange}
                        filterOption={(input, option) =>
                          (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        style={{ width: "100%" }}
                      >
                        {transactionOffices.map((o) => (
                          <Select.Option key={o.id} value={o.id}>{o.name} ({o.code})</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    {/* ← Checkbox chọn NHIỀU quầy (N-N) */}
                    <Form.Item
                      label={<><span style={{ color: "red" }}>*</span> Danh sách quầy:</>}
                      style={{ marginBottom: 12 }}
                    >
                      {countersLoading ? (
                        <Text type="secondary">Đang tải...</Text>
                      ) : counters.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {counters.map((c) => (
                            <Checkbox
                              key={c.id}
                              checked={selectedCounterIds.includes(c.id)}
                              onChange={(e) => handleCounterCheck(c.id, e.target.checked)}
                            >
                              {c.code} - {c.name}
                            </Checkbox>
                          ))}
                        </div>
                      ) : (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {tempOfficeId ? "Không có quầy nào" : "Chọn phòng giao dịch để hiển thị quầy"}
                        </Text>
                      )}
                      {selectedCounterIds.length > 0 && (
                        <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
                          Đã chọn: {selectedCounterIds.length} quầy
                        </Text>
                      )}
                    </Form.Item>
                  </div>

                  {/* RIGHT */}
                  <div style={{ flex: 1 }}>
                    <Form.Item
                      name="code"
                      label={<><span style={{ color: "red" }}>*</span> Mã eboard:</>}
                      rules={[{ required: true, message: "Vui lòng nhập mã eboard!" }]}
                      style={{ marginBottom: 12 }}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      name="name"
                      label={<><span style={{ color: "red" }}>*</span> Tên eboard:</>}
                      rules={[{ required: true, message: "Vui lòng nhập tên eboard!" }]}
                      style={{ marginBottom: 12 }}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      name="is_video_enabled"
                      label={<><span style={{ color: "red" }}>*</span> Hiển thị video:</>}
                      valuePropName="checked"
                      style={{ marginBottom: 12 }}
                    >
                      <Checkbox />
                    </Form.Item>

                    <Form.Item
                      name="is_slider_enabled"
                      label={<><span style={{ color: "red" }}>*</span> Hiển thị slider ảnh:</>}
                      valuePropName="checked"
                      style={{ marginBottom: 12 }}
                    >
                      <Checkbox />
                    </Form.Item>

                    {/* ← voice_type giá trị tiếng Việt */}
                    <Form.Item
                      name="voice_type"
                      label={<><span style={{ color: "red" }}>*</span> Giọng gọi số:</>}
                      rules={[{ required: true, message: "Vui lòng chọn giọng!" }]}
                      style={{ marginBottom: 12 }}
                    >
                      <Select allowClear showSearch optionFilterProp="children" placeholder="">
                        <Select.Option value="Hà Nội">Hà Nội</Select.Option>
                        <Select.Option value="Hồ Chí Minh">Hồ Chí Minh</Select.Option>
                        <Select.Option value="Đà Nẵng">Đà Nẵng</Select.Option>
                        <Select.Option value="Huế">Huế</Select.Option>
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <div style={{ display: "flex", gap: 40 }}>
                  <div style={{ flex: 1 }}>
                    <Descriptions
                      bordered column={1} size="small"
                      styles={{ label: { width: "40%", fontWeight: "bold" }, content: { width: "60%" } }}
                    >
                      <Descriptions.Item label="ID">{id}</Descriptions.Item>
                      <Descriptions.Item label="Tỉnh/Thành phố">
                        {firstCounter?.province_name || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Quận/Huyện">
                        {firstCounter?.district_name || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Phòng giao dịch">
                        {firstCounter?.transaction_office_name || "N/A"}
                      </Descriptions.Item>
                      {/* ← Hiển thị TẤT CẢ counters dưới dạng tags */}
                      <Descriptions.Item label="Quầy">
                        {board.counters && board.counters.length > 0 ? (
                          <Space wrap>
                            {board.counters.map((c) => (
                              <Tag key={c.id} color="blue">{c.name}</Tag>
                            ))}
                          </Space>
                        ) : "N/A"}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Descriptions
                      bordered column={1} size="small"
                      styles={{ label: { width: "50%", fontWeight: "bold" }, content: { width: "50%" } }}
                    >
                      <Descriptions.Item label="Mã eboard">{board.code || "N/A"}</Descriptions.Item>
                      <Descriptions.Item label="Tên eboard">{board.name || "N/A"}</Descriptions.Item>
                      <Descriptions.Item label="Giọng gọi số">
                        {board.voice_type || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Hiển thị video">
                        {board.is_video_enabled ? (
                          <Tag color="purple" icon={<CheckCircleOutlined />}>Có</Tag>
                        ) : <Tag>Không</Tag>}
                      </Descriptions.Item>
                      <Descriptions.Item label="Hiển thị slider ảnh">
                        {board.is_slider_enabled ? (
                          <Tag color="cyan" icon={<CheckCircleOutlined />}>Có</Tag>
                        ) : <Tag>Không</Tag>}
                      </Descriptions.Item>
                      {/* <Descriptions.Item label="Ngày tạo">
                        {board.created_at ? dayjs(board.created_at).format("DD/MM/YYYY HH:mm:ss") : "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày chỉnh sửa">
                        {board.updated_at ? dayjs(board.updated_at).format("DD/MM/YYYY HH:mm:ss") : "N/A"}
                      </Descriptions.Item> */}
                    </Descriptions>
                  </div>
                </div>
              )}
            </Tabs.TabPane>

            {/* ========== TAB 2: EBOARD VIDEO ========== */}
            <Tabs.TabPane tab="EBOARD VIDEO" key="2">
              {isEditing && (
                <>
                  <SectionHeader title="UPLOAD VIDEO" />
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
                    <Input
                      placeholder="Nhập nội dung mô tả tài liệu"
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      style={{ flex: 2 }}
                    />
                    <div style={filePickerStyle} onClick={() => videoInputRef.current?.click()}>
                      <PlusCircleOutlined />
                      <span style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {videoFileList.length > 0 ? videoFileList.map((f) => f.name).join(", ") : "Chọn file"}
                      </span>
                      <input ref={videoInputRef} type="file" accept="video/*" multiple style={{ display: "none" }} onChange={handleVideoFileChange} />
                    </div>
                    <Button onClick={handleAddPendingVideo} style={{ minWidth: 64 }}>THÊM</Button>
                    <Button disabled style={{ minWidth: 120 }}>CHỌN FILE ĐÃ CÓ</Button>
                  </div>
                  {pendingVideos.length > 0 && (
                    <>
                      <SectionHeader title="VIDEO SẼ ĐƯỢC UPLOAD" />
                      <Table
                        dataSource={pendingVideos} columns={mediaColumns(handleRemovePendingVideo)}
                        rowKey={(_, i) => i} pagination={false} size="small" bordered style={{ marginBottom: 16 }}
                      />
                    </>
                  )}
                </>
              )}

              <SectionHeader title="DANH SÁCH VIDEO" />
              {mediaLoading ? <Spin /> : (
                <Table
                  dataSource={videos} rowKey="id" pagination={false} size="small" bordered
                  locale={{ emptyText: " " }}
                  columns={[
                    { title: "STT", key: "stt", width: 60, align: "center", render: (_, __, i) => i + 1 },
                    {
                      title: "Tên file", key: "file", align: "center",
                      render: (_, r) => <Text>{r.file_path?.split("/").pop() || r.name || "N/A"}</Text>,
                    },
                    { title: "Mô tả", key: "description", align: "center", render: (_, r) => r.description || "N/A" },
                    {
                      title: "Ngày tạo", key: "created_at", width: 160, align: "center",
                      render: (_, r) => r.created_at ? dayjs(r.created_at).format("DD/MM/YYYY HH:mm") : "N/A",
                    },
                    ...(isEditing ? [{
                      title: "", key: "action", width: 60, align: "center",
                      render: (_, r) => (
                        <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDeleteExistingVideo(r.id)} />
                      ),
                    }] : []),
                  ]}
                />
              )}
            </Tabs.TabPane>

            {/* ========== TAB 3: IMAGE SLIDER ========== */}
            <Tabs.TabPane tab="IMAGE SLIDER" key="3">
              {isEditing && (
                <>
                  <SectionHeader title="QUẢN LÝ IMAGE SLIDER" />
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
                    <Input
                      placeholder="Nhập nội dung mô tả tài liệu"
                      value={sliderDescription}
                      onChange={(e) => setSliderDescription(e.target.value)}
                      style={{ flex: 2 }}
                    />
                    <div style={filePickerStyle} onClick={() => sliderInputRef.current?.click()}>
                      <PlusCircleOutlined />
                      <span style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {sliderFileList.length > 0 ? sliderFileList.map((f) => f.name).join(", ") : "Chọn file"}
                      </span>
                      <input ref={sliderInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleSliderFileChange} />
                    </div>
                    <Button onClick={handleAddPendingSlider} style={{ minWidth: 64 }}>THÊM</Button>
                  </div>
                  {pendingSliders.length > 0 && (
                    <>
                      <SectionHeader title="ẢNH SẼ ĐƯỢC UPLOAD" />
                      <Table
                        dataSource={pendingSliders} columns={mediaColumns(handleRemovePendingSlider)}
                        rowKey={(_, i) => i} pagination={false} size="small" bordered style={{ marginBottom: 16 }}
                      />
                    </>
                  )}
                </>
              )}

              <SectionHeader title="DANH SÁCH IMAGES CHO HIỂN THỊ SLIDE ẢNH" />
              {mediaLoading ? <Spin /> : (
                <Table
                  dataSource={imageSliders} rowKey="id" pagination={false} size="small" bordered
                  locale={{ emptyText: " " }}
                  columns={[
                    { title: "STT", key: "stt", width: 60, align: "center", render: (_, __, i) => i + 1 },
                    {
                      title: "Tên file", key: "file", align: "center",
                      render: (_, r) => <Text>{r.file_path?.split("/").pop() || r.name || "N/A"}</Text>,
                    },
                    { title: "Mô tả", key: "description", align: "center", render: (_, r) => r.description || "N/A" },
                    {
                      title: "Ngày tạo", key: "created_at", width: 160, align: "center",
                      render: (_, r) => r.created_at ? dayjs(r.created_at).format("DD/MM/YYYY HH:mm") : "N/A",
                    },
                    ...(isEditing ? [{
                      title: "", key: "action", width: 60, align: "center",
                      render: (_, r) => (
                        <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDeleteExistingSlider(r.id)} />
                      ),
                    }] : []),
                  ]}
                />
              )}
            </Tabs.TabPane>

          </Tabs>
        </Form>
      </Card>
    </>
  );
}

export default ECenterBoardDetailAdmin;