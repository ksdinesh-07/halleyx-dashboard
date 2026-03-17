import React, { useState } from 'react';
import { KPIWidget, BarChartWidget, LineChartWidget, AreaChartWidget, PieChartWidget, ScatterPlotWidget, TableWidget } from '../components/WidgetComponents';

const DATE_LABELS = { all: 'All time', today: 'Today', '7days': 'Last 7 Days', '30days': 'Last 30 Days', '90days': 'Last 90 Days' };

function renderWidget(widget, orders) {
  switch (widget.type) {
    case 'kpi':          return <KPIWidget          widget={widget} data={orders} />;
    case 'bar-chart':    return <BarChartWidget     widget={widget} data={orders} />;
    case 'line-chart':   return <LineChartWidget    widget={widget} data={orders} />;
    case 'area-chart':   return <AreaChartWidget    widget={widget} data={orders} />;
    case 'pie-chart':    return <PieChartWidget     widget={widget} data={orders} />;
    case 'scatter-plot': return <ScatterPlotWidget  widget={widget} data={orders} />;
    case 'table':        return <TableWidget        widget={widget} data={orders} />;
    default:             return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Preview</div>;
  }
}

export default function Dashboard({ layout, orders, allOrders, dateFilter, setDateFilter, onConfigure, onGoToOrders }) {
  const [wWidth]     = useState(window.innerWidth);
  const [selWidget,   setSelWidget] = useState(null);

  const totalOrders    = orders.length;
  const totalRevenue   = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const totalCustomers = new Set(orders.map(o => o.customerId || o.customerName)).size;
  const totalQty       = orders.reduce((s, o) => s + (o.quantity || 0), 0);

  const cols      = wWidth <= 768 ? 4 : wWidth <= 1024 ? 8 : 12;
  const gridClass = wWidth <= 768 ? 'grid-4' : wWidth <= 1024 ? 'grid-8' : 'grid-12';

  const stats = [
    { label: 'Total Orders',    value: totalOrders },
    { label: 'Total Revenue',   value: '$' + totalRevenue.toFixed(2) },
    { label: 'Total Customers', value: totalCustomers },
    { label: 'Total Sold Qty',  value: totalQty },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="db">
        {/* Header */}
        <div className="db-hdr">
          <div className="db-hdr-left">
            <div className="db-title">Customer Orders</div>
            <div className="db-sub">View and manage customer orders and details</div>
            <div className="db-tabs">
              <button className="db-tab" onClick={onGoToOrders}><i className="fas fa-table" />Table</button>
              <button className="db-tab active"><i className="fas fa-th-large" />Dashboard</button>
            </div>
          </div>
          <div className="db-hdr-right">
            <div className="db-date-wrap">
              <span className="db-date-lbl">Show data for</span>
              <select className="db-date-sel" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
                {Object.entries(DATE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <button className="btn btn-outline-primary" onClick={onConfigure}>
              <i className="fas fa-cog" />Configure Dashboard
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="db-stats">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Widgets */}
        {layout.length === 0 ? (
          <div className="db-empty">
            <div className="db-empty-icon">📐</div>
            <div className="db-empty-title">Your dashboard is empty</div>
            <div className="db-empty-sub">Configure your dashboard to start viewing analytics</div>
            <button className="btn btn-primary" onClick={onConfigure}><i className="fas fa-plus-circle" />Configure Dashboard</button>
          </div>
        ) : (
          <div className={'db-grid ' + gridClass}>
            {layout.map(widget => {
              const w = Math.min(widget.width || 4, cols);
              const h = Math.max(widget.height || 3, 3);
              return (
                <div key={widget.id} style={{ gridColumn: 'span ' + w, gridRow: 'span ' + h }}>
                  <div className="w-card" onClick={() => setSelWidget(selWidget?.id === widget.id ? null : widget)}>
                    <div className="w-head">
                      <span className="w-title">{widget.title || widget.type}</span>
                      <div className="w-actions">
                        <button className="w-btn" title="Export CSV" onClick={e => {
                          e.stopPropagation();
                          if (!orders.length) return;
                          const h = Object.keys(orders[0]).join(',');
                          const r = orders.map(row => Object.values(row).join(',')).join('\n');
                          const a = document.createElement('a');
                          a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(h + '\n' + r);
                          a.download = (widget.title || widget.type) + '.csv';
                          a.click();
                        }}><i className="fas fa-download" /></button>
                      </div>
                    </div>
                    <div className="w-body">{renderWidget(widget, orders)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Widget detail modal */}
      {selWidget && (
        <div className="ov" onClick={() => setSelWidget(null)}>
          <div className="om" onClick={e => e.stopPropagation()}>
            <div className="om-h">
              <span className="om-t">{selWidget.title || selWidget.type}</span>
              <button className="om-x" onClick={() => setSelWidget(null)}>×</button>
            </div>
            <div className="om-b">
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}><strong>Type:</strong> {selWidget.type}</p>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}><strong>Size:</strong> {selWidget.width} × {selWidget.height}</p>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}><strong>Data points:</strong> {orders.length}</p>
            </div>
            <div className="om-f"><button className="btn btn-secondary" onClick={() => setSelWidget(null)}>Close</button></div>
          </div>
        </div>
      )}
    </>
  );
}

const CSS = `
.db{max-width:1600px;margin:0 auto;}
.db-hdr{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-xl);padding:1.25rem 1.75rem 0;margin-bottom:1rem;position:relative;}
.db-title{font-size:1.1rem;font-weight:700;color:var(--text-primary);}
.db-sub{font-size:0.8rem;color:var(--text-secondary);margin-top:0.1rem;}
.db-hdr-right{display:flex;align-items:center;gap:0.75rem;position:absolute;right:2rem;top:1.4rem;}
.db-date-wrap{display:flex;align-items:center;gap:0.4rem;}
.db-date-lbl{font-size:0.8rem;color:var(--text-secondary);white-space:nowrap;}
.db-date-sel{padding:0.38rem 0.65rem;border:1px solid var(--border);border-radius:var(--radius-md);font-family:var(--font);font-size:0.82rem;color:var(--text-primary);background:var(--bg-card);outline:none;cursor:pointer;}
.db-date-sel:focus{border-color:var(--primary);}
.btn-outline-primary{background:var(--bg-card);color:var(--primary-dark);border:1px solid var(--primary);display:inline-flex;align-items:center;gap:0.38rem;padding:0.42rem 0.85rem;border-radius:var(--radius-md);font-family:var(--font);font-size:0.82rem;font-weight:500;cursor:pointer;transition:all 0.15s;}
.btn-outline-primary:hover{background:var(--primary-light);}
.db-tabs{display:flex;margin-top:1rem;border-bottom:1px solid var(--border-light);}
.db-tab{display:flex;align-items:center;gap:0.4rem;padding:0.55rem 0;margin-right:1.5rem;font-size:0.82rem;font-weight:500;color:var(--text-secondary);background:none;border:none;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all 0.14s;font-family:var(--font);}
.db-tab:hover{color:var(--text-primary);}
.db-tab.active{color:var(--primary-dark);border-bottom-color:var(--primary);font-weight:600;}
.db-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:0.85rem;margin-bottom:1rem;}
.stat-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.1rem 1.35rem;transition:box-shadow 0.2s;}
.stat-card:hover{box-shadow:var(--shadow-md);}
.stat-value{font-size:1.45rem;font-weight:700;color:var(--text-primary);letter-spacing:-0.4px;}
.stat-label{font-size:0.75rem;color:var(--text-secondary);margin-top:0.2rem;font-weight:500;}
.db-grid{display:grid;gap:0.85rem;}
.grid-12{grid-template-columns:repeat(12,1fr);grid-auto-rows:120px;}
.grid-8{grid-template-columns:repeat(8,1fr);grid-auto-rows:120px;}
.grid-4{grid-template-columns:repeat(4,1fr);grid-auto-rows:120px;}
.w-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);display:flex;flex-direction:column;overflow:hidden;height:100%;transition:box-shadow 0.18s;cursor:pointer;}
.w-card:hover{box-shadow:var(--shadow-md);}
.w-head{display:flex;justify-content:space-between;align-items:center;padding:0.55rem 0.9rem;border-bottom:1px solid var(--border-light);flex-shrink:0;background:var(--bg-page);}
.w-title{font-size:0.82rem;font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.w-actions{display:flex;gap:0.15rem;flex-shrink:0;}
.w-btn{width:24px;height:24px;border:none;background:transparent;cursor:pointer;border-radius:5px;color:var(--text-muted);font-size:0.7rem;display:flex;align-items:center;justify-content:center;transition:all 0.13s;}
.w-btn:hover{background:var(--border-light);color:var(--primary-dark);}
.w-body{flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden;}
.db-empty{background:var(--bg-card);border:2px dashed var(--border);border-radius:var(--radius-xl);padding:4.5rem 2rem;text-align:center;}
.db-empty-icon{font-size:2.5rem;margin-bottom:0.75rem;}
.db-empty-title{font-size:1rem;font-weight:600;color:var(--text-primary);margin-bottom:0.3rem;}
.db-empty-sub{font-size:0.82rem;color:var(--text-secondary);margin-bottom:1.25rem;}
.ov{position:fixed;inset:0;background:rgba(15,23,42,0.38);display:flex;align-items:center;justify-content:center;z-index:2000;padding:1rem;backdrop-filter:blur(2px);}
.om{background:var(--bg-card);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);width:100%;max-width:440px;display:flex;flex-direction:column;animation:omIn 0.2s cubic-bezier(0.22,1,0.36,1);}
@keyframes omIn{from{transform:scale(0.97) translateY(4px);opacity:0;}to{transform:scale(1) translateY(0);opacity:1;}}
.om-h{padding:1.1rem 1.4rem;border-bottom:1px solid var(--border-light);display:flex;justify-content:space-between;align-items:center;}
.om-t{font-size:0.96rem;font-weight:600;color:var(--text-primary);}
.om-x{width:25px;height:25px;border-radius:50%;border:none;background:var(--bg-page);cursor:pointer;font-size:1rem;color:var(--text-secondary);display:flex;align-items:center;justify-content:center;transition:all 0.13s;}
.om-x:hover{background:var(--border);}
.om-b{padding:1.25rem 1.4rem;}
.om-f{padding:0.85rem 1.4rem;border-top:1px solid var(--border-light);display:flex;justify-content:flex-end;gap:0.55rem;}
.btn{display:inline-flex;align-items:center;gap:0.38rem;padding:0.44rem 0.88rem;border-radius:var(--radius-md);font-family:var(--font);font-size:0.82rem;font-weight:500;cursor:pointer;border:1px solid transparent;transition:all 0.15s;white-space:nowrap;}
.btn-primary{background:var(--primary);color:#fff;border-color:var(--primary);}
.btn-primary:hover{background:var(--primary-dark);}
.btn-secondary{background:var(--bg-card);color:var(--text-primary);border-color:var(--border);}
.btn-secondary:hover{background:var(--bg-page);}
@media(max-width:1024px){.db-stats{grid-template-columns:repeat(2,1fr);}.db-hdr-right{position:static;margin-top:0.75rem;}}
@media(max-width:768px){.db-stats{grid-template-columns:1fr 1fr;}}
`;
