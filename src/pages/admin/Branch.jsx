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
  InputNumber,
  message,
  Modal,
  Pagination,
  Radio,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  searchBranches,
  toggleBranches,
  createBranch,
} from "../../api/branch";
import { searchProvinces } from "../../api/province";
import { getDistrictsByProvince } from "../../api/district";
import { searchTransactionOffices } from "../../api/transaction_office";
import { getAllActiveServiceGroups } from "../../api/service_group";
import { getServicesByGroup } from "../../api/service_group_mapping";
import { searchServices } from "../../api/service";

const { Text } = Typography;

// Component Form thêm mới chi nhánh
const BranchFormModal = ({ visible, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [transactionOffices, setTransactionOffices] = useState([]);
  const [serviceGroups, setServiceGroups] = useState([]);
  const [services, setServices] = useState([]);
  const [groupServices, setGroupServices] = useState({});
  
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [officesLoading, setOfficesLoading] = useState(false);
  
  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  
  const [activeTab, setActiveTab] = useState("1");

  // Load provinces khi modal mở
  useEffect(() => {
    if (visible) {
      const loadInitialData = async () => {
        setProvincesLoading(true);
        try {
          const [provincesResult, groupsResult, servicesResult] = await Promise.all([
            searchProvinces({}, 1, 1000),
            getAllActiveServiceGroups(),
            searchServices({ is_active: true }, 1, 1000)
          ]);
          
          setProvinces(provincesResult.data || []);
          setServiceGroups(groupsResult || []);
          setServices(servicesResult.data || []);
        } catch (error) {
          console.error("Error loading initial data:", error);
          message.error("Không thể tải dữ liệu ban đầu");
        } finally {
          setProvincesLoading(false);
        }
      };

      loadInitialData();
      
      const currentValues = form.getFieldsValue();
      const hasValues = Object.values(currentValues).some(value => 
        value !== undefined && value !== null && value !== ''
      );
      
      if (!hasValues) {
        form.resetFields();
        setSelectedProvinceId(null);
        setSelectedDistrictId(null);
        setDistricts([]);
        setTransactionOffices([]);
        setSelectedServiceIds([]);
        setSelectedGroupIds([]);
        setGroupServices({});
      }
    }
  }, [visible, form]);

  // Load services của từng nhóm
  useEffect(() => {
    const loadGroupServices = async () => {
      if (serviceGroups.length > 0) {
        const servicesMap = {};
        
        for (const group of serviceGroups) {
          try {
            const result = await getServicesByGroup(group.id, 1, 1000);
            servicesMap[group.id] = result.data || [];
          } catch (error) {
            console.error(`Error loading services for group ${group.id}:`, error);
            servicesMap[group.id] = [];
          }
        }
        
        setGroupServices(servicesMap);
      }
    };

    loadGroupServices();
  }, [serviceGroups]);

  // Load districts khi chọn province
  const handleProvinceChange = async (provinceId) => {
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId(null);
    form.setFieldsValue({ 
      district_id: undefined,
      transaction_office_id: undefined 
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

  // Load transaction offices khi chọn district
  const handleDistrictChange = async (districtId) => {
    setSelectedDistrictId(districtId);
    form.setFieldsValue({ transaction_office_id: undefined });
    
    if (districtId) {
      setOfficesLoading(true);
      try {
        const result = await searchTransactionOffices(
          { district_id: districtId, is_active: true },
          1,
          1000
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

  // Xử lý chọn/bỏ chọn dịch vụ
  const handleServiceChange = (checkedValues) => {
    setSelectedServiceIds(checkedValues);
  };

  // Xử lý chọn/bỏ chọn nhóm dịch vụ
  const handleGroupChange = (checkedValues) => {
    setSelectedGroupIds(checkedValues);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const branchData = {
        transaction_office_id: values.transaction_office_id,
        service_ids: selectedServiceIds,
        service_group_ids: selectedGroupIds,
        is_active: true,
        queue_config: {
          waiting_alert_threshold: values.waiting_alert_threshold || 5,
          overdue_waiting_threshold: values.overdue_waiting_threshold || 10,
          service_alert_threshold: values.service_alert_threshold || 5,
          overdue_service_threshold: values.overdue_service_threshold || 10,
        },
        report_config: {
          waiting_alert_threshold: values.report_waiting_alert_threshold || 5,
          overdue_waiting_threshold: values.report_overdue_waiting_threshold || 10,
          service_alert_threshold: values.report_service_alert_threshold || 5,
          overdue_service_threshold: values.report_overdue_service_threshold || 10,
        }
      };
      
      const success = await onSubmit(branchData);
      
      if (success) {
        form.resetFields();
        setSelectedProvinceId(null);
        setSelectedDistrictId(null);
        setDistricts([]);
        setTransactionOffices([]);
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
    setDistricts([]);
    setTransactionOffices([]);
    setSelectedServiceIds([]);
    setSelectedGroupIds([]);
    onCancel();
  };

  return (
    <Modal
      title="Thêm mới cấu hình chi nhánh"
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Thêm"
      cancelText="Hủy"
      width={900}
      destroyOnHidden={true}
    >
      <Form 
        form={form} 
        layout="vertical"
        autoComplete="off"
      >
        {/* Chọn location và PGD */}
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
              onChange={handleDistrictChange}
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

        <Form.Item
          name="transaction_office_id"
          label="PGD"
          rules={[{ required: true, message: "Vui lòng chọn phòng giao dịch!" }]}
        >
          <Select
            placeholder="Chọn phòng giao dịch"
            loading={officesLoading}
            disabled={!selectedDistrictId}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
            }
          >
            {transactionOffices.map((office) => (
              <Select.Option key={office.id} value={office.id}>
                {office.name} ({office.code})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Tabs cho Dịch vụ, Cấu hình quầy, Cấu hình báo cáo */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Tab 1: Dịch vụ */}
          <Tabs.TabPane tab="DỊCH VỤ" key="1">
            <div style={{ display: 'flex', gap: 16 }}>
              {/* Cột trái: Individual Services */}
              <div style={{ flex: 1 }}>
                <Text strong>Chọn dịch vụ riêng lẻ:</Text>
                <div style={{ marginTop: 8, maxHeight: 400, overflowY: 'auto', border: '1px solid #d9d9d9', padding: 12, borderRadius: 4 }}>
                  <Checkbox.Group
                    value={selectedServiceIds}
                    onChange={handleServiceChange}
                    style={{ width: '100%' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {services.map(service => (
                        <Checkbox key={service.id} value={service.id}>
                          {service.name_vi}
                        </Checkbox>
                      ))}
                    </div>
                  </Checkbox.Group>
                </div>
                <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                  Đã chọn: {selectedServiceIds.length} dịch vụ
                </Text>
              </div>

              {/* Cột phải: Service Groups */}
              <div style={{ flex: 1 }}>
                <Text strong>Chọn nhóm dịch vụ:</Text>
                <div style={{ marginTop: 8, maxHeight: 400, overflowY: 'auto', border: '1px solid #d9d9d9', padding: 12, borderRadius: 4 }}>
                  <Checkbox.Group 
                    value={selectedGroupIds} 
                    onChange={handleGroupChange}
                    style={{ width: '100%' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {serviceGroups.map(group => (
                        <Checkbox key={group.id} value={group.id}>
                          <div>
                            <div>{group.name_vi}</div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              ({groupServices[group.id]?.length || 0} dịch vụ)
                            </Text>
                          </div>
                        </Checkbox>
                      ))}
                    </div>
                  </Checkbox.Group>
                </div>
                <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                  Đã chọn: {selectedGroupIds.length} nhóm
                </Text>
              </div>
            </div>
          </Tabs.TabPane>

          {/* Tab 2: Cấu hình quầy */}
          <Tabs.TabPane tab="CẤU HÌNH QUẦY" key="2">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ width: '30%', paddingRight: 8 }}>Cảnh báo đợi lâu (phút):</Text>
              <Form.Item
                name="waiting_alert_threshold"
                rules={[{ required: true, message: "Vui lòng nhập cảnh báo đợi lâu!" }]}
                initialValue={5}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ width: '30%', paddingRight: 8 }}>Lỗi đợi quá lâu (phút):</Text>
              <Form.Item
                name="overdue_waiting_threshold"
                rules={[{ required: true, message: "Vui lòng nhập lỗi đợi quá lâu!" }]}
                initialValue={10}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ width: '30%', paddingRight: 8 }}>Cảnh báo phục vụ lâu (phút):</Text>
              <Form.Item
                name="service_alert_threshold"
                rules={[{ required: true, message: "Vui lòng nhập cảnh báo phục vụ lâu!" }]}
                initialValue={5}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ width: '30%', paddingRight: 8 }}>Lỗi phục vụ quá lâu (phút):</Text>
              <Form.Item
                name="overdue_service_threshold"
                rules={[{ required: true, message: "Vui lòng nhập lỗi phục vụ quá lâu!" }]}
                initialValue={10}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </Tabs.TabPane>

          {/* Tab 3: Cấu hình báo cáo */}
          <Tabs.TabPane tab="CẤU HÌNH BÁO CÁO" key="3">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ width: '30%', paddingRight: 8 }}>Cảnh báo đợi lâu (phút):</Text>
              <Form.Item
                name="report_waiting_alert_threshold"
                rules={[{ required: true, message: "Vui lòng nhập cảnh báo đợi lâu!" }]}
                initialValue={5}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ width: '30%', paddingRight: 8 }}>Lỗi đợi quá lâu (phút):</Text>
              <Form.Item
                name="report_overdue_waiting_threshold"
                rules={[{ required: true, message: "Vui lòng nhập lỗi đợi quá lâu!" }]}
                initialValue={10}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ width: '30%', paddingRight: 8 }}>Cảnh báo phục vụ lâu (phút):</Text>
              <Form.Item
                name="report_service_alert_threshold"
                rules={[{ required: true, message: "Vui lòng nhập cảnh báo phục vụ lâu!" }]}
                initialValue={5}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ width: '30%', paddingRight: 8 }}>Lỗi phục vụ quá lâu (phút):</Text>
              <Form.Item
                name="report_overdue_service_threshold"
                rules={[{ required: true, message: "Vui lòng nhập lỗi phục vụ quá lâu!" }]}
                initialValue={10}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

