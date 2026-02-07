from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from app.db.session import get_db
from app.schemas import ModuleCreate, ModuleUpdate, ModuleResponse, ModuleAssignRequest
from app.models import Module, ModuleAssignee, User
from app.core.deps import get_current_user, get_current_commander

router = APIRouter()


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
        deadline=module_data.deadline,
        bounty=module_data.bounty,
        status="open"
    )

    db.add(new_module)
    await db.commit()
    await db.refresh(new_module)

    return ModuleResponse.model_validate(new_module)


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

    return [ModuleResponse.model_validate(m) for m in modules]


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

    return ModuleResponse.model_validate(module)


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

    # 更新模块状态
    module.status = "in_progress"

    db.add(new_assign)
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

    return ModuleResponse.model_validate(module)
