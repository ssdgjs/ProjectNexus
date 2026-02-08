from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ModuleAssigneeInfo(BaseModel):
    id: int
    user_id: int
    username: str
    role: str
    allocated_score: Optional[float] = None

    class Config:
        from_attributes = True


class DeliveryInfo(BaseModel):
    id: int
    content: Optional[str] = None
    submitter_name: str
    review_decision: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ModuleBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    description: str = Field(..., min_length=1)
    deadline: Optional[datetime] = None
    bounty: Optional[float] = None


class ModuleCreate(ModuleBase):
    project_id: int


class ModuleUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    bounty: Optional[float] = None
    status: Optional[str] = None


class ModuleResponse(BaseModel):
    id: int
    project_id: int
    project_name: Optional[str] = None
    status: str
    is_timeout: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    title: str
    description: str
    deadline: Optional[datetime] = None
    bounty: Optional[float] = None
    assignees: List[ModuleAssigneeInfo] = []
    deliveries: List[DeliveryInfo] = []

    class Config:
        from_attributes = True


class ModuleAssignRequest(BaseModel):
    pass  # Empty for grabbing tasks


class ModuleAssigneeResponse(BaseModel):
    id: int
    user_id: int
    allocated_score: Optional[float] = None

    class Config:
        from_attributes = True
