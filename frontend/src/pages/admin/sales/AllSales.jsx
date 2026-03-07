import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, Plus, Search, Eye } from "lucide-react";
import { getAllSales } from "../../../services/salesService";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDateTime } from "../../../utils/formatDate";
import Loader from "../../../components/common/Loader";

const AllSales = () => {
  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getAllSales()
      .then(data => { setSales(data); setFiltered(data); })
      .catch(() => setError("Failed to load sales."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(sales.filter(s =>
      s.bill_number.toLowerCase().includes(q) ||
      String(s.id).includes(q)
    ));
  }, [search, sales]);

  const totalRevenue = sales.reduce((sum, s) => sum + (s.grand_total || 0), 0);
  const totalGST = sales.reduce((sum, s) => sum + (s.gst_amount || 0), 0);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">All Sales</h1>
          <p className="text-gray-400 text-sm mt-0.5">{sales.length} bills generated</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-gray-400 text-xs mb-1">Total Bills</p>
          <p className="text-gray-800 font-bold text-2xl">{sales.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-gray-400 text-xs mb-1">Total Revenue</p>
          <p className="text-gray-800 font-bold text-2xl">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-gray-400 text-xs mb-1">Total GST Collected</p>
          <p className="text-gray-800 font-bold text-2xl">{formatCurrency(totalGST)}</p>
        </div>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search by bill number..."
          value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Receipt size={36} className="mb-3 opacity-30" />
            <p className="text-sm">{search ? "No bills match your search" : "No sales recorded yet"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">Bill No.</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Subtotal</th>
                  <th className="table-header">GST</th>
                  <th className="table-header">Grand Total</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/sales/${s.id}`)}>
                    <td className="table-cell text-gray-400 text-xs">{i + 1}</td>
                    <td className="table-cell">
                      <span className="font-mono text-sm font-semibold text-indigo-600">{s.bill_number}</span>
                    </td>
                    <td className="table-cell text-gray-500 text-sm">
                      {s.customer_id ? `#${s.customer_id}` : "Walk-in"}
                    </td>
                    <td className="table-cell text-gray-600 text-sm">{formatCurrency(s.total)}</td>
                    <td className="table-cell text-gray-500 text-sm">{formatCurrency(s.gst_amount)}</td>
                    <td className="table-cell">
                      <span className="font-semibold text-gray-800">{formatCurrency(s.grand_total)}</span>
                    </td>
                    <td className="table-cell text-gray-400 text-xs">{formatDateTime(s.created_at)}</td>
                    <td className="table-cell">
                      <button onClick={e => { e.stopPropagation(); navigate(`/admin/sales/${s.id}`); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllSales;