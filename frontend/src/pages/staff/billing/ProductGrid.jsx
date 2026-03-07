import { formatCurrency } from "../../../utils/formatCurrency";
import { Plus } from "lucide-react";

const ProductGrid = ({ products, onAdd }) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <p className="text-sm">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {products.map(p => (
        <button
          key={p.id}
          onClick={() => onAdd(p)}
          disabled={p.stock_qty === 0}
          className={`text-left bg-white rounded-xl border p-3 transition-all hover:shadow-md hover:border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            p.stock_qty === 0 ? "border-gray-100" : "border-gray-100 hover:border-indigo-200"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold mb-2">
            {p.name.charAt(0).toUpperCase()}
          </div>
          <p className="text-gray-800 text-sm font-semibold truncate">{p.name}</p>
          <p className="text-indigo-600 font-bold text-sm mt-0.5">{formatCurrency(p.selling_price)}</p>
          <div className="flex items-center justify-between mt-1">
            <p className={`text-xs ${p.stock_qty === 0 ? "text-red-400" : p.stock_qty <= p.low_stock_threshold ? "text-amber-500" : "text-gray-400"}`}>
              {p.stock_qty === 0 ? "Out of stock" : `Stock: ${p.stock_qty}`}
            </p>
            {p.stock_qty > 0 && (
              <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                <Plus size={11} className="text-indigo-600" />
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default ProductGrid;