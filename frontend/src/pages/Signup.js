import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())          e.name     = 'Name is required';
    if (!form.email)                e.email    = 'Email is required';
    if (form.password.length < 6)   e.password = 'At least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.signup({
        name: form.name, email: form.email, password: form.password,
      });
      const { token, name, email } = res.data.data;
      login(token, { name, email });
      toast.success(`Account created! Welcome, ${name} 🎉`);
      navigate('/app');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" onClick={() => navigate('/')}>💰 ExpenseIQ</div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Free forever. No credit card needed.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your name</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Alex Johnson"
              autoFocus
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="you@example.com"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="Min 6 characters"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={e => set('confirm', e.target.value)}
              placeholder="Repeat password"
            />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Creating account…' : 'Create free account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}