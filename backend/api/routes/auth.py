"""Auth routes — email OTP + JWT, Python 3.11 compatible."""
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.database import get_db
from core.auth import create_access_token, generate_otp, hash_password, verify_password
from models.models import User, OTPRecord

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Schemas ────────────────────────────────────────────────────────────────────

class SendOTPRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class GoogleAuthRequest(BaseModel):
    google_token: str
    email: EmailStr
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ── Helpers ────────────────────────────────────────────────────────────────────

async def get_or_create_user(db: AsyncSession, email: str, display_name: str = None) -> User:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            email=email,
            display_name=display_name or email.split("@")[0],
        )
        db.add(user)
        await db.flush()
        logger.info(f"Created new user: {email}")
    return user


async def send_otp_email(email: str, otp: str):
    """Send OTP via email. Gracefully handles missing SMTP config."""
    from core.config import settings
    if not settings.SMTP_HOST:
        logger.warning(f"[DEV MODE] OTP for {email}: {otp}")
        return
    try:
        import smtplib
        from email.mime.text import MIMEText
        msg = MIMEText(f"Your Quantum Platform OTP: {otp}\n\nValid for 10 minutes.")
        msg["Subject"] = "Your Login Code — Quantum Platform"
        msg["From"] = settings.FROM_EMAIL
        msg["To"] = email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as s:
            s.starttls()
            if settings.SMTP_USER:
                s.login(settings.SMTP_USER, settings.SMTP_PASS)
            s.send_message(msg)
    except Exception as e:
        logger.error(f"Failed to send OTP email: {e}")
        # Don't raise — log the OTP for dev debugging
        logger.warning(f"[FALLBACK] OTP for {email}: {otp}")


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/send-otp")
async def send_otp(
    req: SendOTPRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Send OTP to email."""
    try:
        user = await get_or_create_user(db, req.email)
        otp = generate_otp()
        otp_record = OTPRecord(
            user_id=user.id,
            otp_hash=hash_password(otp),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
        )
        db.add(otp_record)
        await db.commit()
        background_tasks.add_task(send_otp_email, req.email, otp)
        return {"message": "OTP sent successfully", "email": req.email}
    except Exception as e:
        logger.error(f"Send OTP error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP")


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(req: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    """Verify OTP and return JWT."""
    try:
        result = await db.execute(select(User).where(User.email == req.email))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Find valid OTP
        now = datetime.now(timezone.utc)
        otp_result = await db.execute(
            select(OTPRecord).where(
                OTPRecord.user_id == user.id,
                OTPRecord.used == False,
                OTPRecord.expires_at > now,
            ).order_by(OTPRecord.created_at.desc())
        )
        otp_records = otp_result.scalars().all()

        verified = False
        for record in otp_records:
            if verify_password(req.otp, record.otp_hash):
                record.used = True
                verified = True
                break

        if not verified:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")

        await db.commit()
        token = create_access_token({"sub": user.id, "email": user.email})
        return TokenResponse(
            access_token=token,
            user={"id": user.id, "email": user.email, "display_name": user.display_name},
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verify OTP error: {e}")
        raise HTTPException(status_code=500, detail="Authentication failed")


@router.post("/google", response_model=TokenResponse)
async def google_auth(req: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """Google OAuth — accept pre-verified token from frontend."""
    try:
        user = await get_or_create_user(db, req.email, req.display_name)
        if req.avatar_url and not user.avatar_url:
            user.avatar_url = req.avatar_url
        await db.commit()
        token = create_access_token({"sub": user.id, "email": user.email})
        return TokenResponse(
            access_token=token,
            user={"id": user.id, "email": user.email, "display_name": user.display_name},
        )
    except Exception as e:
        logger.error(f"Google auth error: {e}")
        raise HTTPException(status_code=500, detail="Google authentication failed")


@router.get("/me")
async def get_me(db: AsyncSession = Depends(get_db), token: str = None):
    """Get current user from token."""
    from fastapi import Header
    raise HTTPException(status_code=501, detail="Use /users/me with Authorization header")
