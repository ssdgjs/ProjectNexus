from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base


class NotificationType(str, enum.Enum):
    MODULE_PUBLISHED = "module_published"  # 新模块发布
    MODULE_ASSIGNED = "module_assigned"  # 模块被承接
    DELIVERY_SUBMITTED = "delivery_submitted"  # 交付物提交
    REVIEW_RESULT = "review_result"  # 验收结果
    MODULE_CLOSED = "module_closed"  # 模块关闭
    MODULE_TIMEOUT = "module_timeout"  # 模块超时
    ABANDON_REQUEST = "abandon_request"  # 放弃任务申请
    REPUTATION_CHANGE = "reputation_change"  # 信誉分变化
    KNOWLEDGE_UPLOADED = "knowledge_uploaded"  # 新知识上传


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(SQLEnum(NotificationType), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    related_module_id = Column(Integer, ForeignKey("modules.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    recipient = relationship("User", back_populates="received_notifications")
