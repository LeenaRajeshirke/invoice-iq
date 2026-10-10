import { config } from '../config'
import { PageHeader } from '../components/common'
const Row=({k,v})=><div className="flex justify-between gap-4 py-2 border-b text-sm"><span className="text-slate-500">{k}</span><span className="font-medium break-all text-right">{v}</span></div>
export default function SettingsPage(){
  return <><PageHeader title="Settings"/>
    <div className="card max-w-2xl"><Row k="API mode" v={config.mode==='mock'?'mock (demo data)':'live (FastAPI)'}/><Row k="Backend base URL" v={config.baseUrl}/><Row k="Max upload size" v={`${config.maxMB} MB`}/>
    <Row k="Confidence thresholds" v={`High ≥ ${config.high}%, Moderate ≥ ${config.mid}%, Low below`}/><Row k="App" v="InvoiceIQ frontend v0.1.0"/>
    <p className="text-sm text-slate-600 mt-3">These values are read from <code>.env</code> (<code>VITE_API_MODE</code>, <code>VITE_API_BASE_URL</code>, <code>VITE_MAX_UPLOAD_MB</code>) at build/start time and require restarting the dev server to change. Never put private API keys in frontend variables. Thresholds are display settings, not model accuracy claims.</p></div></>
}
