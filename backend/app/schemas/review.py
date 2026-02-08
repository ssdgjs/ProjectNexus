from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReviewBase(BaseModel):
    decision: str  # pass, reject, close
    feedback: Optional[str] = None
    reputation_change: Optional[int] = None


class ReviewCreate(ReviewBase):
    delivery_id: int


class ReviewResponse(ReviewBase):
    id: int
    delivery_id: int
    reviewer_id: int
    reviewed_at: datetime

    class Config:
        from_attributes = True
