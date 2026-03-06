import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Package, TrendingDown } from "lucide-react";
import { createPurchase } from "../../../services/purchaseService";
import { getAllProducts } from "../../../services/productService";
import { getAllSuppliers } from "../../../services/supplierService";
import { formatCurrency } from "../../../utils/formatCurrency";

const AddPurchase = () => {
  const [form, setForm] = useState({
    product_id: "",
    supplier_id: "",
    quantity: "",
    cost_price: "",
  });
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getAllProducts(), getAllSuppliers()])
      .then(([prods, sups]) => { setProducts(prods); setSuppliers(sups); })
      .catch(() => setError("Failed to load products/suppliers."));
  }, []);

  const fc = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));

    // Auto-fill cost price and supplier when product selected
    if (name === "product_id" && value) {
      const prod = products.find(p => p.id === parseInt(value));
      if (prod) {
        setSelectedProduct(prod);
        setForm(f => ({
          ...f,
          product_id: value,
          cost_price: prod.cost_price || "",
          supplier_id: prod.supplier?.id ? String(prod.supplier.id) : f.supplier_id,
        }));
      }
    }
  };

  const totalCost = form.quantity && form.cost_price
    ? (parseFloat(form.quantity) * parseFloat(form.cost_price)).toFixed(2)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.product_id) { setError("Please select a product."); return; }
    if (!form.supplier_id) { setError("Please select a supplier."); return; }
    if (!form.quantity || parseInt(form.quantity) <= 0) { setError("Quantity must be greater than 0."); return; }
    if (!form.cost_price || parseFloat(form.cost_price) <= 0) { setError("Cost price must be greater than 0."); return; }

    setSaving(true);
    try {
      await createPurchase({
        product_id: parseInt(form.product_id),
        supplier_id: parseInt(form.supplier_id),
        quantity: parseInt(form.quantity),
        cost_price: parseFloat(form.cost_price),
      });
      navigate("/admin/purchases");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to record purchase.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/purchases")}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Add Purchase</h1>
          <p className="text-gray-400 text-sm mt-0.5">Record new stock received from supplier</p>
        </div>
      </div>

      {/* Selected product info */}
      {selectedProduct && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
            {selectedProduct.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-gray-800 font-semibold text-sm">{selectedProduct.name}</p>
            <p className="text-gray-500 text-xs mt-0.5">
              Current stock: <span className={`font-semibold ${selectedProduct.stock_qty <= selectedProduct.low_stock_threshold ? "text-amber-500" : "text-emerald-600"}`}>
                {selectedProduct.stock_qty} units
              </span>
              {" · "}Category: {selectedProduct.category?.name || "—"}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-gray-400 text-xs">Sell Price</p>
            <p className="text-gray-800 font-bold text-sm">{formatCurrency(selectedProduct.selling_price)}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {error && <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <h3 className="text-gray-700 font-semibold text-sm mb-3">Purchase Details</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Product *</label>
                <select name="product_id" value={form.product_id} onChange={fc}
                  className="input appearance-none cursor-pointer">
                  <option value="">Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stock_qty})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Supplier *</label>
                <select name="supplier_id" value={form.supplier_id} onChange={fc}
                  className="input appearance-none cursor-pointer">
                  <option value="">Select supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          <div>
            <h3 className="text-gray-700 font-semibold text-sm mb-3">Quantity & Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Quantity *</label>
                <input name="quantity" type="number" min="1"
                  value={form.quantity} onChange={fc}
                  placeholder="0" className="input" />
              </div>
              <div>
                <label className="label">Cost Price per Unit (₹) *</label>
                <input name="cost_price" type="number" min="0" step="0.01"
                  value={form.cost_price} onChange={fc}
                  placeholder="0.00" className="input" />
              </div>
            </div>

            {/* Total cost preview */}
            {totalCost && (
              <div className="mt-4 bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <TrendingDown size={16} className="text-red-400" />
                  Total Cost
                </div>
                <p className="text-gray-800 font-bold text-lg">{formatCurrency(parseFloat(totalCost))}</p>
              </div>
            )}

            {/* Stock preview after purchase */}
            {selectedProduct && form.quantity && (
              <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 text-sm">
                  <Package size={16} />
                  Stock after purchase
                </div>
                <p className="text-emerald-700 font-bold text-lg">
                  {selectedProduct.stock_qty + parseInt(form.quantity || 0)} units
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate("/admin/purchases")} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Check size={15} />}
              {saving ? "Saving..." : "Record Purchase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPurchase;