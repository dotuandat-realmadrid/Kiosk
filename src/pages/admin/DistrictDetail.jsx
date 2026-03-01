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
import { getDistrictById, updateDistrict, toggleDistricts } from "../../api/district";
import { searchProvinces } from "../../api/province";
import { hasPermission } from "../../services/authService";

const { Text, Title } = Typography;
const { confirm } = Modal;

function DistrictDetail() {
  const [district, setDistrict] = useState(null);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState([]);
  const [provincesLoading, setProvincesLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

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

  // Load district data
  useEffect(() => {
    const getDistrictData = async () => {
      setLoading(true);
      try {
        const response = await getDistrictById(id);
        setDistrict(response);
      } catch (error) {
        console.error("Error loading district:", error);
        message.error("Không thể tải thông tin quận/huyện");
      } finally {
        setLoading(false);
      }
    };

    getDistrictData();
  }, [id]);

  // Set form values when district data is loaded
  useEffect(() => {
    if (district) {
      form.setFieldsValue({
        id: id,
        province_id: district.province_id,
        code: district.code || "",
        name: district.name || "",
        created_at: district.created_at,
        updated_at: district.updated_at,
      });
    }
  }, [district, id, form]);

  const handleCancel = () => {
    // Reset về giá trị hiện tại của district thay vì resetFields
    if (district) {
      form.setFieldsValue({
        id: id,
        province_id: district.province_id,
        code: district.code || "",
        name: district.name || "",
        created_at: district.created_at,
        updated_at: district.updated_at,
      });
    }
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const onSubmit = async (values) => {
    confirm({
      title: "Xác nhận cập nhật",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn cập nhật thông tin quận/huyện này?",
      okText: "Cập nhật",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSubmitting(true);
          const data = {
            province_id: values.province_id,
            code: values.code,
            name: values.name,
          };

          await updateDistrict(data, id);
          const updatedDistrict = await getDistrictById(id);
          setDistrict(updatedDistrict);
          
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
      title: "Xác nhận xóa quận/huyện",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Bạn có chắc chắn muốn xóa quận/huyện "${district.name}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleDistricts([id], false);
          navigate("/admin/districts");
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa quận/huyện");
        }
      },
    });
  };

  const handleReload = () => {
    confirm({
      title: "Xác nhận khôi phục quận/huyện",
      icon: <ExclamationCircleOutlined style={{ color: "#59ff4d" }} />,
      content: `Bạn có chắc chắn muốn khôi phục quận/huyện "${district.name}" không?`,
      okText: "Khôi phục",
      okType: "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleDistricts([id], true);
          const updatedDistrict = await getDistrictById(id);
          setDistrict(updatedDistrict);
        } catch (error) {
          message.error("Có lỗi xảy ra khi khôi phục quận/huyện");
        }
      },
    });
  };

  // Function to get first letter for avatar
  const getFirstLetter = () => {
    if (district?.name) {
      return district.name.charAt(0).toUpperCase();
    }
    return <EnvironmentOutlined />;
  };

  if (loading || !district || provincesLoading) {
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
          { title: <Link to="/admin/districts">Quận/Huyện</Link> },
          { title: district?.name || "N/A" },
        ]}
      />

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar
              size={64}
              style={{ backgroundColor: "#52c41a", marginRight: 16 }}
            >
              <span style={{ fontSize: 32 }}>{getFirstLetter()}</span>
            </Avatar>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {district.name}
              </Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <Text type="secondary">{district.province_name}</Text>
              </div>
              <Space style={{ marginTop: 4 }}>
                <Badge
                  status={district.is_active === true ? "success" : "error"}
                  text={district.is_active === true ? "Hoạt động" : "Đã xóa"}
                />
              </Space>
            </div>
          </div>
        }
        extra={
          <Space>
            {district.is_active === true && (
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
                  <Tooltip title="Xóa Quận/Huyện">
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
            {district.is_active === false && (
              <>
                {hasPermission(["ADMIN"]) && (
                  <Tooltip title="Khôi phục Quận/Huyện">
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
                <Col span={12}>
                  <Form.Item label="ID" name="id">
                    <Input disabled />
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
                    <Select prefix={<GlobalOutlined />}
                      placeholder="Chọn Tỉnh/Thành phố"
                      style={{ width: '100%' }}
                    >
                      {provinces.map((province) => (
                        <Select.Option key={province.id} value={province.id}>
                          {province.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label="Mã Quận/Huyện" 
                    name="code"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mã quận/huyện",
                      },
                    ]}
                  >
                    <Input prefix={<GiftOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Quận/Huyện"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên quận/huyện",
                      },
                    ]}
                  >
                    <Input prefix={<EnvironmentOutlined />} />
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
                {district?.province.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Mã Quận/Huyện">
                {district.code || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Quận/Huyện">
                {district.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {district.created_at
                  ? dayjs(district.created_at).format("DD/MM/YYYY HH:mm:ss")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày chỉnh sửa">
                {district.updated_at
                  ? dayjs(district.updated_at).format("DD/MM/YYYY HH:mm:ss")
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

export default DistrictDetail;