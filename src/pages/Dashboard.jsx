
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Settings2,
  Server,
  ShieldCheck,
  Gauge,
  ExternalLink,
  Info,
  CheckCircle2,
  FileText,
  Sun,
  Moon,
  UserRound,
  Bell,
  RotateCcw,
  Save,
  SlidersHorizontal,
} from 'lucide-react'

import { config } from '../config'

const readJSON = (key, fallback) => {
  try {
    const value = localStorage.getItem(key)
    return value ? { ...fallback, ...JSON.parse(value) } : fallback
  } catch {
    return fallback
  }
}

function SettingRow({ label, value, status }) {
  return (
    <div className="settings-row">
      <span>{label}</span>
      <b>
        {status && (
          <i
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              status === 'live' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
        )}
        {value || 'Not configured'}
      </b>
    </div>
  )
}

function PreferenceToggle({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <label className="preference-row">
      <span className="preference-icon">
        <Icon size={19} />
      </span>

      <span className="preference-copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <input
        type="checkbox"
        className="preference-checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  )
}

export default function SettingsPage() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('invoiceiq-theme') || 'light',
  )

  const [profile, setProfile] = useState(() =>
    readJSON('invoiceiq-profile', { name: '', email: '' }),
  )

  const [preferences, setPreferences] = useState(() =>
    readJSON('invoiceiq-preferences', {
      notifications: true,
      reviewAlerts: true,
      compactTables: false,
    }),
  )

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('invoiceiq-theme', theme)

    window.dispatchEvent(
      new CustomEvent('invoiceiq-theme-change', { detail: theme }),
    )
  }, [theme])

  const saveSettings = () => {
    localStorage.setItem('invoiceiq-profile', JSON.stringify(profile))
    localStorage.setItem(
      'invoiceiq-preferences',
      JSON.stringify(preferences),
    )

    window.dispatchEvent(
      new CustomEvent('invoiceiq-profile-change', { detail: profile }),
    )

    window.dispatchEvent(
      new CustomEvent('invoiceiq-preferences-change', {
        detail: preferences,
      }),
    )

    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  const resetPreferences = () => {
    const defaults = {
      notifications: true,
      reviewAlerts: true,
      compactTables: false,
    }

    setPreferences(defaults)
    setProfile({ name: '', email: '' })

    localStorage.setItem(
      'invoiceiq-preferences',
      JSON.stringify(defaults),
    )
    localStorage.removeItem('invoiceiq-profile')
    setSaved(false)
  }

  const isMock = config.mode === 'mock'

  return (
    <main className="page-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">PREFERENCES &amp; CONFIGURATION</p>
          <h1>Settings</h1>
          <p className="page-description">
            Personalize your workspace and review your application
            configuration.
          </p>
        </div>

        <button
          type="button"
          className="button-primary"
          onClick={saveSettings}
        >
          <Save size={16} />
          {saved ? 'Settings saved' : 'Save changes'}
        </button>
      </div>

      {saved && (
        <div className="inline-success" role="status">
          <CheckCircle2 size={17} />
          Your preferences have been saved on this device.
        </div>
      )}

      <div className="settings-grid">
        <div className="settings-main-column">
          <section className="panel settings-card">
            <div className="panel-header">
              <div>
                <h2><UserRound size={18} /> Profile</h2>
                <p className="muted-text">
                  Personalize how you appear in the workspace.
                </p>
              </div>
            </div>

            <div className="settings-form-grid">
              <label className="review-field">
                <span className="field-label">Display name</span>
                <input
                  className="inp"
                  value={profile.name || ''}
                  placeholder="Your name"
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="review-field">
                <span className="field-label">Email address</span>
                <input
                  className="inp"
                  type="email"
                  value={profile.email || ''}
                  placeholder="you@company.com"
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <p className="settings-help">
              These details are stored locally in your browser. They do not
              change your authentication account.
            </p>
          </section>

          <section className="panel settings-card">
            <div className="panel-header">
              <div>
                <h2><SlidersHorizontal size={18} /> Appearance</h2>
                <p className="muted-text">
                  Choose the theme you prefer for InvoiceIQ.
                </p>
              </div>
            </div>

            <div className="theme-options">
              <button
                type="button"
                className={`theme-option ${
                  theme === 'light' ? 'theme-option-active' : ''
                }`}
                onClick={() => setTheme('light')}
              >
                <span className="theme-preview theme-preview-light">
                  <Sun size={23} />
                </span>
                <span>
                  <strong>Light mode</strong>
                  <small>Bright and clean</small>
                </span>
                {theme === 'light' && <CheckCircle2 size={18} />}
              </button>

              <button
                type="button"
                className={`theme-option ${
                  theme === 'dark' ? 'theme-option-active' : ''
                }`}
                onClick={() => setTheme('dark')}
              >
                <span className="theme-preview theme-preview-dark">
                  <Moon size={23} />
                </span>
                <span>
                  <strong>Dark mode</strong>
                  <small>Comfortable in low light</small>
                </span>
                {theme === 'dark' && <CheckCircle2 size={18} />}
              </button>
            </div>
          </section>

          <section className="panel settings-card">
            <div className="panel-header">
              <div>
                <h2><Bell size={18} /> Workspace preferences</h2>
                <p className="muted-text">
                  Manage notification preferences and table density.
                </p>
              </div>
            </div>

            <div className="preferences-list">
              <PreferenceToggle
                icon={Bell}
                title="Notifications"
                description="Enable workspace notification preferences."
                checked={preferences.notifications}
                onChange={(value) =>
                  setPreferences((current) => ({
                    ...current,
                    notifications: value,
                  }))
                }
              />

              <PreferenceToggle
                icon={ShieldCheck}
                title="Review alerts"
                description="Highlight invoices requiring attention."
                checked={preferences.reviewAlerts}
                onChange={(value) =>
                  setPreferences((current) => ({
                    ...current,
                    reviewAlerts: value,
                  }))
                }
              />

              <PreferenceToggle
                icon={FileText}
                title="Compact tables"
                description="Prefer denser table rows where supported."
                checked={preferences.compactTables}
                onChange={(value) =>
                  setPreferences((current) => ({
                    ...current,
                    compactTables: value,
                  }))
                }
              />
            </div>
          </section>

          <section className="panel settings-card">
            <div className="panel-header">
              <div>
                <h2><Settings2 size={18} /> Application configuration</h2>
                <p className="muted-text">
                  Current values loaded by the frontend at startup.
                </p>
              </div>
            </div>

            <SettingRow
              label="Application version"
              value="0.1.0 · Frontend"
            />

            <SettingRow
              label="API mode"
              value={isMock ? 'Local data service' : 'Live FastAPI backend'}
              status={config.mode}
            />

            <SettingRow
              label="Backend base URL"
              value={config.baseUrl}
            />

            <SettingRow
              label="Maximum upload size"
              value={`${config.maxMB} MB`}
            />

            <SettingRow
              label="High confidence threshold"
              value={`≥ ${config.high}%`}
            />

            <SettingRow
              label="Moderate confidence threshold"
              value={`≥ ${config.mid}%`}
            />

            <div className="inline-alert settings-notice">
              <Info size={17} />
              <span>
                Confidence thresholds affect the UI labels only. They do not
                guarantee extraction accuracy.
              </span>
            </div>
          </section>
        </div>

        <aside className="settings-side-column">
          <section className="settings-hero">
            <span className="settings-hero-icon">
              <ShieldCheck size={24} />
            </span>
            <h2>Your workflow. Your control.</h2>
            <p>
              Verify extracted invoice information before using it in
              downstream finance processes.
            </p>
          </section>

          <section className="panel settings-card">
            <div className="panel-header">
              <div>
                <h2><Server size={18} /> Connection status</h2>
                <p className="muted-text">
                  Configured invoice data source.
                </p>
              </div>
            </div>

            <div className="connection-card">
              <span
                className={`connection-icon ${
                  isMock ? 'connection-local' : 'connection-live'
                }`}
              >
                <Gauge size={20} />
              </span>

              <div className="connection-copy">
                <strong>
                  {isMock ? 'Local data service' : 'Backend configured'}
                </strong>
                <small>
                  {isMock
                    ? 'Using the configured local data service.'
                    : config.baseUrl}
                </small>
              </div>

              <span
                className={`status-badge ${
                  isMock ? 'badge-warning' : 'badge-success'
                }`}
              >
                {isMock ? 'LOCAL' : 'LIVE'}
              </span>
            </div>
          </section>

          <section className="panel settings-card">
            <div className="panel-header">
              <div>
                <h2><ExternalLink size={18} /> Quick access</h2>
                <p className="muted-text">
                  Continue your invoice workflow.
                </p>
              </div>
            </div>

            <div className="settings-shortcuts">
              <Link to="/invoices" className="button-secondary">
                Invoice register <ExternalLink size={15} />
              </Link>

              <Link to="/upload" className="button-secondary">
                Upload documents <ExternalLink size={15} />
              </Link>
            </div>
          </section>

          <section className="panel settings-card">
            <div className="panel-header">
              <div>
                <h2><RotateCcw size={18} /> Reset preferences</h2>
                <p className="muted-text">
                  Restore default local preferences.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="button-secondary reset-button"
              onClick={resetPreferences}
            >
              <RotateCcw size={15} />
              Reset local preferences
            </button>

            <p className="settings-help">
              This resets the saved display name, email, and workspace
              preferences. It does not delete invoice records or modify your
              backend configuration.
            </p>
          </section>

          <p className="settings-security-note">
            <CheckCircle2 size={15} />
            API secrets should never be stored in frontend environment
            variables.
          </p>
        </aside>
      </div>
    </main>
  )
}
