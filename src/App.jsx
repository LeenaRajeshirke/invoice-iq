import { useState } from 'react'
import { NavLink, Navigate, Route, Routes, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Upload, Settings, Menu, X, Search, Bell, Sparkles, ChevronRight, Command } from 'lucide-react'
import { config } from './config'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import UploadPage from './pages/UploadPage'
import Review from './pages/Review'
import SettingsPage from './pages/SettingsPage'

const nav = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/upload', label: 'Upload documents', icon: Upload },
]
const secondary = [{ to: '/settings', label: 'Settings', icon: Settings }]
const pageNames = { '/dashboard': 'Overview', '/invoices': 'Invoices', '/upload': 'Upload documents', '/settings': 'Settings' }

export default function App() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const title = location.pathname.includes('/review') ? 'Invoice review' : pageNames[location.pathname] || 'InvoiceIQ'
  return <div className="app-shell">
    {open && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <Link to="/dashboard" className="brand" onClick={() => setOpen(false)}>
        <span className="brand-mark"><FileText size={21} strokeWidth={2.3} /></span>
        <span className="brand-name">invoice<span>iq</span><small>INTELLIGENT FINANCE</small></span>
      </Link>
      <div className="workspace-switcher"><span className="workspace-avatar">F</span><span className="workspace-copy"><b>Finance workspace</b><small>Free workspace</small></span><ChevronRight size={15} className="workspace-chevron" /></div>
      <p className="nav-caption">WORKSPACE</p>
      <nav className="side-nav" aria-label="Main navigation">{nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} strokeWidth={1.9} /><span>{label}</span>{to === '/invoices' && <span className="nav-arrow">↗</span>}</NavLink>)}</nav>
      <div className="sidebar-promo"><span className="promo-icon"><Sparkles size={17} /></span><b>Invoice intelligence</b><p>Turn documents into organized, review-ready data.</p><Link to="/upload" onClick={() => setOpen(false)}>Try an upload <ChevronRight size={14} /></Link></div>
      <div className="sidebar-bottom"><p className="nav-caption">PREFERENCES</p>{secondary.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{label}</span></NavLink>)}
        <div className="profile-row"><span className="profile-avatar">L</span><span className="profile-copy"><b>Finance team</b><small>Workspace member</small></span><span className="online-dot" /></div>
      </div>
    </aside>
    <div className="main-area">
      <header className="topbar">
        <button className="icon-button mobile-menu" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <X size={19} /> : <Menu size={19} />}</button>
        <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><b>{title}</b></div>
        <div className="topbar-actions"><div className="search-hint"><Search size={15} /><span>Quick search</span><kbd><Command size={11} /> K</kbd></div><span className={`mode-pill ${config.mode === 'mock' ? 'demo' : 'live'}`}><i />{config.mode === 'mock' ? 'Demo environment' : 'Live connection'}</span><button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button></div>
      </header>
      <main className="page-content"><Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/invoices/:id/review" element={<Review />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes><footer className="app-footer"><span>© 2026 InvoiceIQ</span><span>Built for accuracy, designed for people.</span></footer></main>
    </div>
  </div>
}
