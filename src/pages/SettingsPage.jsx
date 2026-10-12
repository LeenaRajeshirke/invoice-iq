import { config } from '../config'
import { PageHeader } from '../components/common'
import { Activity, FileCheck2, Gauge, Server } from 'lucide-react'
const Row=({label,value,note})=><div className="setting-row"><div><p className="m-0 text-slate-500">{label}</p>{note&&<p className="m-0 mt-1 text-[10px] text-slate-400">{note}</p>}</div><span className="setting-value">{value}</span></div>
export default function SettingsPage(){
  return <>
    <PageHeader eyebrow="PREFERENCES" title="Settings" subtitle="Runtime configuration for this InvoiceIQ workspace."/>
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="panel"><div className="panel-heading"><div className="flex items-center gap-3"><span className="kpi-icon"><Server size={16}/></span><div><h2 className="panel-title">API connection</h2><p className="panel-note">Configured frontend service target</p></div></div><span className={`status-badge ${config.mode==='live'?'badge-green':'badge-amber'}`}>{config.mode==='live'?'Live':'Demo'}</span></div>
        <Row label="API mode" value={config.mode==='live'?'Live FastAPI':'Mock data'} note="Selected with VITE_API_MODE"/>
        <Row label="Backend base URL" value={config.baseUrl} note="Configured with VITE_API_BASE_URL"/>
        <Row label="Application" value="InvoiceIQ · 0.1.0"/>
      </section>
      <section className="panel"><div className="panel-heading"><div className="flex items-center gap-3"><span className="kpi-icon"><FileCheck2 size={16}/></span><div><h2 className="panel-title">Document intake</h2><p className="panel-note">Frontend upload constraints</p></div></div></div>
        <Row label="Maximum file size" value={`${config.maxMB} MB`} note="Configured with VITE_MAX_UPLOAD_MB"/>
        <Row label="Accepted formats" value="PDF · PNG · JPG · JPEG"/>
        <Row label="Validation" value="Client checks + backend verification"/>
      </section>
      <section className="panel"><div className="panel-heading"><div className="flex items-center gap-3"><span className="kpi-icon"><Gauge size={16}/></span><div><h2 className="panel-title">Confidence display</h2><p className="panel-note">Presentation thresholds only</p></div></div></div>
        <Row label="High" value={`${config.high}% and above`}/>
        <Row label="Moderate" value={`${config.mid}% to ${config.high-1}%`}/>
        <Row label="Low" value={`Below ${config.mid}%`}/>
        <Row label="Backend values" value="Shown only when supplied" note="These thresholds do not change extraction or model confidence."/>
      </section>
      <section className="panel"><div className="panel-heading"><div className="flex items-center gap-3"><span className="kpi-icon"><Activity size={16}/></span><div><h2 className="panel-title">Environment</h2><p className="panel-note">Values are injected by Vite at startup/build time.</p></div></div></div>
        <p className="m-0 text-xs leading-6 text-slate-600">Update <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">.env</code> values and restart the development server to apply changes. Never place private API keys or secrets in frontend environment variables.</p>
      </section>
    </div>
  </>
}
