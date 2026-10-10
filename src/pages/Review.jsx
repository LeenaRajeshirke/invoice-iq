import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Trash2, Save, Download, ZoomIn, ZoomOut, ExternalLink } from 'lucide-react'
import { invoiceApi, errMsg } from '../services/invoiceApi'
import { Spinner, ErrorState, StatusBadge, ConfidenceBadge, Warning, ConfirmDialog, PageHeader } from '../components/common'
import { download, toCsv, toJson } from '../utils'
import { config } from '../config'

const setPath=(o,p,v)=>{const c=structuredClone(o);let t=c;const k=p.split('.');k.slice(0,-1).forEach(x=>t=t[x]);t[k.at(-1)]=v;return c}
const num=v=>v===''?null:Number(v)

function Preview({id,url}){
  const [zoom,setZoom]=useState(1),[failed,setFailed]=useState(false)
  const file=useMemo(()=>invoiceApi.getFile(id),[id])
  const [obj,setObj]=useState(null)
  useEffect(()=>{if(!file){setObj(null);return}const u=URL.createObjectURL(file);setObj({u,type:file.type});return()=>URL.revokeObjectURL(u)},[file])  // revoke on unmount
  const src=obj?.u||url, isPdf=obj?obj.type==='application/pdf':/\.pdf(\?|$)/i.test(url||'')
  return <div className="card">
    <div className="flex items-center gap-2 mb-2"><h2 className="font-medium mr-auto">Original document</h2>
      <button className="btn" aria-label="Zoom out" disabled={zoom<=.5||isPdf} onClick={()=>setZoom(z=>z-.25)}><ZoomOut size={14}/></button>
      <button className="btn" aria-label="Zoom in" disabled={zoom>=3||isPdf} onClick={()=>setZoom(z=>z+.25)}><ZoomIn size={14}/></button>
      {src&&<a className="btn" href={src} target="_blank" rel="noreferrer"><ExternalLink size={14}/>Open</a>}</div>
    <div className="border rounded bg-slate-100 overflow-auto h-[60vh] grid place-items-start">
      {!src||failed?<p className="p-6 text-sm text-slate-500 m-auto">{failed?'Preview could not be rendered.':'No original document available for this record (demo records have no file).'}</p>
      :isPdf?<iframe title="Invoice PDF" src={src} className="w-full h-full" onError={()=>setFailed(true)}/>
      :<img alt="Uploaded invoice" src={src} style={{width:`${zoom*100}%`,maxWidth:'none'}} onError={()=>setFailed(true)}/>}
    </div></div>
}

