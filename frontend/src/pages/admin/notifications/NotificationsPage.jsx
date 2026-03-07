import { useState, useEffect } from "react";
import { Bell, BellOff, Check, CheckCheck, Package } from "lucide-react";
import {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
} from "../../../services/notificationService";
import { getAllProducts } from "../../../services/productService";
import { formatDateTime } from "../../../utils/formatDate";
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/common/Loader";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    Promise.all([getAllNotifications(), getAllProducts()])
      .then(([notifs, prods]) => {
        setNotifications(notifs);
        const map = {};
        prods.forEach(p => { map[p.id] = p; });
        setProductMap(map);
        // Tell Navbar to reset bell count since user is viewing notifications
        window.dispatchEvent(new Event("notificationsViewed"));
      })
      .catch(() => setError("Failed to load notifications."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      window.dispatchEvent(new Event("notificationsViewed"));
    } catch {
      setError("Failed to mark as read.");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      window.dispatchEvent(new Event("notificationsViewed"));
    } catch {
      setError("Failed to mark all as read.");
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Notifications</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll}
            className="btn-secondary flex items-center gap-2">
            <CheckCheck size={14} /> Mark All Read
          </button>
        )}
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <BellOff size={36} className="mb-3 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
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
                    {product && (
                      <button onClick={() => navigate(`/admin/inventory/${n.product_id}`)}
                        className="text-xs text-indigo-600 hover:underline mt-0.5">
                        View {product.name} →
                      </button>
                    )}
                    <p className="text-gray-400 text-xs mt-1">{formatDateTime(n.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!n.is_read && (
                      <>
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <button onClick={() => handleMarkRead(n.id)}
                          title="Mark as read"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                          <Check size={14} />
                        </button>
                      </>
                    )}
                    {n.is_read && <span className="text-gray-300 text-xs">Read</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;