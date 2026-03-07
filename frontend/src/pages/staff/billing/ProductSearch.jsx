import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";

const ProductSearch = ({ products, onAdd }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShow(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const q = search.toLowerCase();
    setResults(
      products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.category?.name || "").toLowerCase().includes(q)
      ).slice(0, 8)
    );
  }, [search, products]);

  const handleAdd = (product) => {
    onAdd(product);
    setSearch("");
    setShow(false);
  };

  return (
    <div className="relative" ref={ref}>
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search product by name or category..."
        value={search}
        onChange={e => { setSearch(e.target.value); setShow(true); }}
        onFocus={() => setShow(true)}
        className="input pl-9"
        autoComplete="off"
      />
      {show && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto">
          {results.map(p => (
            <button key={p.id} onClick={() => handleAdd(p)} disabled={p.stock_qty === 0}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-gray-800 text-sm font-medium">{p.name}</p>
                  <p className="text-gray-400 text-xs">{p.category?.name || "—"} · Stock: {p.stock_qty}</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-gray-800 font-semibold text-sm">{formatCurrency(p.selling_price)}</p>
                {p.stock_qty === 0 && <p className="text-red-400 text-xs">Out of stock</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;