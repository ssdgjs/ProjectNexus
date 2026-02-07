from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum, Boolean, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base


class ModuleStatus(str, enum.Enum):
    DRAFT = "draft"  # 草稿
    OPEN = "open"  # 已发布，可承接
    IN_PROGRESS = "in_progress"  # 进行中
    REVIEW = "review"  # 验收中
    COMPLETED = "completed"  # 已完成
    CLOSED = "closed"  # 已关闭
    TIMEOUT = "timeout"  # 已超时


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(ModuleStatus), default=ModuleStatus.DRAFT, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    deadline = Column(DateTime(timezone=True), nullable=True)
    bounty = Column(Float, nullable=True)  # 赏金/分数
    is_timeout = Column(Boolean, default=False, nullable=False)  # 是否超时
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="modules")
    assignees = relationship("ModuleAssignee", back_populates="module", cascade="all, delete-orphan")
    deliveries = relationship("Delivery", back_populates="module", cascade="all, delete-orphan")
    knowledge_links = relationship("KnowledgeLink", back_populates="module", cascade="all, delete-orphan")
    abandon_requests = relationship("ModuleAbandonRequest", back_populates="module", cascade="all, delete-orphan")
