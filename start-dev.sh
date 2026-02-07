#!/bin/bash

# 本地开发环境启动脚本

echo "🚀 启动 Project Nexus 本地开发环境..."
echo ""

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 1. 启动后端
echo "📦 启动后端服务..."
cd backend

# 创建虚拟环境（如果不存在）
if [ ! -d "venv" ]; then
    echo "创建 Python 虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
echo "安装后端依赖..."
pip install -q -r requirements.txt

# 更新数据库配置为SQLite
export DATABASE_URL=sqlite+aiosqlite:///./nexus.db

# 初始化数据库
echo "初始化数据库..."
python -m app.db.init_db

# 启动后端服务（在后台运行）
echo "启动 FastAPI 服务（后台运行）..."
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid
echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"
echo "   API 文档: http://localhost:8000/docs"
echo ""

# 2. 启动前端
echo "🎨 启动前端服务..."
cd ../frontend

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

# 启动前端服务（在后台运行）
echo "启动 Vite 开发服务器（后台运行）..."
nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid
echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"
echo "   访问地址: http://localhost:5173"
echo ""

echo "=========================================="
echo "✨ Project Nexus 已启动！"
echo "=========================================="
echo ""
echo "📱 前端地址: http://localhost:5173"
echo "🔧 后端地址: http://localhost:8000"
echo "📚 API 文档: http://localhost:8000/docs"
echo ""
echo "默认账户:"
echo "  用户名: commander"
echo "  密码: admin123"
echo ""
echo "停止服务:"
echo "  ./stop-dev.sh"
echo ""
echo "查看日志:"
echo "  后端: tail -f backend.log"
echo "  前端: tail -f frontend.log"
echo ""
