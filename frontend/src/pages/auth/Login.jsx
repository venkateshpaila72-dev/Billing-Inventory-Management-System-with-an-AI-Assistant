import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/authService";
import { Eye, EyeOff, Store, LogIn, X, CheckCircle } from "lucide-react";
import { forgotPasswordRequest } from "../../services/passwordService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot password modal
  const [showForgot, setShowForgot] = useState(false);
  const [forgotForm, setForgotForm] = useState({ email: "", reason: "" });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      if (isAdmin()) navigate("/admin/dashboard");
      else navigate("/staff/dashboard");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      const userData = {
        user_id: data.user_id,
        name: data.name,
        role: data.role,
        staff_id: data.staff_id,
      };
      login(userData, data.access_token);
      if (data.role === "admin") navigate("/admin/dashboard");
      else navigate("/staff/dashboard");
    } catch (err) {
      const msg = err.response?.data?.detail;
      if (msg === "Account is deactivated. Contact admin.") {
        setError("Your account has been deactivated. Please contact admin.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotError("");
    if (!forgotForm.email.trim()) { setForgotError("Email is required."); return; }
    setForgotLoading(true);
    try {
      await forgotPasswordRequest({ email: forgotForm.email, reason: forgotForm.reason || null });
      setForgotSuccess(true);
    } catch (err) {
      setForgotError(err.response?.data?.detail || "Failed to submit request.");
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotForm({ email: "", reason: "" });
    setForgotError("");
    setForgotSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-8 pt-10 pb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Store size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl leading-none">BillingPro</h1>
                <p className="text-slate-400 text-xs mt-1">Inventory & Billing System</p>
              </div>
            </div>
            <h2 className="text-white text-2xl font-bold">Welcome back</h2>
            <p className="text-slate-400 text-sm mt-1">Sign in to your account to continue</p>
          </div>
          <div className="px-8 py-8">
            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@shop.com"
                  className="input"
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input pr-10"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Forgot password — only addition */}
                <div className="text-right mt-2">
                  <button type="button" onClick={() => setShowForgot(true)}
                    className="text-xs text-slate-400 hover:text-blue-600 transition-colors">
                    Forgot password?
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors duration-150 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-blue-600/20"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={17} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
            <p className="text-center text-gray-400 text-xs mt-6">
              Contact your administrator if you cannot access your account
            </p>
          </div>
        </div>
        <p className="text-center text-slate-500 text-xs mt-6">
          © 2024 BillingPro. All rights reserved.
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-gray-800 font-semibold">Forgot Password</h2>
              <button onClick={closeForgot} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              {forgotSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
                  <p className="text-gray-800 font-semibold">Request Submitted!</p>
                  <p className="text-gray-400 text-sm mt-2">Your admin has been notified and will reset your password shortly.</p>
                  <button onClick={closeForgot}
                    className="w-full mt-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <p className="text-gray-400 text-sm">Enter your email and your admin will be notified to reset your password.</p>
                  {forgotError && (
                    <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{forgotError}</div>
                  )}
                  <div>
                    <label className="label">Your Email *</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={forgotForm.email}
                      onChange={e => setForgotForm(f => ({ ...f, email: e.target.value }))}
                      className="input"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="label">Reason (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Forgot my password"
                      value={forgotForm.reason}
                      onChange={e => setForgotForm(f => ({ ...f, reason: e.target.value }))}
                      className="input"
                      autoComplete="off"
                    />
                  </div>
                  <button type="submit" disabled={forgotLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                    {forgotLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {forgotLoading ? "Submitting..." : "Submit Request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;