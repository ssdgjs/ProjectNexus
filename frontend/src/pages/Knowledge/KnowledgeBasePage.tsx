import React from 'react'
import { Card, Button } from '@/components/ui'

const KnowledgeBasePage: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">知识库</h1>
          <p className="text-neutral-600">共享知识，积累智慧</p>
        </div>
        <Button variant="primary">上传知识</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card hover>
          <div className="mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">数据库设计最佳实践</h3>
            <p className="text-sm text-neutral-600 mb-3">详细的数据库设计指南和最佳实践文档</p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">2.3 MB</span>
            <Button variant="ghost" size="sm">下载</Button>
          </div>
        </Card>

        <Card hover>
          <div className="mb-4">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">FastAPI 官方文档</h3>
            <p className="text-sm text-neutral-600 mb-3">FastAPI 框架完整文档和教程</p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">5.1 MB</span>
            <Button variant="ghost" size="sm">下载</Button>
          </div>
        </Card>

        <Card hover>
          <div className="mb-4">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">React 设计模式</h3>
            <p className="text-sm text-neutral-600 mb-3">React 应用设计模式和最佳实践</p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">1.8 MB</span>
            <Button variant="ghost" size="sm">下载</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default KnowledgeBasePage
