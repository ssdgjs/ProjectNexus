import React from 'react'
import { Card } from '@/components/ui'

const DashboardPage: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">仪表盘</h1>
        <p className="text-neutral-600">欢迎回到 Project Nexus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card hover>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">我的任务</h3>
            <span className="text-3xl font-bold text-primary-500">3</span>
          </div>
          <p className="text-sm text-neutral-600">当前进行中的任务</p>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">待验收</h3>
            <span className="text-3xl font-bold text-warning-500">1</span>
          </div>
          <p className="text-sm text-neutral-600">等待验收的交付</p>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">信誉分</h3>
            <span className="text-3xl font-bold text-success-500">100</span>
          </div>
          <p className="text-sm text-neutral-600">当前信誉分数</p>
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">最近活动</h3>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <span className="text-neutral-500 w-32">刚刚</span>
            <span className="text-neutral-700">新模块"前端 UI 组件库"已发布</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-neutral-500 w-32">2小时前</span>
            <span className="text-neutral-700">任务"设计数据库架构"已被承接</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-neutral-500 w-32">昨天</span>
            <span className="text-neutral-700">您完成了"JWT 认证系统"模块</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default DashboardPage
