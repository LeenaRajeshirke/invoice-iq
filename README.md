# InvoiceIQ Frontend
React + Vite + Tailwind v4 frontend for invoice extraction with human-in-the-loop review.

## Run
    npm install
    cp .env.example .env     # set VITE_API_MODE=live for the FastAPI backend
    npm run dev              # npm run build for production

## Modes
- `mock` (default): in-memory DEMO data; uploaded files are NOT analysed.
- `live`: real FastAPI at `VITE_API_BASE_URL`. No silent fallback to mock; errors are shown.

## Architecture (viva summary)
`pages/` = routes, `components/` = reusable UI, `services/invoiceApi.js` = the only place with endpoint paths
(Axios, multipart upload), `services/mappers.js` = backend->frontend mapping and status names,
`services/mockInvoiceApi.js` = demo service, `utils.js` = formatting, file validation, CSV/JSON export.
Review page keeps `saved` (server state) separate from `form` (unsaved edits); dirty = they differ.

## Endpoints to confirm with backend
GET /health, GET /invoices, GET /invoices/{id}, POST /invoices/upload (field `file`),
PATCH /invoices/{id}, POST /invoices/{id}/review {status}.

## Exports
JSON = one invoice. CSV = one row per line item (invoice columns repeated), UTF-8 with BOM.

## Known limitations
No automated tests yet, no delete, no reprocess, PDF zoom uses the browser viewer, live-mode original
file preview needs an `originalFileUrl` from the backend.
