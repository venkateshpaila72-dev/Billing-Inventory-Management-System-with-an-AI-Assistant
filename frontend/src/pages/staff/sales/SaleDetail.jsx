import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer, Receipt, User, Package } from "lucide-react";
import { getSaleById } from "../../../services/salesService";
import { getAllProducts } from "../../../services/productService";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDateTime } from "../../../utils/formatDate";
import Loader from "../../../components/common/Loader";

const SaleDetail = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getSaleById(id), getAllProducts()])
      .then(([saleData, products]) => {
        setSale(saleData);
        const map = {};
        products.forEach(p => { map[p.id] = p.name; });
        setProductMap(map);
      })
      .catch(() => setError("Failed to load sale."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="max-w-2xl space-y-6">

        <div className="flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/staff/sales")}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-gray-800 font-bold text-2xl">Bill Detail</h1>
              <p className="text-gray-400 text-sm mt-0.5">{sale.bill_number}</p>
            </div>
          </div>
          <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
            <Printer size={15} /> Print Bill
          </button>
        </div>

        <div id="print-area" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

          <div className="text-center border-b border-gray-100 pb-5">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Receipt size={20} className="text-indigo-500" />
              <h2 className="text-gray-800 font-bold text-xl">BillingPro</h2>
            </div>
            <p className="text-gray-400 text-sm">Tax Invoice</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-gray-500">Bill No: <span className="font-mono font-semibold text-indigo-600">{sale.bill_number}</span></span>
              <span className="text-gray-500">{formatDateTime(sale.created_at)}</span>
            </div>
          </div>

          {sale.customer && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <User size={14} className="text-gray-400" />
                <span className="text-gray-600 font-semibold text-sm">Customer</span>
              </div>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>📞 {sale.customer.phone}</span>
                {sale.customer.age && <span>Age: {sale.customer.age}</span>}
                {sale.customer.gender && <span className="capitalize">{sale.customer.gender}</span>}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package size={14} className="text-gray-400" />
              <span className="text-gray-600 font-semibold text-sm">Items</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-gray-400 font-medium text-xs pb-2">#</th>
                  <th className="text-left text-gray-400 font-medium text-xs pb-2">Product</th>
                  <th className="text-right text-gray-400 font-medium text-xs pb-2">Qty</th>
                  <th className="text-right text-gray-400 font-medium text-xs pb-2">Unit Price</th>
                  <th className="text-right text-gray-400 font-medium text-xs pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, i) => (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="py-2.5 text-gray-400 text-xs">{i + 1}</td>
                    <td className="py-2.5 text-gray-800 font-medium">{productMap[item.product_id] || `Product #${item.product_id}`}</td>
                    <td className="py-2.5 text-right text-gray-600">{item.quantity}</td>
                    <td className="py-2.5 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                    <td className="py-2.5 text-right text-gray-800 font-semibold">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-700">{formatCurrency(sale.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">GST</span>
              <span className="text-gray-700">{formatCurrency(sale.gst_amount)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span className="text-gray-800 font-bold text-base">Grand Total</span>
              <span className="text-indigo-600 font-bold text-xl">{formatCurrency(sale.grand_total)}</span>
            </div>
          </div>

          <div className="text-center text-gray-400 text-xs border-t border-gray-100 pt-4">
            <p>Thank you for your purchase!</p>
            <p className="mt-1">Generated by BillingPro</p>
          </div>
        </div>

        <button onClick={() => navigate("/staff/sales")} className="btn-secondary no-print">
          ← Back to My Sales
        </button>
      </div>
    </>
  );
};

export default SaleDetail;