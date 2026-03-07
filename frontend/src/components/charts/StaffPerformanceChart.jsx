import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../../utils/formatCurrency";

const StaffPerformanceChart = ({ data = [] }) => {
  const chartData = data.map(s => ({
    name: s.staff_name.length > 10 ? s.staff_name.substring(0, 10) + "..." : s.staff_name,
    sales: s.total_sales,
    revenue: s.total_revenue,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: "10px", border: "1px solid #f0f0f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
          formatter={(value, name) => [
            name === "revenue" ? formatCurrency(value) : value,
            name === "revenue" ? "Revenue" : "Sales"
          ]}
        />
        <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} name="sales" />
        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="revenue" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StaffPerformanceChart;