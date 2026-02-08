from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.tasks import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    await start_scheduler()
    yield
    # 关闭时执行
    await stop_scheduler()


def create_app():
    app = FastAPI(
        title="Project Nexus API",
        description="AI 原生分布式组织操作系统",
        version="0.1.0",
        lifespan=lifespan
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    from app.api.v1 import auth, projects, modules, deliveries, reviews, notifications, abandon_requests, knowledge

    app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
    app.include_router(projects.router, prefix="/api/v1/projects", tags=["项目"])
    app.include_router(modules.router, prefix="/api/v1/modules", tags=["模块"])
    app.include_router(deliveries.router, prefix="/api/v1/deliveries", tags=["交付"])
    app.include_router(reviews.router, prefix="/api/v1/reviews", tags=["验收"])
    app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["通知"])
    app.include_router(abandon_requests.router, prefix="/api/v1/abandon-requests", tags=["放弃请求"])
    app.include_router(knowledge.router, prefix="/api/v1/knowledge", tags=["知识库"])

    @app.get("/")
    async def root():
        return {"message": "Project Nexus API", "version": "0.1.0"}

    @app.get("/health")
    async def health():
        return {"status": "healthy"}

    return app


app = create_app()
