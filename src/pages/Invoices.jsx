import { useMemo, useState } from 'react'
import { Download, Search, SlidersHorizontal, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useInvoices } from '../hooks'
import { Spinner, ErrorState, EmptyState, PageHeader } from '../components/common'
import InvoiceTable from '../components/InvoiceTable'
import { REVIEW } from '../services/mappers'
import { invoiceApi, errMsg } from '../services/invoiceApi'
import { download } from '../utils'
export default function Invoices(){
  const {invoices,error,reload}=useInvoices()
  const [q,setQ]=useState(''),[status,setStatus]=useState(''),[from,setFrom]=useState(''),[sort,setSort]=useState({key:'updatedAt',dir:-1})
  const [exporting,setExporting]=useState(null)
  async function exportAll(format){
    if(exporting)return
    setExporting(format)
    try{const blob=await invoiceApi.export(format);download(`invoices.${format}`,blob,format==='json'?'application/json':'text/csv');toast.success(`${format.toUpperCase()} export downloaded.`)}
    catch(e){toast.error(errMsg(e))}
    finally{setExporting(null)}
  }
  const rows=useMemo(()=>{
    if(!invoices)return []
    const s=q.trim().toLowerCase()
    const val=(i,k)=>k==='vendor'?i.vendor.name:i[k]
    return invoices.filter(i=>(!s||(i.vendor.name||'').toLowerCase().includes(s)||(i.invoiceNumber||'').toLowerCase().includes(s))&&(!status||i.reviewStatus===status)&&(!from||(i.invoiceDate&&i.invoiceDate>=from)))
      .sort((a,b)=>{const x=val(a,sort.key)??'',y=val(b,sort.key)??'';return (x>y?1:x<y?-1:0)*sort.dir})
  },[invoices,q,status,from,sort])
  const hasFilters=!!(q||status||from)
  const clearFilters=()=>{setQ('');setStatus('');setFrom('')}
  if(error)return <ErrorState message={error} onRetry={reload}/>
  if(!invoices)return <Spinner/>
  return <>
    <PageHeader eyebrow="RECORDS" title="Invoices" subtitle="Search, filter, and review documents from your workspace.">{['json','csv'].map(format=><button key={format} className="btn" disabled={!!exporting} onClick={()=>exportAll(format)}><Download size={14}/>{exporting===format?'Exporting…':`Export ${format.toUpperCase()}`}</button>)}</PageHeader>
    <section className="panel mb-4" aria-label="Invoice filters">
      <div className="panel-heading"><div className="flex items-center gap-2"><span className="kpi-icon"><SlidersHorizontal size={15}/></span><div><h2 className="panel-title">Find invoices</h2><p className="panel-note">Filter by supplier, review state, or invoice date.</p></div></div>{hasFilters&&<button className="btn btn-quiet" onClick={clearFilters}><X size={14}/>Clear filters</button>}</div>
      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
        <label className="text-[11px] font-semibold">Search invoices<span className="relative mt-1 block"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input className="inp pl-9" placeholder="Vendor or invoice number" value={q} onChange={e=>setQ(e.target.value)}/></span></label>
        <label className="text-[11px] font-semibold">Review status<select className="inp mt-1" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All review statuses</option>{Object.entries(REVIEW).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
        <label className="text-[11px] font-semibold">Invoice date from<input type="date" className="inp mt-1" value={from} onChange={e=>setFrom(e.target.value)}/></label>
      </div>
    </section>
    <section className="panel">
      <div className="panel-heading"><div><h2 className="panel-title">All invoices</h2><p className="panel-note">Showing {rows.length} of {invoices.length} records</p></div></div>
      {rows.length?<InvoiceTable rows={rows} sort={sort} onSort={key=>setSort(current=>({key,dir:current.key===key?-current.dir:1}))}/>:<EmptyState title={hasFilters?'No matching invoices':'No invoices yet'} text={hasFilters?'Try adjusting or clearing your filters.':'Uploaded invoices will appear here.'}/ >}
    </section>
    <p className="mt-3 text-[10px] text-slate-400">Invoice deletion is not available through the current backend.</p>
  </>
}
