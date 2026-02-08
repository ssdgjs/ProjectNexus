import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects, useCreateProject } from '@/services/queries'
import { Card, Button, Badge, Modal, Input, EmptyState } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { useForm } from 'react-hook-form'

interface CreateProjectForm {
  name: string
  description: string
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: projects, isLoading } = useProjects()
  const createProject = useCreateProject()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProjectForm>()

  const isCommander = user?.role === 'commander'

  const handleCreateProject = async (data: CreateProjectForm) => {
    try {
      await createProject.mutateAsync(data)
      setIsCreateModalOpen(false)
      reset()
    } catch (error) {
      console.error('Failed to create project:', error)
    }
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
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">项目管理</h1>
          <p className="text-neutral-600">管理和跟踪所有项目</p>
        </div>
        {isCommander && (
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            创建项目
          </Button>
        )}
      </div>

      {/* Projects Grid */}
      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <Card
              key={project.id}
              hover
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-neutral-900 line-clamp-1">
                  {project.name}
                </h3>
                {getStatusBadge(project.status)}
              </div>

              <p className="text-sm text-neutral-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                {project.description || '暂无描述'}
              </p>

              <div className="flex items-center justify-between text-sm text-neutral-500">
                <span>ID: {project.id}</span>
                <span>{new Date(project.created_at).toLocaleDateString('zh-CN')}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          type="no-projects"
          action={
            isCommander
              ? {
                  label: '创建项目',
                  onClick: () => setIsCreateModalOpen(true),
                }
              : undefined
          }
        />
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          reset()
        }}
        title="创建项目"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleCreateProject)} className="space-y-4">
          <Input
            label="项目名称"
            placeholder="输入项目名称"
            error={errors.name?.message}
            {...register('name', { required: '请输入项目名称' })}
          />

          <Input
            label="项目描述"
            placeholder="输入项目描述（可选）"
            {...register('description')}
          />

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
              loading={createProject.isPending}
            >
              创建
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ProjectsPage
