# Project Nexus

AI 原生分布式组织操作系统 - MVP 版本

## 项目概述

Project Nexus 是一个"无管理者"的组织系统，AI 作为调度枢纽，将人类工作者和 Agent 视为平等的"工作节点"。系统将战略目标分解为原子任务，并分配给最合适的节点。

## 技术栈

- **后端**: Python + FastAPI + SQLAlchemy + PostgreSQL
- **前端**: React + Vite + TypeScript + TailwindCSS
- **状态管理**: Zustand + React Query
- **部署**: Docker Compose

## 快速开始

### 前置要求

- Docker 和 Docker Compose
- Git

### 开发环境设置

```bash
# 1. 克隆仓库
git clone <repository-url> project-nexus
cd project-nexus

# 2. 配置环境变量
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. 启动开发环境
docker-compose up -d

# 4. 运行数据库迁移
docker-compose exec backend alembic upgrade head

# 5. 初始化数据（创建默认指挥官账户）
docker-compose exec backend python -m app.db.init_db

# 6. 访问应用
# 前端: http://localhost:5173
# 后端 API: http://localhost:8000
# API 文档: http://localhost:8000/docs
```

### 默认账户

初始化后，系统将创建一个默认指挥官账户：
- 用户名: `commander`
- 密码: `admin123`

请在首次登录后立即修改密码。

## 项目结构

```
project-nexus/
├── backend/                    # FastAPI 后端
│   ├── app/
│   │   ├── main.py            # 应用入口
│   │   ├── core/              # 核心功能（配置、认证）
│   │   ├── models/            # SQLAlchemy 模型
│   │   ├── schemas/           # Pydantic 模式
│   │   ├── api/v1/            # API 路由
│   │   ├── services/          # 业务逻辑层
│   │   ├── db/                # 数据库会话
│   │   └── utils/             # 工具函数
│   ├── alembic/               # 数据库迁移
│   └── uploads/               # 文件上传目录
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── components/        # UI 组件
│   │   ├── pages/             # 页面组件
│   │   ├── services/          # API 服务
│   │   ├── store/             # Zustand 状态管理
│   │   └── types/             # TypeScript 类型
└── docker-compose.yml         # 开发环境配置
```

## 开发指南

### 后端开发

```bash
# 进入后端容器
docker-compose exec backend bash

# 运行测试
pytest

# 生成新的迁移
alembic revision --autogenerate -m "description"

# 应用迁移
alembic upgrade head

# 查看日志
docker-compose logs -f backend
```

### 前端开发

```bash
# 进入前端容器
docker-compose exec frontend bash

# 安装新依赖
npm install <package>

# 运行测试
npm run test

# 构建生产版本
npm run build
```

## API 文档

启动开发环境后，访问 http://localhost:8000/docs 查看完整的 API 文档（Swagger UI）。

## 核心功能

### 角色系统
- **指挥官 (Commander)**: 设置战略目标、审收任务、调整信誉分
- **节点 (Node)**: 承接和执行任务

### 任务管理
- 任务分解和发布
- 抢单模式分配
- 并发任务限制（最多 3 个）
- 多人协作（最多 5 人）

### 验收流程
1. 节点提交交付物
2. 指挥官审收（通过/不通过/关闭）
3. 结算信誉分

### 知识库
- 文件上传（≤30MB）
- 知识-任务关联
- 全员共享

## 环境变量

### 后端 (.env)
```
DATABASE_URL=postgresql+asyncpg://nexus:nexus_password@db:5432/nexus
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

### 前端 (.env)
```
VITE_API_URL=http://localhost:8000
```

## 生产部署

```bash
# 构建前端
cd frontend
npm run build

# 构建并启动生产环境
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 运行迁移
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

## 测试

### 后端测试
```bash
docker-compose exec backend pytest
docker-compose exec backend pytest --cov=app --cov-report=html
```

### 前端测试
```bash
cd frontend
npm run test
npm run test:e2e
```

## 故障排查

### 数据库连接失败
检查 PostgreSQL 容器是否正常运行：
```bash
docker-compose ps
docker-compose logs db
```

### 前端无法连接后端
确认环境变量 `VITE_API_URL` 配置正确，后端服务已启动。

### 迁移失败
检查数据库连接字符串，确保数据库容器已启动：
```bash
docker-compose exec backend alembic current
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件

## 联系方式

项目主页: [https://github.com/your-org/project-nexus](https://github.com/your-org/project-nexus)
