import { Breadcrumb, Button, Select, Spin, message } from "antd";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { searchCounters } from "../../api/counter";
import { updateUserCounter, getMyInfo } from "../../api/user";
import { getToken } from "../../services/localStorageService";

function SettingUser() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const myInfo = useSelector((state) => state.user);
  
  const [counters, setCounters] = useState([]);
  const [selectedCounterId, setSelectedCounterId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load danh sách counter khi component mount
  useEffect(() => {
    loadCounters();
    
    // Set counter hiện tại của user (nếu có)
    if (myInfo?.counter?.id) {
      setSelectedCounterId(myInfo.counter.id);
    }
  }, [myInfo?.transaction_offices]);

  // Hàm load danh sách counter theo transaction_office của user
  const loadCounters = async () => {
    try {
      setLoading(true);
      
      // Lấy transaction_office_id đầu tiên của user
      const transactionOfficeId = myInfo?.transaction_offices?.[0]?.id;
      
      if (!transactionOfficeId) {
        // message.warning("Bạn chưa được gán chi nhánh!");
        return;
      }

      // Gọi API search counters với filter theo transaction_office_id và is_active = true
      const result = await searchCounters(
        { 
          transaction_office_id: transactionOfficeId,
          is_active: true // Chỉ lấy counter đang hoạt động
        },
        1,
        100 // Lấy tối đa 100 counter
      );

      if (result?.data) {
        setCounters(result.data);
      }
    } catch (error) {
      console.error("Load counters error:", error);
      message.error("Không thể tải danh sách quầy!");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi thay đổi counter
  const handleCounterChange = (value) => {
    setSelectedCounterId(value);
  };

  // Hàm lưu counter
  const handleSave = async () => {
    try {
      setSaving(true);

      // Gọi API update counter cho user
      await updateUserCounter(myInfo.id, selectedCounterId);

      // Reload thông tin user để cập nhật UI
      const token = getToken();
      if (token) {
        await dispatch(getMyInfo(token, true)); // forceReload = true
      }

      message.success("Cập nhật quầy thành công!");
      
      // Navigate về trang /user sau khi lưu thành công
      navigate("/user");
    } catch (error) {
      console.error("Save counter error:", error);
      // message.error đã được xử lý trong updateUserCounter
      setSaving(false);
    }
  };

  // Format options cho Select
  const counterOptions = counters.map(counter => ({
    value: counter.id,
    label: `${counter.name}`,
  }));

  return (
    <>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/user">User</Link> },
          { title: <Link to="/user/settings">Cấu hình</Link> },
          { title: "Cấu hình quầy" },
        ]}
      />

      <div>
        <table className="table">
          <tbody>
            <tr>
              <td className="w-50">
                <span style={{ fontWeight: "bold", paddingLeft: "1.4rem", paddingRight: "7.12rem" }}>
                  Họ tên:
                </span>
                <span>{myInfo.full_name}</span>
              </td>
              <td className="w-50">
                <span style={{ fontWeight: "bold", paddingLeft: "1.4rem", paddingRight: "7.12rem" }}>
                  Mã quầy:
                </span>
                <span>{myInfo?.counter?.code || "Chưa chọn quầy"}</span>
              </td>
            </tr>
            <tr>
              <td className="w-50">
                <span style={{ fontWeight: "bold", padding: "0 1.4rem" }}>
                  Tài khoản đăng nhập:
                </span>
                <span>{myInfo.username}</span>
              </td>
              <td className="w-50">
                <span style={{ fontWeight: "bold", paddingLeft: "1.4rem", paddingRight: "5.18rem" }}>
                  Mã chi nhánh:
                </span>
                <span>
                  {myInfo?.transaction_offices?.[0]?.code || "Chưa chọn chi nhánh"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: "20px" }}>
          <span style={{ fontWeight: "bold", paddingLeft: "2rem", paddingRight: "5.58rem" }}>
            Chọn quầy:
          </span>
          <Select
            style={{ width: "280px" }}
            placeholder="Chọn quầy"
            allowClear
            showSearch
            value={selectedCounterId}
            onChange={handleCounterChange}
            options={counterOptions}
            loading={loading}
            disabled={loading || counters.length === 0}
            notFoundContent={loading ? <Spin size="small" /> : "Không có quầy nào"}
          />
        </div>

        <div style={{ marginTop: "3rem", marginLeft: "2rem" }}>
          <Button
            type="primary"
            onClick={handleSave}
            loading={saving}
            disabled={selectedCounterId === myInfo?.counter?.id}
          >
            Lưu
          </Button>
        </div>
      </div>
    </>
  );
}

export default SettingUser;