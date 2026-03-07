import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import StaffRoute from "./routes/StaffRoute";
import Sidebar from "./components/common/Sidebar";
import Navbar from "./components/common/Navbar";
import ProductDetail from "./pages/admin/inventory/ProductDetail";

// Auth
import Login from "./pages/auth/Login";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import StaffList from "./pages/admin/staff/StaffList";
import AddStaff from "./pages/admin/staff/AddStaff";
import EditStaff from "./pages/admin/staff/EditStaff";
import StaffDetail from "./pages/admin/staff/StaffDetail";
import ResetPassword from "./pages/admin/staff/ResetPassword";
import PasswordResetRequests from "./pages/admin/staff/PasswordResetRequests";
import CategoryList from "./pages/admin/categories/CategoryList";
import SupplierList from "./pages/admin/suppliers/SupplierList";
import InventoryList from "./pages/admin/inventory/InventoryList";
import AddProduct from "./pages/admin/inventory/AddProduct";
import EditProduct from "./pages/admin/inventory/EditProduct";
import PurchaseList from "./pages/admin/purchases/PurchaseList";
import AddPurchase from "./pages/admin/purchases/AddPurchase";
import AllSales from "./pages/admin/sales/AllSales";
import SaleDetail from "./pages/admin/sales/SaleDetail";
import ReturnList from "./pages/admin/returns/ReturnList";
import ProcessReturn from "./pages/admin/returns/ProcessReturn";
import NotificationsPage from "./pages/admin/notifications/NotificationsPage";
import SalesAnalytics from "./pages/admin/analytics/SalesAnalytics";

// Staff pages
import StaffDashboard from "./pages/staff/Dashboard";
import BillingPage from "./pages/staff/billing/BillingPage";
import MySales from "./pages/staff/sales/MySales";
import StaffSaleDetail from "./pages/staff/sales/SaleDetail";
import ChangePassword from "./pages/staff/profile/ChangePassword";
import StaffReturnList from "./pages/admin/returns/ReturnList";

// Errors
import NotFound from "./pages/errors/NotFound";

// Layout wrapper
const Layout = ({ children, title }) => (
  <div className="flex h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1 flex flex-col ml-64 min-h-screen overflow-hidden">
      <Navbar title={title} />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── Admin Routes ── */}
          <Route path="/admin/dashboard" element={<AdminRoute><Layout title="Dashboard"><AdminDashboard /></Layout></AdminRoute>} />

          {/* Staff Management */}
          <Route path="/admin/staff" element={<AdminRoute><Layout title="Staff Management"><StaffList /></Layout></AdminRoute>} />
          <Route path="/admin/staff/add" element={<AdminRoute><Layout title="Add Staff"><AddStaff /></Layout></AdminRoute>} />
          <Route path="/admin/staff/reset-requests" element={<AdminRoute><Layout title="Password Reset Requests"><PasswordResetRequests /></Layout></AdminRoute>} />
          <Route path="/admin/staff/:id" element={<AdminRoute><Layout title="Staff Detail"><StaffDetail /></Layout></AdminRoute>} />
          <Route path="/admin/staff/:id/edit" element={<AdminRoute><Layout title="Edit Staff"><EditStaff /></Layout></AdminRoute>} />
          <Route path="/admin/staff/:id/reset-password" element={<AdminRoute><Layout title="Reset Password"><ResetPassword /></Layout></AdminRoute>} />

          {/* Categories & Suppliers */}
          <Route path="/admin/categories" element={<AdminRoute><Layout title="Categories"><CategoryList /></Layout></AdminRoute>} />
          <Route path="/admin/suppliers" element={<AdminRoute><Layout title="Suppliers"><SupplierList /></Layout></AdminRoute>} />

          {/* Inventory */}
          <Route path="/admin/inventory" element={<AdminRoute><Layout title="Inventory"><InventoryList /></Layout></AdminRoute>} />
          <Route path="/admin/inventory/add" element={<AdminRoute><Layout title="Add Product"><AddProduct /></Layout></AdminRoute>} />
          <Route path="/admin/inventory/:id" element={<AdminRoute><Layout title="Product Detail"><ProductDetail /></Layout></AdminRoute>} />
          <Route path="/admin/inventory/:id/edit" element={<AdminRoute><Layout title="Edit Product"><EditProduct /></Layout></AdminRoute>} />

          {/* Purchases */}
          <Route path="/admin/purchases" element={<AdminRoute><Layout title="Purchases"><PurchaseList /></Layout></AdminRoute>} />
          <Route path="/admin/purchases/add" element={<AdminRoute><Layout title="Add Purchase"><AddPurchase /></Layout></AdminRoute>} />

          {/* Sales */}
          <Route path="/admin/sales" element={<AdminRoute><Layout title="All Sales"><AllSales /></Layout></AdminRoute>} />
          <Route path="/admin/sales/:id" element={<AdminRoute><Layout title="Sale Detail"><SaleDetail /></Layout></AdminRoute>} />

          {/* Returns */}
          <Route path="/admin/returns" element={<AdminRoute><Layout title="Returns"><ReturnList /></Layout></AdminRoute>} />
          <Route path="/admin/returns/process" element={<AdminRoute><Layout title="Process Return"><ProcessReturn /></Layout></AdminRoute>} />

          {/* Notifications & Analytics */}
          <Route path="/admin/notifications" element={<AdminRoute><Layout title="Notifications"><NotificationsPage /></Layout></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><Layout title="Analytics"><SalesAnalytics /></Layout></AdminRoute>} />

          {/* ── Staff Routes ── */}
          <Route path="/staff/dashboard" element={<StaffRoute><Layout title="Dashboard"><StaffDashboard /></Layout></StaffRoute>} />
          <Route path="/staff/billing" element={<StaffRoute><Layout title="Billing"><BillingPage /></Layout></StaffRoute>} />
          <Route path="/staff/sales" element={<StaffRoute><Layout title="My Sales"><MySales /></Layout></StaffRoute>} />
          <Route path="/staff/sales/:id" element={<StaffRoute><Layout title="Sale Detail"><StaffSaleDetail /></Layout></StaffRoute>} />
          <Route path="/staff/returns" element={<StaffRoute><Layout title="Returns"><StaffReturnList /></Layout></StaffRoute>} />
          <Route path="/staff/profile" element={<StaffRoute><Layout title="Change Password"><ChangePassword /></Layout></StaffRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;