from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base


class AgentCall(Base):
    __tablename__ = "agent_calls"

    id = Column(Integer, primary_key=True, index=True)
    caller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    agent_name = Column(String(100), nullable=False)  # 智能体名称
    call_time = Column(DateTime(timezone=True), server_default=func.now())
    call_count = Column(Integer, default=1, nullable=False)  # 调用次数

    # Relationships
    caller = relationship("User", back_populates="agent_calls")
