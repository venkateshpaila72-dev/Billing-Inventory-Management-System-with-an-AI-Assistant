import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { createProduct } from "../../../services/productService";
import { getAllCategories } from "../../../services/categoryService";
import { getAllSuppliers } from "../../../services/supplierService";

const AddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    supplier_id: "",
    cost_price: "",
    selling_price: "",
    stock_qty: "",
    low_stock_threshold: "10",
  });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getAllCategories(), getAllSuppliers()])
      .then(([cats, sups]) => { setCategories(cats); setSuppliers(sups); })
      .catch(() => setError("Failed to load categories/suppliers."));
  }, []);

  const fc = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Product name is required."); return; }
    if (!form.category_id) { setError("Category is required."); return; }
    if (!form.supplier_id) { setError("Supplier is required."); return; }
    if (!form.selling_price) { setError("Selling price is required."); return; }
    if (!form.cost_price) { setError("Cost price is required."); return; }
    setSaving(true);
    try {
      await createProduct({
        name: form.name,
        category_id: parseInt(form.category_id),
        supplier_id: parseInt(form.supplier_id),
        cost_price: parseFloat(form.cost_price),
        selling_price: parseFloat(form.selling_price),
        stock_qty: parseInt(form.stock_qty) || 0,
        low_stock_threshold: parseInt(form.low_stock_threshold) || 10,
      });
      navigate("/admin/inventory");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create product.");
    } finally {
      setSaving(false);
    }
  };

  const margin = form.cost_price && form.selling_price
    ? (parseFloat(form.selling_price) - parseFloat(form.cost_price)).toFixed(2)
    : null;
  const marginPct = margin && parseFloat(form.cost_price) > 0
    ? (((parseFloat(form.selling_price) - parseFloat(form.cost_price)) / parseFloat(form.cost_price)) * 100).toFixed(1)
    : null;

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/inventory")}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Add Product</h1>
          <p className="text-gray-400 text-sm mt-0.5">Add a new product to inventory</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {error && <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <h3 className="text-gray-700 font-semibold text-sm mb-3">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Product Name *</label>
                <input name="name" value={form.name} onChange={fc}
                  placeholder="e.g. Colgate Toothpaste" className="input" autoComplete="off" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category *</label>
                  <select name="category_id" value={form.category_id} onChange={fc} className="input appearance-none cursor-pointer">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Supplier *</label>
                  <select name="supplier_id" value={form.supplier_id} onChange={fc} className="input appearance-none cursor-pointer">
                    <option value="">Select supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          <div>
            <h3 className="text-gray-700 font-semibold text-sm mb-3">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Cost Price (₹) *</label>
                <input name="cost_price" type="number" min="0" step="0.01"
                  value={form.cost_price} onChange={fc} placeholder="0.00" className="input" />
              </div>
              <div>
                <label className="label">Selling Price (₹) *</label>
                <input name="selling_price" type="number" min="0" step="0.01"
                  value={form.selling_price} onChange={fc} placeholder="0.00" className="input" />
              </div>
            </div>
            {margin !== null && (
              <div className="mt-3 px-4 py-2.5 bg-emerald-50 rounded-xl">
                <p className="text-emerald-700 text-sm">
                  Profit Margin: <span className="font-semibold">₹{margin}</span>
                  {marginPct && <span className="text-emerald-500 ml-1">({marginPct}%)</span>}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100" />

          <div>
            <h3 className="text-gray-700 font-semibold text-sm mb-3">Stock</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Initial Stock Qty</label>
                <input name="stock_qty" type="number" min="0"
                  value={form.stock_qty} onChange={fc} placeholder="0" className="input" />
              </div>
              <div>
                <label className="label">Low Stock Threshold</label>
                <input name="low_stock_threshold" type="number" min="0"
                  value={form.low_stock_threshold} onChange={fc} placeholder="10" className="input" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate("/admin/inventory")} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
              {saving ? "Saving..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;