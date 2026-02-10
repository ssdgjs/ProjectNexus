from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class KnowledgeBase(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    file_name: str
    file_size: int
    file_type: str
    uploader_id: int
    uploader_name: Optional[str] = None
    created_at: datetime


class KnowledgeCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="知识标题")
    description: Optional[str] = Field(None, max_length=1000, description="知识描述")


class KnowledgeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)


class KnowledgeLink(BaseModel):
    module_id: int = Field(..., description="要关联的任务ID")


class KnowledgeResponse(KnowledgeBase):
    linked_modules_count: int = 0
    is_owned: bool = False  # 是否为当前用户上传

    class Config:
        from_attributes = True
