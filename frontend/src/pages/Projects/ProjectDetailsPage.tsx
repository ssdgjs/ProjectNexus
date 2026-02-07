import React from 'react'
import { useParams } from 'react-router-dom'
import { Card, Badge } from '@/components/ui'

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">项目详情</h1>
        <p className="text-neutral-600">项目 ID: {id}</p>
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-neutral-900">AI 智能调度系统</h2>
          <Badge variant="success">进行中</Badge>
        </div>
        <p className="text-neutral-600 mb-4">
          构建基于 AI 的分布式任务调度系统
        </p>
        <div className="flex items-center space-x-4 text-sm text-neutral-500">
          <span>创建于: 2024-01-15</span>
          <span>•</span>
          <span>3 个模块</span>
          <span>•</span>
          <span>5 位参与者</span>
        </div>
      </Card>

      <h3 className="text-xl font-semibold text-neutral-900 mb-4">项目模块</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card hover>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-neutral-900">设计数据库架构</h4>
            <Badge variant="info">可承接</Badge>
          </div>
          <p className="text-sm text-neutral-600 mb-3">
            设计并实现12个核心数据表，包括用户、项目、模块等
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">赏金: 100 分</span>
            <span className="text-neutral-500">截止: 无限制</span>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-neutral-900">实现 JWT 认证系统</h4>
            <Badge variant="success">进行中</Badge>
          </div>
          <p className="text-sm text-neutral-600 mb-3">
            实现基于 JWT 的用户认证和授权系统
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">赏金: 80 分</span>
            <span className="text-neutral-500">截止: 无限制</span>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ProjectDetailsPage
