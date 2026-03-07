import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";

const Cart = ({ items, onUpdateQty, onRemove }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <ShoppingCart size={32} className="mb-2 opacity-30" />
        <p className="text-sm">Cart is empty</p>
        <p className="text-xs mt-1">Add products from the left</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.product_id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {item.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 text-sm font-medium truncate">{item.name}</p>
            <p className="text-gray-400 text-xs">{formatCurrency(item.selling_price)} each</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => onUpdateQty(item.product_id, -1)}
              className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
              <Minus size={11} />
            </button>
            <span className="text-gray-800 font-semibold text-sm w-5 text-center">{item.quantity}</span>
            <button onClick={() => onUpdateQty(item.product_id, 1)}
              disabled={item.quantity >= item.stock_qty}
              className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40">
              <Plus size={11} />
            </button>
          </div>
          <div className="text-right shrink-0">
            <p className="text-gray-800 font-semibold text-sm">{formatCurrency(item.selling_price * item.quantity)}</p>
          </div>
          <button onClick={() => onRemove(item.product_id)}
            className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
            <Trash2 size={13} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Cart;