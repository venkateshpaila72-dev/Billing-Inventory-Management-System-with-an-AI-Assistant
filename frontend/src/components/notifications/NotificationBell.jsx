import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { getUnreadCount } from "../../services/notificationService";
import { useNavigate } from "react-router-dom";

const NotificationBell = () => {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = () => getUnreadCount()
      .then(d => setCount(d.unread_count || 0))  // ← fixed key
      .catch(() => {});
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button onClick={() => { setCount(0); navigate("/admin/notifications"); }}
      className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors border border-gray-100">
      <Bell size={17} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;