export default function Review(){
  const {id}=useParams()
  const [saved,setSaved]=useState(null),[form,setForm]=useState(null),[error,setError]=useState(null),[busy,setBusy]=useState(false),[confirm,setConfirm]=useState(false)
  const saving=useRef(false)
  useEffect(()=>{let live=true;setSaved(null);setError(null)
    invoiceApi.get(id).then(i=>{if(live){setSaved(i);setForm(structuredClone(i))}}).catch(e=>live&&setError(errMsg(e)));return()=>{live=false}},[id])
  const dirty=saved&&form&&JSON.stringify(saved)!==JSON.stringify(form)
  useEffect(()=>{if(!dirty)return;const h=e=>{e.preventDefault();e.returnValue=''};window.addEventListener('beforeunload',h);return()=>window.removeEventListener('beforeunload',h)},[dirty])
  if(error)return <ErrorState message={error}/>
  if(!form)return <Spinner/>

  const edit=(p,v)=>setForm(f=>setPath(f,p,v))
  const editLine=(i,k,v)=>setForm(f=>({...f,lineItems:f.lineItems.map((l,x)=>x===i?{...l,[k]:v}:l)}))
  const run=async(fn,okMsg)=>{if(saving.current)return;saving.current=true;setBusy(true)
    try{const r=await fn();setSaved(r);setForm(structuredClone(r));toast.success(okMsg)}   // success toast only AFTER a successful response
    catch(e){toast.error(errMsg(e)+' Your edits were kept.')}finally{saving.current=false;setBusy(false)}}
  const payload=()=>{const{id:_i,...rest}=form;return rest}
  const save=()=>run(()=>invoiceApi.save(id,payload()),'Corrections saved.')
  const review=s=>run(async()=>{if(dirty)await invoiceApi.save(id,payload());return invoiceApi.setReview(id,s)},'Status updated.')

  const F=({label,path,type='text',conf})=>{const v=path.split('.').reduce((o,k)=>o?.[k],form)
    return <label className="block text-sm"><span className="flex justify-between items-center gap-2 mb-0.5">{label}{conf!==undefined&&<ConfidenceBadge value={form.confidence?.[conf]}/>}</span>
      <input className="inp" type={type} step={type==='number'?'0.01':undefined} value={v??''} onChange={e=>edit(path,type==='number'?num(e.target.value):e.target.value||null)}/></label>}
  const Sec=({t,children})=><fieldset className="card mb-3"><legend className="font-medium px-1">{t}</legend><div className="grid sm:grid-cols-2 gap-3">{children}</div></fieldset>
  const doExport=(k)=>{try{k==='json'?download(`${form.invoiceNumber||form.id}.json`,toJson(form),'application/json'):download(`${form.invoiceNumber||form.id}.csv`,toCsv(form),'text/csv;charset=utf-8');toast.success('Export generated.')}catch{toast.error('Export failed.')}}

  return <>
    <PageHeader title={`Review ${form.invoiceNumber||'invoice'}`}>
      <Link to="/invoices" className="btn">Back</Link>
      <button className="btn" onClick={()=>doExport('json')}><Download size={14}/>JSON</button>
      <button className="btn" onClick={()=>doExport('csv')}><Download size={14}/>CSV</button>
    </PageHeader>
    <div className="flex gap-2 mb-3 items-center flex-wrap"><StatusBadge value={form.processingStatus}/><StatusBadge kind="review" value={saved.reviewStatus}/>{dirty&&<span className="text-xs text-amber-700">Unsaved changes</span>}{config.mode==='mock'&&<span className="text-xs text-amber-700">Demo data - not real AI output</span>}</div>
    <div className="grid lg:grid-cols-2 gap-4 items-start">
      <div className="lg:sticky lg:top-16"><Preview id={id} url={form.originalFileUrl}/></div>
      <div>
        {form.validationWarnings.length>0&&<div className="card mb-3"><h2 className="font-medium mb-2">Validation warnings <span className="text-xs text-slate-500">(from backend)</span></h2><ul className="space-y-2">{form.validationWarnings.map((w,i)=><Warning key={i} w={w}/>)}</ul></div>}
        <Sec t="Invoice"><F label="Invoice number" path="invoiceNumber" conf="invoiceNumber"/><F label="Invoice date" path="invoiceDate" type="date" conf="invoiceDate"/><F label="Due date" path="dueDate" type="date" conf="dueDate"/><F label="Currency" path="currency" conf="currency"/><F label="Payment terms" path="paymentTerms"/></Sec>
        <Sec t="Vendor"><F label="Name" path="vendor.name" conf="vendor"/><F label="Tax ID" path="vendor.taxId"/><div className="sm:col-span-2"><F label="Address" path="vendor.address"/></div></Sec>
        <Sec t="Customer"><F label="Name" path="customer.name"/><F label="Tax ID" path="customer.taxId"/><div className="sm:col-span-2"><F label="Address" path="customer.address"/></div></Sec>
        <Sec t="Financial summary"><F label="Subtotal" path="subtotal" type="number" conf="subtotal"/><F label="Tax amount" path="taxAmount" type="number" conf="taxAmount"/><F label="Discount" path="discount" type="number"/><F label="Total amount" path="totalAmount" type="number" conf="totalAmount"/></Sec>
        <div className="card mb-3"><div className="flex justify-between mb-2"><h2 className="font-medium">Line items</h2><button className="btn" onClick={()=>setForm(f=>({...f,lineItems:[...f.lineItems,{id:'new-'+Date.now(),description:'',quantity:null,unitPrice:null,taxRate:null,total:null}]}))}><Plus size={14}/>Add</button></div>
          {form.lineItems.length===0?<p className="text-sm text-slate-500">No line items.</p>:<div className="overflow-x-auto"><table className="w-full text-sm min-w-[560px]"><thead><tr className="text-left text-slate-500"><th>Description</th><th>Qty</th><th>Unit price</th><th>Tax %</th><th>Total</th><th/></tr></thead><tbody>
            {form.lineItems.map((l,i)=><tr key={l.id}><td className="pr-1"><input aria-label="Description" className="inp" value={l.description} onChange={e=>editLine(i,'description',e.target.value)}/></td>
              {['quantity','unitPrice','taxRate','total'].map(k=><td key={k} className="pr-1"><input aria-label={k} type="number" step="0.01" className="inp w-24" value={l[k]??''} onChange={e=>editLine(i,k,num(e.target.value))}/></td>)}
              <td><button className="btn" aria-label="Remove line" onClick={()=>setForm(f=>({...f,lineItems:f.lineItems.filter((_,x)=>x!==i)}))}><Trash2 size={14}/></button></td></tr>)}</tbody></table></div>}</div>
        <div className="card flex flex-wrap gap-2 sticky bottom-2">
          <button className="btn btn-p" disabled={!dirty||busy} onClick={save}><Save size={14}/>Save Corrections</button>
          <button className="btn" disabled={busy} onClick={()=>review('reviewed')}>Accept / Mark Reviewed</button>
          <button className="btn" disabled={busy} onClick={()=>review('needs_review')}>Mark for Review</button>
          <button className="btn" disabled={busy} onClick={()=>setConfirm(true)}>Reject</button>
          <button className="btn" disabled title="Reprocess endpoint not available yet">Reprocess</button>
        </div>
      </div>
    </div>
    <ConfirmDialog open={confirm} title="Reject this invoice?" text="It will be marked as Rejected. You can change the status later." onNo={()=>setConfirm(false)} onYes={()=>{setConfirm(false);review('rejected')}}/>
  </>
}
