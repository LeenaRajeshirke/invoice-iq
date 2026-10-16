
import {
  LoaderCircle,
  AlertCircle,
  Inbox,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react'

import { PROCESSING, REVIEW } from '../services/mappers'
import { confPct, confLevel } from '../utils'

export function Spinner({ label = 'Loading your workspace…' }) {
  return (
    <div role="status" aria-live="polite" className="loading-state">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <section role="alert" className="error-state">
      <div className="flex items-start gap-3">
        <span className="error-state-icon">
          <AlertCircle size={20} />
        </span>

        <div className="min-w-0 flex-1">
          <h2>We couldn’t load this information</h2>
          <p>{message || 'Something went wrong. Please try again.'}</p>

          {onRetry && (
            <button
              type="button"
              className="button-secondary mt-3"
              onClick={onRetry}
            >
              <RefreshCw size={15} />
              Try again
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export function EmptyState({ title, text, children }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Inbox size={27} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  )
}

const reviewTone = {
  pending: 'warning',
  needs_review: 'warning',
  reviewed: 'success',
  approved: 'success',
  rejected: 'danger',
}

const processingTone = {
  uploaded: 'neutral',
  processing: 'neutral',
  completed: 'success',
  failed: 'danger',
}

export function StatusBadge({ kind, value }) {
  const isReview = kind === 'review'
  const labels = isReview ? REVIEW : PROCESSING
  const toneMap = isReview ? reviewTone : processingTone
  const tone = toneMap[value] || 'neutral'
  const label = labels[value] || String(value || 'Unknown')

  return (
    <span className={`status-badge status-${tone}`}>
      <span className="status-dot" aria-hidden="true" />
      {label}
    </span>
  )
}

export function ConfidenceBadge({ value }) {
  const percentage = confPct(value)

  if (percentage == null) {
    return (
      <span className="confidence-badge confidence-unknown">
        Not available
      </span>
    )
  }

  const level = confLevel(percentage)
  const label =
    level === 'high' ? 'High' : level === 'mid' ? 'Moderate' : 'Low'

  const tone =
    level === 'high' ? 'success' : level === 'mid' ? 'warning' : 'danger'

  return (
    <span
      title="Model-reported confidence. This is not a guarantee of accuracy."
      className={`confidence-badge confidence-${tone}`}
    >
      {label} · {percentage}%
    </span>
  )
}

export function Warning({ w }) {
  const severity = w?.severity || 'warning'

  const Icon =
    severity === 'info'
      ? Info
      : severity === 'error'
        ? AlertCircle
        : AlertTriangle

  const tone =
    severity === 'info'
      ? 'info'
      : severity === 'error'
        ? 'error'
        : ''

  return (
    <li className={`warning-item ${tone}`}>
      <Icon size={16} className="shrink-0 mt-0.5" />
      <span>
        <strong className="capitalize">{severity}:</strong>{' '}
        {w?.message || 'This field requires attention.'}
        {w?.field && <span className="muted"> (field: {w.field})</span>}
      </span>
    </li>
  )
}

export function ConfirmDialog({
  open,
  title,
  text,
  onYes,
  onNo,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
}) {
  if (!open) return null

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onNo?.()
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="dialog-card"
        onKeyDown={(event) => {
          if (event.key === 'Escape') onNo?.()
        }}
      >
        <div className="dialog-heading">
          <span className={`dialog-icon ${danger ? 'dialog-icon-danger' : ''}`}>
            <AlertTriangle size={20} />
          </span>

          <button
            type="button"
            className="icon-button dialog-close"
            aria-label="Close dialog"
            onClick={onNo}
          >
            <X size={17} />
          </button>
        </div>

        <h2 id="confirm-dialog-title">{title}</h2>
        <p id="confirm-dialog-description">{text}</p>

        <div className="dialog-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={onNo}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className={danger ? 'button-danger' : 'button-primary'}
            onClick={onYes}
          >
            <CheckCircle2 size={16} />
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  eyebrow = 'INVOICEIQ WORKSPACE',
  children,
}) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {subtitle && <p className="page-description">{subtitle}</p>}
      </div>

      {children && <div className="heading-actions">{children}</div>}
    </div>
  )
}
