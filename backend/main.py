"""
Quantum Enterprise Platform — FastAPI Backend
Python 3.11 compatible
"""

import logging
import sys
from contextlib import asynccontextmanager

# Ensure Python 3.11 compatibility
if sys.version_info < (3, 11):
    print("Warning: Python 3.11+ recommended. Some features may behave differently.")

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import traceback

from api.routes import auth, simulate, circuits, workflows, pqc, optimize, users, health
from core.config import settings
from core.database import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("🚀 Quantum Platform starting up...")
    try:
        await init_db()
        logger.info("✅ Database initialized")
    except Exception as e:
        logger.error(f"❌ Database init failed: {e}")
        # Don't crash — platform can run with degraded DB
    yield
    logger.info("🛑 Quantum Platform shutting down...")


app = FastAPI(
    title="Quantum Enterprise Platform API",
    description="World-class quantum infrastructure backend",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler — never crash, always return clean JSON
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}\n{traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "An unexpected error occurred. Our team has been notified.",
            "detail": str(exc) if settings.DEBUG else None,
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "http_error",
            "message": exc.detail,
            "status_code": exc.status_code,
        },
    )


# Routers
app.include_router(health.router, prefix="/api/health", tags=["Health"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(circuits.router, prefix="/api/circuits", tags=["Circuits"])
app.include_router(simulate.router, prefix="/api/simulate", tags=["Simulation"])
app.include_router(workflows.router, prefix="/api/workflows", tags=["Workflows"])
app.include_router(pqc.router, prefix="/api/pqc", tags=["PQC Migration"])
app.include_router(optimize.router, prefix="/api/optimize", tags=["Optimization"])


@app.get("/")
async def root():
    return {
        "platform": "Quantum Enterprise Platform",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/api/docs",
    }
