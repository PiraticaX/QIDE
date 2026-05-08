@echo off
echo.
echo ⚛️  Quantum Enterprise Platform — Starting Dev Environment
echo ===========================================================
echo.

cd backend
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate

pip install -r requirements.txt -q

if not exist .env (
    copy .env.example .env
    echo Created backend\.env from template
)

echo Starting backend on http://localhost:8000 ...
start "QuantumOS Backend" cmd /k "venv\Scripts\activate && uvicorn main:app --reload --port 8000"
cd ..

cd frontend

if not exist node_modules (
    echo Installing npm packages...
    npm install --legacy-peer-deps
)

if not exist .env.local (
    copy .env.example .env.local
    echo Created frontend\.env.local from template
)

echo.
echo ===========================================================
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/api/docs
echo Frontend: http://localhost:3000 (starting...)
echo.
echo Dev OTP: Check backend terminal window for login codes
echo ===========================================================
echo.

npm run dev
