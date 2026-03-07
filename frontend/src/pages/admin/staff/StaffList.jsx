import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Search, Eye, Pencil, KeyRound, ToggleLeft, ToggleRight } from "lucide-react";
import { getAllStaff, toggleStaffStatus } from "../../../services/staffService";
import { getResetRequests } from "../../../services/passwordService";
import Loader from "../../../components/common/Loader";

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetStaffIds, setResetStaffIds] = useState(new Set());
  const navigate = useNavigate();

  const load = async () => {
    try {
      const [staffData, resetData] = await Promise.all([
        getAllStaff(),
        getResetRequests().catch(() => []),
      ]);
      setStaff(staffData);
      setFiltered(staffData);
      setResetStaffIds(new Set(resetData.map(r => r.staff_id)));
    } catch {
      setError("Failed to load staff.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Refetch when user comes back to this tab/page
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) load();
    });
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(staff.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    ));
  }, [search, staff]);

  const handleToggle = async (s) => {
    try {
      await toggleStaffStatus(s.id);
      await load();
    } catch {
      setError("Failed to toggle status.");
    }
  };

  if (loading) return <Loader fullScreen />;

  const pendingCount = resetStaffIds.size;

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Staff Management</h1>
          <p className="text-gray-400 text-sm mt-0.5">{staff.length} staff member{staff.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button onClick={() => navigate("/admin/staff/add")} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {/* Alert banner for pending reset requests */}
      {pendingCount > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <p className="text-orange-700 text-sm font-medium">
              {pendingCount} staff member{pendingCount > 1 ? "s have" : " has"} a pending password reset request
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/staff/reset-requests")}
            className="text-orange-600 text-xs font-semibold hover:underline shrink-0 ml-3">
            View Requests →
          </button>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users size={36} className="mb-3 opacity-30" />
            <p className="text-sm">{search ? "No staff match your search" : "No staff added yet"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell text-gray-400 text-xs">{i + 1}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          {/* Orange dot for pending reset request */}
                          {resetStaffIds.has(s.id) && (
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-500 border-2 border-white rounded-full" title="Pending password reset request" />
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-gray-800 text-sm">{s.name}</span>
                          {resetStaffIds.has(s.id) && (
                            <p className="text-orange-500 text-xs font-medium">Password reset requested</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-gray-500 text-sm">{s.email}</td>
                    <td className="table-cell">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        s.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-600"}`}>
                        {s.role}
                      </span>
                    </td>
                    <td className="table-cell">
                      {s.is_active
                        ? <span className="badge-green">Active</span>
                        : <span className="badge-red">Inactive</span>}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/admin/staff/${s.id}`)} title="View"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => navigate(`/admin/staff/${s.id}/edit`)} title="Edit"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => navigate(`/admin/staff/${s.id}/reset-password`)} title="Reset Password"
                          className={`p-1.5 rounded-lg transition-colors ${
                            resetStaffIds.has(s.id)
                              ? "text-orange-500 bg-orange-50 hover:bg-orange-100"
                              : "text-gray-400 hover:text-amber-500 hover:bg-amber-50"}`}>
                          <KeyRound size={15} />
                        </button>
                        <button onClick={() => handleToggle(s)} title={s.is_active ? "Deactivate" : "Activate"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            s.is_active
                              ? "text-gray-400 hover:text-red-500 hover:bg-red-50"
                              : "text-gray-400 hover:text-emerald-500 hover:bg-emerald-50"}`}>
                          {s.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffList;