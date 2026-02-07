import React from 'react'
import { Card } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">个人中心</h1>
        <p className="text-neutral-600">管理您的个人信息</p>
      </div>

      <Card className="max-w-2xl">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-3xl font-bold">
              {user?.username.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-1">{user?.username}</h2>
            <p className="text-neutral-600">
              {user?.role === 'commander' ? '指挥官' : '节点'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-neutral-500 mb-2">用户 ID</p>
            <p className="text-lg font-semibold text-neutral-900">{user?.id}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-2">信誉分</p>
            <p className="text-lg font-semibold text-primary-500">{user?.reputation_score}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-2">当前任务数</p>
            <p className="text-lg font-semibold text-neutral-900">{user?.concurrent_task_count}/3</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-2">注册时间</p>
            <p className="text-lg font-semibold text-neutral-900">
              {new Date(user?.created_at || '').toLocaleDateString('zh-CN')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ProfilePage
