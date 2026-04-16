import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import CategoryList from './components/CategoryList';
import './App.css';

const NAV = [
  { id: 'dashboard',    label: '📊 Dashboard'   },
  { id: 'transactions', label: '💳 Transactions' },
  { id: 'categories',   label: '🏷️ Categories'   },
];

// ── Protected app shell ───────────────────────────────────────────────────────
function AppShell() {
  const { user, logout }    = useAuth();
  const [page, setPage]     = useState('dashboard');
  const [editTx, setEditTx] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleNewTx  = ()   => { setEditTx(null); setShowForm(true); };
  const handleEditTx = (tx) => { setEditTx(tx);   setShowForm(true); };
  const handleClose  = ()   => { setShowForm(false); setEditTx(null); };

  return (
    <div className="app">
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

      {/* Main */}
      <main className="main-content">
        <header className="topbar">
          <h1 className="page-title">
            {NAV.find(n => n.id === page)?.label}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {page === 'transactions' && (
              <button className="btn-primary" onClick={handleNewTx}>+ Add Transaction</button>
            )}
            {/* User menu */}
            <div style={{ position: 'relative' }}>
              <button
                className="user-avatar-btn"
                onClick={() => setShowUserMenu(v => !v)}
              >
                {user?.name?.[0]?.toUpperCase() || '?'}
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-name">{user?.name}</div>
                  <div className="user-dropdown-email">{user?.email}</div>
                  <hr style={{ borderColor: 'var(--border)', margin: '8px 0' }} />
                  <button className="user-dropdown-logout" onClick={logout}>
                    🚪 Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-area">
          {page === 'dashboard'    && <Dashboard onAddTx={handleNewTx} />}
          {page === 'transactions' && <TransactionList onEdit={handleEditTx} onNew={handleNewTx} />}
          {page === 'categories'   && <CategoryList />}
        </div>
      </main>

      {/* Transaction Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <TransactionForm initialData={editTx} onSaved={handleClose} onCancel={handleClose} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Auth guard ────────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading" style={{ padding: 60 }}>Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/"       element={<HomePage />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/app"    element={<RequireAuth><AppShell /></RequireAuth>} />
          <Route path="*"       element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}