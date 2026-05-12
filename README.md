# PrimeTrade AI — Backend Intern Assignment

A **secure, scalable full-stack application** featuring a RESTful API with JWT authentication, role-based access control (RBAC), and a modern Next.js frontend dashboard.

[![Backend](https://img.shields.io/badge/Backend-Express%20%2B%20TypeScript-blue)](./backend)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-black)](./frontend)
[![DB](https://img.shields.io/badge/Database-Prisma%20%2B%20SQLite%2FPostgreSQL-green)](./backend/prisma/schema.prisma)
[![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20bcrypt-orange)](./backend/src/controllers/auth.controller.ts)

---

## 🚀 Features

### Backend (Primary Focus)
- ✅ **User Registration & Login** — bcrypt password hashing, JWT token (7-day expiry)
- ✅ **Role-Based Access Control** — `USER` and `ADMIN` roles
- ✅ **Task CRUD APIs** — Create, Read, Update (PATCH), Delete with ownership checks
- ✅ **API Versioning** — All routes under `/api/v1/`
- ✅ **Input Validation** — Zod schemas on all endpoints
- ✅ **Error Handling** — Consistent JSON error responses with proper HTTP status codes
- ✅ **Swagger UI** — Interactive API docs at `/api-docs`
- ✅ **Database** — Prisma ORM with SQLite (local) / PostgreSQL (production)

### Frontend
- ✅ **Login & Register** pages with role selection
- ✅ **Protected Dashboard** — requires JWT; redirects if unauthenticated
- ✅ **Task Management** — Create, edit, delete, and advance task status
- ✅ **Filters** — By status (All / Pending / In Progress / Done)
- ✅ **Stats Cards** — Live counts of task statuses
- ✅ **Admin View** — Admins see all users' tasks with owner info

---

## 📁 Project Structure

```
ptbi/
├── backend/                   # Express + TypeScript API
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Auto-generated migrations
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   │   ├── auth.controller.ts
│   │   │   └── task.controller.ts
│   │   ├── middleware/        # Auth & RBAC middleware
│   │   │   ├── auth.middleware.ts
│   │   │   └── role.middleware.ts
│   │   ├── routes/            # Route definitions
│   │   │   ├── auth.routes.ts
│   │   │   └── task.routes.ts
│   │   ├── lib/
│   │   │   └── prisma.ts      # Prisma client singleton
│   │   └── index.ts           # Server entry point
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  # Next.js 15 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── globals.css    # Design system (dark glassmorphism)
│   │   │   └── layout.tsx
│   │   └── context/
│   │       └── AuthContext.tsx
│   └── .env.local
│
└── README.md
```

---

## 🗄️ Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  role      String   @default("USER") // "USER" | "ADMIN"
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Task {
  id          String   @id @default(uuid())
  title       String
  description String?
  status      String   @default("PENDING")  // PENDING | IN_PROGRESS | DONE
  priority    String   @default("MEDIUM")   // LOW | MEDIUM | HIGH
  userId      String
  user        User     @relation(...)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 📡 API Endpoints

### Auth (`/api/v1/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register a new user |
| POST | `/login` | ❌ | Login and receive JWT |
| GET | `/me` | ✅ Bearer | Get current user profile |

### Tasks (`/api/v1/tasks`) — All require Bearer JWT
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/` | USER/ADMIN | Get tasks (own for user, all for admin) |
| GET | `/:id` | USER/ADMIN | Get single task |
| POST | `/` | USER/ADMIN | Create a task |
| PATCH | `/:id` | USER/ADMIN | Update a task |
| DELETE | `/:id` | USER/ADMIN | Delete a task |

**Query filters for GET /tasks:** `?status=PENDING|IN_PROGRESS|DONE` and `?priority=LOW|MEDIUM|HIGH`

---

## 🛠️ Local Setup

### Prerequisites
- Node.js 18+
- npm

### 1. Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
# API running at http://localhost:5000
# Swagger at http://localhost:5000/api-docs
```

### 2. Frontend
```bash
cd frontend
npm install
# Ensure .env.local has NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
npm run dev
# UI at http://localhost:3000
```

---

## 🔐 Security Practices
- **bcrypt** (12 salt rounds) for password hashing
- **JWT** signed with a secret (7-day expiry, configurable)
- **Zod** validation on all request bodies
- **CORS** restricted to frontend domain in production
- **Ownership checks** — users can only touch their own tasks
- **Admin guard** — RBAC applied at controller level

---

## 📈 Scalability Note

| Concern | Current | Production Path |
|---------|---------|----------------|
| **Database** | SQLite | PostgreSQL on Render / Supabase |
| **Caching** | None | Redis (session tokens, task lists) |
| **Architecture** | Monolith | Extract auth & task into microservices |
| **Load Balancing** | N/A | Render auto-scaling / AWS ELB |
| **Auth** | JWT | Add refresh tokens + token revocation list |
| **Logging** | console | Winston + Sentry / Datadog |

---

## 📖 API Documentation

Interactive Swagger UI is available at **`http://localhost:5000/api-docs`** when the backend is running.

---

*Built for the PrimeTrade.ai Backend Developer Intern Assignment.*
