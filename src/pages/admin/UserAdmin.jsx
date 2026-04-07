import {
  ClearOutlined, DeleteOutlined, EyeOutlined, ExclamationCircleOutlined, IdcardOutlined, PhoneOutlined, PlusOutlined, SearchOutlined, UserOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Button, Col, Form, Input, message, Modal, Pagination, Row, Select, Spin, Space, Table, Tag, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createUser, searchUser, toggleUser } from "../../api/user";
import { searchProvinces } from "../../api/province";
import { getDistrictsByProvince } from "../../api/district";
import { getOfficesByDistrict } from "../../api/transaction_office";
import { getAllActivePositions } from "../../api/position";
import UserForm from "../../components/UserForm";
import { useSelector } from "react-redux";
import { useRoles } from "../../context/RoleContext";

const { Text } = Typography;

dayjs.extend(customParseFormat);
const dateFormat = "YYYY-MM-DD";
const customFormat = (value) => (value ? `${value.format(dateFormat)}` : null);

// Form thêm mới người dùng
const UserFormImproved = ({ onSubmit }) => {
  const onFinish = (values) => {
    onSubmit(values);
  };

  return (
    <UserForm
      onSubmit={onFinish}
      submitButtonText="Thêm"
      isDisabled={false}
      isAdmin={true}
    />
  );
};

const UserAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [userData, setUserData] = useState({
    data: [],
    totalElements: 0,
    totalPage: 0,
    currentPage: 1,
    pageSize: 20
  });
  
  // Filter states
  const [id, setId] = useState(queryParams.get("id"));
  const [username, setUsername] = useState(queryParams.get("username"));
  const [full_name, setFullName] = useState(queryParams.get("full_name"));
  const [phone, setPhone] = useState(queryParams.get("phone"));
  const [role_code, setRoleCode] = useState(queryParams.get("role_code"));
  const [transaction_offices_province_code, setTransactionOfficesProvinceCode] = useState(queryParams.get("transaction_offices_province_code"));
  const [transaction_offices_district_code, setTransactionOfficesDistrictCode] = useState(queryParams.get("transaction_offices_district_code"));
  const [transaction_offices_code, setTransactionOfficesCode] = useState(queryParams.get("transaction_offices_code"));
  const [position_code, setPositionCode] = useState(queryParams.get("position_code"));
  
  const [currentPage, setCurrentPage] = useState(parseInt(queryParams.get("page"), 10) || 1);
  const pageSize = 20;
  
  const [filterForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // State tạm thời cho filter form (chưa submit)
  const [tempProvinceCode, setTempProvinceCode] = useState(queryParams.get("transaction_offices_province_code"));
  const [tempDistrictCode, setTempDistrictCode] = useState(queryParams.get("transaction_offices_district_code"));
  
  // Data states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [transactionOffices, setTransactionOffices] = useState([]);
  const [positions, setPositions] = useState([]);
  
  const roles = useRoles(); // Giữ nguyên context hook cho roles
  
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  const myInfo = useSelector((state) => state.user);
  const currentUserId = myInfo?.id;

  // Load initial data (provinces, positions)
  useEffect(() => {
    const loadInitialData = async () => {
      setDataLoading(true);
      try {
        const [provincesData, positionsData] = await Promise.all([
          searchProvinces({}, 1, 1000),
          getAllActivePositions()
        ]);
        
        setProvinces(provincesData.data || []);
        setPositions(positionsData || []);
      } catch (error) {
        console.error("Error loading initial data:", error);
        message.error("Không thể tải dữ liệu ban đầu");
      } finally {
        setDataLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load districts khi tempProvinceCode thay đổi
  useEffect(() => {
    const loadDistricts = async () => {
      if (!tempProvinceCode) {
        setDistricts([]);
        return;
      }

      try {
        const province = provinces.find(p => p.code === tempProvinceCode);
        if (province) {
          const districtsData = await getDistrictsByProvince(province.id);
          setDistricts(districtsData || []);
        }
      } catch (error) {
        console.error("Error loading districts:", error);
        setDistricts([]);
      }
    };

    loadDistricts();
  }, [tempProvinceCode, provinces]);

  // Load transaction offices khi tempDistrictCode thay đổi
  useEffect(() => {
    const loadTransactionOffices = async () => {
      if (!tempDistrictCode) {
        setTransactionOffices([]);
        return;
      }

      try {
        const district = districts.find(d => d.code === tempDistrictCode);
        if (district) {
          const officesData = await getOfficesByDistrict(district.id);
          setTransactionOffices(officesData || []);
        }
      } catch (error) {
        console.error("Error loading transaction offices:", error);
        setTransactionOffices([]);
      }
    };

    loadTransactionOffices();
  }, [tempDistrictCode, districts]);

  // Function kiểm tra trạng thái users đã chọn
  const getSelectedUsersStatus = () => {
    const selectedUsers = userData.data.filter(user => 
      selectedRowKeys.includes(user.id)
    );
    
    const activeUsers = selectedUsers.filter(user => user.is_active);
    const inactiveUsers = selectedUsers.filter(user => !user.is_active);
    
    return {
      hasActive: activeUsers.length > 0,
      hasInactive: inactiveUsers.length > 0,
      activeCount: activeUsers.length,
      inactiveCount: inactiveUsers.length,
      allActive: activeUsers.length === selectedUsers.length,
      allInactive: inactiveUsers.length === selectedUsers.length
    };
  };

  const handleMultipleToggle = async (action) => {
    const status = getSelectedUsersStatus();
    
    let title = '';
    let content = '';
    let okText = '';
    
    if (action === 'deactivate') {
      title = 'Xác nhận vô hiệu hóa người dùng';
      content = `Bạn có chắc chắn muốn vô hiệu hóa ${status.activeCount} người dùng đã chọn?`;
      okText = 'Vô hiệu hóa';
    } else {
      title = 'Xác nhận kích hoạt người dùng';
      content = `Bạn có chắc chắn muốn kích hoạt lại ${status.inactiveCount} người dùng đã chọn?`;
      okText = 'Kích hoạt';
    }
    
    Modal.confirm({
      title,
      icon: <ExclamationCircleOutlined />,
      content,
      okText,
      okType: action === 'deactivate' ? 'danger' : 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        setDeleteLoading(true);
        try {
          await toggleUser(selectedRowKeys);
          
          setSelectedRowKeys([]);
          // Refresh data
          const request = {
            id,
            username,
            full_name,
            phone,
            role_code,
            position_code,
            transaction_offices_code,
            transaction_offices_province_code,
            transaction_offices_district_code
          };
          const refreshedData = await searchUser(request, currentPage, pageSize);
          
          if (action === 'deactivate') {
            message.success(`Đã vô hiệu hóa ${status.activeCount} người dùng thành công`);
          } else {
            message.success(`Đã kích hoạt ${status.inactiveCount} người dùng thành công`);
          }
          setUserData(refreshedData);
        } catch (error) {
          console.error('Error toggling users:', error);
          message.error('Có lỗi xảy ra khi thay đổi trạng thái');
        } finally {
          setDeleteLoading(false);
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

  // Xử lý khi thay đổi province trong filter (CHỈ UPDATE TEMP STATE)
  const handleProvinceFilterChange = (value) => {
    setTempProvinceCode(value);
    setTempDistrictCode(null);
    filterForm.setFieldsValue({
      transaction_offices_district_code: undefined,
      transaction_offices_code: undefined
    });
  };

  // Xử lý khi thay đổi district trong filter (CHỈ UPDATE TEMP STATE)
  const handleDistrictFilterChange = (value) => {
    setTempDistrictCode(value);
    filterForm.setFieldsValue({
      transaction_offices_code: undefined
    });
  };

  // Submit form filter - CHỈ KHI ẤN NÚT TÌM KIẾM
  const handleFilterSubmit = (values) => {
    const newParams = {
      id: values.id,
      username: values.username,
      full_name: values.full_name,
      phone: values.phone,
      role_code: values.role_code,
      position_code: values.position_code,
      transaction_offices_code: values.transaction_offices_code,
      transaction_offices_province_code: values.transaction_offices_province_code,
      transaction_offices_district_code: values.transaction_offices_district_code,
      page: 1,
    };

    setCurrentPage(1);
    setId(newParams.id);
    setUsername(newParams.username);
    setFullName(newParams.full_name);
    setPhone(newParams.phone);
    setRoleCode(newParams.role_code);
    setPositionCode(newParams.position_code);
    setTransactionOfficesCode(newParams.transaction_offices_code);
    setTransactionOfficesProvinceCode(newParams.transaction_offices_province_code);
    setTransactionOfficesDistrictCode(newParams.transaction_offices_district_code);

    updateURL(newParams);
  };

  // const isContextDataReady = 
  //   !dataLoading && 
  //   Array.isArray(roles);

  // Fetch users - CHỈ CHẠY KHI CÁC FILTER STATE (SAU KHI SUBMIT) THAY ĐỔI
  useEffect(() => {
    const getUsers = async () => {
      // if (!isContextDataReady) {
      //   return;
      // }
      
      setLoading(true);
      try {
        const request = {
          id: id,
          username: username,
          full_name: full_name,
          phone: phone,
          role_code: role_code,
          position_code: position_code,
          transaction_offices_code: transaction_offices_code,
          transaction_offices_province_code: transaction_offices_province_code,
          transaction_offices_district_code: transaction_offices_district_code,
        };
        
        const data = await searchUser(request, currentPage, pageSize);
        
        if (data) {
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        message.error("Không thể tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, [
    // isContextDataReady, 
    id, username, full_name, phone, role_code, position_code, transaction_offices_code, transaction_offices_province_code, transaction_offices_district_code, currentPage]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD-MM-YYYY");
  };

  // Chuyển hướng đến trang chi tiết
  const navigateToUserDetail = (id) => {
    navigate(`/admin/users/${id}`);
  };

  // ✅ Columns definition - HIỂN THỊ TẤT CẢ ROLES VÀ TRANSACTION OFFICES
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
      title: "Tên đăng nhập",
      key: "username",
      align: "center",
      render: (_, record) => (
        <Text style={!record.is_active ? { color: "#ff4d4f" } : {}}>
          {record.username || "N/A"}
        </Text>
      ),
    },
    {
      title: "Họ và tên",
      key: "full_name",
      align: "center",
      render: (_, record) => (
        <Text>{record.full_name || "N/A"}</Text>
      ),
    },
    {
      title: "Chi nhánh",
      key: "transaction_offices",
      align: "center",
      render: (_, record) => {
        // ✅ Hiển thị TẤT CẢ transaction offices
        if (!record.transaction_offices || record.transaction_offices.length === 0) {
          return <Text>N/A</Text>;
        }
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {record.transaction_offices.map((office, index) => (
              <Tag key={index} color="blue">
                {office.name}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: "Phân quyền",
      key: "roles",
      align: "center",
      render: (_, record) => {
        // ✅ Hiển thị TẤT CẢ roles
        if (!record.roles || record.roles.length === 0) {
          return <Text>N/A</Text>;
        }
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {record.roles.map((role, index) => (
              <Tag key={index} color="green">
                {role.name}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: "Chức danh",
      key: "position_name",
      align: "center",
      render: (_, record) => {
        if (!record.position) {
          return <Text>N/A</Text>;
        }
        return <Tag color="yellow">{record.position.name}</Tag>;
      },
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
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigateToUserDetail(record.id)}
            aria-label="Xem chi tiết"
          />
        </Tooltip>
      ),
    },
  ];

  const handleRegister = async (values) => {
    const date_of_birth = customFormat(values.date_of_birth);

    const data = {
      username: values.username,
      password: values.password,
      email: values.email,
      full_name: values.full_name,
      phone: values.phone,
      date_of_birth: date_of_birth,
      address: values.address,
      roles: values.roles,
      position_id: values.positions,
      transaction_offices: [values.transactionOffices],
    };

    try {
      await createUser(data);
      message.success("Thêm người dùng thành công!");
      setIsModalVisible(false);
      
      // Refresh danh sách
      const request = {
        id,
        username,
        full_name,
        phone,
        role_code,
        position_code,
        transaction_offices_code,
        transaction_offices_province_code,
        transaction_offices_district_code
      };
      const refreshedData = await searchUser(request, currentPage, pageSize);
      setUserData(refreshedData);
    } catch (e) {
      console.error("Error creating user:", e);
      message.error("Không thể thêm người dùng");
    }
  };

  // if (!isContextDataReady) {
  //   return (
  //     <Spin size="large" tip="Đang tải dữ liệu..." spinning={true}>
  //       <div style={{ 
  //           minHeight: '400px', 
  //           width: '100%' 
  //       }} />
  //     </Spin>
  //   );
  // }

  return (
    <>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/admin">Admin</Link> },
          { title: <Link to="/admin/users-manager">Người dùng</Link> },
          { title: <Link to="/admin/users">Tài khoản</Link> },
          { title: "Danh sách tài khoản" },
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
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          </Button>
          
          {selectedRowKeys.length > 0 && (() => {
            const status = getSelectedUsersStatus();
            
            return (
              <Space>
                {status.hasActive && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleMultipleToggle('deactivate')}
                    loading={deleteLoading}
                  >
                    Vô hiệu hóa ({status.activeCount})
                  </Button>
                )}
                
                {status.hasInactive && (
                  <Button
                    type="primary"
                    icon={<UserOutlined />}
                    onClick={() => handleMultipleToggle('activate')}
                    loading={deleteLoading}
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
              username,
              full_name,
              phone,
              role_code,
              transaction_offices_province_code,
              transaction_offices_district_code,
              transaction_offices_code,
              position_code,
            }}
            style={{ display: "flex" }}
          >
            <Form.Item name="transaction_offices_province_code" style={{ marginRight: 8, width: "160px" }}>
              <Select 
                placeholder="Tỉnh/Thành phố" 
                allowClear
                onChange={handleProvinceFilterChange}
              >
                {provinces.map((province) => (
                  <Select.Option key={province.code} value={province.code}>
                    {province.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="transaction_offices_district_code" style={{ marginRight: 8, width: "260px" }}>
              <Select 
                placeholder="Quận/Huyện" 
                allowClear
                onChange={handleDistrictFilterChange}
                disabled={!tempProvinceCode}
              >
                {districts.map((district) => (
                  <Select.Option key={district.code} value={district.code}>
                    {district.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="transaction_offices_code" style={{ marginRight: 8, width: "260px" }}>
              <Select 
                placeholder="PGD" 
                allowClear
                disabled={!tempProvinceCode && !tempDistrictCode}
              >
                {transactionOffices.map((office) => (
                  <Select.Option key={office.code} value={office.code}>
                    {office.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="position_code" style={{ marginRight: 8, width: "200px" }}>
              <Select placeholder="Chức danh" allowClear>
                {positions.map((position) => (
                  <Select.Option key={position.code} value={position.code}>
                    {position.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            {/* <Form.Item name="role_code" style={{ marginRight: 8, width: "200px" }}>
              <Select placeholder="Phân quyền" allowClear>
                {roles.map((role) => (
                  <Select.Option key={role.code} value={role.code}>
                    {role.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item> */}
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
            ></Button>
          </Form>
        </div>
      </div>

      <Table
        dataSource={userData.data || []}
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
          getCheckboxProps: (record) => ({
            disabled: record.id === currentUserId,
            name: record.full_name,
          }),
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
          total={userData.totalElements || 0}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      <Modal
        title={
          <Space>
            <UserOutlined />
            <span>Thêm mới người dùng</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={handleCancelModal}
        footer={null}
        width={1080}
        destroyOnHidden={true}
      >
        <UserFormImproved onSubmit={handleRegister} />
      </Modal>

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

export default UserAdmin;