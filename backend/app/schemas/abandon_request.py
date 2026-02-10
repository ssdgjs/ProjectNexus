from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AbandonRequestCreate(BaseModel):
    module_id: int = Field(..., description="模块ID")
    reason: str = Field(..., min_length=10, max_length=500, description="放弃原因")


class AbandonRequestReview(BaseModel):
    approve: bool = Field(..., description="是否批准")
    reviewer_comment: Optional[str] = Field(None, max_length=500, description="审批意见")


class AbandonRequestResponse(BaseModel):
    id: int
    module_id: int
    user_id: int
    user_name: str
    reason: str
    status: str
    reviewer_comment: Optional[str]
    created_at: datetime
    module_title: Optional[str] = None

    class Config:
        from_attributes = True
