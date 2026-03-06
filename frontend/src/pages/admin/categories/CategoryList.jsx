import { useState, useEffect } from "react";
import { Tag, Plus, Pencil, Trash2, X, Check, Search } from "lucide-react";
import {
  getAllCategories, createCategory, updateCategory, deleteCategory
} from "../../../services/categoryService";
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
      <h2 className="text-gray-800 font-semibold text-base mb-2">Delete Category</h2>
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

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const [form, setForm] = useState({ name: "", description: "" });

  const load = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
      setFiltered(data);
    } catch {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(categories.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q)
    ));
  }, [search, categories]);

  const closeAll = () => {
    setShowAdd(false);
    setEditItem(null);
    setDeleteItem(null);
    setForm({ name: "", description: "" });
    setError("");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Category name is required."); return; }
    setSaving(true);
    try {
      await createCategory(form);
      closeAll();
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create category.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Category name is required."); return; }
    setSaving(true);
    try {
      await updateCategory(editItem.id, form);
      closeAll();
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteCategory(deleteItem.id);
      closeAll();
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete category.");
      setDeleteItem(null);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (c) => {
    setForm({ name: c.name, description: c.description || "" });
    setEditItem(c);
    setError("");
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Categories</h1>
          <p className="text-gray-400 text-sm mt-0.5">{categories.length} categor{categories.length !== 1 ? "ies" : "y"} total</p>
        </div>
        <button onClick={() => { setShowAdd(true); setError(""); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" placeholder="Search categories..."
          value={search} onChange={e => setSearch(e.target.value)} className="input pl-9"
        />
      </div>

      {error && !showAdd && !editItem && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 text-gray-400">
          <Tag size={36} className="mb-3 opacity-30" />
          <p className="text-sm">{search ? "No categories match your search" : "No categories added yet"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Tag size={18} className="text-blue-500" />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(c)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteItem(c)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-gray-800 font-semibold text-base">{c.name}</p>
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                {c.description || "No description"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ADD MODAL */}
      {showAdd && (
        <Modal title="Add Category" onClose={closeAll}>
          {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="label">Category Name *</label>
              <input
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Electronics" className="input" autoComplete="off" autoFocus
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional description..." className="input resize-none" rows={3}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={closeAll} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                {saving ? "Saving..." : "Add Category"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editItem && (
        <Modal title="Edit Category" onClose={closeAll}>
          {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="label">Category Name *</label>
              <input
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input" autoComplete="off"
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input resize-none" rows={3}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={closeAll} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
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

export default CategoryList;