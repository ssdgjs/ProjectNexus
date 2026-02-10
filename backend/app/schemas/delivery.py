from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class AttachmentItem(BaseModel):
    name: str = Field(..., description="附件名称")
    url: str = Field(..., description="附件链接")


class DeliveryBase(BaseModel):
    content: str
    attachments: Optional[List[AttachmentItem]] = Field(default_factory=list, description="附件列表")


class DeliveryCreate(DeliveryBase):
    module_id: int


class DeliveryResponse(DeliveryBase):
    id: int
    module_id: int
    assignee_id: int
    submitted_at: datetime
    attachments: List[AttachmentItem] = Field(default_factory=list)

    class Config:
        from_attributes = True
