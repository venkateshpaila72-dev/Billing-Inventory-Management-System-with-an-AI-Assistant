import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Plus, Search, Pencil, Trash2, AlertTriangle, Filter, Eye, X } from "lucide-react";
import { getAllProducts, deleteProduct } from "../../../services/productService";
import { getAllCategories } from "../../../services/categoryService";
import { formatCurrency } from "../../../utils/formatCurrency";
import Loader from "../../../components/common/Loader";

const ConfirmModal = ({ name, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <h2 className="text-gray-800 font-semibold text-base mb-2">Delete Product</h2>
      <p className="text-gray-500 text-sm mb-6">
        Are you sure you want to delete <span className="font-semibold text-gray-700">"{name}"</span>? This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={15} />}
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

const InventoryList = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    try {
      const [prods, cats] = await Promise.all([getAllProducts(), getAllCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch {
      setError("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Apply all filters whenever any filter or products change
  useEffect(() => {
    let result = [...products];

    // Search
    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.category?.name || "").toLowerCase().includes(q) ||
        (p.supplier?.name || "").toLowerCase().includes(q)
      );
    }

    // Category — use p.category.id (not p.category_id, it's not in response)
    if (categoryFilter !== "all") {
      result = result.filter(p => p.category?.id === parseInt(categoryFilter));
    }

    // Stock
    if (stockFilter === "low") {
      result = result.filter(p => p.stock_qty > 0 && p.stock_qty <= p.low_stock_threshold);
    } else if (stockFilter === "out") {
      result = result.filter(p => p.stock_qty === 0);
    } else if (stockFilter === "ok") {
      result = result.filter(p => p.stock_qty > p.low_stock_threshold);
    }

    setFiltered(result);
  }, [search, categoryFilter, stockFilter, products]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(deleteItem.id);
      setDeleteItem(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete product.");
      setDeleteItem(null);
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStockFilter("all");
  };

  const showLowStock = () => {
    // Reset category and search, only apply low stock filter
    setSearch("");
    setCategoryFilter("all");
    setStockFilter("low");
  };

  const StockBadge = ({ qty, threshold }) => {
    if (qty === 0) return <span className="badge-red">Out of Stock</span>;
    if (qty <= threshold) return <span className="badge-yellow">Low Stock</span>;
    return <span className="badge-green">In Stock</span>;
  };

  const lowStockCount = products.filter(p => p.stock_qty <= p.low_stock_threshold).length;
  const isFiltered = search || categoryFilter !== "all" || stockFilter !== "all";

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Inventory</h1>
          <p className="text-gray-400 text-sm mt-0.5">{products.length} products total</p>
        </div>
        <button onClick={() => navigate("/admin/inventory/add")} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 px-5 py-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <p className="text-amber-700 text-sm font-medium">
            <span className="font-bold">{lowStockCount}</span> product{lowStockCount > 1 ? "s are" : " is"} low on stock or out of stock
          </p>
          <button
            onClick={showLowStock}
            className="ml-auto text-amber-600 text-xs font-semibold underline shrink-0"
          >
            View
          </button>
        </div>
      )}

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, category or supplier..."
            value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="input pl-8 appearance-none cursor-pointer min-w-36">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <select value={stockFilter} onChange={e => setStockFilter(e.target.value)}
          className="input appearance-none cursor-pointer min-w-32">
          <option value="all">All Stock</option>
          <option value="ok">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        {isFiltered && (
          <button onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Results count when filtered */}
      {isFiltered && (
        <p className="text-gray-400 text-sm">
          Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of {products.length} products
        </p>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Package size={36} className="mb-3 opacity-30" />
            <p className="text-sm">
              {isFiltered ? "No products match your filters" : "No products added yet"}
            </p>
            {isFiltered && (
              <button onClick={resetFilters} className="mt-3 text-blue-500 text-sm hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">Product</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Supplier</th>
                  <th className="table-header">Cost Price</th>
                  <th className="table-header">Sell Price</th>
                  <th className="table-header">Stock</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell text-gray-400 text-xs">{i + 1}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 text-sm">{p.name}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      {p.category?.name
                        ? <span className="badge-blue">{p.category.name}</span>
                        : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="table-cell text-gray-500 text-sm">{p.supplier?.name || "—"}</td>
                    <td className="table-cell text-gray-600 text-sm">{formatCurrency(p.cost_price)}</td>
                    <td className="table-cell text-gray-800 font-medium text-sm">{formatCurrency(p.selling_price)}</td>
                    <td className="table-cell">
                      <span className={`font-semibold text-sm ${
                        p.stock_qty === 0 ? "text-red-500"
                        : p.stock_qty <= p.low_stock_threshold ? "text-amber-500"
                        : "text-gray-700"}`}>
                        {p.stock_qty}
                      </span>
                    </td>
                    <td className="table-cell">
                      <StockBadge qty={p.stock_qty} threshold={p.low_stock_threshold} />
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/admin/inventory/${p.id}`)} title="View"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => navigate(`/admin/inventory/${p.id}/edit`)} title="Edit"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteItem(p)} title="Delete"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteItem && (
        <ConfirmModal name={deleteItem.name} onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)} loading={deleting} />
      )}
    </div>
  );
};

export default InventoryList;