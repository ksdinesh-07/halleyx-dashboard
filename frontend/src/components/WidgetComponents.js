import React from 'react';

const FIELD_LABELS = {
  id: 'Customer ID', customerName: 'Customer Name', email: 'Email',
  streetAddress: 'Address', createdAt: 'Order Date', product: 'Product',
  createdBy: 'Created By', status: 'Status', totalAmount: 'Total Amount',
  unitPrice: 'Unit Price', quantity: 'Quantity', phone: 'Phone',
};
const COLORS = ['#54bd95', '#3d9b75', '#f59e0b', '#6366f1', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6'];

function groupBy(data, xField, yField, agg) {
  const g = {};
  data.forEach(item => {
    const key = String(item[xField] || 'Unknown');
    if (!g[key]) g[key] = [];
    const n = parseFloat(item[yField]);
    if (!isNaN(n)) g[key].push(n);
  });
  return Object.entries(g).map(([name, vals]) => {
    let value = 0;
    if (vals.length) {
      if (agg === 'sum')     value = vals.reduce((a, b) => a + b, 0);
      else if (agg === 'average') value = vals.reduce((a, b) => a + b, 0) / vals.length;
      else if (agg === 'count')   value = vals.length;
      else if (agg === 'min')     value = Math.min(...vals);
      else if (agg === 'max')     value = Math.max(...vals);
    }
    return { name, value: parseFloat(value.toFixed(2)) };
  });
}

function noData(msg = 'Configure chart') {
  return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>{msg}</div>;
}
function AxisInfo({ x, y, agg }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', padding: '0.3rem 0 0', justifyContent: 'center', flexShrink: 0 }}>
      {x   && <span style={{ background: 'var(--border-light)', border: '1px solid var(--border)', borderRadius: 5, padding: '0.12rem 0.4rem', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>X: {FIELD_LABELS[x] || x}</span>}
      {y   && <span style={{ background: 'var(--border-light)', border: '1px solid var(--border)', borderRadius: 5, padding: '0.12rem 0.4rem', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Y: {FIELD_LABELS[y] || y}</span>}
      {agg && <span style={{ background: 'var(--border-light)', border: '1px solid var(--border)', borderRadius: 5, padding: '0.12rem 0.4rem', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{agg}</span>}
    </div>
  );
}

/* ── KPI ──────────────────────────────────────────────────────────────────── */
export const KPIWidget = ({ widget, data }) => {
  const { metric, aggregation, dataFormat = 'number', decimalPrecision = 0 } = widget.config || {};
  const calc = () => {
    if (!data || !data.length || !metric || !aggregation) return null;
    if (aggregation === 'count') return data.length;
    const nums = data.map(d => parseFloat(d[metric])).filter(v => !isNaN(v));
    if (!nums.length) return 0;
    if (aggregation === 'sum')     return nums.reduce((a, b) => a + b, 0);
    if (aggregation === 'average') return nums.reduce((a, b) => a + b, 0) / nums.length;
    if (aggregation === 'min')     return Math.min(...nums);
    if (aggregation === 'max')     return Math.max(...nums);
    return 0;
  };
  const fmt = v => {
    if (v === null) return '—';
    const opts = { minimumFractionDigits: decimalPrecision, maximumFractionDigits: decimalPrecision };
    if (dataFormat === 'currency') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', ...opts }).format(v);
    return new Intl.NumberFormat('en-US', opts).format(v);
  };
  const value = calc();
  let trend = 0;
  if (metric && data.length >= 2) {
    const half = Math.ceil(data.length / 2);
    const sum  = sl => sl.map(d => parseFloat(d[metric])).filter(v => !isNaN(v)).reduce((a, b) => a + b, 0);
    const prev = sum(data.slice(0, half)), curr = sum(data.slice(half));
    trend = prev > 0 ? ((curr - prev) / prev) * 100 : 0;
  }
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center', gap: '0.4rem' }}>
      {metric && aggregation
        ? <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{FIELD_LABELS[metric] || metric}</div>
        : <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Configure widget</div>}
      <div style={{ fontSize: 'clamp(1.5rem,4vw,2.4rem)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{fmt(value)}</div>
      {metric && aggregation && (
        <div style={{ fontSize: '0.71rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.18rem 0.45rem', borderRadius: '20px', fontWeight: 600, background: trend >= 0 ? 'var(--primary-light)' : '#fee2e2', color: trend >= 0 ? 'var(--primary-dark)' : '#991b1b' }}>
          <i className={'fas fa-arrow-' + (trend >= 0 ? 'up' : 'down')} style={{ fontSize: '0.65rem' }} />
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
};

/* ── Bar Chart ────────────────────────────────────────────────────────────── */
export const BarChartWidget = ({ widget, data }) => {
  const { xAxis, yAxis, aggregation = 'sum', chartColor = '#54bd95', showDataLabel = false } = widget.config || {};
  const chartData = (xAxis && yAxis && data.length > 0) ? groupBy(data, xAxis, yAxis, aggregation).slice(0, 8) : null;
  if (!chartData) return <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0.75rem' }}>{noData()}</div>;
  const maxVal = Math.max(...chartData.map(d => d.value), 1);
  const W = 320, H = 130, pad = { l: 36, r: 8, t: showDataLabel ? 18 : 8, b: 30 };
  const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
  const n = chartData.length, barW = Math.min(32, iW / n * 0.6), step = iW / n;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0.5rem 0.75rem 0.25rem', minHeight: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ flex: 1, width: '100%', minHeight: 0 }}>
        {[0, 0.25, 0.5, 0.75, 1].map((g, gi) => {
          const y = pad.t + iH * (1 - g);
          return <g key={gi}><line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="var(--border-light)" strokeWidth="0.5" /><text x={pad.l - 3} y={y + 3} textAnchor="end" fontSize="7" fill="var(--text-muted)">{(maxVal * g).toFixed(0)}</text></g>;
        })}
        {chartData.map((d, i) => {
          const x = pad.l + i * step + step / 2 - barW / 2;
          const barH = (d.value / maxVal) * iH, y = pad.t + iH - barH;
          return <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={chartColor} rx="2" opacity="0.9" />
            {showDataLabel && <text x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize="6.5" fill="var(--text-secondary)">{d.value}</text>}
            <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize="7" fill="var(--text-muted)">{String(d.name).slice(0, 6)}</text>
          </g>;
        })}
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + iH} stroke="var(--border)" strokeWidth="0.8" />
        <line x1={pad.l} y1={pad.t + iH} x2={W - pad.r} y2={pad.t + iH} stroke="var(--border)" strokeWidth="0.8" />
      </svg>
      <AxisInfo x={xAxis} y={yAxis} agg={aggregation} />
    </div>
  );
};

/* ── Line Chart ───────────────────────────────────────────────────────────── */
export const LineChartWidget = ({ widget, data }) => {
  const { xAxis, yAxis, aggregation = 'sum', chartColor = '#54bd95', showDataLabel = false } = widget.config || {};
  const chartData = (xAxis && yAxis && data.length > 0) ? groupBy(data, xAxis, yAxis, aggregation).slice(0, 12) : null;
  if (!chartData) return <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0.75rem' }}>{noData()}</div>;
  const vals = chartData.map(d => d.value);
  const maxVal = Math.max(...vals, 1), minVal = Math.min(...vals, 0), range = maxVal - minVal || 1;
  const W = 320, H = 130, pad = { l: 36, r: 8, t: showDataLabel ? 18 : 10, b: 30 };
  const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
  const pts = chartData.map((d, i) => ({ x: pad.l + i * (iW / (chartData.length - 1 || 1)), y: pad.t + iH - ((d.value - minVal) / range) * iH, val: d.value, name: d.name }));
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0.5rem 0.75rem 0.25rem', minHeight: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ flex: 1, width: '100%', minHeight: 0 }}>
        {[0, 0.25, 0.5, 0.75, 1].map((g, gi) => {
          const y = pad.t + iH * (1 - g);
          return <g key={gi}><line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="var(--border-light)" strokeWidth="0.5" /><text x={pad.l - 3} y={y + 3} textAnchor="end" fontSize="7" fill="var(--text-muted)">{(minVal + range * g).toFixed(0)}</text></g>;
        })}
        <polyline points={pts.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={chartColor} strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
        {pts.map((p, i) => <g key={i}>
          <circle cx={p.x} cy={p.y} r="2.8" fill="white" stroke={chartColor} strokeWidth="1.6" vectorEffect="non-scaling-stroke"><title>{p.name}: {p.val}</title></circle>
          {showDataLabel && <text x={p.x} y={p.y - 5} textAnchor="middle" fontSize="6.5" fill="var(--text-secondary)">{p.val}</text>}
          <text x={p.x} y={H - 4} textAnchor="middle" fontSize="7" fill="var(--text-muted)">{String(p.name).slice(0, 5)}</text>
        </g>)}
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + iH} stroke="var(--border)" strokeWidth="0.8" />
        <line x1={pad.l} y1={pad.t + iH} x2={W - pad.r} y2={pad.t + iH} stroke="var(--border)" strokeWidth="0.8" />
      </svg>
      <AxisInfo x={xAxis} y={yAxis} agg={aggregation} />
    </div>
  );
};

/* ── Area Chart ───────────────────────────────────────────────────────────── */
export const AreaChartWidget = ({ widget, data }) => {
  const { xAxis, yAxis, aggregation = 'sum', chartColor = '#54bd95' } = widget.config || {};
  const chartData = (xAxis && yAxis && data.length > 0) ? groupBy(data, xAxis, yAxis, aggregation).slice(0, 12) : null;
  if (!chartData) return <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0.75rem' }}>{noData()}</div>;
  const vals = chartData.map(d => d.value);
  const maxVal = Math.max(...vals, 1), minVal = Math.min(...vals, 0), range = maxVal - minVal || 1;
  const W = 320, H = 130, pad = { l: 36, r: 8, t: 10, b: 30 };
  const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
  const pts = chartData.map((d, i) => ({ x: pad.l + i * (iW / (chartData.length - 1 || 1)), y: pad.t + iH - ((d.value - minVal) / range) * iH, name: d.name, val: d.value }));
  const linePts = pts.map(p => `${p.x},${p.y}`).join(' ');
  const areaPts = `${pad.l},${pad.t + iH} ${linePts} ${pts[pts.length - 1].x},${pad.t + iH}`;
  const gId = 'ag' + Math.abs(widget.id?.charCodeAt(0) || 0);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0.5rem 0.75rem 0.25rem', minHeight: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ flex: 1, width: '100%', minHeight: 0 }}>
        <defs><linearGradient id={gId} x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={chartColor} stopOpacity="0.55" /><stop offset="100%" stopColor={chartColor} stopOpacity="0.03" /></linearGradient></defs>
        {[0, 0.25, 0.5, 0.75, 1].map((g, gi) => {
          const y = pad.t + iH * (1 - g);
          return <g key={gi}><line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="var(--border-light)" strokeWidth="0.5" /><text x={pad.l - 3} y={y + 3} textAnchor="end" fontSize="7" fill="var(--text-muted)">{(minVal + range * g).toFixed(0)}</text></g>;
        })}
        <polygon points={areaPts} fill={`url(#${gId})`} />
        <polyline points={linePts} fill="none" stroke={chartColor} strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
        {pts.map((p, i) => <g key={i}>
          <circle cx={p.x} cy={p.y} r="2.5" fill="white" stroke={chartColor} strokeWidth="1.5" vectorEffect="non-scaling-stroke"><title>{p.name}: {p.val}</title></circle>
          <text x={p.x} y={H - 4} textAnchor="middle" fontSize="7" fill="var(--text-muted)">{String(p.name).slice(0, 5)}</text>
        </g>)}
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + iH} stroke="var(--border)" strokeWidth="0.8" />
        <line x1={pad.l} y1={pad.t + iH} x2={W - pad.r} y2={pad.t + iH} stroke="var(--border)" strokeWidth="0.8" />
      </svg>
      <AxisInfo x={xAxis} y={yAxis} agg={aggregation} />
    </div>
  );
};

/* ── Pie Chart ────────────────────────────────────────────────────────────── */
export const PieChartWidget = ({ widget, data }) => {
  const { chartData: field, showLegend = true } = widget.config || {};
  let slices;
  if (field && data.length > 0) {
    const counts = {};
    data.forEach(item => { const k = String(item[field] || 'Unknown'); counts[k] = (counts[k] || 0) + 1; });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    slices = Object.entries(counts).slice(0, 7).map(([label, count], i) => ({
      pct: (count / total) * 100,
      color: COLORS[i % COLORS.length],
      label,
      displayLabel: FIELD_LABELS[label] || label,
      count,
    }));
  } else {
    slices = [
      { pct: 35, color: COLORS[0], label: 'A', displayLabel: 'Category A' },
      { pct: 25, color: COLORS[1], label: 'B', displayLabel: 'Category B' },
      { pct: 22, color: COLORS[2], label: 'C', displayLabel: 'Category C' },
      { pct: 18, color: COLORS[3], label: 'D', displayLabel: 'Category D' },
    ];
  }
  let cum = 0;
  const paths = slices.map(s => {
    const start = cum, end = cum + (s.pct / 100) * 360; cum = end;
    const sR = (start - 90) * Math.PI / 180, eR = (end - 90) * Math.PI / 180;
    const x1 = (50 + 38 * Math.cos(sR)).toFixed(2), y1 = (50 + 38 * Math.sin(sR)).toFixed(2);
    const x2 = (50 + 38 * Math.cos(eR)).toFixed(2), y2 = (50 + 38 * Math.sin(eR)).toFixed(2);
    return { d: `M 50 50 L ${x1} ${y1} A 38 38 0 ${s.pct > 50 ? 1 : 0} 1 ${x2} ${y2} Z`, color: s.color, label: s.displayLabel, pct: s.pct };
  });
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem 0.75rem', gap: '0.5rem', minHeight: 0 }}>
      {field && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{FIELD_LABELS[field] || field} Distribution</div>}
      <svg viewBox="0 0 100 100" style={{ width: '100%', maxHeight: 140, flex: 1 }}>
        {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} stroke="white" strokeWidth="0.8"><title>{p.label}: {p.pct.toFixed(1)}%</title></path>)}
      </svg>
      {showLegend && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', justifyContent: 'center', flexShrink: 0 }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'var(--bg-page)', padding: '0.15rem 0.4rem', borderRadius: 20, border: '1px solid var(--border)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              {s.displayLabel} ({s.pct.toFixed(0)}%)
            </div>
          ))}
        </div>
      )}
      {!field && <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Configure chart data</div>}
    </div>
  );
};

