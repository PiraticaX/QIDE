"""SQLAlchemy models — Python 3.11 compatible."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Text, Integer, Float, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    display_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    circuits = relationship("Circuit", back_populates="owner", cascade="all, delete-orphan")
    workflows = relationship("Workflow", back_populates="owner", cascade="all, delete-orphan")
    otp_records = relationship("OTPRecord", back_populates="user", cascade="all, delete-orphan")


class OTPRecord(Base):
    __tablename__ = "otp_records"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    otp_hash = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="otp_records")


class Circuit(Base):
    __tablename__ = "circuits"

    id = Column(String, primary_key=True, default=gen_uuid)
    owner_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    circuit_data = Column(JSON, default=dict)  # Gates, qubits, connections
    code = Column(Text, nullable=True)          # Qiskit Python code
    num_qubits = Column(Integer, default=2)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    owner = relationship("User", back_populates="circuits")
    simulations = relationship("Simulation", back_populates="circuit", cascade="all, delete-orphan")


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(String, primary_key=True, default=gen_uuid)
    circuit_id = Column(String, ForeignKey("circuits.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, default="pending")  # pending, running, completed, failed
    shots = Column(Integer, default=1024)
    backend = Column(String, default="statevector_simulator")
    results = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    runtime_ms = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    circuit = relationship("Circuit", back_populates="simulations")


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True, default=gen_uuid)
    owner_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    nodes = Column(JSON, default=list)
    edges = Column(JSON, default=list)
    status = Column(String, default="draft")  # draft, active, archived
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    owner = relationship("User", back_populates="workflows")
    executions = relationship("WorkflowExecution", back_populates="workflow", cascade="all, delete-orphan")


class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"

    id = Column(String, primary_key=True, default=gen_uuid)
    workflow_id = Column(String, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, default="pending")
    logs = Column(JSON, default=list)
    results = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), default=utcnow)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    workflow = relationship("Workflow", back_populates="executions")


class PQCScan(Base):
    __tablename__ = "pqc_scans"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name = Column(String, nullable=False)
    scan_type = Column(String, default="config")
    status = Column(String, default="pending")
    risk_score = Column(Float, nullable=True)
    findings = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    input_data = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    completed_at = Column(DateTime(timezone=True), nullable=True)
