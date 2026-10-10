import { useState } from 'react'
import { NavLink, Navigate, Route, Routes, Link } from 'react-router-dom'
import { LayoutDashboard, FileText, Upload, Settings, Menu, X } from 'lucide-react'
import { config } from './config'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import UploadPage from './pages/UploadPage'
import Review from './pages/Review'
import SettingsPage from './pages/SettingsPage'
const nav=[['/dashboard','Dashboard',LayoutDashboard],['/invoices','Invoices',FileText],['/upload','Upload',Upload],['/settings','Settings',Settings]]
export default function App(){
  const [open,setOpen]=useState(false)
  return <div className="min-h-screen md:flex">
    <aside className={`${open?'block':'hidden'} md:block fixed md:sticky top-0 z-40 h-screen w-60 shrink-0 bg-slate-900 text-slate-200 p-4`}>
      <Link to="/dashboard" className="text-lg font-bold text-white block mb-6">Invoice<span className="text-indigo-400">IQ</span></Link>
      <nav aria-label="Main" className="space-y-1">{nav.map(([to,l,I])=><NavLink key={to} to={to} onClick={()=>setOpen(false)} className={({isActive})=>`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${isActive?'bg-indigo-600 text-white':'hover:bg-slate-800'}`}><I size={16}/>{l}</NavLink>)}</nav>
    </aside>
    <div className="flex-1 min-w-0">
      <header className="bg-white border-b px-4 h-14 flex items-center gap-3 sticky top-0 z-30">
        <button className="md:hidden btn" aria-label="Toggle navigation" onClick={()=>setOpen(!open)}>{open?<X size={16}/>:<Menu size={16}/>}</button>
        <span className="text-sm text-slate-500 hidden sm:inline">Layout-Aware Invoice Extraction with Human-in-the-Loop Validation</span>
        <span className={`ml-auto text-xs px-2 py-1 rounded-full ${config.mode==='mock'?'bg-amber-100 text-amber-800':'bg-green-100 text-green-800'}`}>{config.mode==='mock'?'DEMO MODE · sample data':'LIVE · '+config.baseUrl}</span>
      </header>
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/><Route path="/invoices" element={<Invoices/>}/>
          <Route path="/upload" element={<UploadPage/>}/><Route path="/invoices/:id/review" element={<Review/>}/>
          <Route path="/settings" element={<SettingsPage/>}/><Route path="*" element={<Navigate to="/dashboard" replace/>}/>
        </Routes>
      </main>
    </div>
  </div>
}