/* ── Scatter Plot ─────────────────────────────────────────────────────────── */
export const ScatterPlotWidget = ({ widget, data }) => {
  const { xAxis, yAxis, chartColor = '#54bd95' } = widget.config || {};
  let points;
  if (xAxis && yAxis && data.length > 0) {
    const valid = data.filter(d => !isNaN(parseFloat(d[xAxis])) && !isNaN(parseFloat(d[yAxis])));
    if (valid.length > 0) {
      const xs = valid.map(d => parseFloat(d[xAxis])), ys = valid.map(d => parseFloat(d[yAxis]));
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      const rX = maxX - minX || 1, rY = maxY - minY || 1;
      points = valid.slice(0, 50).map(d => ({ x: 10 + ((parseFloat(d[xAxis]) - minX) / rX) * 80, y: 90 - ((parseFloat(d[yAxis]) - minY) / rY) * 80, lx: d[xAxis], ly: d[yAxis] }));
    } else points = [];
  } else {
    points = [{ x: 15, y: 70 }, { x: 25, y: 50 }, { x: 38, y: 72 }, { x: 48, y: 38 }, { x: 58, y: 58 }, { x: 68, y: 28 }, { x: 78, y: 62 }, { x: 88, y: 44 }];
  }
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0.5rem 0.75rem 0.25rem', minHeight: 0 }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ flex: 1, width: '100%', minHeight: 0 }}>
        {[0, 25, 50, 75, 100].map(g => <line key={g} x1="10" y1={10 + g * 0.8} x2="90" y2={10 + g * 0.8} stroke="var(--border-light)" strokeWidth="0.4" />)}
        {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={chartColor} fillOpacity="0.75" vectorEffect="non-scaling-stroke"><title>{p.lx !== undefined ? `X:${p.lx} Y:${p.ly}` : ''}</title></circle>)}
        <line x1="10" y1="10" x2="10" y2="90" stroke="var(--border)" strokeWidth="0.8" />
        <line x1="10" y1="90" x2="90" y2="90" stroke="var(--border)" strokeWidth="0.8" />
      </svg>
      <AxisInfo x={xAxis} y={yAxis} />
    </div>
  );
};

