# ⚛️ Quantum Enterprise Platform

> World-class quantum infrastructure for enterprises, governments, and developers.

A full-stack, production-ready platform unifying **Quantum IDE**, **PQC Migration Suite**, **Enterprise Workflow Automation**, and **Quantum Optimization Engine** — built with Next.js 14, FastAPI (Python 3.11), and SQLite/PostgreSQL.

---

## ✨ Features

| Module | Description |
|---|---|
| 🔐 **Auth** | Email OTP + Google OAuth, JWT sessions |
| ⚛️ **Quantum IDE** | Drag-and-drop circuit builder, Qiskit simulation, code editor |
| 🔄 **Workflow Automation** | Node-based visual workflow builder with live execution logs |
| 🛡️ **PQC Migration Suite** | Quantum risk scoring, vulnerability detection, NIST algorithm recommendations |
| ⚡ **Optimization Engine** | QAOA-powered optimization for logistics, scheduling, energy, finance |
| 📊 **Dashboard** | Real-time analytics, system status, activity feed |
| 🌓 **Theme** | Smooth light/dark mode with persistent preference |

---

## 🚀 Quick Start (Local Dev — No Docker)

### Prerequisites
- **Node.js** 18+ 
- **Python 3.11** (⚠️ Do NOT use 3.12+ — breaking dependency changes)
- npm or yarn

### 1. Clone & setup

```bash
git clone <repo>
cd quantum-platform
```

### 2. Backend

```bash
cd backend

# Create virtual environment with Python 3.11 explicitly
python3.11 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env — the defaults work for local dev (SQLite, no SMTP needed)

# Start backend
uvicorn main:app --reload --port 8000
```

Backend will be live at: **http://localhost:8000**  
API docs at: **http://localhost:8000/api/docs**

> **Note:** On first start, the SQLite database (`quantum_platform.db`) is created automatically. OTPs print to the console log in dev mode since SMTP is not configured.

### 3. Frontend

```bash
cd ../frontend

# Install dependencies
npm install --legacy-peer-deps

# Copy environment
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000 (default — no changes needed)

# Start dev server
npm run dev
```

Frontend will be live at: **http://localhost:3000**

---

## 🐳 Docker (Full Stack)

```bash
# From project root
docker-compose up --build
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379  
- FastAPI backend on port 8000
- Next.js frontend on port 3000

---

## 🔑 Authentication Flow

The platform uses **Email OTP** authentication:

1. Enter your email → click "Send Code"
2. Check console logs (dev) or email (prod) for the 6-digit OTP
3. Enter OTP → you're in

**Dev mode:** OTPs are printed to the backend console:
```
WARNING  [DEV MODE] OTP for user@example.com: 482916
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite+aiosqlite:///./quantum_platform.db` | Database connection string |
| `JWT_SECRET` | `change-me-in-production` | **Change this in production!** |
| `DEBUG` | `false` | Enable debug mode |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend URL for CORS |
| `SMTP_HOST` | _(blank)_ | Leave blank for dev — OTPs log to console |
| `SMTP_USER` | _(blank)_ | SMTP username |
| `SMTP_PASS` | _(blank)_ | SMTP password |
| `FROM_EMAIL` | `noreply@quantum-platform.com` | Sender email |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

---

## 🗄️ Database

### SQLite (Default — zero config)
Works out of the box for local development. Database file is created at `backend/quantum_platform.db`.

### PostgreSQL (Production)
Update `DATABASE_URL` in `.env`:
```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/quantum_platform
```

### Supabase
```
DATABASE_URL=postgresql+asyncpg://postgres:[password]@db.[project].supabase.co:5432/postgres
```

---

## 🚢 Deployment

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod
```

Set environment variable in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Backend → Railway

1. Connect GitHub repo in Railway dashboard
2. Set root directory to `/backend`
3. Add environment variables:
   - `DATABASE_URL` (from Railway PostgreSQL plugin)
   - `JWT_SECRET` (generate a strong secret)
   - `FRONTEND_URL` (your Vercel URL)
4. Railway auto-detects `requirements.txt` and deploys

### Backend → Render

1. New Web Service → connect repo
2. Root directory: `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 📡 API Reference

Base URL: `http://localhost:8000`

