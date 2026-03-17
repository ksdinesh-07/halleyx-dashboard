import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { KPIWidget, BarChartWidget, LineChartWidget, AreaChartWidget, PieChartWidget, ScatterPlotWidget, TableWidget } from '../components/WidgetComponents';

const DATE_LABELS = { all:'All time', today:'Today', '7days':'Last 7 Days', '30days':'Last 30 Days', '90days':'Last 90 Days' };
const NUMERIC_FIELDS = ['quantity','unitPrice','totalAmount'];
const AXIS_OPTIONS = [
  {value:'product',label:'Product'},{value:'quantity',label:'Quantity'},
  {value:'unitPrice',label:'Unit Price'},{value:'totalAmount',label:'Total Amount'},
  {value:'status',label:'Status'},{value:'createdBy',label:'Created By'},
];
const METRIC_OPTIONS = [
  {value:'id',label:'Customer ID'},{value:'customerName',label:'Customer Name'},
  {value:'email',label:'Email ID'},{value:'streetAddress',label:'Address'},
  {value:'createdAt',label:'Order Date'},{value:'product',label:'Product'},
  {value:'createdBy',label:'Created By'},{value:'status',label:'Status'},
  {value:'totalAmount',label:'Total Amount'},{value:'unitPrice',label:'Unit Price'},
  {value:'quantity',label:'Quantity'},
];
const TABLE_COLUMNS = [
  {value:'id',label:'Customer ID'},{value:'customerName',label:'Customer Name'},
  {value:'email',label:'Email ID'},{value:'phone',label:'Phone Number'},
  {value:'streetAddress',label:'Address'},{value:'createdAt',label:'Order Date'},
  {value:'product',label:'Product'},{value:'quantity',label:'Quantity'},
  {value:'unitPrice',label:'Unit Price'},{value:'totalAmount',label:'Total Amount'},
  {value:'status',label:'Status'},{value:'createdBy',label:'Created By'},
];

const WIDGET_CATALOG = [
  { category:'Charts', open:true, items:[
    {id:'bar-chart',   name:'Bar Chart',    icon:'▦', defaultWidth:5, defaultHeight:5},
    {id:'line-chart',  name:'Line Chart',   icon:'∿', defaultWidth:5, defaultHeight:5},
    {id:'pie-chart',   name:'Pie Chart',    icon:'◕', defaultWidth:4, defaultHeight:5},
    {id:'area-chart',  name:'Area Chart',   icon:'⌇', defaultWidth:5, defaultHeight:5},
    {id:'scatter-plot',name:'Scatter Plot', icon:'⋯', defaultWidth:5, defaultHeight:5},
  ]},
  { category:'Tables', open:true, items:[
    {id:'table', name:'Table', icon:'▤', defaultWidth:6, defaultHeight:5},
  ]},
  { category:'KPIs', open:true, items:[
    {id:'kpi', name:'KPI Value', icon:'◈', defaultWidth:3, defaultHeight:3},
  ]},
];

function renderPreview(widget, orders) {
  switch(widget.type) {
    case 'kpi':          return <KPIWidget widget={widget} data={orders}/>;
    case 'bar-chart':    return <BarChartWidget widget={widget} data={orders}/>;
    case 'line-chart':   return <LineChartWidget widget={widget} data={orders}/>;
    case 'area-chart':   return <AreaChartWidget widget={widget} data={orders}/>;
    case 'pie-chart':    return <PieChartWidget widget={widget} data={orders}/>;
    case 'scatter-plot': return <ScatterPlotWidget widget={widget} data={orders}/>;
    case 'table':        return <TableWidget widget={widget} data={orders}/>;
    default: return <div style={{padding:'1rem',color:'var(--text-muted)'}}>Preview</div>;
  }
}

/* ── Widget Configuration Panel ── */
function ConfigPanel({ widget, onUpdate, onClose }) {
  const [tab, setTab]               = useState('data');
  const [title, setTitle]           = useState(widget.config?.title||widget.title||'');
  const [width, setWidth]           = useState(widget.width||4);
  const [height, setHeight]         = useState(widget.height||4);
  const [config, setConfig]         = useState({...widget.config});
  const [filters, setFilters]       = useState(widget.config?.filters||[]);
  const [showFilters, setShowFilters] = useState(widget.config?.applyFilter||false);
  const set = (k,v) => setConfig(c=>({...c,[k]:v}));
  const isNumeric = NUMERIC_FIELDS.includes(config.metric);
  const isChart = ['bar-chart','line-chart','area-chart','scatter-plot'].includes(widget.type);
  const TYPE_LABELS = {'kpi':'KPI','bar-chart':'Bar Chart','line-chart':'Line Chart','area-chart':'Area Chart','scatter-plot':'Scatter Plot','pie-chart':'Pie Chart','table':'Table'};

  const save = () => {
    onUpdate({
      ...widget,
      title: title||'Untitled',
      width: Math.max(1,width),
      height: Math.max(1,height),
      config: { ...config, title:title||'Untitled', applyFilter:showFilters, filters:showFilters?filters:[] }
    });
    onClose();
  };

  return (
    <div className="cp-wrap">
      <div className="cp-head">
        <span className="cp-title">Widget configuration</span>
        <button className="cp-close" onClick={onClose}>×</button>
      </div>
      <div className="cp-body">
        {/* Tabs: Data / Styling */}
        <div className="cp-tabs">
          <button className={'cp-tab'+(tab==='data'?' active':'')} onClick={()=>setTab('data')}>Data</button>
          <button className={'cp-tab'+(tab==='style'?' active':'')} onClick={()=>setTab('style')}>Styling</button>
        </div>

        {tab==='data'&&(
          <React.Fragment>
            <div className="cf">
              <label className="cf-label">Widget title <span className="req">*</span></label>
              <input className="cf-input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Untitled"/>
            </div>
            <div className="cf">
              <label className="cf-label">Widget type <span className="req">*</span></label>
              <input className="cf-input" value={TYPE_LABELS[widget.type]||widget.type} readOnly style={{background:'var(--bg-page)',color:'var(--text-secondary)'}}/>
            </div>
            <div className="cf">
              <label className="cf-label">Description</label>
              <textarea className="cf-input" rows={2} value={config.description||''} onChange={e=>set('description',e.target.value)} placeholder="Optional description" style={{resize:'vertical',minHeight:52}}/>
            </div>
            <div className="cp-section">Widget size</div>
            <div className="cf-row2">
              <div className="cf">
                <label className="cf-label">Width (Columns) <span className="req">*</span></label>
                <div className="cf-stepper-wrap">
                  <input className="cf-input" value={width} onChange={e=>setWidth(Math.max(1,Math.min(12,parseInt(e.target.value)||1)))} type="number" min={1} max={12}/>
                  <div className="cf-steppers"><button onClick={()=>setWidth(w=>Math.min(12,w+1))}>▲</button><button onClick={()=>setWidth(w=>Math.max(1,w-1))}>▼</button></div>
                </div>
              </div>
              <div className="cf">
                <label className="cf-label">Height (Rows) <span className="req">*</span></label>
                <div className="cf-stepper-wrap">
                  <input className="cf-input" value={height} onChange={e=>setHeight(Math.max(1,parseInt(e.target.value)||1))} type="number" min={1}/>
                  <div className="cf-steppers"><button onClick={()=>setHeight(h=>h+1)}>▲</button><button onClick={()=>setHeight(h=>Math.max(1,h-1))}>▼</button></div>
                </div>
              </div>
            </div>
            <div className="cp-section">Data setting</div>
            {widget.type==='kpi'&&(
              <React.Fragment>
                <div className="cf">
                  <label className="cf-label">Select metric <span className="req">*</span></label>
                  <div className="cf-sel-wrap">
                    <select className="cf-input" value={config.metric||''} onChange={e=>{set('metric',e.target.value);set('aggregation','');}}>
                      <option value="">Select...</option>
                      {METRIC_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select><span className="cf-arr">▾</span>
                  </div>
                </div>
                <div className="cf">
                  <label className="cf-label">Aggregation <span className="req">*</span></label>
                  <div className="cf-sel-wrap">
                    <select className="cf-input" value={config.aggregation||''} onChange={e=>set('aggregation',e.target.value)} disabled={config.metric&&!isNumeric}>
                      <option value="">Select...</option>
                      <option value="sum">Sum</option><option value="average">Average</option>
                      <option value="count">Count</option><option value="min">Min</option><option value="max">Max</option>
                    </select><span className="cf-arr">▾</span>
                  </div>
                  {config.metric&&!isNumeric&&<small className="cf-hint">Only Count is meaningful for non-numeric fields</small>}
                </div>
                <div className="cf-row2">
                  <div className="cf">
                    <label className="cf-label">Data format <span className="req">*</span></label>
                    <div className="cf-sel-wrap">
                      <select className="cf-input" value={config.dataFormat||'number'} onChange={e=>set('dataFormat',e.target.value)}>
                        <option value="number">Number</option><option value="currency">Currency</option>
                      </select><span className="cf-arr">▾</span>
                    </div>
                  </div>
                  <div className="cf">
                    <label className="cf-label">Decimal precision <span className="req">*</span></label>
                    <input className="cf-input" type="number" min={0} value={config.decimalPrecision??0} onChange={e=>set('decimalPrecision',Math.max(0,parseInt(e.target.value)||0))}/>
                  </div>
                </div>
              </React.Fragment>
            )}
            {isChart&&(
              <React.Fragment>
                <div className="cf">
                  <label className="cf-label">Choose X - axis data <span className="req">*</span></label>
                  <div className="cf-sel-wrap">
                    <select className="cf-input" value={config.xAxis||''} onChange={e=>set('xAxis',e.target.value)}>
                      <option value="">Select...</option>
                      {AXIS_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select><span className="cf-arr">▾</span>
                  </div>
                </div>
                <div className="cf">
                  <label className="cf-label">Choose Y - axis data <span className="req">*</span></label>
                  <div className="cf-sel-wrap">
                    <select className="cf-input" value={config.yAxis||''} onChange={e=>set('yAxis',e.target.value)}>
                      <option value="">Select...</option>
                      {AXIS_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select><span className="cf-arr">▾</span>
                  </div>
                </div>
                <div className="cf">
                  <label className="cf-label">Aggregation</label>
                  <div className="cf-sel-wrap">
                    <select className="cf-input" value={config.aggregation||'sum'} onChange={e=>set('aggregation',e.target.value)}>
                      <option value="sum">Sum</option><option value="average">Average</option>
                      <option value="count">Count</option><option value="min">Min</option><option value="max">Max</option>
                    </select><span className="cf-arr">▾</span>
                  </div>
                </div>
                <label className="cf-check">
                  <input type="checkbox" checked={config.showDataLabel||false} onChange={e=>set('showDataLabel',e.target.checked)}/> Show data label
                </label>
              </React.Fragment>
            )}
            {widget.type==='pie-chart'&&(
              <React.Fragment>
                <div className="cf">
                  <label className="cf-label">Choose chart data <span className="req">*</span></label>
                  <div className="cf-sel-wrap">
                    <select className="cf-input" value={config.chartData||''} onChange={e=>set('chartData',e.target.value)}>
                      <option value="">Select...</option>
                      {AXIS_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select><span className="cf-arr">▾</span>
                  </div>
                </div>
                <label className="cf-check">
                  <input type="checkbox" checked={config.showLegend!==false} onChange={e=>set('showLegend',e.target.checked)}/> Show legend
                </label>
              </React.Fragment>
            )}
            {widget.type==='table'&&(
              <React.Fragment>
                <div className="cf">
                  <label className="cf-label">Choose columns <span className="req">*</span></label>
                  <div className="cf-multisel">
                    {TABLE_COLUMNS.map(col=>(
                      <label key={col.value} className="cf-check-item">
                        <input type="checkbox" checked={(config.columns||[]).includes(col.value)} onChange={e=>{const cur=config.columns||[];set('columns',e.target.checked?[...cur,col.value]:cur.filter(c=>c!==col.value));}}/> {col.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="cf-row2">
                  <div className="cf">
                    <label className="cf-label">Sort by</label>
                    <div className="cf-sel-wrap">
                      <select className="cf-input" value={config.sortBy||''} onChange={e=>set('sortBy',e.target.value)}>
                        <option value="">None</option>
                        <option value="customerName:asc">Ascending</option>
                        <option value="customerName:desc">Descending</option>
                        <option value="createdAt:desc">Order Date</option>
                      </select><span className="cf-arr">▾</span>
                    </div>
                  </div>
                  <div className="cf">
                    <label className="cf-label">Pagination</label>
                    <div className="cf-sel-wrap">
                      <select className="cf-input" value={config.pagination||5} onChange={e=>set('pagination',parseInt(e.target.value))}>
                        <option value="5">5</option><option value="10">10</option><option value="15">15</option>
                      </select><span className="cf-arr">▾</span>
                    </div>
                  </div>
                </div>
                <label className="cf-check" style={{marginBottom:'0.5rem'}}>
                  <input type="checkbox" checked={showFilters} onChange={e=>setShowFilters(e.target.checked)}/> Apply filter
                </label>
                {showFilters&&(
                  <div className="cf-filter-section">
                    {filters.map((f,i)=>(
                      <div key={i} className="cf-filter-row">
                        <div className="cf-sel-wrap" style={{flex:1}}>
                          <select className="cf-input" value={f.field} onChange={e=>setFilters(fs=>fs.map((x,idx)=>idx===i?{...x,field:e.target.value}:x))}>
                            <option value="">Field</option>
                            {TABLE_COLUMNS.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                          </select><span className="cf-arr">▾</span>
                        </div>
                        <div className="cf-sel-wrap" style={{flex:1}}>
                          <select className="cf-input" value={f.operator} onChange={e=>setFilters(fs=>fs.map((x,idx)=>idx===i?{...x,operator:e.target.value}:x))}>
                            <option value="equals">Equals</option><option value="contains">Contains</option>
                            <option value="gt">Greater than</option><option value="lt">Less than</option>
                          </select><span className="cf-arr">▾</span>
                        </div>
                        <input className="cf-input" style={{flex:1}} value={f.value} placeholder="Value" onChange={e=>setFilters(fs=>fs.map((x,idx)=>idx===i?{...x,value:e.target.value}:x))}/>
                        <button className="cf-rm-filter" onClick={()=>setFilters(fs=>fs.filter((_,idx)=>idx!==i))}>×</button>
                      </div>
                    ))}
                    <button className="cf-add-filter" onClick={()=>setFilters(f=>[...f,{field:'',operator:'equals',value:''}])}>+ Add filter</button>
                  </div>
                )}
              </React.Fragment>
            )}
          </React.Fragment>
        )}

        {tab==='style'&&(
          <React.Fragment>
            {(isChart||widget.type==='pie-chart')&&(
              <div className="cf">
                <label className="cf-label">Chart color</label>
                <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                  <input type="color" value={config.chartColor||'#54bd95'} onChange={e=>set('chartColor',e.target.value)} style={{width:36,height:36,border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',cursor:'pointer',padding:2}}/>
                  <input className="cf-input" value={config.chartColor||'#54bd95'} onChange={e=>set('chartColor',e.target.value)} placeholder="#54bd95" maxLength={7} style={{flex:1,fontFamily:'monospace'}}/>
                </div>
              </div>
            )}
            {widget.type==='table'&&(
              <React.Fragment>
                <div className="cf-row2">
                  <div className="cf">
                    <label className="cf-label">Font size</label>
                    <input className="cf-input" type="number" min={12} max={18} value={config.fontSize||13} onChange={e=>set('fontSize',Math.min(18,Math.max(12,parseInt(e.target.value)||13)))}/>
                  </div>
                  <div className="cf">
                    <label className="cf-label">Header background</label>
                    <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                      <input type="color" value={config.headerColor||'#54bd95'} onChange={e=>set('headerColor',e.target.value)} style={{width:36,height:36,border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',cursor:'pointer',padding:2}}/>
                      <input className="cf-input" value={config.headerColor||'#54bd95'} onChange={e=>set('headerColor',e.target.value)} maxLength={7} style={{flex:1,fontFamily:'monospace'}}/>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            )}
            {!isChart&&widget.type!=='table'&&widget.type!=='pie-chart'&&(
              <div style={{padding:'2rem',textAlign:'center',color:'var(--text-muted)',fontSize:'0.83rem'}}>No styling options for this widget type.</div>
            )}
          </React.Fragment>
        )}
      </div>
      <div className="cp-foot">
        <button className="cp-btn-cancel" onClick={onClose}>Cancel</button>
        <button className="cp-btn-save" onClick={save}>Add</button>
      </div>
    </div>
  );
}

/* ── Main DashboardConfig ── */
export default function DashboardConfig({ layout, orders, dateFilter, setDateFilter, onSave, onCancel, showToast }) {
  const [widgets, setWidgets]               = useState(layout.length>0?layout:[]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [showPanel, setShowPanel]           = useState(false);
  const [catOpen, setCatOpen]               = useState({Charts:true,Tables:true,KPIs:true});
  const [dragType, setDragType]             = useState(null);
  const [deleteId, setDeleteId]             = useState(null);

  const handleDrop = e => {
    e.preventDefault();
    if(!dragType) return;
    const nw = { id:uuidv4(), type:dragType.id, title:'Untitled '+dragType.name, width:dragType.defaultWidth, height:dragType.defaultHeight, icon:dragType.icon, config:{title:'Untitled '+dragType.name} };
    setWidgets(prev=>[...prev,nw]);
    setSelectedWidget(nw);
    setShowPanel(true);
    setDragType(null);
  };

  const updateWidget = updated => {
    setWidgets(prev=>prev.map(w=>w.id===updated.id?updated:w));
    setSelectedWidget(updated);
    if(showToast) showToast('Widget added successfully!');
  };

  const deleteWidget = id => {
    setWidgets(prev=>prev.filter(w=>w.id!==id));
    if(selectedWidget?.id===id){setSelectedWidget(null);setShowPanel(false);}
    setDeleteId(null);
  };

  const updateSize = (id,field,val) => setWidgets(prev=>prev.map(w=>w.id===id?{...w,[field]:Math.max(1,val)}:w));

  return (
    <>
      <style>{CSS}</style>
      <div className="dc-wrap">
        {/* Header */}
        <div className="dc-head">
          <button className="dc-back" onClick={onCancel}><i className="fas fa-arrow-left"/></button>
          <div>
            <div className="dc-title">Configure dashboard</div>
            <div className="dc-sub">Configure your dashboard to start viewing analytics</div>
          </div>
        </div>

        {/* Date filter */}
        <div className="dc-date-row">
          <span className="dc-date-lbl">Show data for</span>
          <div className="dc-date-sel-wrap">
            <select className="dc-date-sel" value={dateFilter} onChange={e=>setDateFilter(e.target.value)}>
              {Object.entries(DATE_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select><span className="dc-date-arr">▾</span>
          </div>
        </div>

        {/* Stat preview strip */}
        <div className="dc-stat-strip">
          {[
            {label:'Total Orders',      value:orders.length},
            {label:'Total Revenue',     value:'$'+orders.reduce((s,o)=>s+(o.totalAmount||0),0).toFixed(2)},
            {label:'Total Customers',   value:new Set(orders.map(o=>o.customerId||o.customerName).filter(Boolean)).size},
            {label:'Total Sold Quantity',value:orders.reduce((s,o)=>s+(parseInt(o.quantity)||0),0)},
          ].map((s,i)=>(
            <div key={i} className="dc-stat">
              <div className="dc-stat-lbl">{s.label}</div>
              <div className="dc-stat-val">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Main layout: sidebar + canvas */}
        <div className="dc-layout">
          {/* Sidebar: widget library */}
          <div className="dc-sidebar">
            <div className="dc-lib-title">Widget library</div>
            <div className="dc-lib-sub">Drag and drop your canvas</div>
            {WIDGET_CATALOG.map(cat=>(
              <div key={cat.category} className="dc-cat">
                <button className="dc-cat-hd" onClick={()=>setCatOpen(o=>({...o,[cat.category]:!o[cat.category]}))}>
                  <span>{cat.category}</span>
                  <span className={'dc-cat-arr'+(catOpen[cat.category]?' open':'')}>›</span>
                </button>
                {catOpen[cat.category]&&(
                  <div className="dc-cat-items">
                    {cat.items.map(item=>(
                      <div key={item.id} className="dc-item" draggable onDragStart={()=>setDragType(item)}>
                        <span className="dc-item-drag">⠿</span>
                        <span className="dc-item-icon">{item.icon}</span>
                        <span className="dc-item-name">{item.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Canvas */}
          <div className={'dc-canvas'+(dragType?' dc-drag-over':'')} onDrop={handleDrop} onDragOver={e=>e.preventDefault()}>
            {widgets.length===0&&!dragType&&(
              <div className="dc-empty">
                <div className="dc-empty-ic">📐</div>
                <div>Start Building</div>
                <div className="dc-empty-sub">Drag widgets from the library and drop them here</div>
              </div>
            )}
            <div className="dc-widgets-grid">
              {widgets.map(widget=>{
                const hPx = widget.height * 80;
                const wPct = (widget.width/12)*100;
                return(
                  <div key={widget.id} className="dc-widget" style={{width:`calc(${wPct}% - 0.5rem)`,height:hPx+'px',minHeight:hPx+'px'}}>
                    <div className="dc-widget-inner">
                      <div className="dc-widget-hd">
                        <span className="dc-widget-title">{widget.icon||'◈'} {widget.title||'Untitled'}</span>
                        <div style={{display:'flex',gap:'0.25rem'}}>
                          <button className="dc-widget-btn" title="Settings" onClick={()=>{setSelectedWidget(widget);setShowPanel(true);}}>
                            <i className="fas fa-cog"/>
                          </button>
                          <button className="dc-widget-btn danger" title="Delete" onClick={()=>setDeleteId(widget.id)}>
                            <i className="fas fa-trash-alt"/>
                          </button>
                        </div>
                      </div>
                      <div className="dc-widget-body">{renderPreview(widget,orders)}</div>
                      {/* size controls */}
                      <div className="dc-size-bar">
                        <div className="dc-size-ctrl">
                          <span className="dc-size-lbl">W</span>
                          <div className="dc-sz-step">
                            <button onClick={()=>updateSize(widget.id,'width',widget.width-1)} disabled={widget.width<=1}>−</button>
                            <span>{widget.width}</span>
                            <button onClick={()=>updateSize(widget.id,'width',Math.min(12,widget.width+1))} disabled={widget.width>=12}>+</button>
                          </div>
                        </div>
                        <div className="dc-sz-div"/>
                        <div className="dc-size-ctrl">
                          <span className="dc-size-lbl">H</span>
                          <div className="dc-sz-step">
                            <button onClick={()=>updateSize(widget.id,'height',widget.height-1)} disabled={widget.height<=1}>−</button>
                            <span>{widget.height}</span>
                            <button onClick={()=>updateSize(widget.id,'height',widget.height+1)}>+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {dragType&&<div className="dc-drop-hint"><span>{dragType.icon}</span> Drop here to add {dragType.name}</div>}
          </div>

          {/* Config panel */}
          {showPanel&&selectedWidget&&(
            <ConfigPanel key={selectedWidget.id} widget={selectedWidget} onUpdate={w=>{updateWidget(w);setShowPanel(false);}} onClose={()=>setShowPanel(false)}/>
          )}
        </div>

        {/* Footer actions */}
        <div className="dc-foot">
          <button className="dc-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="dc-btn-save" onClick={()=>onSave(widgets)}>Save</button>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteId&&(
        <div className="overlay" onClick={()=>setDeleteId(null)}>
          <div className="dlg confirm-dlg" onClick={e=>e.stopPropagation()}>
            <div className="dlg-hd"><span className="dlg-ttl">Delete Widget</span><button className="dlg-x" onClick={()=>setDeleteId(null)}>×</button></div>
            <div className="dlg-body" style={{textAlign:'center',padding:'2rem 1.5rem'}}>
              <div style={{fontSize:'2rem',color:'var(--danger)',marginBottom:'0.6rem'}}><i className="fas fa-trash-alt"/></div>
              <div style={{fontWeight:600,fontSize:'1rem',marginBottom:'0.35rem'}}>Delete this widget?</div>
              <div style={{fontSize:'0.83rem',color:'var(--text-secondary)'}}>This action cannot be undone.</div>
            </div>
            <div className="dlg-ft">
              <button className="btn btn-ghost" onClick={()=>setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={()=>deleteWidget(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const CSS=`
.dc-wrap{background:var(--bg-card);border-radius:var(--radius-xl);border:1px solid var(--border);min-height:calc(100vh - 96px);display:flex;flex-direction:column;overflow:hidden;}
.dc-head{display:flex;align-items:center;gap:0.85rem;padding:1.25rem 1.5rem;border-bottom:1px solid var(--border-light);flex-shrink:0;}
.dc-back{width:32px;height:32px;border-radius:var(--radius-md);border:1px solid var(--border);background:var(--bg-card);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:0.85rem;transition:all 0.14s;flex-shrink:0;}
.dc-back:hover{background:var(--bg-page);color:var(--text-primary);}
.dc-title{font-size:1rem;font-weight:700;color:var(--text-primary);}
.dc-sub{font-size:0.78rem;color:var(--text-secondary);margin-top:0.1rem;}
.dc-date-row{display:flex;align-items:center;gap:0.75rem;padding:0.85rem 1.5rem;border-bottom:1px solid var(--border-light);flex-shrink:0;}
.dc-date-lbl{font-size:0.83rem;font-weight:500;color:var(--text-secondary);}
.dc-date-sel-wrap{position:relative;}
.dc-date-sel{appearance:none;border:1px solid var(--border);border-radius:var(--radius-md);padding:0.38rem 1.8rem 0.38rem 0.75rem;font-family:var(--font);font-size:0.83rem;color:var(--text-primary);background:var(--bg-card);cursor:pointer;outline:none;}
.dc-date-arr{position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--text-muted);font-size:0.65rem;}
.dc-stat-strip{display:flex;gap:0;border-bottom:1px solid var(--border-light);flex-shrink:0;}
.dc-stat{flex:1;padding:0.85rem 1.25rem;border-right:1px solid var(--border-light);}
.dc-stat:last-child{border-right:none;}
.dc-stat-lbl{font-size:0.72rem;color:var(--text-secondary);font-weight:500;margin-bottom:0.2rem;}
.dc-stat-val{font-size:1.15rem;font-weight:700;color:var(--text-primary);}
.dc-layout{display:flex;flex:1;min-height:0;overflow:hidden;}
.dc-sidebar{width:220px;border-right:1px solid var(--border-light);flex-shrink:0;overflow-y:auto;padding:1rem 0;}
.dc-lib-title{font-size:0.83rem;font-weight:600;color:var(--text-primary);padding:0 1rem;margin-bottom:0.15rem;}
.dc-lib-sub{font-size:0.75rem;color:var(--text-muted);padding:0 1rem;margin-bottom:0.75rem;}
.dc-cat{margin-bottom:0.25rem;}
.dc-cat-hd{width:100%;display:flex;justify-content:space-between;align-items:center;padding:0.5rem 1rem;background:none;border:none;cursor:pointer;font-family:var(--font);font-size:0.83rem;font-weight:600;color:var(--text-primary);transition:background 0.13s;}
.dc-cat-hd:hover{background:var(--bg-page);}
.dc-cat-arr{font-size:1rem;color:var(--text-muted);transition:transform 0.15s;display:inline-block;}
.dc-cat-arr.open{transform:rotate(90deg);}
.dc-cat-items{padding:0.2rem 0;}
.dc-item{display:flex;align-items:center;gap:0.5rem;padding:0.42rem 1rem;cursor:grab;transition:background 0.12s;font-size:0.83rem;color:var(--text-primary);}
.dc-item:hover{background:var(--bg-page);}
.dc-item:active{cursor:grabbing;}
.dc-item-drag{color:var(--text-muted);font-size:0.85rem;flex-shrink:0;}
.dc-item-icon{font-size:0.9rem;flex-shrink:0;}
.dc-canvas{flex:1;overflow:auto;padding:1rem;position:relative;background:var(--bg-page);transition:background 0.15s;}
.dc-canvas.dc-drag-over{background:#eaf7f2;}
.dc-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:300px;gap:0.65rem;color:var(--text-secondary);text-align:center;font-size:0.9rem;font-weight:500;}
.dc-empty-ic{font-size:2.5rem;margin-bottom:0.25rem;}
.dc-empty-sub{font-size:0.78rem;color:var(--text-muted);max-width:260px;}
.dc-widgets-grid{display:flex;flex-wrap:wrap;gap:0.75rem;align-content:flex-start;}
.dc-widget{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);overflow:hidden;display:flex;flex-direction:column;}
.dc-widget-inner{display:flex;flex-direction:column;height:100%;}
.dc-widget-hd{display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.75rem;border-bottom:1px solid var(--border-light);background:var(--bg-card);flex-shrink:0;}
.dc-widget-title{font-size:0.8rem;font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dc-widget-btn{width:24px;height:24px;border:none;background:transparent;cursor:pointer;border-radius:var(--radius-sm);color:var(--text-muted);font-size:0.72rem;display:flex;align-items:center;justify-content:center;transition:all 0.13s;}
.dc-widget-btn:hover{background:var(--bg-page);color:var(--primary);}
.dc-widget-btn.danger:hover{background:var(--danger-light);color:var(--danger);}
.dc-widget-body{flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden;}
.dc-size-bar{display:flex;align-items:center;padding:0.35rem 0.75rem;border-top:1px solid var(--border-light);background:var(--bg-page);gap:0.75rem;flex-shrink:0;}
.dc-size-ctrl{display:flex;align-items:center;gap:0.4rem;}
.dc-size-lbl{font-size:0.72rem;font-weight:600;color:var(--text-secondary);}
.dc-sz-step{display:flex;align-items:center;gap:0.25rem;}
.dc-sz-step button{width:18px;height:18px;border:1px solid var(--border);background:var(--bg-card);border-radius:4px;cursor:pointer;font-size:0.72rem;display:flex;align-items:center;justify-content:center;transition:all 0.12s;}
.dc-sz-step button:hover:not(:disabled){background:var(--primary-light);border-color:var(--primary-mid);}
.dc-sz-step button:disabled{opacity:0.4;cursor:default;}
.dc-sz-step span{font-size:0.78rem;font-weight:600;color:var(--text-primary);min-width:16px;text-align:center;}
.dc-sz-div{width:1px;height:16px;background:var(--border-light);}
.dc-drop-hint{position:absolute;bottom:1.5rem;left:50%;transform:translateX(-50%);background:var(--primary);color:#fff;padding:0.55rem 1.1rem;border-radius:var(--radius-md);font-size:0.83rem;font-weight:500;display:flex;align-items:center;gap:0.5rem;box-shadow:var(--shadow-md);pointer-events:none;}
.dc-foot{display:flex;justify-content:flex-end;gap:0.6rem;padding:0.85rem 1.5rem;border-top:1px solid var(--border-light);flex-shrink:0;background:var(--bg-card);}
.dc-btn-cancel{padding:0.45rem 1rem;border-radius:var(--radius-md);border:1px solid var(--border);background:var(--bg-card);font-family:var(--font);font-size:0.84rem;font-weight:500;cursor:pointer;color:var(--text-primary);transition:all 0.15s;}
.dc-btn-cancel:hover{background:var(--bg-page);}
.dc-btn-save{padding:0.45rem 1rem;border-radius:var(--radius-md);border:1px solid var(--primary);background:var(--primary);font-family:var(--font);font-size:0.84rem;font-weight:500;cursor:pointer;color:#fff;transition:all 0.15s;}
.dc-btn-save:hover{background:var(--primary-dark);}
/* Config panel */
.cp-wrap{width:320px;border-left:1px solid var(--border-light);display:flex;flex-direction:column;flex-shrink:0;background:var(--bg-card);overflow:hidden;}
.cp-head{display:flex;justify-content:space-between;align-items:center;padding:0.9rem 1.1rem;border-bottom:1px solid var(--border-light);flex-shrink:0;}
.cp-title{font-size:0.9rem;font-weight:600;color:var(--text-primary);}
.cp-close{width:24px;height:24px;border-radius:50%;border:none;background:var(--bg-page);cursor:pointer;font-size:0.95rem;color:var(--text-secondary);display:flex;align-items:center;justify-content:center;transition:all 0.13s;}
.cp-close:hover{background:var(--border);color:var(--text-primary);}
.cp-tabs{display:flex;gap:0;border-bottom:1px solid var(--border-light);flex-shrink:0;}
.cp-tab{flex:1;padding:0.55rem;border:none;background:transparent;font-family:var(--font);font-size:0.82rem;font-weight:500;cursor:pointer;color:var(--text-secondary);border-bottom:2px solid transparent;margin-bottom:-1px;transition:all 0.14s;}
.cp-tab:hover{color:var(--text-primary);}
.cp-tab.active{color:var(--primary-dark);border-bottom-color:var(--primary);font-weight:600;}
.cp-body{flex:1;overflow-y:auto;padding:0.85rem 1.1rem;}
.cp-section{font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:var(--text-secondary);margin:1rem 0 0.6rem;padding-bottom:0.35rem;border-bottom:1px solid var(--border-light);}
.cp-foot{padding:0.75rem 1.1rem;border-top:1px solid var(--border-light);display:flex;justify-content:flex-end;gap:0.5rem;flex-shrink:0;}
.cp-btn-cancel{padding:0.4rem 0.8rem;border-radius:var(--radius-md);border:1px solid var(--border);background:var(--bg-card);font-family:var(--font);font-size:0.82rem;font-weight:500;cursor:pointer;color:var(--text-primary);transition:all 0.14s;}
.cp-btn-cancel:hover{background:var(--bg-page);}
.cp-btn-save{padding:0.4rem 0.8rem;border-radius:var(--radius-md);border:1px solid var(--primary);background:var(--primary);font-family:var(--font);font-size:0.82rem;font-weight:500;cursor:pointer;color:#fff;transition:all 0.14s;}
.cp-btn-save:hover{background:var(--primary-dark);}
/* form fields in config panel */
.cf{margin-bottom:0.75rem;}
.cf-label{display:block;font-size:0.77rem;font-weight:500;color:var(--text-secondary);margin-bottom:0.3rem;}
.cf-input{width:100%;padding:0.48rem 0.65rem;border:1px solid var(--border);border-radius:var(--radius-md);font-family:var(--font);font-size:0.84rem;color:var(--text-primary);background:var(--bg-card);outline:none;transition:border-color 0.14s,box-shadow 0.14s;appearance:none;}
.cf-input:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(84,189,149,0.12);}
.cf-row2{display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;}
.cf-sel-wrap{position:relative;}
.cf-sel-wrap .cf-input{padding-right:1.5rem;}
.cf-arr{position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--text-muted);font-size:0.62rem;}
.cf-hint{font-size:0.71rem;color:var(--text-muted);margin-top:0.2rem;display:block;}
.cf-check{display:flex;align-items:center;gap:0.45rem;font-size:0.82rem;color:var(--text-primary);cursor:pointer;margin-bottom:0.5rem;}
.cf-check input[type=checkbox]{accent-color:var(--primary);width:14px;height:14px;}
.cf-check-item{display:flex;align-items:center;gap:0.4rem;font-size:0.8rem;color:var(--text-primary);cursor:pointer;padding:0.2rem 0;}
.cf-check-item input[type=checkbox]{accent-color:var(--primary);}
.cf-multisel{border:1px solid var(--border);border-radius:var(--radius-md);padding:0.5rem 0.6rem;max-height:160px;overflow-y:auto;display:flex;flex-direction:column;gap:0.15rem;}
.cf-stepper-wrap{position:relative;}
.cf-stepper-wrap .cf-input{padding-right:22px;}
.cf-steppers{position:absolute;right:4px;top:50%;transform:translateY(-25%);display:flex;flex-direction:column;gap:1px;}
.cf-steppers button{width:14px;height:12px;border:1px solid var(--border);background:var(--bg-page);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.5rem;color:var(--text-secondary);border-radius:3px;padding:0;transition:all 0.11s;}
.cf-steppers button:hover{background:var(--primary-light);color:var(--primary-dark);}
.cf-filter-section{border:1px solid var(--border);border-radius:var(--radius-md);padding:0.6rem;display:flex;flex-direction:column;gap:0.5rem;}
.cf-filter-row{display:flex;gap:0.35rem;align-items:center;}
.cf-rm-filter{width:22px;height:22px;border:none;background:var(--danger-light);color:var(--danger);border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.85rem;flex-shrink:0;transition:all 0.12s;}
.cf-rm-filter:hover{background:var(--danger);color:#fff;}
.cf-add-filter{background:none;border:1px dashed var(--border);border-radius:var(--radius-md);padding:0.38rem 0.7rem;font-family:var(--font);font-size:0.79rem;color:var(--primary-dark);cursor:pointer;transition:all 0.13s;width:100%;}
.cf-add-filter:hover{background:var(--primary-light);border-color:var(--primary-mid);}
.req{color:var(--danger);}
/* dialog shared */
.overlay{position:fixed;inset:0;background:rgba(15,23,42,0.38);display:flex;align-items:center;justify-content:center;z-index:2000;padding:1rem;backdrop-filter:blur(2px);}
.dlg{background:var(--bg-card);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);width:100%;max-width:560px;max-height:92vh;overflow-y:auto;display:flex;flex-direction:column;animation:dlgIn 0.22s cubic-bezier(0.22,1,0.36,1);}
.confirm-dlg{max-width:400px;}
@keyframes dlgIn{from{transform:scale(0.97) translateY(5px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
.dlg-hd{padding:1.1rem 1.5rem;border-bottom:1px solid var(--border-light);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;}
.dlg-ttl{font-size:1rem;font-weight:600;color:var(--text-primary);}
.dlg-x{width:26px;height:26px;border-radius:50%;border:none;background:var(--bg-page);cursor:pointer;font-size:1rem;color:var(--text-secondary);display:flex;align-items:center;justify-content:center;transition:all 0.14s;}
.dlg-x:hover{background:var(--border);color:var(--text-primary);}
.dlg-ft{padding:0.9rem 1.5rem;border-top:1px solid var(--border-light);display:flex;justify-content:flex-end;gap:0.6rem;flex-shrink:0;}
.btn{display:inline-flex;align-items:center;gap:0.38rem;padding:0.46rem 0.9rem;border-radius:var(--radius-md);font-family:var(--font);font-size:0.84rem;font-weight:500;cursor:pointer;border:1px solid transparent;transition:all 0.16s;white-space:nowrap;line-height:1.4;}
.btn-ghost{background:transparent;color:var(--text-secondary);border-color:var(--border);}
.btn-ghost:hover{background:var(--bg-page);color:var(--text-primary);}
.btn-danger{background:var(--danger);color:#fff;border-color:var(--danger);}
.btn-danger:hover{background:#dc2626;}
`;
