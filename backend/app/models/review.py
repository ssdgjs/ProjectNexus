from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base


class ReviewDecision(str, enum.Enum):
    PASS = "pass"  # 通过
    REJECT = "reject"  # 拒绝
    CLOSE = "close"  # 关闭


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    delivery_id = Column(Integer, ForeignKey("deliveries.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision = Column(Enum(ReviewDecision), nullable=False)  # pass/reject/close
    feedback = Column(Text, nullable=True)  # 反馈意见
    reputation_change = Column(Integer, nullable=True)  # 信誉分变化
    reviewed_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    delivery = relationship("Delivery", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews")
