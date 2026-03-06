import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, KeyRound, Eye, EyeOff, Check } from "lucide-react";
import { getStaffById, resetStaffPassword } from "../../../services/staffService";
import Loader from "../../../components/common/Loader";

const ResetPassword = () => {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getStaffById(id)
      .then(setStaff)
      .catch(() => setError("Failed to load staff."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSaving(true);
    try {
      await resetStaffPassword(id, password);
      setSuccess(true);
      setTimeout(() => navigate("/admin/staff"), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/staff")}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Reset Password</h1>
          <p className="text-gray-400 text-sm mt-0.5">{staff?.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {error && <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}
        {success && (
          <div className="mb-5 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm flex items-center gap-2">
            <Check size={15} /> Password reset successfully! Redirecting...
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-gray-500 text-sm">
            Set a new password for <span className="font-semibold text-gray-700">{staff?.name}</span>.
          </p>
          <div>
            <label className="label">New Password *</label>
            <div className="relative">
              <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min 6 characters" className="input pl-9 pr-10" autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate("/admin/staff")} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving || success} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <KeyRound size={15} />}
              {saving ? "Saving..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;