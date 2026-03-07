import { useState, useEffect } from "react";
import { getAllSales } from "../../../services/salesService";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDateTime } from "../../../utils/formatDate";
import { Users, ShoppingBag, UserCheck, TrendingUp } from "lucide-react";
import Loader from "../../../components/common/Loader";

const CustomerAnalytics = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllSales()
      .then(data => setSales(data))
      .catch(() => setError("Failed to load customer data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen />;

  // Derive customer stats from sales
  const salesWithCustomer = sales.filter(s => s.customer);
  const salesWithoutCustomer = sales.filter(s => !s.customer);

  const genderCounts = salesWithCustomer.reduce((acc, s) => {
    const g = s.customer?.gender || "unknown";
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});

  const ageBuckets = { "Under 18": 0, "18–30": 0, "31–45": 0, "46–60": 0, "60+": 0, "Unknown": 0 };
  salesWithCustomer.forEach(s => {
    const age = s.customer?.age;
    if (!age) { ageBuckets["Unknown"]++; }
    else if (age < 18) ageBuckets["Under 18"]++;
    else if (age <= 30) ageBuckets["18–30"]++;
    else if (age <= 45) ageBuckets["31–45"]++;
    else if (age <= 60) ageBuckets["46–60"]++;
    else ageBuckets["60+"]++;
  });

  const avgSpend = salesWithCustomer.length > 0
    ? salesWithCustomer.reduce((sum, s) => sum + s.grand_total, 0) / salesWithCustomer.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-800 font-bold text-2xl">Customer Analytics</h1>
        <p className="text-gray-400 text-sm mt-0.5">Insights from customer sales data</p>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <ShoppingBag size={18} className="text-blue-600" />
          </div>
          <p className="text-gray-400 text-xs mb-1">Total Sales</p>
          <p className="text-gray-800 font-bold text-xl">{sales.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
            <UserCheck size={18} className="text-emerald-600" />
          </div>
          <p className="text-gray-400 text-xs mb-1">With Customer Info</p>
          <p className="text-gray-800 font-bold text-xl">{salesWithCustomer.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
            <Users size={18} className="text-violet-600" />
          </div>
          <p className="text-gray-400 text-xs mb-1">Walk-in (No Info)</p>
          <p className="text-gray-800 font-bold text-xl">{salesWithoutCustomer.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            <TrendingUp size={18} className="text-amber-600" />
          </div>
          <p className="text-gray-400 text-xs mb-1">Avg Spend (w/ info)</p>
          <p className="text-gray-800 font-bold text-xl">{formatCurrency(avgSpend)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Gender breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-gray-700 font-semibold text-sm mb-4">Sales by Gender</h2>
          {Object.keys(genderCounts).length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No customer gender data</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(genderCounts).map(([gender, count]) => {
                const pct = salesWithCustomer.length > 0 ? ((count / salesWithCustomer.length) * 100).toFixed(1) : 0;
                const colors = { male: "bg-blue-500", female: "bg-pink-500", other: "bg-violet-500", unknown: "bg-gray-400" };
                return (
                  <div key={gender}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span className="capitalize">{gender}</span>
                      <span>{count} sales ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[gender] || "bg-gray-400"}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Age breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-gray-700 font-semibold text-sm mb-4">Sales by Age Group</h2>
          {salesWithCustomer.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No customer age data</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(ageBuckets).filter(([, v]) => v > 0).map(([bucket, count]) => {
                const pct = salesWithCustomer.length > 0 ? ((count / salesWithCustomer.length) * 100).toFixed(1) : 0;
                return (
                  <div key={bucket}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{bucket}</span>
                      <span>{count} sales ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent sales with customer info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="text-gray-700 font-semibold text-sm">Recent Sales with Customer Info</h2>
        </div>
        <div className="overflow-x-auto">
          {salesWithCustomer.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No customer data recorded yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Bill No</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header">Age</th>
                  <th className="table-header">Gender</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Date</th>
                </tr>
              </thead>
              <tbody>
                {salesWithCustomer.slice(0, 20).map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-mono text-sm font-semibold text-indigo-600">{s.bill_number}</td>
                    <td className="table-cell text-gray-600 text-sm">{s.customer?.phone || "—"}</td>
                    <td className="table-cell text-gray-600 text-sm">{s.customer?.age || "—"}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        s.customer?.gender === "male" ? "bg-blue-50 text-blue-600"
                        : s.customer?.gender === "female" ? "bg-pink-50 text-pink-600"
                        : "bg-gray-100 text-gray-500"}`}>
                        {s.customer?.gender || "—"}
                      </span>
                    </td>
                    <td className="table-cell font-semibold text-gray-800">{formatCurrency(s.grand_total)}</td>
                    <td className="table-cell text-gray-400 text-xs">{formatDateTime(s.created_at)}</td>
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

export default CustomerAnalytics;