/* ── Table ────────────────────────────────────────────────────────────────── */
export const TableWidget = ({ widget, data }) => {
  const { columns = [], sortBy, pagination = 10, applyFilter = false, filters = [], headerColor = '#54bd95', fontSize = 14 } = widget.config || {};
  if (!columns.length) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-muted)', padding: '1rem' }}>
      <i className="fas fa-table" style={{ fontSize: '1.3rem', color: 'var(--primary)' }} />
      <p style={{ fontSize: '0.82rem' }}>Select columns in settings</p>
    </div>
  );
  let rows = [...data];
  if (applyFilter && filters.length) {
    filters.forEach(f => {
      if (!f.field || !f.value) return;
      rows = rows.filter(row => {
        const cell = String(row[f.field] || '').toLowerCase(), val = f.value.toLowerCase(), num = parseFloat(row[f.field]);
        if (f.operator === 'equals')   return cell === val;
        if (f.operator === 'contains') return cell.includes(val);
        if (f.operator === 'gt')       return !isNaN(num) && num > parseFloat(f.value);
        if (f.operator === 'lt')       return !isNaN(num) && num < parseFloat(f.value);
        return true;
      });
    });
  }
  if (sortBy) { const [sf, so] = sortBy.split(':'); rows.sort((a, b) => { const av = a[sf] || '', bv = b[sf] || ''; return so === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1); }); }
  const shown = rows.slice(0, parseInt(pagination) || 10);
  const fmt = (col, row) => {
    const v = row[col];
    if (col === 'totalAmount' || col === 'unitPrice') return '$' + parseFloat(v || 0).toFixed(2);
    if (col === 'createdAt' && v) return new Date(v).toLocaleDateString();
    return v || '—';
  };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fontSize + 'px' }}>
          <thead>
            <tr>{columns.map(c => <th key={c} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', background: headerColor, color: 'white', whiteSpace: 'nowrap', position: 'sticky', top: 0 }}>{FIELD_LABELS[c] || c}</th>)}</tr>
          </thead>
          <tbody>
            {shown.length > 0 ? shown.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'white' : 'var(--bg-page)' }}>
                {columns.map(c => <td key={c} style={{ padding: '0.45rem 0.75rem', borderBottom: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{fmt(c, row)}</td>)}
              </tr>
            )) : (
              <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.82rem' }}>No data</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', textAlign: 'right' }}>
        Showing {shown.length} of {rows.length}{applyFilter && filters.length ? ' (filtered)' : ''}
      </div>
    </div>
  );
};
