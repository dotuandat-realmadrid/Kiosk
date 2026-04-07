import { Button, DatePicker, Form, Input, Radio, Select, Spin } from "antd";
import MyButton from "./MyButton";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useRoles } from "../context/RoleContext";
import TextArea from "antd/es/input/TextArea";
import { useState, useEffect } from "react";
import { searchProvinces } from "../api/province";
import { searchTransactionOffices } from "../api/transaction_office";
import { searchDistricts } from "../api/district";
import { searchPositions } from "../api/position";

dayjs.extend(customParseFormat);
const dateFormat = "DD-MM-YYYY";

export default function UserForm({
  initValues,
  onSubmit,
  submitButtonText,
  isUpdate,
  isAdmin,
}) {
  const [form] = Form.useForm();
  
  // State tạm thời cho province và district code (từ form)
  const [tempProvinceCode, setTempProvinceCode] = useState(null);
  const [tempDistrictCode, setTempDistrictCode] = useState(null);
  
  // State để lưu province_id và district_id (dùng để gọi API)
  const [provinceIdForForm, setProvinceIdForForm] = useState(null);
  const [districtIdForForm, setDistrictIdForForm] = useState(null);
  
  // State để lưu data từ API
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [transactionOffices, setTransactionOffices] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const roles = useRoles();

  // Convert `date_of_birth` to dayjs object if exists
  const formattedInitValues = {
    ...initValues,
    date_of_birth: initValues?.date_of_birth 
      ? dayjs(initValues.date_of_birth, "YYYY-MM-DD", true) 
      : null,
  };

  // Load initial data khi component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [provincesRes, positionsRes] = await Promise.all([
          searchProvinces({}, 1, 1000),
          searchPositions({}, 1, 1000)
        ]);
        
        setProvinces(provincesRes?.data || []);
        setPositions(positionsRes?.data || []);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      loadInitialData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  // Set giá trị ban đầu cho tempProvinceCode và tempDistrictCode khi có initValues
  useEffect(() => {
    if (initValues?.provinces) {
      setTempProvinceCode(initValues.provinces);
    }
    if (initValues?.districts) {
      setTempDistrictCode(initValues.districts);
    }
  }, [initValues]);

  // Chuyển đổi tempProvinceCode sang province_id
  useEffect(() => {
    if (tempProvinceCode && provinces.length > 0) {
      const province = provinces.find(p => p.code === tempProvinceCode);
      setProvinceIdForForm(province ? province.id : null);
    } else {
      setProvinceIdForForm(null);
    }
  }, [tempProvinceCode, provinces]);

  // Chuyển đổi tempDistrictCode sang district_id
  useEffect(() => {
    if (tempDistrictCode && districts.length > 0) {
      const district = districts.find(d => d.code === tempDistrictCode);
      setDistrictIdForForm(district ? district.id : null);
    } else {
      setDistrictIdForForm(null);
    }
  }, [tempDistrictCode, districts]);

  // Load districts khi provinceIdForForm thay đổi
  useEffect(() => {
    const loadDistricts = async () => {
      if (!provinceIdForForm) {
        setDistricts([]);
        return;
      }

      try {
        const response = await searchDistricts(
          { province_id: provinceIdForForm }, 
          1, 
          1000
        );
        setDistricts(response?.data || []);
      } catch (error) {
        console.error("Error loading districts:", error);
        setDistricts([]);
      }
    };

    if (isAdmin) {
      loadDistricts();
    }
  }, [provinceIdForForm, isAdmin]);

  // Load transaction offices khi districtIdForForm thay đổi
  useEffect(() => {
    const loadTransactionOffices = async () => {
      if (!districtIdForForm) {
        setTransactionOffices([]);
        return;
      }

      try {
        const response = await searchTransactionOffices(
          { district_id: districtIdForForm }, 
          1, 
          1000
        );
        setTransactionOffices(response?.data || []);
      } catch (error) {
        console.error("Error loading transaction offices:", error);
        setTransactionOffices([]);
      }
    };

    if (isAdmin) {
      loadTransactionOffices();
    }
  }, [districtIdForForm, isAdmin]);

  const handleCancel = () => {
    // Reset form về giá trị ban đầu (initialValues)
    form.resetFields();
    // Reset temp codes
    setTempProvinceCode(initValues?.provinces || null);
    setTempDistrictCode(initValues?.districts || null);
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

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <>
      <Form
        form={form}
        onFinish={onSubmit}
        style={{ marginBottom: 10, maxWidth: (isAdmin) ? 1080 : 450 }}
        initialValues={formattedInitValues}
      >
        {isUpdate && (
          <div>
            <Form.Item name="id" style={{ display: "none" }}>
              <Input />
            </Form.Item>
            <Form.Item
              name="full_name"
              rules={[{ required: true, message: "Please enter your full name!" }]}
            >
              <Input placeholder="Họ và tên" />
            </Form.Item>
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please enter your username!" },
                { type: "text", message: "Username không hợp lệ" },
              ]}
            >
              <Input placeholder="Username" disabled={isUpdate} />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email!" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input placeholder="Email" />
            </Form.Item>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ marginRight: "16px" }}>
                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: "Please enter your phone!" },
                    {
                      pattern: /^0\d{9}$/,
                      message: "Số điện thoại không hợp lệ",
                    },
                  ]}
                >
                  <Input placeholder="Số điện thoại" />
                </Form.Item>
              </div>
              <div>
                <Form.Item name="date_of_birth">
                  <DatePicker placeholder="Ngày sinh" format={dateFormat} />
                </Form.Item>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ marginRight: "16px" }}>
                <Form.Item 
                  style={{ width: "140px" }}
                  name="gender"
                >
                  <Select placeholder="Giới tính" allowClear>
                    <Select.Option value="Nam">Nam</Select.Option>
                    <Select.Option value="Nữ">Nữ</Select.Option>
                    <Select.Option value="Khác">Khác</Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <div>
                <Form.Item 
                  name="is_active"
                  rules={[
                    { required: true, message: "Vui lòng chọn trạng thái!" },
                  ]}
                >
                  <Radio.Group style={{ display: "flex" }} disabled={isUpdate}>
                    <Radio value={true}>Kích hoạt</Radio>
                    <Radio value={false}>Vô hiệu hóa</Radio>
                  </Radio.Group>
                </Form.Item>
              </div>
            </div>
            <Form.Item
              name="address"
              rules={[
                { required: true, message: "Please enter your address!" },
              ]}
            >
              <TextArea rows={3} placeholder="Địa chỉ" />
            </Form.Item>
          </div>
        )}

        {isAdmin && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "24px" }}>
              {/* Tỉnh/Thành phố */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ minWidth: "120px" }}>Tỉnh/Thành phố <span style={{ color: "red" }}>*</span></div>
                <Form.Item name="provinces" style={{ flex: 1, marginBottom: 0 }}>
                  <Select 
                    placeholder="Tỉnh/Thành phố"
                    onChange={handleProvinceChange}
                  >
                    {(provinces || []).map((province) => (
                      <Select.Option key={province.code} value={province.code}>
                        {province.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              
              {/* Vị trí chức danh */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ minWidth: "100px" }}>Vị trí chức danh <span style={{ color: "red" }}>*</span></div>
                <Form.Item name="positions" className="multi-select-wrap" style={{ flex: 1, marginBottom: 0 }}>
                  <Select placeholder="Vị trí chức danh">
                    {(positions || []).map((position) => (
                      <Select.Option key={position.id} value={position.id}>
                        {position.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "24px" }}>
              {/* Quận/Huyện */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ minWidth: "120px" }}>Quận/Huyện <span style={{ color: "red" }}>*</span></div>
                <Form.Item name="districts" style={{ flex: 1, marginBottom: 0 }}>
                  <Select 
                    placeholder="Quận/Huyện"
                    onChange={handleDistrictChange}
                    disabled={!tempProvinceCode}
                  >
                    {(districts || []).map((district) => (
                      <Select.Option key={district.code} value={district.code}>
                        {district.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              
              {/* Điện thoại */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ minWidth: "100px" }}>Điện thoại <span style={{ color: "red" }}>*</span></div>
                <Form.Item name="phone" className="multi-select-wrap" style={{ flex: 1, marginBottom: 0 }}>
                  <Input placeholder="Điện thoại" />
                </Form.Item>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "24px" }}>
              {/* Phòng giao dịch */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ minWidth: "120px" }}>Phòng giao dịch <span style={{ color: "red" }}>*</span></div>
                <Form.Item name="transactionOffices" style={{ flex: 1, marginBottom: 0 }}>
                  <Select 
                    placeholder="Phòng giao dịch"
                    disabled={!tempProvinceCode && !tempDistrictCode}
                  >
                    {(transactionOffices || []).map((transactionOffice) => (
                      <Select.Option key={transactionOffice.code} value={transactionOffice.code}>
                        {transactionOffice.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              
              {/* Email */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ minWidth: "100px" }}>Email <span style={{ color: "red" }}>*</span></div>
                <Form.Item name="email" className="multi-select-wrap" style={{ flex: 1, marginBottom: 0 }}>
                  <Input placeholder="Email" />
                </Form.Item>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
              {/* Cột trái: Họ Tên, Username, Mật khẩu */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Họ Tên */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ minWidth: "120px" }}>Họ Tên <span style={{ color: "red" }}>*</span></div>
                  <Form.Item name="full_name" style={{ flex: 1, marginBottom: 0 }}>
                    <Input placeholder="Họ Tên"/>
                  </Form.Item>
                </div>
                
                {/* Username */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ minWidth: "120px" }}>Username <span style={{ color: "red" }}>*</span></div>
                  <Form.Item name="username" style={{ flex: 1, marginBottom: 0 }}>
                    <Input placeholder="Username" />
                  </Form.Item>
                </div>
                
                {/* Mật khẩu */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ minWidth: "120px" }}>Mật khẩu <span style={{ color: "red" }}>*</span></div>
                  <Form.Item name="password" style={{ flex: 1, marginBottom: 0 }}>
                    <Input.Password placeholder="Mật khẩu" />
                  </Form.Item>
                </div>
              </div>
              
              {/* Cột phải: Phân Quyền */}
              <div style={{ flex: 1, display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ minWidth: "100px" }}>Phân Quyền <span style={{ color: "red" }}>*</span></div>
                <Form.Item name="roles" className="multi-select-wrap" style={{ flex: 1, marginBottom: 0 }}>
                  <Select 
                    placeholder="Phân Quyền"
                    mode="multiple"
                    maxTagCount={undefined}
                  >
                    {(roles || []).map((role) => (
                      <Select.Option key={role.code} value={role.code}>
                        {role.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
          </div>
        )}

        {!isUpdate && !isAdmin && (
          <div>
            <Form.Item
              name="full_name"
              rules={[{ required: true, message: "Please enter your full name!" }]}
            >
              <Input placeholder="Họ và tên" />
            </Form.Item>
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please enter your username!" },
                { type: "text", message: "Username không hợp lệ" },
              ]}
            >
              <Input placeholder="Username" disabled={isUpdate} />
            </Form.Item>
            <Form.Item
              name="phone"
              rules={[
                { required: true, message: "Please enter your phone!" },
                {
                  pattern: /^0\d{9}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}
            >
              <Input placeholder="Số điện thoại" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: !isUpdate, message: "Please enter your password!" },
              ]}
              style={{ display: isUpdate && "none" }}
            >
              <Input.Password placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item
              name="rePassword"
              dependencies={["password"]}
              rules={[
                {
                  required: !isUpdate,
                  message: "Please enter your password again!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
              style={{ display: isUpdate && "none" }}
            >
              <Input.Password placeholder="Nhập lại mật khẩu" />
            </Form.Item>
          </div>
        )}

        {isUpdate && (
          <Button
            onClick={handleCancel}
            style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}
          >
            Hủy chỉnh sửa
          </Button>
        )}
        <Form.Item style={{ display: "flex", justifyContent: "flex-end" }}>
          <MyButton htmlType="submit">
            {submitButtonText}
          </MyButton>
        </Form.Item>
      </Form>
      
      <style>{`
        .multi-select-wrap .ant-select-multiple .ant-select-selector {
          height: auto !important;
          min-height: 32px !important;
        }
      `}</style>
    </>
  );
}