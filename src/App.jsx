import { useState } from 'react'
import { NavLink, Navigate, Route, Routes, Link } from 'react-router-dom'
import { Activity, FileText, LayoutDashboard, Menu, Settings2, UploadCloud, X } from 'lucide-react'
import { config } from './config'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import UploadPage from './pages/UploadPage'
import Review from './pages/Review'
import SettingsPage from './pages/SettingsPage'
const nav=[['/dashboard','Dashboard',LayoutDashboard],['/invoices','Invoices',FileText],['/upload','Upload invoice',UploadCloud],['/settings','Settings',Settings2]]
export default function App(){
  const [open,setOpen]=useState(false)
  return <div className="app-shell min-h-screen md:flex">
    {open&&<button className="nav-scrim md:hidden" aria-label="Close navigation" onClick={()=>setOpen(false)}/>}
    <aside className={`${open?'flex':'hidden'} app-sidebar md:flex fixed md:sticky top-0 z-50 md:z-30 h-screen w-[17rem] shrink-0 flex-col px-4 py-5`}>
      <div className="flex items-center justify-between px-2 mb-9">
        <Link to="/dashboard" onClick={()=>setOpen(false)} className="brand-lockup">
          <span className="brand-mark">IQ</span>
          <span className="brand-name">Invoice<span>IQ</span><small className="brand-caption">DOCUMENT INTELLIGENCE</small></span>
        </Link>
        <button className="icon-button md:hidden" aria-label="Close navigation" onClick={()=>setOpen(false)}><X size={18}/></button>
      </div>
      <p className="sidebar-label px-3 mb-2">Workspace</p>
      <nav aria-label="Main" className="space-y-1">{nav.map(([to,label,Icon])=><NavLink key={to} to={to} onClick={()=>setOpen(false)} className={({isActive})=>`side-link ${isActive?'side-link-active':''}`}><Icon size={17} strokeWidth={1.8}/>{label}</NavLink>)}</nav>
      <div className="sidebar-bottom mt-auto">
        <div className="sidebar-health"><span className={`health-dot ${config.mode==='live'?'health-dot-live':'health-dot-demo'}`}/><span><b>{config.mode==='live'?'Live API mode':'Demo workspace'}</b><small className="sidebar-detail">{config.mode==='live'?config.baseUrl:'Sample data only'}</small></span></div>
        <div className="sidebar-foot"><Activity size={14}/> InvoiceIQ <span className="ml-auto">v0.1.0</span></div>
      </div>
    </aside>
    <div className="app-main-column flex-1 min-w-0">
      <header className="topbar h-16 flex items-center gap-3 sticky top-0 z-30 px-4 sm:px-7">
        <button className="icon-button md:hidden" aria-label="Toggle navigation" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X size={18}/>:<Menu size={18}/>}</button>
        <div className="min-w-0"><p className="topbar-kicker">INVOICEIQ <span>/</span> WORKSPACE</p><p className="topbar-title">Document operations</p></div>
        <span className={`mode-pill ml-auto ${config.mode==='mock'?'mode-pill-demo':'mode-pill-live'}`}><span className="health-dot"/>{config.mode==='mock'?'Demo mode':'Live API mode'}</span>
      </header>
      <main className="app-main px-4 py-6 sm:px-7 sm:py-8">
        <div className="page-width mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/><Route path="/invoices" element={<Invoices/>}/>
          <Route path="/upload" element={<UploadPage/>}/><Route path="/invoices/:id/review" element={<Review/>}/>
          <Route path="/settings" element={<SettingsPage/>}/><Route path="*" element={<Navigate to="/dashboard" replace/>}/>
        </Routes>
        </div>
      </main>
    </div>
  </div>
}
