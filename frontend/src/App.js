import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './pages/Dashboard';
import DashboardConfig from './pages/DashboardConfig';
import CustomerOrders from './pages/CustomerOrders';
import './styles/index.css';

function filterOrdersByDate(orders, filter) {
  if (!filter || filter === 'all') return orders;
  const now = new Date(), cutoff = new Date();
  if (filter === 'today')  cutoff.setHours(0, 0, 0, 0);
  if (filter === '7days')  cutoff.setDate(now.getDate() - 7);
  if (filter === '30days') cutoff.setDate(now.getDate() - 30);
  if (filter === '90days') cutoff.setDate(now.getDate() - 90);
  return orders.filter(o => new Date(o.createdAt) >= cutoff);
}

async function resolveUserId() {
  const stored = localStorage.getItem('halleyx_user_id');
  try {
    const res  = await fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: stored || null }) });
    const data = await res.json();
    localStorage.setItem('halleyx_user_id', data.userId);
    return data.userId;
  } catch {
    const fallback = stored || ('user_' + Math.random().toString(36).slice(2, 10));
    localStorage.setItem('halleyx_user_id', fallback);
    return fallback;
  }
}

const NAV_CSS = `
  .app { min-height:100vh; background:var(--bg-page); }
  .navbar { background:var(--bg-card); height:56px; padding:0 2rem; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border); position:sticky; top:0; z-index:200; box-shadow:var(--shadow-sm); }
  .nav-brand { font-size:0.95rem; font-weight:700; color:var(--text-primary); letter-spacing:-0.2px; display:flex; align-items:center; gap:0.5rem; }
  .nav-mark { width:26px; height:26px; background:var(--primary); border-radius:7px; display:flex; align-items:center; justify-content:center; color:white; font-size:0.75rem; font-weight:700; }
  .nav-tabs { display:flex; background:var(--bg-page); border:1px solid var(--border); border-radius:var(--radius-md); padding:3px; gap:0; }
  .nav-tab { padding:0.38rem 1rem; border:none; background:transparent; cursor:pointer; font-family:var(--font); font-size:0.84rem; font-weight:500; color:var(--text-secondary); border-radius:6px; transition:all 0.16s; }
  .nav-tab:hover { background:var(--bg-card); color:var(--text-primary); }
  .nav-tab.active { background:var(--bg-card); color:var(--primary-dark); font-weight:600; box-shadow:var(--shadow-sm); }
  .toast { position:fixed; top:66px; right:1.5rem; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:0.65rem 1rem 0.65rem 0.7rem; font-size:0.84rem; font-weight:500; color:var(--text-primary); display:flex; align-items:center; gap:0.6rem; z-index:9999; box-shadow:var(--shadow-lg); animation:toastIn 0.26s cubic-bezier(0.22,1,0.36,1); max-width:360px; min-width:220px; }
  .toast-dot { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.78rem; color:white; flex-shrink:0; }
  .toast.success .toast-dot { background:var(--primary); }
  .toast.error   .toast-dot { background:var(--danger); }
  .toast-x { margin-left:auto; background:none; border:none; cursor:pointer; color:var(--text-muted); font-size:1rem; line-height:1; padding:2px 0 2px 6px; display:flex; align-items:center; }
  .toast-x:hover { color:var(--text-primary); }
  @keyframes toastIn { from{transform:translateY(-6px);opacity:0} to{transform:translateY(0);opacity:1} }
`;

export default function App() {
  const [page,        setPage]        = useState('orders');
  const [layout,      setLayout]      = useState([]);
  const [orders,      setOrders]      = useState([]);
  const [dateFilter,  setDateFilter]  = useState('all');
  const [toast,       setToast]       = useState({ show: false, message: '', type: '' });
  const [userId,      setUserId]      = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3800);
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const r = await fetch('/api/orders');
      if (!r.ok) throw new Error();
      setOrders(await r.json());
    } catch { showToast('Failed to load orders.', 'error'); }
  }, [showToast]);

  const fetchDashboard = useCallback(async uid => {
    try {
      const r = await fetch('/api/dashboard/' + uid);
      const d = await r.json();
      setLayout(d.widgets || []);
    } catch {}
  }, []);

  useEffect(() => {
    resolveUserId().then(uid => { setUserId(uid); fetchOrders(); fetchDashboard(uid); });
  }, [fetchOrders, fetchDashboard]);

  const saveDashboard = async widgets => {
    if (!userId) return;
    try {
      const r = await fetch('/api/dashboard/' + userId, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ widgets }) });
      if (r.ok) { setLayout(widgets); showToast('Dashboard saved!'); }
    } catch { showToast('Failed to save dashboard.', 'error'); }
  };

  const filtered = filterOrdersByDate(orders, dateFilter);

  return (
    <>
      <style>{NAV_CSS}</style>
      <div className="app">
        {toast.show && (
          <div className={'toast ' + toast.type}>
            <div className="toast-dot"><i className={'fas fa-' + (toast.type === 'success' ? 'check' : 'exclamation')} /></div>
            <span>{toast.message}</span>
            <button className="toast-x" onClick={() => setToast({ show: false, message: '', type: '' })}>×</button>
          </div>
        )}
        <nav className="navbar">
          <div className="nav-brand"><div className="nav-mark">H</div>Halleyx</div>
          <div className="nav-tabs">
            <button className={'nav-tab' + (page === 'orders' ? ' active' : '')} onClick={() => setPage('orders')}>Customer Orders</button>
            <button className={'nav-tab' + (['dashboard', 'config'].includes(page) ? ' active' : '')} onClick={() => setPage('dashboard')}>Dashboard</button>
          </div>
        </nav>
        <main style={{ padding: '1.5rem 2rem' }}>
          {page === 'orders' && (
            <CustomerOrders
              orders={orders}
              onOrdersChange={fetchOrders}
              showToast={showToast}
              onGoToDashboard={() => setPage('dashboard')}
            />
          )}
          {page === 'dashboard' && (
            <Dashboard
              layout={layout}
              orders={filtered}
              allOrders={orders}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              onConfigure={() => setPage('config')}
              onGoToOrders={() => setPage('orders')}
            />
          )}
          {page === 'config' && (
            <DashboardConfig
              layout={layout}
              orders={orders}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              onSave={async w => { await saveDashboard(w); setPage('dashboard'); }}
              onCancel={() => setPage('dashboard')}
              showToast={showToast}
            />
          )}
        </main>
      </div>
    </>
  );
}
