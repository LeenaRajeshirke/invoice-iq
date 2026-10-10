import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { UploadCloud, X, Loader2 } from 'lucide-react'
import { PageHeader } from '../components/common'
import { validateFile, sizeStr } from '../utils'
import { config } from '../config'
import { invoiceApi, errMsg } from '../services/invoiceApi'
export default function UploadPage(){
  const [file,setFile]=useState(null),[err,setErr]=useState(null),[busy,setBusy]=useState(false),[prog,setProg]=useState(null),[drag,setDrag]=useState(false)
  const ref=useRef(),nav=useNavigate()
  useEffect(()=>()=>{},[])
  const pick=f=>{if(!f)return;const m=validateFile(f);setErr(m);setFile(m?null:f)}
  async function submit(){
    if(!file||busy)return
    setBusy(true);setProg(0)
    try{const r=await invoiceApi.upload(file,setProg)
      toast.success(config.mode==='mock'?'Demo record created (file NOT analysed).':'Invoice uploaded.');nav(`/invoices/${r.id}/review`)}
    catch(e){setErr(errMsg(e));toast.error('Upload failed')}
    finally{setBusy(false)}
  }
  return <>
    <PageHeader title="Upload Invoice"/>
    {config.mode==='mock'&&<p role="note" className="mb-3 text-sm bg-amber-50 border border-amber-200 rounded p-2">Demo mode: your file is previewed but <b>no OCR/AI extraction runs</b>. Switch to live mode for real processing.</p>}
    <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);pick(e.dataTransfer.files[0])}}
      className={`card border-2 border-dashed text-center py-10 ${drag?'border-indigo-500 bg-indigo-50':''}`}>
      <UploadCloud className="mx-auto text-slate-400" size={36}/>
      <p className="mt-2">Drag & drop an invoice here, or</p>
      <button className="btn mt-2" onClick={()=>ref.current.click()}>Choose file</button>
      <input ref={ref} type="file" hidden accept=".pdf,.png,.jpg,.jpeg" onChange={e=>{pick(e.target.files[0]);e.target.value=''}} aria-label="Select invoice file"/>
      <p className="text-xs text-slate-500 mt-2">PDF, PNG, JPG, JPEG · max {config.maxMB} MB. The backend performs the authoritative file validation.</p>
    </div>
    {err&&<p role="alert" className="text-sm text-red-700 mt-2">{err}</p>}
    {file&&<div className="card mt-3 flex items-center justify-between gap-2"><div className="min-w-0"><p className="font-medium truncate">{file.name}</p><p className="text-xs text-slate-500">{sizeStr(file.size)} · {file.type||'unknown type'}{busy&&prog!=null?` · uploading ${prog}%`:''}</p></div><button className="btn" disabled={busy} aria-label="Remove file" onClick={()=>setFile(null)}><X size={14}/></button></div>}
    <button className="btn btn-p mt-3" disabled={!file||busy} onClick={submit}>{busy&&<Loader2 className="animate-spin" size={16}/>}{busy?'Uploading…':'Process Invoice'}</button>
  </>
}
