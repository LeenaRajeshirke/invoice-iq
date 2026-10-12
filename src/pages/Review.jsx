import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Trash2, Save, Download, ZoomIn, ZoomOut, ExternalLink, FileText, ArrowLeft, Loader2 } from 'lucide-react'
import { invoiceApi, errMsg } from '../services/invoiceApi'
import { Spinner, ErrorState, StatusBadge, ConfidenceBadge, Warning, ConfirmDialog } from '../components/common'
import { download, toCsv, toJson } from '../utils'
import { config } from '../config'

const setPath=(o,p,v)=>{const c=structuredClone(o);let t=c;const k=p.split('.');k.slice(0,-1).forEach(x=>t=t[x]);t[k.at(-1)]=v;return c}
const num=v=>v===''?null:Number(v)
const lineFields=config.mode==='live'?[['quantity','Qty'],['unitPrice','Unit price'],['taxAmount','Tax amount'],['total','Total']]:[['quantity','Qty'],['unitPrice','Unit price'],['taxRate','Tax %'],['total','Total']]

function Preview({id,url}){
  const [zoom,setZoom]=useState(1),[failed,setFailed]=useState(false)
  const file=useMemo(()=>invoiceApi.getFile(id),[id])
  const [obj,setObj]=useState(null)
  useEffect(()=>{if(!file){setObj(null);return}const u=URL.createObjectURL(file);setObj({u,type:file.type});return()=>URL.revokeObjectURL(u)},[file])  // revoke on unmount
  const src=obj?.u||url, isPdf=obj?obj.type==='application/pdf':/\.pdf(\?|$)/i.test(url||'')
  if(!src)return null
  return <section className="panel">
    <div className="panel-heading"><div><h2 className="panel-title">Source document</h2><p className="panel-note">Original file preview</p></div><div className="flex gap-1">
      <button className="icon-button" aria-label="Zoom out" title="Zoom out" disabled={zoom<=.5||isPdf} onClick={()=>setZoom(z=>z-.25)}><ZoomOut size={15}/></button>
      <button className="icon-button" aria-label="Zoom in" title="Zoom in" disabled={zoom>=3||isPdf} onClick={()=>setZoom(z=>z+.25)}><ZoomIn size={15}/></button>
      {src&&<a className="icon-button" href={src} target="_blank" rel="noreferrer" aria-label="Open original document" title="Open original document"><ExternalLink size={15}/></a>}</div></div>
    <div className="review-preview grid h-[60vh] max-h-[680px] place-items-center overflow-auto">
      {!src||failed?<div className="max-w-xs px-6 text-center"><span className="empty-icon mx-auto"><ExternalLink size={18}/></span><p className="text-xs font-semibold text-slate-700">{failed?'Preview unavailable':'No document preview'}</p><p className="mt-1 text-[10px] leading-5 text-slate-500">{failed?'The document could not be rendered.':'The current backend does not provide an endpoint to retrieve the uploaded file.'}</p></div>
      :isPdf?<iframe title="Invoice PDF" src={src} className="w-full h-full" onError={()=>setFailed(true)}/>
      :<img alt="Uploaded invoice" src={src} style={{width:`${zoom*100}%`,maxWidth:'none'}} onError={()=>setFailed(true)}/>}
    </div></section>
}

