import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { categoryAPI } from '../services/api';

const EMPTY = { name: '', description: '', color: '#6c63ff', type: 'EXPENSE' };

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [form, setForm]             = useState(EMPTY);
  const [editId, setEditId]         = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [errors, setErrors]         = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data.data);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (f, v) => { setForm(prev => ({ ...prev, [f]: v })); setErrors(e => ({ ...e, [f]: '' })); };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '', color: cat.color || '#6c63ff', type: cat.type });
    setEditId(cat.id);
    setShowForm(true);
  };

  const handleNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (editId) {
        await categoryAPI.update(editId, form);
        toast.success('Category updated');
      } else {
        await categoryAPI.create(form);
        toast.success('Category created');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoryAPI.delete(id);
      toast.success('Deleted');
      load();
    } catch { toast.error('Cannot delete — may be in use'); }
  };

  const income  = categories.filter(c => c.type === 'INCOME');
  const expense = categories.filter(c => c.type === 'EXPENSE');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn-primary" onClick={handleNew}>+ New Category</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="modal-title" style={{ fontSize: 16 }}>
            {editId ? 'Edit Category' : 'New Category'}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Category name" />
                {errors.name && <small style={{ color: 'var(--danger)' }}>{errors.name}</small>}
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Description</label>
                <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label>Color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                    style={{ width: 48, height: 40, padding: 2, cursor: 'pointer', borderRadius: 6 }} />
                  <input value={form.color} onChange={e => set('color', e.target.value)} style={{ flex: 1 }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">{editId ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[{ label: '💸 Expense Categories', list: expense }, { label: '💰 Income Categories', list: income }].map(({ label, list }) => (
            <div key={label} className="card">
              <div className="section-title">{label}</div>
              {list.length === 0 ? (
                <div className="empty-state" style={{ padding: '20px 0' }}>No categories</div>
              ) : (
                list.map(cat => (
                  <div key={cat.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0', borderBottom: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: cat.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{cat.name}</div>
                        {cat.description && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{cat.description}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-icon" onClick={() => handleEdit(cat)}>✏️</button>
                      <button className="btn-icon" onClick={() => handleDelete(cat.id)}>🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
