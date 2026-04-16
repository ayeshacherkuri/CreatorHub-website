# Creator Hub (MERN)

Creator Hub is a full-stack MERN app that lets users sign up/login (JWT), manage content ideas (draft/published), and generate idea drafts with a mock “AI” generator.

## Tech

- Backend: Node.js + Express + MongoDB (Mongoose) + JWT + bcrypt
- Frontend: React (Vite) + React Router

## Local Setup

### 1. MongoDB

Create a MongoDB Atlas cluster and grab the connection string.

### 2. Backend

```powershell
cd "backend"
npm install
copy .env.example .env
```

Update `.env` with:

- `MONGODB_URI` (Atlas connection string)
- `JWT_SECRET` (generate a long random string)
- `CORS_ORIGIN` (usually `http://localhost:5173`)

Run:

```powershell
npm run dev
```

Backend listens on `PORT` (default `5000`).

### 3. Frontend

```powershell
cd "frontend"
npm install
copy .env.example .env
```

Update `.env` with:

- `VITE_API_BASE_URL` (use `http://localhost:5000` for local dev if needed)

Run:

```powershell
npm run dev
```

## Features Implemented

- Authentication
  - Signup/login with JWT
  - Password hashing with bcrypt
  - Protected `/api/ideas` routes
- Dashboard
  - Total ideas, drafts, published posts
- Ideas Manager
  - Add/edit/delete ideas
  - Mark as `draft` / `published`
  - Filter by status + search + tag
- AI Idea Generator (mock)
  - Generate draft ideas from a topic and add them to your ideas
- Error handling
  - Backend centralized error middleware
  - Frontend shows API error messages
- UI/UX
  - Sidebar navigation
  - Responsive layout
  - Dark/light theme toggle

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (used by the frontend to load the logged-in user)
- `GET /api/ideas` (supports `status`, `tags`, `search`, `limit`, `page`)
- `POST /api/ideas`
- `PUT /api/ideas/:id`
- `DELETE /api/ideas/:id`

## Deployment

### Backend on Render

1. Create a new **Web Service** on Render.
2. Set:
   - `Build Command`: leave blank (or set to `npm install && npm run build` if you add a build step later)
   - `Start Command`: `npm start`
3. Environment variables:
   - `MONGODB_URI` (MongoDB Atlas)
   - `JWT_SECRET`
   - `PORT` (optional, but commonly set by Render)
   - `CORS_ORIGIN` (your Vercel frontend URL, e.g. `https://your-app.vercel.app`)

### Frontend on Vercel

1. Import the `frontend` directory into Vercel.
2. Build settings:
   - `Framework Preset`: Vite
   - `Build Command`: `npm run build`
   - `Output Directory`: `dist`
3. Environment variables:
   - `VITE_API_BASE_URL`: your Render backend base URL (e.g. `https://your-backend.onrender.com`)

### MongoDB Atlas

1. Whitelist connections for your Render service and local IP (Atlas Security → Network Access).
2. Use the same `MONGODB_URI` in both local and Render environments.

## Notes

- This scaffold uses a **mock** AI generator in the frontend (no OpenAI key required).
- Add real OpenAI integration later by replacing the mock generator with a backend endpoint.

