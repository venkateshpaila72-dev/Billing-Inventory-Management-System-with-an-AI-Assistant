import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Search } from "lucide-react";
import { createReturn } from "../../../services/returnService";
import { getAllSales, getSaleById } from "../../../services/salesService";
import { getAllProducts } from "../../../services/productService";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDateTime } from "../../../utils/formatDate";

const ProcessReturn = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [productMap, setProductMap] = useState({});

  // Step 1 — find sale
  const [saleSearch, setSaleSearch] = useState("");
  const [saleResults, setSaleResults] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleItems, setSaleItems] = useState([]);
  const [loadingSale, setLoadingSale] = useState(false);

  // Step 2 — fill return form
  const [form, setForm] = useState({ product_id: "", quantity: 1, reason: "" });
  const [maxQty, setMaxQty] = useState(1);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getAllSales(), getAllProducts()])
      .then(([s, p]) => {
        setSales(s);
        setProducts(p);
        const map = {};
        p.forEach(pr => { map[pr.id] = pr.name; });
        setProductMap(map);
      });
  }, []);

  // Search sales by bill number
  useEffect(() => {
    if (!saleSearch.trim()) { setSaleResults([]); return; }
    const q = saleSearch.toLowerCase();
    setSaleResults(sales.filter(s => s.bill_number.toLowerCase().includes(q)).slice(0, 6));
  }, [saleSearch, sales]);

  const selectSale = async (sale) => {
    setLoadingSale(true);
    setSelectedSale(sale);
    setSaleSearch("");
    setSaleResults([]);
    setForm({ product_id: "", quantity: 1, reason: "" });
    setError("");
    setSuccess(null);
    try {
      const detail = await getSaleById(sale.id);
      setSaleItems(detail.items || []);
    } catch {
      setError("Failed to load sale items.");
    } finally {
      setLoadingSale(false);
    }
  };

  const handleProductChange = (product_id) => {
    const item = saleItems.find(i => i.product_id === parseInt(product_id));
    setMaxQty(item ? item.quantity : 1);
    setForm(f => ({ ...f, product_id, quantity: 1 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.product_id) { setError("Please select a product."); return; }
    if (form.quantity < 1 || form.quantity > maxQty) { setError(`Quantity must be between 1 and ${maxQty}.`); return; }
    setSaving(true);
    try {
      const result = await createReturn({
        sale_id: selectedSale.id,
        product_id: parseInt(form.product_id),
        quantity: parseInt(form.quantity),
        reason: form.reason || null,
      });
      setSuccess(result);
      setForm({ product_id: "", quantity: 1, reason: "" });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to process return.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">

      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/returns")}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Process Return</h1>
          <p className="text-gray-400 text-sm mt-0.5">Find a sale and return an item</p>
        </div>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

      {success && (
        <div className="px-4 py-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm space-y-1">
          <p className="font-semibold">✅ Return processed successfully!</p>
          <p>Product: <span className="font-medium">{productMap[success.product_id] || `#${success.product_id}`}</span></p>
          <p>Quantity: <span className="font-medium">{success.quantity}</span></p>
          <p>Refund Amount: <span className="font-semibold text-emerald-600">{formatCurrency(success.refund_amount)}</span></p>
        </div>
      )}

      {/* Step 1: Search sale */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-gray-700 font-semibold text-sm mb-3">Step 1 — Find Sale</h2>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by bill number..."
            value={saleSearch}
            onChange={e => setSaleSearch(e.target.value)}
            className="input pl-9" autoComplete="off" />
          {saleResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
              {saleResults.map(s => (
                <button key={s.id} onClick={() => selectSale(s)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0">
                  <span className="font-mono text-sm font-semibold text-indigo-600">{s.bill_number}</span>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm">{formatCurrency(s.grand_total)}</p>
                    <p className="text-gray-400 text-xs">{formatDateTime(s.created_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedSale && (
          <div className="mt-3 bg-indigo-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-sm font-semibold text-indigo-600">{selectedSale.bill_number}</p>
              <p className="text-gray-500 text-xs mt-0.5">{formatCurrency(selectedSale.grand_total)} · {formatDateTime(selectedSale.created_at)}</p>
            </div>
            <button onClick={() => { setSelectedSale(null); setSaleItems([]); setSuccess(null); setError(""); }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors">Change</button>
          </div>
        )}
      </div>

      {/* Step 2: Return form */}
      {selectedSale && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-gray-700 font-semibold text-sm mb-4">Step 2 — Return Details</h2>
          {loadingSale ? (
            <p className="text-gray-400 text-sm">Loading sale items...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Product *</label>
                <select value={form.product_id} onChange={e => handleProductChange(e.target.value)}
                  className="input appearance-none cursor-pointer">
                  <option value="">Select product from this sale</option>
                  {saleItems.map(item => (
                    <option key={item.product_id} value={item.product_id}>
                      {productMap[item.product_id] || `Product #${item.product_id}`} (qty: {item.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Quantity * (max: {maxQty})</label>
                <input type="number" min="1" max={maxQty}
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  className="input" />
              </div>

              <div>
                <label className="label">Reason (optional)</label>
                <input type="text" placeholder="e.g. Defective item, wrong product..."
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  className="input" autoComplete="off" />
              </div>

              <button type="submit" disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {saving
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <RotateCcw size={15} />}
                {saving ? "Processing..." : "Process Return"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessReturn;