from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base


class KnowledgeLink(Base):
    __tablename__ = "knowledge_links"

    id = Column(Integer, primary_key=True, index=True)
    knowledge_item_id = Column(Integer, ForeignKey("knowledge_items.id"), nullable=False)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    linked_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    knowledge_item = relationship("KnowledgeItem", back_populates="links")
    module = relationship("Module", back_populates="knowledge_links")
