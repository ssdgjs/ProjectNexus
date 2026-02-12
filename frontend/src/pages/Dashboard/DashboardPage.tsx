import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects, useModules, useCurrentUser, useAbandonRequests } from '@/services/queries'
import { Card, Button, Badge } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import AbandonRequestReviewCard from '@/components/modules/AbandonRequestReviewCard'

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: projects } = useProjects()
  const { data: modules } = useModules()
  const { data: currentUser } = useCurrentUser()
  const { data: abandonRequests, refetch: refetchAbandonRequests } = useAbandonRequests('pending')

  const isCommander = user?.role?.toLowerCase() === 'commander'

  // Calculate stats
  const myModules = modules?.filter((m: any) =>
    m.assignees?.some((a: any) => a.user_id === user?.id)
  ) || []

  const openModules = modules?.filter((m: any) => m.status === 'open') || []

  // 获取超时任务
  const myTimeoutModules = myModules.filter((m: any) => m.is_timeout)

  const recentModules = [...(modules || [])]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">仪表盘</h1>
        <p className="text-neutral-600">
          欢迎回来，{user?.username}！
          {isCommander && ' 指挥官'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {!isCommander && (
        <Card hover onClick={() => navigate('/modules')} className="cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-600">我的任务</h3>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{myModules.length}</p>
          <p className="text-xs text-neutral-500 mt-1">当前进行中的任务</p>
        </Card>
        )}

        <Card hover onClick={() => navigate('/modules')} className="cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-600">可承接</h3>
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{openModules.length}</p>
          <p className="text-xs text-neutral-500 mt-1">开放的任务</p>
        </Card>

        <Card hover onClick={() => navigate('/projects')} className="cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-600">项目数</h3>
            <div className="w-10 h-10 bg-info-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-info-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{projects?.length || 0}</p>
          <p className="text-xs text-neutral-500 mt-1">活跃项目</p>
        </Card>

        {!isCommander && (
        <Card className="cursor-default">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-600">信誉分</h3>
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900">
            {currentUser?.reputation_score || user?.reputation_score || 0}
          </p>
          <p className="text-xs text-neutral-500 mt-1">当前信誉分数</p>
        </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Modules */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">最新任务</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/modules')}
            >
              查看全部
            </Button>
          </div>
          <div className="space-y-3">
            {recentModules.length > 0 ? (
              recentModules.map((module: any) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/modules/${module.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{module.title}</p>
                    <p className="text-xs text-neutral-500">
                      {module.project_name || `项目 ${module.project_id}`}
                    </p>
                  </div>
                  <Badge
                    variant={
                      module.status === 'open' ? 'success' :
                      module.status === 'in_progress' ? 'info' : 'neutral'
                    }
                    size="sm"
                  >
                    {module.status === 'open' ? '可承接' :
                     module.status === 'in_progress' ? '进行中' : module.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 text-center py-4">暂无任务</p>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">快捷操作</h3>
          <div className="space-y-3">
            {isCommander && (
              <>
                <Button
                  variant="primary"
                  className="w-full justify-start"
                  onClick={() => navigate('/projects')}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  创建新项目
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate('/modules')}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  创建新任务
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/modules')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              浏览所有任务
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/leaderboard')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              查看排行榜
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/knowledge')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              访问知识库
            </Button>
          </div>
        </Card>
      </div>

      {/* Abandon Requests Review - Commander Only */}
      {isCommander && abandonRequests && abandonRequests.length > 0 && (
        <Card className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              待审批的放弃申请
              <Badge variant="warning" className="ml-2">{abandonRequests.length}</Badge>
            </h3>
          </div>
          <div className="space-y-4">
            {abandonRequests.map((request: any) => (
              <AbandonRequestReviewCard
                key={request.id}
                requestId={request.id}
                moduleTitle={request.module_title}
                requesterName={request.requester_name}
                reason={request.reason}
                status={request.status}
                reviewComment={request.review_comment}
                createdAt={request.created_at}
                onSuccess={() => refetchAbandonRequests()}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Task Limit Warning */}
      {currentUser && currentUser.concurrent_task_count >= 3 && (
        <Card className="mt-6 border-warning-200 bg-warning-50">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-warning-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-semibold text-warning-900 mb-1">已达到并发任务上限</h4>
              <p className="text-sm text-warning-700">
                您当前有 {currentUser.concurrent_task_count} 个进行中的任务。请先完成现有任务后再承接新任务。
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Timeout Modules Warning */}
      {myTimeoutModules.length > 0 && (
        <Card className="mt-6 border-error-200 bg-error-50">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-error-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold text-error-900 mb-2">
                您有 {myTimeoutModules.length} 个任务已超时
              </h4>
              <div className="space-y-2">
                {myTimeoutModules.map((module: any) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between p-2 bg-white rounded border border-error-200"
                  >
                    <div>
                      <p className="font-medium text-error-900">{module.title}</p>
                      <p className="text-xs text-error-700">
                        截止: {module.deadline ? new Date(module.deadline).toLocaleString('zh-CN') : '未设置'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/modules/${module.id}`)}
                    >
                      查看
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default DashboardPage
