# Baby Shower Lista — Spec Index

## Spec Files

| File | Status | Description |
|---|---|---|
| [01-requirements.md](./01-requirements.md) | ✅ Current | Functional & non-functional requirements, user stories |
| [02-technical-spec.md](./02-technical-spec.md) | ✅ Current | Tech stack, architecture, environment, deployment |
| [03-data-model.md](./03-data-model.md) | ✅ Current | Google Sheets data model, column layout, ID generation |
| [04-components.md](./04-components.md) | ✅ Current | React component hierarchy, props, behavior |
| [05-google-sheets-sync.md](./05-google-sheets-sync.md) | ⛔ Superseded | Original Firebase Functions + Sheets mirror plan (replaced by spec 06) |
| [06-google-sheets-only.md](./06-google-sheets-only.md) | ✅ Current | GAS Web App backend, GET-only API, polling strategy |
| [07-github-pages-deployment.md](./07-github-pages-deployment.md) | ✅ Current | GitHub Pages hosting, Actions workflow, base path, SPA routing |

## Summary

A responsive baby shower wishlist app. No database subscription required — data lives in **Google Sheets**, managed by a **Google Apps Script Web App** that acts as the API. The React SPA is hosted on **GitHub Pages** and deployed automatically via GitHub Actions on every push to `main`.

## Current Tech Stack (as implemented)

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 6 + TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 (`createBrowserRouter` with `basename`) |
| Backend / DB | Google Apps Script Web App + Google Sheets |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |
