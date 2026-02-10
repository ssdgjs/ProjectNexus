from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import datetime
from app.db.session import get_db
from app.schemas import ModuleCreate, ModuleUpdate, ModuleResponse
from app.models import Module, ModuleAssignee, User, Project, Delivery, Review
from app.core.deps import get_current_user, get_current_commander

router = APIRouter()


@router.post("/check-timeouts")
async def check_timeouts(
    current_user: User = Depends(get_current_commander),
    db: AsyncSession = Depends(get_db)
):
    """检查并更新所有超时模块（仅指挥官）"""
    now = datetime.utcnow()

    # 查找所有有截止日期且未完成的模块
    result = await db.execute(
        select(Module).where(
            Module.deadline.isnot(None),
            Module.status.in_(["open", "in_progress"]),
            Module.is_timeout == False
        )
    )
    modules = result.scalars().all()

    timeout_count = 0
    for module in modules:
        if module.deadline and module.deadline < now:
            module.is_timeout = True
            timeout_count += 1

    await db.commit()

    return {"message": f"检查完成，发现 {timeout_count} 个超时模块"}


@router.post("/", response_model=ModuleResponse, status_code=status.HTTP_201_CREATED)
async def create_module(
    module_data: ModuleCreate,
    current_user: User = Depends(get_current_commander),
    db: AsyncSession = Depends(get_db)
):
    """创建模块（仅指挥官）"""
    new_module = Module(
        title=module_data.title,
        description=module_data.description,
        project_id=module_data.project_id,
        creator_id=current_user.id,
        deadline=module_data.deadline,
        bounty=module_data.bounty,
        status="open"
    )

    db.add(new_module)
    await db.commit()
    await db.refresh(new_module)

    return await _get_module_response(new_module, db)


@router.get("/", response_model=List[ModuleResponse])
async def list_modules(
    skip: int = 0,
    limit: int = 100,
    project_id: int = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取模块列表"""
    query = select(Module)

    if project_id:
        query = query.where(Module.project_id == project_id)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    modules = result.scalars().all()

    responses = []
    for module in modules:
        response = await _get_module_response(module, db)
        responses.append(response)

    return responses


@router.get("/{module_id}", response_model=ModuleResponse)
async def get_module(
    module_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取模块详情"""
    result = await db.execute(select(Module).where(Module.id == module_id))
    module = result.scalar_one_or_none()

    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模块不存在"
        )

    return await _get_module_response(module, db)


async def _get_module_response(module: Module, db: AsyncSession) -> ModuleResponse:
    """构建完整的模块响应"""
    # Get project name
    project_result = await db.execute(select(Project).where(Project.id == module.project_id))
    project = project_result.scalar_one_or_none()

    # Get creator name
    creator_result = await db.execute(select(User).where(User.id == module.creator_id))
    creator = creator_result.scalar_one_or_none()

    # Get assignees
    assignees_result = await db.execute(
        select(ModuleAssignee, User)
        .join(User, ModuleAssignee.user_id == User.id)
        .where(ModuleAssignee.module_id == module.id)
    )
    assignees_data = assignees_result.all()

    # Get deliveries with reviews
    deliveries_result = await db.execute(
        select(Delivery, Review, User)
        .outerjoin(Review, Delivery.id == Review.delivery_id)
        .join(User, Delivery.assignee_id == User.id)
        .where(Delivery.module_id == module.id)
    )
    deliveries_data = deliveries_result.all()

    from app.schemas.module import ModuleAssigneeInfo, DeliveryInfo

    assignees = [
        ModuleAssigneeInfo(
            id=assignee.id,
            user_id=assignee.user_id,
            username=user.username,
            role=user.role,
            score_share=assignee.score_share
        )
        for assignee, user in assignees_data
    ]

    deliveries = [
        DeliveryInfo(
            id=delivery.id,
            content=delivery.content,
            submitter_name=user.username,
            review_decision=review.decision if review else None,
            created_at=delivery.submitted_at
        )
        for delivery, review, user in deliveries_data
    ]

    return ModuleResponse(
        id=module.id,
        project_id=module.project_id,
        project_name=project.name if project else None,
        creator_id=module.creator_id,
        creator_name=creator.username if creator else None,
        status=module.status,
        is_timeout=module.is_timeout,
        created_at=module.created_at,
        updated_at=module.updated_at,
        title=module.title,
        description=module.description,
        deadline=module.deadline,
        bounty=module.bounty,
        assignees=assignees,
        deliveries=deliveries
    )


@router.post("/{module_id}/assign", status_code=status.HTTP_201_CREATED)
async def assign_module(
    module_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """承接模块（抢单）"""
    # 检查模块是否存在
    result = await db.execute(select(Module).where(Module.id == module_id))
    module = result.scalar_one_or_none()

    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模块不存在"
        )

    if module.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="模块不可承接"
        )

    # 检查用户并发任务限制（最多3个）
    if current_user.concurrent_task_count >= 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="已达到最大并发任务数（3个）"
        )

    # 检查是否已承接该模块
    existing_assign = await db.execute(
        select(ModuleAssignee).where(
            ModuleAssignee.module_id == module_id,
            ModuleAssignee.user_id == current_user.id
        )
    )
    if existing_assign.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="已承接该模块"
        )

    # 检查模块人数限制（最多5人）
    assignee_count = await db.execute(
        select(func.count(ModuleAssignee.id)).where(ModuleAssignee.module_id == module_id)
    )
    if assignee_count.scalar() >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="模块承接人数已满（最多5人）"
        )

    # 创建承接记录
    new_assign = ModuleAssignee(
        module_id=module_id,
        user_id=current_user.id
    )

    # 更新用户任务计数
    current_user.concurrent_task_count += 1

    # 注意：不在承接时改变模块状态，允许多人承接（最多5人）
    # 模块状态由指挥官手动控制或通过验收流程改变

    db.add(new_assign)

    # 发送通知给指挥官
    from app.models.notification import Notification, NotificationType
    # 查找所有指挥官
    commanders_result = await db.execute(
        select(User).where(func.lower(User.role) == "commander")
    )
    commanders = commanders_result.scalars().all()

    for commander in commanders:
        notification = Notification(
            recipient_id=commander.id,
            type=NotificationType.MODULE_ASSIGNED,
            title=f"任务已被承接",
            content=f"节点「{current_user.username}」已承接任务「{module.title}」",
            related_module_id=module_id
        )
        db.add(notification)

    await db.commit()

    return {"message": "承接成功"}


@router.put("/{module_id}", response_model=ModuleResponse)
async def update_module(
    module_id: int,
    module_data: ModuleUpdate,
    current_user: User = Depends(get_current_commander),
    db: AsyncSession = Depends(get_db)
):
    """更新模块（仅指挥官）"""
    result = await db.execute(select(Module).where(Module.id == module_id))
    module = result.scalar_one_or_none()

    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模块不存在"
        )

    # Update fields
    if module_data.title is not None:
        module.title = module_data.title
    if module_data.description is not None:
        module.description = module_data.description
    if module_data.deadline is not None:
        module.deadline = module_data.deadline
    if module_data.bounty is not None:
        module.bounty = module_data.bounty
    if module_data.status is not None:
        module.status = module_data.status

    await db.commit()
    await db.refresh(module)

    return await _get_module_response(module, db)
