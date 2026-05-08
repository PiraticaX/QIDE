"""Workflow routes."""
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List

from core.database import get_db
from models.models import Workflow, WorkflowExecution
from api.routes.users import get_current_user
from models.models import User

logger = logging.getLogger(__name__)
router = APIRouter()


class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    nodes: Optional[List[dict]] = None
    edges: Optional[List[dict]] = None


@router.get("/")
async def list_workflows(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await db.execute(
            select(Workflow).where(Workflow.owner_id == current_user.id)
            .order_by(Workflow.updated_at.desc())
        )
        workflows = result.scalars().all()
        return [
            {"id": w.id, "name": w.name, "description": w.description,
             "status": w.status, "created_at": w.created_at.isoformat() if w.created_at else None}
            for w in workflows
        ]
    except Exception as e:
        logger.error(f"List workflows error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch workflows")


@router.post("/")
async def create_workflow(
    data: WorkflowCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        wf = Workflow(
            owner_id=current_user.id,
            name=data.name,
            description=data.description,
            nodes=data.nodes or [],
            edges=data.edges or [],
        )
        db.add(wf)
        await db.commit()
        return {"id": wf.id, "name": wf.name, "message": "Workflow created"}
    except Exception as e:
        logger.error(f"Create workflow error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create workflow")


@router.post("/{workflow_id}/run")
async def run_workflow(
    workflow_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Execute a workflow — simulated execution with node-by-node logs."""
    try:
        result = await db.execute(
            select(Workflow).where(Workflow.id == workflow_id, Workflow.owner_id == current_user.id)
        )
        wf = result.scalar_one_or_none()
        if not wf:
            raise HTTPException(status_code=404, detail="Workflow not found")

        execution = WorkflowExecution(
            workflow_id=wf.id,
            status="running",
            logs=[{"ts": datetime.now(timezone.utc).isoformat(), "msg": "Workflow started"}],
        )
        db.add(execution)
        await db.flush()

        # Simulate node execution
        logs = execution.logs.copy()
        results = {}
        for i, node in enumerate(wf.nodes or []):
            node_name = node.get("data", {}).get("label", f"Node {i+1}")
            logs.append({
                "ts": datetime.now(timezone.utc).isoformat(),
                "msg": f"Executing: {node_name}",
                "node_id": node.get("id"),
                "status": "completed",
            })
            results[node.get("id", str(i))] = {"status": "completed", "output": {}}

        execution.status = "completed"
        execution.logs = logs
        execution.results = results
        execution.completed_at = datetime.now(timezone.utc)
        await db.commit()

        return {"execution_id": execution.id, "status": "completed", "logs": logs}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Run workflow error: {e}")
        raise HTTPException(status_code=500, detail=f"Workflow execution failed: {str(e)}")
