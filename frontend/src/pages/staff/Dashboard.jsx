import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, TrendingUp, ShoppingCart, ArrowRight } from "lucide-react";
import { getMySales } from "../../services/salesService";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/common/Loader";

const StaffDashboard = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getMySales()
      .then(setSales)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const todaySales = sales.filter(s => {
    const today = new Date().toDateString();
    return new Date(s.created_at).toDateString() === today;
  });

  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.grand_total || 0), 0);
  const totalRevenue = sales.reduce((sum, s) => sum + (s.grand_total || 0), 0);
  const recentSales = [...sales].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div>
        <h1 className="text-gray-800 font-bold text-2xl">Welcome, {user?.name || "Staff"}!</h1>
        <p className="text-gray-400 text-sm mt-0.5">Here's your sales summary</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">Today's Bills</p>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Receipt size={18} className="text-blue-500" />
            </div>
          </div>
          <p className="text-gray-800 font-bold text-3xl">{todaySales.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">Today's Revenue</p>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-emerald-500" />
            </div>
          </div>
          <p className="text-gray-800 font-bold text-3xl">{formatCurrency(todayRevenue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <ShoppingCart size={18} className="text-indigo-500" />
            </div>
          </div>
          <p className="text-gray-800 font-bold text-3xl">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => navigate("/staff/billing")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-5 text-left transition-colors">
          <Receipt size={24} className="mb-3" />
          <p className="font-bold text-lg">New Bill</p>
          <p className="text-indigo-200 text-sm mt-1">Start billing a customer</p>
        </button>
        <button onClick={() => navigate("/staff/sales")}
          className="bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl p-5 text-left transition-colors shadow-sm">
          <TrendingUp size={24} className="text-gray-600 mb-3" />
          <p className="font-bold text-lg text-gray-800">My Sales</p>
          <p className="text-gray-400 text-sm mt-1">View your sales history</p>
        </button>
      </div>

      {/* Recent sales */}
      {recentSales.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-gray-700 font-semibold text-sm">Recent Bills</h2>
            <button onClick={() => navigate("/staff/sales")}
              className="text-indigo-600 text-xs flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentSales.map(s => (
              <div key={s.id} onClick={() => navigate(`/staff/sales/${s.id}`)}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                <div>
                  <p className="font-mono text-sm font-semibold text-indigo-600">{s.bill_number}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{formatDateTime(s.created_at)}</p>
                </div>
                <p className="text-gray-800 font-semibold">{formatCurrency(s.grand_total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;