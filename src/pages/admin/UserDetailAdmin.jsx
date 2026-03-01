import {
  CalendarOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  IdcardOutlined,
  KeyOutlined,
  ReloadOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
  Spin,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../../api/password";
import { toggleUser, getUserById, updateUser } from "../../api/user";
import { searchProvinces } from "../../api/province";
import { getDistrictsByProvince } from "../../api/district";
import { getOfficesByDistrict } from "../../api/transaction_office";
import { getAllActivePositions } from "../../api/position";
import { useRoles } from "../../context/RoleContext";
import { hasPermission } from "../../services/authService";
import { useSelector } from "react-redux";

dayjs.extend(customParseFormat);
const dateFormat = "DD/MM/YYYY";
const customFormat = (value) => {
  return value && dayjs(value).isValid()
    ? dayjs(value).format(dateFormat)
    : null;
};

const { Text, Title } = Typography;
const { confirm } = Modal;

export default function UserDetailAdmin() {
  const [user, setUser] = useState(null);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const roles = useRoles();
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser = useSelector((state) => state.user);
    
  // State tạm thời cho province và district code (từ form)
  const [tempProvinceCode, setTempProvinceCode] = useState(null);
  const [tempDistrictCode, setTempDistrictCode] = useState(null);
  
  // Data states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [transactionOffices, setTransactionOffices] = useState([]);
  const [positions, setPositions] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [transactionOfficesLoading, setTransactionOfficesLoading] = useState(false);

  // Load initial data
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

  // Load user data
  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await getUserById(id);
        setUser(response);
      } catch (error) {
        console.error("Error loading user:", error);
        message.error("Không thể tải thông tin người dùng");
      }
    };

    getUserData();
  }, [id]);

  // Load districts khi tempProvinceCode thay đổi
  useEffect(() => {
    const loadDistricts = async () => {
      if (!tempProvinceCode || provinces.length === 0) {
        setDistricts([]);
        return;
      }

      setDistrictsLoading(true);
      try {
        const province = provinces.find(p => p.code === tempProvinceCode);
        if (province) {
          const districtsData = await getDistrictsByProvince(province.id);
          setDistricts(districtsData || []);
        }
      } catch (error) {
        console.error("Error loading districts:", error);
        setDistricts([]);
      } finally {
        setDistrictsLoading(false);
      }
    };

    loadDistricts();
  }, [tempProvinceCode, provinces]);

  // Load transaction offices khi tempDistrictCode thay đổi
  useEffect(() => {
    const loadTransactionOffices = async () => {
      if (!tempDistrictCode || districts.length === 0) {
        setTransactionOffices([]);
        return;
      }

      setTransactionOfficesLoading(true);
      try {
        const district = districts.find(d => d.code === tempDistrictCode);
        if (district) {
          const officesData = await getOfficesByDistrict(district.id);
          setTransactionOffices(officesData || []);
        }
      } catch (error) {
        console.error("Error loading transaction offices:", error);
        setTransactionOffices([]);
      } finally {
        setTransactionOfficesLoading(false);
      }
    };

    loadTransactionOffices();
  }, [tempDistrictCode, districts]);

  const handleCancel = () => {
    // Reset form về giá trị hiện tại của user thay vì resetFields
    if (user) {
      form.setFieldsValue({
        id: id,
        username: user.username || "",
        full_name: user.full_name || "",
        phone: user.phone || "",
        email: user.email || "",
        address: user.address || "",
        date_of_birth: user.date_of_birth ? dayjs(user.date_of_birth) : null,
        created_at: user.created_at ? dayjs(user.created_at) : null,
        updated_at: user.updated_at ? dayjs(user.updated_at) : null,
        is_active: user.is_active,
        roles: (user.roles || []).map(r => r.code),
        provinces: user.transaction_offices?.[0]?.province_code,
        districts: user.transaction_offices?.[0]?.district_code,
        transactionOffices: user.transaction_offices?.[0]?.code,
        positions: user.position?.id,
      });
    }
    
    setIsEditing(false);
    
    // Reset temp codes về giá trị ban đầu từ user
    if (user?.transaction_offices?.[0]?.province_code) {
      setTempProvinceCode(user.transaction_offices[0].province_code);
    } else {
      setTempProvinceCode(null);
    }
    if (user?.transaction_offices?.[0]?.district_code) {
      setTempDistrictCode(user.transaction_offices[0].district_code);
    } else {
      setTempDistrictCode(null);
    }
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  // Xử lý khi thay đổi province
  const handleProvinceChange = (value) => {
    setTempProvinceCode(value);
    setTempDistrictCode(null); // Reset district khi đổi province
    // Reset giá trị district và transactionOffice trong form
    form.setFieldsValue({
      districts: undefined,
      transactionOffices: undefined
    });
  };

  // Xử lý khi thay đổi district
  const handleDistrictChange = (value) => {
    setTempDistrictCode(value);
    // Reset giá trị transactionOffice trong form
    form.setFieldsValue({
      transactionOffices: undefined
    });
  };

  const onSubmit = async (values) => {
    confirm({
      title: "Xác nhận cập nhật",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn cập nhật thông tin người dùng này?",
      okText: "Cập nhật",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSubmitting(true);
          const data = {
            username: values.username,
            full_name: values.full_name,
            phone: values.phone,
            date_of_birth: customFormat(values.date_of_birth),
            email: values.email,
            position_id: values.positions,
            roles: values.roles,
            transaction_offices: [values.transactionOffices],
            address: values.address,
          };

          await updateUser(data, id);

          setUser(await getUserById(id));
          
          // message.success("Cập nhật tài khoản thành công!");

          setIsEditing(false);
        } catch (error) {
          message.error(error.message || "Cập nhật thất bại");
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleDelete = () => {
    confirm({
      title: "Xác nhận xóa tài khoản",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Bạn có chắc chắn muốn xóa tài khoản "${user.username}" không? Hành động này không thể hoàn tác.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleUser([id]);
          navigate("/admin/users");
          
          // message.success("Cập nhật trạng thái tài khoản thành công!");
        } catch (error) {
          message.error("Có lỗi xảy ra khi cập nhật trạng thái tài khoản");
        }
      },
    });
  };

  const handleReload = () => {
    confirm({
      title: "Xác nhận khôi phục tài khoản",
      icon: <ExclamationCircleOutlined style={{ color: "#59ff4d" }} />,
      content: `Bạn có chắc chắn muốn khôi phục tài khoản "${user.username}" không?`,
      okText: "Khôi phục",
      okType: "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleUser([id]);
          navigate("/admin/users");
          
          // message.success("Cập nhật trạng thái tài khoản thành công!");
        } catch (error) {
          message.error("Có lỗi xảy ra khi cập nhật trạng thái tài khoản");
        }
      },
    });
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword(id);
    } catch (error) {
      message.error("Có lỗi xảy ra khi đặt lại mật khẩu");
    }
  };

  useEffect(() => {
    if (user) {
      // Set giá trị cho form
      form.setFieldsValue({
        id: id,
        username: user.username || "",
        full_name: user.full_name || "",
        phone: user.phone || "",
        email: user.email || "",
        address: user.address || "",
        date_of_birth: user.date_of_birth ? dayjs(user.date_of_birth) : null,
        created_at: user.created_at ? dayjs(user.created_at) : null,
        updated_at: user.updated_at ? dayjs(user.updated_at) : null,
        is_active: user.is_active,
        roles: (user.roles || []).map(r => r.code),
        provinces: user.transaction_offices?.[0]?.province_code,
        districts: user.transaction_offices?.[0]?.district_code,
        transactionOffices: user.transaction_offices?.[0]?.code,
        positions: user.position?.id,
      });
      
      // Set tempProvinceCode và tempDistrictCode để trigger việc load dữ liệu
      if (user.transaction_offices?.[0]?.province_code) {
        setTempProvinceCode(user.transaction_offices[0].province_code);
      }
      if (user.transaction_offices?.[0]?.district_code) {
        setTempDistrictCode(user.transaction_offices[0].district_code);
      }
    }
  }, [user, id, form]);

  // Function to get first letter of full name for avatar
  const getFirstLetter = () => {
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    }
    return <UserOutlined />;
  };

  if (dataLoading || !user || !Array.isArray(roles)) {
    return (
      <Spin size="large" tip="Đang tải dữ liệu..." spinning={true}>
        <div style={{ 
            minHeight: '400px', 
            width: '100%' 
        }} />
      </Spin>
    );
  }

  return (
    <>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/admin">Admin</Link> },
          { title: <Link to="/admin/users-manager">Người dùng</Link> },
          { title: <Link to="/admin/users">Tài khoản</Link> },
          { title: user?.username || "N/A" },
        ]}
      />

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar
              size={64}
              style={{ backgroundColor: "#1890ff", marginRight: 16 }}
            >
              <span style={{ fontSize: 32 }}>{getFirstLetter()}</span>
            </Avatar>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {user.full_name}
              </Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <MailOutlined style={{ marginRight: 8 }} />
                <Text>{user.username}</Text>
              </div>
              <Space style={{ marginTop: 4 }}>
                <Badge
                  status={user.is_active === true ? "success" : "error"}
                  text={user.is_active === true ? "Hoạt động" : "Đã xóa"}
                />
              </Space>
            </div>
          </div>
        }
        extra={
          <Space>
            {user.is_active === true && (
              <>
                {isEditing ? (
                  <>
                    <Button icon={<CloseOutlined />} onClick={handleCancel}>
                      Hủy
                    </Button>
                    <Button
                      icon={<SaveOutlined />}
                      type="primary"
                      onClick={form.submit}
                      loading={isSubmitting}
                    >
                      Lưu
                    </Button>
                  </>
                ) : (
                  <Tooltip title="Chỉnh sửa thông tin">
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={handleStartEditing}
                    >
                      Chỉnh sửa
                    </Button>
                  </Tooltip>
                )}
                {(hasPermission(["ADMIN"]) && user.id !== currentUser.id) && (
                  <Tooltip title="Xóa tài khoản">
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleDelete}
                    >
                      Xóa
                    </Button>
                  </Tooltip>
                )}
              </>
            )}
            {user.is_active === false && (
              <>
                {(hasPermission(["ADMIN"]) && user.id !== currentUser.id) && (
                  <Tooltip title="Khôi phục tài khoản">
                    <Button
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={handleReload}
                    >
                      Khôi phục
                    </Button>
                  </Tooltip>
                )}
              </>
            )}
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
        >
          {isEditing ? (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="ID" name="id">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Username" name="username">
                    <Input disabled prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Họ và tên"
                    name="full_name"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập họ và tên",
                      },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập email",
                      },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label="Tỉnh/Thành phố" 
                    name="provinces" 
                  >
                    <Select
                      placeholder="Chọn Tỉnh/Thành phố"
                      style={{ width: '100%' }}
                      onChange={handleProvinceChange}
                    >
                      {provinces.map((province) => (
                        <Select.Option key={province.code} value={province.code}>
                          {province.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    label="Quận/Huyện" 
                    name="districts" 
                  >
                    <Select
                      placeholder="Chọn Quận/Huyện"
                      style={{ width: '100%' }}
                      onChange={handleDistrictChange}
                      disabled={!tempProvinceCode}
                      loading={districtsLoading}
                    >
                      {districts.map((district) => (
                        <Select.Option key={district.code} value={district.code}>
                          {district.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label="Phòng giao dịch" 
                    name="transactionOffices" 
                  >
                    <Select
                      placeholder="Chọn Phòng giao dịch"
                      style={{ width: '100%' }}
                      disabled={!tempProvinceCode || !tempDistrictCode}
                      loading={transactionOfficesLoading}
                    >
                      {transactionOffices.map((transaction_office) => (
                        <Select.Option key={transaction_office.code} value={transaction_office.code}>
                          {transaction_office.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    label="Vị trí chức danh" 
                    name="positions" 
                  >
                    <Select
                      placeholder="Chọn Vị trí chức danh"
                      style={{ width: '100%' }}
                    >
                      {positions.map((position) => (
                        <Select.Option key={position.id} value={position.id}>
                          {position.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Ngày sinh" name="date_of_birth">
                    <DatePicker
                      style={{ width: "100%" }}
                      format={dateFormat}
                      placeholder="Chọn ngày sinh"
                      prefix={<CalendarOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                    ]}
                  >
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Địa chỉ" name="address">
                    <Input prefix={<IdcardOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item 
                label="Vai trò" 
                name="roles" 
                hidden={!hasPermission(["ADMIN", "MANAGER"]) || user.id === currentUser.id}
                className="multi-select-wrap"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn vai trò"
                  style={{ width: '100%' }}
                  maxTagCount={undefined}
                >
                  {roles.map((role) => (
                    <Select.Option key={role.code} value={role.code}>
                      {role.description}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          ) : (
            <Descriptions
              bordered
              column={1}
              styles={{
                label: { width: "30%", fontWeight: "bold" },
                content: { width: "70%" }
              }}
            >
              <Descriptions.Item label="ID">{id}</Descriptions.Item>
              <Descriptions.Item label="Username">
                {user.username || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {user.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Họ và tên">
                {user.full_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {user.phone || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {user.date_of_birth
                  ? dayjs(user.date_of_birth).format(dateFormat)
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {user.address || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Vị trí chức danh">
                {user.position?.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tỉnh/Thành phố">
                {user.transaction_offices?.[0]?.province_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Quận/Huyện">
                {user.transaction_offices?.[0]?.district_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng giao dịch">
                {user.transaction_offices?.[0]?.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(user.created_at).format("DD/MM/YYYY HH:mm:ss")}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày chỉnh sửa">
                {dayjs(user.updated_at).format("DD/MM/YYYY HH:mm:ss")}
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                {(user.roles || []).length > 0 ? (
                  <Space size={[0, 4]} wrap>
                    {(user.roles || []).map((userRole) => (
                      <Tag key={userRole.code} color="blue" style={{ marginRight: "4px" }}>
                        {userRole.description}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  "Không có vai trò"
                )}
              </Descriptions.Item>
            </Descriptions>
          )}

          {!isEditing && (
            <Row style={{ marginTop: 16 }} gutter={[16, 16]}>
              {user.is_active === true && (
                <Col>
                  <Tooltip title="Đặt lại mật khẩu">
                    <Button
                      onClick={handleResetPassword}
                      type="default"
                      icon={<KeyOutlined />}
                    >
                      Reset mật khẩu
                    </Button>
                  </Tooltip>
                </Col>
              )}
            </Row>
          )}
        </Form>
      </Card>
      <style>{`
        .multi-select-wrap .ant-select-multiple .ant-select-selector {
          height: auto !important;
          min-height: 32px !important;
        }
      `}</style>
    </>
  );
}