import { Button, Form, Input, message } from "antd";
import { useOutletContext } from "react-router-dom";
import { changePassword, setPassword } from "../../api/password";
import MyButton from "../../components/MyButton";
import { useState } from "react";

export default function MyPassword() {
  const { userDetails } = useOutletContext();
  const [formSet] = Form.useForm();
  const [formChange] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    formSet.resetFields();
    formChange.resetFields();
  };

  const handleChangePassword = async (values) => {
    // Validation ở client (optional - server cũng validate)
    if (values.newPassword !== values.reNewPassword) {
      message.error("Nhập lại mật khẩu không khớp!");
      return;
    }

    if (values.newPassword === values.oldPassword) {
      message.error("Mật khẩu mới phải khác mật khẩu cũ!");
      return;
    }

    setIsSubmitting(true);

    try {
      const body = {
        currentPassword: values.oldPassword,
        newPassword: values.newPassword
      };

      await changePassword(body);
      
      // ✅ Chỉ chạy khi thành công
      formChange.resetFields();
      // message.success("Đổi mật khẩu thành công!");
    } catch (error) {
      // ✅ Hiển thị lỗi
      message.error(error.message || "Có lỗi xảy ra khi đổi mật khẩu!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPassword = async (values) => {
    if (values.password !== values.rePassword) {
      message.error("Nhập lại mật khẩu không khớp!");
      return;
    }

    setIsSubmitting(true);

    try {
      const body = {
        password: values.password,
      };

      await setPassword(body);
      
      // ✅ Chỉ chạy khi thành công
      message.success("Tạo mật khẩu thành công!");
      
      // Reload sau khi set password thành công
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      // ✅ Hiển thị lỗi
      message.error(error.message || "Có lỗi xảy ra khi tạo mật khẩu!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h3 style={{ marginBottom: 5 }}>Mật Khẩu Và Bảo Mật</h3>

      {/* {userDetails.has_password ? ( */}
        <>
          <p style={{ marginBottom: 20 }}>Đổi mật khẩu</p>

          <Form
            form={formChange}
            onFinish={handleChangePassword}
            style={{ marginBottom: 10, maxWidth: 350 }}
          >
            <Form.Item
              name="oldPassword"
              rules={[
                { required: true, message: "Please enter your old password!" },
              ]}
            >
              <Input.Password placeholder="Mật khẩu cũ" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: "Please enter your new password!",
                },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
                }
              ]}
            >
              <Input.Password placeholder="Mật khẩu mới" />
            </Form.Item>

            <Form.Item
              name="reNewPassword"
              dependencies={["newPassword"]}
              rules={[
                {
                  required: true,
                  message: "Please enter your new password again!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("New password do not match!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Nhập lại mật khẩu mới" />
            </Form.Item>

            <Button
              onClick={handleCancel}
              style={{ width: "100%", marginBottom: 10 }}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Form.Item>
              <MyButton 
                style={{ width: "100%" }} 
                htmlType="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </MyButton>
            </Form.Item>
          </Form>
        </>
      {/* ) : (
        <>
          <p style={{ marginBottom: 20 }}>Bạn chưa có mật khẩu? Tạo ngay</p>

          <Form
            form={formSet}
            onFinish={handleSetPassword}
            style={{ marginBottom: 10, maxWidth: 350 }}
          >
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter your password!" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
                }
              ]}
            >
              <Input.Password placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item
              name="rePassword"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Please enter your password again!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Passwords do not match!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Nhập lại mật khẩu" />
            </Form.Item>

            <Button
              onClick={handleCancel}
              style={{ width: "100%", marginBottom: 10 }}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Form.Item>
              <MyButton 
                style={{ width: "100%" }} 
                htmlType="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </MyButton>
            </Form.Item>
          </Form> */}
        {/* </>
      )} */}
    </>
  );
}