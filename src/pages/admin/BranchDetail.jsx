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
  InputNumber,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Tabs,
  Tooltip,
  Typography,
  Select,
} from "antd";
import dayjs from "dayjs";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getBranchById,
  updateBranch,
  toggleBranches,
  getServiceConfig,
  setServiceConfig as updateServiceConfig,
  updateBranchQueueConfig,
  updateBranchReportConfig,
} from "../../api/branch";
import { searchProvinces } from "../../api/province";
import { getDistrictsByProvince } from "../../api/district";
import { searchTransactionOffices } from "../../api/transaction_office";
import { getAllActiveServiceGroups } from "../../api/service_group";
import { getServicesByGroup } from "../../api/service_group_mapping";
import { searchServices } from "../../api/service";
import { hasPermission } from "../../services/authService";

const { Text, Title } = Typography;
const { confirm } = Modal;

function BranchDetail() {
  const [branch, setBranch] = useState(null);
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
  const [serviceGroups, setServiceGroups] = useState([]);
  const [services, setServices] = useState([]);
  const [groupServices, setGroupServices] = useState({});
  const [serviceConfig, setServiceConfig] = useState(null);

  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);

  const [provincesLoading, setProvincesLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [officesLoading, setOfficesLoading] = useState(false);

  const [tempProvinceId, setTempProvinceId] = useState(null);
  const [tempDistrictId, setTempDistrictId] = useState(null);

  // Load provinces data
  useEffect(() => {
    const loadInitialData = async () => {
      setProvincesLoading(true);
      try {
        const [provincesData, groupsResult, servicesResult] = await Promise.all(
          [
            searchProvinces({}, 1, 1000),
            getAllActiveServiceGroups(),
            searchServices({ is_active: true }, 1, 1000),
          ],
        );

        setProvinces(provincesData.data || []);
        setServiceGroups(groupsResult || []);
        setServices(servicesResult.data || []);
      } catch (error) {
        console.error("Error loading initial data:", error);
        message.error("Không thể tải dữ liệu ban đầu");
      } finally {
        setProvincesLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load services của từng nhóm
  useEffect(() => {
    const loadGroupServices = async () => {
      if (serviceGroups.length > 0) {
        const servicesMap = {};

        for (const group of serviceGroups) {
          try {
            const result = await getServicesByGroup(group.id, 1, 1000);
            servicesMap[group.id] = result.data || [];
          } catch (error) {
            console.error(
              `Error loading services for group ${group.id}:`,
              error,
            );
            servicesMap[group.id] = [];
          }
        }

        setGroupServices(servicesMap);
      }
    };

    loadGroupServices();
  }, [serviceGroups]);

  // Load branch data
  useEffect(() => {
    const getBranchData = async () => {
      setLoading(true);
      try {
        const response = await getBranchById(id);
        setBranch(response);

        // Load service config
        const configResponse = await getServiceConfig(id);
        setServiceConfig(configResponse);

        // Set selected services and groups
        setSelectedServiceIds(configResponse.services?.map((s) => s.id) || []);
        setSelectedGroupIds(configResponse.service_groups?.map((g) => g.id) || []);
      } catch (error) {
        console.error("Error loading branch:", error);
        message.error("Không thể tải thông tin chi nhánh");
      } finally {
        setLoading(false);
      }
    };

    getBranchData();
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

  // Set form values when branch data is loaded
  useEffect(() => {
    if (branch) {
      const officeProvinceId = branch.transaction_office?.province_id;
      const officeDistrictId = branch.transaction_office?.district_id;

      setTimeout(() => {
        form.setFieldsValue({
          id: id,
          province_id: officeProvinceId,
          district_id: officeDistrictId,
          transaction_office_id: branch.transaction_office?.id,

          // Queue config
          waiting_alert_threshold:
            branch.queue_config?.waiting_alert_threshold || 5,
          overdue_waiting_threshold:
            branch.queue_config?.overdue_waiting_threshold || 10,
          service_alert_threshold:
            branch.queue_config?.service_alert_threshold || 5,
          overdue_service_threshold:
            branch.queue_config?.overdue_service_threshold || 10,

          // Report config
          report_waiting_alert_threshold:
            branch.report_config?.waiting_alert_threshold || 5,
          report_overdue_waiting_threshold:
            branch.report_config?.overdue_waiting_threshold || 10,
          report_service_alert_threshold:
            branch.report_config?.service_alert_threshold || 5,
          report_overdue_service_threshold:
            branch.report_config?.overdue_service_threshold || 10,
        });
      }, 0);

      if (officeProvinceId) {
        setTempProvinceId(officeProvinceId);
      }
      if (officeDistrictId) {
        setTempDistrictId(officeDistrictId);
      }
    }
  }, [branch, id, form]);

  const handleCancel = () => {
    if (branch && serviceConfig) {
      const officeProvinceId = branch.transaction_office?.province_id;
      const officeDistrictId = branch.transaction_office?.district_id;

      form.setFieldsValue({
        id: id,
        province_id: officeProvinceId,
        district_id: officeDistrictId,
        transaction_office_id: branch.transaction_office?.id,

        waiting_alert_threshold:
          branch.queue_config?.waiting_alert_threshold || 5,
        overdue_waiting_threshold:
          branch.queue_config?.overdue_waiting_threshold || 10,
        service_alert_threshold:
          branch.queue_config?.service_alert_threshold || 5,
        overdue_service_threshold:
          branch.queue_config?.overdue_service_threshold || 10,

        report_waiting_alert_threshold:
          branch.report_config?.waiting_alert_threshold || 5,
        report_overdue_waiting_threshold:
          branch.report_config?.overdue_waiting_threshold || 10,
        report_service_alert_threshold:
          branch.report_config?.service_alert_threshold || 5,
        report_overdue_service_threshold:
          branch.report_config?.overdue_service_threshold || 10,
      });

      if (officeProvinceId) {
        setTempProvinceId(officeProvinceId);
      }
      if (officeDistrictId) {
        setTempDistrictId(officeDistrictId);
      }

      // Reset service config
      setSelectedServiceIds(serviceConfig.services?.map((s) => s.id) || []);
      setSelectedGroupIds(serviceConfig.service_groups?.map((g) => g.id) || []);
    }
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleProvinceChange = (value) => {
    setTempProvinceId(value);
    setTempDistrictId(null);
    form.setFieldsValue({
      district_id: undefined,
      transaction_office_id: undefined,
    });
  };

  const handleDistrictChange = (value) => {
    setTempDistrictId(value);
    form.setFieldsValue({
      transaction_office_id: undefined,
    });
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
      content: "Bạn có chắc chắn muốn cập nhật thông tin chi nhánh này?",
      okText: "Cập nhật",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSubmitting(true);

          // Update basic info
          await updateBranch(id, {
            transaction_office_id: values.transaction_office_id,
          });

          // Update service config
          await updateServiceConfig(id, selectedServiceIds, selectedGroupIds);

          // Update queue config
          await updateBranchQueueConfig(id, {
            waiting_alert_threshold: values.waiting_alert_threshold,
            overdue_waiting_threshold: values.overdue_waiting_threshold,
            service_alert_threshold: values.service_alert_threshold,
            overdue_service_threshold: values.overdue_service_threshold,
          });

          // Update report config
          await updateBranchReportConfig(id, {
            waiting_alert_threshold: values.report_waiting_alert_threshold,
            overdue_waiting_threshold: values.report_overdue_waiting_threshold,
            service_alert_threshold: values.report_service_alert_threshold,
            overdue_service_threshold: values.report_overdue_service_threshold,
          });

          // Reload branch data
          const updatedBranch = await getBranchById(id);
          setBranch(updatedBranch);

          const configResponse = await getServiceConfig(id);
          setServiceConfig(configResponse);

          setIsEditing(false);
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
      title: "Xác nhận xóa chi nhánh",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Bạn có chắc chắn muốn xóa chi nhánh "${branch?.transaction_office?.name}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleBranches([id], false);
          navigate("/admin/branches");
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa chi nhánh");
        }
      },
    });
  };

  const handleReload = () => {
    confirm({
      title: "Xác nhận khôi phục chi nhánh",
      icon: <ExclamationCircleOutlined style={{ color: "#59ff4d" }} />,
      content: `Bạn có chắc chắn muốn khôi phục chi nhánh "${branch?.transaction_office?.name}" không?`,
      okText: "Khôi phục",
      okType: "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleBranches([id], true);
          const updatedBranch = await getBranchById(id);
          setBranch(updatedBranch);
        } catch (error) {
          message.error("Có lỗi xảy ra khi khôi phục chi nhánh");
        }
      },
    });
  };

  const getFirstLetter = () => {
    if (branch?.transaction_office?.name) {
      return branch.transaction_office.name.charAt(0).toUpperCase();
    }
    return <HomeOutlined />;
  };

  if (loading || !branch || provincesLoading || !serviceConfig) {
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
          { title: <Link to="/admin/branches-manager">Quản lý PGD</Link> },
          { title: <Link to="/admin/branches">Cấu hình PGD</Link> },
          { title: branch?.transaction_office?.name || "N/A" },
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
                {branch.transaction_office?.name}
              </Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <Text type="secondary">
                  {branch.transaction_office?.district_name},{" "}
                  {branch.transaction_office?.province_name}
                </Text>
              </div>
              <Space style={{ marginTop: 4 }}>
                <Badge
                  status={branch.is_active === true ? "success" : "error"}
                  text={branch.is_active === true ? "Hoạt động" : "Đã xóa"}
                />
              </Space>
            </div>
          </div>
        }
        extra={
          <Space>
            {branch.is_active === true && (
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
                  <Tooltip title="Xóa Chi nhánh">
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
            {branch.is_active === false && (
              <>
                {hasPermission(["ADMIN"]) && (
                  <Tooltip title="Khôi phục Chi nhánh">
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
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn phòng giao dịch",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Chọn PGD"
                        disabled={!tempDistrictId}
                        loading={officesLoading}
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

              <Tabs
                defaultActiveKey="1"
                items={[
                  {
                    key: "1",
                    label: "DỊCH VỤ",
                    children: (
                      <div style={{ display: 'flex', gap: 16 }}>
                        {/* Cột trái: Individual Services */}
                        <div style={{ flex: 1 }}>
                          <Text strong>Dịch vụ:</Text>
                          <div style={{ marginTop: 8, maxHeight: 400, overflowY: 'auto', border: '1px solid #d9d9d9', padding: 12, borderRadius: 4 }}>
                            <Checkbox.Group
                              value={selectedServiceIds}
                              onChange={handleServiceChange}
                              style={{ width: '100%' }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {services.map(service => (
                                  <Checkbox key={service.id} value={service.id}>
                                    {service.name_vi}
                                  </Checkbox>
                                ))}
                              </div>
                            </Checkbox.Group>
                          </div>
                          <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                            Đã chọn: {selectedServiceIds.length} dịch vụ
                          </Text>
                        </div>

                        {/* Cột phải: Service Groups */}
                        <div style={{ flex: 1 }}>
                          <Text strong>Nhóm dịch vụ:</Text>
                          <div style={{ marginTop: 8, maxHeight: 400, overflowY: 'auto', border: '1px solid #d9d9d9', padding: 12, borderRadius: 4 }}>
                            <Checkbox.Group 
                              value={selectedGroupIds} 
                              onChange={handleGroupChange}
                              style={{ width: '100%' }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {serviceGroups.map(group => (
                                  <Checkbox key={group.id} value={group.id}>
                                    <div>
                                      <div>{group.name_vi}</div>
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        ({groupServices[group.id]?.length || 0} dịch vụ)
                                      </Text>
                                    </div>
                                  </Checkbox>
                                ))}
                              </div>
                            </Checkbox.Group>
                          </div>
                          <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                            Đã chọn: {selectedGroupIds.length} nhóm
                          </Text>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "2",
                    label: "CẤU HÌNH QUẦY",
                    children: (
                      <>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 16,
                          }}
                        >
                          <Text style={{ width: "30%", paddingRight: 8 }}>
                            Cảnh báo đợi lâu:
                          </Text>
                          <Form.Item
                            name="waiting_alert_threshold"
                            rules={[
                              { required: true, message: "Vui lòng nhập!" },
                            ]}
                            style={{ flex: 1, marginBottom: 0 }}
                          >
                            <InputNumber min={1} style={{ width: "100%" }} />
                          </Form.Item>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 16,
                          }}
                        >
                          <Text style={{ width: "30%", paddingRight: 8 }}>
                            Lỗi đợi quá lâu:
                          </Text>
                          <Form.Item
                            name="overdue_waiting_threshold"
                            rules={[
                              { required: true, message: "Vui lòng nhập!" },
                            ]}
                            style={{ flex: 1, marginBottom: 0 }}
                          >
                            <InputNumber min={1} style={{ width: "100%" }} />
                          </Form.Item>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 16,
                          }}
                        >
                          <Text style={{ width: "30%", paddingRight: 8 }}>
                            Cảnh báo phục vụ lâu:
                          </Text>
                          <Form.Item
                            name="service_alert_threshold"
                            rules={[
                              { required: true, message: "Vui lòng nhập!" },
                            ]}
                            style={{ flex: 1, marginBottom: 0 }}
                          >
                            <InputNumber min={1} style={{ width: "100%" }} />
                          </Form.Item>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 16,
                          }}
                        >
                          <Text style={{ width: "30%", paddingRight: 8 }}>
                            Lỗi phục vụ quá lâu:
                          </Text>
                          <Form.Item
                            name="overdue_service_threshold"
                            rules={[
                              { required: true, message: "Vui lòng nhập!" },
                            ]}
                            style={{ flex: 1, marginBottom: 0 }}
                          >
                            <InputNumber min={1} style={{ width: "100%" }} />
                          </Form.Item>
                        </div>
                      </>
                    ),
                  },
                  {
                    key: "3",
                    label: "CẤU HÌNH BÁO CÁO",
                    children: (
                      <>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 16,
                          }}
                        >
                          <Text style={{ width: "30%", paddingRight: 8 }}>
                            Cảnh báo đợi lâu:
                          </Text>
                          <Form.Item
                            name="report_waiting_alert_threshold"
                            rules={[
                              { required: true, message: "Vui lòng nhập!" },
                            ]}
                            style={{ flex: 1, marginBottom: 0 }}
                          >
                            <InputNumber min={1} style={{ width: "100%" }} />
                          </Form.Item>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 16,
                          }}
                        >
                          <Text style={{ width: "30%", paddingRight: 8 }}>
                            Lỗi đợi quá lâu:
                          </Text>
                          <Form.Item
                            name="report_overdue_waiting_threshold"
                            rules={[
                              { required: true, message: "Vui lòng nhập!" },
                            ]}
                            style={{ flex: 1, marginBottom: 0 }}
                          >
                            <InputNumber min={1} style={{ width: "100%" }} />
                          </Form.Item>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 16,
                          }}
                        >
                          <Text style={{ width: "30%", paddingRight: 8 }}>
                            Cảnh báo phục vụ lâu:
                          </Text>
                          <Form.Item
                            name="report_service_alert_threshold"
                            rules={[
                              { required: true, message: "Vui lòng nhập!" },
                            ]}
                            style={{ flex: 1, marginBottom: 0 }}
                          >
                            <InputNumber min={1} style={{ width: "100%" }} />
                          </Form.Item>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 16,
                          }}
                        >
                          <Text style={{ width: "30%", paddingRight: 8 }}>
                            Lỗi phục vụ quá lâu:
                          </Text>
                          <Form.Item
                            name="report_overdue_service_threshold"
                            rules={[
                              { required: true, message: "Vui lòng nhập!" },
                            ]}
                            style={{ flex: 1, marginBottom: 0 }}
                          >
                            <InputNumber min={1} style={{ width: "100%" }} />
                          </Form.Item>
                        </div>
                      </>
                    ),
                  },
                ]}
              />
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
                  <Descriptions.Item label="Tỉnh/Thành phố">
                    {branch.transaction_office?.province_name || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Quận/Huyện">
                    {branch.transaction_office?.district_name || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="PGD">
                    {branch.transaction_office?.name || "N/A"} (
                    {branch.transaction_office?.code || "N/A"})
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                    {branch.transaction_office?.address || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">
                    {branch.created_at
                      ? dayjs(branch.created_at).format("DD/MM/YYYY HH:mm:ss")
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày chỉnh sửa">
                    {branch.updated_at
                      ? dayjs(branch.updated_at).format("DD/MM/YYYY HH:mm:ss")
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
                      <div style={{ display: 'flex', gap: 16 }}>
                        {/* Cột trái: Individual Services */}
                        <div style={{ flex: 1 }}>
                          <Text strong>Dịch vụ ({serviceConfig.services?.length || 0}):</Text>
                          <div style={{ marginTop: 8, maxHeight: 400, overflowY: 'auto', border: '1px solid #d9d9d9', padding: 12, borderRadius: 4 }}>
                            {serviceConfig.services && serviceConfig.services.length > 0 ? (
                              serviceConfig.services.map((service) => (
                                <div key={service.id} style={{ padding: "4px 0" }}>
                                  • {service.name_vi}
                                </div>
                              ))
                            ) : (
                              <Text type="secondary">Chưa có dịch vụ nào</Text>
                            )}
                          </div>
                        </div>

                        {/* Cột phải: Service Groups */}
                        <div style={{ flex: 1 }}>
                          <Text strong>Nhóm dịch vụ ({serviceConfig.service_groups?.length || 0}):</Text>
                          <div style={{ marginTop: 8, maxHeight: 400, overflowY: 'auto', border: '1px solid #d9d9d9', padding: 12, borderRadius: 4 }}>
                            {serviceConfig.service_groups && serviceConfig.service_groups.length > 0 ? (
                              serviceConfig.service_groups.map((group) => (
                                <div key={group.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                                    ✓ {group.name_vi}
                                  </div>
                                  <div style={{ paddingLeft: 16 }}>
                                    {group.services && group.services.length > 0 ? (
                                      group.services.map(service => (
                                        <div key={service.id} style={{ padding: "2px 0", fontSize: 12 }}>
                                          → {service.name_vi}
                                        </div>
                                      ))
                                    ) : (
                                      <Text type="secondary" style={{ fontSize: 12 }}>Chưa có dịch vụ</Text>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <Text type="secondary">Chưa có nhóm dịch vụ nào</Text>
                            )}
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "2",
                    label: "CẤU HÌNH QUẦY",
                    children: (
                      <Descriptions
                        bordered
                        column={1}
                        labelStyle={{ width: "50%", fontWeight: "bold" }}
                      >
                        <Descriptions.Item label="Cảnh báo đợi lâu">
                          {branch.queue_config?.waiting_alert_threshold || 5}{" "}
                        </Descriptions.Item>
                        <Descriptions.Item label="Lỗi đợi quá lâu">
                          {branch.queue_config?.overdue_waiting_threshold || 10}{" "}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cảnh báo phục vụ lâu">
                          {branch.queue_config?.service_alert_threshold || 5}{" "}
                        </Descriptions.Item>
                        <Descriptions.Item label="Lỗi phục vụ quá lâu">
                          {branch.queue_config?.overdue_service_threshold || 10}{" "}
                        </Descriptions.Item>
                      </Descriptions>
                    ),
                  },
                  {
                    key: "3",
                    label: "CẤU HÌNH BÁO CÁO",
                    children: (
                      <Descriptions
                        bordered
                        column={1}
                        labelStyle={{ width: "50%", fontWeight: "bold" }}
                      >
                        <Descriptions.Item label="Cảnh báo đợi lâu">
                          {branch.report_config?.waiting_alert_threshold || 5}
                        </Descriptions.Item>
                        <Descriptions.Item label="Lỗi đợi quá lâu">
                          {branch.report_config?.overdue_waiting_threshold || 10}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cảnh báo phục vụ lâu">
                          {branch.report_config?.service_alert_threshold || 5}
                        </Descriptions.Item>
                        <Descriptions.Item label="Lỗi phục vụ quá lâu">
                          {branch.report_config?.overdue_service_threshold || 10}
                        </Descriptions.Item>
                      </Descriptions>
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

export default BranchDetail;