export default function Review(){
  const {id}=useParams()
  const [saved,setSaved]=useState(null),[form,setForm]=useState(null),[error,setError]=useState(null),[busy,setBusy]=useState(false),[activeAction,setActiveAction]=useState(null),[confirm,setConfirm]=useState(false)
  const saving=useRef(false)
  useEffect(()=>{let live=true;setSaved(null);setError(null)
    invoiceApi.get(id).then(i=>{if(live){setSaved(i);setForm(structuredClone(i))}}).catch(e=>live&&setError(errMsg(e)));return()=>{live=false}},[id])
  const dirty=saved&&form&&JSON.stringify(saved)!==JSON.stringify(form)
  useEffect(()=>{if(!dirty)return;const h=e=>{e.preventDefault();e.returnValue=''};window.addEventListener('beforeunload',h);return()=>window.removeEventListener('beforeunload',h)},[dirty])
  if(error)return <ErrorState message={error}/>
  if(!form)return <Spinner/>
  const warningGroups=[
    {key:'error',title:'Action required',items:form.validationWarnings.filter(w=>w.severity==='error')},
    {key:'warning',title:'Review notes',items:form.validationWarnings.filter(w=>!w.severity||w.severity==='warning')},
    {key:'info',title:'Information',items:form.validationWarnings.filter(w=>w.severity==='info')},
  ].filter(group=>group.items.length)

  const edit=(p,v)=>setForm(f=>setPath(f,p,v))
  const editLine=(i,k,v)=>setForm(f=>({...f,lineItems:f.lineItems.map((l,x)=>x===i?{...l,[k]:v}:l)}))
  const run=async(fn,okMsg,action)=>{if(saving.current)return;saving.current=true;setBusy(true);setActiveAction(action)
    try{const r=await fn();setSaved(r);setForm(structuredClone(r));toast.success(okMsg)}
    catch(e){toast.error(errMsg(e)+' Your edits were kept.')}finally{saving.current=false;setBusy(false);setActiveAction(null)}}
  const payload=()=>{const{id:_i,...rest}=form;return rest}
  const save=()=>run(()=>invoiceApi.save(id,payload()),'Corrections saved.','save')
  const review=s=>run(async()=>{if(dirty)await invoiceApi.save(id,payload());return invoiceApi.setReview(id,s)},'Status updated',`review:${s}`)

  const F=({label,path,type='text',conf})=>{const v=path.split('.').reduce((o,k)=>o?.[k],form),missing=v==null||v==='',confidence=conf?form.confidence?.[conf]:null
    return <label className={`review-field ${missing?'review-field-missing':''}`}><span className="review-field-label">{label}{confidence!=null?<ConfidenceBadge value={confidence}/>:missing&&<em>Not provided</em>}</span>
      <input className={`inp ${missing?'input-missing':''}`} type={type} step={type==='number'?'0.01':undefined} placeholder={type==='text'?`Enter ${label.toLowerCase()}`:undefined} value={v??''} onChange={e=>edit(path,type==='number'?num(e.target.value):e.target.value||null)}/></label>}
  const Sec=({t,children})=><fieldset className="card mb-3"><legend className="font-medium px-1">{t}</legend><div className="grid sm:grid-cols-2 gap-3">{children}</div></fieldset>
  const doExport=(k)=>{try{k==='json'?download(`${form.invoiceNumber||form.id}.json`,toJson(form),'application/json'):download(`${form.invoiceNumber||form.id}.csv`,toCsv(form),'text/csv;charset=utf-8');toast.success('Export generated.')}catch{toast.error('Export failed.')}}
  const hasPreview=Boolean(invoiceApi.getFile(id)||form.originalFileUrl)

  return <>
    <section className="review-identity">
      <div className="review-identity-main"><Link className="review-back" to="/invoices"><ArrowLeft size={14}/>Invoices</Link><div className="review-identity-title"><span className="review-file-icon"><FileText size={20}/></span><div className="min-w-0"><p className="review-eyebrow">INVOICE REVIEW <span>·</span> RECORD {form.id}</p><h1>{form.invoiceNumber||`Invoice #${form.id}`}</h1><p className="review-filename" title={form.original_filename||''}>{form.vendor.name||'Vendor not identified'}{form.original_filename?` · ${form.original_filename}`:''}</p></div></div></div>
      <div className="review-identity-tools"><div className="review-statuses"><div><span>Processing</span><StatusBadge value={form.processingStatus}/></div><div><span>Review</span><StatusBadge kind="review" value={saved.reviewStatus}/></div>{dirty&&<span className="review-dirty">Unsaved edits</span>}</div><div className="review-export"><button className="btn" onClick={()=>doExport('json')}><Download size={14}/>JSON</button><button className="btn" onClick={()=>doExport('csv')}><Download size={14}/>CSV</button></div></div>
    </section>
    <div className={`review-grid grid items-start gap-4 ${hasPreview?'with-preview':''}`}>
      {hasPreview&&<div className="lg:sticky lg:top-16"><Preview id={id} url={form.originalFileUrl}/></div>}
      <div>
        {!hasPreview&&<div className="source-unavailable" role="status"><span><FileText size={16}/></span><div><b>Original document unavailable</b><p>The backend did not provide a document URL, so only extracted fields can be reviewed here.</p></div></div>}
        {warningGroups.length>0&&<section className="panel warning-panel mb-3"><div className="panel-heading mb-3"><div><p className="review-section-kicker">PROCESSING FEEDBACK</p><h2 className="panel-title">Validation notes</h2><p className="panel-note">Returned by the processing service; review alongside the extracted fields.</p></div><span className="warning-total">{form.validationWarnings.length} {form.validationWarnings.length===1?'note':'notes'}</span></div><div className="warning-groups">{warningGroups.map(group=><section className={`warning-group warning-group-${group.key}`} key={group.key}><h3>{group.title}<span>{group.items.length}</span></h3><ul>{group.items.map((w,i)=><Warning key={`${group.key}-${i}`} w={w}/>)}</ul></section>)}</div></section>}
        <Sec t="Invoice"><F label="Invoice number" path="invoiceNumber" conf="invoiceNumber"/><F label="Invoice date" path="invoiceDate" type="date" conf="invoiceDate"/><F label="Due date" path="dueDate" type="date" conf="dueDate"/><F label="Currency" path="currency" conf="currency"/>{config.mode==='mock'&&<F label="Payment terms" path="paymentTerms"/>}</Sec>
        <Sec t="Vendor"><F label="Name" path="vendor.name" conf="vendor"/>{config.mode==='mock'&&<><F label="Tax ID" path="vendor.taxId"/><div className="sm:col-span-2"><F label="Address" path="vendor.address"/></div></>}</Sec>
        {config.mode==='mock'&&<Sec t="Customer"><F label="Name" path="customer.name"/><F label="Tax ID" path="customer.taxId"/><div className="sm:col-span-2"><F label="Address" path="customer.address"/></div></Sec>}
        <Sec t="Financial summary"><F label="Subtotal" path="subtotal" type="number" conf="subtotal"/><F label="Tax amount" path="taxAmount" type="number" conf="taxAmount"/><F label="Discount" path="discount" type="number"/><F label="Total amount" path="totalAmount" type="number" conf="totalAmount"/></Sec>
        <section className="panel mb-3"><div className="panel-heading"><div><h2 className="panel-title">Line items</h2><p className="panel-note">Edit extracted item details before saving.</p></div><button className="btn" onClick={()=>setForm(f=>({...f,lineItems:[...f.lineItems,{id:'new-'+Date.now(),description:'',quantity:null,unitPrice:null,[config.mode==='live'?'taxAmount':'taxRate']:null,total:null}]}))}><Plus size={14}/>Add line</button></div>
          {form.lineItems.length===0?<p className="rounded-md bg-slate-50 px-3 py-5 text-center text-xs text-slate-500">No line items were returned.</p>:<div className="table-wrap"><table className="invoice-table min-w-[560px]"><thead><tr><th>Description</th>{lineFields.map(([,label])=><th key={label}>{label}</th>)}<th/></tr></thead><tbody>
            {form.lineItems.map((l,i)=><tr key={l.id}><td className="pr-1"><input aria-label="Description" className="inp" value={l.description} onChange={e=>editLine(i,'description',e.target.value)}/></td>
              {lineFields.map(([key,label])=><td key={key} className="pr-1"><input aria-label={label} type="number" step="0.01" className="inp w-24" value={l[key]??''} onChange={e=>editLine(i,key,num(e.target.value))}/></td>)}
                <td><button className="icon-button" aria-label="Remove line" title="Remove line" onClick={()=>setForm(f=>({...f,lineItems:f.lineItems.filter((_,x)=>x!==i)}))}><Trash2 size={14}/></button></td></tr>)}</tbody></table></div>}</section>
                <div className="review-actions flex flex-wrap gap-2">
              <button className="btn btn-p" disabled={!dirty||busy} onClick={save}>{activeAction==='save'?<Loader2 className="animate-spin" size={14}/>:<Save size={14}/ >}{activeAction==='save'?'Saving…':'Save corrections'}</button>
              <button className="btn btn-review-success" disabled={busy} onClick={()=>review('reviewed')}>{activeAction==='review:reviewed'&&<Loader2 className="animate-spin" size={14}/>}Mark reviewed</button>
              <button className="btn btn-review-warning" disabled={busy} onClick={()=>review('needs_review')}>{activeAction==='review:needs_review'&&<Loader2 className="animate-spin" size={14}/>}Keep in review</button>
              <button className="btn btn-review-danger" disabled={busy} onClick={()=>setConfirm(true)}>Reject</button>
          <button className="btn" disabled title="Reprocess endpoint not available yet">Reprocess</button>
        </div>
      </div>
    </div>
    <ConfirmDialog open={confirm} title="Reject this invoice?" text="It will be marked as Rejected. You can change the status later." onNo={()=>setConfirm(false)} onYes={()=>{setConfirm(false);review('rejected')}}/>
  </>
}
