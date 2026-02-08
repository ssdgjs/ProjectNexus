import React from 'react'
import { Avatar, Badge, Button } from '@/components/ui'

interface DeliveryCardProps {
  delivery: any
  isCommander: boolean
  onReview: (delivery: any) => void
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({ delivery, isCommander, onReview }) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow mb-3">
      {/* Header */}
      <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar name={delivery.submitter_name} size="md" />
          <div>
            <p className="font-semibold text-neutral-900">{delivery.submitter_name}</p>
            <p className="text-xs text-neutral-500">
              {new Date(delivery.created_at).toLocaleString('zh-CN')}
            </p>
          </div>
        </div>
        {delivery.review_decision ? (
          <Badge size="lg" variant={
            delivery.review_decision === 'approved' ? 'success' :
            delivery.review_decision === 'rejected' ? 'error' : 'warning'
          }>
            {delivery.review_decision === 'approved' ? '✓ 已通过' :
             delivery.review_decision === 'rejected' ? '✕ 已拒绝' : '− 已关闭'}
          </Badge>
        ) : (
          <Badge size="lg" variant="warning">⏰ 待验收</Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* 交付内容 */}
        {delivery.content && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-neutral-700 mb-1">📝 交付内容</h4>
            <p className="text-sm text-neutral-600 whitespace-pre-wrap">{delivery.content}</p>
          </div>
        )}

        {/* 附件 */}
        {delivery.attachments && delivery.attachments.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-neutral-700 mb-2">📎 交付物 ({delivery.attachments.length})</h4>
            <div className="space-y-2">
              {delivery.attachments.map((attachment: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-neutral-50 border border-neutral-200 rounded hover:bg-primary-50 hover:border-primary-300 transition-colors">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-xl">
                      {attachment.url.toLowerCase().includes('github') || attachment.url.toLowerCase().includes('gitlab') ? '💻' : '📎'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900 truncate">{attachment.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{attachment.url}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(attachment.url, '_blank')}
                  >
                    查看
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 验收结果 */}
        {delivery.review_decision && (
          <div className={`p-3 rounded-lg border-l-4 ${
            delivery.review_decision === 'approved' ? 'bg-success-50 border-success-500' :
            delivery.review_decision === 'rejected' ? 'bg-error-50 border-error-500' :
            'bg-warning-50 border-warning-500'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold mb-1">
                  {delivery.review_decision === 'approved' ? '✅ 验收通过' :
                   delivery.review_decision === 'rejected' ? '❌ 验收拒绝' : '− 任务关闭'}
                </h4>
                {delivery.review_feedback && (
                  <p className="text-sm text-neutral-700 mt-1">
                    💬 {delivery.review_feedback}
                  </p>
                )}
              </div>
              {delivery.review_decision === 'approved' && delivery.reputation_change && (
                <div className="ml-4 text-right">
                  <p className="text-2xl font-bold text-success-600">+{delivery.reputation_change}</p>
                  <p className="text-xs text-neutral-600">信誉分</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 待验收操作 */}
        {delivery.review_decision === 'pending' && isCommander && (
          <div className="flex justify-end pt-3 border-t border-neutral-200">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onReview(delivery)}
            >
              验收交付
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryCard
