import { Link } from 'react-router-dom'
import { BarChart, Bar, CartesianGrid, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { AlertTriangle, ArrowRight, ArrowUpRight, CheckCheck, Clock3, FileText, Upload, XCircle } from 'lucide-react'
import { useInvoices } from '../hooks'
import { Spinner, ErrorState, EmptyState, PageHeader, StatusBadge } from '../components/common'
import { config } from '../config'
import { fmtDate, money } from '../utils'
export default function Dashboard(){
  const {invoices:inv,error,reload}=useInvoices()
  if(error)return <ErrorState message={error} onRetry={reload}/>
  if(!inv)return <Spinner/>
  const n=f=>inv.filter(f).length
  const queue=inv.filter(i=>['pending','needs_review'].includes(i.reviewStatus)||i.processingStatus==='failed')
  const stats=[
    {label:'Pending review',value:n(i=>i.reviewStatus==='pending'),note:'No review decision recorded',Icon:Clock3},
    {label:'Needs review',value:n(i=>i.reviewStatus==='needs_review'),note:'Flagged for manual review',Icon:AlertTriangle},
    {label:'Reviewed',value:n(i=>i.reviewStatus==='reviewed'),note:'Marked reviewed',Icon:CheckCheck},
    {label:'Rejected',value:n(i=>i.reviewStatus==='rejected'),note:'Marked rejected',Icon:XCircle},
  ]
  const chart=[
    ['uploaded','Uploaded','#8791a4'],['processing','Processing','#7664dc'],
    ['completed','Processed','#258368'],['failed','Failed','#c3555b'],
  ].map(([key,name,color])=>({name,count:n(i=>i.processingStatus===key),color}))
  const latest=[...inv].sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0,6)
  return <>
    <PageHeader eyebrow="OPERATIONS" title="Dashboard" subtitle="Invoice intake, processing status, and work requiring review."><Link to="/upload" className="btn btn-p"><Upload size={15}/>Upload invoice</Link></PageHeader>
    {config.mode==='mock'&&<div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">Demo workspace · sample records only</div>}
    <section aria-label="Review status metrics" className="metrics-strip mb-5">{stats.map(({label,value,note,Icon},index)=><article key={label} className={`metric-cell metric-cell-${index}`}><div className="metric-head"><span>{label}</span><Icon size={16}/></div><p className="metric-value">{value}</p><p className="metric-note">{note}</p></article>)}</section>
    {inv.length===0?<section className="panel"><EmptyState title="No invoices yet" text="Upload an invoice to start building your workspace."><Link to="/upload" className="btn btn-p"><Upload size={15}/>Upload invoice</Link></EmptyState></section>:<>
      <section className="dashboard-panels mb-4">
        <div className="panel dashboard-queue">
          <div className="panel-heading"><div><h2 className="panel-title">Review queue</h2><p className="panel-note">Open review decisions and failed processing</p></div><span className="queue-count">{queue.length} open</span></div>
          {queue.length?<ul className="queue-list">{queue.slice(0,5).map(invoice=><li className="queue-item" key={invoice.id}><div className="queue-identity"><Link className="queue-number" title={invoice.invoiceNumber||`Invoice #${invoice.id}`} to={`/invoices/${invoice.id}/review`}>{invoice.invoiceNumber||`Invoice #${invoice.id}`}</Link><p title={invoice.vendor.name||'Vendor not identified'}>{invoice.vendor.name||'Vendor not identified'}</p><span className="queue-meta">{fmtDate(invoice.invoiceDate)}{invoice.totalAmount!=null?` · ${money(invoice.totalAmount,invoice.currency)}`:''}</span></div><div className="queue-end"><StatusBadge kind={invoice.processingStatus==='failed'?undefined:'review'} value={invoice.processingStatus==='failed'?'failed':invoice.reviewStatus}/><Link className="queue-open" aria-label={`Review invoice ${invoice.invoiceNumber||invoice.id}`} to={`/invoices/${invoice.id}/review`}><ArrowUpRight size={15}/></Link></div></li>)}</ul>:<div className="queue-empty"><span className="empty-icon"><CheckCheck size={19}/></span><p>No invoices need attention.</p></div>}
          {queue.length>5&&<Link to="/invoices" className="queue-all">View all {queue.length} open items <ArrowRight size={13}/></Link>}
        </div>
        <div className="panel dashboard-chart">
          <div className="panel-heading"><div><h2 className="panel-title">Processing status</h2><p className="panel-note">Invoice count by current backend status</p></div><span className="panel-note">{inv.length} total</span></div>
          <div className="status-chart" role="img" aria-label="Invoice counts by processing status"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart} margin={{top:8,right:8,bottom:2,left:-18}} barCategoryGap="38%"><CartesianGrid vertical={false} stroke="#edf0f4"/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:11,fill:'#727a8d'}}/><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize:11,fill:'#727a8d'}}/><Tooltip cursor={{fill:'#f7f7fb'}} formatter={value=>[value,'Invoices']} contentStyle={{border:'1px solid #e5e8ef',borderRadius:7,fontSize:12,boxShadow:'0 4px 12px #1b223012'}}/><Bar dataKey="count" name="Invoices" radius={[4,4,0,0]} maxBarSize={44}>{chart.map(item=><Cell key={item.name} fill={item.color}/>)}</Bar></BarChart></ResponsiveContainer></div>
          <ul className="status-legend" aria-label="Processing status legend">{chart.map(item=><li key={item.name}><span className="legend-swatch" style={{backgroundColor:item.color}}/><span>{item.name}</span><b>{item.count}</b></li>)}</ul>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading"><div><h2 className="panel-title">Recent invoices</h2><p className="panel-note">Most recently updated records</p></div><Link className="btn btn-quiet" to="/invoices">All invoices <ArrowRight size={14}/></Link></div>
        <div className="recent-list">
          <div className="recent-row recent-row-head"><span>Invoice / vendor</span><span>Date</span><span>Amount</span><span>Statuses</span><span/></div>
          {latest.map(invoice=><article className="recent-row" key={invoice.id}>
            <div className="recent-identity"><Link to={`/invoices/${invoice.id}/review`} className="recent-number">{invoice.invoiceNumber||`Invoice #${invoice.id}`}</Link><span className="recent-vendor">{invoice.vendor.name||'Vendor not identified'}</span></div>
            <span className="recent-date"><span className="recent-mobile-label">Date</span>{fmtDate(invoice.invoiceDate)}</span>
            <span className="recent-amount"><span className="recent-mobile-label">Amount</span>{money(invoice.totalAmount,invoice.currency)}</span>
            <div className="recent-status"><StatusBadge value={invoice.processingStatus}/><StatusBadge kind="review" value={invoice.reviewStatus}/></div>
            <Link to={`/invoices/${invoice.id}/review`} className="recent-action">Open <ArrowUpRight size={14}/></Link>
          </article>)}
        </div>
      </section>
    </>}
  </>
}
