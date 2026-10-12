# InvoiceIQ Frontend
React + Vite + Tailwind v4 frontend for invoice extraction with human-in-the-loop review.

## Run
    npm install
    cp .env.example .env     # set VITE_API_MODE=live for the FastAPI backend
    npm run dev              # npm run build for production

## Modes
- `live` (default): FastAPI at `VITE_API_BASE_URL` (`http://127.0.0.1:8000`). No silent fallback to mock; errors are shown.
- `mock`: in-memory DEMO data; uploaded files are NOT analysed. Set `VITE_API_MODE=mock` to use it.

## Architecture (viva summary)
`pages/` = routes, `components/` = reusable UI, `services/invoiceApi.js` = the only place with endpoint paths
(Axios, multipart upload and export), `services/mappers.js` = backend/frontend field and status mapping,
`services/mockInvoiceApi.js` = demo service, `utils.js` = formatting, file validation, CSV/JSON export.
Review page keeps `saved` (server state) separate from `form` (unsaved edits); dirty = they differ.

## FastAPI contract
The live service uses `GET /health`, `GET /invoices`, `GET /invoices/{id}`,
`POST /invoices/upload` (multipart field `file`), `PATCH /invoices/{id}`, and
`POST /invoices/{id}/review` with `{ "status": "reviewed" }` (or another supported review status).
The upload response contains `invoice_id`, so the frontend fetches the invoice detail afterward.
Backend snake_case fields are mapped at the service boundary. Live editing only exposes fields
supported by the backend schema.

## Exports
The invoice list downloads all records through `GET /invoices/export/json` or
`GET /invoices/export/csv`. Review-page exports remain local to the current invoice so unsaved
corrections can be exported. Local CSV uses separate line tax amount and rate columns.

## Known limitations
No frontend automated tests, no delete, and no reprocess endpoint. The current backend does not
provide original-file retrieval, customer/address/tax-ID fields, payment terms, or line-item tax rates;
live mode therefore has no source-document preview and only edits supported backend fields.
