import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Tabs,
  Tooltip,
  Typography,
  Select,
  Alert,
} from "antd";
import dayjs from "dayjs";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getKioskById,
  updateKiosk,
  toggleKiosks,
  getServiceConfig,
  setServiceConfig as updateServiceConfig,
} from "../../api/kiosk";
import { searchProvinces } from "../../api/province";
import { getDistrictsByProvince } from "../../api/district";
import { searchTransactionOffices } from "../../api/transaction_office";
import { searchBranches } from "../../api/branch";
import { hasPermission } from "../../services/authService";

const { Text, Title } = Typography;
const { confirm } = Modal;

function KioskDetail() {
  const [kiosk, setKiosk] = useState(null);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  // Data states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [transactionOffices, setTransactionOffices] = useState([]);
  const [branchData, setBranchData] = useState(null);
  const [serviceConfig, setServiceConfig] = useState(null);

  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);

  const [provincesLoading, setProvincesLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [officesLoading, setOfficesLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);

  const [tempProvinceId, setTempProvinceId] = useState(null);
  const [tempDistrictId, setTempDistrictId] = useState(null);
  const [tempOfficeId, setTempOfficeId] = useState(null);

  // Load provinces data
  useEffect(() => {
    const loadInitialData = async () => {
      setProvincesLoading(true);
      try {
        const provincesData = await searchProvinces({}, 1, 1000);
        setProvinces(provincesData.data || []);
      } catch (error) {
        console.error("Error loading initial data:", error);
        message.error("Không thể tải dữ liệu ban đầu");
      } finally {
        setProvincesLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load kiosk data
  useEffect(() => {
    const getKioskData = async () => {
      setLoading(true);
      try {
        const response = await getKioskById(id);
        setKiosk(response);

        // Load service config
        const configResponse = await getServiceConfig(id);
        setServiceConfig(configResponse);

        // Set selected services and groups
        setSelectedServiceIds(configResponse.services?.map((s) => s.id) || []);
        setSelectedGroupIds(
          configResponse.service_groups?.map((g) => g.id) || [],
        );
      } catch (error) {
        console.error("Error loading kiosk:", error);
        message.error("Không thể tải thông tin kiosk");
      } finally {
        setLoading(false);
      }
    };

    getKioskData();
  }, [id]);

  // Load districts khi tempProvinceId thay đổi
  useEffect(() => {
    const loadDistricts = async () => {
      if (!tempProvinceId || provinces.length === 0) {
        setDistricts([]);
        return;
      }

      setDistrictsLoading(true);
      try {
        const districtsData = await getDistrictsByProvince(tempProvinceId);
        setDistricts(districtsData || []);
      } catch (error) {
        console.error("Error loading districts:", error);
        setDistricts([]);
      } finally {
        setDistrictsLoading(false);
      }
    };

    loadDistricts();
  }, [tempProvinceId, provinces]);

  // Load transaction offices khi tempDistrictId thay đổi
  useEffect(() => {
    const loadOffices = async () => {
      if (!tempDistrictId) {
        setTransactionOffices([]);
        return;
      }

      setOfficesLoading(true);
      try {
        const result = await searchTransactionOffices(
          { district_id: tempDistrictId, is_active: true },
          1,
          1000,
        );
        setTransactionOffices(result.data || []);
      } catch (error) {
        console.error("Error loading transaction offices:", error);
        setTransactionOffices([]);
      } finally {
        setOfficesLoading(false);
      }
    };

    loadOffices();
  }, [tempDistrictId]);

  // Load branch data khi tempOfficeId thay đổi
  useEffect(() => {
    const loadBranchData = async () => {
      if (!tempOfficeId || !isEditing) {
        return;
      }

      setBranchLoading(true);
      try {
        const result = await searchBranches(
          { transaction_office_id: tempOfficeId },
          1,
          1,
        );

        if (result.data && result.data.length > 0) {
          setBranchData(result.data[0]);
        } else {
          message.warning("Phòng giao dịch này chưa có cấu hình chi nhánh");
          setBranchData(null);
        }
      } catch (error) {
        console.error("Error loading branch data:", error);
        message.error("Không thể tải thông tin chi nhánh");
      } finally {
        setBranchLoading(false);
      }
    };

    loadBranchData();
  }, [tempOfficeId, isEditing]);

  // Set form values when kiosk data is loaded
  useEffect(() => {
    if (kiosk) {
      const officeProvinceId = kiosk.transaction_office?.province_id;
      const officeDistrictId = kiosk.transaction_office?.district_id;
      const officeId = kiosk.transaction_office?.id;

      setTimeout(() => {
        form.setFieldsValue({
          id: id,
          code: kiosk.code,
          name: kiosk.name,
          province_id: officeProvinceId,
          district_id: officeDistrictId,
          transaction_office_id: officeId,
        });
      }, 0);

      if (officeProvinceId) {
        setTempProvinceId(officeProvinceId);
      }
      if (officeDistrictId) {
        setTempDistrictId(officeDistrictId);
      }
      if (officeId) {
        setTempOfficeId(officeId);
      }
    }
  }, [kiosk, id, form]);

  const handleCancel = () => {
    if (kiosk && serviceConfig) {
      const officeProvinceId = kiosk.transaction_office?.province_id;
      const officeDistrictId = kiosk.transaction_office?.district_id;
      const officeId = kiosk.transaction_office?.id;

      form.setFieldsValue({
        id: id,
        code: kiosk.code,
        name: kiosk.name,
        province_id: officeProvinceId,
        district_id: officeDistrictId,
        transaction_office_id: officeId,
      });

      if (officeProvinceId) {
        setTempProvinceId(officeProvinceId);
      }
      if (officeDistrictId) {
        setTempDistrictId(officeDistrictId);
      }
      if (officeId) {
        setTempOfficeId(officeId);
      }

      // Reset service config
      setSelectedServiceIds(serviceConfig.services?.map((s) => s.id) || []);
      setSelectedGroupIds(serviceConfig.service_groups?.map((g) => g.id) || []);
      setBranchData(null);
    }
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleProvinceChange = (value) => {
    setTempProvinceId(value);
    setTempDistrictId(null);
    setTempOfficeId(null);
    setBranchData(null);
    form.setFieldsValue({
      district_id: undefined,
      transaction_office_id: undefined,
    });
  };

  const handleDistrictChange = (value) => {
    setTempDistrictId(value);
    setTempOfficeId(null);
    setBranchData(null);
    form.setFieldsValue({
      transaction_office_id: undefined,
    });
  };

  const handleOfficeChange = (value) => {
    setTempOfficeId(value);
    setBranchData(null);
    setSelectedServiceIds([]);
    setSelectedGroupIds([]);
  };

  const handleServiceChange = (checkedValues) => {
    setSelectedServiceIds(checkedValues);
  };

  const handleGroupChange = (checkedValues) => {
    setSelectedGroupIds(checkedValues);
  };

  const onSubmit = async (values) => {
    confirm({
      title: "Xác nhận cập nhật",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn cập nhật thông tin kiosk này?",
      okText: "Cập nhật",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSubmitting(true);

          // Update basic info
          await updateKiosk(id, {
            code: values.code,
            name: values.name,
            transaction_office_id: values.transaction_office_id,
          });

          // Update service config
          await updateServiceConfig(id, selectedServiceIds, selectedGroupIds);

          // Reload kiosk data
          const updatedKiosk = await getKioskById(id);
          setKiosk(updatedKiosk);

          const configResponse = await getServiceConfig(id);
          setServiceConfig(configResponse);

          setIsEditing(false);
          setBranchData(null);
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
      title: "Xác nhận xóa kiosk",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Bạn có chắc chắn muốn xóa kiosk "${kiosk?.name}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleKiosks([id], false);
          navigate("/admin/kiosk");
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa kiosk");
        }
      },
    });
  };

  const handleReload = () => {
    confirm({
      title: "Xác nhận khôi phục kiosk",
      icon: <ExclamationCircleOutlined style={{ color: "#59ff4d" }} />,
      content: `Bạn có chắc chắn muốn khôi phục kiosk "${kiosk?.name}" không?`,
      okText: "Khôi phục",
      okType: "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleKiosks([id], true);
          const updatedKiosk = await getKioskById(id);
          setKiosk(updatedKiosk);
        } catch (error) {
          message.error("Có lỗi xảy ra khi khôi phục kiosk");
        }
      },
    });
  };

  const getFirstLetter = () => {
    if (kiosk?.name) {
      return kiosk.name.charAt(0).toUpperCase();
    }
    return <HomeOutlined />;
  };

  if (loading || !kiosk || provincesLoading || !serviceConfig) {
    return (
      <Spin size="large" tip="Đang tải dữ liệu...">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        ></div>
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
          { title: <Link to="/admin/kiosks">Kiosk</Link> },
          { title: kiosk?.name || "N/A" },
        ]}
      />

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar
              size={64}
              style={{ backgroundColor: "#fa8c16", marginRight: 16 }}
            >
              <span style={{ fontSize: 32 }}>{getFirstLetter()}</span>
            </Avatar>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {kiosk.name}
              </Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <Text type="secondary">
                  {kiosk.transaction_office?.district_name},{" "}
                  {kiosk.transaction_office?.province_name}
                </Text>
              </div>
              <Space style={{ marginTop: 4 }}>
                <Badge
                  status={kiosk.is_active === true ? "success" : "error"}
                  text={kiosk.is_active === true ? "Hoạt động" : "Đã xóa"}
                />
              </Space>
            </div>
          </div>
        }
        extra={
          <Space>
            {kiosk.is_active === true && (
              <>
                {isEditing ? (
                  <>
                    <Button icon={<CloseOutlined />} onClick={handleCancel}>
                      Hủy
                    </Button>
                    <Button
                      icon={<SaveOutlined />}
                      type="primary"
                      onClick={form.submit}
                      loading={isSubmitting}
                    >
                      Lưu
                    </Button>
                  </>
                ) : (
                  <>
                    {hasPermission(["ADMIN"]) && (
                      <Tooltip title="Chỉnh sửa thông tin">
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={handleStartEditing}
                        >
                          Chỉnh sửa
                        </Button>
                      </Tooltip>
                    )}
                  </>
                )}
                {hasPermission(["ADMIN"]) && (
                  <Tooltip title="Xóa Kiosk">
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleDelete}
                    >
                      Xóa
                    </Button>
                  </Tooltip>
                )}
              </>
            )}
            {kiosk.is_active === false && (
              <>
                {hasPermission(["ADMIN"]) && (
                  <Tooltip title="Khôi phục Kiosk">
                    <Button
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={handleReload}
                    >
                      Khôi phục
                    </Button>
                  </Tooltip>
                )}
              </>
            )}
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          {isEditing ? (
            <>
              {/* Thông tin cơ bản */}
              <div style={{ marginBottom: 24 }}>
                <Title level={5}>Thông tin cơ bản</Title>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="ID" name="id">
                      <Input disabled value={id}></Input>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Mã kiosk"
                      name="code"
                      rules={[
                        { required: true, message: "Vui lòng nhập mã kiosk" },
                      ]}
                    >
                      <Input placeholder="Nhập mã kiosk" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Tên kiosk"
                      name="name"
                      rules={[
                        { required: true, message: "Vui lòng nhập tên kiosk" },
                      ]}
                    >
                      <Input placeholder="Nhập tên kiosk" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Tỉnh/Thành phố"
                      name="province_id"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn tỉnh/thành phố",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Chọn Tỉnh/Thành phố"
                        onChange={handleProvinceChange}
                      >
                        {provinces.map((province) => (
                          <Select.Option key={province.id} value={province.id}>
                            {province.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Quận/Huyện"
                      name="district_id"
                      rules={[
                        { required: true, message: "Vui lòng chọn quận/huyện" },
                      ]}
                    >
                      <Select
                        placeholder="Chọn Quận/Huyện"
                        onChange={handleDistrictChange}
                        disabled={!tempProvinceId}
                        loading={districtsLoading}
                      >
                        {districts.map((district) => (
                          <Select.Option key={district.id} value={district.id}>
                            {district.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="PGD"
                      name="transaction_office_id"
                      rules={[{ required: true, message: "Vui lòng chọn PGD" }]}
                    >
                      <Select
                        placeholder="Chọn PGD"
                        disabled={!tempDistrictId}
                        loading={officesLoading}
                        onChange={handleOfficeChange}
                      >
                        {transactionOffices.map((office) => (
                          <Select.Option key={office.id} value={office.id}>
                            {office.name} ({office.code})
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {branchLoading && (
                <Alert
                  title="Đang tải thông tin chi nhánh..."
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              {tempOfficeId && !branchLoading && !branchData && (
                <Alert
                  title="Phòng giao dịch này chưa có cấu hình chi nhánh"
                  description="Vui lòng chọn phòng giao dịch khác đã được cấu hình."
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              {branchData && (
                <Tabs
                  defaultActiveKey="1"
                  items={[
                    {
                      key: "1",
                      label: "DỊCH VỤ",
                      children: (
                        <div style={{ display: "flex", gap: 16 }}>
                          {/* Cột trái: Service Groups */}
                          <div style={{ flex: 1 }}>
                            <Text strong>Nhóm dịch vụ:</Text>
                            <div
                              style={{
                                marginTop: 8,
                                maxHeight: 400,
                                overflowY: "auto",
                                border: "1px solid #d9d9d9",
                                padding: 12,
                                borderRadius: 4,
                              }}
                            >
                              <Checkbox.Group
                                value={selectedGroupIds}
                                onChange={handleGroupChange}
                                style={{ width: "100%" }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                  }}
                                >
                                  {branchData.service_groups &&
                                  branchData.service_groups.length > 0 ? (
                                    branchData.service_groups.map((group) => (
                                      <Checkbox key={group.id} value={group.id}>
                                        <div>
                                          <div>
                                            {group.name_vi}
                                            <Text
                                              type="secondary"
                                              style={{
                                                fontSize: 13,
                                                padding: "4px",
                                              }}
                                            >
                                              ({group.services?.length || 0}{" "}
                                              dịch vụ)
                                            </Text>
                                          </div>
                                        </div>
                                      </Checkbox>
                                    ))
                                  ) : (
                                    <Text type="secondary">
                                      Phòng giao dịch chưa cấu hình nhóm dịch vụ
                                    </Text>
                                  )}
                                </div>
                              </Checkbox.Group>
                            </div>
                            <Text
                              type="secondary"
                              style={{
                                fontSize: 12,
                                marginTop: 4,
                                display: "block",
                              }}
                            >
                              Đã chọn: {selectedGroupIds.length} nhóm
                            </Text>
                          </div>

                          {/* Cột phải: Individual Services */}
                          <div style={{ flex: 1 }}>
                            <Text strong>Dịch vụ:</Text>
                            <div
                              style={{
                                marginTop: 8,
                                maxHeight: 400,
                                overflowY: "auto",
                                border: "1px solid #d9d9d9",
                                padding: 12,
                                borderRadius: 4,
                              }}
                            >
                              <Checkbox.Group
                                value={selectedServiceIds}
                                onChange={handleServiceChange}
                                style={{ width: "100%" }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                  }}
                                >
                                  {branchData.services &&
                                  branchData.services.length > 0 ? (
                                    branchData.services.map((service) => (
                                      <Checkbox
                                        key={service.id}
                                        value={service.id}
                                      >
                                        {service.name_vi}
                                      </Checkbox>
                                    ))
                                  ) : (
                                    <Text type="secondary">
                                      Phòng giao dịch chưa cấu hình dịch vụ
                                    </Text>
                                  )}
                                </div>
                              </Checkbox.Group>
                            </div>
                            <Text
                              type="secondary"
                              style={{
                                fontSize: 12,
                                marginTop: 4,
                                display: "block",
                              }}
                            >
                              Đã chọn: {selectedServiceIds.length} dịch vụ
                            </Text>
                          </div>
                        </div>
                      ),
                    },
                  ]}
                />
              )}
            </>
          ) : (
            <>
              {/* Thông tin cơ bản - Hiển thị ở ngoài tabs */}
              <div style={{ marginBottom: 24 }}>
                <Title level={5}>Thông tin cơ bản</Title>
                <Descriptions
                  bordered
                  column={1}
                  styles={{
                    label: { width: "30%", fontWeight: "bold" },
                    content: { width: "70%" },
                  }}
                >
                  <Descriptions.Item label="ID">{id}</Descriptions.Item>
                  <Descriptions.Item label="Mã kiosk">
                    {kiosk.code || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên kiosk">
                    {kiosk.name || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="PGD">
                    {kiosk.transaction_office?.name || "N/A"} (
                    {kiosk.transaction_office?.code || "N/A"})
                  </Descriptions.Item>
                  <Descriptions.Item label="Tỉnh/Thành phố">
                    {kiosk.transaction_office?.province_name || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Quận/Huyện">
                    {kiosk.transaction_office?.district_name || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                    {kiosk.transaction_office?.address || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">
                    {kiosk.created_at
                      ? dayjs(kiosk.created_at).format("DD/MM/YYYY HH:mm:ss")
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày chỉnh sửa">
                    {kiosk.updated_at
                      ? dayjs(kiosk.updated_at).format("DD/MM/YYYY HH:mm:ss")
                      : "N/A"}
                  </Descriptions.Item>
                </Descriptions>
              </div>

              <Tabs
                defaultActiveKey="1"
                items={[
                  {
                    key: "1",
                    label: "DỊCH VỤ",
                    children: (
                      <div style={{ display: "flex", gap: 16 }}>
                        {/* Cột trái: Service Groups */}
                        <div style={{ flex: 1 }}>
                          <Text strong>
                            Nhóm dịch vụ (
                            {serviceConfig.service_groups?.length || 0}):
                          </Text>
                          <div
                            style={{
                              marginTop: 8,
                              maxHeight: 400,
                              overflowY: "auto",
                              border: "1px solid #d9d9d9",
                              padding: 12,
                              borderRadius: 4,
                            }}
                          >
                            {serviceConfig.service_groups &&
                            serviceConfig.service_groups.length > 0 ? (
                              serviceConfig.service_groups.map((group) => (
                                <div
                                  key={group.id}
                                  style={{
                                    marginBottom: 12,
                                    paddingBottom: 12,
                                    borderBottom: "1px solid #f0f0f0",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontWeight: "bold",
                                      marginBottom: 4,
                                    }}
                                  >
                                    {/* ✓  */}
                                    {group.name_vi}
                                  </div>
                                  <div style={{ paddingLeft: 10 }}>
                                    {group.services &&
                                    group.services.length > 0 ? (
                                      group.services.map((service) => (
                                        <div
                                          key={service.id}
                                          style={{
                                            padding: "2px 0",
                                            fontSize: 12,
                                          }}
                                        >
                                          {/* →  */}• {service.name_vi}
                                        </div>
                                      ))
                                    ) : (
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: 12 }}
                                      >
                                        Chưa có dịch vụ
                                      </Text>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <Text type="secondary">
                                Chưa có nhóm dịch vụ nào
                              </Text>
                            )}
                          </div>
                        </div>

                        {/* Cột phải: Individual Services */}
                        <div style={{ flex: 1 }}>
                          <Text strong>
                            Dịch vụ ({serviceConfig.services?.length || 0}):
                          </Text>
                          <div
                            style={{
                              marginTop: 8,
                              maxHeight: 400,
                              overflowY: "auto",
                              border: "1px solid #d9d9d9",
                              padding: 12,
                              borderRadius: 4,
                            }}
                          >
                            {serviceConfig.services &&
                            serviceConfig.services.length > 0 ? (
                              serviceConfig.services.map((service) => (
                                <div
                                  key={service.id}
                                  style={{ padding: "4px 0" }}
                                >
                                  • {service.name_vi}
                                </div>
                              ))
                            ) : (
                              <Text type="secondary">Chưa có dịch vụ nào</Text>
                            )}
                          </div>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </>
          )}
        </Form>
      </Card>
    </>
  );
}

export default KioskDetail;
