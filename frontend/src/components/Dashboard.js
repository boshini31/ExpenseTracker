import React, { useEffect, useState, useCallback } from 'react';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { transactionAPI } from '../services/api';
import { format, subMonths } from 'date-fns';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title
);

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function Dashboard({ onAddTx }) {
  const [summary, setSummary] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const start = format(subMonths(new Date(), 5), 'yyyy-MM-dd');
      const end   = format(new Date(), 'yyyy-MM-dd');
      const [sumRes, txRes] = await Promise.all([
        transactionAPI.getSummary(start, end),
        transactionAPI.getAll(0, 5),
      ]);
      setSummary(sumRes.data.data);
      setRecentTx(txRes.data.data.content);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="loading">Loading dashboard…</div>;
  if (!summary) return null;

  const { totalIncome, totalExpense, balance, expensesByCategory, monthlyTotals } = summary;

  const doughnutData = {
    labels: expensesByCategory.map(c => c.categoryName),
    datasets: [{
      data: expensesByCategory.map(c => c.amount),
      backgroundColor: ['#6c63ff','#48cfad','#ff4d6d','#ffd166','#06d6a0','#118ab2','#ef476f','#ffd166'],
      borderWidth: 0,
    }],
  };

  const barData = {
    labels: monthlyTotals.map(m => m.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyTotals.map(m => m.income),
        backgroundColor: 'rgba(72,207,173,0.8)',
        borderRadius: 4,
      },
      {
        label: 'Expense',
        data: monthlyTotals.map(m => m.expense),
        backgroundColor: 'rgba(255,77,109,0.8)',
        borderRadius: 4,
      },
    ],
  };

  const chartOpts = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { size: 12 } } },
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: '#2e3347' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: '#2e3347' } },
    },
  };

  const doughnutOpts = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#94a3b8', font: { size: 12 }, padding: 12 },
      },
    },
  };

  return (
    <div>
      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Income</div>
          <div className="stat-value income">{fmt(totalIncome)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value expense">{fmt(totalExpense)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Balance</div>
          <div className={`stat-value ${balance >= 0 ? 'income' : 'expense'}`}>{fmt(balance)}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <div className="section-title">Expenses by Category</div>
          {expensesByCategory.length ? (
            <Doughnut data={doughnutData} options={doughnutOpts} />
          ) : (
            <div className="empty-state">No expense data</div>
          )}
        </div>
        <div className="card">
          <div className="section-title">Monthly Overview</div>
          {monthlyTotals.length ? (
            <Bar data={barData} options={chartOpts} />
          ) : (
            <div className="empty-state">No monthly data</div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Recent Transactions</div>
          <button className="btn-primary" onClick={onAddTx}>+ Add</button>
        </div>
        {recentTx.length === 0 ? (
          <div className="empty-state">No transactions yet. Add your first one!</div>
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
                </tr>
              </thead>
              <tbody>
                {recentTx.map(tx => (
                  <tr key={tx.id}>
                    <td>{tx.transactionDate}</td>
                    <td>{tx.description}</td>
                    <td>
                      {tx.category && (
                        <>
                          <span className="color-dot" style={{ backgroundColor: tx.category.color }} />
                          {tx.category.name}
                        </>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${tx.type.toLowerCase()}`}>{tx.type}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600,
                      color: tx.type === 'INCOME' ? 'var(--income)' : 'var(--expense)' }}>
                      {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
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
}
