"""Quantum simulation routes — Qiskit Aer, Python 3.11 compatible."""
import logging
import time
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.models import Simulation, Circuit
from api.routes.users import get_current_user
from models.models import User

logger = logging.getLogger(__name__)
router = APIRouter()


class SimulateRequest(BaseModel):
    circuit_id: Optional[str] = None
    circuit_data: Optional[dict] = None  # Direct circuit dict if no saved circuit
    shots: int = 1024
    backend: str = "statevector_simulator"


def build_circuit_from_data(circuit_data: dict):
    """Build Qiskit circuit from gate data. Returns (circuit, error_msg)."""
    try:
        from qiskit import QuantumCircuit
        num_qubits = circuit_data.get("num_qubits", 2)
        gates = circuit_data.get("gates", [])

        qc = QuantumCircuit(num_qubits, num_qubits)

        gate_map = {
            "h": lambda qc, q, _: qc.h(q),
            "x": lambda qc, q, _: qc.x(q),
            "y": lambda qc, q, _: qc.y(q),
            "z": lambda qc, q, _: qc.z(q),
            "s": lambda qc, q, _: qc.s(q),
            "t": lambda qc, q, _: qc.t(q),
            "cnot": lambda qc, q, params: qc.cx(q, params.get("target", 1)),
            "cx": lambda qc, q, params: qc.cx(q, params.get("target", 1)),
            "swap": lambda qc, q, params: qc.swap(q, params.get("target", 1)),
            "rx": lambda qc, q, params: qc.rx(params.get("angle", 1.5708), q),
            "ry": lambda qc, q, params: qc.ry(params.get("angle", 1.5708), q),
            "rz": lambda qc, q, params: qc.rz(params.get("angle", 1.5708), q),
            "measure": lambda qc, q, _: qc.measure(q, q),
        }

        has_measurement = False
        for gate in gates:
            gate_type = gate.get("type", "").lower()
            qubit = gate.get("qubit", 0)
            params = gate.get("params", {})

            if qubit >= num_qubits:
                continue  # Skip invalid qubits

            if gate_type in gate_map:
                try:
                    gate_map[gate_type](qc, qubit, params)
                    if gate_type == "measure":
                        has_measurement = True
                except Exception as ge:
                    logger.warning(f"Gate {gate_type} on qubit {qubit} failed: {ge}")

        if not has_measurement and gates:
            qc.measure_all()

        return qc, None
    except ImportError:
        return None, "Qiskit not installed"
    except Exception as e:
        return None, str(e)


def run_simulation(qc, shots: int, backend_name: str) -> dict:
    """Run Qiskit simulation. Returns results dict."""
    try:
        from qiskit_aer import AerSimulator
        from qiskit import transpile

        simulator = AerSimulator()
        compiled = transpile(qc, simulator)
        job = simulator.run(compiled, shots=shots)
        result = job.result()
        counts = result.get_counts()

        # Normalize counts to probabilities
        total = sum(counts.values())
        probabilities = {k: v / total for k, v in counts.items()}

        return {
            "counts": counts,
            "probabilities": probabilities,
            "shots": shots,
            "backend": "aer_simulator",
            "success": True,
        }
    except ImportError:
        # Fallback simulation when Qiskit not installed
        logger.warning("Qiskit Aer not available — using mock simulation")
        return _mock_simulation(shots)
    except Exception as e:
        logger.error(f"Simulation error: {e}")
        return {"success": False, "error": str(e)}


def _mock_simulation(shots: int) -> dict:
    """Mock simulation for demo when Qiskit unavailable."""
    import random
    states = ["00", "01", "10", "11"]
    counts = {}
    for _ in range(shots):
        state = random.choices(states, weights=[0.5, 0.1, 0.1, 0.3])[0]
        counts[state] = counts.get(state, 0) + 1
    total = sum(counts.values())
    return {
        "counts": counts,
        "probabilities": {k: v / total for k, v in counts.items()},
        "shots": shots,
        "backend": "mock_simulator",
        "success": True,
        "note": "Mock simulation — install qiskit-aer for real results",
    }


@router.post("/")
async def simulate(
    req: SimulateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run quantum simulation."""
    start_time = time.time()
    sim_record = None

    try:
        circuit_data = req.circuit_data or {}

        if req.circuit_id:
            from sqlalchemy import select
            result = await db.execute(
                select(Circuit).where(
                    Circuit.id == req.circuit_id,
                    Circuit.owner_id == current_user.id,
                )
            )
            circuit = result.scalar_one_or_none()
            if not circuit:
                raise HTTPException(status_code=404, detail="Circuit not found")
            circuit_data = circuit.circuit_data or {}
            sim_record = Simulation(
                circuit_id=req.circuit_id,
                shots=req.shots,
                backend=req.backend,
                status="running",
            )
            db.add(sim_record)
            await db.flush()

        # Build and run
        qc, build_error = build_circuit_from_data(circuit_data)
        if build_error or qc is None:
            results = _mock_simulation(req.shots)
        else:
            results = run_simulation(qc, req.shots, req.backend)

        runtime_ms = (time.time() - start_time) * 1000

        if sim_record:
            sim_record.status = "completed" if results.get("success") else "failed"
            sim_record.results = results
            sim_record.runtime_ms = runtime_ms
            sim_record.completed_at = datetime.now(timezone.utc)
            if not results.get("success"):
                sim_record.error_message = results.get("error")
            await db.commit()

        return {
            "simulation_id": sim_record.id if sim_record else None,
            "results": results,
            "runtime_ms": runtime_ms,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Simulation endpoint error: {e}")
        if sim_record:
            sim_record.status = "failed"
            sim_record.error_message = str(e)
            await db.commit()
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")
