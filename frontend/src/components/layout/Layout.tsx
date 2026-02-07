import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/components/ui'

const Layout: React.FC = () => {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
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
              <Link to="/knowledge" className="text-neutral-700 hover:text-primary-500 transition-colors">
                知识库
              </Link>
              <Link to="/leaderboard" className="text-neutral-700 hover:text-primary-500 transition-colors">
                排行榜
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-neutral-900">{user?.username}</p>
                <p className="text-xs text-neutral-500">
                  {user?.role === 'commander' ? '指挥官' : '节点'}
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
    </div>
  )
}

export default Layout
