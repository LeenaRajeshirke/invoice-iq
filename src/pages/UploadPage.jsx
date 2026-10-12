import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { UploadCloud, X, Loader2, FileText, ShieldCheck, CheckCircle2, CircleAlert, ArrowRight } from 'lucide-react'
import { PageHeader, StatusBadge } from '../components/common'
import { validateFile, sizeStr } from '../utils'
import { config } from '../config'
import { invoiceApi, errMsg } from '../services/invoiceApi'
export default function UploadPage(){
  const [file,setFile]=useState(null),[err,setErr]=useState(null),[busy,setBusy]=useState(false),[prog,setProg]=useState(null),[drag,setDrag]=useState(false),[uploaded,setUploaded]=useState(null)
  const ref=useRef()
  const pick=f=>{if(!f)return;const m=validateFile(f);setErr(m);setUploaded(null);setFile(m?null:f)}
  const reset=()=>{setFile(null);setErr(null);setUploaded(null);setProg(null)}
  async function submit(){
    if(!file||busy)return
    setBusy(true);setProg(0)
    try{const r=await invoiceApi.upload(file,setProg);setUploaded(r)
      if(config.mode==='mock')toast.success('Demo record created; file was not analysed.')
      else if(r.processingStatus==='failed')toast.error('Invoice saved; processing needs attention.')
      else toast.success(r.processingStatus==='completed'?'Invoice processed. Review extracted fields.':'Invoice received.')}
    catch(e){setErr(errMsg(e));toast.error('Upload failed')}
    finally{setBusy(false)}
  }
  return <>
    <PageHeader eyebrow="INGESTION" title="Upload invoice" subtitle="Add a source document to the extraction and review workflow."/>
    {config.mode==='mock'&&<p role="note" className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">Demo mode is active. Uploaded files are not analysed or sent to the backend.</p>}
    <div className="mx-auto max-w-3xl">
    {uploaded?<section className={`upload-result ${uploaded.processingStatus==='failed'?'upload-result-attention':''}`} role="status">
      <span className="upload-result-icon">{uploaded.processingStatus==='failed'?<CircleAlert size={21}/>:<CheckCircle2 size={21}/>}</span>
      <div className="min-w-0 flex-1"><p className="upload-result-eyebrow">{config.mode==='mock'?'DEMO RECORD':uploaded.processingStatus==='failed'?'UPLOAD SAVED':'UPLOAD COMPLETE'}</p><h2>{uploaded.processingStatus==='failed'?'Processing needs attention':config.mode==='mock'?'Demo record created':'Invoice received'}</h2><p className="upload-result-file" title={file?.name}>{file?.name}</p><div className="mt-2 flex flex-wrap items-center gap-2"><StatusBadge value={uploaded.processingStatus}/><span className="text-xs text-slate-500">{uploaded.processingStatus==='failed'?'Open the review to inspect backend warnings.':uploaded.processingStatus==='completed'?'Extraction completed. Review the returned fields.':config.mode==='mock'?'No extraction was run in demo mode.':'Review the invoice fields and processing status.'}</span></div></div>
      <div className="upload-result-actions"><Link className="btn btn-p" to={`/invoices/${uploaded.id}/review`}>Review invoice <ArrowRight size={14}/></Link><button className="btn" onClick={reset}>Upload another</button></div>
    </section>:<>
    <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);pick(e.dataTransfer.files[0])}}
      className={`drop-zone px-5 py-10 text-center ${drag?'drop-zone-active':''}`}>
      <div className="upload-icon"><UploadCloud size={24}/></div>
      <h2 className="mt-4 text-base font-semibold text-slate-800">Drag your invoice here</h2>
      <p className="mt-1 text-xs text-slate-500">or select a document from your device</p>
      <button className="btn mt-4" onClick={()=>ref.current.click()}><FileText size={15}/>Choose file</button>
      <input ref={ref} type="file" hidden accept=".pdf,.png,.jpg,.jpeg" onChange={e=>{pick(e.target.files[0]);e.target.value=''}} aria-label="Select invoice file"/>
      <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] text-slate-500"><span>PDF, PNG, JPG or JPEG</span><span>Maximum {config.maxMB} MB</span><span className="inline-flex items-center gap-1"><ShieldCheck size={12}/>Backend validates file type and content</span></div>
    </div>
    {err&&<p role="alert" className="text-sm text-red-700 mt-2">{err}</p>}
    {file&&<div className="panel mt-3 flex items-center gap-3"><span className="upload-icon h-10 w-10 shrink-0 rounded-lg"><FileText size={18}/></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{file.name}</p><p className="mt-0.5 text-[10px] text-slate-500">{sizeStr(file.size)} · {file.type||'Unknown media type'}</p>{busy&&<div className="mt-2"><div className="mb-1 flex justify-between gap-3 text-[10px] text-slate-500"><span role="status">{prog===100?'Upload complete. Waiting for backend processing…':'Uploading document…'}</span>{prog!=null&&<span>{prog}%</span>}</div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600 transition-[width]" style={{width:`${prog||0}%`}}/></div></div>}</div>{!busy&&<button className="icon-button shrink-0" aria-label="Remove file" onClick={()=>{setFile(null);setErr(null)}}><X size={16}/></button>}{!busy&&<CheckCircle2 className="shrink-0 text-emerald-600" size={17}/>}</div>}
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"><button className="btn btn-p min-w-40" disabled={!file||busy} onClick={submit}>{busy?<Loader2 className="animate-spin" size={15}/>:<UploadCloud size={15}/ >}{busy?'Uploading…':'Upload and process'}</button><p className="text-[10px] text-slate-400">Processing status and extraction warnings will be shown on the review page.</p></div>
    </>}
    </div>
  </>
}
