import {
  SearchOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import { Link } from "react-router-dom";
import { searchTransaction } from "../../api/transaction";
import { searchTransactionOffices } from "../../api/transaction_office";
import { searchPositions } from "../../api/position";
import { MdCloudDownload } from "react-icons/md";

dayjs.extend(customParseFormat);
dayjs.extend(duration);

const { Text } = Typography;
const { Option } = Select;

// Format thời gian HH:mm:ss
const formatTime = (timeString) => {
  if (!timeString) return "N/A";
  return timeString;
};

// Format ngày DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return dayjs(dateString).format("DD/MM/YYYY");
};

const ReportAdmin = () => {
  const [form] = Form.useForm();

  const [transactionData, setTransactionData] = useState({
    data: [],
    totalElements: 0,
    totalPage: 0,
    currentPage: 1,
    pageSize: 10,
  });

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Dropdown data
  const [transactionOffices, setTransactionOffices] = useState([]);
  const [positions, setPositions] = useState([]);
  const [officesLoading, setOfficesLoading] = useState(false);
  const [positionsLoading, setPositionsLoading] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    ticket_code: "",
    print_date_from: "",
    print_date_to: "",
    transaction_office_code: "",
    position_code: "",
  });

  // Load all transaction offices và positions khi mount
  useEffect(() => {
    const loadDropdownData = async () => {
      // Load tất cả transaction offices
      setOfficesLoading(true);
      try {
        const result = await searchTransactionOffices({ is_active: true }, 1, 1000);
        setTransactionOffices(result.data || []);
      } catch (error) {
        console.error("Error loading transaction offices:", error);
      } finally {
        setOfficesLoading(false);
      }

      // Load positions
      setPositionsLoading(true);
      try {
        const result = await searchPositions({ is_active: true }, 1, 1000);
        setPositions(result.data || []);
      } catch (error) {
        console.error("Error loading positions:", error);
      } finally {
        setPositionsLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  const fetchData = async (page = 1, activeFilters = filters) => {
    setLoading(true);
    try {
      const result = await searchTransaction(
        {
          ...activeFilters,
          status: "completed",
        },
        page,
        pageSize
      );
      if (result) {
        setTransactionData(result);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      message.error("Không thể tải danh sách giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const handleSearch = () => {
    const values = form.getFieldsValue();

    const newFilters = {
      ticket_code: values.ticket_code || "",
      print_date_from: values.print_date_from
        ? values.print_date_from.format("YYYY-MM-DD")
        : "",
      print_date_to: values.print_date_to
        ? values.print_date_to.format("YYYY-MM-DD")
        : "",
      transaction_office_code: values.transaction_office_code || "",
      position_code: values.position_code || "",
    };

    setFilters(newFilters);
    setCurrentPage(1);
    fetchData(1, newFilters);
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 55,
      align: "center",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Phòng giao dịch",
      key: "transaction_office",
      align: "center",
      render: (_, record) => (
        <Text>{record?.user?.transaction_offices?.[0]?.name || "N/A"}</Text>
      ),
    },
    {
      title: "Quầy",
      key: "counter",
      align: "center",
      render: (_, record) => (
        <Text>{record.counter?.name || record.counter_id || "N/A"}</Text>
      ),
    },
    {
      title: "Nhân viên",
      key: "user",
      align: "center",
      render: (_, record) => (
        <Text>{record.user?.full_name || record.user_id || "N/A"}</Text>
      ),
    },
    {
      title: "Chức danh",
      key: "position",
      align: "center",
      render: (_, record) => (
        <Text>{record.user?.position?.name || "N/A"}</Text>
      ),
    },
    {
      title: "Dịch vụ",
      key: "service",
      align: "center",
      render: (_, record) => (
        <Text>{record.service?.name_vi || "N/A"}</Text>
      ),
    },
    {
      title: "Số vé",
      key: "ticket_code",
      align: "center",
      render: (_, record) => (
        <Text strong>{record.ticket_code || "N/A"}</Text>
      ),
    },
    {
      title: "Loại vé",
      key: "ticket_type",
      align: "center",
      render: (_, record) => (
        <Tag color={record.ticket_type === "Online" ? "blue" : "default"}>
          {record.ticket_type || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Ngày in vé",
      key: "print_date",
      align: "center",
      render: (_, record) => formatDate(record.print_date),
    },
    {
      title: "Giờ in vé",
      key: "print_time",
      align: "center",
      render: (_, record) => formatTime(record.print_time),
    },
    {
      title: "Gọi lúc",
      key: "call_time",
      align: "center",
      render: (_, record) => formatTime(record.call_time),
    },
    {
      title: "Giờ kết thúc",
      key: "end_time",
      align: "center",
      render: (_, record) => formatTime(record.end_time),
    },
    {
      title: "Trạng thái",
      key: "status",
      align: "center",
      render: () => <Tag color="success">Hoàn thành</Tag>,
    },
  ];

  return (
    <>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/admin">Admin</Link> },
          { title: "Báo cáo giao dịch hoàn thành" },
        ]}
      />

      <div
        className="d-flex justify-content-between align-items-center"
        style={{ marginBottom: 16 }}
      >
        {/* Nút tải xuống */}
        <Space>
          <Button
            title="Tải xuống"
            type="primary"
            icon={<MdCloudDownload />}
            // onClick={handleDownload}
          />
        </Space>

        {/* Filter */}
        <Form form={form} layout="inline">
          <Form.Item name="ticket_code" label="Số vé">
            <Input
              placeholder="Số vé"
              style={{ width: 96 }}
              allowClear
            />
          </Form.Item>

          <Form.Item name="print_date_from" label="Từ ngày">
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="dd/mm/yyyy"
              style={{ width: 124 }}
            />
          </Form.Item>

          <Form.Item name="print_date_to" label="đến">
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="dd/mm/yyyy"
              style={{ width: 124 }}
            />
          </Form.Item>

          <Form.Item name="transaction_office_code" label="PGD">
            <Select
              placeholder="Phòng giao dịch"
              style={{ width: 174 }}
              allowClear
              showSearch
              loading={officesLoading}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {transactionOffices.map((office) => (
                <Option key={office.code} value={office.code}>
                  {office.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="position_code" label="Chức danh">
            <Select
              placeholder="Chức danh"
              style={{ width: 140 }}
              allowClear
              showSearch
              loading={positionsLoading}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {positions.map((pos) => (
                <Option key={pos.code} value={pos.code}>
                  {pos.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              title="Tìm kiếm"
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            />
          </Form.Item>
        </Form>
      </div>

      <Table
        dataSource={transactionData.data || []}
        columns={columns}
        rowKey="id"
        pagination={false}
        loading={loading}
        bordered
        size="small"
        className="custom-header-table"
        style={{ marginBottom: 16 }}
        scroll={{ x: "max-content" }}
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
          total={transactionData.totalElements || 0}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      <style>{`
        .custom-header-table .ant-table-thead > tr > th {
          background-color: #1890ff !important;
          color: #fff !important;
          text-align: center !important;
          white-space: nowrap;
        }
        .ant-table-cell {
          white-space: nowrap;
        }
      `}</style>
    </>
  );
};

export default ReportAdmin;