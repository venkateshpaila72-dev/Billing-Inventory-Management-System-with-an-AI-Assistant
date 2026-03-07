import { Bell, BellOff, Check, Package } from "lucide-react";
import { formatDateTime } from "../../utils/formatDate";

const NotificationList = ({ notifications = [], productMap = {}, onMarkRead, onNavigate }) => {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <BellOff size={36} className="mb-3 opacity-30" />
        <p className="text-sm">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {notifications.map(n => {
        const product = productMap[n.product_id];
        return (
          <div key={n.id}
            className={`flex items-start gap-4 px-5 py-4 transition-colors ${!n.is_read ? "bg-indigo-50/50" : "hover:bg-gray-50"}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              !n.is_read ? "bg-amber-100" : "bg-gray-100"}`}>
              <Package size={16} className={!n.is_read ? "text-amber-600" : "text-gray-400"} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${!n.is_read ? "text-gray-800 font-semibold" : "text-gray-600"}`}>
                {n.message}
              </p>
              {product && onNavigate && (
                <button onClick={() => onNavigate(n.product_id)}
                  className="text-xs text-indigo-600 hover:underline mt-0.5">
                  View {product.name} →
                </button>
              )}
              <p className="text-gray-400 text-xs mt-1">{formatDateTime(n.created_at)}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!n.is_read ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  {onMarkRead && (
                    <button onClick={() => onMarkRead(n.id)} title="Mark as read"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                      <Check size={14} />
                    </button>
                  )}
                </>
              ) : (
                <span className="text-gray-300 text-xs">Read</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationList;