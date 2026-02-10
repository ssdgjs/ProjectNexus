from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from pydantic import BaseModel
from app.db.session import get_db
from app.schemas import ReviewCreate, ReviewResponse
from app.models import Review, Delivery, Module, ModuleAssignee, User, ReputationHistory
from app.core.deps import get_current_commander

router = APIRouter()


class ScoreAllocation(BaseModel):
    assignee_id: int
    score: float


class ReviewWithScores(BaseModel):
    delivery_id: int
    decision: str
    feedback: str | None = None
    reputation_change: int | None = None
    score_allocations: List[ScoreAllocation] = []


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_commander),
    db: AsyncSession = Depends(get_db)
):
    """指挥官验收交付（简单版本）"""
    # 检查交付是否存在
    delivery_result = await db.execute(select(Delivery).where(Delivery.id == review_data.delivery_id))
    delivery = delivery_result.scalar_one_or_none()

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="交付不存在"
        )

    # 检查是否已验收过
    existing_review = await db.execute(
        select(Review).where(Review.delivery_id == review_data.delivery_id)
    )
    if existing_review.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该交付已验收过"
        )

    # 获取模块信息
    module_result = await db.execute(select(Module).where(Module.id == delivery.module_id))
    module = module_result.scalar_one_or_none()

    # 获取承接人信息
    assignee_result = await db.execute(
        select(ModuleAssignee).where(
            ModuleAssignee.module_id == delivery.module_id,
            ModuleAssignee.user_id == delivery.assignee_id
        )
    )
    assignee = assignee_result.scalar_one_or_none()

    if not assignee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="未找到承接记录"
        )

    # 创建验收记录
    new_review = Review(
        delivery_id=review_data.delivery_id,
        reviewer_id=current_user.id,
        decision=review_data.decision,
        feedback=review_data.feedback,
        reputation_change=review_data.reputation_change
    )

    # 更新交付状态
    if review_data.decision == "pass":
        delivery.status = "accepted"
        # 分配分数
        if review_data.reputation_change:
            assignee.allocated_score = review_data.reputation_change

        # 更新模块状态
        if module.status != "completed":
            module.status = "completed"

        # 释放承接人的任务槽位
        # 需要重新查询user对象以避免lazy loading问题
        user_result = await db.execute(select(User).where(User.id == assignee.user_id))
        assignee_user = user_result.scalar_one_or_none()
        if assignee_user:
            assignee_user.concurrent_task_count = max(0, assignee_user.concurrent_task_count - 1)
            # 更新信誉分
            assignee_user.reputation_score += review_data.reputation_change

            # 记录信誉变化历史
            reputation_history = ReputationHistory(
                user_id=assignee.user_id,
                score_change=review_data.reputation_change,
                reason=f"完成模块: {module.title}",
                related_module_id=module.id
            )
            db.add(reputation_history)

    elif review_data.decision == "reject":
        delivery.status = "rejected"
        # 不释放任务槽位，承接人需要修改后重新提交

    elif review_data.decision == "close":
        delivery.status = "closed"
        # 关闭任务，释放槽位，但不改变信誉分
        if assignee.user:
            assignee.user.concurrent_task_count = max(0, assignee.user.concurrent_task_count - 1)

    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)

    return ReviewResponse.model_validate(new_review)


@router.post("/with-scores", status_code=status.HTTP_201_CREATED)
async def create_review_with_scores(
    review_data: ReviewWithScores,
    current_user: User = Depends(get_current_commander),
    db: AsyncSession = Depends(get_db)
):
    """指挥官验收交付并分配分数（多人协作版本）"""
    # 检查交付是否存在
    delivery_result = await db.execute(select(Delivery).where(Delivery.id == review_data.delivery_id))
    delivery = delivery_result.scalar_one_or_none()

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="交付不存在"
        )

    # 检查是否已验收过
    existing_review = await db.execute(
        select(Review).where(Review.delivery_id == review_data.delivery_id)
    )
    if existing_review.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该交付已验收过"
        )

    # 获取模块信息
    module_result = await db.execute(select(Module).where(Module.id == delivery.module_id))
    module = module_result.scalar_one_or_none()

    # 获取所有承接人
    assignees_result = await db.execute(
        select(ModuleAssignee).where(ModuleAssignee.module_id == delivery.module_id)
    )
    assignees = assignees_result.scalars().all()

    if not assignees:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="未找到承接记录"
        )

    # 创建验收记录
    new_review = Review(
        delivery_id=review_data.delivery_id,
        reviewer_id=current_user.id,
        decision=review_data.decision,
        feedback=review_data.feedback,
        reputation_change=review_data.reputation_change
    )

    # 更新交付状态
    if review_data.decision == "pass":
        delivery.status = "accepted"

        # 分配分数给各承接人
        total_allocated = 0
        for allocation in review_data.score_allocations:
            assignee = next((a for a in assignees if a.id == allocation.assignee_id), None)
            if assignee:
                assignee.allocated_score = allocation.score
                total_allocated += allocation.score

                # 更新用户信誉分
                if assignee.user:
                    assignee.user.reputation_score += allocation.score

                    # 记录信誉变化历史
                    reputation_history = ReputationHistory(
                        user_id=assignee.user_id,
                        change=allocation.score,
                        reason=f"完成模块: {module.title}",
                        reviewer_id=current_user.id
                    )
                    db.add(reputation_history)

        # 更新模块状态
        if module.status != "completed":
            module.status = "completed"

        # 释放所有承接人的任务槽位
        for assignee in assignees:
            if assignee.user:
                assignee.user.concurrent_task_count = max(0, assignee.user.concurrent_task_count - 1)

    elif review_data.decision == "reject":
        delivery.status = "rejected"
        # 不释放任务槽位

    elif review_data.decision == "close":
        delivery.status = "closed"
        # 释放所有承接人的任务槽位
        for assignee in assignees:
            if assignee.user:
                assignee.user.concurrent_task_count = max(0, assignee.user.concurrent_task_count - 1)

    db.add(new_review)
    await db.commit()

    return {"message": "验收成功", "total_allocated": total_allocated if review_data.decision == "pass" else 0}
