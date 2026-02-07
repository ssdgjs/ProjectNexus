"""
数据库初始化脚本
创建默认指挥官账户和测试数据
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import AsyncSessionLocal, engine
from app.models import User, Project, Module
from app.core.security import get_password_hash


async def init_db():
    """初始化数据库"""
    async with engine.begin() as conn:
        # 导入所有模型以确保创建表
        from app.models import Base
        await conn.run_sync(Base.metadata.create_all)


async def create_default_commander():
    """创建默认指挥官账户"""
    async with AsyncSessionLocal() as session:
        # 检查是否已存在指挥官
        result = await session.execute(
            select(User).where(User.username == "commander")
        )
        existing_commander = result.scalar_one_or_none()

        if not existing_commander:
            commander = User(
                username="commander",
                hashed_password=get_password_hash("admin123"),
                role="commander",
                reputation_score=100.0,
                concurrent_task_count=0
            )
            session.add(commander)
            await session.commit()
            print("✓ 默认指挥官账户已创建")
            print("  用户名: commander")
            print("  密码: admin123")
            print("  请在首次登录后修改密码！")
        else:
            print("✓ 指挥官账户已存在")


async def create_sample_data():
    """创建示例数据"""
    async with AsyncSessionLocal() as session:
        # 检查是否已有数据
        result = await session.execute(select(Project))
        existing_projects = result.scalars().all()

        if existing_projects:
            print("✓ 示例数据已存在")
            return

        # 获取指挥官
        result = await session.execute(
            select(User).where(User.username == "commander")
        )
        commander = result.scalar_one()

        # 创建示例项目
        project1 = Project(
            name="AI 智能调度系统",
            description="构建基于 AI 的分布式任务调度系统",
            status="active",
            creator_id=commander.id
        )

        project2 = Project(
            name="知识库管理平台",
            description="企业级知识管理和协作平台",
            status="planning",
            creator_id=commander.id
        )

        session.add(project1)
        session.add(project2)
        await session.flush()  # 获取项目ID

        # 创建示例模块
        module1 = Module(
            title="设计数据库架构",
            description="设计并实现12个核心数据表，包括用户、项目、模块等",
            project_id=project1.id,
            bounty=100.0,
            status="open"
        )

        module2 = Module(
            title="实现 JWT 认证系统",
            description="实现基于 JWT 的用户认证和授权系统",
            project_id=project1.id,
            bounty=80.0,
            status="open"
        )

        module3 = Module(
            title="前端 UI 组件库",
            description="基于 Lingjing Core 设计系统实现基础 UI 组件",
            project_id=project1.id,
            bounty=120.0,
            status="open"
        )

        session.add(module1)
        session.add(module2)
        session.add(module3)

        await session.commit()
        print("✓ 示例数据已创建")
        print("  - 2 个项目")
        print("  - 3 个模块")


async def main():
    print("=" * 50)
    print("Project Nexus 数据库初始化")
    print("=" * 50)

    print("\n正在创建数据库表...")
    await init_db()
    print("✓ 数据库表创建完成")

    print("\n正在创建默认指挥官账户...")
    await create_default_commander()

    print("\n正在创建示例数据...")
    await create_sample_data()

    print("\n" + "=" * 50)
    print("数据库初始化完成！")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
