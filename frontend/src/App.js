import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import CategoryList from './components/CategoryList';
import './App.css';

const NAV = [
  { id: 'dashboard',    label: '📊 Dashboard'     },
  { id: 'transactions', label: '💳 Transactions'   },
  { id: 'categories',   label: '🏷️ Categories'     },
];

export default function App() {
  const [page, setPage]       = useState('dashboard');
  const [editTx, setEditTx]   = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleNewTx  = ()   => { setEditTx(null); setShowForm(true);  };
  const handleEditTx = (tx) => { setEditTx(tx);   setShowForm(true);  };
  const handleClose  = ()   => { setShowForm(false); setEditTx(null); };

  return (
    <div className="app">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">💰</span>
          <span className="logo-text">ExpenseIQ</span>
        </div>
        <nav>
          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? 'active' : ''}`}
              onClick={() => setPage(n.id)}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <small>Personal Expense Tracker</small>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <h1 className="page-title">
            {NAV.find(n => n.id === page)?.label}
          </h1>
          {page === 'transactions' && (
            <button className="btn-primary" onClick={handleNewTx}>
              + Add Transaction
            </button>
          )}
        </header>

        <div className="content-area">
          {page === 'dashboard'    && <Dashboard onAddTx={handleNewTx} />}
          {page === 'transactions' && (
            <TransactionList onEdit={handleEditTx} onNew={handleNewTx} />
          )}
          {page === 'categories'   && <CategoryList />}
        </div>
      </main>

      {/* Transaction Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <TransactionForm
              initialData={editTx}
              onSaved={handleClose}
              onCancel={handleClose}
            />
          </div>
        </div>
      )}
    </div>
  );
}
