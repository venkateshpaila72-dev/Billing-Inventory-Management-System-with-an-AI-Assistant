import { useState, useEffect } from "react";
import { getDashboard, getRevenue, getTopProducts, getTopStaff, getProfit } from "../../../services/analyticsService";
import { formatCurrency } from "../../../utils/formatCurrency";
import TopProductsChart from "../../../components/charts/TopProductsChart";
import StaffPerformanceChart from "../../../components/charts/StaffPerformanceChart";
import SalesLineChart from "../../../components/charts/SalesLineChart";
import ProfitTrendChart from "../../../components/charts/ProfitTrendChart";
import Loader from "../../../components/common/Loader";
import { TrendingUp, ShoppingBag, Package, IndianRupee } from "lucide-react";

const periods = ["daily", "weekly", "monthly", "yearly"];

const PeriodSelector = ({ value, onChange }) => (
  <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
    {periods.map(p => (
      <button key={p} onClick={() => onChange(p)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
          value === p ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
        {p}
      </button>
    ))}
  </div>
);

const SalesAnalytics = () => {
  const [period, setPeriod] = useState("monthly");
  const [revenue, setRevenue] = useState(null);
  const [profit, setProfit] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [topStaff, setTopStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getRevenue(period),
      getProfit(period),
      getTopProducts(8),
      getTopStaff(8),
    ])
      .then(([rev, prof, prods, staff]) => {
        setRevenue(rev);
        setProfit(prof);
        setTopProducts(prods);
        setTopStaff(staff);
      })
      .catch(() => setError("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Analytics</h1>
          <p className="text-gray-400 text-sm mt-0.5">Store performance overview</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

      {/* Revenue & Profit Stats */}
      {revenue && profit && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <IndianRupee size={18} className="text-blue-600" />
            </div>
            <p className="text-gray-400 text-xs mb-1">Total Revenue</p>
            <p className="text-gray-800 font-bold text-xl">{formatCurrency(revenue.grand_total)}</p>
            <p className="text-gray-400 text-xs mt-1">{revenue.total_sales} bills</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
              <TrendingUp size={18} className="text-emerald-600" />
            </div>
            <p className="text-gray-400 text-xs mb-1">Total Profit</p>
            <p className="text-gray-800 font-bold text-xl">{formatCurrency(profit.total_profit)}</p>
            <p className="text-gray-400 text-xs mt-1">
              {profit.total_revenue > 0
                ? `${((profit.total_profit / profit.total_revenue) * 100).toFixed(1)}% margin`
                : "—"}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
              <ShoppingBag size={18} className="text-orange-500" />
            </div>
            <p className="text-gray-400 text-xs mb-1">GST Collected</p>
            <p className="text-gray-800 font-bold text-xl">{formatCurrency(revenue.total_gst)}</p>
            <p className="text-gray-400 text-xs mt-1">Tax amount</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
              <Package size={18} className="text-violet-600" />
            </div>
            <p className="text-gray-400 text-xs mb-1">Total Cost</p>
            <p className="text-gray-800 font-bold text-xl">{formatCurrency(profit.total_cost)}</p>
            <p className="text-gray-400 text-xs mt-1">Purchase cost</p>
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-gray-700 font-semibold text-sm mb-4">Revenue Trend</h2>
          <SalesLineChart data={revenue ? [revenue] : []} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-gray-700 font-semibold text-sm mb-4">Profit Trend</h2>
          <ProfitTrendChart data={profit ? [profit] : []} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-gray-700 font-semibold text-sm mb-4">Top Products by Sales</h2>
          {topProducts.length > 0 ? (
            <>
              <TopProductsChart data={topProducts} />
              <div className="mt-4 space-y-2">
                {topProducts.slice(0, 5).map((p, i) => (
                  <div key={p.product_id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs w-4">{i + 1}</span>
                      <span className="text-gray-700 font-medium">{p.product_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-xs">{p.total_quantity_sold} units</span>
                      <span className="text-gray-800 font-semibold">{formatCurrency(p.total_revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No sales data yet</div>
          )}
        </div>

        {/* Top Staff */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-gray-700 font-semibold text-sm mb-4">Staff Performance</h2>
          {topStaff.length > 0 ? (
            <>
              <StaffPerformanceChart data={topStaff} />
              <div className="mt-4 space-y-2">
                {topStaff.slice(0, 5).map((s, i) => (
                  <div key={s.staff_id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs w-4">{i + 1}</span>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {s.staff_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-700 font-medium">{s.staff_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-xs">{s.total_sales} sales</span>
                      <span className="text-gray-800 font-semibold">{formatCurrency(s.total_revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No staff data yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;