| Endpoint | Method | Description |
|---|---|---|
| `/api/health/` | GET | Health check |
| `/api/auth/send-otp` | POST | Send OTP to email |
| `/api/auth/verify-otp` | POST | Verify OTP, returns JWT |
| `/api/auth/google` | POST | Google OAuth login |
| `/api/users/me` | GET | Get current user |
| `/api/circuits/` | GET/POST | List/create circuits |
| `/api/circuits/{id}` | GET/PATCH/DELETE | Manage circuit |
| `/api/simulate/` | POST | Run quantum simulation |
| `/api/workflows/` | GET/POST | List/create workflows |
| `/api/workflows/{id}/run` | POST | Execute workflow |
| `/api/pqc/scan` | POST | Run PQC risk scan |
| `/api/pqc/algorithms` | GET | List PQC algorithms |
| `/api/optimize/` | POST | Run optimization |

Full interactive docs: **http://localhost:8000/api/docs**

---

## ⚛️ Quantum Simulation

The platform uses **Qiskit** for quantum simulation. To enable real simulation:

```bash
# In backend venv
pip install qiskit==1.1.0 qiskit-aer==0.14.0
```

Without Qiskit installed, the platform uses a **mock simulator** that returns realistic-looking results — perfect for UI development and demos.

---

## 🏗️ Architecture

```
quantum-platform/
├── frontend/                    # Next.js 14 App Router
│   ├── app/
│   │   ├── auth/               # Login page
│   │   ├── (app)/              # Protected app shell
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── ide/            # Quantum IDE + circuit builder
│   │   │   ├── workflow/       # Workflow automation builder
│   │   │   ├── pqc/            # PQC Migration Suite
│   │   │   ├── optimize/       # Optimization engine
│   │   │   ├── help/           # Help & support
│   │   │   ├── settings/       # User settings
│   │   │   └── profile/        # User profile
│   │   └── layout.tsx
│   ├── components/             # Shared components
│   ├── lib/api.ts              # Axios API client
│   └── store/authStore.ts      # Zustand auth store
│
├── backend/                     # FastAPI (Python 3.11)
│   ├── main.py                 # App entrypoint + global error handlers
│   ├── core/
│   │   ├── config.py           # Pydantic settings
│   │   ├── database.py         # Async SQLAlchemy
│   │   └── auth.py             # JWT + OTP utilities
│   ├── models/models.py        # SQLAlchemy ORM models
│   └── api/routes/
│       ├── auth.py             # Auth endpoints
│       ├── users.py            # User endpoints
│       ├── circuits.py         # Circuit CRUD
│       ├── simulate.py         # Quantum simulation
│       ├── workflows.py        # Workflow management
│       ├── pqc.py              # PQC scanning
│       ├── optimize.py         # Optimization
│       └── health.py           # Health checks
│
├── docker-compose.yml
└── README.md
```

---

## 🛡️ Error Handling

The platform is built for resilience:

- **Global exception handler** on FastAPI — never returns raw stack traces, always clean JSON
- **Graceful degradation** — works without Redis, Qiskit, or SMTP configured
- **Mock simulation** — if Qiskit Aer is not installed, returns realistic mock results
- **OTP fallback** — prints OTP to console if SMTP is not configured
- **Frontend API client** — catches all errors, redirects on 401, shows clean toasts
- **Database connection errors** — logged but don't crash the server

---

## 🔒 Security

- JWT tokens with configurable expiry (default 24h)
- Passwords hashed with bcrypt (passlib)
- CORS configured per environment
- OTP expiry (10 minutes)
- OTP single-use enforcement
- All routes require authentication except `/api/auth/*` and `/api/health/*`

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| State | Zustand (persisted) |
| Charts | Recharts |
| Backend | FastAPI, Python **3.11** |
| ORM | SQLAlchemy 2.0 (async) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT + Email OTP |
| Quantum | Qiskit / Qiskit Aer (optional) |
| Containers | Docker + docker-compose |

---

## 🐛 Troubleshooting

**`ModuleNotFoundError` on backend start**
```bash
# Make sure you're in the venv and using Python 3.11
python --version   # should show 3.11.x
pip install -r requirements.txt
```

**CORS errors in browser**
```bash
# Add your frontend URL to ALLOWED_ORIGINS in backend/.env
FRONTEND_URL=http://localhost:3000
```

**OTP not received**
```bash
# Check backend console — in dev mode OTP is printed there:
# WARNING [DEV MODE] OTP for user@example.com: 123456
```

**`aiosqlite` error**
```bash
pip install aiosqlite==0.20.0
```

**Port already in use**
```bash
# Backend
uvicorn main:app --reload --port 8001

# Frontend — update .env.local
NEXT_PUBLIC_API_URL=http://localhost:8001
```

---

## 📄 License

MIT — free for commercial and non-commercial use.

---

Built with ⚛️ by the Quantum Platform team.
