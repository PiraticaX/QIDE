"""Circuits routes."""
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from core.database import get_db
from models.models import Circuit
from api.routes.users import get_current_user
from models.models import User

logger = logging.getLogger(__name__)
router = APIRouter()


class CircuitCreate(BaseModel):
    name: str
    description: Optional[str] = None
    circuit_data: Optional[dict] = None
    code: Optional[str] = None
    num_qubits: int = 2


@router.get("/")
async def list_circuits(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await db.execute(
            select(Circuit).where(Circuit.owner_id == current_user.id)
            .order_by(Circuit.updated_at.desc())
        )
        circuits = result.scalars().all()
        return [
            {
                "id": c.id,
                "name": c.name,
                "description": c.description,
                "num_qubits": c.num_qubits,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            }
            for c in circuits
        ]
    except Exception as e:
        logger.error(f"List circuits error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch circuits")


@router.post("/")
async def create_circuit(
    data: CircuitCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        circuit = Circuit(
            owner_id=current_user.id,
            name=data.name,
            description=data.description,
            circuit_data=data.circuit_data or {"gates": [], "num_qubits": data.num_qubits},
            code=data.code,
            num_qubits=data.num_qubits,
        )
        db.add(circuit)
        await db.commit()
        return {"id": circuit.id, "name": circuit.name, "message": "Circuit created"}
    except Exception as e:
        logger.error(f"Create circuit error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create circuit")


@router.get("/{circuit_id}")
async def get_circuit(
    circuit_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await db.execute(
            select(Circuit).where(Circuit.id == circuit_id, Circuit.owner_id == current_user.id)
        )
        c = result.scalar_one_or_none()
        if not c:
            raise HTTPException(status_code=404, detail="Circuit not found")
        return {
            "id": c.id, "name": c.name, "description": c.description,
            "circuit_data": c.circuit_data, "code": c.code,
            "num_qubits": c.num_qubits,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get circuit error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch circuit")


@router.patch("/{circuit_id}")
async def update_circuit(
    circuit_id: str,
    data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await db.execute(
            select(Circuit).where(Circuit.id == circuit_id, Circuit.owner_id == current_user.id)
        )
        c = result.scalar_one_or_none()
        if not c:
            raise HTTPException(status_code=404, detail="Circuit not found")
        allowed = {"name", "description", "circuit_data", "code", "num_qubits"}
        for k, v in data.items():
            if k in allowed:
                setattr(c, k, v)
        await db.commit()
        return {"message": "Circuit updated"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update circuit error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update circuit")


@router.delete("/{circuit_id}")
async def delete_circuit(
    circuit_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await db.execute(
            select(Circuit).where(Circuit.id == circuit_id, Circuit.owner_id == current_user.id)
        )
        c = result.scalar_one_or_none()
        if not c:
            raise HTTPException(status_code=404, detail="Circuit not found")
        await db.delete(c)
        await db.commit()
        return {"message": "Circuit deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete circuit error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete circuit")
