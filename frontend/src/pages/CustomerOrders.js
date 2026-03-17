import React, { useState, useMemo } from 'react';

const COUNTRIES = ['United States', 'Canada', 'Australia', 'Singapore', 'Hong Kong'];
const PRODUCTS  = ['VoIP Corporate Package', 'Business Internet 500 Mbps', 'Fiber Internet 1 Gbps', '5G Unlimited Mobile Plan', 'Fiber Internet 300 Mbps'];
const AGENTS    = ['Mr. Michael Harris', 'Mr. Ryan Cooper', 'Ms. Olivia Carter', 'Mr. Lucas Martin'];
const STATUSES  = ['Pending', 'In progress', 'Completed'];

const blankForm = () => ({
  firstName: '', lastName: '', email: '', phone: '',
  streetAddress: '', city: '', state: '', postalCode: '', country: 'United States',
  product: '', quantity: 1, unitPrice: '', status: 'Pending', createdBy: '',
});

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function statusBadge(s) {
  const cls = s === 'Completed' ? 'badge-complete' : s === 'In progress' ? 'badge-progress' : 'badge-pending';
  return <span className={'badge ' + cls}>{s}</span>;
}

function FloatInput({ label, name, value, onChange, error, type = 'text', readOnly = false, required = true }) {
  const filled = value !== undefined && value !== '';
  return (
    <div className={'ff' + (error ? ' ff-err' : '') + (readOnly ? ' ff-ro' : '') + (filled ? ' ff-has' : '')}>
      <input type={type} name={name} value={value} onChange={onChange} placeholder=" " readOnly={readOnly} autoComplete="off" />
      <label>{label}{required && !readOnly && <span className="req">*</span>}</label>
      {error && <span className="ferr">{error}</span>}
    </div>
  );
}

function FloatSelect({ label, name, value, onChange, error, options, required = true }) {
  return (
    <div className={'ff ff-sel' + (error ? ' ff-err' : '') + (value ? ' ff-has' : '')}>
      <select name={name} value={value} onChange={onChange}>
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <label className="label-up">{label}{required && <span className="req">*</span>}</label>
      <span className="chev">▾</span>
      {error && <span className="ferr">{error}</span>}
    </div>
  );
}

function CurrencyInput({ label, name, value, onChange, error, readOnly = false }) {
  const filled = value !== undefined && value !== '';
  return (
    <div className={'ff ff-cur' + (error ? ' ff-err' : '') + (readOnly ? ' ff-ro' : '') + (filled ? ' ff-has' : '')}>
      <span className="dollar">$</span>
      <input type={readOnly ? 'text' : 'number'} name={name} value={value} onChange={onChange} placeholder=" " readOnly={readOnly} min="0" step="0.01" autoComplete="off" />
      <label className={filled ? 'label-up' : ''}>{label}<span className="req">*</span></label>
      {error && <span className="ferr">{error}</span>}
    </div>
  );
}

function QtyInput({ value, onChange, error }) {
  const inc = () => onChange({ target: { name: 'quantity', value: Math.max(1, (parseInt(value) || 1) + 1) } });
  const dec = () => onChange({ target: { name: 'quantity', value: Math.max(1, (parseInt(value) || 1) - 1) } });
  return (
    <div className={'ff ff-qty ff-has' + (error ? ' ff-err' : '')}>
      <input type="number" name="quantity" value={value} onChange={onChange} placeholder=" " min="1" />
      <label className="label-up">Quantity<span className="req">*</span></label>
      <div className="spinners">
        <button type="button" onClick={inc}>▲</button>
        <button type="button" onClick={dec}>▼</button>
      </div>
      {error && <span className="ferr">{error}</span>}
    </div>
  );
}

function OrderModal({ editing, onClose, onSaved }) {
  const init = editing ? {
    firstName:     editing.firstName || (editing.customerName || '').split(' ')[0] || '',
    lastName:      editing.lastName  || (editing.customerName || '').split(' ').slice(1).join(' ') || '',
    email:         editing.email         || '',
    phone:         editing.phone         || '',
    streetAddress: editing.streetAddress || '',
    city:          editing.city          || '',
    state:         editing.state         || '',
    postalCode:    editing.postalCode    || '',
    country:       editing.country       || 'United States',
    product:       editing.product       || '',
    quantity:      editing.quantity      || 1,
    unitPrice:     editing.unitPrice     || '',
    status:        editing.status        || 'Pending',
    createdBy:     editing.createdBy     || '',
  } : blankForm();

  const [form,   setForm]   = useState(init);
  const [errors, setErrors] = useState({});
  const [busy,   setBusy]   = useState(false);

  const total = useMemo(() => ((parseFloat(form.quantity) || 0) * (parseFloat(form.unitPrice) || 0)).toFixed(2), [form.quantity, form.unitPrice]);
  const set   = e => { const { name, value } = e.target; setForm(f => ({ ...f, [name]: value })); if (errors[name]) setErrors(r => ({ ...r, [name]: null })); };

  const validate = () => {
    const e = {};
    ['firstName', 'lastName', 'email', 'phone', 'streetAddress', 'city', 'state', 'postalCode'].forEach(k => { if (!form[k]?.trim()) e[k] = 'Please fill the field'; });
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.country)  e.country  = 'Please fill the field';
    if (!form.product)  e.product  = 'Please fill the field';
    if (!form.quantity || parseInt(form.quantity) < 1) e.quantity = 'Quantity must be at least 1';
    if (!form.unitPrice || parseFloat(form.unitPrice) <= 0) e.unitPrice = 'Please fill the field';
    if (!form.status)   e.status   = 'Please fill the field';
    if (!form.createdBy) e.createdBy = 'Please fill the field';
    return e;
  };

  const submit = async () => {
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    setBusy(true);
    const payload = { ...form, customerName: form.firstName.trim() + ' ' + form.lastName.trim(), quantity: parseInt(form.quantity), unitPrice: parseFloat(form.unitPrice), totalAmount: parseFloat(total) };
    if (editing) { payload.id = editing.id; payload.customerId = editing.customerId; }
    try {
      const res = await fetch(editing ? '/api/orders/' + editing.id : '/api/orders', { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        const saved = await res.json();
        onSaved(editing ? 'Order updated successfully!' : `Nice work! Your new order "${saved.id}" is now in the list!`, saved);
      } else { const d = await res.json(); setErrors({ _: d.error || 'Failed' }); }
    } catch { setErrors({ _: 'Network error' }); } finally { setBusy(false); }
  };

  return (
    <div className="ov" onClick={onClose}>
      <div className="om" onClick={e => e.stopPropagation()}>
        <div className="om-h"><span className="om-t">{editing ? 'Edit order' : 'Create order'}</span><button className="om-x" onClick={onClose}>×</button></div>
        <div className="om-b">
          {errors._ && <div className="om-banner">{errors._}</div>}
          <div className="sec-lbl">Customer Information</div>
          <div className="row2">
            <FloatInput label="First name"    name="firstName" value={form.firstName} onChange={set} error={errors.firstName} />
            <FloatInput label="Email id"      name="email"     value={form.email}     onChange={set} error={errors.email} />
          </div>
          <div className="row2">
            <FloatInput label="Last name"     name="lastName"  value={form.lastName}  onChange={set} error={errors.lastName} />
            <FloatInput label="Phone number"  name="phone"     value={form.phone}     onChange={set} error={errors.phone} />
          </div>
          <FloatInput label="Street Address" name="streetAddress" value={form.streetAddress} onChange={set} error={errors.streetAddress} />
          <div className="row2">
            <FloatInput label="City"             name="city"       value={form.city}       onChange={set} error={errors.city} />
            <FloatInput label="State / Province" name="state"      value={form.state}      onChange={set} error={errors.state} />
          </div>
          <div className="row2">
            <FloatInput label="Postal code" name="postalCode" value={form.postalCode} onChange={set} error={errors.postalCode} />
            <FloatSelect label="Country"    name="country"    value={form.country}    onChange={set} error={errors.country}    options={COUNTRIES} />
          </div>
          <div className="sec-lbl" style={{ marginTop: '1rem' }}>Order Information</div>
          <FloatSelect label="Choose product" name="product" value={form.product} onChange={set} error={errors.product} options={PRODUCTS} />
          <div className="row2">
            <QtyInput value={form.quantity} onChange={set} error={errors.quantity} />
            <CurrencyInput label="Unit price" name="unitPrice" value={form.unitPrice} onChange={set} error={errors.unitPrice} />
          </div>
          <div className="row2">
            <CurrencyInput label="Total amount" name="_t" value={total} readOnly />
            <FloatSelect label="Status" name="status" value={form.status} onChange={set} error={errors.status} options={STATUSES} />
          </div>
          <FloatSelect label="Created by" name="createdBy" value={form.createdBy} onChange={set} error={errors.createdBy} options={AGENTS} />
        </div>
        <div className="om-f">
          <button className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn btn-primary"   onClick={submit}  disabled={busy}>{busy ? 'Saving…' : 'Submit'}</button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ orderId, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const del = async () => { setBusy(true); try { const r = await fetch('/api/orders/' + orderId, { method: 'DELETE' }); if (r.ok) onDeleted(); } catch {} finally { setBusy(false); } };
  return (
    <div className="ov" onClick={onClose}>
      <div className="om" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <div className="om-h"><span className="om-t">Delete Order</span><button className="om-x" onClick={onClose}>×</button></div>
        <div className="om-b" style={{ textAlign: 'center', padding: '1.75rem 1.5rem' }}>
          <div style={{ fontSize: '1.75rem', color: 'var(--danger)', marginBottom: '0.5rem' }}><i className="fas fa-trash-alt" /></div>
          <div style={{ fontWeight: 600, fontSize: '0.94rem', marginBottom: '0.3rem' }}>Delete this order?</div>
          <div style={{ fontSize: '0.81rem', color: 'var(--text-secondary)' }}>This action cannot be undone.</div>
        </div>
        <div className="om-f"><button className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancel</button><button className="btn btn-danger" onClick={del} disabled={busy}>{busy ? 'Deleting…' : 'Delete'}</button></div>
      </div>
    </div>
  );
}

export default function CustomerOrders({ orders, onOrdersChange, showToast, onGoToDashboard }) {
  const [search,     setSearch]     = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editOrder,  setEditOrder]  = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);
  const [openMenu,   setOpenMenu]   = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return orders;
    return orders.filter(o =>
      (o.customerName || '').toLowerCase().includes(q) ||
      (o.email        || '').toLowerCase().includes(q) ||
      (o.id           || '').toLowerCase().includes(q) ||
      (o.customerId   || '').toLowerCase().includes(q)
    );
  }, [orders, search]);

  const handleSaved   = async msg => { setShowCreate(false); setEditOrder(null); await onOrdersChange(); showToast(msg); };
  const handleDeleted = async ()  => { setDeleteId(null); await onOrdersChange(); showToast('Order deleted successfully.'); };

  return (
    <>
      <style>{CSS}</style>
      <div className="co-page">
        <div className="co-hdr">
          <div className="co-title">Customer Orders</div>
          <div className="co-sub">View and manage customer orders and details</div>
          <div className="co-tabs">
            <button className="co-tab active"><i className="fas fa-table" /> Table</button>
            <button className="co-tab" onClick={onGoToDashboard}><i className="fas fa-th-large" /> Dashboard</button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="co-empty">
            <div className="co-ei"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="26" height="26"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="9" x2="9" y2="21" /></svg></div>
            <div className="co-et">No Orders Yet</div>
            <div className="co-es">Click Create Order and enter your order information</div>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}><i className="fas fa-plus-circle" /> Create order</button>
          </div>
        ) : (
          <>
            <div className="co-bar">
              <div className="co-srch"><i className="fas fa-search srch-icon" /><input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}><i className="fas fa-plus-circle" /> Create order</button>
            </div>
            <div className="co-tw">
              <table className="co-tbl">
                <thead>
                  <tr>
                    <th className="th-sno">S.No</th>
                    <th className="th-custid">Customer ID</th>
                    <th className="th-name">Customer Name</th>
                    <th className="th-email">Email ID</th>
                    <th className="th-phone">Phone</th>
                    <th className="th-addr">Address</th>
                    <th className="th-ordid">Order ID</th>
                    <th className="th-date">Order Date</th>
                    <th className="th-prod">Product</th>
                    <th className="th-qty">Qty</th>
                    <th className="th-price">Unit Price</th>
                    <th className="th-total">Total</th>
                    <th className="th-status">Status</th>
                    <th className="th-agent">Created By</th>
                    <th className="th-act"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o, i) => {
                    const addr = [o.streetAddress, o.city, o.state, o.postalCode, o.country].filter(Boolean).join(', ');
                    return (
                      <tr key={o.id}>
                        <td className="th-sno">{i + 1}</td>
                        <td className="th-custid ti">{o.customerId}</td>
                        <td className="th-name tn">{o.customerName}</td>
                        <td className="th-email">{o.email}</td>
                        <td className="th-phone">{o.phone}</td>
                        <td className="th-addr td-wrap" title={addr}>{addr}</td>
                        <td className="th-ordid to">{o.id}</td>
                        <td className="th-date">{formatDate(o.createdAt)}</td>
                        <td className="th-prod td-clip" title={o.product}>{o.product}</td>
                        <td className="th-qty">{o.quantity}</td>
                        <td className="th-price">${parseFloat(o.unitPrice   || 0).toFixed(2)}</td>
                        <td className="th-total">${parseFloat(o.totalAmount || 0).toFixed(2)}</td>
                        <td className="th-status">{statusBadge(o.status)}</td>
                        <td className="th-agent td-clip">{o.createdBy}</td>
                        <td className="th-act">
                          <div style={{ position: 'relative' }}>
                            <button className="kbtn" onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === o.id ? null : o.id); }}>⋮</button>
                            {openMenu === o.id && (
                              <div className="kmenu">
                                <button className="ki"     onClick={() => { setEditOrder(o);  setOpenMenu(null); }}><i className="fas fa-edit" />Edit</button>
                                <button className="ki ki-d" onClick={() => { setDeleteId(o.id); setOpenMenu(null); }}><i className="fas fa-trash-alt" />Delete</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && search && <div className="co-no-res">No orders match "{search}"</div>}
            </div>
          </>
        )}
      </div>

      {(showCreate || editOrder) && <OrderModal editing={editOrder} onClose={() => { setShowCreate(false); setEditOrder(null); }} onSaved={handleSaved} />}
      {deleteId && <DeleteConfirm orderId={deleteId} onClose={() => setDeleteId(null)} onDeleted={handleDeleted} />}
      {openMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpenMenu(null)} />}
    </>
  );
}

