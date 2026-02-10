import React from 'react'
import { Card, Badge, Avatar } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { useModules } from '@/services/queries'

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore()
  const { data: modules } = useModules()

  // 获取用户参与的模块
  const myModules = React.useMemo(() => {
    return modules?.filter((m: any) =>
      m.assignees?.some((a: any) => a.user_id === user?.id)
    ) || []
  }, [modules, user])

  // 计算统计数据
  const stats = React.useMemo(() => {
    const completed = myModules.filter((m: any) => m.status === 'completed').length
    const inProgress = myModules.filter((m: any) => m.status === 'in_progress').length
    const totalScore = myModules.reduce((sum: number, m: any) => {
      const assignee = m.assignees?.find((a: any) => a.user_id === user?.id)
      return sum + (assignee?.allocated_score || 0)
    }, 100) // 初始100分

    return {
      totalModules: myModules.length,
      completed,
      inProgress,
      totalScore,
    }
  }, [myModules, user])

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">个人中心</h1>
        <p className="text-neutral-600">查看您的个人信息和统计数据</p>
      </div>

      {/* Profile Card */}
      <Card className="mb-6">
        <div className="flex items-center space-x-6">
          <Avatar name={user?.username} size="xl" />
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-neutral-900">{user?.username}</h2>
              {user?.role?.toLowerCase() === 'commander' && (
                <Badge variant="success">指挥官</Badge>
              )}
            </div>
            <p className="text-neutral-600">信誉分: <span className="font-bold text-primary-500 text-xl">{stats.totalScore}</span></p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-neutral-600 mb-2">参与任务</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.totalModules}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-neutral-600 mb-2">已完成</p>
            <p className="text-3xl font-bold text-success-500">{stats.completed}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-neutral-600 mb-2">进行中</p>
            <p className="text-3xl font-bold text-info-500">{stats.inProgress}</p>
          </div>
        </Card>
      </div>

      {/* My Modules */}
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">我的任务</h3>
        {myModules.length > 0 ? (
          <div className="space-y-3">
            {myModules.map((module: any) => (
              <div key={module.id} className="p-4 border border-neutral-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-neutral-900">{module.title}</h4>
                  <Badge variant={
                    module.status === 'completed' ? 'success' :
                    module.status === 'in_progress' ? 'info' : 'neutral'
                  }>
                    {module.status === 'completed' ? '已完成' :
                     module.status === 'in_progress' ? '进行中' : module.status}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600">{module.description}</p>
                {module.is_timeout && (
                  <p className="text-xs text-error-500 mt-2">⚠️ 已超时</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-center py-8">暂未参与任何模块</p>
        )}
      </Card>
    </div>
  )
}

export default ProfilePage
