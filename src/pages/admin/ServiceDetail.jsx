import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  GiftOutlined,
  FileTextOutlined,
  GlobalOutlined,
  PictureOutlined,
  UploadOutlined,
  PlusOutlined,
  EyeOutlined,
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
  Image,
  Upload,
} from "antd";
import dayjs from "dayjs";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { 
  getServiceById, 
  updateService, 
  toggleServices 
} from "../../api/service";
import { searchTicketFormats } from "../../api/ticket_format";
import { hasPermission } from "../../services/authService";

const { Text, Title } = Typography;
const { confirm } = Modal;

function ServiceDetail() {
  const [service, setService] = useState(null);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ticketFormats, setTicketFormats] = useState([]);
  const [formatsLoading, setFormatsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // Load ticket formats data
  useEffect(() => {
    const loadTicketFormats = async () => {
      setFormatsLoading(true);
      try {
        const formatsData = await searchTicketFormats({}, 1, 1000);
        setTicketFormats(formatsData.data || []);
      } catch (error) {
        console.error("Error loading ticket formats:", error);
        message.error("Không thể tải danh sách định dạng vé");
      } finally {
        setFormatsLoading(false);
      }
    };

    loadTicketFormats();
  }, []);

  // Load service data
  useEffect(() => {
    const getServiceData = async () => {
      setLoading(true);
      try {
        const response = await getServiceById(id);
        setService(response);
        
        // Set image preview nếu có
        if (response.representative_image) {
          setImagePreview(response.representative_image);
          setImageBase64(response.representative_image);
        }
      } catch (error) {
        console.error("Error loading service:", error);
        message.error("Không thể tải thông tin dịch vụ");
      } finally {
        setLoading(false);
      }
    };

    getServiceData();
  }, [id]);

  // Set form values when service data is loaded
  useEffect(() => {
    if (service) {
      form.setFieldsValue({
        id: id,
        format_id: service.ticket_format?.id,
        code: service.code || "",
        name_vi: service.name_vi || "",
        name_en: service.name_en || "",
        name_ja: service.name_ja || "",
        name_cn: service.name_cn || "",
        name_sp: service.name_sp || "",
        representative_image: service.representative_image || "",
        created_at: service.created_at,
        updated_at: service.updated_at,
      });
    }
  }, [service, id, form]);

  // Hàm convert file sang base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Xử lý khi chọn file
  const handleImageChange = async (info) => {
    const file = info.file.originFileObj || info.file;
    
    // Kiểm tra kích thước file (max 5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
      return;
    }

    // Kiểm tra định dạng file
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ chấp nhận file ảnh!');
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      setImageBase64(base64);
      setImagePreview(base64);
      form.setFieldsValue({ representative_image: base64 });
    } catch (error) {
      message.error('Không thể đọc file ảnh!');
      console.error('Error converting image:', error);
    }
  };

  // Xóa ảnh
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    form.setFieldsValue({ representative_image: null });
  };

  const handleCancel = () => {
    // Reset về giá trị hiện tại của service
    if (service) {
      form.setFieldsValue({
        id: id,
        format_id: service.ticket_format?.id,
        code: service.code || "",
        name_vi: service.name_vi || "",
        name_en: service.name_en || "",
        name_ja: service.name_ja || "",
        name_cn: service.name_cn || "",
        name_sp: service.name_sp || "",
        representative_image: service.representative_image || "",
        created_at: service.created_at,
        updated_at: service.updated_at,
      });
      
      // Reset image preview
      if (service.representative_image) {
        setImagePreview(service.representative_image);
        setImageBase64(service.representative_image);
      } else {
        setImagePreview(null);
        setImageBase64(null);
      }
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
      content: "Bạn có chắc chắn muốn cập nhật thông tin dịch vụ này?",
      okText: "Cập nhật",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSubmitting(true);
          const data = {
            format_id: values.format_id,
            code: values.code,
            name_vi: values.name_vi,
            name_en: values.name_en,
            name_ja: values.name_ja,
            name_cn: values.name_cn,
            name_sp: values.name_sp,
            representative_image: imageBase64, // Sử dụng imageBase64 thay vì values
          };

          await updateService(data, id);
          const updatedService = await getServiceById(id);
          setService(updatedService);
          
        //   message.success("Cập nhật dịch vụ thành công!");
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
      title: "Xác nhận xóa dịch vụ",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Bạn có chắc chắn muốn xóa dịch vụ "${service.name_vi}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleServices([id], false);
        //   message.success("Xóa dịch vụ thành công!");
          navigate("/admin/services");
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa dịch vụ");
        }
      },
    });
  };

  const handleReload = () => {
    confirm({
      title: "Xác nhận khôi phục dịch vụ",
      icon: <ExclamationCircleOutlined style={{ color: "#59ff4d" }} />,
      content: `Bạn có chắc chắn muốn khôi phục dịch vụ "${service.name_vi}" không?`,
      okText: "Khôi phục",
      okType: "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleServices([id], true);
          const updatedService = await getServiceById(id);
          setService(updatedService);
        //   message.success("Khôi phục dịch vụ thành công!");
        } catch (error) {
          message.error("Có lỗi xảy ra khi khôi phục dịch vụ");
        }
      },
    });
  };

  // Function to get first letter for avatar
  const getFirstLetter = () => {
    if (service?.name_vi) {
      return service.name_vi.charAt(0).toUpperCase();
    }
    return <FileTextOutlined />;
  };

  if (loading || !service || formatsLoading) {
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
          { title: <Link to="/admin/services-manager">Quản lý dịch vụ</Link> },
          { title: <Link to="/admin/services">Dịch vụ</Link> },
          { title: service?.name_vi || "N/A" },
        ]}
      />

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            {service.representative_image ? (
              <Image
                src={service.representative_image}
                alt={service.name_vi}
                style={{
                  width: 64,
                  height: 64,
                  objectFit: 'cover',
                  borderRadius: '50%',
                //   marginRight: 16,
                  border: '2px solid #52c41a',
                }}
                preview={{
                  cover: <EyeOutlined />,
                }}
              />
            ) : (
              <Avatar
                size={64}
                style={{ backgroundColor: "#52c41a", marginRight: 16 }}
              >
                <span style={{ fontSize: 32 }}>{getFirstLetter()}</span>
              </Avatar>
            )}
            <div style={{ marginLeft: '16px' }}>
              <Title level={4} style={{ margin: '0' }}>
                {service.name_vi}
              </Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <Text type="secondary">
                  {service.code} - {service.ticket_format?.code || "N/A"}
                </Text>
              </div>
              <Space style={{ marginTop: 4 }}>
                <Badge
                  status={service.is_active === true ? "success" : "error"}
                  text={service.is_active === true ? "Hoạt động" : "Đã xóa"}
                />
              </Space>
            </div>
          </div>
        }
        extra={
          <Space>
            {service.is_active === true && (
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
                  <Tooltip title="Xóa Dịch vụ">
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
            {service.is_active === false && (
              <>
                {hasPermission(["ADMIN"]) && (
                  <Tooltip title="Khôi phục Dịch vụ">
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
                    label="Định dạng vé" 
                    name="format_id"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn định dạng vé",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn định dạng vé"
                      style={{ width: '100%' }}
                    >
                      {ticketFormats.map((format) => (
                        <Select.Option key={format.id} value={format.id}>
                          {format.code} - {format.format_pattern}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label="Mã dịch vụ" 
                    name="code"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mã dịch vụ",
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
                    label="Tên tiếng Việt"
                    name="name_vi"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên tiếng Việt",
                      },
                      {
                        min: 2,
                        max: 255,
                        message: "Tên phải từ 2-255 ký tự",
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
                    label="Tên tiếng Anh"
                    name="name_en"
                  >
                    <Input prefix={<GlobalOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Tên tiếng Nhật"
                    name="name_ja"
                  >
                    <Input prefix={<GlobalOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Tên tiếng Trung"
                    name="name_cn"
                  >
                    <Input prefix={<GlobalOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Tên tiếng Tây Ban Nha"
                    name="name_sp"
                  >
                    <Input prefix={<GlobalOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Ảnh đại diện"
                    name="representative_image"
                  >
                    <div>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Upload
                          accept="image/*"
                          showUploadList={false}
                          beforeUpload={() => false}
                          onChange={handleImageChange}
                        >
                          <div
                            className="upload-image-container"
                            style={{
                              width: '120px',
                              height: '120px',
                              border: '2px dashed #d9d9d9',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              backgroundColor: imagePreview ? 'transparent' : '#fafafa',
                              transition: 'all 0.3s',
                              position: 'relative',
                            }}
                            onMouseEnter={(e) => {
                              if (!imagePreview) {
                                e.currentTarget.style.borderColor = '#1890ff';
                                e.currentTarget.style.backgroundColor = '#f0f5ff';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!imagePreview) {
                                e.currentTarget.style.borderColor = '#d9d9d9';
                                e.currentTarget.style.backgroundColor = '#fafafa';
                              }
                            }}
                          >
                            {imagePreview ? (
                              <>
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                  }}
                                />
                                <div className="image-overlay" style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: 'rgba(0, 0, 0, 0)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: 0,
                                  transition: 'all 0.3s',
                                }}>
                                  <DeleteOutlined 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveImage();
                                    }}
                                    style={{ 
                                      fontSize: '20px', 
                                      color: '#fff',
                                      cursor: 'pointer',
                                      zIndex: 10,
                                    }} 
                                  />
                                </div>
                              </>
                            ) : (
                              <PlusOutlined style={{ fontSize: '24px', color: '#999' }} />
                            )}
                          </div>
                        </Upload>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          (Tối đa 5MB, định dạng: JPG, PNG, GIF)
                        </Text>
                      </div>
                    </div>
                    <style jsx>{`
                      .upload-image-container:hover .image-overlay {
                        opacity: 1 !important;
                        background-color: rgba(0, 0, 0, 0.5) !important;
                      }
                    `}</style>
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
              <Descriptions.Item label="Định dạng vé">
                {service.ticket_format?.code || "N/A"} - {service.ticket_format?.format_pattern || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Mã dịch vụ">
                {service.code || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tên tiếng Việt">
                {service.name_vi || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tên tiếng Anh">
                {service.name_en || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tên tiếng Nhật">
                {service.name_ja || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tên tiếng Trung">
                {service.name_cn || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tên tiếng Tây Ban Nha">
                {service.name_sp || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {service.created_at
                  ? dayjs(service.created_at).format("DD/MM/YYYY HH:mm:ss")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày chỉnh sửa">
                {service.updated_at
                  ? dayjs(service.updated_at).format("DD/MM/YYYY HH:mm:ss")
                  : "N/A"}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Form>
      </Card>
    </>
  );
}

export default ServiceDetail;