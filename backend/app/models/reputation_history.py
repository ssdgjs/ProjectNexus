from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base


class ReputationHistory(Base):
    __tablename__ = "reputation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score_change = Column(Float, nullable=False)  # 变化值（可为负）
    reason = Column(Text, nullable=True)  # 变化原因
    related_module_id = Column(Integer, ForeignKey("modules.id"), nullable=True)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="reputation_history")
