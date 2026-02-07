from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


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


class ModuleResponse(ModuleBase):
    id: int
    project_id: int
    status: str
    is_timeout: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

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
