import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '📊', title: 'Smart Dashboard',    desc: 'Visual charts to see where your money goes at a glance.' },
  { icon: '💳', title: 'Track Transactions', desc: 'Log income and expenses in seconds with categories.' },
  { icon: '🏷️', title: 'Custom Categories',  desc: 'Create categories that match your lifestyle.' },
  { icon: '📅', title: 'Monthly Reports',    desc: 'See spending trends month by month.' },
];

const steps = [
  { n: '1', title: 'Create account', desc: 'Sign up free in under 30 seconds.' },
  { n: '2', title: 'Add transactions', desc: 'Log your first expense or income.' },
  { n: '3', title: 'Watch your money', desc: 'Dashboard updates instantly with insights.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  return (
    <div className="home">
      {/* NAV */}
      <nav className="home-nav">
        <div className="home-nav-logo">💰 ExpenseIQ</div>
        <div className="home-nav-links">
          {user ? (
            <button className="btn-primary" onClick={() => navigate('/app')}>
              Go to Dashboard →
            </button>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => navigate('/login')}>Log in</button>
              <button className="btn-primary" onClick={() => navigate('/signup')}>Get started free</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">✨ Built for Gen Z & Millennials</div>
        <h1 className="hero-title">
          Take control of your<br />
          <span className="hero-accent">money. Finally.</span>
        </h1>
        <p className="hero-sub">
          ExpenseIQ helps you track income, expenses and savings — with beautiful
          charts that actually make sense. Free forever.
        </p>
        <div className="hero-cta">
          <button className="btn-hero" onClick={() => navigate(user ? '/app' : '/signup')}>
            Start tracking for free
          </button>
          <button className="btn-ghost-lg" onClick={() => navigate('/login')}>
            Already have an account?
          </button>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><span>100%</span> Free</div>
          <div className="hero-stat-divider" />
          <div className="hero-stat"><span>30s</span> Setup</div>
          <div className="hero-stat-divider" />
          <div className="hero-stat"><span>∞</span> Transactions</div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <h2 className="section-heading">Everything you need</h2>
        <p className="section-sub">No bloat. Just the tools that matter for your finances.</p>
        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <h2 className="section-heading">Up and running in 60 seconds</h2>
        <div className="steps-row">
          {steps.map((s, i) => (
            <React.Fragment key={s.n}>
              <div className="step-card">
                <div className="step-number">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
              {i < steps.length - 1 && <div className="step-arrow">→</div>}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <h2>Ready to stop wondering where your money went?</h2>
        <button className="btn-hero" onClick={() => navigate(user ? '/app' : '/signup')}>
          Create your free account
        </button>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <span>💰 ExpenseIQ</span>
        <span>Built with power!</span>
      </footer>
    </div>
  );
}