import { useState, useEffect } from "react";
import { getProfit, getRevenue } from "../../../services/analyticsService";
import { formatCurrency } from "../../../utils/formatCurrency";
import ProfitTrendChart from "../../../components/charts/ProfitTrendChart";
import Loader from "../../../components/common/Loader";
import { TrendingUp, TrendingDown, IndianRupee, Package } from "lucide-react";

const periods = ["daily", "weekly", "monthly", "yearly"];

const ProfitAnalytics = () => {
  const [period, setPeriod] = useState("monthly");
  const [profit, setProfit] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([getProfit(period), getRevenue(period)])
      .then(([prof, rev]) => { setProfit(prof); setRevenue(rev); })
      .catch(() => setError("Failed to load profit data."))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <Loader fullScreen />;

  const margin = profit && profit.total_revenue > 0
    ? ((profit.total_profit / profit.total_revenue) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Profit Analytics</h1>
          <p className="text-gray-400 text-sm mt-0.5">Revenue vs cost breakdown</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                period === p ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

      {profit && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                <TrendingUp size={18} className="text-emerald-600" />
              </div>
              <p className="text-gray-400 text-xs mb-1">Net Profit</p>
              <p className="text-emerald-600 font-bold text-xl">{formatCurrency(profit.total_profit)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <IndianRupee size={18} className="text-blue-600" />
              </div>
              <p className="text-gray-400 text-xs mb-1">Total Revenue</p>
              <p className="text-blue-600 font-bold text-xl">{formatCurrency(profit.total_revenue)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                <TrendingDown size={18} className="text-red-500" />
              </div>
              <p className="text-gray-400 text-xs mb-1">Total Cost</p>
              <p className="text-red-500 font-bold text-xl">{formatCurrency(profit.total_cost)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
                <Package size={18} className="text-violet-600" />
              </div>
              <p className="text-gray-400 text-xs mb-1">Profit Margin</p>
              <p className="text-violet-600 font-bold text-xl">{margin}%</p>
            </div>
          </div>

          {/* Profit breakdown bar */}
          {profit.total_revenue > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-gray-700 font-semibold text-sm mb-4">Revenue Breakdown</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Cost ({((profit.total_cost / profit.total_revenue) * 100).toFixed(1)}%)</span>
                    <span>{formatCurrency(profit.total_cost)}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full"
                      style={{ width: `${Math.min((profit.total_cost / profit.total_revenue) * 100, 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Profit ({margin}%)</span>
                    <span>{formatCurrency(profit.total_profit)}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${Math.min(parseFloat(margin), 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-gray-700 font-semibold text-sm mb-4">Profit Trend</h2>
            <ProfitTrendChart data={[profit]} />
          </div>
        </>
      )}
    </div>
  );
};

export default ProfitAnalytics;