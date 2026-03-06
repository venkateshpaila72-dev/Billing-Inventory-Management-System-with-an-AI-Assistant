import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TopProductsChart = ({ data = [] }) => {
  const chartData = data.map(p => ({
    name: p.product_name.length > 12 ? p.product_name.substring(0, 12) + "..." : p.product_name,
    qty: p.total_quantity_sold,
    revenue: p.total_revenue,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: "10px", border: "1px solid #f0f0f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
          labelStyle={{ fontWeight: 600, color: "#374151" }}
        />
        <Bar dataKey="qty" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Qty Sold" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopProductsChart;