# InvoiceIQ on Replit

## Running
- Click Run to start the `Start application` workflow (`npm run dev`).
- Vite serves the existing React frontend on `0.0.0.0:5000`, with Replit preview hosts allowed.
- Dependencies use npm and the existing package-lock.json.
- Run `npm run build` to produce the production frontend in `dist/`.

## Demo and live modes
- Without environment overrides, the app runs in its original mock/demo mode. No secrets or backend are required.
- Demo uploads are not analysed. Demo data and edits are held in memory and reset when the page reloads.
- Real extraction requires a separate FastAPI backend, not included in this import. Set `VITE_API_MODE=live` and `VITE_API_BASE_URL` to its browser-accessible HTTPS address, and restart the workflow. The backend must allow the frontend origin through CORS.
- Never put secrets in `VITE_*` variables: these values are public frontend configuration.

Keep the imported project structure and stack unchanged unless a later request explicitly calls for changes.
