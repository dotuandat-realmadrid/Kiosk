import {
  CalendarOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  GiftOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  HomeOutlined,
  AimOutlined,
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
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
  message,
  Spin,
} from "antd";
import dayjs from "dayjs";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { 
  getTransactionOfficeById, 
  updateTransactionOffice, 
  toggleTransactionOffices 
} from "../../api/transaction_office";
import { searchProvinces } from "../../api/province";
import { getDistrictsByProvince } from "../../api/district";
import { hasPermission } from "../../services/authService";

const { Text, Title } = Typography;
const { confirm } = Modal;

function TransactionOfficeDetail() {
  const [transactionOffice, setTransactionOffice] = useState(null);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  // State tạm thời cho province và district
  const [tempProvinceId, setTempProvinceId] = useState(null);
  const [tempDistrictId, setTempDistrictId] = useState(null);

  // Data states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);

  // Load provinces data
  useEffect(() => {
    const loadProvinces = async () => {
      setProvincesLoading(true);
      try {
        const provincesData = await searchProvinces({}, 1, 1000);
        setProvinces(provincesData.data || []);
      } catch (error) {
        console.error("Error loading provinces:", error);
        message.error("Không thể tải danh sách tỉnh/thành phố");
      } finally {
        setProvincesLoading(false);
      }
    };

    loadProvinces();
  }, []);

  // Load transaction office data
  useEffect(() => {
    const getTransactionOfficeData = async () => {
      setLoading(true);
      try {
        const response = await getTransactionOfficeById(id);
        setTransactionOffice(response);
      } catch (error) {
        console.error("Error loading transaction office:", error);
        message.error("Không thể tải thông tin phòng giao dịch");
      } finally {
        setLoading(false);
      }
    };

    getTransactionOfficeData();
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

  // Set form values when transaction office data is loaded
  useEffect(() => {
    if (transactionOffice) {
      form.setFieldsValue({
        id: id,
        province_id: transactionOffice.province_id,
        district_id: transactionOffice.district_id,
        code: transactionOffice.code || "",
        name: transactionOffice.name || "",
        address: transactionOffice.address || "",
        latitude: transactionOffice.latitude || "",
        longitude: transactionOffice.longitude || "",
        created_at: transactionOffice.created_at,
        updated_at: transactionOffice.updated_at,
      });

      // Set temp IDs để trigger việc load dữ liệu
      if (transactionOffice.province_id) {
        setTempProvinceId(transactionOffice.province_id);
      }
      if (transactionOffice.district_id) {
        setTempDistrictId(transactionOffice.district_id);
      }
    }
  }, [transactionOffice, id, form]);

  const handleCancel = () => {
    // Reset về giá trị hiện tại của transactionOffice thay vì resetFields
    if (transactionOffice) {
      form.setFieldsValue({
        id: id,
        province_id: transactionOffice.province_id,
        district_id: transactionOffice.district_id,
        code: transactionOffice.code || "",
        name: transactionOffice.name || "",
        address: transactionOffice.address || "",
        latitude: transactionOffice.latitude || "",
        longitude: transactionOffice.longitude || "",
        created_at: transactionOffice.created_at,
        updated_at: transactionOffice.updated_at,
      });

      // Reset temp IDs
      if (transactionOffice.province_id) {
        setTempProvinceId(transactionOffice.province_id);
      }
      if (transactionOffice.district_id) {
        setTempDistrictId(transactionOffice.district_id);
      }
    }
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  // Xử lý khi thay đổi province
  const handleProvinceChange = (value) => {
    setTempProvinceId(value);
    setTempDistrictId(null);
    // Reset giá trị district trong form
    form.setFieldsValue({
      district_id: undefined
    });
  };

  // Xử lý khi thay đổi district
  const handleDistrictChange = (value) => {
    setTempDistrictId(value);
  };

  const onSubmit = async (values) => {
    confirm({
      title: "Xác nhận cập nhật",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn cập nhật thông tin phòng giao dịch này?",
      okText: "Cập nhật",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSubmitting(true);
          const data = {
            province_id: values.province_id,
            district_id: values.district_id,
            code: values.code,
            name: values.name,
            address: values.address,
            latitude: values.latitude ? parseFloat(values.latitude) : null,
            longitude: values.longitude ? parseFloat(values.longitude) : null,
          };

          await updateTransactionOffice(data, id);
          const updatedTransactionOffice = await getTransactionOfficeById(id);
          setTransactionOffice(updatedTransactionOffice);
          
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
      title: "Xác nhận xóa phòng giao dịch",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Bạn có chắc chắn muốn xóa phòng giao dịch "${transactionOffice.name}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleTransactionOffices([id], false);
          navigate("/admin/transaction-offices");
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa phòng giao dịch");
        }
      },
    });
  };

  const handleReload = () => {
    confirm({
      title: "Xác nhận khôi phục phòng giao dịch",
      icon: <ExclamationCircleOutlined style={{ color: "#59ff4d" }} />,
      content: `Bạn có chắc chắn muốn khôi phục phòng giao dịch "${transactionOffice.name}" không?`,
      okText: "Khôi phục",
      okType: "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleTransactionOffices([id], true);
          const updatedTransactionOffice = await getTransactionOfficeById(id);
          setTransactionOffice(updatedTransactionOffice);
        } catch (error) {
          message.error("Có lỗi xảy ra khi khôi phục phòng giao dịch");
        }
      },
    });
  };

  // Function to get first letter for avatar
  const getFirstLetter = () => {
    if (transactionOffice?.name) {
      return transactionOffice.name.charAt(0).toUpperCase();
    }
    return <HomeOutlined />;
  };

  if (loading || !transactionOffice || provincesLoading) {
    return (
      <Spin size="large" tip="Đang tải dữ liệu...">
        <div style={{ 
            minHeight: '400px', 
            width: '100%' 
        }} />
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
          { title: <Link to="/admin/transaction-offices">Phòng giao dịch</Link> },
          { title: transactionOffice?.name || "N/A" },
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
                {transactionOffice.name}
              </Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <Text type="secondary">
                  {transactionOffice.province_name} - {transactionOffice.district_name}
                </Text>
              </div>
              <Space style={{ marginTop: 4 }}>
                <Badge
                  status={transactionOffice.is_active === true ? "success" : "error"}
                  text={transactionOffice.is_active === true ? "Hoạt động" : "Đã xóa"}
                />
              </Space>
            </div>
          </div>
        }
        extra={
          <Space>
            {transactionOffice.is_active === true && (
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
                  <Tooltip title="Xóa Phòng giao dịch">
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
            {transactionOffice.is_active === false && (
              <>
                {hasPermission(["ADMIN"]) && (
                  <Tooltip title="Khôi phục Phòng giao dịch">
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
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
        >
          {isEditing ? (
            <>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="ID" name="id">
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
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
                      style={{ width: '100%' }}
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
                      {
                        required: true,
                        message: "Vui lòng chọn quận/huyện",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn Quận/Huyện"
                      style={{ width: '100%' }}
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
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label="Mã" 
                    name="code"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mã phòng giao dịch",
                      },
                    ]}
                  >
                    <Input prefix={<GiftOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Tên"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên phòng giao dịch",
                      },
                    ]}
                  >
                    <Input prefix={<HomeOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item 
                    label="Địa chỉ" 
                    name="address"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập địa chỉ",
                      },
                    ]}
                  >
                    <Input prefix={<EnvironmentOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label="Vĩ Độ (tọa độ maps)" 
                    name="latitude"
                  >
                    <Input 
                      prefix={<AimOutlined />} 
                      placeholder="Ví dụ: 21.0285"
                      type="number"
                      step="any"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Kinh Độ (tọa độ maps)"
                    name="longitude"
                  >
                    <Input 
                      prefix={<AimOutlined />} 
                      placeholder="Ví dụ: 105.8542"
                      type="number"
                      step="any"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          ) : (
            <Descriptions
              bordered
              column={1}
              styles={{
                label: { width: "30%", fontWeight: "bold" },
                content: { width: "70%" }
              }}
            >
              <Descriptions.Item label="ID">{id}</Descriptions.Item>
              <Descriptions.Item label="Tỉnh/Thành phố">
                {transactionOffice.province_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Quận/Huyện">
                {transactionOffice.district_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Mã">
                {transactionOffice.code || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tên">
                {transactionOffice.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {transactionOffice.address || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Vĩ Độ (tọa độ maps)">
                {transactionOffice.latitude || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Kinh Độ (tọa độ maps)">
                {transactionOffice.longitude || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {transactionOffice.created_at
                  ? dayjs(transactionOffice.created_at).format("DD/MM/YYYY HH:mm:ss")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày chỉnh sửa">
                {transactionOffice.updated_at
                  ? dayjs(transactionOffice.updated_at).format("DD/MM/YYYY HH:mm:ss")
                  : "N/A"}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Form>
      </Card>
      <style>{`
        .multi-select-wrap .ant-select-multiple .ant-select-selector {
          height: auto !important;
          min-height: 32px !important;
        }
      `}</style>
    </>
  );
}

export default TransactionOfficeDetail;