const Branch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [branchData, setBranchData] = useState({
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
  }, [provinceId]);

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

  // Function kiểm tra trạng thái branches đã chọn
  const getSelectedBranchesStatus = () => {
    const selectedBranches = branchData.data.filter((branch) =>
      selectedRowKeys.includes(branch.id)
    );

    const activeBranches = selectedBranches.filter(
      (branch) => branch.is_active
    );
    const inactiveBranches = selectedBranches.filter(
      (branch) => !branch.is_active
    );

    return {
      hasActive: activeBranches.length > 0,
      hasInactive: inactiveBranches.length > 0,
      activeCount: activeBranches.length,
      inactiveCount: inactiveBranches.length,
    };
  };

  const handleMultipleToggle = async (action) => {
    const status = getSelectedBranchesStatus();

    let title = "";
    let content = "";
    let okText = "";
    let is_active = false;

    if (action === "deactivate") {
      title = "Xác nhận vô hiệu hóa chi nhánh";
      content = `Bạn có chắc chắn muốn vô hiệu hóa ${status.activeCount} chi nhánh đã chọn?`;
      okText = "Vô hiệu hóa";
      is_active = false;
    } else {
      title = "Xác nhận kích hoạt chi nhánh";
      content = `Bạn có chắc chắn muốn kích hoạt lại ${status.inactiveCount} chi nhánh đã chọn?`;
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
          await toggleBranches(selectedRowKeys, is_active);
          setSelectedRowKeys([]);

          // Refresh data
          const request = {
            province_id: provinceId,
            district_id: districtId,
          };
          const refreshedData = await searchBranches(
            request,
            currentPage,
            pageSize
          );

          if (action === "deactivate") {
            message.success(
              `Đã vô hiệu hóa ${status.activeCount} chi nhánh thành công`
            );
          } else {
            message.success(
              `Đã kích hoạt ${status.inactiveCount} chi nhánh thành công`
            );
          }
          setBranchData(refreshedData);
        } catch (error) {
          console.error("Error toggling branches:", error);
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

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
  };

  const handleCreateBranch = async (values) => {
    setCreateLoading(true);
    try {
      await createBranch(values);
      setIsModalVisible(false);

      // Refresh danh sách
      const request = {
        province_id: provinceId,
        district_id: districtId,
      };
      const refreshedData = await searchBranches(
        request,
        currentPage,
        pageSize
      );
      setBranchData(refreshedData);
      
      return true;
    } catch (error) {
      console.error("Error creating branch:", error.response || error);
      return false;
    } finally {
      setCreateLoading(false);
    }
  };

  const handleFilterProvinceChange = (value) => {
    setFilterProvinceId(value);
    filterForm.setFieldsValue({ district_id: undefined });
  };

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

  // Fetch branches
  useEffect(() => {
    const getBranches = async () => {
      setLoading(true);
      try {
        const request = {
          province_id: provinceId,
          district_id: districtId,
        };

        const data = await searchBranches(request, currentPage, pageSize);

        if (data) {
          setBranchData(data);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        message.error("Không thể tải danh sách chi nhánh");
      } finally {
        setLoading(false);
      }
    };

    getBranches();
  }, [provinceId, districtId, currentPage]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD-MM-YYYY");
  };

  const navigateToBranchDetail = (id) => {
    navigate(`/admin/branches/${id}`);
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
      title: "Tên PGD",
      key: "transaction_office_name",
      align: "center",
      render: (_, record) => (
        <Text>{record.transaction_office?.name || "N/A"}</Text>
      ),
    },
    {
      title: "Mã PGD",
      key: "transaction_office_code",
      align: "center",
      render: (_, record) => (
        <Text strong>{record.transaction_office?.code || "N/A"}</Text>
      ),
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
      title: "Ngày sửa cuối",
      dataIndex: "updated_at",
      key: "updated_at",
      align: "center",
      render: (updated_at) => formatDate(updated_at),
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
            onClick={() => navigateToBranchDetail(record.id)}
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
          { title: <Link to="/admin/branches">Cấu hình PGD</Link> },
          { title: "Danh sách cấu hình PGD" },
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
              const status = getSelectedBranchesStatus();

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
        dataSource={branchData.data || []}
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
          total={branchData.totalElements || 0}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      <BranchFormModal
        visible={isModalVisible}
        onCancel={handleCancelModal}
        onSubmit={handleCreateBranch}
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

export default Branch;