import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { getProductById, updateProduct } from "../../../services/productService";
import { getAllCategories } from "../../../services/categoryService";
import { getAllSuppliers } from "../../../services/supplierService";
import Loader from "../../../components/common/Loader";

const EditProduct = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "", category_id: "", supplier_id: "",
    cost_price: "", selling_price: "",
    stock_qty: "", low_stock_threshold: "10",
  });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getProductById(id), getAllCategories(), getAllSuppliers()])
      .then(([product, cats, sups]) => {
        setCategories(cats);
        setSuppliers(sups);
        setForm({
          name: product.name || "",
          category_id: product.category_id || "",
          supplier_id: product.supplier_id || "",
          cost_price: product.cost_price || "",
          selling_price: product.selling_price || "",
          stock_qty: product.stock_qty ?? 0,
          low_stock_threshold: product.low_stock_threshold ?? 10,
        });
      })
      .catch(() => setError("Failed to load product."))
      .finally(() => setLoading(false));
  }, [id]);

  const fc = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Product name is required."); return; }
    if (!form.selling_price) { setError("Selling price is required."); return; }
    if (!form.cost_price) { setError("Cost price is required."); return; }
    setSaving(true);
    try {
      await updateProduct(id, {
        name: form.name,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null,
        cost_price: parseFloat(form.cost_price),
        selling_price: parseFloat(form.selling_price),
        stock_qty: parseInt(form.stock_qty) || 0,
        low_stock_threshold: parseInt(form.low_stock_threshold) || 10,
      });
      navigate("/admin/inventory");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update product.");
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

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/inventory")}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Edit Product</h1>
          <p className="text-gray-400 text-sm mt-0.5">Update product information</p>
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
                <input name="name" value={form.name} onChange={fc} className="input" autoComplete="off" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select name="category_id" value={form.category_id} onChange={fc} className="input appearance-none cursor-pointer">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Supplier</label>
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
                  value={form.cost_price} onChange={fc} className="input" />
              </div>
              <div>
                <label className="label">Selling Price (₹) *</label>
                <input name="selling_price" type="number" min="0" step="0.01"
                  value={form.selling_price} onChange={fc} className="input" />
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
                <label className="label">Stock Quantity</label>
                <input name="stock_qty" type="number" min="0"
                  value={form.stock_qty} onChange={fc} className="input" />
              </div>
              <div>
                <label className="label">Low Stock Threshold</label>
                <input name="low_stock_threshold" type="number" min="0"
                  value={form.low_stock_threshold} onChange={fc} className="input" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate("/admin/inventory")} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;