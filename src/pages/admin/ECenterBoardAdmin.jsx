// ==========================================
// ECenterBoardAdmin.jsx (UPDATED - N-N Counter + voice_type Vietnamese)
// ==========================================
import {
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  StopOutlined,
  DesktopOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Checkbox,
  Form,
  Input,
  message,
  Modal,
  Pagination,
  Select,
  Space,
  Table,
  Tabs,
  Tooltip,
  Typography,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  searchBoards,
  createBoard,
  toggleBoards,
  deleteBoards,
  uploadVideos,
  uploadImageSliders,
} from "../../api/e_center_board";
import { searchProvinces } from "../../api/province";
import { getDistrictsByProvince } from "../../api/district";
import { searchTransactionOffices } from "../../api/transaction_office";
import { searchCounters } from "../../api/counter";

const { Text } = Typography;

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

// ==================== BOARD FORM MODAL ====================

const BoardFormModal = ({ visible, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [transactionOffices, setTransactionOffices] = useState([]);
  const [allCounters, setAllCounters] = useState([]);

  const [provincesLoading, setProvincesLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [officesLoading, setOfficesLoading] = useState(false);
  const [countersLoading, setCountersLoading] = useState(false);

  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [selectedOfficeId, setSelectedOfficeId] = useState(null);
  const [selectedCounterIds, setSelectedCounterIds] = useState([]); // ← mảng

  const [activeTab, setActiveTab] = useState("1");

  // Video tab state
  const [videoDescription, setVideoDescription] = useState("");
  const [videoFileList, setVideoFileList] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const videoInputRef = useRef(null);

  // Slider tab state
  const [sliderDescription, setSliderDescription] = useState("");
  const [sliderFileList, setSliderFileList] = useState([]);
  const [sliderList, setSliderList] = useState([]);
  const sliderInputRef = useRef(null);

  const resetAll = () => {
    form.resetFields();
    setSelectedProvinceId(null);
    setSelectedDistrictId(null);
    setSelectedOfficeId(null);
    setSelectedCounterIds([]);
    setDistricts([]);
    setTransactionOffices([]);
    setAllCounters([]);
    setActiveTab("1");
    setVideoDescription("");
    setVideoFileList([]);
    setVideoList([]);
    setSliderDescription("");
    setSliderFileList([]);
    setSliderList([]);
  };

  useEffect(() => {
    if (visible) {
      resetAll();
      setProvincesLoading(true);
      searchProvinces({}, 1, 1000)
        .then((r) => setProvinces(r.data || []))
        .catch(() => message.error("Không thể tải tỉnh/thành phố"))
        .finally(() => setProvincesLoading(false));
    }
  }, [visible]);

  const handleProvinceChange = async (provinceId) => {
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId(null);
    setSelectedOfficeId(null);
    setSelectedCounterIds([]);
    setAllCounters([]);
    form.setFieldsValue({ district_id: undefined, transaction_office_id: undefined });

    if (!provinceId) { setDistricts([]); setTransactionOffices([]); return; }
    setDistrictsLoading(true);
    try {
      const list = await getDistrictsByProvince(provinceId);
      setDistricts(list || []);
    } catch { message.error("Không thể tải quận/huyện"); }
    finally { setDistrictsLoading(false); }
  };

  const handleDistrictChange = async (districtId) => {
    setSelectedDistrictId(districtId);
    setSelectedOfficeId(null);
    setSelectedCounterIds([]);
    setAllCounters([]);
    form.setFieldsValue({ transaction_office_id: undefined });

    if (!districtId) { setTransactionOffices([]); return; }
    setOfficesLoading(true);
    try {
      const r = await searchTransactionOffices({ district_id: districtId, is_active: true }, 1, 1000);
      setTransactionOffices(r.data || []);
    } catch { message.error("Không thể tải phòng giao dịch"); }
    finally { setOfficesLoading(false); }
  };

  const handleOfficeChange = async (officeId) => {
    setSelectedOfficeId(officeId);
    setSelectedCounterIds([]);
    setAllCounters([]);

    if (!officeId) return;
    setCountersLoading(true);
    try {
      const r = await searchCounters({ transaction_office_id: officeId, is_active: true }, 1, 1000);
      setAllCounters(r.data || []);
    } catch { message.error("Không thể tải quầy"); }
    finally { setCountersLoading(false); }
  };

  // ← Checkbox cho phép chọn NHIỀU quầy
  const handleCounterCheck = (counterId, checked) => {
    setSelectedCounterIds((prev) =>
      checked ? [...prev, counterId] : prev.filter((id) => id !== counterId)
    );
  };

  // ---- Video ----
  const handleVideoFileChange = (e) => {
    setVideoFileList(Array.from(e.target.files || []));
  };

  const handleAddVideo = () => {
    if (!videoFileList.length) { message.warning("Vui lòng chọn file video!"); return; }
    setVideoList((prev) => [
      ...prev,
      ...videoFileList.map((f) => ({ name: f.name, file: f, description: videoDescription })),
    ]);
    setVideoFileList([]);
    setVideoDescription("");
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleRemoveVideo = (index) => setVideoList((prev) => prev.filter((_, i) => i !== index));

  // ---- Slider ----
  const handleSliderFileChange = (e) => {
    setSliderFileList(Array.from(e.target.files || []));
  };

  const handleAddSlider = () => {
    if (!sliderFileList.length) { message.warning("Vui lòng chọn file ảnh!"); return; }
    setSliderList((prev) => [
      ...prev,
      ...sliderFileList.map((f) => ({ name: f.name, file: f, description: sliderDescription })),
    ]);
    setSliderFileList([]);
    setSliderDescription("");
    if (sliderInputRef.current) sliderInputRef.current.value = "";
  };

  const handleRemoveSlider = (index) => setSliderList((prev) => prev.filter((_, i) => i !== index));

  // ---- Submit ----
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (selectedCounterIds.length === 0) {
        message.error("Vui lòng chọn ít nhất một quầy!");
        return;
      }

      const boardData = {
        code: values.code,
        name: values.name,
        counter_ids: selectedCounterIds,          // ← mảng thay vì counter_id đơn
        is_video_enabled: values.is_video_enabled ?? false,
        is_slider_enabled: values.is_slider_enabled ?? false,
        voice_type: values.voice_type || "Hà Nội", // ← giá trị tiếng Việt
        is_active: true,
      };

      const success = await onSubmit(boardData, videoList, sliderList);
      if (success) resetAll();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => { resetAll(); onCancel(); };

  const mediaColumns = (onRemove) => [
    {
      title: "STT",
      key: "stt",
      width: 80,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    { title: "Tên file", dataIndex: "name", key: "name", align: "center" },
    { title: "Mô tả", dataIndex: "description", key: "description", align: "center" },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      align: "center",
      render: (_, __, index) => (
        <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => onRemove(index)} />
      ),
    },
  ];

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

  return (
    <Modal
      title={<Space><DesktopOutlined />Thêm mới bảng điện tử</Space>}
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Thêm"
      cancelText="Hủy"
      width={1000}
      destroyOnHidden={true}
      styles={{ body: { padding: "12px 24px" } }}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>

          {/* ========== TAB 1: THÔNG TIN CHUNG ========== */}
          <Tabs.TabPane tab="THÔNG TIN CHUNG" key="1">
            <SectionHeader title="THÔNG TIN CHUNG" />

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
                    placeholder=""
                    loading={provincesLoading}
                    showSearch
                    optionFilterProp="children"
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
                    placeholder=""
                    loading={districtsLoading}
                    disabled={!selectedProvinceId}
                    showSearch
                    optionFilterProp="children"
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
                    placeholder=""
                    loading={officesLoading}
                    disabled={!selectedDistrictId}
                    showSearch
                    optionFilterProp="children"
                    onChange={handleOfficeChange}
                    filterOption={(input, option) =>
                      (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    style={{ width: "100%" }}
                  >
                    {transactionOffices.map((o) => (
                      <Select.Option key={o.id} value={o.id}>{o.name}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* ← Checkbox chọn NHIỀU quầy */}
                <Form.Item
                  label={<><span style={{ color: "red" }}>*</span> Danh sách quầy:</>}
                  style={{ marginBottom: 12 }}
                >
                  {countersLoading ? (
                    <Text type="secondary">Đang tải...</Text>
                  ) : allCounters.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {allCounters.map((c) => (
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
                      {selectedOfficeId ? "Không có quầy nào" : "Chọn phòng giao dịch để hiển thị quầy"}
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
                  initialValue={false}
                  style={{ marginBottom: 12 }}
                >
                  <Checkbox />
                </Form.Item>

                <Form.Item
                  name="is_slider_enabled"
                  label={<><span style={{ color: "red" }}>*</span> Hiển thị slider ảnh:</>}
                  valuePropName="checked"
                  initialValue={false}
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
          </Tabs.TabPane>

          {/* ========== TAB 2: EBOARD VIDEO ========== */}
          <Tabs.TabPane tab="EBOARD VIDEO" key="2">
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
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleVideoFileChange}
                />
              </div>

              <Button onClick={handleAddVideo} style={{ minWidth: 64 }}>THÊM</Button>
              <Button disabled style={{ minWidth: 120 }}>CHỌN FILE ĐÃ CÓ</Button>
            </div>

            <SectionHeader title="DANH SÁCH VIDEO" />
            <Table
              dataSource={videoList}
              columns={mediaColumns(handleRemoveVideo)}
              rowKey={(_, i) => i}
              pagination={false}
              size="small"
              bordered
              locale={{ emptyText: " " }}
            />
          </Tabs.TabPane>

          {/* ========== TAB 3: IMAGE SLIDER ========== */}
          <Tabs.TabPane tab="IMAGE SLIDER" key="3">
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
                <input
                  ref={sliderInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleSliderFileChange}
                />
              </div>

              <Button onClick={handleAddSlider} style={{ minWidth: 64 }}>THÊM</Button>
            </div>

            <SectionHeader title="DANH SÁCH IMAGES CHO HIỂN THỊ SLIDE ẢNH" />
            <Table
              dataSource={sliderList}
              columns={mediaColumns(handleRemoveSlider)}
              rowKey={(_, i) => i}
              pagination={false}
              size="small"
              bordered
              locale={{ emptyText: " " }}
            />
          </Tabs.TabPane>

        </Tabs>
      </Form>
    </Modal>
  );
};

// ==================== MAIN COMPONENT ====================

const ECenterBoardAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [boardData, setBoardData] = useState({
    data: [],
    totalElements: 0,
    totalPage: 0,
    currentPage: 1,
    pageSize: 20,
  });

  const [provinceId, setProvinceId] = useState(queryParams.get("province_id"));
  const [districtId, setDistrictId] = useState(queryParams.get("district_id"));
  const [transactionOfficeId, setTransactionOfficeId] = useState(queryParams.get("transaction_office_id"));

  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [currentPage, setCurrentPage] = useState(parseInt(queryParams.get("page"), 10) || 1);
  const pageSize = 20;

  const [filterForm] = Form.useForm();
  const [filterProvinces, setFilterProvinces] = useState([]);
  const [filterDistricts, setFilterDistricts] = useState([]);
  const [filterOffices, setFilterOffices] = useState([]);
  const [filterProvinceId, setFilterProvinceId] = useState(null);
  const [filterDistrictId, setFilterDistrictId] = useState(null);

  useEffect(() => {
    searchProvinces({}, 1, 1000).then((r) => setFilterProvinces(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setFilterProvinceId(provinceId);
    setFilterDistrictId(districtId);
  }, [provinceId, districtId]);

  useEffect(() => {
    if (!filterProvinceId) { setFilterDistricts([]); setFilterOffices([]); return; }
    getDistrictsByProvince(filterProvinceId).then((l) => setFilterDistricts(l || [])).catch(() => {});
  }, [filterProvinceId]);

  useEffect(() => {
    if (!filterDistrictId) { setFilterOffices([]); return; }
    searchTransactionOffices({ district_id: filterDistrictId, is_active: true }, 1, 1000)
      .then((r) => setFilterOffices(r.data || [])).catch(() => {});
  }, [filterDistrictId]);

  useEffect(() => {
    const fetchBoards = async () => {
      setLoading(true);
      try {
        const data = await searchBoards(
          { province_id: provinceId, district_id: districtId, transaction_office_id: transactionOfficeId },
          currentPage, pageSize
        );
        if (data) setBoardData(data);
      } catch { message.error("Không thể tải danh sách bảng điện tử"); }
      finally { setLoading(false); }
    };
    fetchBoards();
  }, [provinceId, districtId, transactionOfficeId, currentPage]);

  const updateURL = (params) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v && k !== "page") p.set(k, v); });
    navigate(`?${p.toString()}`, { replace: true });
  };

  const refreshBoards = async () => {
    const data = await searchBoards(
      { province_id: provinceId, district_id: districtId, transaction_office_id: transactionOfficeId },
      currentPage, pageSize
    );
    if (data) setBoardData(data);
  };

  const getSelectedStatus = () => {
    const sel = boardData.data.filter((b) => selectedRowKeys.includes(b.id));
    const active = sel.filter((b) => b.is_active);
    const inactive = sel.filter((b) => !b.is_active);
    return { hasActive: active.length > 0, hasInactive: inactive.length > 0, activeCount: active.length, inactiveCount: inactive.length };
  };

  const handleMultipleToggle = (action) => {
    const status = getSelectedStatus();
    const isActivate = action === "activate";
    Modal.confirm({
      title: isActivate ? "Xác nhận kích hoạt" : "Xác nhận vô hiệu hóa",
      icon: <ExclamationCircleOutlined />,
      content: isActivate ? `Kích hoạt ${status.inactiveCount} bảng điện tử?` : `Vô hiệu hóa ${status.activeCount} bảng điện tử?`,
      okText: isActivate ? "Kích hoạt" : "Vô hiệu hóa",
      okType: isActivate ? "primary" : "danger",
      cancelText: "Hủy",
      onOk: async () => {
        setToggleLoading(true);
        try { await toggleBoards(selectedRowKeys, isActivate); setSelectedRowKeys([]); await refreshBoards(); }
        finally { setToggleLoading(false); }
      },
    });
  };

  const handleCreateBoard = async (boardData, videoList, sliderList) => {
    setCreateLoading(true);
    try {
      // boardData.counter_ids đã là mảng từ modal
      const created = await createBoard(boardData);
      if (!created) return false;
      const boardId = created.id;

      if (videoList.length > 0) {
        try {
          await uploadVideos(boardId, videoList.map((v) => v.file), videoList.map((v) => v.description || ""));
        } catch { message.warning("Tạo bảng thành công nhưng upload video thất bại"); }
      }

      if (sliderList.length > 0) {
        try {
          await uploadImageSliders(boardId, sliderList.map((s) => s.file), sliderList.map((s) => s.description || ""));
        } catch { message.warning("Tạo bảng thành công nhưng upload ảnh slider thất bại"); }
      }

      setIsModalVisible(false);
      await refreshBoards();
      return true;
    } catch { return false; }
    finally { setCreateLoading(false); }
  };

  const formatDate = (d) => (d ? dayjs(d).format("DD-MM-YYYY") : "N/A");
  const navigateToBoardDetail = (id) => navigate(`/admin/e-center-boards/${id}`);

  const selectedStatus = getSelectedStatus();

  const columns = [
    {
      title: "Phòng giao dịch",
      key: "transaction_office",
      align: "center",
      // ← counters là mảng, lấy phần tử đầu để hiển thị
      render: (_, record) => (
        <Text>{record.counters?.[0]?.transaction_office_name || "N/A"}</Text>
      ),
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (name) => <Text>{name || "N/A"}</Text>,
    },
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      align: "center",
      render: (code) => <Text strong>{code || "N/A"}</Text>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
      render: (d) => formatDate(d),
    },
    {
      title: "",
      key: "actions",
      width: 60,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button type="text" icon={<EyeOutlined />} onClick={() => navigateToBoardDetail(record.id)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/admin">Admin</Link> },
          { title: <Link to="/admin/devices-manager">Quản lý thiết bị</Link> },
          { title: <Link to="/admin/e-center-boards">Bảng điện tử</Link> },
          { title: "Danh sách bảng điện tử" },
        ]}
      />

      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)} />

          {selectedRowKeys.length > 0 && (
            <Space>
              {selectedStatus.hasActive && (
                <Button danger icon={<DeleteOutlined />} onClick={() => handleMultipleToggle("deactivate")} loading={toggleLoading}>
                  Vô hiệu hóa ({selectedStatus.activeCount})
                </Button>
              )}
              {selectedStatus.hasInactive && (
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleMultipleToggle("activate")} loading={toggleLoading}>
                  Kích hoạt ({selectedStatus.inactiveCount})
                </Button>
              )}
            </Space>
          )}
        </div>

        <div>
          <Form
            form={filterForm}
            layout="inline"
            onFinish={(values) => {
              setCurrentPage(1);
              setProvinceId(values.province_id);
              setDistrictId(values.district_id);
              setTransactionOfficeId(values.transaction_office_id);
              updateURL(values);
            }}
            initialValues={{ province_id: provinceId, district_id: districtId, transaction_office_id: transactionOfficeId }}
          >
            <Form.Item name="province_id">
              <Select
                placeholder="Tỉnh/Thành phố" allowClear showSearch style={{ width: 180 }}
                optionFilterProp="children"
                onChange={(v) => { setFilterProvinceId(v); setFilterDistrictId(null); filterForm.setFieldsValue({ district_id: undefined, transaction_office_id: undefined }); }}
                filterOption={(input, option) => (option?.children ?? "").toLowerCase().includes(input.toLowerCase())}
              >
                {filterProvinces.map((p) => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
              </Select>
            </Form.Item>

            <Form.Item name="district_id">
              <Select
                placeholder="Quận/Huyện" allowClear showSearch style={{ width: 160 }} disabled={!filterProvinceId}
                optionFilterProp="children"
                onChange={(v) => { setFilterDistrictId(v); filterForm.setFieldsValue({ transaction_office_id: undefined }); }}
                filterOption={(input, option) => (option?.children ?? "").toLowerCase().includes(input.toLowerCase())}
              >
                {filterDistricts.map((d) => <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>)}
              </Select>
            </Form.Item>

            <Form.Item name="transaction_office_id">
              <Select
                placeholder="PGD" allowClear showSearch style={{ width: 240 }} disabled={!filterDistrictId}
                optionFilterProp="children"
                filterOption={(input, option) => (option?.children ?? "").toLowerCase().includes(input.toLowerCase())}
              >
                {filterOffices.map((o) => <Select.Option key={o.id} value={o.id}>{o.name} ({o.code})</Select.Option>)}
              </Select>
            </Form.Item>

            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} />
          </Form>
        </div>
      </div>

      <Table
        dataSource={boardData.data || []}
        columns={columns}
        rowKey="id"
        pagination={false}
        loading={loading}
        bordered
        className="custom-header-table"
        rowClassName={(record) => (!record.is_active ? "inactive-row" : "")}
        style={{ marginBottom: 16 }}
        rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) }}
      />

      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={boardData.totalElements || 0}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      <BoardFormModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleCreateBoard}
        loading={createLoading}
      />

      <style>{`
        .inactive-row { background-color: #fff1f0; }
        .custom-header-table .ant-table-thead > tr > th {
          background-color: #1890ff !important;
          color: #fff !important;
        }
      `}</style>
    </>
  );
};

export default ECenterBoardAdmin;