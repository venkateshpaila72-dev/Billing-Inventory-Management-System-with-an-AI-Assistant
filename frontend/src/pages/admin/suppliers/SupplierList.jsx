import { useState, useEffect } from "react";
import { Truck, Plus, Pencil, Trash2, X, Check, Search, Phone, Mail, MapPin, Eye } from "lucide-react";
import {
  getAllSuppliers, createSupplier, updateSupplier, deleteSupplier
} from "../../../services/supplierService";
import Loader from "../../../components/common/Loader";

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-gray-800 font-semibold text-base">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

const ConfirmModal = ({ name, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <h2 className="text-gray-800 font-semibold text-base mb-2">Delete Supplier</h2>
      <p className="text-gray-500 text-sm mb-6">
        Are you sure you want to delete <span className="font-semibold text-gray-700">"{name}"</span>? This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={15} />}
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

const initForm = () => ({ name: "", contact_person: "", phone: "", email: "", address: "" });

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const [form, setForm] = useState(initForm());

  const load = async () => {
    try {
      const data = await getAllSuppliers();
      setSuppliers(data);
      setFiltered(data);
    } catch {
      setError("Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(suppliers.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.contact_person || "").toLowerCase().includes(q) ||
      (s.phone || "").includes(q) ||
      (s.email || "").toLowerCase().includes(q)
    ));
  }, [search, suppliers]);

  const fc = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const closeAll = () => {
    setShowAdd(false);
    setEditItem(null);
    setViewItem(null);
    setDeleteItem(null);
    setForm(initForm());
    setError("");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Supplier name is required."); return; }
    setSaving(true);
    try {
      await createSupplier(form);
      closeAll();
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create supplier.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Supplier name is required."); return; }
    setSaving(true);
    try {
      await updateSupplier(editItem.id, form);
      closeAll();
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update supplier.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteSupplier(deleteItem.id);
      closeAll();
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete supplier.");
      setDeleteItem(null);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (s) => {
    setForm({
      name: s.name,
      contact_person: s.contact_person || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
    });
    setEditItem(s);
    setError("");
  };

  const SupplierForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}
      <div>
        <label className="label">Supplier Name *</label>
        <input name="name" value={form.name} onChange={fc} placeholder="e.g. Tech Distributors Ltd" className="input" autoComplete="off" />
      </div>
      <div>
        <label className="label">Contact Person</label>
        <input name="contact_person" value={form.contact_person} onChange={fc} placeholder="Optional" className="input" autoComplete="off" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Phone</label>
          <input name="phone" value={form.phone} onChange={fc} placeholder="Optional" className="input" autoComplete="off" />
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" value={form.email} onChange={fc} placeholder="Optional" className="input" autoComplete="off" />
        </div>
      </div>
      <div>
        <label className="label">Address</label>
        <textarea name="address" value={form.address} onChange={fc} placeholder="Optional" className="input resize-none" rows={2} />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={closeAll} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Suppliers</h1>
          <p className="text-gray-400 text-sm mt-0.5">{suppliers.length} supplier{suppliers.length !== 1 ? "s" : ""} total</p>
        </div>
        <button onClick={() => { setShowAdd(true); setError(""); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" placeholder="Search suppliers..."
          value={search} onChange={e => setSearch(e.target.value)} className="input pl-9"
        />
      </div>

      {error && !showAdd && !editItem && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Truck size={36} className="mb-3 opacity-30" />
            <p className="text-sm">{search ? "No suppliers match your search" : "No suppliers added yet"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Contact Person</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell text-gray-400 text-xs">{i + 1}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 text-sm">{s.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-gray-500 text-sm">{s.contact_person || "—"}</td>
                    <td className="table-cell text-gray-500 text-sm">{s.phone || "—"}</td>
                    <td className="table-cell text-gray-500 text-sm">{s.email || "—"}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setViewItem(s)} title="View"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => openEdit(s)} title="Edit"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteItem(s)} title="Delete"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={15} />
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

      {/* ADD MODAL */}
      {showAdd && (
        <Modal title="Add Supplier" onClose={closeAll}>
          <SupplierForm onSubmit={handleAdd} submitLabel="Add Supplier" />
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editItem && (
        <Modal title="Edit Supplier" onClose={closeAll}>
          <SupplierForm onSubmit={handleEdit} submitLabel="Save Changes" />
        </Modal>
      )}

      {/* VIEW MODAL */}
      {viewItem && (
        <Modal title="Supplier Details" onClose={closeAll}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {viewItem.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-gray-800 font-semibold text-lg">{viewItem.name}</p>
                <p className="text-gray-400 text-sm">{viewItem.contact_person || "No contact person"}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
              {[
                { label: "Phone", value: viewItem.phone || "Not provided", icon: Phone },
                { label: "Email", value: viewItem.email || "Not provided", icon: Mail },
                { label: "Address", value: viewItem.address || "Not provided", icon: MapPin },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-3 px-4 py-3">
                  <Icon size={14} className="text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-gray-400 text-sm w-16 shrink-0">{label}</span>
                  <span className="text-gray-700 text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { openEdit(viewItem); setViewItem(null); }} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Pencil size={15} /> Edit
              </button>
              <button onClick={closeAll} className="btn-secondary flex-1">Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRM */}
      {deleteItem && (
        <ConfirmModal
          name={deleteItem.name}
          onConfirm={handleDelete}
          onCancel={closeAll}
          loading={saving}
        />
      )}
    </div>
  );
};

export default SupplierList;