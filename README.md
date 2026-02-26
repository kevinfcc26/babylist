# Baby Shower Lista 🍼

A responsive baby shower wishlist app. The owner creates a list, shares it with family via a secret link, and family members can view items, reserve them, and mark them as purchased — no account required.

**Live data is stored in Google Sheets** via a Google Apps Script backend. No database subscription needed.

---

## Features

- **Owner** creates a list and gets two private links: one to share with family, one to manage
- **Family** can view items, reserve them ("I'll buy this"), mark as purchased, and suggest new items
- **Real-time-ish** — the page polls every 10 seconds so everyone stays in sync
- **No login** — access is controlled by secret codes embedded in the URL
- **Google Sheets** is the database: every list gets its own spreadsheet, readable by the owner at any time
- **Mobile-first** responsive design

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 6 + TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| Backend / DB | Google Apps Script + Google Sheets |
| Hosting | GitHub Pages |

---

## Project Structure

```
babylistapp/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Auto-deploy to GitHub Pages on push to main
├── gas/
│   └── Code.gs                 # Google Apps Script backend (paste into script.google.com)
├── public/
│   └── 404.html                # SPA routing fix for GitHub Pages
├── specs/                      # Architecture and design specs
├── src/
│   ├── services/
│   │   ├── gasClient.ts        # fetch wrapper for the GAS API
│   │   ├── lists.ts            # createList
│   │   └── items.ts            # addItem, updateItem, deleteItem, reserve, purchase, suggest
│   ├── hooks/
│   │   ├── useList.ts          # polling hook (shareCode)
│   │   └── useAdminList.ts     # polling hook (adminCode)
│   ├── pages/
│   │   ├── HomePage.tsx        # / — create or enter a code
│   │   ├── SharedListPage.tsx  # /list/:shareCode — family view
│   │   ├── AdminPage.tsx       # /manage/:adminCode — owner view
│   │   └── NotFoundPage.tsx
│   ├── components/
│   │   ├── shared/             # Button, Input, Modal, Badge, Spinner…
│   │   ├── layout/             # AppShell, PageHeader
│   │   ├── list/               # ItemCard, ItemGrid, CategoryFilter…
│   │   └── admin/              # ItemForm, ItemTable, ShareLinkPanel…
│   └── types/
│       └── list.ts             # BabyList, ListItem, Category, Priority
├── .env.example
└── vite.config.ts
```

---

## Routes

| URL | Who uses it |
|---|---|
| `/` | Anyone — create a new list or enter an existing code |
| `/list/:shareCode` | Family — view, reserve, and purchase items |
| `/manage/:adminCode` | Owner — add, edit, and delete items |

---

## Setup

### 1 — Deploy the Google Apps Script backend

1. Go to [script.google.com](https://script.google.com) and create a **New project**
2. Delete the default code and paste the full contents of [`gas/Code.gs`](./gas/Code.gs)
3. Click **Run → `setup`** *(first time only)* — this creates the registry spreadsheet that tracks all lists
4. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the **Web App URL** — you'll need it in the next step

> Every time you modify `Code.gs`, click **Deploy → Manage deployments → Edit → New version** to publish the changes.

### 2 — Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
VITE_GAS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### 3 — Run locally

```bash
npm install
npm run dev
```

The app will be at `http://localhost:5173`.

---

## Deploy to GitHub Pages

### First-time setup

1. Push the repo to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```

2. In your GitHub repo go to **Settings → Pages → Source** and select **GitHub Actions**

3. Add your GAS URL as a repository variable:
   **Settings → Secrets and variables → Actions → Variables → New repository variable**

   | Name | Value |
   |---|---|
   | `VITE_GAS_URL` | `https://script.google.com/macros/s/.../exec` |

4. Trigger the first deployment:
   **Actions → Deploy to GitHub Pages → Run workflow**

Your app will be live at `https://<your-username>.github.io/<repo-name>/`

### Subsequent deploys

Every push to `main` automatically triggers a new deployment.

---

## How it works

### Security model

- `shareCode` — 6-character random code, embedded in the family link. Anyone with this link can view, reserve, and purchase items.
- `adminCode` — 12-character random code, embedded in the owner link. Required to add, edit, or delete items. **Keep this link private.**
- Neither code is stored on the client — they live only in the URL.

### Data storage

Each baby shower list gets its own Google Spreadsheet with two sheets:

- **`meta`** — list title, owner name, baby name, due date, shareCode, adminCode
- **`items`** — one row per item with all fields (name, category, quantity, reservation status, etc.)

A separate **registry spreadsheet** (created by `setup()`) maps shareCode/adminCode to the correct spreadsheet ID.

### Concurrency

Reserve and purchase actions use `LockService.getScriptLock()` in GAS to serialize concurrent writes, preventing two people from reserving the same item simultaneously.

### Polling

The app polls the GAS API every **10 seconds** when the browser tab is visible, and immediately on tab focus. This keeps all family members in sync without requiring WebSockets.

---

## Scripts

```bash
npm run dev      # Start local dev server
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push and open a Pull Request
