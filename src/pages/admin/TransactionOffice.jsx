import {
  ClearOutlined,
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
  searchTransactionOffices,
  toggleTransactionOffices,
  createTransactionOffice,
} from "../../api/transaction_office";
import { searchProvinces } from "../../api/province";
import { getDistrictsByProvince } from "../../api/district";

const { Text } = Typography;

dayjs.extend(customParseFormat);
const dateFormat = "YYYY-MM-DD";

// Component Form thêm mới phòng giao dịch
const TransactionOfficeFormModal = ({ visible, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [selectedProvinceId, setSelectedProvinceId] = useState(null);

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
        setSelectedProvinceId(null);
        setDistricts([]);
      } else {
        // Nếu đã có province_id, load lại districts
        const provinceId = form.getFieldValue('province_id');
        if (provinceId) {
          setSelectedProvinceId(provinceId);
          handleProvinceChange(provinceId);
        }
      }
    }
  }, [visible]);

  // Load districts khi chọn province
  const handleProvinceChange = async (provinceId) => {
    setSelectedProvinceId(provinceId);
    
    // Chỉ clear district_id khi người dùng chủ động thay đổi province
    const currentDistrictId = form.getFieldValue('district_id');
    if (currentDistrictId) {
      form.setFieldsValue({ district_id: undefined });
    }
    
    if (provinceId) {
      setDistrictsLoading(true);
      try {
        const districtList = await getDistrictsByProvince(provinceId);
        setDistricts(districtList || []);
      } catch (error) {
        console.error("Error loading districts:", error);
        message.error("Không thể tải danh sách quận/huyện");
      } finally {
        setDistrictsLoading(false);
      }
    } else {
      setDistricts([]);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const success = await onSubmit(values);
      
      // Chỉ reset form khi submit thành công
      if (success) {
        form.resetFields();
        setSelectedProvinceId(null);
        setDistricts([]);
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
    setSelectedProvinceId(null);
    setDistricts([]);
    onCancel();
  };

  return (
    <Modal
      title="Thêm mới phòng giao dịch"
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Thêm"
      cancelText="Hủy"
      width={700}
      destroyOnHidden={false}
    >
      <Form 
        form={form} 
        layout="vertical" 
        name={`transactionOfficeForm_${Date.now()}`}
        autoComplete="off"
      >
        {/* Hàng 1: Province và District */}
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="province_id"
            label="Tỉnh/Thành phố"
            rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố!" }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Chọn tỉnh/thành phố"
              loading={provincesLoading}
              showSearch
              optionFilterProp="children"
              onChange={handleProvinceChange}
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
            name="district_id"
            label="Quận/Huyện"
            rules={[{ required: true, message: "Vui lòng chọn quận/huyện!" }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Chọn quận/huyện"
              loading={districtsLoading}
              disabled={!selectedProvinceId}
              showSearch
              optionFilterProp="children"
              getPopupContainer={(trigger) => trigger.parentNode}
              filterOption={(input, option) =>
                (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
              }
            >
              {districts.map((district) => (
                <Select.Option key={district.id} value={district.id}>
                  {district.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* Hàng 2: Mã và Tên */}
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="code"
            label="Mã phòng giao dịch"
            rules={[
              { required: true, message: "Vui lòng nhập mã phòng giao dịch!" },
              { min: 2, max: 50, message: "Mã phải từ 2-50 ký tự!" },
              {
                pattern: /^[^\s]+$/,
                message: "Mã không được chứa khoảng trắng!",
              },
            ]}
            style={{ flex: 1 }}
          >
            <Input
              placeholder="Nhập mã phòng giao dịch (VD: PGD001)"
              maxLength={50}
              autoComplete="off"
              id={`code_${Date.now()}`}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên phòng giao dịch"
            rules={[
              { required: true, message: "Vui lòng nhập tên phòng giao dịch!" },
              { min: 2, max: 200, message: "Tên phải từ 2-200 ký tự!" },
            ]}
            style={{ flex: 1 }}
          >
            <Input
              placeholder="Nhập tên phòng giao dịch"
              maxLength={200}
              autoComplete="off"
              id={`name_${Date.now()}`}
            />
          </Form.Item>
        </div>

        {/* Hàng 3: Địa chỉ (full width) */}
        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[
            { required: true, message: "Vui lòng nhập địa chỉ!" },
            { min: 5, max: 500, message: "Địa chỉ phải từ 5-500 ký tự!" },
          ]}
        >
          <Input.TextArea
            placeholder="Nhập địa chỉ phòng giao dịch"
            maxLength={500}
            rows={3}
            autoComplete="chrome-off"
            id={`address_${Date.now()}`}
          />
        </Form.Item>

        {/* Hàng 4: Latitude và Longitude */}
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="latitude"
            label="Vĩ độ (Latitude)"
            style={{ flex: 1 }}
          >
            <Input
              placeholder="Nhập vĩ độ (VD: 21.00)"
              autoComplete="off"
              id={`latitude_${Date.now()}`}
            />
          </Form.Item>

          <Form.Item
            name="longitude"
            label="Kinh độ (Longitude)"
            style={{ flex: 1 }}
          >
            <Input
              placeholder="Nhập kinh độ (VD: 105.00)"
              autoComplete="off"
              id={`longitude_${Date.now()}`}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

const TransactionOffice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [officeData, setOfficeData] = useState({
    data: [],
    totalElements: 0,
    totalPage: 0,
    currentPage: 1,
    pageSize: 20,
  });

  // Filter states
  const [provinceId, setProvinceId] = useState(queryParams.get("province_id"));
  const [districtId, setDistrictId] = useState(queryParams.get("district_id"));
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

  // Danh sách tỉnh và quận để dùng trong filter
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [filterProvinceId, setFilterProvinceId] = useState(null);

  // Load provinces cho filter
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

  // Set filterProvinceId ban đầu từ provinceId
  useEffect(() => {
    setFilterProvinceId(provinceId);
  }, []);

  // Load districts khi filterProvinceId thay đổi
  useEffect(() => {
    const loadDistricts = async () => {
      if (filterProvinceId) {
        try {
          const districtList = await getDistrictsByProvince(filterProvinceId);
          setDistricts(districtList || []);
        } catch (error) {
          console.error("Error loading districts for filter:", error);
        }
      } else {
        setDistricts([]);
      }
    };

    loadDistricts();
  }, [filterProvinceId]);

  // Function kiểm tra trạng thái offices đã chọn
  const getSelectedOfficesStatus = () => {
    const selectedOffices = officeData.data.filter((office) =>
      selectedRowKeys.includes(office.id)
    );

    const activeOffices = selectedOffices.filter(
      (office) => office.is_active
    );
    const inactiveOffices = selectedOffices.filter(
      (office) => !office.is_active
    );

    return {
      hasActive: activeOffices.length > 0,
      hasInactive: inactiveOffices.length > 0,
      activeCount: activeOffices.length,
      inactiveCount: inactiveOffices.length,
      allActive: activeOffices.length === selectedOffices.length,
      allInactive: inactiveOffices.length === selectedOffices.length,
    };
  };

  const handleMultipleToggle = async (action) => {
    const status = getSelectedOfficesStatus();

    let title = "";
    let content = "";
    let okText = "";
    let is_active = false;

    if (action === "deactivate") {
      title = "Xác nhận vô hiệu hóa phòng giao dịch";
      content = `Bạn có chắc chắn muốn vô hiệu hóa ${status.activeCount} phòng giao dịch đã chọn?`;
      okText = "Vô hiệu hóa";
      is_active = false;
    } else {
      title = "Xác nhận kích hoạt phòng giao dịch";
      content = `Bạn có chắc chắn muốn kích hoạt lại ${status.inactiveCount} phòng giao dịch đã chọn?`;
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
          await toggleTransactionOffices(selectedRowKeys, is_active);

          setSelectedRowKeys([]);

          // Refresh data
          const request = {
            province_id: provinceId,
            district_id: districtId,
          };
          const refreshedData = await searchTransactionOffices(
            request,
            currentPage,
            pageSize
          );

          if (action === "deactivate") {
            message.success(
              `Đã vô hiệu hóa ${status.activeCount} phòng giao dịch thành công`
            );
          } else {
            message.success(
              `Đã kích hoạt ${status.inactiveCount} phòng giao dịch thành công`
            );
          }
          setOfficeData(refreshedData);
        } catch (error) {
          console.error("Error toggling offices:", error);
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

  // Hàm xử lý thêm mới phòng giao dịch
  const handleCreateOffice = async (values) => {
    setCreateLoading(true);
    try {
      await createTransactionOffice(values);

      message.success("Thêm mới phòng giao dịch thành công!");
      setIsModalVisible(false);

      // Refresh danh sách
      const request = {
        province_id: provinceId,
        district_id: districtId,
      };
      const refreshedData = await searchTransactionOffices(
        request,
        currentPage,
        pageSize
      );
      setOfficeData(refreshedData);
      
      return true; // Trả về true khi thành công
    } catch (error) {
      console.error("Error creating office:", error);
      
      // Hiển thị message lỗi chi tiết hơn
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        // message.error("Có lỗi xảy ra khi thêm phòng giao dịch. Vui lòng thử lại!");
      }
      
      return false; // Trả về false khi thất bại
    } finally {
      setCreateLoading(false);
    }
  };

  // Xử lý thay đổi province trong filter
  const handleFilterProvinceChange = (value) => {
    setFilterProvinceId(value);
    filterForm.setFieldsValue({ district_id: undefined });
  };

  // Submit form filter
  const handleFilterSubmit = (values) => {
    const newParams = {
      province_id: values.province_id,
      district_id: values.district_id,
      page: 1,
    };

    setCurrentPage(1);
    setProvinceId(newParams.province_id);
    setDistrictId(newParams.district_id);

    updateURL(newParams);
  };

  // Fetch offices
  useEffect(() => {
    const getOffices = async () => {
      setLoading(true);
      try {
        const request = {
          province_id: provinceId,
          district_id: districtId,
        };

        const data = await searchTransactionOffices(request, currentPage, pageSize);

        if (data) {
          setOfficeData(data);
        }
      } catch (error) {
        console.error("Error fetching offices:", error);
        message.error("Không thể tải danh sách phòng giao dịch");
      } finally {
        setLoading(false);
      }
    };

    getOffices();
  }, [provinceId, districtId, currentPage]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD-MM-YYYY");
  };

  // Chuyển hướng đến trang chi tiết
  const navigateToOfficeDetail = (id) => {
    navigate(`/admin/transaction-offices/${id}`);
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
    // {
    //   title: "Mã Tỉnh/TP",
    //   key: "province_code",
    //   align: "center",
    //   render: (_, record) => (
    //     <Text>{record.province_code || "N/A"}</Text>
    //   ),
    // },
    // {
    //   title: "Tỉnh/Thành phố",
    //   key: "province_name",
    //   align: "center",
    //   render: (_, record) => (
    //     <Text>{record.province_name || "N/A"}</Text>
    //   ),
    // },
    {
      title: "Mã Quận/Huyện",
      key: "district_code",
      align: "center",
      render: (_, record) => (
        <Text>{record.district_code || "N/A"}</Text>
      ),
    },
    {
      title: "Quận/Huyện",
      key: "district_name",
      align: "center",
      render: (_, record) => (
        <Text>{record.district_name || "N/A"}</Text>
      ),
    },
    {
      title: "Mã PGD",
      key: "code",
      align: "center",
      render: (_, record) => (
        <Text strong>{record.code || "N/A"}</Text>
      ),
    },
    {
      title: "Phòng giao dịch",
      key: "name",
      align: "center",
      render: (_, record) => (
        <Text>{record.name || "N/A"}</Text>
      ),
    },
    {
      title: "Địa chỉ",
      key: "address",
      align: "center",
      render: (_, record) => (
        <Text>{record.address || "N/A"}</Text>
      ),
    },
    {
      title: "Tọa độ Maps",
      key: "coordinates",
      align: "center",
      render: (_, record) => {
        if (record.latitude && record.longitude) {
          return (
            <Text>
              {record.latitude}, {record.longitude}
            </Text>
          );
        }
        return <Text type="secondary">Chưa có</Text>;
      },
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
            onClick={() => navigateToOfficeDetail(record.id)}
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
          { title: <Link to="/admin/transaction-offices">Phòng giao dịch</Link> },
          { title: "Danh sách phòng giao dịch" },
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
              const status = getSelectedOfficesStatus();

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
            layout="inline"
            onFinish={handleFilterSubmit}
            initialValues={{
              province_id: provinceId,
              district_id: districtId,
            }}
          >
            <Form.Item name="province_id">
              <Select
                placeholder="Tỉnh/Thành phố"
                allowClear
                showSearch
                style={{ width: 240 }}
                optionFilterProp="children"
                onChange={handleFilterProvinceChange}
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
            <Form.Item name="district_id">
              <Select
                placeholder="Quận/Huyện"
                allowClear
                showSearch
                style={{ width: 240 }}
                disabled={!filterProvinceId}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                }
              >
                {districts.map((district) => (
                  <Select.Option key={district.id} value={district.id}>
                    {district.name}
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
        dataSource={officeData.data || []}
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
          total={officeData.totalElements || 0}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      {/* Modal thêm mới */}
      <TransactionOfficeFormModal
        visible={isModalVisible}
        onCancel={handleCancelModal}
        onSubmit={handleCreateOffice}
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

export default TransactionOffice;