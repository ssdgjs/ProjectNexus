from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DeliveryBase(BaseModel):
    content: str
    attachment_url: Optional[str] = None


class DeliveryCreate(DeliveryBase):
    module_id: int


class DeliveryResponse(DeliveryBase):
    id: int
    module_id: int
    submitter_id: int
    status: str
    submitted_at: datetime

    class Config:
        from_attributes = True
