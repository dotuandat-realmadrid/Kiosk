// ==========================================
// Counter.jsx (UPDATED - HỖ TRỢ NHIỀU PRIORITY SERVICES)
// ==========================================
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
  InputNumber,
  message,
  Modal,
  Pagination,
  Select,
  Space,
  Table,
  Tabs,
  Tooltip,
  Typography,
  Alert,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  searchCounters,
  toggleCounters,
  createCounter,
} from "../../api/counter";
import { searchProvinces } from "../../api/province";
import { getDistrictsByProvince } from "../../api/district";
import { searchTransactionOffices } from "../../api/transaction_office";
import { searchBranches } from "../../api/branch";

const { Text } = Typography;

// Component Form thêm mới counter (ĐÃ SỬA - HỖ TRỢ NHIỀU PRIORITY SERVICES)
const CounterFormModal = ({ visible, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [transactionOffices, setTransactionOffices] = useState([]);
  const [branchConfig, setBranchConfig] = useState(null);

  const [provincesLoading, setProvincesLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [officesLoading, setOfficesLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);

  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [selectedOfficeId, setSelectedOfficeId] = useState(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);

  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    if (visible) {
      const loadInitialData = async () => {
        setProvincesLoading(true);
        try {
          const provincesResult = await searchProvinces({}, 1, 1000);
          setProvinces(provincesResult.data || []);
        } catch (error) {
          console.error("Error loading initial data:", error);
          message.error("Không thể tải dữ liệu ban đầu");
        } finally {
          setProvincesLoading(false);
        }
      };

      loadInitialData();

      const currentValues = form.getFieldsValue();
      const hasValues = Object.values(currentValues).some(
        (value) => value !== undefined && value !== null && value !== "",
      );

      if (!hasValues) {
        form.resetFields();
        setSelectedProvinceId(null);
        setSelectedDistrictId(null);
        setSelectedOfficeId(null);
        setDistricts([]);
        setTransactionOffices([]);
        setBranchConfig(null);
        setSelectedServiceIds([]);
      }
    }
  }, [visible, form]);

  const handleProvinceChange = async (provinceId) => {
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId(null);
    setSelectedOfficeId(null);
    setBranchConfig(null);
    setSelectedServiceIds([]);
    form.setFieldsValue({
      district_id: undefined,
      transaction_office_id: undefined,
      service_ids: undefined,
      priority_service_ids: undefined, // ← THAY ĐỔI: từ priority_service_id → priority_service_ids
    });

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
      setTransactionOffices([]);
    }
  };

  const handleDistrictChange = async (districtId) => {
    setSelectedDistrictId(districtId);
    setSelectedOfficeId(null);
    setBranchConfig(null);
    setSelectedServiceIds([]);
    form.setFieldsValue({
      transaction_office_id: undefined,
      service_ids: undefined,
      priority_service_ids: undefined, // ← THAY ĐỔI
    });

    if (districtId) {
      setOfficesLoading(true);
      try {
        const result = await searchTransactionOffices(
          { district_id: districtId, is_active: true },
          1,
          1000,
        );
        setTransactionOffices(result.data || []);
      } catch (error) {
        console.error("Error loading transaction offices:", error);
        message.error("Không thể tải danh sách phòng giao dịch");
      } finally {
        setOfficesLoading(false);
      }
    } else {
      setTransactionOffices([]);
    }
  };

  const handleOfficeChange = async (officeId) => {
    setSelectedOfficeId(officeId);
    setBranchConfig(null);
    setSelectedServiceIds([]);
    form.setFieldsValue({
      service_ids: undefined,
      priority_service_ids: undefined, // ← THAY ĐỔI
    });

    if (officeId) {
      setBranchLoading(true);
      try {
        const result = await searchBranches(
          { transaction_office_id: officeId },
          1,
          1,
        );

        if (result.data && result.data.length > 0) {
          const branch = result.data[0];
          setBranchConfig(branch);
        } else {
          message.warning("Phòng giao dịch này chưa có cấu hình chi nhánh");
          setBranchConfig(null);
        }
      } catch (error) {
        console.error("Error loading branch config:", error);
        message.error("Không thể tải cấu hình chi nhánh");
      } finally {
        setBranchLoading(false);
      }
    }
  };

  const getBranchServices = () => {
    if (!branchConfig) return [];

    if (branchConfig.service_group && branchConfig.service_group.services) {
      return branchConfig.service_group.services;
    }

    return branchConfig.services || [];
  };

  const handleServiceChange = (serviceIds) => {
    setSelectedServiceIds(serviceIds || []);

    // ← THAY ĐỔI: Kiểm tra priority_service_ids (mảng) thay vì priority_service_id (đơn)
    const currentPriorityIds = form.getFieldValue("priority_service_ids") || [];
    const invalidPriorityIds = currentPriorityIds.filter(
      (id) => !serviceIds.includes(id),
    );

    if (invalidPriorityIds.length > 0) {
      const validPriorityIds = currentPriorityIds.filter((id) =>
        serviceIds.includes(id),
      );
      form.setFieldsValue({ priority_service_ids: validPriorityIds });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const serviceIds = values.service_ids || [];
      let priorityServiceIds = values.priority_service_ids || []; // ← THAY ĐỔI: mảng

      // Validate: priority services phải nằm trong service_ids
      const invalidPriorityIds = priorityServiceIds.filter(
        (id) => !serviceIds.includes(id),
      );
      if (invalidPriorityIds.length > 0) {
        priorityServiceIds = priorityServiceIds.filter((id) =>
          serviceIds.includes(id),
        );
        form.setFieldsValue({ priority_service_ids: priorityServiceIds });
        message.warning(
          "Một số dịch vụ ưu tiên không hợp lệ → đã tự động bỏ chọn",
        );
      }

      const counterData = {
        code: values.code,
        name: values.name,
        counter_number: values.counter_number,
        led_board_number: values.led_board_number,
        transaction_office_id: values.transaction_office_id,
        service_ids: serviceIds,
        priority_service_ids: priorityServiceIds, // ← THAY ĐỔI: gửi mảng
        is_active: true,
      };

      const success = await onSubmit(counterData);

      if (success) {
        form.resetFields();
        setSelectedProvinceId(null);
        setSelectedDistrictId(null);
        setSelectedOfficeId(null);
        setDistricts([]);
        setTransactionOffices([]);
        setBranchConfig(null);
        setSelectedServiceIds([]);
        setActiveTab("1");
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedProvinceId(null);
    setSelectedDistrictId(null);
    setSelectedOfficeId(null);
    setDistricts([]);
    setTransactionOffices([]);
    setBranchConfig(null);
    setSelectedServiceIds([]);
    onCancel();
  };

  return (
    <Modal
      title="Thêm mới quầy"
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Thêm"
      cancelText="Hủy"
      width={900}
      destroyOnHidden={true}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item
            name="code"
            label="Mã quầy"
            rules={[{ required: true, message: "Vui lòng nhập mã quầy!" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="Nhập mã quầy" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên quầy"
            rules={[{ required: true, message: "Vui lòng nhập tên quầy!" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="Nhập tên quầy" />
          </Form.Item>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item
            name="counter_number"
            label="Số quầy"
            rules={[{ required: true, message: "Vui lòng nhập số quầy!" }]}
            style={{ flex: 1 }}
          >
            <InputNumber
              placeholder="Nhập số quầy"
              style={{ width: "100%" }}
              min={1}
            />
          </Form.Item>

          <Form.Item
            name="led_board_number"
            label="Số bảng LED"
            style={{ flex: 1 }}
          >
            <InputNumber
              placeholder="Nhập số bảng LED"
              style={{ width: "100%" }}
              min={1}
            />
          </Form.Item>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item
            name="province_id"
            label="Tỉnh/Thành phố"
            rules={[
              { required: true, message: "Vui lòng chọn tỉnh/thành phố!" },
            ]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Chọn tỉnh/thành phố"
              loading={provincesLoading}
              showSearch
              optionFilterProp="children"
              onChange={handleProvinceChange}
              filterOption={(input, option) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
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
              onChange={handleDistrictChange}
              filterOption={(input, option) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
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

        <Form.Item
          name="transaction_office_id"
          label="PGD"
          rules={[{ required: true, message: "Vui lòng chọn PGD!" }]}
        >
          <Select
            placeholder="Chọn PGD"
            loading={officesLoading}
            disabled={!selectedDistrictId}
            showSearch
            optionFilterProp="children"
            onChange={handleOfficeChange}
            filterOption={(input, option) =>
              (option?.children ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {transactionOffices.map((office) => (
              <Select.Option key={office.id} value={office.id}>
                {office.name} ({office.code})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {selectedOfficeId && (
          <>
            {branchLoading ? (
              <div style={{ textAlign: "center", padding: 24 }}>
                <Text type="secondary">Đang tải cấu hình chi nhánh...</Text>
              </div>
            ) : branchConfig ? (
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <Tabs.TabPane tab="DỊCH VỤ" key="1">
                  <Form.Item
                    name="service_ids"
                    label="Chọn dịch vụ cho quầy"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ít nhất 1 dịch vụ!",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Chọn dịch vụ"
                      showSearch
                      optionFilterProp="children"
                      onChange={handleServiceChange}
                      filterOption={(input, option) =>
                        (option?.children ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {getBranchServices().map((service) => (
                        <Select.Option key={service.id} value={service.id}>
                          {service.name_vi}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {branchConfig.service_group && (
                    <Alert
                      title="Thông tin nhóm dịch vụ"
                      description={
                        <div>
                          <Text strong>Nhóm: </Text>
                          <Text>{branchConfig.service_group.name_vi}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            ({branchConfig.service_group.services?.length || 0}{" "}
                            dịch vụ trong nhóm)
                          </Text>
                        </div>
                      }
                      type="info"
                      showIcon
                      style={{ marginTop: 16 }}
                    />
                  )}

                  {getBranchServices().length === 0 && (
                    <Alert
                      title="Chưa có dịch vụ"
                      description="Phòng giao dịch này chưa có dịch vụ nào."
                      type="warning"
                      showIcon
                    />
                  )}
                </Tabs.TabPane>

                {/* ← THAY ĐỔI: Từ Select đơn → Select multiple */}
                <Tabs.TabPane tab="ƯU TIÊN PHỤC VỤ" key="2">
                  <Form.Item
                    name="priority_service_ids"
                    label="Chọn dịch vụ ưu tiên"
                  >
                    <Select
                      mode="multiple" // ← THAY ĐỔI: Thêm mode="multiple"
                      placeholder="Chọn các dịch vụ ưu tiên phục vụ"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.children ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {selectedServiceIds.map((serviceId) => {
                        const service = getBranchServices().find(
                          (s) => s.id === serviceId,
                        );
                        return service ? (
                          <Select.Option key={service.id} value={service.id}>
                            {service.name_vi}
                          </Select.Option>
                        ) : null;
                      })}
                    </Select>
                  </Form.Item>

                  {selectedServiceIds.length === 0 ? (
                    <Alert
                      title="Chưa chọn dịch vụ"
                      description="Vui lòng chọn dịch vụ ở tab 'DỊCH VỤ' trước khi chọn dịch vụ ưu tiên."
                      type="warning"
                      showIcon
                    />
                  ) : (
                    <Alert
                      title="Hướng dẫn"
                      description="Các dịch vụ ưu tiên sẽ được phục vụ trước các dịch vụ khác tại quầy này."
                      type="info"
                      showIcon
                    />
                  )}
                </Tabs.TabPane>
              </Tabs>
            ) : (
              <Alert
                title="Chưa có cấu hình chi nhánh"
                description="Phòng giao dịch này chưa được cấu hình chi nhánh. Vui lòng cấu hình chi nhánh trước khi thêm quầy."
                type="warning"
                showIcon
              />
            )}
          </>
        )}
      </Form>
    </Modal>
  );
};

const Counter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [counterData, setCounterData] = useState({
    data: [],
    totalElements: 0,
    totalPage: 0,
    currentPage: 1,
    pageSize: 20,
  });

  const [provinceId, setProvinceId] = useState(queryParams.get("province_id"));
  const [districtId, setDistrictId] = useState(queryParams.get("district_id"));
  const [transactionOfficeId, setTransactionOfficeId] = useState(
    queryParams.get("transaction_office_id"),
  );
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

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [transactionOffices, setTransactionOffices] = useState([]);
  const [filterProvinceId, setFilterProvinceId] = useState(null);
  const [filterDistrictId, setFilterDistrictId] = useState(null);

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

  useEffect(() => {
    setFilterProvinceId(provinceId);
    setFilterDistrictId(districtId);
  }, [provinceId, districtId]);

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
        setTransactionOffices([]);
      }
    };

    loadDistricts();
  }, [filterProvinceId]);

  useEffect(() => {
    const loadOffices = async () => {
      if (filterDistrictId) {
        try {
          const result = await searchTransactionOffices(
            { district_id: filterDistrictId, is_active: true },
            1,
            1000,
          );
          setTransactionOffices(result.data || []);
        } catch (error) {
          console.error("Error loading transaction offices for filter:", error);
        }
      } else {
        setTransactionOffices([]);
      }
    };

    loadOffices();
  }, [filterDistrictId]);

  const getSelectedCountersStatus = () => {
    const selectedCounters = counterData.data.filter((counter) =>
      selectedRowKeys.includes(counter.id),
    );

    const activeCounters = selectedCounters.filter(
      (counter) => counter.is_active,
    );
    const inactiveCounters = selectedCounters.filter(
      (counter) => !counter.is_active,
    );

    return {
      hasActive: activeCounters.length > 0,
      hasInactive: inactiveCounters.length > 0,
      activeCount: activeCounters.length,
      inactiveCount: inactiveCounters.length,
    };
  };

  const handleMultipleToggle = async (action) => {
    const status = getSelectedCountersStatus();

    let title = "";
    let content = "";
    let okText = "";
    let is_active = false;

    if (action === "deactivate") {
      title = "Xác nhận vô hiệu hóa quầy";
      content = `Bạn có chắc chắn muốn vô hiệu hóa ${status.activeCount} quầy đã chọn?`;
      okText = "Vô hiệu hóa";
      is_active = false;
    } else {
      title = "Xác nhận kích hoạt quầy";
      content = `Bạn có chắc chắn muốn kích hoạt lại ${status.inactiveCount} quầy đã chọn?`;
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
          await toggleCounters(selectedRowKeys, is_active);
          setSelectedRowKeys([]);

          const request = {
            province_id: provinceId,
            district_id: districtId,
            transaction_office_id: transactionOfficeId,
          };
          const refreshedData = await searchCounters(
            request,
            currentPage,
            pageSize,
          );

          if (action === "deactivate") {
            message.success(
              `Đã vô hiệu hóa ${status.activeCount} quầy thành công`,
            );
          } else {
            message.success(
              `Đã kích hoạt ${status.inactiveCount} quầy thành công`,
            );
          }
          setCounterData(refreshedData);
        } catch (error) {
          console.error("Error toggling counters:", error);
        } finally {
          setToggleLoading(false);
        }
      },
    });
  };

  const updateURL = (newParams) => {
    const params = new URLSearchParams();

    Object.entries(newParams).forEach(([key, value]) => {
      if (value && key !== "page") {
        params.set(key, value);
      }
    });

    navigate(`?${params.toString()}`, { replace: true });
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
  };

  const handleCreateCounter = async (values) => {
    setCreateLoading(true);
    try {
      await createCounter(values);
      setIsModalVisible(false);

      const request = {
        province_id: provinceId,
        district_id: districtId,
        transaction_office_id: transactionOfficeId,
      };
      const refreshedData = await searchCounters(
        request,
        currentPage,
        pageSize,
      );
      setCounterData(refreshedData);

      return true;
    } catch (error) {
      console.error("Error creating counter:", error);
      return false;
    } finally {
      setCreateLoading(false);
    }
  };

  const handleFilterProvinceChange = (value) => {
    setFilterProvinceId(value);
    setFilterDistrictId(null);
    filterForm.setFieldsValue({
      district_id: undefined,
      transaction_office_id: undefined,
    });
  };

  const handleFilterDistrictChange = (value) => {
    setFilterDistrictId(value);
    filterForm.setFieldsValue({ transaction_office_id: undefined });
  };

  const handleFilterSubmit = (values) => {
    const newParams = {
      province_id: values.province_id,
      district_id: values.district_id,
      transaction_office_id: values.transaction_office_id,
      page: 1,
    };

    setCurrentPage(1);
    setProvinceId(newParams.province_id);
    setDistrictId(newParams.district_id);
    setTransactionOfficeId(newParams.transaction_office_id);

    updateURL(newParams);
  };

  useEffect(() => {
    const getCounters = async () => {
      setLoading(true);
      try {
        const request = {
          province_id: provinceId,
          district_id: districtId,
          transaction_office_id: transactionOfficeId,
        };

        const data = await searchCounters(request, currentPage, pageSize);

        if (data) {
          setCounterData(data);
        }
      } catch (error) {
        console.error("Error fetching counters:", error);
        message.error("Không thể tải danh sách quầy");
      } finally {
        setLoading(false);
      }
    };

    getCounters();
  }, [provinceId, districtId, transactionOfficeId, currentPage]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD-MM-YYYY");
  };

  const navigateToCounterDetail = (id) => {
    navigate(`/admin/counters/${id}`);
  };

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
      title: "Phòng giao dịch",
      key: "transaction_office_name",
      align: "center",
      render: (_, record) => (
        <Text>{record.transaction_office?.name || "N/A"}</Text>
      ),
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (name) => <Text>{name || "N/A"}</Text>,
    },
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      align: "center",
      render: (code) => <Text strong>{code || "N/A"}</Text>,
    },
    {
      title: "Số quầy",
      dataIndex: "counter_number",
      key: "counter_number",
      align: "center",
      render: (counter_number) => <Text>{counter_number || "N/A"}</Text>,
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
            onClick={() => navigateToCounterDetail(record.id)}
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
          { title: <Link to="/admin/devices-manager">Quản lý thiết bị</Link> },
          { title: <Link to="/admin/counters">Quầy</Link> },
          { title: "Danh sách quầy" },
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
              const status = getSelectedCountersStatus();

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
              transaction_office_id: transactionOfficeId,
            }}
          >
            <Form.Item name="province_id">
              <Select
                placeholder="Tỉnh/Thành phố"
                allowClear
                showSearch
                style={{ width: 180 }}
                optionFilterProp="children"
                onChange={handleFilterProvinceChange}
                filterOption={(input, option) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
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
                style={{ width: 180 }}
                disabled={!filterProvinceId}
                optionFilterProp="children"
                onChange={handleFilterDistrictChange}
                filterOption={(input, option) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {districts.map((district) => (
                  <Select.Option key={district.id} value={district.id}>
                    {district.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="transaction_office_id">
              <Select
                placeholder="PGD"
                allowClear
                showSearch
                style={{ width: 240 }}
                disabled={!filterDistrictId}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {transactionOffices.map((office) => (
                  <Select.Option key={office.id} value={office.id}>
                    {office.name} ({office.code})
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
        dataSource={counterData.data || []}
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
          total={counterData.totalElements || 0}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      <CounterFormModal
        visible={isModalVisible}
        onCancel={handleCancelModal}
        onSubmit={handleCreateCounter}
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

export default Counter;
