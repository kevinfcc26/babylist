# Technical Specification

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 18.3.x |
| Build tool | Vite | 6.x |
| Language | TypeScript | 5.6.x |
| Styling | Tailwind CSS | 4.x (via @tailwindcss/vite) |
| Routing | React Router | 6.28.x |
| Backend | Google Apps Script Web App | — |
| Database | Google Sheets | — |
| Hosting | GitHub Pages | — |
| CI/CD | GitHub Actions | — |

> **Note:** Firebase, Firestore, Cloud Functions, and nanoid were removed. The GAS Web App generates IDs server-side using `Utilities.getUuid()`.

---

## Architecture

```
Browser (React SPA — GitHub Pages)
  └── fetch() GET → Google Apps Script Web App
                      └── SpreadsheetApp
                            ├── Registry Spreadsheet  (maps codes → spreadsheet IDs)
                            └── List Spreadsheet(s)   (meta sheet + items sheet per list)
```

All requests from the browser go to a single GAS Web App URL. The GAS script runs under the deploying Google account and has full access to all spreadsheets it creates.

---

## Request Pattern

All API calls use **GET** requests to avoid the GAS POST→GET redirect bug. Parameters are encoded as:

- `action` — plain query param (e.g. `?action=createList`)
- `payload` — JSON-encoded string containing everything else (e.g. `?payload={"title":"..."}`)

```ts
// src/services/gasClient.ts
const url = new URL(GAS_URL)
url.searchParams.set('action', action)
url.searchParams.set('payload', JSON.stringify(rest))
fetch(url.toString())  // GET
```

The GAS `doGet(e)` handler unpacks `e.parameter.action` and `JSON.parse(e.parameter.payload)`.

---

## Routes

| Path | Component | Access |
|---|---|---|
| `/` | HomePage | Public |
| `/list/:shareCode` | SharedListPage | Anyone with shareCode |
| `/manage/:adminCode` | AdminPage | Owner only |
| `*` | NotFoundPage | — |

`createBrowserRouter` is called with `{ basename: import.meta.env.BASE_URL }` so the router is aware of the `/babylist/` prefix on GitHub Pages.

---

## Security Model

- `shareCode` — 6-character random alphanumeric, generated in GAS. Embedded in the family URL. Grants read + reserve + purchase access.
- `adminCode` — 12-character random alphanumeric, generated in GAS. Embedded in the owner URL. Required for all write operations (add/edit/delete item).
- Both codes are validated server-side in GAS before any action is performed.
- No server session, no JWT, no login required.

---

## Environment Variables

### Frontend (`.env` locally, GitHub Actions variable in CI)

| Variable | Description |
|---|---|
| `VITE_GAS_URL` | Google Apps Script Web App deployment URL |

### Vite build-time

| Variable | Set by | Description |
|---|---|---|
| `VITE_BASE` | GitHub Actions workflow | Base path (`/babylist/`). Vite exposes it as `import.meta.env.BASE_URL`. |

---

## Local Development

```bash
# Copy and fill in the GAS URL
cp .env.example .env

# Start dev server (reads .env)
npm run dev
# → http://localhost:5173
```

## Deployment

Handled automatically by GitHub Actions on every push to `main`. See [07-github-pages-deployment.md](./07-github-pages-deployment.md).

```bash
# Manual production build (for testing)
npm run build
npm run preview
```
