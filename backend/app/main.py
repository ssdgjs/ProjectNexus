from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings


def create_app():
    app = FastAPI(
        title="Project Nexus API",
        description="AI 原生分布式组织操作系统",
        version="0.1.0"
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
    from app.api.v1 import auth, projects, modules

    app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
    app.include_router(projects.router, prefix="/api/v1/projects", tags=["项目"])
    app.include_router(modules.router, prefix="/api/v1/modules", tags=["模块"])

    @app.get("/")
    async def root():
        return {"message": "Project Nexus API", "version": "0.1.0"}

    @app.get("/health")
    async def health():
        return {"status": "healthy"}

    return app


app = create_app()
