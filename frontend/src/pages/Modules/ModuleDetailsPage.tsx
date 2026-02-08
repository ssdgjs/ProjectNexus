import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useModule, useAssignModule, useCurrentUser, useDeliveries } from '@/services/queries'
import { Card, Badge, Button, Avatar } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import DeliverySubmissionModal from '@/components/modules/DeliverySubmissionModal'
import ReviewModal from '@/components/modules/ReviewModal'

const ModuleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: module, isLoading, refetch } = useModule(Number(id))
  const { data: currentUser } = useCurrentUser()
  const { data: deliveries } = useDeliveries(Number(id))
  const assignModule = useAssignModule()

  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false)
  const [reviewModalData, setReviewModalData] = useState<{
    isOpen: boolean
    deliveryId: number
    submitterName: string
  }>({
    isOpen: false,
    deliveryId: 0,
    submitterName: '',
  })

  const isCommander = user?.role === 'commander'
  const isAssignee = module?.assignees?.some((a: any) => a.user_id === user?.id)

  const myDelivery = deliveries?.find((d: any) => d.submitter_id === user?.id)

  const handleAssign = async () => {
    try {
      await assignModule.mutateAsync(Number(id))
      refetch()
    } catch (error: any) {
      console.error('Failed to assign module:', error)
      alert(error.response?.data?.detail || '承接失败')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">模块不存在</p>
        <Button variant="primary" onClick={() => navigate('/modules')}>
          返回模块列表
        </Button>
      </div>
    )
  }

  const getModuleStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="success">可承接</Badge>
      case 'in_progress':
        return <Badge variant="info">进行中</Badge>
      case 'completed':
        return <Badge variant="neutral">已完成</Badge>
      case 'closed':
        return <Badge variant="warning">已关闭</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const canAssign = module.status === 'open' && !isAssignee && !isCommander
  const taskSlots = 5 - (module.assignees?.length || 0)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/modules')}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{module.title}</h1>
            <p className="text-neutral-600">模块 ID: {module.id}</p>
          </div>
        </div>
        {getModuleStatusBadge(module.status)}
      </div>

      {/* Main Card */}
      <Card className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              {getModuleStatusBadge(module.status)}
              {module.is_timeout && (
                <Badge variant="error">已超时</Badge>
              )}
            </div>
            <p className="text-neutral-600 text-lg leading-relaxed">
              {module.description}
            </p>
          </div>
          {canAssign && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleAssign}
              loading={assignModule.isPending}
              disabled={currentUser ? currentUser.concurrent_task_count >= 3 : false}
            >
              {assignModule.isPending ? '承接中...' : '承接任务'}
            </Button>
          )}
        </div>

        {isAssignee && !myDelivery && (
          <div className="mb-4 flex items-center space-x-3">
            <div className="flex-1 p-3 bg-success-50 border border-success-200 rounded-lg">
              <p className="text-sm text-success-700">
                ✓ 您已承接此任务
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsDeliveryModalOpen(true)}
            >
              提交交付
            </Button>
          </div>
        )}

        {myDelivery && (
          <div className="mb-4 p-3 bg-info-50 border border-info-200 rounded-lg">
            <p className="text-sm text-info-700">
              ✓ 您已提交交付，等待指挥官验收
            </p>
            <p className="text-xs text-info-600 mt-1">
              提交时间: {new Date(myDelivery.submitted_at).toLocaleString('zh-CN')}
            </p>
          </div>
        )}

        {canAssign && currentUser && currentUser.concurrent_task_count >= 3 && (
          <div className="mb-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
            <p className="text-sm text-warning-700">
              ⚠️ 您已达到最大并发任务数（3个），请先完成现有任务
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-500 mb-1">赏金</p>
            <p className="text-2xl font-bold text-primary-500">
              {module.bounty || 0} 分
            </p>
          </div>
          <div className="p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-500 mb-1">截止日期</p>
            <p className="text-2xl font-bold text-neutral-900">
              {module.deadline
                ? new Date(module.deadline).toLocaleDateString('zh-CN')
                : '无限制'}
            </p>
          </div>
          <div className="p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-500 mb-1">承接人数</p>
            <p className="text-2xl font-bold text-neutral-900">
              {module.assignees?.length || 0}/5 人
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              剩余 {taskSlots} 个名额
            </p>
          </div>
        </div>

        {/* Assignees */}
        {module.assignees && module.assignees.length > 0 && (
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">承接人</h3>
            <div className="flex flex-wrap gap-3">
              {module.assignees.map((assignee: any) => (
                <div
                  key={assignee.id}
                  className="flex items-center space-x-2 p-3 bg-neutral-50 rounded-lg"
                >
                  <Avatar name={assignee.username} size="sm" />
                  <div>
                    <p className="font-medium text-neutral-900">{assignee.username}</p>
                    <p className="text-xs text-neutral-500">
                      {assignee.role === 'commander' ? '指挥官' : '节点'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Project Info */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-3">所属项目</h3>
        <div
          className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          onClick={() => navigate(`/projects/${module.project_id}`)}
        >
          <div>
            <p className="font-medium text-neutral-900">{module.project_name || `项目 ${module.project_id}`}</p>
            <p className="text-sm text-neutral-500">点击查看项目详情</p>
          </div>
          <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>

      {/* Deliveries */}
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">交付记录</h3>
        {module.deliveries && module.deliveries.length > 0 ? (
          <div className="space-y-3">
            {module.deliveries.map((delivery: any) => (
              <div key={delivery.id} className="p-4 border border-neutral-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Avatar name={delivery.submitter_name} size="sm" />
                    <span className="font-medium text-neutral-900">{delivery.submitter_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {delivery.review_decision ? (
                      <Badge variant={
                        delivery.review_decision === 'approved' ? 'success' :
                        delivery.review_decision === 'rejected' ? 'error' : 'warning'
                      }>
                        {delivery.review_decision === 'approved' ? '已通过' :
                         delivery.review_decision === 'rejected' ? '已拒绝' : '已关闭'}
                      </Badge>
                    ) : (
                      <>
                        <Badge variant="warning">待验收</Badge>
                      {isCommander && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setReviewModalData({
                              isOpen: true,
                              deliveryId: delivery.id,
                              submitterName: delivery.submitter_name,
                            })}
                          >
                            验收
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {delivery.content && (
                  <p className="text-sm text-neutral-600 mb-2">{delivery.content}</p>
                )}
                {delivery.review_feedback && (
                  <div className="mt-2 p-2 bg-neutral-50 rounded text-sm">
                    <p className="font-medium text-neutral-700">反馈:</p>
                    <p className="text-neutral-600">{delivery.review_feedback}</p>
                  </div>
                )}
                <p className="text-xs text-neutral-500 mt-2">
                  提交时间: {new Date(delivery.created_at).toLocaleString('zh-CN')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-center py-8">暂无交付记录</p>
        )}
      </Card>

      {/* Delivery Submission Modal */}
      <DeliverySubmissionModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        moduleId={Number(id)}
        onSuccess={() => refetch()}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalData.isOpen}
        onClose={() => setReviewModalData({ isOpen: false, deliveryId: 0, submitterName: '' })}
        deliveryId={reviewModalData.deliveryId}
        submitterName={reviewModalData.submitterName}
        moduleTitle={module?.title || ''}
        allAssignees={module?.assignees || []}
        onSuccess={() => refetch()}
      />
    </div>
  )
}

export default ModuleDetailsPage
