import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Search } from "lucide-react";
import { getAllPurchases } from "../../../services/purchaseService";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDateTime } from "../../../utils/formatDate";
import Loader from "../../../components/common/Loader";

const PurchaseList = () => {
  const [purchases, setPurchases] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getAllPurchases()
      .then(data => { setPurchases(data); setFiltered(data); })
      .catch(() => setError("Failed to load purchases."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(purchases.filter(p =>
      (p.product?.name || "").toLowerCase().includes(q) ||
      (p.supplier?.name || "").toLowerCase().includes(q) ||
      String(p.id).includes(q)
    ));
  }, [search, purchases]);

  const totalSpent = purchases.reduce((sum, p) => sum + (p.total_cost || 0), 0);
  const totalUnits = purchases.reduce((sum, p) => sum + (p.quantity || 0), 0);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Purchases</h1>
          <p className="text-gray-400 text-sm mt-0.5">{purchases.length} purchase records</p>
        </div>
        <button onClick={() => navigate("/admin/purchases/add")} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Purchase
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-gray-400 text-xs mb-1">Total Records</p>
          <p className="text-gray-800 font-bold text-2xl">{purchases.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-gray-400 text-xs mb-1">Total Units Purchased</p>
          <p className="text-gray-800 font-bold text-2xl">{totalUnits}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-gray-400 text-xs mb-1">Total Amount Spent</p>
          <p className="text-gray-800 font-bold text-2xl">{formatCurrency(totalSpent)}</p>
        </div>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search by product or supplier..."
          value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ShoppingCart size={36} className="mb-3 opacity-30" />
            <p className="text-sm">{search ? "No purchases match your search" : "No purchases recorded yet"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">Product</th>
                  <th className="table-header">Supplier</th>
                  <th className="table-header">Qty</th>
                  <th className="table-header">Cost/Unit</th>
                  <th className="table-header">Total Cost</th>
                  <th className="table-header">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell text-gray-400 text-xs">{i + 1}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(p.product?.name || "P").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 text-sm">
                          {p.product?.name || `Product #${p.product_id}`}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell text-gray-500 text-sm">
                      {p.supplier?.name || `Supplier #${p.supplier_id}`}
                    </td>
                    <td className="table-cell">
                      <span className="font-semibold text-gray-800">{p.quantity}</span>
                      <span className="text-gray-400 text-xs ml-1">units</span>
                    </td>
                    <td className="table-cell text-gray-600 text-sm">{formatCurrency(p.cost_price)}</td>
                    <td className="table-cell">
                      <span className="font-semibold text-gray-800">{formatCurrency(p.total_cost)}</span>
                    </td>
                    <td className="table-cell text-gray-400 text-xs">{formatDateTime(p.purchased_at)}</td>
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

export default PurchaseList;