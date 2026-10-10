import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Upload } from 'lucide-react'
import { useInvoices } from '../hooks'
import { Spinner, ErrorState, EmptyState, PageHeader } from '../components/common'
import InvoiceTable from '../components/InvoiceTable'
import { config } from '../config'
export default function Dashboard(){
  const {invoices:inv,error,reload}=useInvoices()
  if(error)return <ErrorState message={error} onRetry={reload}/>
  if(!inv)return <Spinner/>
  const n=f=>inv.filter(f).length
  const stats=[['Total invoices',inv.length],['Reviewed',n(i=>i.reviewStatus==='reviewed')],['Awaiting review',n(i=>i.reviewStatus==='needs_review')],['Failed processing',n(i=>i.processingStatus==='failed')]]
  const chart=['uploaded','processing','completed','failed'].map(s=>({name:s,count:n(i=>i.processingStatus===s)}))
  return <>
    <PageHeader title="Dashboard"><Link to="/upload" className="btn btn-p"><Upload size={16}/>Upload Invoice</Link></PageHeader>
    <p className="text-slate-600 mb-4">Welcome to InvoiceIQ. Review extracted invoice data and correct it before export.{config.mode==='mock'&&' Showing sample/demo data.'}</p>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">{stats.map(([l,v])=><div key={l} className="card"><p className="text-sm text-slate-500">{l}</p><p className="text-2xl font-semibold">{v}</p></div>)}</div>
    {inv.length===0?<EmptyState title="No invoices yet" text="Upload your first invoice to get started."><Link to="/upload" className="btn btn-p">Upload Invoice</Link></EmptyState>:<>
      <div className="card mb-4"><h2 className="font-medium mb-2">Processing status</h2><div style={{height:220}}><ResponsiveContainer><BarChart data={chart}><XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="count" fill="#4f46e5"/></BarChart></ResponsiveContainer></div></div>
      <div className="card"><div className="flex justify-between mb-2"><h2 className="font-medium">Recent invoices</h2><Link className="text-indigo-600 text-sm" to="/invoices">View all</Link></div><InvoiceTable rows={[...inv].sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0,5)}/></div></>}
  </>
}
