# Requirements

## Functional Requirements

### Owner (Admin)
- Create a new baby shower list with title, owner name, baby name, due date
- Receive two secret codes: a `shareCode` (6 chars) for family and an `adminCode` (12 chars) for management
- Add, edit, and delete items on the list
- Each item has: name, category, quantity, priority, image URL (optional), notes
- View which items are reserved and by whom
- View which items are purchased and by whom
- See a Google Sheet link that mirrors the list data
- Access admin page at `/manage/:adminCode`

### Family Members
- Open shared list via URL `/list/:shareCode`
- View all items with their status (available, reserved, purchased)
- Filter items by category
- Reserve an item ("I'll buy this") by entering their name
- Un-reserve an item they reserved
- Mark an item as purchased
- Suggest a new item (it goes on the list as pending)
- See real-time updates when others reserve/purchase items

### System
- Real-time sync across all open browsers via Firestore `onSnapshot`
- Prevent double-reservation via Firestore transaction
- Mirror list data to Google Sheets automatically on create/update/delete

## Non-Functional Requirements
- Mobile-first responsive design (min 375px viewport)
- No authentication — security via unguessable codes (nanoid)
- Zero-config for family (no account needed)
- Fast initial load (Vite build, Firebase Hosting CDN)
- Works on modern browsers (Chrome, Safari, Firefox, Edge)

## User Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| U1 | Owner | Create a wishlist | Family knows what to buy |
| U2 | Owner | Get a shareable link | I can send it to family via WhatsApp/email |
| U3 | Owner | Add items with categories and priority | Family can see what's most needed |
| U4 | Owner | See who reserved what | I avoid duplicates |
| U5 | Owner | Have a Google Sheet copy | I can filter/share in my preferred tool |
| U6 | Family | See all items at a glance | I can choose what to buy |
| U7 | Family | Reserve an item | Others know it's taken |
| U8 | Family | Mark an item purchased | The list stays accurate |
| U9 | Family | Suggest a new item | I can add something not on the list |
| U10 | Family | See live updates | I don't see stale data |
