
import { Link } from 'react-router-dom'
import {
  ArrowDownUp,
  ArrowUpRight,
  FileText,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

import { StatusBadge, EmptyState } from './common'
import { money, fmtDate } from '../utils'

const initials = (name) =>
  (name || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

export default function InvoiceTable({ rows = [], sort, onSort }) {
  const columns = [
    { key: 'invoiceNumber', label: 'INVOICE' },
    { key: 'vendor', label: 'VENDOR' },
    { key: 'invoiceDate', label: 'INVOICE DATE' },
    { key: 'totalAmount', label: 'TOTAL AMOUNT' },
    { key: 'processingStatus', label: 'PROCESSING', sortable: false },
    { key: 'reviewStatus', label: 'REVIEW STATUS', sortable: false },
    { key: 'updatedAt', label: 'LAST UPDATED' },
  ]

  const renderHeader = ({ key, label, sortable = true }) => {
    const active = sort?.key === key

    return (
      <th key={key} scope="col">
        {onSort && sortable ? (
          <button
            type="button"
            className="sort-btn"
            onClick={() => onSort(key)}
            aria-label={`Sort by ${label.toLowerCase()}`}
            aria-sort={
              active
                ? sort.dir > 0
                  ? 'ascending'
                  : 'descending'
                : 'none'
            }
          >
            {label}

            {active ? (
              sort.dir > 0 ? (
                <ArrowUp size={13} />
              ) : (
                <ArrowDown size={13} />
              )
            ) : (
              <ArrowDownUp size={12} />
            )}
          </button>
        ) : (
          label
        )}
      </th>
    )
  }

  if (!rows.length) {
    return (
      <EmptyState
        title="No invoices to show"
        text="Try adjusting your filters or upload an invoice to get started."
      >
        <Link to="/upload" className="button button-primary mt-4">
          <FileText size={16} />
          Upload invoice
        </Link>
      </EmptyState>
    )
  }

  return (
    <div className="table-wrap">
      <table className="invoice-table">
        <thead>
          <tr>
            {columns.map(renderHeader)}
            <th scope="col" aria-label="Actions" />
          </tr>
        </thead>

        <tbody>
          {rows.map((invoice) => {
            const id = String(invoice.id ?? '')
            const reviewUrl = `/invoices/${encodeURIComponent(id)}/review`
            const sample = id.startsWith('demo-')

            return (
              <tr key={id}>
                <td className="invoice-id">
                  <Link
                    to={reviewUrl}
                    className="invoice-number-link"
                  >
                    {invoice.invoiceNumber || 'Draft invoice'}
                  </Link>

                  <div className="vendor-sub">
                    {sample
                      ? 'Sample record'
                      : `ID · ${id.slice(0, 12)}`}
                  </div>
                </td>

                <td>
                  <div className="vendor-cell">
                    <span className="vendor-avatar" aria-hidden="true">
                      {initials(invoice.vendor?.name)}
                    </span>

                    <span className="vendor-details">
                      <span className="vendor-name">
                        {invoice.vendor?.name || 'Vendor not identified'}
                      </span>

                      <span className="vendor-sub">
                        {invoice.vendor?.taxId || 'Vendor details'}
                      </span>
                    </span>
                  </div>
                </td>

                <td>{fmtDate(invoice.invoiceDate)}</td>

                <td className="invoice-id">
                  {money(invoice.totalAmount, invoice.currency)}
                </td>

                <td>
                  <StatusBadge value={invoice.processingStatus} />
                </td>

                <td>
                  <StatusBadge
                    kind="review"
                    value={invoice.reviewStatus}
                  />
                </td>

                <td>{fmtDate(invoice.updatedAt)}</td>

                <td>
                  <Link
                    className="table-action"
                    to={reviewUrl}
                    aria-label={`Review ${invoice.invoiceNumber || 'invoice'}`}
                    title="Open invoice review"
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

}
