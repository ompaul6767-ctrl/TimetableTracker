# CTMS — College Timetable Management System
### Zeal College of Engineering, Pune | Dept. of Computer Engineering

A full-stack web application for managing faculty timetables, subject assignments, and workload tracking across academic divisions and semesters.

---

## 🏗️ Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend  | Node.js, Express, TypeScript, Prisma    |
| Database | PostgreSQL 15                           |
| Auth     | JWT (Access + Refresh tokens)           |
| DevOps   | Docker, Docker Compose                  |

---

## ✅ Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Docker** & **Docker Compose** (for PostgreSQL)
- **Git**

---

## 🚀 Setup & Installation

### 1. Clone the repository
```bash
git clone <repo-url>
cd TimeTableTracker
```

### 2. Configure environment variables

```bash
# Server env
cp server/.env.example server/.env

# Client env
cp client/.env.example client/.env
```

Edit `server/.env` and set strong secrets for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in production.

### 3. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

This starts a PostgreSQL 15 instance at `localhost:5432` with:
- **User:** `ctms_user`
- **Password:** `ctms_pass`
- **Database:** `ctms_db`

### 4. Install dependencies

```bash
# Install root deps
npm install

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 5. Run database migrations

```bash
cd server
npm run db:migrate
```

### 6. Seed the database

```bash
npm run db:seed
```

### 7. Start the development servers

From the **root** directory:
```bash
npm run dev
```

This concurrently starts:
- **API Server:** http://localhost:4000
- **Client App:** http://localhost:5173

---

## 🔑 Test Credentials

After seeding, you can log in with:

| Role        | Email                    | Password     |
|-------------|--------------------------|--------------|
| Admin       | admin@zeal.edu.in        | Admin@1234   |
| Coordinator | coordinator@zeal.edu.in  | Coord@1234   |
| Faculty     | kinjal.vele@zeal.edu.in  | Faculty@1234 |

> **Note:** Change all default passwords before deploying to production.

---

## 🗄️ Database Management

```bash
cd server

# View & edit data via Prisma Studio (GUI)
npm run db:studio

# Re-generate Prisma client after schema changes
npm run db:generate

# Create a new migration
npm run db:migrate
```

---

## 📁 Project Structure

```
TimeTableTracker/
├── client/                  # React frontend (Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities, API client, auth helpers
│   │   └── types/           # Shared TypeScript types
│   ├── public/
│   └── index.html
├── server/                  # Express API (TypeScript + Prisma)
│   ├── src/
│   │   ├── routes/          # Express route handlers
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/       # Auth, error handling
│   │   └── lib/             # DB client, utilities
│   └── prisma/
│       ├── schema.prisma    # Database schema
│       └── seed.ts          # Seed data
├── docker-compose.yml       # PostgreSQL service
└── package.json             # Root workspace config
```

---

## 📝 License

Internal use — Zeal College of Engineering, Pune.
