
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Upload,
  FileText,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowUpDown,
  Download,
  Filter,
} from 'lucide-react'

import { useInvoices } from '../hooks'
import { money, fmtDate, download } from '../utils'

const statusConfig = {
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    className: 'badge-success',
  },
  reviewed: {
    label: 'Reviewed',
    icon: CheckCircle2,
    className: 'badge-success',
  },
  pending: {
    label: 'Pending review',
    icon: Clock3,
    className: 'badge-warning',
  },
  needs_review: {
    label: 'Needs review',
    icon: AlertTriangle,
    className: 'badge-warning',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'badge-danger',
  },
}

function normalizeStatus(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

function getStatus(invoice) {
  const review = normalizeStatus(invoice.reviewStatus)
  const processing = normalizeStatus(invoice.processingStatus)

  if (['approved', 'rejected', 'reviewed'].includes(review)) {
    return review
  }

  if (processing === 'failed' || processing === 'error') {
    return 'needs_review'
  }

  if (review === 'needs_review') {
    return 'needs_review'
  }

  if (review === 'pending' || !review) {
    return 'pending'
  }

  if (processing === 'processing' || processing === 'uploaded') {
    return 'pending'
  }

  return 'pending'
}

const csvEscape = (value) => {
  const text = value == null ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

export default function Invoices() {
  const {
    invoices: loadedInvoices,
    loading,
    error,
    reload,
  } = useInvoices()

  const allInvoices = loadedInvoices || []

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')

  const invoices = useMemo(() => {
    const query = search.trim().toLowerCase()

    return [...allInvoices]
      .filter((invoice) => {
        const matchesSearch =
          !query ||
          String(invoice.invoiceNumber || '').toLowerCase().includes(query) ||
          String(invoice.vendor?.name || invoice.vendorName || '')
            .toLowerCase()
            .includes(query) ||
          String(invoice.customer?.name || '')
            .toLowerCase()
            .includes(query)

        const matchesStatus =
          statusFilter === 'all' || getStatus(invoice) === statusFilter

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.updatedAt || a.createdAt || a.invoiceDate || 0,
        ).getTime()

        const dateB = new Date(
          b.updatedAt || b.createdAt || b.invoiceDate || 0,
        ).getTime()

        const safeA = Number.isFinite(dateA) ? dateA : 0
        const safeB = Number.isFinite(dateB) ? dateB : 0

        return sortOrder === 'newest' ? safeB - safeA : safeA - safeB
      })
  }, [allInvoices, search, statusFilter, sortOrder])

  const needsReview = allInvoices.filter((invoice) =>
    ['pending', 'needs_review'].includes(getStatus(invoice)),
  ).length

  const approvedCount = allInvoices.filter((invoice) =>
    ['approved', 'reviewed'].includes(getStatus(invoice)),
  ).length

  const handleExport = () => {
    if (!invoices.length) return

    const headers = [
      'Invoice Number',
      'Vendor',
      'Date',
      'Amount',
      'Currency',
      'Status',
    ]

    const rows = invoices.map((invoice) => [
      invoice.invoiceNumber || '',
      invoice.vendor?.name || invoice.vendorName || '',
      invoice.invoiceDate || '',
      invoice.totalAmount ?? '',
      invoice.currency || 'INR',
      statusConfig[getStatus(invoice)]?.label || 'Pending review',
    ])

    const csv =
      '\uFEFF' +
      [headers, ...rows]
        .map((row) => row.map(csvEscape).join(','))
        .join('\r\n')

    download(
      'invoiceiq-invoices.csv',
      csv,
      'text/csv;charset=utf-8;',
    )
  }

  return (
    <main className="page-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">FINANCE WORKSPACE</p>
          <h1>Invoices</h1>
          <p className="page-description">
            Manage, search, and review your invoice records.
          </p>
        </div>

        <div className="heading-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={handleExport}
            disabled={invoices.length === 0}
          >
            <Download size={16} />
            Export CSV
          </button>

          <Link to="/upload" className="button-primary">
            <Upload size={16} />
            Upload invoice
          </Link>
        </div>
      </div>

      <div className="stats-grid invoices-summary">
        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={19} />
          </div>
          <span className="stat-label">Total invoices</span>
          <strong className="stat-value">{allInvoices.length}</strong>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock3 size={19} />
          </div>
          <span className="stat-label">Awaiting attention</span>
          <strong className="stat-value">{needsReview}</strong>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle2 size={19} />
          </div>
          <span className="stat-label">Reviewed or approved</span>
          <strong className="stat-value">{approvedCount}</strong>
        </div>
      </div>

      <section className="panel invoices-panel">
        <div className="panel-header">
          <div>
            <h2>All invoices</h2>
            <p className="muted-text">
              Showing {invoices.length} of {allInvoices.length} invoices
            </p>
          </div>

          <button
            type="button"
            className="icon-button"
            title="Refresh invoices"
            aria-label="Refresh invoices"
            onClick={reload}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={loading ? 'animate-spin' : ''}
            />
          </button>
        </div>

        <div className="invoice-toolbar">
          <div className="search-field invoice-search">
            <Search size={17} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoice or vendor..."
              aria-label="Search invoices"
            />
          </div>

          <div className="filter-control">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter invoices by status"
            >
              <option value="all">All statuses</option>
              <option value="approved">Approved</option>
              <option value="reviewed">Reviewed</option>
              <option value="pending">Pending review</option>
              <option value="needs_review">Needs review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <button
            type="button"
            className="button-secondary sort-button"
            onClick={() =>
              setSortOrder((current) =>
                current === 'newest' ? 'oldest' : 'newest',
              )
            }
          >
            <ArrowUpDown size={16} />
            {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
          </button>
        </div>

        {error && (
          <div className="inline-alert" role="alert">
            <AlertTriangle size={17} />
            <span>{error}</span>
            <button
              type="button"
              className="button-secondary"
              onClick={reload}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        {loading && allInvoices.length === 0 ? (
          <div className="empty-state" role="status">
            <RefreshCw size={25} className="loading-icon animate-spin" />
            <h3>Loading invoices</h3>
            <p>Please wait while your invoice records load.</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={25} />
            </div>

            <h3>
              {search || statusFilter !== 'all'
                ? 'No matching invoices'
                : 'No invoices yet'}
            </h3>

            <p>
              {search || statusFilter !== 'all'
                ? 'Try changing your search or status filter.'
                : 'Upload an invoice to start managing your records here.'}
            </p>

            {search || statusFilter !== 'all' ? (
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                }}
              >
                Clear filters
              </button>
            ) : (
              <Link to="/upload" className="button-primary">
                <Upload size={16} />
                Upload your first invoice
              </Link>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Vendor</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="align-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {invoices.map((invoice) => {
                  const status = getStatus(invoice)
                  const config = statusConfig[status] || statusConfig.pending
                  const StatusIcon = config.icon
                  const invoiceId = encodeURIComponent(String(invoice.id))

                  return (
                    <tr key={invoice.id || invoice.invoiceNumber}>
                      <td>
                        <div className="invoice-primary">
                          <span className="invoice-file-icon">
                            <FileText size={17} />
                          </span>
                          <div>
                            <strong>
                              {invoice.invoiceNumber || 'Untitled invoice'}
                            </strong>
                            <span className="table-subtext">
                              {invoice.customer?.name || 'Invoice record'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {invoice.vendor?.name ||
                          invoice.vendorName ||
                          'Unknown vendor'}
                      </td>

                      <td>{fmtDate(invoice.invoiceDate)}</td>

                      <td className="amount-cell">
                        {invoice.totalAmount != null
                          ? money(
                              invoice.totalAmount,
                              invoice.currency || 'INR',
                            )
                          : '—'}
                      </td>

                      <td>
                        <span className={`status-badge ${config.className}`}>
                          <StatusIcon size={14} />
                          {config.label}
                        </span>
                      </td>

                      <td className="align-right">
                        <Link
                          to={`/invoices/${invoiceId}/review`}
                          className="table-action"
                          aria-label={`Review invoice ${
                            invoice.invoiceNumber || ''
                          }`}
                        >
                          <Eye size={16} />
                          Review
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
