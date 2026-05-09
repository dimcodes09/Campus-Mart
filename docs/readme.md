# Smart Marketplace for Students

> A peer-to-peer platform for students to buy, sell, and rent items within their campus community.

---

## 💡 Problem Statement

Students constantly need textbooks, electronics, and supplies — but buying new is expensive and selling used is inconvenient. No platform exists specifically for campus-level student-to-student exchange with a rental option.

---

## ✅ Our Solution

A dedicated student marketplace with:
- **Buy / Sell** — list items for sale
- **Rent** — rent items with deposit protection
- **Realtime notifications** — instant updates via Socket.IO
- **AI assistant** — smart product recommendations or listing help

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Realtime | Socket.IO |
| Frontend | Next.js (JavaScript) |
| Styling | Tailwind CSS |
| AI | OpenAI / Gemini API |

---

## 🗂️ Documentation Index

| File | Contents |
|---|---|
| [`api-docs.md`](./api-docs.md) | All API endpoints — request, response, errors |
| [`backend.md`](./backend.md) | Folder structure, models, middleware, rental logic |
| [`frontend.md`](./frontend.md) | Pages, components, API integration, Socket.IO flow |

---

## 🔄 Core Flow

```
Register / Login  →  Browse Products  →  Request Rental
                                               ↓
                                        Owner Confirms
                                               ↓
                                        Item Rented (active)
                                               ↓
                                        Item Returned (completed)
```

---

## 🚀 Quick Start

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env      # fill in MONGO_URI + JWT_SECRET
npm run dev               # runs on localhost:5000

# 2. Frontend
cd frontend
npm install
npm run dev               # runs on localhost:3000
```

---

## 👥 Team Roles (suggested)

| Role | Responsibility |
|---|---|
| Backend Dev | APIs, DB models, Socket.IO server |
| Frontend Dev | Next.js pages, Tailwind UI, API integration |
| AI Integration | Gemini/OpenAI prompt design, recommendation logic |
| Presenter | Docs, demo flow, pitch |

---

## 🏆 Hackathon USPs

- ✅ Real rental lifecycle with deposit tracking
- ✅ Realtime notifications (no polling)
- ✅ AI-powered product recommendations
- ✅ Mobile-friendly Tailwind UI
- ✅ JWT-secured, production-ready API
