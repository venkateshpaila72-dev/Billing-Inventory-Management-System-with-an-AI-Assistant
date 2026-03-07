import { useState } from "react";
import { Eye, EyeOff, Check, Lock } from "lucide-react";
import api from "../../../services/api";

const ChangePassword = () => {
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fc = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!form.current_password) { setError("Current password is required."); return; }
    if (form.new_password.length < 6) { setError("New password must be at least 6 characters."); return; }
    if (form.new_password !== form.confirm_password) { setError("Passwords do not match."); return; }
    setSaving(true);
    try {
      await api.patch("/password/change", {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setSuccess(true);
      setForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  const PasswordInput = ({ name, placeholder, showKey }) => (
    <div className="relative">
      <input
        name={name}
        type={show[showKey] ? "text" : "password"}
        value={form[name]}
        onChange={fc}
        placeholder={placeholder}
        className="input pr-10"
        autoComplete="new-password"
      />
      <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-gray-800 font-bold text-2xl">Change Password</h1>
        <p className="text-gray-400 text-sm mt-0.5">Update your account password</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-2xl mb-5">
          <Lock size={22} className="text-indigo-500" />
        </div>

        {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}
        {success && (
          <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm flex items-center gap-2">
            <Check size={15} /> Password changed successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="label">Current Password</label>
            <PasswordInput name="current_password" placeholder="Enter current password" showKey="current" />
          </div>
          <div>
            <label className="label">New Password</label>
            <PasswordInput name="new_password" placeholder="Min 6 characters" showKey="new" />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <PasswordInput name="confirm_password" placeholder="Repeat new password" showKey="confirm" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
            {saving ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;