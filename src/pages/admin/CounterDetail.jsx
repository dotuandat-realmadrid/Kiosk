// ==========================================
// CounterDetail.jsx (UPDATED - HỖ TRỢ NHIỀU PRIORITY SERVICES)
// ==========================================
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
  Alert,
  Tag,
} from "antd";
import dayjs from "dayjs";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getCounterById,
  updateCounter,
  toggleCounters,
  getServiceConfig,
  setServiceConfig as updateServiceConfig,
  // updatePriorityServices,  // ← THÊM MỚI
} from "../../api/counter";
import { searchProvinces } from "../../api/province";
import { getDistrictsByProvince } from "../../api/district";
import { searchTransactionOffices } from "../../api/transaction_office";
import { searchBranches } from "../../api/branch";
import { hasPermission } from "../../services/authService";

const { Text, Title } = Typography;
const { confirm } = Modal;

function CounterDetail() {
  const [counter, setCounter] = useState(null);
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

  const [provincesLoading, setProvincesLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [officesLoading, setOfficesLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);

  const [tempProvinceId, setTempProvinceId] = useState(null);
  const [tempDistrictId, setTempDistrictId] = useState(null);
  const [tempOfficeId, setTempOfficeId] = useState(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);

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

  // Load counter data
  useEffect(() => {
    const getCounterData = async () => {
      setLoading(true);
      try {
        const response = await getCounterById(id);
        setCounter(response);

        // Load service config
        const servicesResponse = await getServiceConfig(id);
        setServiceConfig(servicesResponse);
        
        // Set selected service IDs
        setSelectedServiceIds(servicesResponse.services?.map(s => s.id) || []);
      } catch (error) {
        console.error("Error loading counter:", error);
        message.error("Không thể tải thông tin quầy");
      } finally {
        setLoading(false);
      }
    };

    getCounterData();
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
          1
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

  // Set form values when counter data is loaded
  useEffect(() => {
    if (counter && serviceConfig) {
      const officeProvinceId = counter.transaction_office?.province_id;
      const officeDistrictId = counter.transaction_office?.district_id;
      const officeId = counter.transaction_office?.id;

      // ← THAY ĐỔI: priority_service_ids (mảng) thay vì priority_service_id (đơn)
      const priorityServiceIds = serviceConfig.priority_services?.map(s => s.id) || [];

      setTimeout(() => {
        form.setFieldsValue({
          id: id,
          code: counter.code,
          name: counter.name,
          counter_number: counter.counter_number,
          led_board_number: counter.led_board_number,
          priority_service_ids: priorityServiceIds,  // ← THAY ĐỔI
          province_id: officeProvinceId,
          district_id: officeDistrictId,
          transaction_office_id: officeId,
          service_ids: serviceConfig.services?.map(s => s.id) || [],
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
  }, [counter, serviceConfig, id, form]);

  const handleCancel = () => {
    if (counter && serviceConfig) {
      const officeProvinceId = counter.transaction_office?.province_id;
      const officeDistrictId = counter.transaction_office?.district_id;
      const officeId = counter.transaction_office?.id;

      // ← THAY ĐỔI
      const priorityServiceIds = serviceConfig.priority_services?.map(s => s.id) || [];

      form.setFieldsValue({
        id: id,
        code: counter.code,
        name: counter.name,
        counter_number: counter.counter_number,
        led_board_number: counter.led_board_number,
        priority_service_ids: priorityServiceIds,  // ← THAY ĐỔI
        province_id: officeProvinceId,
        district_id: officeDistrictId,
        transaction_office_id: officeId,
        service_ids: serviceConfig.services?.map(s => s.id) || [],
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

      setSelectedServiceIds(serviceConfig.services?.map(s => s.id) || []);
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
    setSelectedServiceIds([]);
    form.setFieldsValue({
      district_id: undefined,
      transaction_office_id: undefined,
      service_ids: undefined,
      priority_service_ids: undefined,  // ← THAY ĐỔI
    });
  };

  const handleDistrictChange = (value) => {
    setTempDistrictId(value);
    setTempOfficeId(null);
    setBranchData(null);
    setSelectedServiceIds([]);
    form.setFieldsValue({
      transaction_office_id: undefined,
      service_ids: undefined,
      priority_service_ids: undefined,  // ← THAY ĐỔI
    });
  };

  const handleOfficeChange = (value) => {
    setTempOfficeId(value);
    setBranchData(null);
    setSelectedServiceIds([]);
    form.setFieldsValue({ 
      service_ids: undefined,
      priority_service_ids: undefined  // ← THAY ĐỔI
    });
  };

  const getBranchServices = (branch) => {
    if (!branch) return [];

    if (branch.service_group && branch.service_group.services) {
      return branch.service_group.services;
    }

    return branch.services || [];
  };

  const handleServiceChange = (serviceIds) => {
    setSelectedServiceIds(serviceIds);
    
    // ← THAY ĐỔI: Kiểm tra priority_service_ids (mảng)
    const currentPriorityIds = form.getFieldValue('priority_service_ids') || [];
    const invalidPriorityIds = currentPriorityIds.filter(id => !serviceIds.includes(id));
    
    if (invalidPriorityIds.length > 0) {
      const validPriorityIds = currentPriorityIds.filter(id => serviceIds.includes(id));
      form.setFieldsValue({ priority_service_ids: validPriorityIds });
    }
  };

  const onSubmit = async (values) => {
    confirm({
      title: "Xác nhận cập nhật",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn cập nhật thông tin quầy này?",
      okText: "Cập nhật",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSubmitting(true);

          const serviceIds = values.service_ids || [];
          let priorityServiceIds = values.priority_service_ids || [];  // ← THAY ĐỔI: mảng

          // Validate: priority services phải nằm trong service_ids
          const invalidPriorityIds = priorityServiceIds.filter(id => !serviceIds.includes(id));
          if (invalidPriorityIds.length > 0) {
            priorityServiceIds = priorityServiceIds.filter(id => serviceIds.includes(id));
            form.setFieldsValue({ priority_service_ids: priorityServiceIds });
            message.warning("Một số dịch vụ ưu tiên không hợp lệ → đã tự động bỏ chọn");
          }

          // Update basic info
          await updateCounter(id, {
            code: values.code,
            name: values.name,
            counter_number: values.counter_number,
            led_board_number: values.led_board_number,
            transaction_office_id: values.transaction_office_id,
          });

          // Update service config (với priority_service_ids)
          if (values.service_ids && values.service_ids.length > 0) {
            await updateServiceConfig(id, values.service_ids, priorityServiceIds);  // ← THAY ĐỔI: gửi cả 2 tham số
          }

          // Reload lại dữ liệu
          const updatedCounter = await getCounterById(id);
          setCounter(updatedCounter);

          const servicesResponse = await getServiceConfig(id);
          setServiceConfig(servicesResponse);
          setSelectedServiceIds(servicesResponse.services?.map(s => s.id) || []);

          setIsEditing(false);
          setBranchData(null);

          message.success("Cập nhật quầy thành công!");
        } catch (error) {
          message.error(error.message || "Cập nhật thất bại");
          console.error(error);
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleDelete = () => {
    confirm({
      title: "Xác nhận xóa quầy",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Bạn có chắc chắn muốn xóa quầy "${counter?.name}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleCounters([id], false);
          navigate("/admin/counter");
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa quầy");
        }
      },
    });
  };

  const handleReload = () => {
    confirm({
      title: "Xác nhận khôi phục quầy",
      icon: <ExclamationCircleOutlined style={{ color: "#59ff4d" }} />,
      content: `Bạn có chắc chắn muốn khôi phục quầy "${counter?.name}" không?`,
      okText: "Khôi phục",
      okType: "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleCounters([id], true);
          const updatedCounter = await getCounterById(id);
          setCounter(updatedCounter);
        } catch (error) {
          message.error("Có lỗi xảy ra khi khôi phục quầy");
        }
      },
    });
  };

  const getFirstLetter = () => {
    if (counter?.name) {
      return counter.name.charAt(0).toUpperCase();
    }
    return <HomeOutlined />;
  };

  if (loading || !counter || provincesLoading || !serviceConfig) {
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
          { title: <Link to="/admin/counters">Quầy</Link> },
          { title: counter?.name || "N/A" },
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
                {counter.name}
              </Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <Text type="secondary">
                  {counter.transaction_office?.district_name},{" "}
                  {counter.transaction_office?.province_name}
                </Text>
              </div>
              <Space style={{ marginTop: 4 }}>
                <Badge
                  status={counter.is_active === true ? "success" : "error"}
                  text={counter.is_active === true ? "Hoạt động" : "Đã xóa"}
                />
              </Space>
            </div>
          </div>
        }
        extra={
          <Space>
            {counter.is_active === true && (
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
                  <Tooltip title="Xóa Quầy">
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
            {counter.is_active === false && (
              <>
                {hasPermission(["ADMIN"]) && (
                  <Tooltip title="Khôi phục Quầy">
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
                  <Col span={24}>
                    <Form.Item label="ID" name="id">
                      <Input disabled value={id}></Input>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Mã quầy"
                      name="code"
                      rules={[
                        { required: true, message: "Vui lòng nhập mã quầy" },
                      ]}
                    >
                      <Input placeholder="Nhập mã quầy" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Tên quầy"
                      name="name"
                      rules={[
                        { required: true, message: "Vui lòng nhập tên quầy" },
                      ]}
                    >
                      <Input placeholder="Nhập tên quầy" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Số quầy"
                      name="counter_number"
                      rules={[
                        { required: true, message: "Vui lòng nhập số quầy" },
                      ]}
                    >
                      <InputNumber
                        placeholder="Nhập số quầy"
                        style={{ width: "100%" }}
                        min={1}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Số bảng LED" name="led_board_number">
                      <InputNumber
                        placeholder="Nhập số bảng LED"
                        style={{ width: "100%" }}
                        min={1}
                      />
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
                <>
                  <Tabs
                    defaultActiveKey="1"
                    items={[
                      {
                        key: "1",
                        label: "DỊCH VỤ",
                        children: (
                          <div>
                            <Form.Item
                              name="service_ids"
                              label="Chọn dịch vụ cho quầy"
                              rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 dịch vụ!" }]}
                            >
                              <Select
                                mode="multiple"
                                placeholder="Chọn dịch vụ"
                                showSearch
                                optionFilterProp="children"
                                onChange={handleServiceChange}
                                filterOption={(input, option) =>
                                  (option?.children ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                              >
                                {getBranchServices(branchData).map((service) => (
                                  <Select.Option key={service.id} value={service.id}>
                                    {service.name_vi}
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>

                            {branchData.service_group && (
                              <Alert
                                title="Thông tin nhóm dịch vụ"
                                description={
                                  <div>
                                    <Text strong>Nhóm: </Text>
                                    <Text>{branchData.service_group.name_vi}</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      ({branchData.service_group.services?.length || 0} dịch vụ trong nhóm)
                                    </Text>
                                  </div>
                                }
                                type="info"
                                showIcon
                                style={{ marginTop: 16 }}
                              />
                            )}

                            {getBranchServices(branchData).length === 0 && (
                              <Alert
                                title="Chưa có dịch vụ"
                                description="Phòng giao dịch này chưa có dịch vụ nào."
                                type="warning"
                                showIcon
                              />
                            )}
                          </div>
                        ),
                      },
                      {
                        key: "2",
                        label: "ƯU TIÊN PHỤC VỤ",
                        children: (
                          <div>
                            {selectedServiceIds.length === 0 ? (
                              <Alert
                                title="Chưa chọn dịch vụ"
                                description="Vui lòng chọn dịch vụ ở tab 'DỊCH VỤ' trước khi chọn dịch vụ ưu tiên."
                                type="warning"
                                showIcon
                              />
                            ) : (
                              <Alert
                                title="Hướng dẫn"
                                description="Các dịch vụ ưu tiên sẽ được ưu tiên phục vụ trước các dịch vụ khác tại quầy này."
                                type="info"
                                showIcon
                              />
                            )}
                            {/* ← THAY ĐỔI: Từ Select đơn → Select multiple */}
                            <Form.Item
                              name="priority_service_ids"
                              label="Chọn dịch vụ ưu tiên"
                            >
                              <Select
                                mode="multiple"  // ← THAY ĐỔI
                                placeholder="Chọn các dịch vụ ưu tiên phục vụ"
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  (option?.children ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                              >
                                {selectedServiceIds.map((serviceId) => {
                                  const service = getBranchServices(branchData).find(s => s.id === serviceId);
                                  return service ? (
                                    <Select.Option key={service.id} value={service.id}>
                                      {service.name_vi}
                                    </Select.Option>
                                  ) : null;
                                })}
                              </Select>
                            </Form.Item>
                          </div>
                        ),
                      },
                    ]}
                  />
                </>
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
                  <Descriptions.Item label="Mã quầy">
                    {counter.code || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên quầy">
                    {counter.name || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số quầy">
                    {counter.counter_number || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số bảng LED">
                    {counter.led_board_number || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="PGD">
                    {counter.transaction_office?.name || "N/A"} (
                    {counter.transaction_office?.code || "N/A"})
                  </Descriptions.Item>
                  <Descriptions.Item label="Tỉnh/Thành phố">
                    {counter.transaction_office?.province_name || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Quận/Huyện">
                    {counter.transaction_office?.district_name || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                    {counter.transaction_office?.address || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">
                    {counter.created_at
                      ? dayjs(counter.created_at).format("DD/MM/YYYY HH:mm:ss")
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày chỉnh sửa">
                    {counter.updated_at
                      ? dayjs(counter.updated_at).format("DD/MM/YYYY HH:mm:ss")
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
                      <div style={{ display: "flex", gap: 24 }}>
                        {/* Bên trái: Danh sách dịch vụ */}
                        <div style={{ flex: 1 }}>
                          <Text strong>
                            Danh sách dịch vụ ({serviceConfig.services?.length || 0}):
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
                            {serviceConfig.services && serviceConfig.services.length > 0 ? (
                              serviceConfig.services.map((service) => (
                                <div key={service.id} style={{ padding: "4px 0" }}>
                                  • {service.name_vi}
                                  {service.is_priority && (
                                    <Tag color="blue" style={{ marginLeft: 8 }}>Ưu tiên</Tag>
                                  )}
                                </div>
                              ))
                            ) : (
                              <Text type="secondary">Chưa có dịch vụ nào</Text>
                            )}
                          </div>
                        </div>

                        {/* Bên phải: Nhóm dịch vụ (nếu có từ transaction_office.branch) */}
                        {counter.transaction_office?.branch?.service_group && (
                          <div style={{ flex: 1 }}>
                            <Text strong>Nhóm dịch vụ:</Text>
                            <div
                              style={{
                                marginTop: 8,
                                padding: 12,
                                border: "1px solid #d9d9d9",
                                borderRadius: 4,
                              }}
                            >
                              <div style={{ padding: "4px 0" }}>
                                ✓ {counter.transaction_office.branch.service_group.name_vi}
                              </div>
                              <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                                ({counter.transaction_office.branch.service_group.services?.length || 0} dịch vụ)
                              </Text>
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 2,
                    label: "DỊCH VỤ ƯU TIÊN",
                    children: (
                      <div style={{ display: "flex", gap: 24 }}>
                        {/* Bên trái: Danh sách dịch vụ */}
                        <div style={{ flex: 1 }}>
                          <Text strong>
                            Danh sách dịch vụ ưu tiên ({serviceConfig.priority_services?.length || 0}):
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
                            {serviceConfig.priority_services && serviceConfig.priority_services.length > 0 ? (
                              serviceConfig.priority_services.map((service) => (
                                <div key={service.id} style={{ padding: "4px 0" }}>
                                  • {service.name_vi}
                                </div>
                              ))
                            ) : (
                              <Text type="secondary">Chưa có dịch vụ ưu tiên</Text>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }
                ]}
              />
            </>
          )}
        </Form>
      </Card>
    </>
  );
}

export default CounterDetail;