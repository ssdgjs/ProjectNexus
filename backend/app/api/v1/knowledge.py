from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.db.session import get_db
from app.models.knowledge_item import KnowledgeItem
from app.models.knowledge_link import KnowledgeLink
from app.models.user import User
from app.schemas.knowledge import KnowledgeCreate, KnowledgeResponse, KnowledgeLink
from app.core.file_storage import save_upload_file, delete_file, format_file_size
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.post("/", response_model=KnowledgeResponse)
async def upload_knowledge(
    title: str = Query(..., description="知识标题"),
    description: Optional[str] = Query(None, description="知识描述"),
    file: UploadFile = File(..., description="知识文件"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    上传知识文件

    支持的文件类型：zip, md, pdf, png, jpg, jpeg, gif, doc, docx, txt
    文件大小限制：≤30MB
    """
    # Validate and save file
    file_path, file_size = await save_upload_file(file, current_user.id)

    # Create knowledge item
    knowledge = KnowledgeItem(
        title=title,
        description=description,
        file_url=file_path,
        file_name=file.filename or "unknown",
        file_size=file_size,
        file_type=file.content_type or "application/octet-stream",
        uploader_id=current_user.id
    )

    db.add(knowledge)
    db.commit()
    db.refresh(knowledge)

    return KnowledgeResponse(
        id=knowledge.id,
        title=knowledge.title,
        description=knowledge.description,
        file_name=knowledge.file_name,
        file_size=knowledge.file_size,
        file_type=knowledge.file_type,
        uploader_id=knowledge.uploader_id,
        uploader_name=current_user.username,
        uploaded_at=knowledge.uploaded_at,
        linked_modules_count=0,
        is_owned=True
    )


@router.get("/", response_model=List[KnowledgeResponse])
async def list_knowledge(
    skip: int = Query(0, ge=0, description="跳过的记录数"),
    limit: int = Query(50, ge=1, le=100, description="返回的记录数"),
    search: Optional[str] = Query(None, description="搜索关键词（标题或描述）"),
    file_type: Optional[str] = Query(None, description="文件类型筛选"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取知识列表

    支持按标题/描述搜索
    支持按文件类型筛选
    """
    query = db.query(KnowledgeItem)

    # Search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (KnowledgeItem.title.ilike(search_term)) |
            (KnowledgeItem.description.ilike(search_term))
        )

    # File type filter
    if file_type:
        query = query.filter(KnowledgeItem.file_type == file_type)

    # Order by upload time (newest first)
    query = query.order_by(KnowledgeItem.uploaded_at.desc())

    # Pagination
    items = query.offset(skip).limit(limit).all()

    # Get linked modules count for each item
    result = []
    for item in items:
        linked_count = db.query(KnowledgeLink).filter(
            KnowledgeLink.knowledge_item_id == item.id
        ).count()

        result.append(KnowledgeResponse(
            id=item.id,
            title=item.title,
            description=item.description,
            file_name=item.file_name,
            file_size=item.file_size,
            file_type=item.file_type,
            uploader_id=item.uploader_id,
            uploader_name=item.uploader.username if item.uploader else None,
            uploaded_at=item.uploaded_at,
            linked_modules_count=linked_count,
            is_owned=item.uploader_id == current_user.id
        ))

    return result


@router.get("/{knowledge_id}", response_model=KnowledgeResponse)
async def get_knowledge(
    knowledge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取知识详情"""
    knowledge = db.query(KnowledgeItem).filter(KnowledgeItem.id == knowledge_id).first()

    if not knowledge:
        raise HTTPException(status_code=404, detail="知识不存在")

    linked_count = db.query(KnowledgeLink).filter(
        KnowledgeLink.knowledge_item_id == knowledge_id
    ).count()

    return KnowledgeResponse(
        id=knowledge.id,
        title=knowledge.title,
        description=knowledge.description,
        file_name=knowledge.file_name,
        file_size=knowledge.file_size,
        file_type=knowledge.file_type,
        uploader_id=knowledge.uploader_id,
        uploader_name=knowledge.uploader.username if knowledge.uploader else None,
        uploaded_at=knowledge.uploaded_at,
        linked_modules_count=linked_count,
        is_owned=knowledge.uploader_id == current_user.id
    )


@router.delete("/{knowledge_id}")
async def delete_knowledge(
    knowledge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    删除知识

    权限：上传者本人或指挥官
    """
    knowledge = db.query(KnowledgeItem).filter(KnowledgeItem.id == knowledge_id).first()

    if not knowledge:
        raise HTTPException(status_code=404, detail="知识不存在")

    # Check permission
    if knowledge.uploader_id != current_user.id and current_user.role != 'commander':
        raise HTTPException(status_code=403, detail="无权删除此知识")

    # Delete file from disk
    delete_file(knowledge.file_url)

    # Delete from database (cascade will delete links)
    db.delete(knowledge)
    db.commit()

    return {"message": "知识已删除"}


@router.post("/{knowledge_id}/link")
async def link_knowledge_to_module(
    knowledge_id: int,
    link_data: KnowledgeLink,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    关联知识到任务

    任何用户都可以将知识关联到任务
    """
    # Verify knowledge exists
    knowledge = db.query(KnowledgeItem).filter(KnowledgeItem.id == knowledge_id).first()
    if not knowledge:
        raise HTTPException(status_code=404, detail="知识不存在")

    # Verify module exists
    from app.models.module import Module
    module = db.query(Module).filter(Module.id == link_data.module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="任务不存在")

    # Check if link already exists
    existing_link = db.query(KnowledgeLink).filter(
        KnowledgeLink.knowledge_item_id == knowledge_id,
        KnowledgeLink.module_id == link_data.module_id
    ).first()

    if existing_link:
        raise HTTPException(status_code=400, detail="知识已关联到此任务")

    # Create link
    new_link = KnowledgeLink(
        knowledge_item_id=knowledge_id,
        module_id=link_data.module_id
    )

    db.add(new_link)
    db.commit()
    db.refresh(new_link)

    return {"message": "知识已关联到任务"}


@router.delete("/{knowledge_id}/link/{module_id}")
async def unlink_knowledge_from_module(
    knowledge_id: int,
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    解除知识与任务的关联

    任何用户都可以解除关联
    """
    # Verify link exists
    link = db.query(KnowledgeLink).filter(
        KnowledgeLink.knowledge_item_id == knowledge_id,
        KnowledgeLink.module_id == module_id
    ).first()

    if not link:
        raise HTTPException(status_code=404, detail="关联不存在")

    # Delete link
    db.delete(link)
    db.commit()

    return {"message": "关联已解除"}


@router.get("/{knowledge_id}/modules", response_model=List[dict])
async def get_knowledge_linked_modules(
    knowledge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取知识关联的所有任务"""
    # Verify knowledge exists
    knowledge = db.query(KnowledgeItem).filter(KnowledgeItem.id == knowledge_id).first()
    if not knowledge:
        raise HTTPException(status_code=404, detail="知识不存在")

    # Get links
    links = db.query(KnowledgeLink).filter(
        KnowledgeLink.knowledge_item_id == knowledge_id
    ).all()

    # Get modules
    from app.models.module import Module
    result = []
    for link in links:
        if link.module:
            result.append({
                "id": link.module.id,
                "title": link.module.title,
                "status": link.module.status,
                "linked_at": link.linked_at
            })

    return result


@router.get("/module/{module_id}", response_model=List[KnowledgeResponse])
async def get_module_knowledge(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取任务关联的所有知识"""
    # Verify module exists
    from app.models.module import Module
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="任务不存在")

    # Get links
    links = db.query(KnowledgeLink).filter(
        KnowledgeLink.module_id == module_id
    ).all()

    # Get knowledge items
    result = []
    for link in links:
        if link.knowledge_item:
            item = link.knowledge_item
            result.append(KnowledgeResponse(
                id=item.id,
                title=item.title,
                description=item.description,
                file_name=item.file_name,
                file_size=item.file_size,
                file_type=item.file_type,
                uploader_id=item.uploader_id,
                uploader_name=item.uploader.username if item.uploader else None,
                uploaded_at=item.uploaded_at,
                linked_modules_count=db.query(KnowledgeLink).filter(
                    KnowledgeLink.knowledge_item_id == item.id
                ).count(),
                is_owned=item.uploader_id == current_user.id
            ))

    return result
