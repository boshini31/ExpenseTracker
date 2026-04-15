import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { transactionAPI } from '../services/api';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function TransactionList({ onEdit, onNew }) {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage]     = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionAPI.getAll(page, 10, filter || null);
      setTransactions(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch (e) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await transactionAPI.delete(id);
      toast.success('Transaction deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="card">
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', 'INCOME', 'EXPENSE'].map(t => (
          <button
            key={t}
            onClick={() => { setFilter(t); setPage(0); }}
            className={filter === t ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '7px 16px', fontSize: 13 }}
          >
            {t === '' ? 'All' : t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : transactions.length === 0 ? (
        <div className="empty-state">
          No transactions found.{' '}
          <button onClick={onNew} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Add one now
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id}>
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>{tx.transactionDate}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{tx.description}</div>
                    {tx.notes && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{tx.notes}</div>}
                  </td>
                  <td>
                    {tx.category ? (
                      <span>
                        <span className="color-dot" style={{ backgroundColor: tx.category.color }} />
                        {tx.category.name}
                      </span>
                    ) : <span style={{ color: 'var(--muted)' }}>—</span>}
                  </td>
                  <td>
                    <span className={`badge badge-${tx.type.toLowerCase()}`}>{tx.type}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700,
                    color: tx.type === 'INCOME' ? 'var(--income)' : 'var(--expense)' }}>
                    {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => onEdit(tx)} title="Edit">✏️</button>
                    <button className="btn-icon" onClick={() => handleDelete(tx.id)} title="Delete">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 0}>‹ Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} className={page === i ? 'active' : ''} onClick={() => setPage(i)}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages - 1}>Next ›</button>
        </div>
      )}
    </div>
  );
}
