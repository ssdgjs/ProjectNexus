from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List

from app.db.session import get_db
from app.schemas.abandon_request import AbandonRequestCreate, AbandonRequestReview, AbandonRequestResponse
from app.models.abandon_request import ModuleAbandonRequest, AbandonRequestStatus
from app.models.user import User
from app.models.module import Module, ModuleStatus
from app.core.deps import get_current_user, get_current_commander
from app.models.module_assignee import ModuleAssignee

router = APIRouter()


@router.post("/", response_model=AbandonRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_abandon_request(
    request_data: AbandonRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """节点申请放弃任务"""
    # 检查模块是否存在
    result = await db.execute(select(Module).where(Module.id == request_data.module_id))
    module = result.scalar_one_or_none()

    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模块不存在"
        )

    # 检查用户是否已承接该模块
    assignee_result = await db.execute(
        select(ModuleAssignee).where(
            ModuleAssignee.module_id == request_data.module_id,
            ModuleAssignee.user_id == current_user.id
        )
    )
    assignee = assignee_result.scalar_one_or_none()

    if not assignee:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您未承接此模块，无法申请放弃"
        )

    # 检查是否已有待审批的申请
    existing_result = await db.execute(
        select(ModuleAbandonRequest).where(
            ModuleAbandonRequest.module_id == request_data.module_id,
            ModuleAbandonRequest.requester_id == current_user.id,
            ModuleAbandonRequest.status == AbandonRequestStatus.PENDING
        )
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="您已有待审批的放弃申请，请等待指挥官处理"
        )

    # 创建放弃申请
    new_request = ModuleAbandonRequest(
        module_id=request_data.module_id,
        requester_id=current_user.id,
        reason=request_data.reason,
        status=AbandonRequestStatus.PENDING
    )

    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)

    # 手动构建响应
    return AbandonRequestResponse(
        id=new_request.id,
        module_id=new_request.module_id,
        requester_id=new_request.requester_id,
        requester_name=current_user.username,
        reason=new_request.reason,
        status=new_request.status.value,
        review_comment=new_request.review_comment,
        created_at=new_request.created_at,
        module_title=module.title
    )


@router.get("/", response_model=List[AbandonRequestResponse])
async def list_abandon_requests(
    status: AbandonRequestStatus = None,
    current_user: User = Depends(get_current_commander),
    db: AsyncSession = Depends(get_db)
):
    """指挥官查看所有放弃申请"""
    # 构建查询
    query = select(ModuleAbandonRequest, Module.title).join(
        Module, ModuleAbandonRequest.module_id == Module.id
    )

    if status:
        query = query.where(ModuleAbandonRequest.status == status)

    result = await db.execute(query.order_by(ModuleAbandonRequest.created_at.desc()))
    rows = result.all()

    # 手动构建响应
    responses = []
    for row in rows:
        abandon_request, module_title = row
        responses.append(AbandonRequestResponse(
            id=abandon_request.id,
            module_id=abandon_request.module_id,
            requester_id=abandon_request.requester_id,
            requester_name=abandon_request.requester.username,
            reason=abandon_request.reason,
            status=abandon_request.status.value,
            review_comment=abandon_request.review_comment,
            created_at=abandon_request.created_at,
            module_title=module_title
        ))

    return responses


@router.post("/{request_id}/review", response_model=AbandonRequestResponse)
async def review_abandon_request(
    request_id: int,
    review_data: AbandonRequestReview,
    current_user: User = Depends(get_current_commander),
    db: AsyncSession = Depends(get_db)
):
    """指挥官审批放弃申请"""
    # 获取放弃请求
    result = await db.execute(
        select(ModuleAbandonRequest).where(ModuleAbandonRequest.id == request_id)
    )
    abandon_request = result.scalar_one_or_none()

    if not abandon_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="放弃申请不存在"
        )

    if abandon_request.status != AbandonRequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"该申请已被{abandon_request.status.value}，无法再次审批"
        )

    # 获取模块和申请人信息
    module_result = await db.execute(select(Module).where(Module.id == abandon_request.module_id))
    module = module_result.scalar_one_or_none()

    # 更新申请状态
    abandon_request.status = AbandonRequestStatus.APPROVED if review_data.approve else AbandonRequestStatus.REJECTED
    abandon_request.review_comment = review_data.comment

    if review_data.approve:
        # 批准：释放任务槽位
        await db.execute(
            update(ModuleAssignee)
            .where(
                ModuleAssignee.module_id == abandon_request.module_id,
                ModuleAssignee.user_id == abandon_request.requester_id
            )
            .values(deleted_at=datetime.utcnow())
        )

        # 检查是否还有其他承接人
        remaining_result = await db.execute(
            select(ModuleAssignee).where(
                ModuleAssignee.module_id == abandon_request.module_id
            )
        )
        remaining_assignees = remaining_result.scalars().all()

        if not remaining_assignees:
            # 如果没有其他承接人，将模块状态改回open
            module.status = ModuleStatus.OPEN
        elif module and module.status == ModuleStatus.IN_PROGRESS:
            module.status = ModuleStatus.OPEN

        # 发送通知给申请人
        from app.models.notification import Notification, NotificationType
        notification = Notification(
            recipient_id=abandon_request.requester_id,
            type=NotificationType.ABANDON_APPROVED if review_data.approve else NotificationType.ABANDON_REJECTED,
            title=f"放弃任务{'已批准' if review_data.approve else '被拒绝'}",
            content=f"您对任务「{module.title if module else abandon_request.module_id}」的放弃申请已被{review_data.comment or '批准'}" if review_data.comment else f"您对任务「{module.title if module else abandon_request.module_id}」的放弃申请已被批准",
            related_module_id=abandon_request.module_id
        )
        db.add(notification)

    else:
        # 拒绝：只更新状态和评论
        # 发送通知给申请人
        from app.models.notification import Notification, NotificationType
        notification = Notification(
            recipient_id=abandon_request.requester_id,
            type=NotificationType.ABANDON_REJECTED,
            title=f"放弃任务被拒绝",
            content=f"您对任务「{module.title if module else abandon_request.module_id}」的放弃申请已被拒绝。{review_data.comment or ''}",
            related_module_id=abandon_request.module_id
        )
        db.add(notification)

    await db.commit()
    await db.refresh(abandon_request)

    # 手动构建响应
    return AbandonRequestResponse(
        id=abandon_request.id,
        module_id=abandon_request.module_id,
        requester_id=abandon_request.requester_id,
        requester_name=abandon_request.requester.username,
        reason=abandon_request.reason,
        status=abandon_request.status.value,
        review_comment=abandon_request.review_comment,
        created_at=abandon_request.created_at,
        module_title=module.title if module else None
    )
