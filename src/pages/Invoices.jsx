import { useMemo, useState } from 'react'
import { useInvoices } from '../hooks'
import { Spinner, ErrorState, EmptyState, PageHeader } from '../components/common'
import InvoiceTable from '../components/InvoiceTable'
import { REVIEW } from '../services/mappers'
export default function Invoices(){
  const {invoices,error,reload}=useInvoices()
  const [q,setQ]=useState(''),[status,setStatus]=useState(''),[from,setFrom]=useState(''),[sort,setSort]=useState({key:'updatedAt',dir:-1})
  const rows=useMemo(()=>{
    if(!invoices)return []
    const s=q.trim().toLowerCase()
    const val=(i,k)=>k==='vendor'?i.vendor.name:i[k]
    return invoices.filter(i=>(!s||(i.vendor.name||'').toLowerCase().includes(s)||(i.invoiceNumber||'').toLowerCase().includes(s))&&(!status||i.reviewStatus===status)&&(!from||(i.invoiceDate&&i.invoiceDate>=from)))
      .sort((a,b)=>{const x=val(a,sort.key)??'',y=val(b,sort.key)??'';return (x>y?1:x<y?-1:0)*sort.dir})
  },[invoices,q,status,from,sort])
  if(error)return <ErrorState message={error} onRetry={reload}/>
  if(!invoices)return <Spinner/>
  return <>
    <PageHeader title="Invoices"/>
    <div className="card mb-4 grid gap-2 sm:grid-cols-3">
      <label className="text-sm">Search<input className="inp" placeholder="Vendor or invoice number" value={q} onChange={e=>setQ(e.target.value)}/></label>
      <label className="text-sm">Review status<select className="inp" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All</option>{Object.entries(REVIEW).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
      <label className="text-sm">Invoice date from<input type="date" className="inp" value={from} onChange={e=>setFrom(e.target.value)}/></label>
    </div>
    <div className="card">{rows.length?<InvoiceTable rows={rows} sort={sort} onSort={k=>setSort(s=>({key:k,dir:s.key===k?-s.dir:1}))}/>:<EmptyState title="No invoices found" text="Try changing the search or filters."/>}</div>
    <p className="text-xs text-slate-500 mt-2">Deleting invoices is not available: no delete endpoint is defined yet.</p>
  </>
}
