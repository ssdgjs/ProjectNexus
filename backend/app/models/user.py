from sqlalchemy import Column, Integer, String, DateTime, Enum, Text, Float, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base


class UserRole(str, enum.Enum):
    COMMANDER = "commander"  # 指挥官
    NODE = "node"  # 节点


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.NODE)
    reputation_score = Column(Float, default=100.0, nullable=False)
    concurrent_task_count = Column(Integer, default=0, nullable=False)  # 当前任务计数
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    created_projects = relationship("Project", back_populates="creator", foreign_keys="Project.creator_id")
    module_assignments = relationship("ModuleAssignee", back_populates="user")
    deliveries = relationship("Delivery", back_populates="submitter")
    reviews = relationship("Review", back_populates="reviewer")
    knowledge_items = relationship("KnowledgeItem", back_populates="uploader")
    reputation_history = relationship("ReputationHistory", back_populates="user")
    agent_calls = relationship("AgentCall", back_populates="caller")
    received_notifications = relationship("Notification", back_populates="recipient")
    abandon_requests = relationship("ModuleAbandonRequest", back_populates="requester")
