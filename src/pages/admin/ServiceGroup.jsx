import {
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  UserOutlined,
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
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  searchServiceGroups,
  toggleServiceGroups,
  createServiceGroup,
} from "../../api/service_group";
import { searchServices } from "../../api/service";
import { addServicesToGroup } from "../../api/service_group_mapping";

const { Text } = Typography;

dayjs.extend(customParseFormat);
const dateFormat = "YYYY-MM-DD";

// Component Form thêm mới nhóm dịch vụ
const ServiceGroupFormModal = ({ visible, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);

  // Load services khi modal mở
  useEffect(() => {
    if (visible) {
      const loadServices = async () => {
        setServicesLoading(true);
        try {
          const result = await searchServices({}, 1, 1000);
          setServices(result.data || []);
        } catch (error) {
          console.error("Error loading services:", error);
          message.error("Không thể tải danh sách dịch vụ");
        } finally {
          setServicesLoading(false);
        }
      };

      loadServices();
      
      // Chỉ reset form khi lần đầu mở modal
      const currentValues = form.getFieldsValue();
      const hasValues = Object.values(currentValues).some(value => value !== undefined && value !== null && value !== '');
      
      if (!hasValues) {
        form.resetFields();
        setImagePreview(null);
        setImageBase64(null);
        setSelectedServices([]);
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
      
      // Thêm base64 image và selected services vào values
      const submitValues = {
        ...values,
        representative_image: imageBase64,
        service_ids: selectedServices, // Thêm danh sách service IDs
      };
      
      const success = await onSubmit(submitValues);
      
      // Chỉ reset form khi submit thành công
      if (success) {
        form.resetFields();
        setImagePreview(null);
        setImageBase64(null);
        setSelectedServices([]);
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    // Reset form khi user chủ động cancel
    form.resetFields();
    setImagePreview(null);
    setImageBase64(null);
    setSelectedServices([]);
    onCancel();
  };

  return (
    <Modal
      title="Thêm mới Nhóm dịch vụ"
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
        name={`serviceGroupForm_${Date.now()}`}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="code"
              label="Mã nhóm dịch vụ"
              rules={[
                { required: true, message: "Vui lòng nhập mã nhóm dịch vụ!" },
                { min: 2, max: 50, message: "Mã phải từ 2-50 ký tự!" },
                {
                  pattern: /^[^\s]+$/,
                  message: "Mã không được chứa khoảng trắng!",
                },
              ]}
            >
              <Input
                placeholder="Nhập mã nhóm dịch vụ (VD: ADMIN_SERVICE)"
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
                placeholder="Nhập tên nhóm dịch vụ tiếng Việt"
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
                placeholder="Nhập tên nhóm dịch vụ tiếng Anh (tùy chọn)"
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
                placeholder="Nhập tên nhóm dịch vụ tiếng Nhật (tùy chọn)"
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
                placeholder="Nhập tên nhóm dịch vụ tiếng Trung (tùy chọn)"
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
                placeholder="Nhập tên nhóm dịch vụ tiếng Tây Ban Nha (tùy chọn)"
                maxLength={255}
                autoComplete="off"
                id={`name_sp_${Date.now()}`}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="services"
          label="Dịch vụ thuộc nhóm"
        >
          <Select
            mode="multiple"
            placeholder="Chọn các dịch vụ thuộc nhóm này"
            loading={servicesLoading}
            showSearch
            optionFilterProp="children"
            value={selectedServices}
            onChange={setSelectedServices}
            getPopupContainer={(trigger) => trigger.parentNode}
            filterOption={(input, option) =>
              (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
            }
          >
            {services.map((service) => (
              <Select.Option key={service.id} value={service.id}>
                {service.name_vi}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

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
      </Form>
    </Modal>
  );
};

const ServiceGroup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [serviceGroupData, setServiceGroupData] = useState({
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

  // Function kiểm tra trạng thái service groups đã chọn
  const getSelectedServiceGroupsStatus = () => {
    const selectedServiceGroups = serviceGroupData.data.filter((group) =>
      selectedRowKeys.includes(group.id)
    );

    const activeServiceGroups = selectedServiceGroups.filter(
      (group) => group.is_active
    );
    const inactiveServiceGroups = selectedServiceGroups.filter(
      (group) => !group.is_active
    );

    return {
      hasActive: activeServiceGroups.length > 0,
      hasInactive: inactiveServiceGroups.length > 0,
      activeCount: activeServiceGroups.length,
      inactiveCount: inactiveServiceGroups.length,
      allActive: activeServiceGroups.length === selectedServiceGroups.length,
      allInactive: inactiveServiceGroups.length === selectedServiceGroups.length,
    };
  };

  const handleMultipleToggle = async (action) => {
    const status = getSelectedServiceGroupsStatus();

    let title = "";
    let content = "";
    let okText = "";
    let is_active = false;

    if (action === "deactivate") {
      title = "Xác nhận vô hiệu hóa nhóm dịch vụ";
      content = `Bạn có chắc chắn muốn vô hiệu hóa ${status.activeCount} nhóm dịch vụ đã chọn?`;
      okText = "Vô hiệu hóa";
      is_active = false;
    } else {
      title = "Xác nhận kích hoạt nhóm dịch vụ";
      content = `Bạn có chắc chắn muốn kích hoạt lại ${status.inactiveCount} nhóm dịch vụ đã chọn?`;
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
          await toggleServiceGroups(selectedRowKeys, is_active);

          setSelectedRowKeys([]);

          // Refresh data
          const refreshedData = await searchServiceGroups(
            {},
            currentPage,
            pageSize
          );

          setServiceGroupData(refreshedData);
        } catch (error) {
          console.error("Error toggling service groups:", error);
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

  // Hàm xử lý thêm mới nhóm dịch vụ
  const handleCreateServiceGroup = async (values) => {
    setCreateLoading(true);
    try {
      // Tách service_ids ra khỏi values để tạo group trước
      const { service_ids, ...groupData } = values;
      
      // Tạo service group
      const result = await createServiceGroup(groupData);
      
      // Nếu có services được chọn, thêm vào group
      if (service_ids && service_ids.length > 0 && result.data) {
        await addServicesToGroup(result.data.id, service_ids);
      }

      setIsModalVisible(false);

      // Refresh danh sách
      const refreshedData = await searchServiceGroups(
        {},
        currentPage,
        pageSize
      );
      setServiceGroupData(refreshedData);
      
      return true; // Trả về true khi thành công
    } catch (error) {
      console.error("Error creating service group:", error);
      
      // Hiển thị message lỗi chi tiết hơn
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      }
      
      return false; // Trả về false khi thất bại
    } finally {
      setCreateLoading(false);
    }
  };

  // Fetch service groups
  useEffect(() => {
    const getServiceGroups = async () => {
      setLoading(true);
      try {
        const data = await searchServiceGroups({}, currentPage, pageSize);

        if (data) {
          setServiceGroupData(data);
        }
      } catch (error) {
        console.error("Error fetching service groups:", error);
        message.error("Không thể tải danh sách nhóm dịch vụ");
      } finally {
        setLoading(false);
      }
    };

    getServiceGroups();
  }, [currentPage]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD-MM-YYYY");
  };

  // Chuyển hướng đến trang chi tiết
  const navigateToServiceGroupDetail = (id) => {
    navigate(`/admin/service-groups/${id}`);
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
      title: "Mã",
      key: "code",
      align: "center",
      render: (_, record) => <Text>{record.code || "N/A"}</Text>,
    },
    {
      title: "Tên nhóm",
      key: "name",
      align: "left",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 0 }}>
            1.vn: {record.name_vi || "N/A"}
          </div>
          <div style={{ fontWeight: 0 }}>
            2.en: {record.name_en || "N/A"}
          </div>
          <div style={{ fontWeight: 0 }}>
            3.jp: {record.name_ja || "N/A"}
          </div>
        </div>
      ),
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
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
      render: (created_at) => formatDate(created_at),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      align: "center",
      // width: 120,
      render: (is_active) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "Kích hoạt" : "Vô hiệu hóa"}
        </Tag>
      )
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
            onClick={() => navigateToServiceGroupDetail(record.id)}
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
          { title: <Link to="/admin/service-groups">Nhóm dịch vụ</Link> },
          { title: "Danh sách nhóm dịch vụ" },
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
              const status = getSelectedServiceGroupsStatus();

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
        dataSource={serviceGroupData.data || []}
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
          total={serviceGroupData.totalElements || 0}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      {/* Modal thêm mới */}
      <ServiceGroupFormModal
        visible={isModalVisible}
        onCancel={handleCancelModal}
        onSubmit={handleCreateServiceGroup}
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

export default ServiceGroup;