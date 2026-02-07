import React from 'react'
import { useParams } from 'react-router-dom'
import { Card, Badge, Button } from '@/components/ui'

const ModuleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">模块详情</h1>
        <p className="text-neutral-600">模块 ID: {id}</p>
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">设计数据库架构</h2>
            <Badge variant="info">可承接</Badge>
          </div>
          <Button variant="primary">承接任务</Button>
        </div>

        <p className="text-neutral-600 mb-6">
          设计并实现12个核心数据表，包括用户、项目、模块等。需要考虑数据关系、索引优化和查询性能。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-neutral-500 mb-1">赏金</p>
            <p className="text-2xl font-bold text-primary-500">100 分</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-1">截止日期</p>
            <p className="text-2xl font-bold text-neutral-900">无限制</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-1">当前承接</p>
            <p className="text-2xl font-bold text-neutral-900">0/5 人</p>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">关联知识</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div>
                <p className="font-medium text-neutral-900">数据库设计最佳实践.pdf</p>
                <p className="text-sm text-neutral-500">2.3 MB • 上传于 2024-01-15</p>
              </div>
              <Button variant="ghost" size="sm">下载</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">交付记录</h3>
        <p className="text-neutral-500 text-center py-8">暂无交付记录</p>
      </Card>
    </div>
  )
}

export default ModuleDetailsPage
