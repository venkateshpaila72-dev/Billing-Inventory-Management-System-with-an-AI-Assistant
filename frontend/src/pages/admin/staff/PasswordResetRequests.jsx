import { useState, useEffect } from "react";
import { KeyRound, Eye, EyeOff, Check, X, RefreshCw } from "lucide-react";
import { getResetRequests, adminResetPassword } from "../../../services/passwordService";
import { formatDateTime } from "../../../utils/formatDate";
import Loader from "../../../components/common/Loader";

const PasswordResetRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Reset modal
  const [selected, setSelected] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [successId, setSuccessId] = useState(null);

  const load = () => {
    setLoading(true);
    getResetRequests()
      .then(setRequests)
      .catch(() => setError("Failed to load requests."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openModal = (req) => {
    setSelected(req);
    setNewPassword("");
    setShowPassword(false);
    setSaveError("");
  };

  const closeModal = () => { setSelected(null); setNewPassword(""); setSaveError(""); };

  const handleReset = async () => {
    setSaveError("");
    if (newPassword.length < 6) { setSaveError("Password must be at least 6 characters."); return; }
    setSaving(true);
    try {
      await adminResetPassword({ staff_id: selected.staff_id, new_password: newPassword });
      setSuccessId(selected.id);
      setRequests(prev => prev.filter(r => r.id !== selected.id));
      closeModal();
    } catch (err) {
      setSaveError(err.response?.data?.detail || "Failed to reset password.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Password Reset Requests</h1>
          <p className="text-gray-400 text-sm mt-0.5">{requests.length} pending request{requests.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {successId && (
        <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm flex items-center gap-2">
          <Check size={15} /> Password reset successfully!
        </div>
      )}

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <KeyRound size={36} className="mb-3 opacity-30" />
            <p className="text-sm">No pending password reset requests</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {requests.map(req => (
              <div key={req.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {req.staff_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-gray-800 font-semibold text-sm">{req.staff_name}</p>
                    <p className="text-gray-400 text-xs">{req.staff_email}</p>
                    {req.reason && (
                      <p className="text-gray-500 text-xs mt-0.5 italic">"{req.reason}"</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-gray-400 text-xs hidden sm:block">{formatDateTime(req.created_at)}</p>
                  <button onClick={() => openModal(req)}
                    className="btn-primary text-sm flex items-center gap-1.5">
                    <KeyRound size={13} /> Reset Password
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-gray-800 font-semibold">Reset Password</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-700 font-semibold text-sm">{selected.staff_name}</p>
                <p className="text-gray-400 text-xs">{selected.staff_email}</p>
                {selected.reason && <p className="text-gray-500 text-xs mt-1 italic">Reason: "{selected.reason}"</p>}
              </div>

              {saveError && (
                <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{saveError}</div>
              )}

              <div>
                <label className="label">New Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="input pr-10"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleReset} disabled={saving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Check size={15} />}
                  {saving ? "Resetting..." : "Confirm Reset"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordResetRequests;