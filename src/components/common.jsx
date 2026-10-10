import { Loader2, AlertCircle, Inbox, AlertTriangle, Info } from 'lucide-react'
import { PROCESSING, REVIEW } from '../services/mappers'
import { confPct, confLevel } from '../utils'
export const Spinner=({label='Loading…'})=><div role="status" className="flex items-center gap-2 p-8 text-slate-500"><Loader2 className="animate-spin" size={18}/>{label}</div>
export const ErrorState=({message,onRetry})=><div role="alert" className="card border-red-200 bg-red-50 flex items-start gap-3"><AlertCircle className="text-red-600 shrink-0" size={20}/><div><p className="font-medium text-red-800">Something went wrong</p><p className="text-sm text-red-700">{message}</p>{onRetry&&<button className="btn mt-2" onClick={onRetry}>Try again</button>}</div></div>
export const EmptyState=({title,text,children})=><div className="card text-center py-10"><Inbox className="mx-auto text-slate-400" size={32}/><p className="mt-2 font-medium">{title}</p><p className="text-sm text-slate-500">{text}</p><div className="mt-3">{children}</div></div>
const tone={green:'bg-green-100 text-green-800',amber:'bg-amber-100 text-amber-800',red:'bg-red-100 text-red-800',blue:'bg-indigo-100 text-indigo-800',grey:'bg-slate-100 text-slate-700'}
const pc={uploaded:'grey',processing:'blue',completed:'green',failed:'red'},rc={pending:'grey',needs_review:'amber',reviewed:'green',rejected:'red'}
export const StatusBadge=({kind,value})=><span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${tone[(kind==='review'?rc:pc)[value]]}`}>{(kind==='review'?REVIEW:PROCESSING)[value]}</span>
export function ConfidenceBadge({value}){
  const p=confPct(value),l=confLevel(p)
  if(p==null)return <span className="text-xs text-slate-400">Confidence: Not available</span>
  const m={high:['High confidence','green'],mid:['Moderate confidence','amber'],low:['Low confidence','red']}[l]
  return <span title="Model-reported confidence; thresholds are display settings only." className={`text-xs px-2 py-0.5 rounded-full ${tone[m[1]]}`}>{m[0]} · {p}%</span>
}
export const Warning=({w})=>{const I=w.severity==='info'?Info:AlertTriangle;return <li className={`flex gap-2 text-sm p-2 rounded border ${w.severity==='error'?'bg-red-50 border-red-200':w.severity==='info'?'bg-indigo-50 border-indigo-200':'bg-amber-50 border-amber-200'}`}><I size={16} className="shrink-0 mt-0.5"/><span><b className="capitalize">{w.severity||'warning'}</b>: {w.message}{w.field&&<em className="text-slate-500"> (field: {w.field})</em>}</span></li>}
export function ConfirmDialog({open,title,text,onYes,onNo}){
  if(!open)return null
  return <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"><div className="card max-w-sm w-full"><h2 className="font-semibold">{title}</h2><p className="text-sm text-slate-600 mt-1">{text}</p><div className="flex justify-end gap-2 mt-4"><button autoFocus className="btn" onClick={onNo}>Cancel</button><button className="btn btn-p" onClick={onYes}>Confirm</button></div></div></div>
}
export const PageHeader=({title,children})=><div className="flex flex-wrap items-center justify-between gap-2 mb-4"><h1 className="text-xl font-semibold">{title}</h1><div className="flex gap-2">{children}</div></div>
