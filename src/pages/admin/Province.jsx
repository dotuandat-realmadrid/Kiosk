import {
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SearchOutlined,
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
} from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { searchProvinces, toggleProvinces, createProvince } from "../../api/province";

const { Text } = Typography;

dayjs.extend(customParseFormat);
const dateFormat = "YYYY-MM-DD";
const customFormat = (value) => (value ? `${value.format(dateFormat)}` : null);

// Component Form thêm mới tỉnh/thành phố
const ProvinceFormModal = ({ visible, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();

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
      title="Thêm mới Tỉnh/Thành phố"
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
        name={`provinceForm_${Date.now()}`}
        autoComplete="off"
      >
        <Form.Item
          name="code"
          label="Mã Tỉnh/Thành phố"
          rules={[
            { required: true, message: "Vui lòng nhập mã tỉnh/thành phố!" },
            { min: 2, max: 50, message: "Mã phải từ 2-50 ký tự!" },
            { pattern: /^[^\s]+$/, message: "Mã không được chứa khoảng trắng!" },
          ]}
        >
          <Input 
            placeholder="Nhập mã tỉnh/thành phố (VD: HN, HCM)" 
            maxLength={50}
            autoComplete="off"
            id={`code_${Date.now()}`}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên Tỉnh/Thành phố"
          rules={[
            { required: true, message: "Vui lòng nhập tên tỉnh/thành phố!" },
            { min: 2, max: 100, message: "Tên phải từ 2-100 ký tự!" },
          ]}
        >
          <Input 
            placeholder="Nhập tên tỉnh/thành phố (VD: Hà Nội, TP. Hồ Chí Minh)" 
            maxLength={100}
            autoComplete="off"
            id={`name_${Date.now()}`}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const Province = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [provinceData, setProvinceData] = useState({
    data: [],
    totalElements: 0,
    totalPage: 0,
    currentPage: 1,
    pageSize: 20,
  });

  // Filter states
  const [id, setId] = useState(queryParams.get("id"));
  const [code, setCode] = useState(queryParams.get("code"));
  const [name, setName] = useState(queryParams.get("name"));
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(
    parseInt(queryParams.get("page"), 10) || 1,
  );
  const pageSize = 20;

  const [filterForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [provincesList, setProvincesList] = useState([]);

  // Load provinces for select
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const result = await searchProvinces({}, 1, 1000);
        setProvincesList(result.data || []);
      } catch (error) {
        console.error('Error loading provinces for select:', error);
      }
    };

    loadProvinces();
  }, []);

  // Function kiểm tra trạng thái provinces đã chọn
  const getSelectedProvincesStatus = () => {
    const selectedProvinces = provinceData.data.filter((province) =>
      selectedRowKeys.includes(province.id)
    );

    const activeProvinces = selectedProvinces.filter(
      (province) => province.is_active
    );
    const inactiveProvinces = selectedProvinces.filter(
      (province) => !province.is_active
    );

    return {
      hasActive: activeProvinces.length > 0,
      hasInactive: inactiveProvinces.length > 0,
      activeCount: activeProvinces.length,
      inactiveCount: inactiveProvinces.length,
      allActive: activeProvinces.length === selectedProvinces.length,
      allInactive: inactiveProvinces.length === selectedProvinces.length,
    };
  };

  const handleMultipleToggle = async (action) => {
    const status = getSelectedProvincesStatus();

    let title = "";
    let content = "";
    let okText = "";
    let is_active = false;

    if (action === "deactivate") {
      title = "Xác nhận vô hiệu hóa tỉnh/thành phố";
      content = `Bạn có chắc chắn muốn vô hiệu hóa ${status.activeCount} tỉnh/thành phố đã chọn?`;
      okText = "Vô hiệu hóa";
      is_active = false;
    } else {
      title = "Xác nhận kích hoạt tỉnh/thành phố";
      content = `Bạn có chắc chắn muốn kích hoạt lại ${status.inactiveCount} tỉnh/thành phố đã chọn?`;
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
          await toggleProvinces(selectedRowKeys, is_active);

          setSelectedRowKeys([]);
          // Refresh data
          const request = {
            id,
            code,
            name,
          };
          const refreshedData = await searchProvinces(
            request,
            currentPage,
            pageSize
          );

          if (action === "deactivate") {
            message.success(
              `Đã vô hiệu hóa ${status.activeCount} tỉnh/thành phố thành công`
            );
          } else {
            message.success(
              `Đã kích hoạt ${status.inactiveCount} tỉnh/thành phố thành công`
            );
          }
          setProvinceData(refreshedData);
        } catch (error) {
          console.error("Error toggling provinces:", error);
          // message.error("Có lỗi xảy ra khi thay đổi trạng thái");
        } finally {
          setToggleLoading(false);
        }
      },
    });
  };

  // Hàm cập nhật URL
  const updateURL = (newParams) => {
    const params = new URLSearchParams();

    Object.entries(newParams).forEach(([key, value]) => {
      if (value && key !== "page") {
        params.set(key, value);
      }
    });

    navigate(`?${params.toString()}`, { replace: true });
  };

  // Hàm mở modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Hàm đóng modal
  const handleCancelModal = () => {
    setIsModalVisible(false);
  };

  // Hàm xử lý thêm mới tỉnh/thành phố
  const handleCreateProvince = async (values) => {
    setCreateLoading(true);
    try {
      await createProvince(values);
      
      // message.success("Thêm mới Tỉnh/Thành phố thành công!");
      setIsModalVisible(false);
      
      // Refresh danh sách
      const request = {
        id,
        code,
        name,
      };
      const refreshedData = await searchProvinces(request, currentPage, pageSize);
      setProvinceData(refreshedData);
      
      return true; // Trả về true khi thành công
    } catch (error) {
      console.error("Error creating province:", error);
      
      // Hiển thị message lỗi chi tiết hơn
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        // message.error("Có lỗi xảy ra khi thêm tỉnh/thành phố. Vui lòng thử lại!");
      }
      
      return false; // Trả về false khi thất bại
    } finally {
      setCreateLoading(false);
    }
  };

  // Submit form filter
  const handleFilterSubmit = (values) => {
    const newParams = {
      id: values.id,
      code: values.code,
      name: values.name,
      page: 1,
    };

    setCurrentPage(1);
    setId(newParams.id);
    setCode(newParams.code);
    setName(newParams.name);

    updateURL(newParams);
  };

  // Fetch provinces
  useEffect(() => {
    const getProvinces = async () => {
      setLoading(true);
      try {
        const request = {
          id: id,
          code: code,
          name: name,
        };

        const data = await searchProvinces(request, currentPage, pageSize);

        if (data) {
          setProvinceData(data);
        }
      } catch (error) {
        console.error("Error fetching provinces:", error);
        message.error("Không thể tải danh sách Tỉnh/Thành phố");
      } finally {
        setLoading(false);
      }
    };

    getProvinces();
  }, [id, code, name, currentPage]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD-MM-YYYY");
  };

  // Chuyển hướng đến trang chi tiết
  const navigateToProvinceDetail = (id) => {
    navigate(`/admin/provinces/${id}`);
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
      title: "Mã Tỉnh/Thành phố",
      key: "code",
      align: "center",
      render: (_, record) => <Text>{record.code || "N/A"}</Text>,
      width: 180,
    },
    {
      title: "Tỉnh/Thành phố",
      key: "name",
      align: "center",
      render: (_, record) => <Text>{record.name || "N/A"}</Text>,
      width: 320,
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
            onClick={() => navigateToProvinceDetail(record.id)}
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
          { title: <Link to="/admin/branches-manager">Quản lý PGD</Link> },
          { title: <Link to="/admin/provinces">Tỉnh/Thành phố</Link> },
          { title: "Danh sách Tỉnh/Thành phố" },
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
          ></Button>

          {selectedRowKeys.length > 0 &&
            (() => {
              const status = getSelectedProvincesStatus();

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
        <div>
          <Form
            form={filterForm}
            layout="vertical"
            onFinish={handleFilterSubmit}
            initialValues={{
              id,
              code,
              name,
            }}
            style={{ display: "flex" }}
          >
            <Form.Item name="code" style={{ marginRight: 8, width: "180px" }}>
              <Select 
                placeholder="Tỉnh/Thành phố" 
                allowClear
              >
                {provincesList.map((province) => (
                  <Select.Option key={province.code} value={province.code}>
                    {province.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
            ></Button>
          </Form>
        </div>
      </div>

      <Table
        dataSource={provinceData.data || []}
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
          total={provinceData.totalElements || 0}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      {/* Modal thêm mới */}
      <ProvinceFormModal
        visible={isModalVisible}
        onCancel={handleCancelModal}
        onSubmit={handleCreateProvince}
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

export default Province;