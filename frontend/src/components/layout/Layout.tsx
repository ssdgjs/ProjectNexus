import React, { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUnreadCount, useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/services/queries'
import { Avatar, Button } from '@/components/ui'
import ToastContainer from '@/components/ui/Toast'

const Layout: React.FC = () => {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()
  const { data: unreadData } = useUnreadCount()
  const { data: notifications } = useNotifications(false)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const handleNotificationClick = async (notificationId: number, moduleId?: number) => {
    await markAsRead.mutateAsync(notificationId)
    if (moduleId) {
      navigate(`/modules/${moduleId}`)
    }
    setIsNotificationOpen(false)
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead.mutateAsync()
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-ethereal">Project Nexus</h1>
                <p className="text-xs text-neutral-500">分布式组织操作系统</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-neutral-700 hover:text-primary-500 transition-colors">
                仪表盘
              </Link>
              <Link to="/projects" className="text-neutral-700 hover:text-primary-500 transition-colors">
                项目
              </Link>
              <Link to="/modules" className="text-neutral-700 hover:text-primary-500 transition-colors">
                任务
              </Link>
              <Link to="/knowledge" className="text-neutral-700 hover:text-primary-500 transition-colors">
                知识库
              </Link>
              <Link to="/leaderboard" className="text-neutral-700 hover:text-primary-500 transition-colors">
                排行榜
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="text-neutral-500 hover:text-neutral-700 transition-colors relative"
                  title="通知"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadData && unreadData.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadData.unread_count > 9 ? '9+' : unreadData.unread_count}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-neutral-200 z-50">
                    <div className="p-3 border-b border-neutral-200 flex items-center justify-between">
                      <h3 className="font-semibold text-neutral-900">通知</h3>
                      {unreadData && unreadData.unread_count > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleMarkAllRead}
                          className="text-xs"
                        >
                          全部已读
                        </Button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications && notifications.length > 0 ? (
                        notifications.map((notification: any) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification.id, notification.related_module_id)}
                            className={`p-3 border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-colors ${
                              !notification.is_read ? 'bg-primary-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              {!notification.is_read && (
                                <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></span>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 truncate">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2">
                                  {notification.content}
                                </p>
                                <p className="text-xs text-neutral-400 mt-1">
                                  {new Date(notification.created_at).toLocaleString('zh-CN')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-neutral-500 text-center py-4">暂无通知</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-neutral-900">{user?.username}</p>
                <p className="text-xs text-neutral-500">
                  {user?.role?.toLowerCase() === 'commander' ? '指挥官' : ''}
                </p>
              </div>
              <Avatar name={user?.username} size="md" />
              <button
                onClick={handleLogout}
                className="text-neutral-500 hover:text-error-500 transition-colors"
                title="退出登录"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Outlet />
      </main>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  )
}

export default Layout
