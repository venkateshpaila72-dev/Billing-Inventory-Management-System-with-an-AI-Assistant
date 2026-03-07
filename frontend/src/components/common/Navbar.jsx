import { Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUnreadCount } from "../../services/notificationService";

const Navbar = ({ title = "Dashboard" }) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAdmin()) return;

    const fetchCount = () => {
      getUnreadCount()
        .then(data => setUnreadCount(data.unread_count || 0))
        .catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);

    // Immediately refetch when notifications are viewed/marked read
    window.addEventListener("notificationsViewed", fetchCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notificationsViewed", fetchCount);
    };
  }, []);

  const handleBellClick = () => {
    if (isAdmin()) navigate("/admin/notifications");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      <div>
        <h2 className="text-gray-800 font-semibold text-lg leading-none">{title}</h2>
        <p className="text-gray-400 text-xs mt-0.5">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {isAdmin() && (
          <button onClick={handleBellClick}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors border border-gray-100">
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}
        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-gray-800 text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-gray-400 text-xs mt-0.5 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;