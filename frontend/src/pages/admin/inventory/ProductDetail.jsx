import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Tag, Truck } from "lucide-react";
import { getProductById } from "../../../services/productService";
import { formatCurrency } from "../../../utils/formatCurrency";
import Loader from "../../../components/common/Loader";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getProductById(id)
      .then(setProduct)
      .catch(() => setError("Failed to load product."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>;

  const margin = product.selling_price - product.cost_price;
  const marginPct = product.cost_price > 0 ? ((margin / product.cost_price) * 100).toFixed(1) : 0;

  const StockBadge = () => {
    if (product.stock_qty === 0) return <span className="badge-red">Out of Stock</span>;
    if (product.stock_qty <= product.low_stock_threshold) return <span className="badge-yellow">Low Stock</span>;
    return <span className="badge-green">In Stock</span>;
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/inventory")}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-gray-800 font-bold text-2xl">Product Detail</h1>
            <p className="text-gray-400 text-sm mt-0.5">{product.name}</p>
          </div>
        </div>
        <button onClick={() => navigate(`/admin/inventory/${id}/edit`)} className="btn-primary flex items-center gap-2">
          <Pencil size={15} /> Edit
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {product.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-gray-800 font-bold text-xl">{product.name}</p>
            <div className="mt-1"><StockBadge /></div>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        <div className="space-y-1">
          <div className="flex items-center gap-3 py-2">
            <Tag size={15} className="text-gray-400 shrink-0" />
            <span className="text-gray-400 text-sm w-32">Category</span>
            <span className="text-gray-700 font-medium text-sm">{product.category?.name || "—"}</span>
          </div>
          <div className="flex items-center gap-3 py-2">
            <Truck size={15} className="text-gray-400 shrink-0" />
            <span className="text-gray-400 text-sm w-32">Supplier</span>
            <span className="text-gray-700 font-medium text-sm">{product.supplier?.name || "—"}</span>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        <div>
          <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider mb-3">Pricing</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">Cost Price</p>
              <p className="text-gray-800 font-bold">{formatCurrency(product.cost_price)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">Sell Price</p>
              <p className="text-gray-800 font-bold">{formatCurrency(product.selling_price)}</p>
            </div>
            <div className={`rounded-xl p-3 ${margin >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
              <p className="text-gray-400 text-xs mb-1">Margin</p>
              <p className={`font-bold ${margin >= 0 ? "text-emerald-600" : "text-red-500"}`}>{formatCurrency(margin)}</p>
              <p className={`text-xs ${margin >= 0 ? "text-emerald-500" : "text-red-400"}`}>{marginPct}%</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        <div>
          <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider mb-3">Stock</p>
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl p-3 ${product.stock_qty === 0 ? "bg-red-50" : product.stock_qty <= product.low_stock_threshold ? "bg-amber-50" : "bg-gray-50"}`}>
              <p className="text-gray-400 text-xs mb-1">Current Stock</p>
              <p className={`font-bold text-xl ${product.stock_qty === 0 ? "text-red-500" : product.stock_qty <= product.low_stock_threshold ? "text-amber-500" : "text-gray-800"}`}>
                {product.stock_qty}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">Low Stock Alert</p>
              <p className="text-gray-800 font-bold text-xl">{product.low_stock_threshold}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;