# Baby Shower List App — Spec Index

## Spec Files

| File | Description |
|---|---|
| [01-requirements.md](./01-requirements.md) | Functional & non-functional requirements, user stories |
| [02-technical-spec.md](./02-technical-spec.md) | Tech stack, architecture, deployment, environment setup |
| [03-data-model.md](./03-data-model.md) | Firestore collections, field types, security rules |
| [04-components.md](./04-components.md) | React component hierarchy, props, behavior |
| [05-google-sheets-sync.md](./05-google-sheets-sync.md) | Cloud Functions triggers, Sheets API strategy |

## Summary

A responsive baby shower wishlist web app. The owner creates a list, shares it via a secret link with family members. Family can view items, reserve them, mark as purchased, and suggest new items. No login required — access controlled by secret codes in URLs. Real-time updates via Firebase Firestore. Google Sheets mirror for owner convenience.
