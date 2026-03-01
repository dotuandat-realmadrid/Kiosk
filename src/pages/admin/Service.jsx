import {
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  UserOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Form,
  Input,
  message,
  Modal,
  Pagination,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  Upload,
  Image,
  Row,
  Col,
} from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  searchServices,
  toggleServices,
  createService,
} from "../../api/service";
import { searchTicketFormats } from "../../api/ticket_format";

const { Text } = Typography;
const { TextArea } = Input;

dayjs.extend(customParseFormat);
const dateFormat = "YYYY-MM-DD";

// Component Form thêm mới dịch vụ
const ServiceFormModal = ({ visible, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [ticketFormats, setTicketFormats] = useState([]);
  const [formatsLoading, setFormatsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);

  // Load ticket formats khi modal mở
  useEffect(() => {
    if (visible) {
      const loadTicketFormats = async () => {
        setFormatsLoading(true);
        try {
          const result = await searchTicketFormats({}, 1, 1000);
          setTicketFormats(result.data || []);
        } catch (error) {
          console.error("Error loading ticket formats:", error);
          message.error("Không thể tải danh sách định dạng vé");
        } finally {
          setFormatsLoading(false);
        }
      };

      loadTicketFormats();
      
      // Chỉ reset form khi lần đầu mở modal (không có giá trị nào)
      const currentValues = form.getFieldsValue();
      const hasValues = Object.values(currentValues).some(value => value !== undefined && value !== null && value !== '');
      
      if (!hasValues) {
        form.resetFields();
        setImagePreview(null);
        setImageBase64(null);
      }
    }
  }, [visible]);

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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Thêm base64 image vào values
      const submitValues = {
        ...values,
        representative_image: imageBase64,
      };
      
      const success = await onSubmit(submitValues);
      
      // Chỉ reset form khi submit thành công
      if (success) {
        form.resetFields();
        setImagePreview(null);
        setImageBase64(null);
      }
      // Nếu thất bại, giữ nguyên form để user sửa lại
    } catch (error) {
      console.error("Validation failed:", error);
      // Không làm gì cả, giữ nguyên form
    }
  };

  const handleCancel = () => {
    // Reset form khi user chủ động cancel
    form.resetFields();
    setImagePreview(null);
    setImageBase64(null);
    onCancel();
  };

  return (
    <Modal
      title="Thêm mới Dịch vụ"
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Thêm"
      cancelText="Hủy"
      width={900}
      destroyOnHidden={false}
    >
      <Form 
        form={form} 
        layout="vertical" 
        name={`serviceForm_${Date.now()}`}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="format_id"
              label="Định dạng vé"
              rules={[{ required: true, message: "Vui lòng chọn định dạng vé!" }]}
            >
              <Select
                placeholder="Chọn định dạng vé"
                loading={formatsLoading}
                showSearch
                optionFilterProp="children"
                getPopupContainer={(trigger) => trigger.parentNode}
                filterOption={(input, option) =>
                  (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                }
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
              name="code"
              label="Mã dịch vụ"
              rules={[
                { required: true, message: "Vui lòng nhập mã dịch vụ!" },
                { min: 2, max: 50, message: "Mã phải từ 2-50 ký tự!" },
                {
                  pattern: /^[^\s]+$/,
                  message: "Mã không được chứa khoảng trắng!",
                },
              ]}
            >
              <Input
                placeholder="Nhập mã dịch vụ (VD: SVC001)"
                maxLength={50}
                autoComplete="off"
                id={`code_${Date.now()}`}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="name_vi"
              label="Tên tiếng Việt"
              rules={[
                { required: true, message: "Vui lòng nhập tên tiếng Việt!" },
                { min: 2, max: 255, message: "Tên phải từ 2-255 ký tự!" },
              ]}
            >
              <Input
                placeholder="Nhập tên dịch vụ tiếng Việt"
                maxLength={255}
                autoComplete="off"
                id={`name_vi_${Date.now()}`}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name_en"
              label="Tên tiếng Anh"
            >
              <Input
                placeholder="Nhập tên dịch vụ tiếng Anh (tùy chọn)"
                maxLength={255}
                autoComplete="off"
                id={`name_en_${Date.now()}`}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="name_ja"
              label="Tên tiếng Nhật"
            >
              <Input
                placeholder="Nhập tên dịch vụ tiếng Nhật (tùy chọn)"
                maxLength={255}
                autoComplete="off"
                id={`name_ja_${Date.now()}`}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name_cn"
              label="Tên tiếng Trung"
            >
              <Input
                placeholder="Nhập tên dịch vụ tiếng Trung (tùy chọn)"
                maxLength={255}
                autoComplete="off"
                id={`name_cn_${Date.now()}`}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="name_sp"
              label="Tên tiếng Tây Ban Nha"
            >
              <Input
                placeholder="Nhập tên dịch vụ tiếng Tây Ban Nha (tùy chọn)"
                maxLength={255}
                autoComplete="off"
                id={`name_sp_${Date.now()}`}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="representative_image"
              label="Ảnh đại diện"
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
                    (Tối đa 5MB, JPG, PNG, GIF)
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
      </Form>
    </Modal>
  );
};

const Service = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [serviceData, setServiceData] = useState({
    data: [],
    totalElements: 0,
    totalPage: 0,
    currentPage: 1,
    pageSize: 20,
  });

  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(
    parseInt(queryParams.get("page"), 10) || 1
  );
  const pageSize = 20;

  const [isModalVisible, setIsModalVisible] = useState(false);

  // Function kiểm tra trạng thái services đã chọn
  const getSelectedServicesStatus = () => {
    const selectedServices = serviceData.data.filter((service) =>
      selectedRowKeys.includes(service.id)
    );

    const activeServices = selectedServices.filter(
      (service) => service.is_active
    );
    const inactiveServices = selectedServices.filter(
      (service) => !service.is_active
    );

    return {
      hasActive: activeServices.length > 0,
      hasInactive: inactiveServices.length > 0,
      activeCount: activeServices.length,
      inactiveCount: inactiveServices.length,
      allActive: activeServices.length === selectedServices.length,
      allInactive: inactiveServices.length === selectedServices.length,
    };
  };

  const handleMultipleToggle = async (action) => {
    const status = getSelectedServicesStatus();

    let title = "";
    let content = "";
    let okText = "";
    let is_active = false;

    if (action === "deactivate") {
      title = "Xác nhận vô hiệu hóa dịch vụ";
      content = `Bạn có chắc chắn muốn vô hiệu hóa ${status.activeCount} dịch vụ đã chọn?`;
      okText = "Vô hiệu hóa";
      is_active = false;
    } else {
      title = "Xác nhận kích hoạt dịch vụ";
      content = `Bạn có chắc chắn muốn kích hoạt lại ${status.inactiveCount} dịch vụ đã chọn?`;
      okText = "Kích hoạt";
      is_active = true;
    }

    Modal.confirm({
      title,
      icon: <ExclamationCircleOutlined />,
      content,
      okText,
      okType: action === "deactivate" ? "danger" : "primary",
      cancelText: "Hủy",
      onOk: async () => {
        setToggleLoading(true);
        try {
          await toggleServices(selectedRowKeys, is_active);

          setSelectedRowKeys([]);

          // Refresh data
          const refreshedData = await searchServices(
            {},
            currentPage,
            pageSize
          );

        //   if (action === "deactivate") {
        //     message.success(
        //       `Đã vô hiệu hóa ${status.activeCount} dịch vụ thành công`
        //     );
        //   } else {
        //     message.success(
        //       `Đã kích hoạt ${status.inactiveCount} dịch vụ thành công`
        //     );
        //   }
          setServiceData(refreshedData);
        } catch (error) {
          console.error("Error toggling services:", error);
        } finally {
          setToggleLoading(false);
        }
      },
    });
  };

  // Hàm mở modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Hàm đóng modal
  const handleCancelModal = () => {
    setIsModalVisible(false);
  };

  // Hàm xử lý thêm mới dịch vụ
  const handleCreateService = async (values) => {
    setCreateLoading(true);
    try {
      await createService(values);

      setIsModalVisible(false);

      // Refresh danh sách
      const refreshedData = await searchServices(
        {},
        currentPage,
        pageSize
      );
      setServiceData(refreshedData);
    //   message.success("Thêm mới dịch vụ thành công!");
      
      return true; // Trả về true khi thành công
    } catch (error) {
      console.error("Error creating service:", error);
      
      // Hiển thị message lỗi chi tiết hơn
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      }
      
      return false; // Trả về false khi thất bại
    } finally {
      setCreateLoading(false);
    }
  };

  // Fetch services
  useEffect(() => {
    const getServices = async () => {
      setLoading(true);
      try {
        const data = await searchServices({}, currentPage, pageSize);

        if (data) {
          setServiceData(data);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        message.error("Không thể tải danh sách dịch vụ");
      } finally {
        setLoading(false);
      }
    };

    getServices();
  }, [currentPage]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD-MM-YYYY");
  };

  // Chuyển hướng đến trang chi tiết
  const navigateToServiceDetail = (id) => {
    navigate(`/admin/services/${id}`);
  };

  // Columns definition
  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => {
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Tên dịch vụ",
      key: "name",
      align: "left",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            1.vn: {record.name_vi || "N/A"}
          </div>
          <div style={{ color: "#8c8c8c", fontSize: "13px" }}>
            2.en: {record.name_en || "-"}
          </div>
        </div>
      ),
      width: 320,
    },
    {
      title: "Mã dịch vụ",
      key: "code",
      align: "center",
      render: (_, record) => <Text>{record.code || "N/A"}</Text>,
      width: 200,
    },
    {
      title: "Mã định dạng vé",
      key: "format_code",
      align: "center",
      render: (_, record) => (
        <Text>{record.ticket_format?.code || "N/A"}</Text>
      ),
      width: 150,
    },
    {
      title: "Định dạng vé",
      key: "format_pattern",
      align: "center",
      render: (_, record) => (
        <Text>{record.ticket_format?.format_pattern || "N/A"}</Text>
      ),
      width: 150,
    },
    {
      title: "Ảnh đại diện",
      key: "representative_image",
      align: "center",
      render: (_, record) => (
        record.representative_image ? (
          <Image 
            src={record.representative_image}
            alt={record.name_vi}
            style={{ 
              width: 50, 
              height: 50, 
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
              width: 50, 
              height: 50, 
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
      width: 100,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
      render: (created_at) => formatDate(created_at),
      width: 120,
    },
    {
      title: "",
      key: "actions",
      width: 10,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigateToServiceDetail(record.id)}
            aria-label="Xem chi tiết"
          />
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
          { title: <Link to="/admin/services-manager">Quản lý dịch vụ</Link> },
          { title: <Link to="/admin/services">Dịch vụ</Link> },
          { title: "Danh sách dịch vu" },
        ]}
      />

      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal} />

          {selectedRowKeys.length > 0 &&
            (() => {
              const status = getSelectedServicesStatus();

              return (
                <Space>
                  {status.hasActive && (
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleMultipleToggle("deactivate")}
                      loading={toggleLoading}
                    >
                      Vô hiệu hóa ({status.activeCount})
                    </Button>
                  )}

                  {status.hasInactive && (
                    <Button
                      type="primary"
                      icon={<UserOutlined />}
                      onClick={() => handleMultipleToggle("activate")}
                      loading={toggleLoading}
                    >
                      Kích hoạt ({status.inactiveCount})
                    </Button>
                  )}
                </Space>
              );
            })()}
        </div>
      </div>

      <Table
        dataSource={serviceData.data || []}
        columns={columns}
        rowKey="id"
        pagination={false}
        loading={loading}
        bordered
        className="custom-header-table"
        rowClassName={(record) => (!record.is_active ? "inactive-row" : "")}
        style={{ marginBottom: 16 }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
      />

      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={serviceData.totalElements || 0}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      {/* Modal thêm mới */}
      <ServiceFormModal
        visible={isModalVisible}
        onCancel={handleCancelModal}
        onSubmit={handleCreateService}
        loading={createLoading}
      />

      <style>
        {`
          .inactive-row {
            background-color: #fff1f0;
          }
          .custom-header-table .ant-table-thead > tr > th {
            background-color: #1890ff !important;
            color: #fff !important;
          }
        `}
      </style>
    </>
  );
};

export default Service;