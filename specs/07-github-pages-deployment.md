# Spec 07 — GitHub Pages Deployment

## Overview

The React SPA is hosted on **GitHub Pages** and deployed automatically by **GitHub Actions** on every push to `main`. No Firebase Hosting, no server required.

Live URL: `https://<username>.github.io/<repo-name>/`

---

## Key Challenges & Solutions

### 1 — Base path (`/repo-name/`)

GitHub Pages hosts project sites at `/<repo-name>/`, not at `/`. Vite must know the base path so it generates correct asset URLs in the HTML.

**Solution**: inject `VITE_BASE` at build time from the GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
- run: npm run build
  env:
    VITE_BASE: /${{ github.event.repository.name }}/
```

```ts
// vite.config.ts
base: process.env.VITE_BASE ?? '/',
```

Vite then exposes this as `import.meta.env.BASE_URL` throughout the app.

### 2 — React Router base path

`createBrowserRouter` must be told the base path or it matches routes against the full path including `/babylist/`.

```ts
// src/App.tsx
createBrowserRouter(routes, { basename: import.meta.env.BASE_URL })
```

### 3 — SPA deep links (404 on refresh)

GitHub Pages serves a static 404.html when a path like `/babylist/list/abc123` is requested directly (e.g. shared link opened fresh). It doesn't know to serve `index.html`.

**Solution**: the [spa-github-pages](https://github.com/rafgraph/spa-github-pages) trick.

`public/404.html` encodes the path into the query string and redirects to the repo root:
```js
// segmentCount = 1 (one segment before the app: /babylist/)
l.replace(origin + l.pathname.split('/').slice(0,2).join('/') + '/?/' + encodedPath)
```

`index.html` has a script that reads the encoded path and restores it via `history.replaceState` before React boots, so React Router sees the correct URL.

### 4 — Shareable link URLs

`ShareLinkPanel` and `AdminLinkPanel` must include the base path in the URL they display:

```ts
// ✅ correct — works on both localhost and GitHub Pages
const url = `${window.location.origin}${import.meta.env.BASE_URL}list/${shareCode}`

// ❌ wrong — missing /babylist/ on GitHub Pages
const url = `${window.location.origin}/list/${shareCode}`
```

---

## GitHub Actions Workflow

File: `.github/workflows/deploy.yml`

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          VITE_GAS_URL: ${{ vars.VITE_GAS_URL }}
          VITE_BASE: /${{ github.event.repository.name }}/
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

---

## Required GitHub Settings

### Pages source

**Settings → Pages → Source → GitHub Actions** (not "Deploy from a branch")

### Repository variable

**Settings → Secrets and variables → Actions → Variables → New repository variable**

| Name | Value |
|---|---|
| `VITE_GAS_URL` | GAS Web App URL (`https://script.google.com/macros/s/.../exec`) |

---

## Deployment Checklist

- [ ] Repo pushed to GitHub
- [ ] Pages source set to "GitHub Actions"
- [ ] `VITE_GAS_URL` variable added
- [ ] At least one push to `main` or manual workflow trigger
- [ ] GAS `setup()` has been run once
- [ ] GAS deployed as Web App (Execute as: Me, Access: Anyone)

---

## Local vs Production

| | Local (`npm run dev`) | GitHub Pages |
|---|---|---|
| Base URL | `/` | `/babylist/` |
| `VITE_GAS_URL` | From `.env` file | From GitHub Actions variable |
| `import.meta.env.BASE_URL` | `/` | `/babylist/` |
| Shared link format | `http://localhost:5173/list/abc` | `https://kevinfcc26.github.io/babylist/list/abc` |
