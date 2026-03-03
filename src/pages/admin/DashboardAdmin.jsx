import React, { useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ─── Data ────────────────────────────────────────────────────────────────────

const reportsData = [
  { time: "09:00", Waiting: 31, Serving: 11, Completed: 15 },
  { time: "10:30", Waiting: 40, Serving: 22, Completed: 11 },
  { time: "11:30", Waiting: 28, Serving: 35, Completed: 32 },
  { time: "12:30", Waiting: 51, Serving: 42, Completed: 18 },
  { time: "13:30", Waiting: 42, Serving: 56, Completed: 9 },
  { time: "14:30", Waiting: 82, Serving: 67, Completed: 24 },
  { time: "15:30", Waiting: 56, Serving: 41, Completed: 11 },
];

const recentSales = [
  { id: "#2457", customer: "Brandon Jacob", product: "At praesentium minu", price: "$64", status: "Approved", badge: "approved" },
  { id: "#2147", customer: "Bridie Kessler", product: "Blanditiis dolor omnis similique", price: "$47", status: "Pending", badge: "pending" },
  { id: "#2049", customer: "Ashleigh Langosh", product: "At recusandae consectetur", price: "$147", status: "Approved", badge: "approved" },
  { id: "#2644", customer: "Angus Grady", product: "Ut voluptatem id earum et", price: "$67", status: "Rejected", badge: "rejected" },
  { id: "#2645", customer: "Raheem Lehner", product: "Sunt similique distinctio", price: "$165", status: "Approved", badge: "approved" },
];

const topSelling = [
  { emoji: "👟", name: "Ut inventore ipsa voluptas nulla", price: "$64", sold: 124, revenue: "$5,828" },
  { emoji: "👜", name: "Exercitationem similique doloremque", price: "$46", sold: 98, revenue: "$4,508" },
  { emoji: "🧴", name: "Doloribus nisi exercitationem", price: "$59", sold: 74, revenue: "$4,366" },
  { emoji: "🕶️", name: "Officiis quaerat sint rerum error", price: "$32", sold: 63, revenue: "$2,016" },
  { emoji: "🎧", name: "Sit unde debitis delectus repellendus", price: "$79", sold: 41, revenue: "$3,239" },
];

// ─── Filter Dropdown ──────────────────────────────────────────────────────────

function FilterDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#aaa",
          fontSize: 20,
          padding: "2px 6px",
          borderRadius: 4,
          lineHeight: 1,
        }}
        title="Filter"
      >
        ···
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "110%",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            minWidth: 140,
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px 16px 6px",
              color: "#aaa",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Filter
          </div>
          {["Today", "This Month", "This Year"].map((item) => (
            <div
              key={item}
              onClick={() => setOpen(false)}
              style={{
                padding: "9px 16px",
                cursor: "pointer",
                fontSize: 14,
                color: "#333",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Info Card ───────────────────────────────────────────────────────────────

function InfoCard({ title, span, icon, value, changePercent, changeType, accentColor, bgColor }) {
  return (
    <div style={{ flex: "1 1 200px", minWidth: 200 }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "20px 24px",
          position: "relative",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <FilterDropdown />
        <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 14 }}>
          {title} <span style={{ color: "#aaa", fontWeight: 400 }}>| {span}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              color: accentColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#222", lineHeight: 1.2 }}>{value}</div>
            <div style={{ marginTop: 4, fontSize: 13 }}>
              <span style={{ color: changeType === "waiting" ? "#ff771d" : changeType === "serving" ? "#4154f1" : changeType === "completed" ? "#2eca6a" : "#e74c3c", fontWeight: 700 }}>
                {changePercent}
              </span>{" "}
              <span style={{ color: "#888" }}>{changeType}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reports Chart ────────────────────────────────────────────────────────────

function ReportsChart() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "20px 24px",
        position: "relative",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <FilterDropdown />
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>
        Biểu đồ <span style={{ color: "#aaa", fontWeight: 400 }}>/Today</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={reportsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {[
              { id: "colorWaiting", color: "#ff771d" },
              { id: "colorServing", color: "#4154f1" },
              { id: "colorCompleted", color: "#27ae60" },
            ].map(({ id, color }) => (
              <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0.03} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="Waiting" stroke="#ff771d" strokeWidth={2} fill="url(#colorWaiting)" dot={{ r: 4, fill: "#ff771d" }} />
          <Area type="monotone" dataKey="Serving" stroke="#4154f1" strokeWidth={2} fill="url(#colorServing)" dot={{ r: 4, fill: "#4154f1" }} />
          <Area type="monotone" dataKey="Completed" stroke="#27ae60" strokeWidth={2} fill="url(#colorCompleted)" dot={{ r: 4, fill: "#27ae60" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Waiting ─────────────────────────────────────────────────────────────

const badgeStyle = {
  approved: { background: "#2eca6a", color: "#fff" },
  pending: { background: "#ffc107", color: "#fff" },
  rejected: { background: "#e74c3c", color: "#fff" },
};

function WaitingTable() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "20px 24px",
        position: "relative",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        overflowX: "auto",
      }}
    >
      <FilterDropdown />
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>
        Đang đợi <span style={{ color: "#aaa", fontWeight: 400 }}>| Today</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
              <th style={{ textAlign: "left", padding: "8px 12px", color: "#555", fontWeight: 700 }}>
                #
              </th>
              <th style={{ textAlign: "left", padding: "8px 12px", color: "#555", fontWeight: 700 }}>
                Customer
              </th>
              <th style={{ textAlign: "left", padding: "8px 12px", color: "#555", fontWeight: 700 }}>
                Product
              </th>
              <th style={{ textAlign: "left", padding: "8px 12px", color: "#555", fontWeight: 700 }}>
                Price
              </th>
              <th style={{ textAlign: "center", padding: "8px 12px", color: "#555", fontWeight: 700 }}>
                Status
              </th>
          </tr>
        </thead>
        <tbody>
          {recentSales.map((sale, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f9f9f9" }}>
              <td style={{ padding: "12px 12px", color: "#4154f1", fontWeight: 600 }}>{sale.id}</td>
              <td style={{ padding: "12px 12px", color: "#333" }}>{sale.customer}</td>
              <td style={{ padding: "12px 12px", color: "#4154f1" }}>{sale.product}</td>
              <td style={{ padding: "12px 12px", color: "#333" }}>{sale.price}</td>
              <td style={{ padding: "12px 12px", textAlign: "center" }}>
                <span
                  style={{
                    ...badgeStyle[sale.badge],
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {sale.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Serving ──────────────────────────────────────────────────────────────

function ServingTable() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "20px 24px",
        position: "relative",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        overflowX: "auto",
      }}
    >
      <FilterDropdown />
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>
        Đang phục vụ <span style={{ color: "#aaa", fontWeight: 400 }}>| Today</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
            {["Preview", "Product", "Price", "Sold", "Revenue"].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#555", fontWeight: 700 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {topSelling.map((item, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f9f9f9" }}>
              <td style={{ padding: "12px 12px" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  {item.emoji}
                </div>
              </td>
              <td style={{ padding: "12px 12px", color: "#4154f1", fontWeight: 600 }}>{item.name}</td>
              <td style={{ padding: "12px 12px", color: "#333" }}>{item.price}</td>
              <td style={{ padding: "12px 12px", fontWeight: 700 }}>{item.sold}</td>
              <td style={{ padding: "12px 12px", color: "#333" }}>{item.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardAdmin() {
  return (
    <div>
      <div style={{ margin: "0 auto" }}>
        {/* Page Title */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 500, color: "#222" }}>Dashboard</h2>
          <nav style={{ marginTop: 4, fontSize: 13, color: "#888" }}>
            <a href="/admin" style={{ color: "#303134", textDecoration: "none" }}>Home</a>
            {" / "}
            <span>Dashboard</span>
          </nav>
        </div>

        {/* Info Cards */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
          <InfoCard title="Đang đợi" span="Today" icon="⏳" value="145" changePercent="12%" changeType="waiting" accentColor="#ff771d" bgColor="#fff1e8" />
          <InfoCard title="Đang phục vụ" span="Today" icon="🤝" value="112" changePercent="12%" changeType="serving" accentColor="#4154f1" bgColor="#eef0fd" />
          <InfoCard title="Hoàn thành" span="This Month" icon="✅" value="3,264" changePercent="8%" changeType="completed" accentColor="#2eca6a" bgColor="#e8f9ef" />
          <InfoCard title="Đã hủy" span="This Year" icon="❌" value="244" changePercent="12%" changeType="cancelled" accentColor="#ff4144" bgColor="#ffe8e8" />
        </div>

        {/* Reports Chart */}
        <div style={{ marginBottom: 20 }}>
          <ReportsChart />
        </div>

        {/* Waiting Table */}
        <div style={{ marginBottom: 20 }}>
          <WaitingTable />
        </div>

        {/* Serving Table */}
        <div style={{ marginBottom: 20 }}>
          <ServingTable />
        </div>
      </div>
    </div>
  );
}