import { Loader2, AlertCircle, Inbox, AlertTriangle, Info } from 'lucide-react'
import { PROCESSING, REVIEW } from '../services/mappers'
import { confPct, confLevel } from '../utils'
export const Spinner=({label='Loading records…'})=><div role="status" className="panel flex min-h-36 items-center justify-center gap-3 text-sm text-slate-500"><Loader2 className="animate-spin text-violet-600" size={18}/>{label}</div>
export const ErrorState=({message,onRetry})=><div role="alert" className="panel flex items-start gap-3 border-red-200 bg-red-50/70"><AlertCircle className="mt-0.5 shrink-0 text-red-600" size={20}/><div><p className="font-semibold text-red-900">We couldn’t load this view</p><p className="mt-1 text-sm text-red-800">{message}</p>{onRetry&&<button className="btn mt-3" onClick={onRetry}>Try again</button>}</div></div>
export const EmptyState=({title,text,children})=><div className="empty-state"><span className="empty-icon"><Inbox size={20}/></span><div><h2>{title}</h2><p>{text}</p>{children&&<div className="mt-4">{children}</div>}</div></div>
const tone={green:'badge-green',amber:'badge-amber',red:'badge-red',blue:'badge-blue',grey:'badge-grey'}
const pc={uploaded:'grey',processing:'blue',completed:'green',failed:'red'},rc={pending:'grey',needs_review:'amber',reviewed:'green',rejected:'red'}
export const StatusBadge=({kind,value})=>{const labels=kind==='review'?REVIEW:PROCESSING;const colors=kind==='review'?rc:pc;return <span className={`status-badge ${tone[colors[value]||'grey']}`}>{labels[value]||value||'Unknown'}</span>}
export function ConfidenceBadge({value}){
  const p=confPct(value),l=confLevel(p)
  if(p==null)return <span className="text-xs text-slate-400">Confidence: Not available</span>
  const m={high:['High confidence','green'],mid:['Moderate confidence','amber'],low:['Low confidence','red']}[l]
  return <span title="Model-reported confidence; thresholds are display settings only." className={`text-xs px-2 py-0.5 rounded-full ${tone[m[1]]}`}>{m[0]} · {p}%</span>
}
export const Warning=({w})=>{const I=w.severity==='info'?Info:AlertTriangle;return <li className={`flex gap-2 rounded-md border px-3 py-2.5 text-xs leading-5 ${w.severity==='error'?'border-red-200 bg-red-50 text-red-900':w.severity==='info'?'border-violet-200 bg-violet-50 text-violet-900':'border-amber-200 bg-amber-50 text-amber-900'}`}><I size={15} className="mt-0.5 shrink-0"/><span><b className="capitalize">{w.severity||'warning'}</b>: {w.message}{w.field&&<em className="text-slate-500"> (field: {w.field})</em>}</span></li>}
export function ConfirmDialog({open,title,text,onYes,onNo}){
  if(!open)return null
  return <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 p-4"><div className="panel w-full max-w-sm"><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-slate-600">{text}</p><div className="mt-4 flex justify-end gap-2"><button autoFocus className="btn" onClick={onNo}>Cancel</button><button className="btn btn-p" onClick={onYes}>Confirm</button></div></div></div>
}
export const PageHeader=({title,children,eyebrow='WORKSPACE',subtitle})=><div className="page-header"><div><p className="page-eyebrow">{eyebrow}</p><h1 className="page-title">{title}</h1>{subtitle&&<p className="page-subtitle">{subtitle}</p>}</div>{children&&<div className="page-actions">{children}</div>}</div>
