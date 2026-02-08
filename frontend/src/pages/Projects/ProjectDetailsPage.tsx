import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProject, useModules } from '@/services/queries'
import { Card, Badge, Button } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: project, isLoading } = useProject(Number(id))
  const { data: modules } = useModules(0, 100, Number(id))

  const isCommander = user?.role === 'commander'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">项目不存在</p>
        <Button variant="primary" onClick={() => navigate('/projects')}>
          返回项目列表
        </Button>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">进行中</Badge>
      case 'planning':
        return <Badge variant="info">规划中</Badge>
      case 'completed':
        return <Badge variant="neutral">已完成</Badge>
      case 'paused':
        return <Badge variant="warning">已暂停</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const getModuleStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="info">可承接</Badge>
      case 'in_progress':
        return <Badge variant="success">进行中</Badge>
      case 'completed':
        return <Badge variant="neutral">已完成</Badge>
      case 'closed':
        return <Badge variant="warning">已关闭</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/projects')}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{project.name}</h1>
            <p className="text-neutral-600">项目 ID: {project.id}</p>
          </div>
        </div>
        {getStatusBadge(project.status)}
      </div>

      {/* Project Info */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">项目信息</h2>
        <p className="text-neutral-600 mb-4">
          {project.description || '暂无描述'}
        </p>
        <div className="flex items-center space-x-6 text-sm text-neutral-500">
          <span>创建时间: {new Date(project.created_at).toLocaleString('zh-CN')}</span>
          {project.updated_at && (
            <>
              <span>•</span>
              <span>更新时间: {new Date(project.updated_at).toLocaleString('zh-CN')}</span>
            </>
          )}
          <span>•</span>
          <span>模块数量: {modules?.length || 0}</span>
        </div>
      </Card>

      {/* Modules Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-neutral-900">项目模块</h2>
        {isCommander && (
          <Button
            variant="primary"
            onClick={() => navigate(`/modules/new?project_id=${project.id}`)}
          >
            创建模块
          </Button>
        )}
      </div>

      {modules && modules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module: any) => (
            <Card
              key={module.id}
              hover
              onClick={() => navigate(`/modules/${module.id}`)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-neutral-900 line-clamp-1">
                  {module.title}
                </h4>
                {getModuleStatusBadge(module.status)}
              </div>
              <p className="text-sm text-neutral-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                {module.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                {module.bounty && (
                  <span className="text-primary-600 font-medium">
                    赏金: {module.bounty} 分
                  </span>
                )}
                {module.deadline && (
                  <span className="text-neutral-500">
                    截止: {new Date(module.deadline).toLocaleDateString('zh-CN')}
                  </span>
                )}
              </div>
              {module.is_timeout && (
                <div className="mt-2">
                  <Badge variant="error" size="sm">已超时</Badge>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-neutral-500 mb-4">暂无模块</p>
          {isCommander && (
            <Button
              variant="primary"
              onClick={() => navigate(`/modules/new?project_id=${project.id}`)}
            >
              创建第一个模块
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}

export default ProjectDetailsPage