const CSS = `
.co-page{background:var(--bg-card);border-radius:var(--radius-xl);border:1px solid var(--border);min-height:calc(100vh - 100px);overflow:hidden;}
.co-hdr{padding:1.5rem 1.75rem 0;}
.co-title{font-size:1.1rem;font-weight:700;color:var(--text-primary);}
.co-sub{font-size:0.8rem;color:var(--text-secondary);margin-top:0.1rem;}
.co-tabs{display:flex;margin-top:1rem;border-bottom:1px solid var(--border-light);}
.co-tab{display:flex;align-items:center;gap:0.4rem;padding:0.55rem 0;margin-right:1.5rem;font-size:0.82rem;font-weight:500;color:var(--text-secondary);background:none;border:none;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all 0.14s;font-family:var(--font);}
.co-tab:hover{color:var(--text-primary);}
.co-tab.active{color:var(--primary-dark);border-bottom-color:var(--primary);font-weight:600;}
.co-bar{padding:1rem 1.75rem;display:flex;align-items:center;justify-content:flex-end;gap:0.75rem;}
.co-srch{position:relative;flex:1;max-width:280px;margin-left:auto;}
.co-srch input{width:100%;padding:0.45rem 0.75rem 0.45rem 2rem;border:1px solid var(--border);border-radius:var(--radius-md);font-family:var(--font);font-size:0.82rem;background:var(--bg-page);outline:none;}
.co-srch input:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(84,189,149,0.12);background:var(--bg-card);}
.srch-icon{position:absolute;left:0.6rem;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:0.76rem;pointer-events:none;}
.co-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5rem 2rem;gap:0.8rem;}
.co-ei{width:54px;height:54px;background:var(--bg-page);border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;color:var(--text-muted);}
.co-et{font-size:0.94rem;font-weight:600;color:var(--text-primary);}
.co-es{font-size:0.81rem;color:var(--text-secondary);}
.co-tw{overflow-x:auto;padding:0 0 1rem;}
.co-tbl{border-collapse:collapse;font-size:0.81rem;table-layout:fixed;width:1900px;}
.th-sno   {width:52px;}  .th-custid{width:120px;} .th-name  {width:150px;}
.th-email {width:190px;} .th-phone {width:130px;} .th-addr  {width:200px;}
.th-ordid {width:115px;} .th-date  {width:175px;} .th-prod  {width:200px;}
.th-qty   {width:55px;}  .th-price {width:95px;}  .th-total {width:95px;}
.th-status{width:115px;} .th-agent {width:155px;} .th-act   {width:48px;}
.co-tbl th{padding:0.65rem 0.85rem;text-align:left;font-size:0.69rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid var(--border);background:var(--bg-page);position:sticky;top:0;z-index:2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.co-tbl td{padding:0.75rem 0.85rem;border-bottom:1px solid var(--border-light);color:var(--text-primary);vertical-align:middle;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.td-wrap{white-space:normal!important;word-break:break-word;line-height:1.35;}
.td-clip{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.co-tbl tbody tr:hover td{background:#f9fafb;}
.co-tbl tbody tr:last-child td{border-bottom:none;}
.ti{font-weight:500;color:var(--text-secondary);font-size:0.78rem;}
.tn{font-weight:600;}
.to{font-weight:700;color:var(--primary-dark);}
.co-no-res{text-align:center;padding:2.5rem;color:var(--text-muted);font-size:0.83rem;}
.kbtn{width:26px;height:26px;border:none;background:transparent;cursor:pointer;color:var(--text-muted);display:flex;align-items:center;justify-content:center;font-size:1.1rem;border-radius:var(--radius-sm);transition:all 0.12s;line-height:1;}
.kbtn:hover{background:var(--bg-page);color:var(--text-primary);}
.kmenu{position:absolute;right:0;top:28px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);box-shadow:var(--shadow-md);z-index:100;min-width:105px;overflow:hidden;animation:km 0.11s ease;}
.ki{display:flex;align-items:center;gap:0.45rem;padding:0.5rem 0.75rem;font-size:0.81rem;font-weight:500;cursor:pointer;transition:background 0.11s;width:100%;border:none;background:none;text-align:left;color:var(--text-primary);font-family:var(--font);}
.ki:hover{background:var(--bg-page);}
.ki-d{color:var(--danger);}
.ki-d:hover{background:var(--danger-light);}
@keyframes km{from{opacity:0;transform:translateY(-3px);}to{opacity:1;transform:none;}}
.badge{display:inline-flex;align-items:center;padding:0.17rem 0.48rem;border-radius:20px;font-size:0.7rem;font-weight:600;}
.badge-pending{background:#fef3c7;color:#92400e;}
.badge-progress{background:#dbeafe;color:#1e40af;}
.badge-complete{background:var(--primary-light);color:var(--primary-dark);}
.ov{position:fixed;inset:0;background:rgba(15,23,42,0.38);display:flex;align-items:center;justify-content:center;z-index:2000;padding:1rem;backdrop-filter:blur(2px);}
.om{background:var(--bg-card);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);width:100%;max-width:620px;max-height:92vh;overflow-y:auto;display:flex;flex-direction:column;animation:omIn 0.2s cubic-bezier(0.22,1,0.36,1);}
@keyframes omIn{from{transform:scale(0.97) translateY(4px);opacity:0;}to{transform:scale(1) translateY(0);opacity:1;}}
.om-h{padding:1.1rem 1.4rem;border-bottom:1px solid var(--border-light);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;}
.om-t{font-size:0.96rem;font-weight:600;color:var(--text-primary);}
.om-x{width:25px;height:25px;border-radius:50%;border:none;background:var(--bg-page);cursor:pointer;font-size:1rem;color:var(--text-secondary);display:flex;align-items:center;justify-content:center;transition:all 0.13s;}
.om-x:hover{background:var(--border);}
.om-b{padding:1.2rem 1.4rem;flex:1;}
.om-f{padding:0.85rem 1.4rem;border-top:1px solid var(--border-light);display:flex;justify-content:flex-end;gap:0.55rem;flex-shrink:0;}
.om-banner{background:var(--danger-light);color:var(--danger);padding:0.5rem 0.8rem;border-radius:var(--radius-md);margin-bottom:0.85rem;font-size:0.8rem;}
.sec-lbl{font-size:0.71rem;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-secondary);margin:0 0 0.65rem;padding-bottom:0.38rem;border-bottom:1px solid var(--border-light);}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;}
.ff{position:relative;margin-bottom:0.85rem;}
.ff input,.ff select{width:100%;height:52px;padding:20px 0.75rem 6px;border:1px solid var(--border);border-radius:var(--radius-md);font-family:var(--font);font-size:0.875rem;color:var(--text-primary);background:var(--bg-card);outline:none;transition:border-color 0.14s,box-shadow 0.14s;appearance:none;box-sizing:border-box;}
.ff input:focus,.ff select:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(84,189,149,0.13);}
.ff label{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:0.84rem;color:var(--text-muted);pointer-events:none;transition:top 0.14s,font-size 0.14s,color 0.14s,transform 0.14s;white-space:nowrap;z-index:1;}
.ff label.label-up,.ff.ff-has label,.ff input:focus+label,.ff input:not(:placeholder-shown)+label{top:8px;transform:none;font-size:0.68rem;color:var(--text-secondary);font-weight:600;}
.ff-sel label{top:8px;transform:none;font-size:0.68rem;color:var(--text-secondary);font-weight:600;}
.ff-err input,.ff-err select{border-color:var(--danger)!important;box-shadow:0 0 0 3px rgba(239,68,68,0.09)!important;}
.ferr{font-size:0.7rem;color:var(--danger);margin-top:0.25rem;display:block;}
.req{color:var(--danger);margin-left:2px;}
.ff-ro input{background:var(--bg-page);color:var(--text-secondary);cursor:default;}
.ff-sel .chev{position:absolute;right:10px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--text-muted);font-size:0.66rem;}
.ff-cur .dollar{position:absolute;left:12px;bottom:14px;font-size:0.875rem;color:var(--text-secondary);z-index:2;pointer-events:none;}
.ff-cur input{padding-left:22px;}
.ff-qty input{padding-right:28px;}
.spinners{position:absolute;right:6px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:1px;}
.spinners button{width:16px;height:14px;border:1px solid var(--border);background:var(--bg-page);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.5rem;color:var(--text-secondary);border-radius:3px;padding:0;transition:all 0.1s;}
.spinners button:hover{background:var(--primary-light);color:var(--primary-dark);border-color:var(--primary-mid);}
.btn{display:inline-flex;align-items:center;gap:0.38rem;padding:0.44rem 0.88rem;border-radius:var(--radius-md);font-family:var(--font);font-size:0.82rem;font-weight:500;cursor:pointer;border:1px solid transparent;transition:all 0.15s;white-space:nowrap;}
.btn-primary{background:var(--primary);color:#fff;border-color:var(--primary);}
.btn-primary:hover{background:var(--primary-dark);}
.btn-secondary{background:var(--bg-card);color:var(--text-primary);border-color:var(--border);}
.btn-secondary:hover{background:var(--bg-page);}
.btn-danger{background:var(--danger);color:#fff;border-color:var(--danger);}
.btn-danger:hover{background:#dc2626;}
`;
