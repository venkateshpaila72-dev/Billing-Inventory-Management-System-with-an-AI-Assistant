import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ProfitTrendChart = ({ data = [] }) => {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: "10px", border: "1px solid #f0f0f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
          formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Profit"]}
        />
        <Area type="monotone" dataKey="total_profit" stroke="#10b981" strokeWidth={2}
          fill="url(#profitGradient)" name="Profit" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ProfitTrendChart;