import React from 'react'
import { Badge, Avatar } from '@/components/ui'

interface ReviewRecord {
  id: number
  decision: string
  feedback: string
  reputation_change: number
  reviewed_at: string
  reviewer_name: string
}

interface ReviewHistoryPanelProps {
  reviews: ReviewRecord[]
}

const ReviewHistoryPanel: React.FC<ReviewHistoryPanelProps> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return null
  }

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'pass':
        return <Badge variant="success">通过</Badge>
      case 'reject':
        return <Badge variant="error">拒绝</Badge>
      case 'close':
        return <Badge variant="warning">关闭</Badge>
      default:
        return <Badge variant="neutral">{decision}</Badge>
    }
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-neutral-900 flex items-center">
        📋 验收历史
      </h4>
      {reviews.map((review) => (
        <div key={review.id} className="bg-neutral-50 p-3 rounded-lg border-l-4 border-neutral-300">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Avatar name={review.reviewer_name} size="sm" />
              <span className="text-sm font-medium text-neutral-900">
                {review.reviewer_name}
              </span>
              {getDecisionBadge(review.decision)}
            </div>
            <div className="text-right">
              {review.reputation_change !== null && review.reputation_change !== undefined && (
                <span className={`text-sm font-semibold ${
                  review.reputation_change > 0 ? 'text-success-600' : 'text-neutral-600'
                }`}>
                  {review.reputation_change > 0 ? '+' : ''}{review.reputation_change} 分
                </span>
              )}
            </div>
          </div>
          {review.feedback && (
            <p className="text-sm text-neutral-700 bg-white p-2 rounded border border-neutral-200">
              💬 {review.feedback}
            </p>
          )}
          <p className="text-xs text-neutral-500 mt-2">
            {new Date(review.reviewed_at).toLocaleString('zh-CN')}
          </p>
        </div>
      ))}
    </div>
  )
}

export default ReviewHistoryPanel
