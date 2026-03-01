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
  InputNumber,
  message,
  Modal,
  Pagination,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  searchTicketFormats,
  toggleTicketFormats,
  createTicketFormat,
} from "../../api/ticket_format";

const { Text } = Typography;

dayjs.extend(customParseFormat);
const dateFormat = "YYYY-MM-DD";

// Component Form thêm mới định dạng vé
const TicketFormatFormModal = ({ visible, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      // Chỉ reset form khi lần đầu mở modal (không có giá trị nào)
      const currentValues = form.getFieldsValue();
      const hasValues = Object.values(currentValues).some(value => value !== undefined && value !== null && value !== '');
      
      if (!hasValues) {
        form.resetFields();
      }
    }
  }, [visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const success = await onSubmit(values);
      
      // Chỉ reset form khi submit thành công
      if (success) {
        form.resetFields();
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
    onCancel();
  };

  return (
    <Modal
      title="Thêm mới Định dạng vé"
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Thêm"
      cancelText="Hủy"
      width={600}
      destroyOnHidden={false}
    >
      <Form 
        form={form} 
        layout="vertical" 
        name={`ticketFormatForm_${Date.now()}`}
        autoComplete="off"
      >
        <Form.Item
          name="code"
          label="Mã định dạng vé"
          rules={[
            { required: true, message: "Vui lòng nhập mã định dạng vé!" },
            { min: 2, max: 50, message: "Mã phải từ 2-50 ký tự!" },
            {
              pattern: /^[^\s]+$/,
              message: "Mã không được chứa khoảng trắng!",
            },
          ]}
        >
          <Input
            placeholder="Nhập mã định dạng vé (VD: FMT001)"
            maxLength={50}
            autoComplete="off"
            id={`code_${Date.now()}`}
          />
        </Form.Item>

        <Form.Item
          name="format_pattern"
          label="Định dạng mẫu"
          rules={[
            { required: true, message: "Vui lòng nhập định dạng mẫu!" },
            { min: 2, max: 100, message: "Định dạng mẫu phải từ 2-100 ký tự!" },
          ]}
        >
          <Input
            placeholder="Nhập định dạng mẫu (VD: TK-{YYYY}-{MM}-{NNNN})"
            maxLength={100}
            autoComplete="off"
            id={`format_pattern_${Date.now()}`}
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="start_number"
            label="Số bắt đầu"
            rules={[
              { required: true, message: "Vui lòng nhập số bắt đầu!" },
              { type: 'number', min: 1, message: "Số bắt đầu phải lớn hơn hoặc bằng 1!" }
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber
              placeholder="Nhập số bắt đầu"
              style={{ width: '100%' }}
              min={1}
            />
          </Form.Item>

          <Form.Item
            name="max_number"
            label="Số lớn nhất"
            rules={[
              { required: true, message: "Vui lòng nhập số lớn nhất!" },
              { type: 'number', min: 1, message: "Số lớn nhất phải lớn hơn hoặc bằng 1!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('start_number') <= value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Số lớn nhất phải lớn hơn hoặc bằng số bắt đầu!'));
                },
              }),
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber
              placeholder="Nhập số lớn nhất"
              style={{ width: '100%' }}
              min={1}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

const TicketFormat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [ticketFormatData, setTicketFormatData] = useState({
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
  const pageSize = 10;

  const [isModalVisible, setIsModalVisible] = useState(false);

  // Function kiểm tra trạng thái ticket formats đã chọn
  const getSelectedTicketFormatsStatus = () => {
    const selectedTicketFormats = ticketFormatData.data.filter((format) =>
      selectedRowKeys.includes(format.id)
    );

    const activeFormats = selectedTicketFormats.filter(
      (format) => format.is_active
    );
    const inactiveFormats = selectedTicketFormats.filter(
      (format) => !format.is_active
    );

    return {
      hasActive: activeFormats.length > 0,
      hasInactive: inactiveFormats.length > 0,
      activeCount: activeFormats.length,
      inactiveCount: inactiveFormats.length,
      allActive: activeFormats.length === selectedTicketFormats.length,
      allInactive: inactiveFormats.length === selectedTicketFormats.length,
    };
  };

  const handleMultipleToggle = async (action) => {
    const status = getSelectedTicketFormatsStatus();

    let title = "";
    let content = "";
    let okText = "";
    let is_active = false;

    if (action === "deactivate") {
      title = "Xác nhận vô hiệu hóa định dạng vé";
      content = `Bạn có chắc chắn muốn vô hiệu hóa ${status.activeCount} định dạng vé đã chọn?`;
      okText = "Vô hiệu hóa";
      is_active = false;
    } else {
      title = "Xác nhận kích hoạt định dạng vé";
      content = `Bạn có chắc chắn muốn kích hoạt lại ${status.inactiveCount} định dạng vé đã chọn?`;
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
          await toggleTicketFormats(selectedRowKeys, is_active);

          setSelectedRowKeys([]);

          // Refresh data
          const refreshedData = await searchTicketFormats(
            {},
            currentPage,
            pageSize
          );

        //   if (action === "deactivate") {
        //     message.success(
        //       `Đã vô hiệu hóa ${status.activeCount} định dạng vé thành công`
        //     );
        //   } else {
        //     message.success(
        //       `Đã kích hoạt ${status.inactiveCount} định dạng vé thành công`
        //     );
        //   }
          setTicketFormatData(refreshedData);
        } catch (error) {
          console.error("Error toggling ticket formats:", error);
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

  // Hàm xử lý thêm mới định dạng vé
  const handleCreateTicketFormat = async (values) => {
    setCreateLoading(true);
    try {
      await createTicketFormat(values);

      setIsModalVisible(false);

      // Refresh danh sách
      const refreshedData = await searchTicketFormats(
        {},
        currentPage,
        pageSize
      );
      setTicketFormatData(refreshedData);
      
      return true; // Trả về true khi thành công
    } catch (error) {
      console.error("Error creating ticket format:", error);
      
      // Hiển thị message lỗi chi tiết hơn
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      }
      
      return false; // Trả về false khi thất bại
    } finally {
      setCreateLoading(false);
    }
  };

  // Fetch ticket formats
  useEffect(() => {
    const getTicketFormats = async () => {
      setLoading(true);
      try {
        const data = await searchTicketFormats({}, currentPage, pageSize);

        if (data) {
          setTicketFormatData(data);
        }
      } catch (error) {
        console.error("Error fetching ticket formats:", error);
        message.error("Không thể tải danh sách định dạng vé");
      } finally {
        setLoading(false);
      }
    };

    getTicketFormats();
  }, [currentPage]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD-MM-YYYY");
  };

  // Chuyển hướng đến trang chi tiết
  const navigateToTicketFormatDetail = (id) => {
    navigate(`/admin/ticket-formats/${id}`);
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
      render: (_, record) => <Text strong>{record.code || "N/A"}</Text>,
    },
    {
      title: "Định dạng mẫu",
      key: "format_pattern",
      align: "center",
      render: (_, record) => <Text>{record.format_pattern || "N/A"}</Text>,
    },
    {
      title: "Số bắt đầu",
      key: "start_number",
      align: "center",
      render: (_, record) => <Text>{record.start_number || "N/A"}</Text>,
    },
    {
      title: "Số lớn nhất",
      key: "max_number",
      align: "center",
      render: (_, record) => <Text>{record.max_number || "N/A"}</Text>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
      render: (created_at) => formatDate(created_at),
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
            onClick={() => navigateToTicketFormatDetail(record.id)}
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
          { title: "Quản lý Định dạng vé" },
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
              const status = getSelectedTicketFormatsStatus();

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
        dataSource={ticketFormatData.data || []}
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
          total={ticketFormatData.totalElements || 0}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      {/* Modal thêm mới */}
      <TicketFormatFormModal
        visible={isModalVisible}
        onCancel={handleCancelModal}
        onSubmit={handleCreateTicketFormat}
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

export default TicketFormat;