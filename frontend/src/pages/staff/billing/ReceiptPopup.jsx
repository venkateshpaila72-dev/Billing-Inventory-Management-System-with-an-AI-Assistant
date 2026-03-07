import { Receipt, Printer, X, CheckCircle } from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDateTime } from "../../../utils/formatDate";

const ReceiptPopup = ({ sale, onClose, onNewBill }) => {
  if (!sale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">

        {/* Success header */}
        <div className="bg-emerald-50 rounded-t-2xl px-6 py-5 text-center">
          <CheckCircle size={40} className="text-emerald-500 mx-auto mb-2" />
          <h2 className="text-gray-800 font-bold text-lg">Bill Generated!</h2>
          <p className="text-emerald-600 font-mono font-semibold mt-1">{sale.bill_number}</p>
        </div>

        {/* Receipt body */}
        <div className="px-6 py-4 space-y-3">
          <div className="text-center text-gray-400 text-xs mb-3">{formatDateTime(sale.created_at)}</div>

          {/* Items */}
          <div className="space-y-1.5">
            {sale.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">Product #{item.product_id} × {item.quantity}</span>
                <span className="text-gray-700 font-medium">{formatCurrency(item.unit_price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-600">{formatCurrency(sale.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">GST</span>
              <span className="text-gray-600">{formatCurrency(sale.gst_amount)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2 mt-1">
              <span className="text-gray-800">Grand Total</span>
              <span className="text-indigo-600">{formatCurrency(sale.grand_total)}</span>
            </div>
          </div>

          {sale.customer && (
            <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-500">
              Customer: <span className="font-medium text-gray-700">{sale.customer.phone}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-5 space-y-2">
          <button onClick={() => window.print()}
            className="btn-primary w-full flex items-center justify-center gap-2">
            <Printer size={15} /> Print Receipt
          </button>
          <button onClick={onNewBill}
            className="btn-secondary w-full flex items-center justify-center gap-2">
            <Receipt size={15} /> New Bill
          </button>
          <button onClick={onClose}
            className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-1">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPopup;