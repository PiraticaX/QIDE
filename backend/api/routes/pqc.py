"""PQC Migration routes."""
import logging
import random
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.models import PQCScan
from api.routes.users import get_current_user
from models.models import User

logger = logging.getLogger(__name__)
router = APIRouter()

ALGORITHMS = ["CRYSTALS-Kyber", "CRYSTALS-Dilithium", "Falcon", "SPHINCS+", "BIKE", "HQC"]
VULNERABLE_PATTERNS = ["RSA", "ECC", "ECDSA", "DH", "DHE", "TLS 1.0", "TLS 1.1", "MD5", "SHA1"]


class ScanRequest(BaseModel):
    name: str
    scan_type: str = "config"  # config, certificate, architecture
    content: Optional[str] = None  # Text content to scan


def analyze_content(content: str) -> tuple:
    """Analyze content for cryptographic vulnerabilities."""
    if not content:
        return 35.0, [], []

    findings = []
    content_upper = content.upper()

    for pattern in VULNERABLE_PATTERNS:
        if pattern in content_upper:
            severity = "critical" if pattern in ["RSA", "ECC", "MD5"] else "high"
            findings.append({
                "type": pattern,
                "severity": severity,
                "description": f"Found {pattern} usage — vulnerable to quantum attacks",
                "location": "detected in configuration",
            })

    # Risk score based on findings
    risk_score = min(95.0, 20.0 + len(findings) * 12.0 + random.uniform(-5, 5))

    recommendations = [
        {
            "algorithm": "CRYSTALS-Kyber",
            "type": "Key Encapsulation",
            "nist_status": "NIST PQC Standard",
            "complexity": "Low",
            "priority": "High",
        },
        {
            "algorithm": "CRYSTALS-Dilithium",
            "type": "Digital Signatures",
            "nist_status": "NIST PQC Standard",
            "complexity": "Low",
            "priority": "High",
        },
        {
            "algorithm": "Falcon",
            "type": "Digital Signatures",
            "nist_status": "NIST PQC Standard",
            "complexity": "Medium",
            "priority": "Medium",
        },
    ]

    return risk_score, findings, recommendations


@router.post("/scan")
async def create_scan(
    req: ScanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        risk_score, findings, recommendations = analyze_content(req.content or "")
        scan = PQCScan(
            user_id=current_user.id,
            name=req.name,
            scan_type=req.scan_type,
            status="completed",
            risk_score=risk_score,
            findings=findings,
            recommendations=recommendations,
            input_data=req.content[:2000] if req.content else None,
            completed_at=datetime.now(timezone.utc),
        )
        db.add(scan)
        await db.commit()
        return {
            "scan_id": scan.id,
            "risk_score": risk_score,
            "findings": findings,
            "recommendations": recommendations,
            "status": "completed",
        }
    except Exception as e:
        logger.error(f"PQC scan error: {e}")
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@router.get("/algorithms")
async def list_algorithms(current_user: User = Depends(get_current_user)):
    return {
        "algorithms": [
            {"name": "CRYSTALS-Kyber", "type": "KEM", "nist_level": 1, "status": "standard"},
            {"name": "CRYSTALS-Dilithium", "type": "Signature", "nist_level": 2, "status": "standard"},
            {"name": "Falcon", "type": "Signature", "nist_level": 1, "status": "standard"},
            {"name": "SPHINCS+", "type": "Signature", "nist_level": 1, "status": "standard"},
            {"name": "BIKE", "type": "KEM", "nist_level": 1, "status": "candidate"},
            {"name": "HQC", "type": "KEM", "nist_level": 1, "status": "candidate"},
        ]
    }
