import {
  CalendarOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  GlobalOutlined,
  GiftOutlined
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
  Space,
  Tooltip,
  Typography,
  message,
  Spin,
} from "antd";
import dayjs from "dayjs";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProvinceById, updateProvince, toggleProvinces } from "../../api/province";
import { hasPermission } from "../../services/authService";

const { Text, Title } = Typography;
const { confirm } = Modal;

function ProvinceDetail() {
  const [province, setProvince] = useState(null);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  // Load province data
  useEffect(() => {
    const getProvinceData = async () => {
      setLoading(true);
      try {
        const response = await getProvinceById(id);
        setProvince(response);
      } catch (error) {
        console.error("Error loading province:", error);
        message.error("Không thể tải thông tin tỉnh/thành phố");
      } finally {
        setLoading(false);
      }
    };

    getProvinceData();
  }, [id]);

  // Set form values when province data is loaded
  useEffect(() => {
    if (province) {
      form.setFieldsValue({
        id: id,
        code: province.code || "",
        name: province.name || "",
        created_at: province.created_at,
        updated_at: province.updated_at,
      });
    }
  }, [province, id, form]);

  const handleCancel = () => {
    // Reset về giá trị hiện tại của province thay vì resetFields
    if (province) {
      form.setFieldsValue({
        id: id,
        code: province.code || "",
        name: province.name || "",
        created_at: province.created_at,
        updated_at: province.updated_at,
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
      content: "Bạn có chắc chắn muốn cập nhật thông tin tỉnh/thành phố này?",
      okText: "Cập nhật",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSubmitting(true);
          const data = {
            code: values.code,
            name: values.name,
          };

          await updateProvince(data, id);
          const updatedProvince = await getProvinceById(id);
          setProvince(updatedProvince);
          
          // message.success("Cập nhật tỉnh/thành phố thành công!");
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
      title: "Xác nhận xóa tỉnh/thành phố",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Bạn có chắc chắn muốn xóa tỉnh/thành phố "${province.name}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleProvinces([id], false);
          navigate("/admin/provinces");
          // message.success("Xóa tỉnh/thành phố thành công!");
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa tỉnh/thành phố");
        }
      },
    });
  };

  const handleReload = () => {
    confirm({
      title: "Xác nhận khôi phục tỉnh/thành phố",
      icon: <ExclamationCircleOutlined style={{ color: "#59ff4d" }} />,
      content: `Bạn có chắc chắn muốn khôi phục tỉnh/thành phố "${province.name}" không?`,
      okText: "Khôi phục",
      okType: "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleProvinces([id], true);
          const updatedProvince = await getProvinceById(id);
          setProvince(updatedProvince);
          // message.success("Khôi phục tỉnh/thành phố thành công!");
        } catch (error) {
          message.error("Có lỗi xảy ra khi khôi phục tỉnh/thành phố");
        }
      },
    });
  };

  // Function to get first letter for avatar
  const getFirstLetter = () => {
    if (province?.name) {
      return province.name.charAt(0).toUpperCase();
    }
    return <UserOutlined />;
  };

  if (loading || !province) {
    return (
      <Spin size="large" tip="Đang tải dữ liệu..." spinning={true}>
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
          { title: <Link to="/admin/provinces">Tỉnh/Thành phố</Link> },
          { title: province?.name || "N/A" },
        ]}
      />

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar
              size={64}
              style={{ backgroundColor: "#1890ff", marginRight: 16 }}
            >
              <span style={{ fontSize: 32 }}>{getFirstLetter()}</span>
            </Avatar>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {province.name}
              </Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                {/* <Text>Mã: {province.code}</Text> */}
              </div>
              <Space style={{ marginTop: 4 }}>
                <Badge
                  status={province.is_active === true ? "success" : "error"}
                  text={province.is_active === true ? "Hoạt động" : "Đã xóa"}
                />
              </Space>
            </div>
          </div>
        }
        extra={
          <Space>
            {province.is_active === true && (
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
                  <Tooltip title="Xóa Tỉnh/Thành phố">
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
            {province.is_active === false && (
              <>
                {hasPermission(["ADMIN"]) && (
                  <Tooltip title="Khôi phục Tỉnh/Thành phố">
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
                    label="Mã Tỉnh/Thành phố" 
                    name="code"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mã tỉnh/thành phố",
                      },
                    ]}
                  >
                    <Input prefix={<GiftOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Tỉnh/Thành phố"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên tỉnh/thành phố",
                      },
                    ]}
                  >
                    <Input prefix={<GlobalOutlined />} />
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
              <Descriptions.Item label="Mã Tỉnh/Thành phố">
                {province.code || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tỉnh/Thành phố">
                {province.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {province.created_at
                  ? dayjs(province.created_at).format("DD/MM/YYYY HH:mm:ss")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày chỉnh sửa">
                {province.updated_at
                  ? dayjs(province.updated_at).format("DD/MM/YYYY HH:mm:ss")
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

export default ProvinceDetail;