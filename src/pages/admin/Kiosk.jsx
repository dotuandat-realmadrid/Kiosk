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
  Checkbox,
  Form,
  Input,
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
import { searchKiosks, toggleKiosks, createKiosk } from "../../api/kiosk";
import { searchProvinces } from "../../api/province";
import { getDistrictsByProvince } from "../../api/district";
import { searchTransactionOffices } from "../../api/transaction_office";
import { searchBranches } from "../../api/branch";

const { Text } = Typography;

// Component Form thêm mới kiosk
const KioskFormModal = ({ visible, onCancel, onSubmit, loading }) => {
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
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);

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
        setSelectedGroupIds([]);
      }
    }
  }, [visible, form]);

  const handleProvinceChange = async (provinceId) => {
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId(null);
    setSelectedOfficeId(null);
    setBranchConfig(null);
    setSelectedServiceIds([]);
    setSelectedGroupIds([]);
    form.setFieldsValue({
      district_id: undefined,
      transaction_office_id: undefined,
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
    setSelectedGroupIds([]);
    form.setFieldsValue({ transaction_office_id: undefined });

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

  // Khi chọn PGD, gọi searchBranches để lấy services và service_groups
  const handleOfficeChange = async (officeId) => {
    setSelectedOfficeId(officeId);
    setBranchConfig(null);
    setSelectedServiceIds([]);
    setSelectedGroupIds([]);

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

  const handleServiceChange = (checkedValues) => {
    setSelectedServiceIds(checkedValues);
  };

  const handleGroupChange = (checkedValues) => {
    setSelectedGroupIds(checkedValues);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const kioskData = {
        code: values.code,
        name: values.name,
        transaction_office_id: values.transaction_office_id,
        service_ids: selectedServiceIds,
        service_group_ids: selectedGroupIds,
        is_active: true,
      };

      const success = await onSubmit(kioskData);

      if (success) {
        form.resetFields();
        setSelectedProvinceId(null);
        setSelectedDistrictId(null);
        setSelectedOfficeId(null);
        setDistricts([]);
        setTransactionOffices([]);
        setBranchConfig(null);
        setSelectedServiceIds([]);
        setSelectedGroupIds([]);
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
    setSelectedGroupIds([]);
    onCancel();
  };

  return (
    <Modal
      title="Thêm mới kiosk"
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
            label="Mã kiosk"
            rules={[{ required: true, message: "Vui lòng nhập mã kiosk!" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="Nhập mã kiosk" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên kiosk"
            rules={[{ required: true, message: "Vui lòng nhập tên kiosk!" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="Nhập tên kiosk" />
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
                  <div style={{ display: "flex", gap: 16 }}>
                    {/* Cột trái: Individual Services */}
                    <div style={{ flex: 1 }}>
                      <Text strong>Dịch vụ:</Text>
                      <div
                        style={{
                          marginTop: 8,
                          maxHeight: 400,
                          overflowY: "auto",
                          border: "1px solid #d9d9d9",
                          padding: 12,
                          borderRadius: 4,
                          backgroundColor: "#fafafa",
                        }}
                      >
                        {branchConfig.services &&
                        branchConfig.services.length > 0 ? (
                          <Checkbox.Group
                            value={selectedServiceIds}
                            onChange={handleServiceChange}
                            style={{ width: "100%" }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}
                            >
                              {branchConfig.services.map((service) => (
                                <Checkbox key={service.id} value={service.id}>
                                  {service.name_vi}
                                </Checkbox>
                              ))}
                            </div>
                          </Checkbox.Group>
                        ) : (
                          <Text type="secondary">
                            Phòng giao dịch chưa cấu hình dịch vụ!
                          </Text>
                        )}
                      </div>
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, marginTop: 4, display: "block" }}
                      >
                        Đã chọn: {selectedServiceIds.length} dịch vụ
                      </Text>
                    </div>

                    {/* Cột phải: Service Groups */}
                    <div style={{ flex: 1 }}>
                      <Text strong>Nhóm dịch vụ:</Text>
                      <div
                        style={{
                          marginTop: 8,
                          maxHeight: 400,
                          overflowY: "auto",
                          border: "1px solid #d9d9d9",
                          padding: 12,
                          borderRadius: 4,
                          backgroundColor: "#fafafa",
                        }}
                      >
                        {branchConfig.service_groups &&
                        branchConfig.service_groups.length > 0 ? (
                          <Checkbox.Group
                            value={selectedGroupIds}
                            onChange={handleGroupChange}
                            style={{ width: "100%" }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}
                            >
                              {branchConfig.service_groups.map((group) => (
                                <Checkbox key={group.id} value={group.id}>
                                  <div>
                                    <div>
                                      {group.name_vi}
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: 13, padding: "4px" }}
                                      >
                                        ({group.services?.length || 0} dịch vụ)
                                      </Text>
                                    </div>
                                  </div>
                                </Checkbox>
                              ))}
                            </div>
                          </Checkbox.Group>
                        ) : (
                          <Text type="secondary">
                            Phòng giao dịch chưa cấu hình nhóm dịch vụ!
                          </Text>
                        )}
                      </div>
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, marginTop: 4, display: "block" }}
                      >
                        Đã chọn: {selectedGroupIds.length} nhóm
                      </Text>
                    </div>
                  </div>
                </Tabs.TabPane>
              </Tabs>
            ) : (
              <Alert
                title="Chưa có cấu hình chi nhánh"
                description="Phòng giao dịch này chưa được cấu hình chi nhánh. Vui lòng cấu hình chi nhánh trước khi thêm kiosk."
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

const Kiosk = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [kioskData, setKioskData] = useState({
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

  const getSelectedKiosksStatus = () => {
    const selectedKiosks = kioskData.data.filter((kiosk) =>
      selectedRowKeys.includes(kiosk.id),
    );

    const activeKiosks = selectedKiosks.filter((kiosk) => kiosk.is_active);
    const inactiveKiosks = selectedKiosks.filter((kiosk) => !kiosk.is_active);

    return {
      hasActive: activeKiosks.length > 0,
      hasInactive: inactiveKiosks.length > 0,
      activeCount: activeKiosks.length,
      inactiveCount: inactiveKiosks.length,
    };
  };

  const handleMultipleToggle = async (action) => {
    const status = getSelectedKiosksStatus();

    let title = "";
    let content = "";
    let okText = "";
    let is_active = false;

    if (action === "deactivate") {
      title = "Xác nhận vô hiệu hóa kiosk";
      content = `Bạn có chắc chắn muốn vô hiệu hóa ${status.activeCount} kiosk đã chọn?`;
      okText = "Vô hiệu hóa";
      is_active = false;
    } else {
      title = "Xác nhận kích hoạt kiosk";
      content = `Bạn có chắc chắn muốn kích hoạt lại ${status.inactiveCount} kiosk đã chọn?`;
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
          await toggleKiosks(selectedRowKeys, is_active);
          setSelectedRowKeys([]);

          const request = {
            province_id: provinceId,
            district_id: districtId,
            transaction_office_id: transactionOfficeId,
          };
          const refreshedData = await searchKiosks(
            request,
            currentPage,
            pageSize,
          );

          if (action === "deactivate") {
            message.success(
              `Đã vô hiệu hóa ${status.activeCount} kiosk thành công`,
            );
          } else {
            message.success(
              `Đã kích hoạt ${status.inactiveCount} kiosk thành công`,
            );
          }
          setKioskData(refreshedData);
        } catch (error) {
          console.error("Error toggling kiosks:", error);
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

  const handleCreateKiosk = async (values) => {
    setCreateLoading(true);
    try {
      await createKiosk(values);
      setIsModalVisible(false);

      const request = {
        province_id: provinceId,
        district_id: districtId,
        transaction_office_id: transactionOfficeId,
      };
      const refreshedData = await searchKiosks(request, currentPage, pageSize);
      setKioskData(refreshedData);

      return true;
    } catch (error) {
      console.error("Error creating kiosk:", error);
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
    const getKiosks = async () => {
      setLoading(true);
      try {
        const request = {
          province_id: provinceId,
          district_id: districtId,
          transaction_office_id: transactionOfficeId,
        };

        const data = await searchKiosks(request, currentPage, pageSize);

        if (data) {
          setKioskData(data);
        }
      } catch (error) {
        console.error("Error fetching kiosks:", error);
        message.error("Không thể tải danh sách kiosk");
      } finally {
        setLoading(false);
      }
    };

    getKiosks();
  }, [provinceId, districtId, transactionOfficeId, currentPage]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD-MM-YYYY");
  };

  const navigateToKioskDetail = (id) => {
    navigate(`/admin/kiosks/${id}`);
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
    // {
    //   title: "Dịch vụ",
    //   key: "services_count",
    //   align: "center",
    //   render: (_, record) => (
    //     <Text>{record.services?.length || 0} dịch vụ</Text>
    //   ),
    // },
    // {
    //   title: "Nhóm dịch vụ",
    //   key: "service_groups_count",
    //   align: "center",
    //   render: (_, record) => (
    //     <Text>{record.service_groups?.length || 0} nhóm</Text>
    //   ),
    // },
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
            onClick={() => navigateToKioskDetail(record.id)}
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
          { title: <Link to="/admin/kiosks">Kiosk</Link> },
          { title: "Danh sách kiosk" },
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
              const status = getSelectedKiosksStatus();

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
        dataSource={kioskData.data || []}
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
          total={kioskData.totalElements || 0}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      <KioskFormModal
        visible={isModalVisible}
        onCancel={handleCancelModal}
        onSubmit={handleCreateKiosk}
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

export default Kiosk;
