from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)  # 交付内容说明
    attachments = Column(JSON, nullable=True)  # 多个附件 [{"name": "...", "url": "..."}]
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    module = relationship("Module", back_populates="deliveries")
    assignee = relationship("User", foreign_keys=[assignee_id])
    reviews = relationship("Review", back_populates="delivery", cascade="all, delete-orphan")
