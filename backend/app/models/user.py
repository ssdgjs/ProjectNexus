from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="node")
    reputation_score = Column(Float, default=100.0, nullable=False)
    concurrent_task_count = Column(Integer, default=0, nullable=False)  # 当前任务计数
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    created_projects = relationship("Project", back_populates="creator", foreign_keys="Project.creator_id")
    created_modules = relationship("Module", back_populates="creator", foreign_keys="Module.creator_id")
    module_assignments = relationship("ModuleAssignee", back_populates="user")
    deliveries = relationship("Delivery", back_populates="assignee")
    reviews = relationship("Review", back_populates="reviewer")
    knowledge_items = relationship("KnowledgeItem", back_populates="uploader")
    reputation_history = relationship("ReputationHistory", back_populates="user")
    agent_calls = relationship("AgentCall", back_populates="caller")
    received_notifications = relationship("Notification", back_populates="recipient")
    abandon_requests = relationship("ModuleAbandonRequest", back_populates="requester")
