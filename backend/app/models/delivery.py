from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base


class DeliveryStatus(str, enum.Enum):
    PENDING = "pending"  # 待验收
    ACCEPTED = "accepted"  # 已通过
    REJECTED = "rejected"  # 已拒绝
    CANCELLED = "cancelled"  # 已取消


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    submitter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)  # 交付内容说明
    attachment_url = Column(String(500), nullable=True)  # 附件URL
    status = Column(Enum(DeliveryStatus), default=DeliveryStatus.PENDING, nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    module = relationship("Module", back_populates="deliveries")
    submitter = relationship("User", back_populates="deliveries")
    reviews = relationship("Review", back_populates="delivery", cascade="all, delete-orphan")
