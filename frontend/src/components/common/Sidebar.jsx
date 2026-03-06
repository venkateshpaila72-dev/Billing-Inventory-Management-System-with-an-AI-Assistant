import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, ShoppingCart, Package, Users,
  BarChart2, Bell, RotateCcw, Truck, Tag,
  LogOut, Store, ClipboardList, UserCircle
} from "lucide-react";

const adminLinks = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/sales", icon: ClipboardList, label: "Sales" },
  { to: "/admin/purchases", icon: ShoppingCart, label: "Purchases" },
  { to: "/admin/inventory", icon: Package, label: "Inventory" },
  { to: "/admin/categories", icon: Tag, label: "Categories" },
  { to: "/admin/suppliers", icon: Truck, label: "Suppliers" },
  { to: "/admin/staff", icon: Users, label: "Staff" },
  { to: "/admin/returns", icon: RotateCcw, label: "Returns" },
  { to: "/admin/notifications", icon: Bell, label: "Notifications" },
  { to: "/admin/analytics", icon: BarChart2, label: "Analytics" },
];

const staffLinks = [
  { to: "/staff/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/staff/billing", icon: ShoppingCart, label: "Billing" },
  { to: "/staff/sales", icon: ClipboardList, label: "My Sales" },
  { to: "/staff/returns", icon: RotateCcw, label: "Returns" },
  { to: "/staff/profile", icon: UserCircle, label: "Profile" },
];

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const links = isAdmin() ? adminLinks : staffLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 flex flex-col z-50 shadow-2xl">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
            <Store size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-none">BillingPro</h1>
            <p className="text-slate-400 text-xs mt-0.5 capitalize">{user?.role} Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-none">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {links.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                  ${isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={17} className="shrink-0" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info + Logout */}
      <div className="px-3 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/50 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-slate-400 text-xs truncate">{user?.email || user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;