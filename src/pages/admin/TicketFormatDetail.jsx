import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  GiftOutlined,
  FileTextOutlined,
  NumberOutlined,
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
  Modal,
  Row,
  Space,
  Tooltip,
  Typography,
  message,
  Spin,
  Table,
} from "antd";
import dayjs from "dayjs";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { 
  getTicketFormatById, 
  updateTicketFormat, 
  toggleTicketFormats 
} from "../../api/ticket_format";
import { hasPermission } from "../../services/authService";

const { Text, Title } = Typography;
const { confirm } = Modal;

function TicketFormatDetail() {
  const [ticketFormat, setTicketFormat] = useState(null);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  // Load ticket format data
  useEffect(() => {
    const getTicketFormatData = async () => {
      setLoading(true);
      try {
        const response = await getTicketFormatById(id);
        setTicketFormat(response);
      } catch (error) {
        console.error("Error loading ticket format:", error);
        message.error("Không thể tải thông tin định dạng vé");
      } finally {
        setLoading(false);
      }
    };

    getTicketFormatData();
  }, [id]);

  // Set form values when ticket format data is loaded
  useEffect(() => {
    if (ticketFormat) {
      form.setFieldsValue({
        id: id,
        code: ticketFormat.code || "",
        format_pattern: ticketFormat.format_pattern || "",
        start_number: ticketFormat.start_number,
        max_number: ticketFormat.max_number,
        created_at: ticketFormat.created_at,
        updated_at: ticketFormat.updated_at,
      });
    }
  }, [ticketFormat, id, form]);

  const handleCancel = () => {
    // Reset về giá trị hiện tại của ticketFormat
    if (ticketFormat) {
      form.setFieldsValue({
        id: id,
        code: ticketFormat.code || "",
        format_pattern: ticketFormat.format_pattern || "",
        start_number: ticketFormat.start_number,
        max_number: ticketFormat.max_number,
        created_at: ticketFormat.created_at,
        updated_at: ticketFormat.updated_at,
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
      content: "Bạn có chắc chắn muốn cập nhật thông tin định dạng vé này?",
      okText: "Cập nhật",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSubmitting(true);
          const data = {
            code: values.code,
            format_pattern: values.format_pattern,
            start_number: values.start_number,
            max_number: values.max_number,
          };

          await updateTicketFormat(data, id);
          const updatedTicketFormat = await getTicketFormatById(id);
          setTicketFormat(updatedTicketFormat);
          
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
      title: "Xác nhận xóa định dạng vé",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Bạn có chắc chắn muốn xóa định dạng vé "${ticketFormat.code}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleTicketFormats([id], false);
          navigate("/admin/ticket-formats");
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa định dạng vé");
        }
      },
    });
  };

  const handleReload = () => {
    confirm({
      title: "Xác nhận khôi phục định dạng vé",
      icon: <ExclamationCircleOutlined style={{ color: "#59ff4d" }} />,
      content: `Bạn có chắc chắn muốn khôi phục định dạng vé "${ticketFormat.code}" không?`,
      okText: "Khôi phục",
      okType: "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleTicketFormats([id], true);
          const updatedTicketFormat = await getTicketFormatById(id);
          setTicketFormat(updatedTicketFormat);
        } catch (error) {
          message.error("Có lỗi xảy ra khi khôi phục định dạng vé");
        }
      },
    });
  };

  // Function to get first letter for avatar
  const getFirstLetter = () => {
    if (ticketFormat?.code) {
      return ticketFormat.code.charAt(0).toUpperCase();
    }
    return <FileTextOutlined />;
  };

  // Columns cho bảng services
  const servicesColumns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã dịch vụ",
      dataIndex: "code",
      key: "code",
      align: "center",
    },
    {
      title: "Tên dịch vụ",
      dataIndex: "name_vi",
      key: "name_vi",
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      align: "center",
      render: (is_active) => (
        <Badge
          status={is_active ? "success" : "error"}
          text={is_active ? "Hoạt động" : "Đã xóa"}
        />
      ),
    },
  ];

  if (loading || !ticketFormat) {
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
          { title: <Link to="/admin/ticket-formats">Quản lý Định dạng vé</Link> },
          { title: ticketFormat?.code || "N/A" },
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
                {ticketFormat.code}
              </Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                {/* <Text type="secondary">{ticketFormat.format_pattern}</Text> */}
              </div>
              <Space style={{ marginTop: 4 }}>
                <Badge
                  status={ticketFormat.is_active === true ? "success" : "error"}
                  text={ticketFormat.is_active === true ? "Hoạt động" : "Đã xóa"}
                />
              </Space>
            </div>
          </div>
        }
        extra={
          <Space>
            {ticketFormat.is_active === true && (
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
                  <Tooltip title="Xóa Định dạng vé">
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
            {ticketFormat.is_active === false && (
              <>
                {hasPermission(["ADMIN"]) && (
                  <Tooltip title="Khôi phục Định dạng vé">
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
                    label="Mã định dạng vé" 
                    name="code"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mã định dạng vé",
                      },
                      {
                        min: 2,
                        max: 50,
                        message: "Mã phải từ 2-50 ký tự",
                      },
                      {
                        pattern: /^[^\s]+$/,
                        message: "Mã không được chứa khoảng trắng",
                      },
                    ]}
                  >
                    <Input prefix={<GiftOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Định dạng mẫu"
                    name="format_pattern"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập định dạng mẫu",
                      },
                      {
                        min: 2,
                        max: 100,
                        message: "Định dạng mẫu phải từ 2-100 ký tự",
                      },
                    ]}
                  >
                    <Input prefix={<FileTextOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label="Số bắt đầu" 
                    name="start_number"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số bắt đầu",
                      },
                      {
                        type: 'number',
                        min: 1,
                        message: "Số bắt đầu phải lớn hơn hoặc bằng 1",
                      },
                    ]}
                  >
                    <InputNumber 
                      prefix={<NumberOutlined />} 
                      style={{ width: '100%' }}
                      min={1}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Số lớn nhất"
                    name="max_number"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số lớn nhất",
                      },
                      {
                        type: 'number',
                        min: 1,
                        message: "Số lớn nhất phải lớn hơn hoặc bằng 1",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('start_number') <= value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Số lớn nhất phải lớn hơn hoặc bằng số bắt đầu'));
                        },
                      }),
                    ]}
                  >
                    <InputNumber 
                      prefix={<NumberOutlined />} 
                      style={{ width: '100%' }}
                      min={1}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          ) : (
            <>
              <Descriptions
                bordered
                column={1}
                styles={{
                  label: { width: "30%", fontWeight: "bold" },
                  content: { width: "70%" }
                }}
              >
                <Descriptions.Item label="ID">{id}</Descriptions.Item>
                <Descriptions.Item label="Mã định dạng vé">
                  {ticketFormat.code || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Định dạng mẫu">
                  {ticketFormat.format_pattern || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Số bắt đầu">
                  {ticketFormat.start_number || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Số lớn nhất">
                  {ticketFormat.max_number || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {ticketFormat.created_at
                    ? dayjs(ticketFormat.created_at).format("DD/MM/YYYY HH:mm:ss")
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày chỉnh sửa">
                  {ticketFormat.updated_at
                    ? dayjs(ticketFormat.updated_at).format("DD/MM/YYYY HH:mm:ss")
                    : "N/A"}
                </Descriptions.Item>
              </Descriptions>

              {/* Danh sách dịch vụ sử dụng định dạng này */}
              {/* {ticketFormat.services && ticketFormat.services.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <Title level={5}>Dịch vụ sử dụng định dạng này</Title>
                  <Table
                    dataSource={ticketFormat.services}
                    columns={servicesColumns}
                    rowKey="id"
                    pagination={false}
                    bordered
                    size="small"
                  />
                </div>
              )} */}
            </>
          )}
        </Form>
      </Card>
    </>
  );
}

export default TicketFormatDetail;