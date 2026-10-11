# Expense Tracker

A full-stack CRUD web app for logging personal expenses, with role-based access so an Admin can see everyone's spending while a regular User only manages their own. Built for Assignment-4 (CRUD — client-side rendering).

## Features

- Register / login with JWT-based authentication
- Add, edit, delete and view expenses
- Filter expenses by category
- Running total of currently visible expenses
- Role-based access: **Admin** sees and manages every user's expenses, **User** sees and manages only their own

## Tech stack

**Frontend:** React (Vite), React Router, useState/useEffect, fetch
**Backend:** Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcryptjs
**Other:** CORS, dotenv, Git branches + Pull Requests

## Team

| Role | Name | Roll No. |
|------|------|----------|
| Team Lead | Anushka Singh | 16 |
| Member | Mansa Bhatt | 48 |
| Member | Sofia | 82 |
| Member | Saroj Vishwakarma | 74 |

## API endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|--------------|
| POST | `/api/auth/register` | Public | Create an account (choose role: user/admin) |
| POST | `/api/auth/login` | Public | Log in, returns a JWT |
| GET | `/api/expenses` | Logged-in | Admin gets every expense, User gets their own |
| GET | `/api/expenses/:id` | Logged-in | Get a single expense (owner or Admin) |
| POST | `/api/expenses` | Logged-in | Create a new expense |
| PUT | `/api/expenses/:id` | Logged-in | Update an expense (owner or Admin) |
| DELETE | `/api/expenses/:id` | Logged-in | Delete an expense (owner or Admin) |

"Logged-in" routes require an `Authorization: Bearer <token>` header, checked by the `authenticateUser` middleware. A separate `requireAdmin` middleware is available in `backend/src/middleware/authMiddleware.js` for any route you want to lock to Admins only.

## Project structure

```
expense-tracker/
├── frontend/     React + Vite app
└── backend/      Express + MongoDB API
```

See `backend/src` for `controllers/`, `models/`, `routes/`, `middleware/`, `config/`, `utils/`, and `server.js`.

## Setup instructions

### 1. Backend

```
cd backend
npm install
cp .env.example .env   # then fill in your own values
npm run dev
```

### 2. Frontend

```
cd frontend
npm install
cp .env.example .env   # then fill in your own values
npm run dev
```

The frontend runs on `http://localhost:5173` and expects the backend at the URL set in `VITE_API_URL`.

## Environment variables

**backend/.env**
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection
JWT_SECRET=your_secret
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

Never commit `.env` — only `.env.example` is tracked in Git.

## Deployment links

- GitHub: https://github.com/anushkasingh-commits/Expense_Tracker_Application
- Frontend (Vercel): https://expense-tracker-application-red-ten.vercel.app/
- Backend (Render): https://expense-tracker-backend-k8ce.onrender.com/

## Git workflow

- `main` is protected — no direct pushes
- Each member works on their own branch, e.g. `feature/expense-crud`, `feature/auth`, `feature/dashboard`
- Open a Pull Request into `main` for review before merging
- Each member needs at least 2 meaningful merged PRs
