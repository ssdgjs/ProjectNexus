from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.db.session import get_db
from app.schemas import DeliveryCreate, DeliveryResponse
from app.models import Delivery, Module, ModuleAssignee, User
from app.core.deps import get_current_user, get_current_commander

router = APIRouter()


@router.post("/", response_model=DeliveryResponse, status_code=status.HTTP_201_CREATED)
async def submit_delivery(
    delivery_data: DeliveryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """提交交付（仅承接人）"""
    # 检查模块是否存在
    result = await db.execute(select(Module).where(Module.id == delivery_data.module_id))
    module = result.scalar_one_or_none()

    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模块不存在"
        )

    # 检查用户是否已承接该模块
    assignee_result = await db.execute(
        select(ModuleAssignee).where(
            ModuleAssignee.module_id == delivery_data.module_id,
            ModuleAssignee.user_id == current_user.id
        )
    )
    assignee = assignee_result.scalar_one_or_none()

    if not assignee:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您未承接此模块"
        )

    # 检查是否已提交过交付
    existing_delivery = await db.execute(
        select(Delivery).where(
            Delivery.module_id == delivery_data.module_id,
            Delivery.submitter_id == current_user.id
        )
    )
    if existing_delivery.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="您已提交过此模块的交付"
        )

    # 创建交付记录
    # 转换 Pydantic 模型为字典以便 JSON 序列化
    attachments_data = None
    if delivery_data.attachments:
        attachments_data = [
            {"name": item.name, "url": item.url}
            for item in delivery_data.attachments
        ]

    new_delivery = Delivery(
        module_id=delivery_data.module_id,
        submitter_id=current_user.id,
        content=delivery_data.content,
        attachment_url=delivery_data.attachment_url,
        attachments=attachments_data,
        status="pending"
    )

    db.add(new_delivery)
    await db.commit()
    await db.refresh(new_delivery)

    # 手动构建响应，确保 attachments 字段正确处理
    return DeliveryResponse(
        id=new_delivery.id,
        module_id=new_delivery.module_id,
        submitter_id=new_delivery.submitter_id,
        content=new_delivery.content,
        attachment_url=new_delivery.attachment_url,
        attachments=new_delivery.attachments or [],
        status=new_delivery.status,
        submitted_at=new_delivery.submitted_at
    )


@router.get("/{module_id}", response_model=List[DeliveryResponse])
async def list_deliveries(
    module_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取模块的所有交付"""
    # 检查模块是否存在
    result = await db.execute(select(Module).where(Module.id == module_id))
    module = result.scalar_one_or_none()

    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模块不存在"
        )

    # 获取所有交付
    result = await db.execute(
        select(Delivery).where(Delivery.module_id == module_id)
    )
    deliveries = result.scalars().all()

    return [
        DeliveryResponse(
            id=d.id,
            module_id=d.module_id,
            submitter_id=d.submitter_id,
            content=d.content,
            attachment_url=d.attachment_url,
            attachments=d.attachments or [],
            status=d.status,
            submitted_at=d.submitted_at
        ) for d in deliveries
    ]


@router.get("/{delivery_id}", response_model=DeliveryResponse)
async def get_delivery(
    delivery_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取交付详情"""
    result = await db.execute(select(Delivery).where(Delivery.id == delivery_id))
    delivery = result.scalar_one_or_none()

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="交付不存在"
        )

    return DeliveryResponse(
        id=delivery.id,
        module_id=delivery.module_id,
        submitter_id=delivery.submitter_id,
        content=delivery.content,
        attachment_url=delivery.attachment_url,
        attachments=delivery.attachments or [],
        status=delivery.status,
        submitted_at=delivery.submitted_at
    )
