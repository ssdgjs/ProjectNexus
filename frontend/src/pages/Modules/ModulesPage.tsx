import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useModules, useProjects, useCreateModule } from '@/services/queries'
import { Card, Badge, Button, Modal, Input, EmptyState } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { useForm } from 'react-hook-form'

interface CreateModuleForm {
  title: string
  description: string
  project_id: number
  bounty?: number
  deadline?: string
}

const ModulesPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectIdParam = searchParams.get('project_id')

  const { user } = useAuthStore()
  const { data: modules, isLoading } = useModules(0, 100, projectIdParam ? Number(projectIdParam) : undefined)
  const { data: projects } = useProjects()
  const createModule = useCreateModule()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateModuleForm>({
    defaultValues: {
      project_id: projectIdParam ? Number(projectIdParam) : undefined,
    },
  })

  const isCommander = user?.role?.toLowerCase() === 'commander'

  const handleCreateModule = async (data: CreateModuleForm) => {
    try {
      await createModule.mutateAsync(data)
      setIsCreateModalOpen(false)
      reset()
    } catch (error) {
      console.error('Failed to create module:', error)
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

  const getProjectName = (projectId: number) => {
    const project = projects?.find((p: any) => p.id === projectId)
    return project?.name || `项目 ${projectId}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">模块管理</h1>
          <p className="text-neutral-600">浏览和承接任务模块</p>
        </div>
        {isCommander && (
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            创建任务
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/modules')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !projectIdParam
              ? 'bg-primary-500 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          全部模块
        </button>
        {projects?.slice(0, 5).map((project: any) => (
          <button
            key={project.id}
            onClick={() => navigate(`/modules?project_id=${project.id}`)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              projectIdParam === String(project.id)
                ? 'bg-primary-500 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            {project.name}
          </button>
        ))}
      </div>

      {/* Modules Grid */}
      {modules && modules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module: any) => (
            <Card
              key={module.id}
              hover
              onClick={() => navigate(`/modules/${module.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-neutral-900 line-clamp-1">
                  {module.title}
                </h3>
                {getModuleStatusBadge(module.status)}
              </div>

              <p className="text-sm text-neutral-600 mb-3 line-clamp-3 min-h-[3.75rem]">
                {module.description}
              </p>

              <div className="text-xs text-neutral-500 mb-3">
                {getProjectName(module.project_id)}
              </div>

              <div className="flex items-center justify-between text-sm border-t border-neutral-100 pt-3">
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
        <EmptyState
          type="no-modules"
          action={
            isCommander
              ? {
                  label: '创建任务',
                  onClick: () => setIsCreateModalOpen(true),
                }
              : {
                  label: '浏览所有项目',
                  onClick: () => navigate('/projects'),
                }
          }
        />
      )}

      {/* Create Module Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          reset()
        }}
        title="创建任务"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleCreateModule)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              所属项目
            </label>
            <select
              {...register('project_id', {
                required: '请选择项目',
                valueAsNumber: true
              })}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">选择项目</option>
              {projects?.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.project_id && (
              <p className="mt-1 text-sm text-error-500">{errors.project_id.message}</p>
            )}
          </div>

          <Input
            label="任务标题"
            placeholder="输入任务标题"
            error={errors.title?.message}
            {...register('title', { required: '请输入任务标题' })}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              任务描述
            </label>
            <textarea
              {...register('description', { required: '请输入任务描述' })}
              rows={4}
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 ${
                errors.description ? 'border-error-500 text-error-900' : 'border-neutral-300 text-neutral-900'
              }`}
              placeholder="输入任务描述"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="赏金（可选）"
              type="number"
              placeholder="0"
              {...register('bounty', {
                valueAsNumber: true
              })}
            />

            <Input
              label="截止日期（可选）"
              type="date"
              {...register('deadline')}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false)
                reset()
              }}
            >
              取消
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createModule.isPending}
            >
              创建
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ModulesPage
