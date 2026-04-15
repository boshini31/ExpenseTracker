import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { transactionAPI, categoryAPI } from '../services/api';
import { format } from 'date-fns';

const EMPTY = {
  description: '', amount: '', transactionDate: format(new Date(), 'yyyy-MM-dd'),
  type: 'EXPENSE', categoryId: '', notes: '',
};

export default function TransactionForm({ initialData, onSaved, onCancel }) {
  const [form, setForm]       = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setForm({
        description: initialData.description || '',
        amount: initialData.amount || '',
        transactionDate: initialData.transactionDate || format(new Date(), 'yyyy-MM-dd'),
        type: initialData.type || 'EXPENSE',
        categoryId: initialData.category?.id || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    categoryAPI.getAll(form.type)
      .then(res => setCategories(res.data.data))
      .catch(() => {});
  }, [form.type]);

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.description.trim())  errs.description    = 'Required';
    if (!form.amount || +form.amount <= 0) errs.amount = 'Must be > 0';
    if (!form.transactionDate)     errs.transactionDate = 'Required';
    if (!form.type)                errs.type           = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      amount: parseFloat(form.amount),
      categoryId: form.categoryId ? +form.categoryId : null,
    };
    try {
      if (isEdit) {
        await transactionAPI.update(initialData.id, payload);
        toast.success('Transaction updated!');
      } else {
        await transactionAPI.create(payload);
        toast.success('Transaction added!');
      }
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-title">{isEdit ? 'Edit Transaction' : 'New Transaction'}</div>

      <div className="form-group">
        <label>Description *</label>
        <input
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="e.g. Grocery shopping"
        />
        {errors.description && <small style={{ color: 'var(--danger)' }}>{errors.description}</small>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Amount (₹) *</label>
          <input
            type="number" step="0.01" min="0.01"
            value={form.amount}
            onChange={e => set('amount', e.target.value)}
            placeholder="0.00"
          />
          {errors.amount && <small style={{ color: 'var(--danger)' }}>{errors.amount}</small>}
        </div>
        <div className="form-group">
          <label>Date *</label>
          <input
            type="date"
            value={form.transactionDate}
            onChange={e => set('transactionDate', e.target.value)}
          />
          {errors.transactionDate && <small style={{ color: 'var(--danger)' }}>{errors.transactionDate}</small>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Type *</label>
          <select value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>
        <div className="form-group">
          <label>Category</label>
          <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Optional notes"
        />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Update' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
}
