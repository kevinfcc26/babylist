# Technical Specification

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 18.3.x |
| Build tool | Vite | 6.x |
| Language | TypeScript | 5.6.x |
| Styling | Tailwind CSS | 4.x (via @tailwindcss/vite) |
| Routing | React Router | 6.28.x |
| Database | Firebase Firestore | 11.x SDK |
| Backend | Firebase Cloud Functions | Node 20 |
| Sheets sync | Google Sheets API v4 | googleapis 144.x |
| Hosting | Firebase Hosting | — |
| ID generation | nanoid | 5.x |

## Architecture

```
Browser
  └── React SPA (Vite, Firebase Hosting)
        ├── Firestore SDK (real-time onSnapshot)
        └── HTTP requests → Cloud Functions (if any)

Firebase Firestore (source of truth)
  └── onDocumentWritten triggers → Cloud Functions
        └── Google Sheets API v4
              └── Google Sheet (read-only mirror)
```

## Routes

| Path | Component | Access |
|---|---|---|
| `/` | HomePage | Public |
| `/list/:shareCode` | SharedListPage | Anyone with shareCode |
| `/manage/:adminCode` | AdminPage | Owner only |
| `*` | NotFoundPage | — |

## Security Model

- `shareCode` = nanoid(6) ≈ 30 bits entropy (sufficient for sharing)
- `adminCode` = nanoid(12) ≈ 70 bits entropy (sufficient for admin access)
- Firestore rules restrict family to only update status fields (isReserved, reservedBy, isPurchased, purchasedBy)
- All item creates/deletes go through Cloud Functions (admin SDK bypasses rules)
- No server-side session or JWT required

## Firebase Project Setup

1. Create Firebase project (Blaze plan required for external API calls)
2. Enable Firestore in production mode
3. Enable Cloud Functions
4. Enable Firebase Hosting
5. Create service account for Sheets API (download JSON key)
6. Share the service account email as Editor on the target Google Sheet

## Environment Variables

### Frontend (.env)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Functions (functions/.env)
```
SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

## Deployment

```bash
# Deploy everything
firebase deploy --only hosting,functions,firestore

# Deploy only frontend
npm run build && firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions
```

## Local Development

```bash
# Frontend dev server
npm run dev

# Firebase emulators (Firestore + Functions)
firebase emulators:start
```
