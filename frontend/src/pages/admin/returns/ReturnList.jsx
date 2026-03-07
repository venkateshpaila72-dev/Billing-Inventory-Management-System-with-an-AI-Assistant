import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, Plus, Search } from "lucide-react";
import { getAllReturns } from "../../../services/returnService";
import { getAllProducts } from "../../../services/productService";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDateTime } from "../../../utils/formatDate";
import Loader from "../../../components/common/Loader";

const ReturnList = () => {
  const [returns, setReturns] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getAllReturns(), getAllProducts()])
      .then(([ret, prods]) => {
        setReturns(ret);
        setFiltered(ret);
        const map = {};
        prods.forEach(p => { map[p.id] = p.name; });
        setProductMap(map);
      })
      .catch(() => setError("Failed to load returns."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(returns.filter(r =>
      String(r.sale_id).includes(q) ||
      (productMap[r.product_id] || "").toLowerCase().includes(q)
    ));
  }, [search, returns, productMap]);

  const totalRefund = returns.reduce((sum, r) => sum + (r.refund_amount || 0), 0);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Returns</h1>
          <p className="text-gray-400 text-sm mt-0.5">{returns.length} return{returns.length !== 1 ? "s" : ""} processed</p>
        </div>
        <button onClick={() => navigate("/admin/returns/process")}
          className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Process Return
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-gray-400 text-xs mb-1">Total Returns</p>
          <p className="text-gray-800 font-bold text-2xl">{returns.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-gray-400 text-xs mb-1">Total Refunded</p>
          <p className="text-gray-800 font-bold text-2xl">{formatCurrency(totalRefund)}</p>
        </div>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search by product or sale ID..."
          value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <RotateCcw size={36} className="mb-3 opacity-30" />
            <p className="text-sm">{search ? "No returns match your search" : "No returns processed yet"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">Sale ID</th>
                  <th className="table-header">Product</th>
                  <th className="table-header">Qty</th>
                  <th className="table-header">Refund</th>
                  <th className="table-header">Reason</th>
                  <th className="table-header">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell text-gray-400 text-xs">{i + 1}</td>
                    <td className="table-cell">
                      <span className="font-mono text-sm font-semibold text-indigo-600">#{r.sale_id}</span>
                    </td>
                    <td className="table-cell text-gray-800 text-sm font-medium">
                      {productMap[r.product_id] || `Product #${r.product_id}`}
                    </td>
                    <td className="table-cell text-gray-600 text-sm">{r.quantity}</td>
                    <td className="table-cell">
                      <span className="font-semibold text-emerald-600">{formatCurrency(r.refund_amount)}</span>
                    </td>
                    <td className="table-cell text-gray-500 text-sm">
                      {r.reason ? (
                        <span className="italic">"{r.reason}"</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="table-cell text-gray-400 text-xs">{formatDateTime(r.returned_at)}</td>
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

export default ReturnList;