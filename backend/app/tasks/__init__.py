"""
后台定时任务：自动检测超时模块
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import Optional
import logging

from app.db.session import AsyncSessionLocal
from app.models.module import Module
from app.models.notification import Notification, NotificationType
from app.models.user import User

logger = logging.getLogger(__name__)

# 全局调度器实例
scheduler = AsyncIOScheduler()


async def check_module_timeouts():
    """检测超时模块并发送通知"""
    async with AsyncSessionLocal() as db:
        try:
            # 查找所有超时但未标记的模块
            # 条件: deadline < now, is_timeout = False, status in (open, in_progress)
            now = datetime.utcnow()
            result = await db.execute(
                select(Module).where(
                    Module.deadline < now,
                    Module.is_timeout == False,
                    Module.status.in_(['open', 'in_progress'])
                )
            )
            timeout_modules = result.scalars().all()

            if not timeout_modules:
                logger.info("No timeout modules found")
                return

            logger.info(f"Found {len(timeout_modules)} timeout modules")

            for module in timeout_modules:
                # 标记为超时
                module.is_timeout = True

                # 发送通知给所有承接人
                assignees_result = await db.execute(
                    select(User).join(Module.assignees).where(Module.id == module.id)
                )
                assignees = assignees_result.scalars().all()

                for assignee in assignees:
                    # 创建超时通知
                    notification = Notification(
                        recipient_id=assignee.id,
                        type=NotificationType.TIMEOUT,
                        title=f'任务超时提醒',
                        content=f'您承接的任务「{module.title}」已超时，请尽快完成或申请放弃。',
                        related_module_id=module.id
                    )
                    db.add(notification)

                # 发送通知给指挥官（所有指挥官）
                commanders_result = await db.execute(
                    select(User).where(User.role == 'commander')
                )
                commanders = commanders_result.scalars().all()

                for commander in commanders:
                    notification = Notification(
                        recipient_id=commander.id,
                        type=NotificationType.TIMEOUT,
                        title=f'任务超时提醒',
                        content=f'模块「{module.title}」已超时，当前有 {len(assignees)} 名承接人。',
                        related_module_id=module.id
                    )
                    db.add(notification)

            await db.commit()
            logger.info(f"Successfully processed {len(timeout_modules)} timeout modules")

        except Exception as e:
            logger.error(f"Error checking timeouts: {e}")
            await db.rollback()


async def start_scheduler():
    """启动定时任务调度器"""
    try:
        # 每小时检查一次超时
        scheduler.add_job(
            check_module_timeouts,
            'interval',
            hours=1,
            id='check_module_timeouts'
        )
        scheduler.start()
        logger.info("Timeout checker scheduler started successfully")
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")


async def stop_scheduler():
    """停止定时任务调度器"""
    try:
        scheduler.shutdown()
        logger.info("Timeout checker scheduler stopped successfully")
    except Exception as e:
        logger.error(f"Failed to stop scheduler: {e}")
