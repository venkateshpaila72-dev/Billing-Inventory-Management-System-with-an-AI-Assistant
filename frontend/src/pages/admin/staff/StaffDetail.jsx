import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Shield, Pencil, KeyRound } from "lucide-react";
import { getStaffById } from "../../../services/staffService";
import Loader from "../../../components/common/Loader";

const StaffDetail = () => {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getStaffById(id)
      .then(setStaff)
      .catch(() => setError("Failed to load staff details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>;

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/staff")}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Staff Details</h1>
          <p className="text-gray-400 text-sm mt-0.5">Viewing {staff.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {staff.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-gray-800 font-semibold text-xl">{staff.name}</p>
            {staff.is_active
              ? <span className="badge-green">Active</span>
              : <span className="badge-red">Inactive</span>}
          </div>
        </div>

        {/* Info */}
        <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
          {[
            { label: "Email", value: staff.email, icon: Mail },
            { label: "Phone", value: staff.phone || "Not provided", icon: Phone },
            { label: "Staff ID", value: `#${staff.id}`, icon: Shield },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3">
              <Icon size={14} className="text-gray-400 shrink-0" />
              <span className="text-gray-400 text-sm w-20">{label}</span>
              <span className="text-gray-700 text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => navigate(`/admin/staff/${staff.id}/edit`)}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Pencil size={15} /> Edit
          </button>
          <button onClick={() => navigate(`/admin/staff/${staff.id}/reset-password`)}
            className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <KeyRound size={15} /> Reset Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffDetail;