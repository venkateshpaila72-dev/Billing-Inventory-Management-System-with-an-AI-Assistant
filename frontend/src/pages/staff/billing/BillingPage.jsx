import { useState, useEffect } from "react";
import { User, Receipt } from "lucide-react";
import { createSale } from "../../../services/salesService";
import { getAllProducts } from "../../../services/productService";
import { getAllCategories } from "../../../services/categoryService";
import ProductSearch from "./ProductSearch";
import ProductGrid from "./ProductGrid";
import CategoryFilter from "./CategoryFilter";
import Cart from "./Cart";
import BillPreview from "./BillPreview";
import ReceiptPopup from "./ReceiptPopup";

const BillingPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [cart, setCart] = useState([]);
  const [gstRate, setGstRate] = useState(18);

  const [addCustomer, setAddCustomer] = useState(false);
  const [customer, setCustomer] = useState({ phone: "", age: "", gender: "" });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [completedSale, setCompletedSale] = useState(null);

  useEffect(() => {
    Promise.all([getAllProducts(), getAllCategories()])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats); setFilteredProducts(prods); })
      .catch(() => setError("Failed to load products."));
  }, []);

  useEffect(() => {
    if (categoryFilter === "all") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category?.id === parseInt(categoryFilter)));
    }
  }, [categoryFilter, products]);

  const addToCart = (product) => {
    if (product.stock_qty === 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_qty) return prev;
        return prev.map(i => i.product_id === product.id
          ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        selling_price: product.selling_price,
        stock_qty: product.stock_qty,
        quantity: 1,
      }];
    });
  };

  const updateQty = (product_id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.product_id !== product_id) return i;
      const newQty = i.quantity + delta;
      if (newQty < 1 || newQty > i.stock_qty) return i;
      return { ...i, quantity: newQty };
    }));
  };

  const removeFromCart = (product_id) => setCart(prev => prev.filter(i => i.product_id !== product_id));

  const clearAll = () => {
    setCart([]);
    setCustomer({ phone: "", age: "", gender: "" });
    setAddCustomer(false);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    if (cart.length === 0) { setError("Add at least one product."); return; }
    if (addCustomer && !customer.phone.trim()) { setError("Customer phone is required."); return; }
    setSaving(true);
    try {
      const payload = {
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        gst_rate: parseFloat(gstRate),
        customer: addCustomer ? {
          phone: customer.phone,
          age: customer.age ? parseInt(customer.age) : null,
          gender: customer.gender || null,
        } : null,
      };
      const sale = await createSale(payload);
      setCompletedSale(sale);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create sale.");
    } finally {
      setSaving(false);
    }
  };

  const handleNewBill = () => {
    setCompletedSale(null);
    clearAll();
  };

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Billing</h1>
          <p className="text-gray-400 text-sm mt-0.5">Add products and generate bill</p>
        </div>
        {cart.length > 0 && (
          <button onClick={clearAll} className="text-sm text-red-400 hover:text-red-600 transition-colors">
            Clear Cart
          </button>
        )}
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT — Products */}
        <div className="lg:col-span-2 space-y-4">

          {/* Search */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-gray-700 font-semibold text-sm mb-3">Search Product</h2>
            <ProductSearch products={products} onAdd={addToCart} />
          </div>

          {/* Category Filter + Grid */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-gray-700 font-semibold text-sm">Browse Products</h2>
            <CategoryFilter categories={categories} selected={categoryFilter} onChange={setCategoryFilter} />
            <ProductGrid products={filteredProducts} onAdd={addToCart} />
          </div>

          {/* Cart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-700 font-semibold text-sm">Cart</h2>
              {cart.length > 0 && (
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                  {cart.length} item{cart.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <Cart items={cart} onUpdateQty={updateQty} onRemove={removeFromCart} />
          </div>
        </div>

        {/* RIGHT — Summary */}
        <div className="space-y-4">

          {/* GST */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-gray-700 font-semibold text-sm mb-3">GST Rate</h2>
            <select value={gstRate} onChange={e => setGstRate(e.target.value)}
              className="input appearance-none cursor-pointer">
              {[0, 5, 12, 18, 28].map(g => <option key={g} value={g}>{g}%</option>)}
            </select>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <User size={15} className="text-gray-400" />
                <h2 className="text-gray-700 font-semibold text-sm">Customer</h2>
              </div>
              <button onClick={() => setAddCustomer(v => !v)}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                  addCustomer ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"}`}>
                {addCustomer ? "Remove" : "Add"}
              </button>
            </div>
            {addCustomer ? (
              <div className="space-y-3">
                <div>
                  <label className="label">Phone *</label>
                  <input value={customer.phone}
                    onChange={e => setCustomer(c => ({ ...c, phone: e.target.value }))}
                    placeholder="Customer phone" className="input" autoComplete="off" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Age</label>
                    <input type="number" min="1" max="120" value={customer.age}
                      onChange={e => setCustomer(c => ({ ...c, age: e.target.value }))}
                      placeholder="Optional" className="input" />
                  </div>
                  <div>
                    <label className="label">Gender</label>
                    <select value={customer.gender}
                      onChange={e => setCustomer(c => ({ ...c, gender: e.target.value }))}
                      className="input appearance-none cursor-pointer">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-xs">Walk-in customer</p>
            )}
          </div>

          {/* Bill Preview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-gray-700 font-semibold text-sm mb-4">Bill Summary</h2>
            <BillPreview cart={cart} gstRate={gstRate} customer={addCustomer ? customer : null} />
            <button onClick={handleSubmit} disabled={saving || cart.length === 0}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50">
              {saving
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Receipt size={16} />}
              {saving ? "Generating..." : "Generate Bill"}
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Popup */}
      {completedSale && (
        <ReceiptPopup
          sale={completedSale}
          onClose={() => setCompletedSale(null)}
          onNewBill={handleNewBill}
        />
      )}
    </div>
  );
};

export default BillingPage;