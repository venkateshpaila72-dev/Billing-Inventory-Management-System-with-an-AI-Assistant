import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard, getRevenue, getTopProducts, getProfit } from "../../services/analyticsService";
import { getAllSales } from "../../services/salesService";
import TopProductsChart from "../../components/charts/TopProductsChart";
import Loader from "../../components/common/Loader";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";
import {
  TrendingUp, ShoppingBag, Package, Users,
  Bell, ArrowUpRight, AlertTriangle, IndianRupee,
  BarChart2, RefreshCw
} from "lucide-react";

const StatCard = ({ title, value, subtitle, icon: Icon, color, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? "cursor-pointer" : ""}`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      {onClick && <ArrowUpRight size={16} className="text-gray-300" />}
    </div>
    <p className="text-2xl font-bold text-gray-800 mb-0.5">{value}</p>
    <p className="text-sm font-medium text-gray-600">{title}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

const PeriodButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
      active ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
    }`}
  >
    {children}
  </button>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [profit, setProfit] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    try {
      const [dashData, revData, productsData, profitData, salesData] = await Promise.all([
        getDashboard(),
        getRevenue(period),
        getTopProducts(5),
        getProfit(period),
        getAllSales(),
      ]);
      setStats(dashData);
      setRevenue(revData);
      setTopProducts(productsData);
      setProfit(profitData);
      setRecentSales(salesData.slice(0, 8));
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [period]);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Overview</h1>
          <p className="text-sm text-gray-400 mt-0.5">Here is what is happening in your store today</p>
        </div>
        <button
          onClick={() => fetchData(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-gray-700 text-sm font-medium shadow-sm hover:shadow transition-all"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(stats.today_revenue)}
            subtitle={`${stats.today_sales} sales today`}
            icon={IndianRupee}
            color="bg-blue-600"
          />
          <StatCard
            title="Today's Profit"
            value={formatCurrency(stats.today_profit)}
            subtitle="Net profit after cost"
            icon={TrendingUp}
            color="bg-emerald-500"
          />
          <StatCard
            title="Low Stock"
            value={stats.low_stock_count}
            subtitle="Products need restock"
            icon={AlertTriangle}
            color={stats.low_stock_count > 0 ? "bg-orange-500" : "bg-gray-400"}
            onClick={() => navigate("/admin/inventory")}
          />
          <StatCard
            title="Notifications"
            value={stats.unread_notifications}
            subtitle="Unread alerts"
            icon={Bell}
            color={stats.unread_notifications > 0 ? "bg-red-500" : "bg-gray-400"}
            onClick={() => navigate("/admin/notifications")}
          />
        </div>
      )}

      {/* Second row stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Products"
            value={stats.total_products}
            subtitle="In inventory"
            icon={Package}
            color="bg-violet-500"
            onClick={() => navigate("/admin/inventory")}
          />
          <StatCard
            title="Active Staff"
            value={stats.total_staff}
            subtitle="Team members"
            icon={Users}
            color="bg-sky-500"
            onClick={() => navigate("/admin/staff")}
          />
          <StatCard
            title="Today's Sales"
            value={stats.today_sales}
            subtitle="Bills generated"
            icon={ShoppingBag}
            color="bg-pink-500"
            onClick={() => navigate("/admin/sales")}
          />
          <StatCard
            title="Analytics"
            value="View All"
            subtitle="Detailed reports"
            icon={BarChart2}
            color="bg-amber-500"
            onClick={() => navigate("/admin/analytics")}
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Revenue & Profit Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Revenue & Profit</h3>
            <div className="flex gap-1 bg-gray-50 rounded-lg p-1">
              {["daily", "weekly", "monthly", "yearly"].map(p => (
                <PeriodButton key={p} active={period === p} onClick={() => setPeriod(p)}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </PeriodButton>
              ))}
            </div>
          </div>
          {revenue && profit && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs text-blue-600 font-medium mb-1">Revenue</p>
                <p className="text-lg font-bold text-blue-700">{formatCurrency(revenue.grand_total)}</p>
                <p className="text-xs text-blue-400 mt-0.5">{revenue.total_sales} sales</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-xs text-emerald-600 font-medium mb-1">Profit</p>
                <p className="text-lg font-bold text-emerald-700">{formatCurrency(profit.total_profit)}</p>
                <p className="text-xs text-emerald-400 mt-0.5">{profit.profit_margin_percent}% margin</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 font-medium mb-1">Subtotal</p>
                <p className="text-lg font-bold text-gray-700">{formatCurrency(revenue.total_revenue)}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-xs text-orange-500 font-medium mb-1">GST Collected</p>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(revenue.total_gst)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Products Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Top Products</h3>
            <button
              onClick={() => navigate("/admin/inventory")}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              View All
            </button>
          </div>
          {topProducts.length > 0 ? (
            <TopProductsChart data={topProducts} />
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No sales data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-800">Recent Sales</h3>
          <button
            onClick={() => navigate("/admin/sales")}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          {recentSales.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No sales yet</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Bill No</th>
                  <th className="table-header">Staff ID</th>
                  <th className="table-header">Total</th>
                  <th className="table-header">GST</th>
                  <th className="table-header">Grand Total</th>
                  <th className="table-header">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr
                    key={sale.id}
                    onClick={() => navigate(`/admin/sales/${sale.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="table-cell">
                      <span className="font-medium text-blue-600">{sale.bill_number}</span>
                    </td>
                    <td className="table-cell text-gray-500">#{sale.staff_id}</td>
                    <td className="table-cell">{formatCurrency(sale.total)}</td>
                    <td className="table-cell text-orange-500">{formatCurrency(sale.gst_amount)}</td>
                    <td className="table-cell font-semibold text-gray-800">{formatCurrency(sale.grand_total)}</td>
                    <td className="table-cell text-gray-400">{formatDateTime(sale.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;