import { Receipt } from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";

const BillPreview = ({ cart, gstRate, customer }) => {
  const subtotal = cart.reduce((sum, i) => sum + i.selling_price * i.quantity, 0);
  const gstAmount = (subtotal * gstRate) / 100;
  const grandTotal = subtotal + gstAmount;

  return (
    <div className="space-y-3">
      {/* Items summary */}
      {cart.length > 0 && (
        <div className="space-y-1.5">
          {cart.map(item => (
            <div key={item.product_id} className="flex justify-between text-xs text-gray-500">
              <span className="truncate mr-2">{item.name} × {item.quantity}</span>
              <span className="shrink-0 font-medium">{formatCurrency(item.selling_price * item.quantity)}</span>
            </div>
          ))}
        </div>
      )}

      {cart.length > 0 && <div className="border-t border-gray-100" />}

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="text-gray-700 font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">GST ({gstRate}%)</span>
          <span className="text-gray-700 font-medium">{formatCurrency(gstAmount)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-2">
          <span className="text-gray-800 font-bold">Grand Total</span>
          <span className="text-indigo-600 font-bold text-lg">{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      {/* Customer */}
      {customer?.phone && (
        <div className="border-t border-gray-100 pt-2">
          <p className="text-xs text-gray-400">Customer: <span className="text-gray-600 font-medium">{customer.phone}</span></p>
        </div>
      )}
    </div>
  );
};

export default BillPreview;