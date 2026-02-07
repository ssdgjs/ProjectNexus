from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base


class ModuleAssignee(Base):
    __tablename__ = "module_assignees"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    allocated_score = Column(Float, nullable=True)  # 指挥官分配的分数
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    module = relationship("Module", back_populates="assignees")
    user = relationship("User", back_populates="module_assignments")
