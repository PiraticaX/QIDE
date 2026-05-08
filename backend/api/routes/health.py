"""Health check routes."""
from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()


@router.get("/")
async def health():
    return {
        "status": "operational",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "api": "operational",
            "database": "operational",
        },
    }


@router.get("/ready")
async def readiness():
    return {"ready": True}
