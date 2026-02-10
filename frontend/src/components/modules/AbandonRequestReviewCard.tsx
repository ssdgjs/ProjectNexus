import React from 'react'
import { Card, Badge, Button, Avatar } from '@/components/ui'
import { useReviewAbandonRequest } from '@/services/queries'

interface AbandonRequestReviewCardProps {
  requestId: number
  moduleTitle: string
  requesterName: string
  reason: string
  status: string
  reviewComment?: string
  createdAt: string
  onSuccess: () => void
}

const AbandonRequestReviewCard: React.FC<AbandonRequestReviewCardProps> = ({
  requestId,
  moduleTitle,
  requesterName,
  reason,
  status,
  reviewComment,
  createdAt,
  onSuccess,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false)
  const reviewAbandonRequest = useReviewAbandonRequest()

  const handleReview = async (approve: boolean) => {
    setIsProcessing(true)
    try {
      await reviewAbandonRequest.mutateAsync({
        requestId,
        approve,
        comment: '', // 可以添加评论输入框
      })
      onSuccess()
    } catch (error) {
      console.error('Failed to review abandon request:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">⏳ 待审批</Badge>
      case 'approved':
        return <Badge variant="success">✓ 已批准</Badge>
      case 'rejected':
        return <Badge variant="error">✕ 已拒绝</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const isPending = status === 'pending'

  return (
    <Card className="border-l-4 border-warning-300">
      <div className="p-4">
        {/* 状态和申请信息 */}
        <div className="flex items-start justify-between mb-3">
          {getStatusBadge()}
          <p className="text-xs text-neutral-500">
            {new Date(createdAt).toLocaleString('zh-CN')}
          </p>
        </div>

        {/* 任务信息 */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-neutral-700 mb-1">📋 任务信息</h4>
          <p className="text-base font-semibold text-neutral-900">{moduleTitle}</p>
        </div>

        {/* 申请人信息 */}
        <div className="flex items-center space-x-2 mb-3">
          <Avatar name={requesterName} size="sm" />
          <div>
            <p className="text-sm font-medium text-neutral-900">{requesterName}</p>
            <p className="text-xs text-neutral-500">申请人</p>
          </div>
        </div>

        {/* 放弃原因 */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-neutral-700 mb-1">📝 放弃原因</h4>
          <p className="text-sm text-neutral-700 bg-white p-2 rounded border border-neutral-200">
            {reason}
          </p>
        </div>

        {/* 审批意见 */}
        {reviewComment && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-neutral-700 mb-1">💬 审批意见</h4>
            <p className="text-sm text-neutral-700 bg-white p-2 rounded border border-neutral-200">
              {reviewComment}
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        {isPending && (
          <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-200">
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleReview(false)}
              disabled={isProcessing}
            >
              拒绝申请
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleReview(true)}
              disabled={isProcessing}
            >
              批准申请
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

export default AbandonRequestReviewCard
