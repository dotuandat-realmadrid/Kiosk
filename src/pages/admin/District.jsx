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
  Tag,
  Tooltip,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  searchDistricts,
  toggleDistricts,
  createDistrict,
} from "../../api/district";
import { searchProvinces } from "../../api/province";

const { Text } = Typography;

dayjs.extend(customParseFormat);
const dateFormat = "YYYY-MM-DD";

// Component Form thêm mới quận/huyện
const DistrictFormModal = ({ visible, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState([]);
  const [provincesLoading, setProvincesLoading] = useState(false);

  // Load provinces khi modal mở
  useEffect(() => {
    if (visible) {
      const loadProvinces = async () => {
        setProvincesLoading(true);
        try {
          const result = await searchProvinces({}, 1, 1000);
          setProvinces(result.data || []);
        } catch (error) {
          console.error("Error loading provinces:", error);
          message.error("Không thể tải danh sách tỉnh/thành phố");
        } finally {
          setProvincesLoading(false);
        }
      };

      loadProvinces();
      
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
      title="Thêm mới Quận/Huyện"
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
        name={`districtForm_${Date.now()}`}
        autoComplete="off"
      >
        <Form.Item
          name="province_id"
          label="Tỉnh/Thành phố"
          rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố!" }]}
        >
          <Select
            placeholder="Chọn tỉnh/thành phố"
            loading={provincesLoading}
            showSearch
            optionFilterProp="children"
            getPopupContainer={(trigger) => trigger.parentNode}
            filterOption={(input, option) =>
              (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
            }
          >
            {provinces.map((province) => (
              <Select.Option key={province.id} value={province.id}>
                {province.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="code"
          label="Mã Quận/Huyện"
          rules={[
            { required: true, message: "Vui lòng nhập mã quận/huyện!" },
            { min: 2, max: 50, message: "Mã phải từ 2-50 ký tự!" },
            {
              pattern: /^[^\s]+$/,
              message: "Mã không được chứa khoảng trắng!",
            },
          ]}
        >
          <Input
            placeholder="Nhập mã quận/huyện (VD: Q1, HBT)"
            maxLength={50}
            autoComplete="off"
            id={`code_${Date.now()}`}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên Quận/Huyện"
          rules={[
            { required: true, message: "Vui lòng nhập tên quận/huyện!" },
            { min: 2, max: 100, message: "Tên phải từ 2-100 ký tự!" },
          ]}
        >
          <Input
            placeholder="Nhập tên quận/huyện (VD: Quận 1, Hoàn Kiếm)"
            maxLength={100}
            autoComplete="off"
            id={`name_${Date.now()}`}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const District = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [districtData, setDistrictData] = useState({
    data: [],
    totalElements: 0,
    totalPage: 0,
    currentPage: 1,
    pageSize: 20,
  });

  // Filter states
  const [id, setId] = useState(queryParams.get("id"));
  const [provinceId, setProvinceId] = useState(queryParams.get("province_id"));
  const [code, setCode] = useState(queryParams.get("code"));
  const [name, setName] = useState(queryParams.get("name"));
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(
    parseInt(queryParams.get("page"), 10) || 1
  );
  const pageSize = 20;

  const [filterForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Danh sách tỉnh để dùng trong filter Select
  const [provinces, setProvinces] = useState([]);

  // Load provinces cho filter Select
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const result = await searchProvinces({}, 1, 1000);
        setProvinces(result.data || []);
      } catch (error) {
        console.error("Error loading provinces for filter:", error);
      }
    };

    loadProvinces();
  }, []);

  // Function kiểm tra trạng thái districts đã chọn
  const getSelectedDistrictsStatus = () => {
    const selectedDistricts = districtData.data.filter((district) =>
      selectedRowKeys.includes(district.id)
    );

    const activeDistricts = selectedDistricts.filter(
      (district) => district.is_active
    );
    const inactiveDistricts = selectedDistricts.filter(
      (district) => !district.is_active
    );

    return {
      hasActive: activeDistricts.length > 0,
      hasInactive: inactiveDistricts.length > 0,
      activeCount: activeDistricts.length,
      inactiveCount: inactiveDistricts.length,
      allActive: activeDistricts.length === selectedDistricts.length,
      allInactive: inactiveDistricts.length === selectedDistricts.length,
    };
  };

  const handleMultipleToggle = async (action) => {
    const status = getSelectedDistrictsStatus();

    let title = "";
    let content = "";
    let okText = "";
    let is_active = false;

    if (action === "deactivate") {
      title = "Xác nhận vô hiệu hóa quận/huyện";
      content = `Bạn có chắc chắn muốn vô hiệu hóa ${status.activeCount} quận/huyện đã chọn?`;
      okText = "Vô hiệu hóa";
      is_active = false;
    } else {
      title = "Xác nhận kích hoạt quận/huyện";
      content = `Bạn có chắc chắn muốn kích hoạt lại ${status.inactiveCount} quận/huyện đã chọn?`;
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
          await toggleDistricts(selectedRowKeys, is_active);

          setSelectedRowKeys([]);

          // Refresh data
          const request = {
            id,
            province_id: provinceId,
            code,
            name,
          };
          const refreshedData = await searchDistricts(
            request,
            currentPage,
            pageSize
          );

          if (action === "deactivate") {
            message.success(
              `Đã vô hiệu hóa ${status.activeCount} quận/huyện thành công`
            );
          } else {
            message.success(
              `Đã kích hoạt ${status.inactiveCount} quận/huyện thành công`
            );
          }
          setDistrictData(refreshedData);
        } catch (error) {
          console.error("Error toggling districts:", error);
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

  // Hàm xử lý thêm mới quận/huyện
  const handleCreateDistrict = async (values) => {
    setCreateLoading(true);
    try {
      await createDistrict(values);

      // message.success("Thêm mới Quận/Huyện thành công!");
      setIsModalVisible(false);

      // Refresh danh sách
      const request = {
        id,
        province_id: provinceId,
        code,
        name,
      };
      const refreshedData = await searchDistricts(
        request,
        currentPage,
        pageSize
      );
      setDistrictData(refreshedData);
      
      return true; // Trả về true khi thành công
    } catch (error) {
      console.error("Error creating district:", error);
      
      // Hiển thị message lỗi chi tiết hơn
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        // message.error("Có lỗi xảy ra khi thêm quận/huyện. Vui lòng thử lại!");
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
      province_id: values.province_id,
      code: values.code,
      name: values.name,
      page: 1,
    };

    setCurrentPage(1);
    setId(newParams.id);
    setProvinceId(newParams.province_id);
    setCode(newParams.code);
    setName(newParams.name);

    updateURL(newParams);
  };

  // Fetch districts
  useEffect(() => {
    const getDistricts = async () => {
      setLoading(true);
      try {
        const request = {
          id: id,
          province_id: provinceId,
          code: code,
          name: name,
        };

        const data = await searchDistricts(request, currentPage, pageSize);

        if (data) {
          setDistrictData(data);
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
        message.error("Không thể tải danh sách Quận/Huyện");
      } finally {
        setLoading(false);
      }
    };

    getDistricts();
  }, [id, provinceId, code, name, currentPage]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD-MM-YYYY");
  };

  // Chuyển hướng đến trang chi tiết
  const navigateToDistrictDetail = (id) => {
    navigate(`/admin/districts/${id}`);
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
      key: "province_code",
      align: "center",
      render: (_, record) => (
        <Text>{record.province?.code || "N/A"}</Text>
      ),
      width: 180,
    },
    {
      title: "Tỉnh/Thành phố",
      key: "province_name",
      align: "center",
      render: (_, record) => (
        <Text>{record.province?.name || "N/A"}</Text>
      ),
      // width: 320,
    },
    {
      title: "Mã Quận/Huyện",
      key: "code",
      align: "center",
      render: (_, record) => <Text>{record.code || "N/A"}</Text>,
      // width: 180,
    },
    {
      title: "Quận/Huyện",
      key: "name",
      align: "center",
      render: (_, record) => <Text>{record.name || "N/A"}</Text>,
      // width: 320,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
      render: (created_at) => formatDate(created_at),
      // width: 120,
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
            onClick={() => navigateToDistrictDetail(record.id)}
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
          { title: <Link to="/admin/districts">Quận/Huyện</Link> },
          { title: "Danh sách Quận/Huyện" },
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
              const status = getSelectedDistrictsStatus();

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
              province_id: provinceId,
              code,
              name,
            }}
            style={{ display: "flex" }}
          >
            <Form.Item
              name="province_id"
              style={{ marginRight: 8, width: "240px" }}
            >
              <Select
                placeholder="Tỉnh/Thành phố"
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                }
              >
                {provinces.map((province) => (
                  <Select.Option key={province.id} value={province.id}>
                    {province.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
            />
          </Form>
        </div>
      </div>

      <Table
        dataSource={districtData.data || []}
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
          total={districtData.totalElements || 0}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      {/* Modal thêm mới */}
      <DistrictFormModal
        visible={isModalVisible}
        onCancel={handleCancelModal}
        onSubmit={handleCreateDistrict}
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

export default District;