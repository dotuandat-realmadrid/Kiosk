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
  Tag,
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
  getServiceGroupById, 
  updateServiceGroup, 
  toggleServiceGroups 
} from "../../api/service_group";
import { searchServices } from "../../api/service";
import {
  getServicesByGroup,
  addServicesToGroup,
  removeServicesFromGroup,
} from "../../api/service_group_mapping";
import { hasPermission } from "../../services/authService";

const { Text, Title } = Typography;
const { confirm } = Modal;

function ServiceGroupDetail() {
  const [serviceGroup, setServiceGroup] = useState(null);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  
  // States cho quản lý dịch vụ
  const [servicesInGroup, setServicesInGroup] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [allServices, setAllServices] = useState([]);
  const [servicesForEdit, setServicesForEdit] = useState([]); // Danh sách services cho edit mode
  const [servicesPagination, setServicesPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const navigate = useNavigate();
  const { id } = useParams();

  // Load service group data
  useEffect(() => {
    const getServiceGroupData = async () => {
      setLoading(true);
      try {
        const response = await getServiceGroupById(id);
        setServiceGroup(response);
        
        // Set image preview nếu có
        if (response.representative_image) {
          setImagePreview(response.representative_image);
          setImageBase64(response.representative_image);
        }
      } catch (error) {
        console.error("Error loading service group:", error);
        message.error("Không thể tải thông tin nhóm dịch vụ");
      } finally {
        setLoading(false);
      }
    };

    getServiceGroupData();
  }, [id]);

  // Load all services for edit mode select
  useEffect(() => {
    const loadAllServices = async () => {
      try {
        const result = await searchServices({}, 1, 1000);
        setServicesForEdit(result.data || []);
      } catch (error) {
        console.error("Error loading all services:", error);
      }
    };

    loadAllServices();
  }, []);

  // Load services in group
  useEffect(() => {
    if (id) {
      fetchServicesInGroup();
    }
  }, [id, servicesPagination.current]);

  const fetchServicesInGroup = async () => {
    setServicesLoading(true);
    try {
      const result = await getServicesByGroup(
        id,
        servicesPagination.current,
        servicesPagination.pageSize
      );
      setServicesInGroup(result.data || []);
      setServicesPagination({
        ...servicesPagination,
        total: result.totalElements || 0,
      });
    } catch (error) {
      console.error("Error loading services in group:", error);
      message.error("Không thể tải danh sách dịch vụ");
    } finally {
      setServicesLoading(false);
    }
  };

  // Set form values when service group data is loaded
  useEffect(() => {
    if (serviceGroup) {
      form.setFieldsValue({
        id: id,
        code: serviceGroup.code || "",
        name_vi: serviceGroup.name_vi || "",
        name_en: serviceGroup.name_en || "",
        name_ja: serviceGroup.name_ja || "",
        name_cn: serviceGroup.name_cn || "",
        name_sp: serviceGroup.name_sp || "",
        representative_image: serviceGroup.representative_image || "",
        services: servicesInGroup.map(s => s.id), // Set services as array of IDs
        created_at: serviceGroup.created_at,
        updated_at: serviceGroup.updated_at,
      });
    }
  }, [serviceGroup, servicesInGroup, id, form]);

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
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
      return;
    }

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
    // Reset về giá trị hiện tại
    if (serviceGroup) {
      form.setFieldsValue({
        id: id,
        code: serviceGroup.code || "",
        name_vi: serviceGroup.name_vi || "",
        name_en: serviceGroup.name_en || "",
        name_ja: serviceGroup.name_ja || "",
        name_cn: serviceGroup.name_cn || "",
        name_sp: serviceGroup.name_sp || "",
        representative_image: serviceGroup.representative_image || "",
        services: servicesInGroup.map(s => s.id), // Reset services
        created_at: serviceGroup.created_at,
        updated_at: serviceGroup.updated_at,
      });
      
      // Reset image preview
      if (serviceGroup.representative_image) {
        setImagePreview(serviceGroup.representative_image);
        setImageBase64(serviceGroup.representative_image);
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
      content: "Bạn có chắc chắn muốn cập nhật thông tin nhóm dịch vụ này?",
      okText: "Cập nhật",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSubmitting(true);
          const data = {
            code: values.code,
            name_vi: values.name_vi,
            name_en: values.name_en,
            name_ja: values.name_ja,
            name_cn: values.name_cn,
            name_sp: values.name_sp,
            representative_image: imageBase64,
          };

          // Update service group info
          await updateServiceGroup(data, id);
          
          // Handle service updates
          const currentServiceIds = servicesInGroup.map(s => s.id);
          const newServiceIds = values.services || [];
          
          // Tìm services cần thêm và cần xóa
          const servicesToAdd = newServiceIds.filter(sid => !currentServiceIds.includes(sid));
          const servicesToRemove = currentServiceIds.filter(sid => !newServiceIds.includes(sid));
          
          // Thực hiện thêm/xóa services
          if (servicesToAdd.length > 0) {
            await addServicesToGroup(id, servicesToAdd);
          }
          if (servicesToRemove.length > 0) {
            await removeServicesFromGroup(id, servicesToRemove);
          }

          // Reload data
          const updatedServiceGroup = await getServiceGroupById(id);
          setServiceGroup(updatedServiceGroup);
          fetchServicesInGroup();
          
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
      title: "Xác nhận xóa nhóm dịch vụ",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Bạn có chắc chắn muốn xóa nhóm dịch vụ "${serviceGroup.name_vi}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleServiceGroups([id], false);
          navigate("/admin/service-groups");
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa nhóm dịch vụ");
        }
      },
    });
  };

  const handleReload = () => {
    confirm({
      title: "Xác nhận khôi phục nhóm dịch vụ",
      icon: <ExclamationCircleOutlined style={{ color: "#59ff4d" }} />,
      content: `Bạn có chắc chắn muốn khôi phục nhóm dịch vụ "${serviceGroup.name_vi}" không?`,
      okText: "Khôi phục",
      okType: "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleServiceGroups([id], true);
          const updatedServiceGroup = await getServiceGroupById(id);
          setServiceGroup(updatedServiceGroup);
        } catch (error) {
          message.error("Có lỗi xảy ra khi khôi phục nhóm dịch vụ");
        }
      },
    });
  };

  // Columns cho bảng dịch vụ (view mode only)
  const serviceColumns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => {
        return (servicesPagination.current - 1) * servicesPagination.pageSize + index + 1;
      },
    },
    {
      title: "Mã dịch vụ",
      dataIndex: "code",
      key: "code",
      align: "center",
      width: 150,
    },
    {
      title: "Tên dịch vụ",
      key: "name",
      render: (_, record) => (
        <div>
          <div>{record.name_vi || "N/A"}</div>
          <div style={{ color: "#8c8c8c", fontSize: "13px" }}>
            {record.name_en || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Ảnh",
      key: "image",
      align: "center",
      width: 100,
      render: (_, record) => (
        record.representative_image ? (
          <Image 
            src={record.representative_image}
            alt={record.name_vi}
            style={{ 
              width: 40, 
              height: 40, 
              objectFit: 'cover',
              borderRadius: 4
            }}
            preview={{
              cover: <EyeOutlined />,
            }}
          />
        ) : (
          <div 
            style={{ 
              width: 40, 
              height: 40, 
              backgroundColor: '#f0f0f0',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}
          >
            <Text type="secondary">-</Text>
          </div>
        )
      ),
    },
  ];

  // Function to get first letter for avatar
  const getFirstLetter = () => {
    if (serviceGroup?.name_vi) {
      return serviceGroup.name_vi.charAt(0).toUpperCase();
    }
    return <FileTextOutlined />;
  };

  if (loading || !serviceGroup) {
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
          { title: <Link to="/admin/service-groups">Nhóm dịch vụ</Link> },
          { title: serviceGroup?.name_vi || "N/A" },
        ]}
      />

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            {serviceGroup.representative_image ? (
              <Image
                src={serviceGroup.representative_image}
                alt={serviceGroup.name_vi}
                style={{
                  width: 64,
                  height: 64,
                  objectFit: 'cover',
                  borderRadius: '50%',
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
                {serviceGroup.name_vi}
              </Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <Text type="secondary">
                  {serviceGroup.code}
                </Text>
              </div>
              <Space style={{ marginTop: 4 }}>
                <Badge
                  status={serviceGroup.is_active === true ? "success" : "error"}
                  text={serviceGroup.is_active === true ? "Hoạt động" : "Đã xóa"}
                />
              </Space>
            </div>
          </div>
        }
        extra={
          <Space>
            {serviceGroup.is_active === true && (
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
                  <Tooltip title="Xóa Nhóm dịch vụ">
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
            {serviceGroup.is_active === false && (
              <>
                {hasPermission(["ADMIN"]) && (
                  <Tooltip title="Khôi phục Nhóm dịch vụ">
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
                    label="Mã nhóm dịch vụ" 
                    name="code"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mã nhóm dịch vụ",
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

              <Form.Item 
                label="Dịch vụ" 
                name="services"
                className="multi-select-wrap"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn các dịch vụ thuộc nhóm"
                  style={{ width: '100%' }}
                  maxTagCount={undefined}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {servicesForEdit.map((service) => (
                    <Select.Option key={service.id} value={service.id}>
                      {service.name_vi}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

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
              <Descriptions.Item label="Mã nhóm dịch vụ">
                {serviceGroup.code || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tên tiếng Việt">
                {serviceGroup.name_vi || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tên tiếng Anh">
                {serviceGroup.name_en || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tên tiếng Nhật">
                {serviceGroup.name_ja || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tên tiếng Trung">
                {serviceGroup.name_cn || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tên tiếng Tây Ban Nha">
                {serviceGroup.name_sp || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Dịch vụ">
                {(servicesInGroup || []).length > 0 ? (
                  <Space size={[0, 4]} wrap>
                    {(servicesInGroup || []).map((service) => (
                      <Tag key={service.id} color="blue" style={{ marginRight: "4px" }}>
                        {/* {service.code} -  */}
                        {service.name_vi}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  "Chưa có dịch vụ nào"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {serviceGroup.created_at
                  ? dayjs(serviceGroup.created_at).format("DD/MM/YYYY HH:mm:ss")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày chỉnh sửa">
                {serviceGroup.updated_at
                  ? dayjs(serviceGroup.updated_at).format("DD/MM/YYYY HH:mm:ss")
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

export default ServiceGroupDetail;