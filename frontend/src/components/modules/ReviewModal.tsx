import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Modal, Button, Input, Avatar } from '@/components/ui'
import { useCreateReview } from '@/services/queries'
import { toast } from '@/store/toastStore'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  deliveryId: number
  submitterName: string
  moduleTitle: string
  allAssignees?: Array<{ id: number; username: string; user_id: number }>
  onSuccess: () => void
}

interface ReviewForm {
  decision: string
  feedback: string
  reputation_change: number
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  deliveryId,
  submitterName,
  moduleTitle,
  allAssignees = [],
  onSuccess,
}) => {
  const createReview = useCreateReview()
  const [selectedDecision, setSelectedDecision] = useState<string>('')
  const [useEqualDistribution, setUseEqualDistribution] = useState(true)
  const [individualScores, setIndividualScores] = useState<Record<number, number>>({})
  const [showTemplates, setShowTemplates] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ReviewForm>()

  const totalScore = watch('reputation_change') || 0
  const assigneeCount = allAssignees.length || 1

  // 计算平均分配
  useEffect(() => {
    if (useEqualDistribution && allAssignees.length > 0 && totalScore > 0) {
      const equalScore = Math.floor(totalScore / assigneeCount)
      const scores: Record<number, number> = {}
      allAssignees.forEach(assignee => {
        scores[assignee.id] = equalScore
      })
      setIndividualScores(scores)
    }
  }, [useEqualDistribution, totalScore, assigneeCount, allAssignees])

  const onSubmit = async (data: ReviewForm) => {
    try {
      if (allAssignees.length > 1 && !useEqualDistribution) {
        // 使用多人评分 API
        const scoreAllocations = allAssignees.map(assignee => ({
          assignee_id: assignee.id,
          score: individualScores[assignee.id] || 0,
        }))

        await fetch('/api/v1/reviews/with-scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            delivery_id: deliveryId,
            decision: data.decision,
            feedback: data.feedback,
            reputation_change: data.decision === 'pass' ? totalScore : undefined,
            score_allocations: scoreAllocations,
          }),
        })
      } else {
        // 使用简单验收 API
        await createReview.mutateAsync({
          delivery_id: deliveryId,
          decision: data.decision,
          feedback: data.feedback,
          reputation_change: data.decision === 'pass' ? (data.reputation_change || 0) : undefined,
        })
      }

      reset()
      setSelectedDecision('')
      setIndividualScores({})
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to create review:', error)
      toast.error('验收失败', error.response?.data?.detail)
    }
  }

  const decisionOptions = [
    {
      value: 'pass',
      label: '通过',
      description: '任务完成良好，给予奖励',
      color: 'success',
      icon: '✓',
    },
    {
      value: 'reject',
      label: '拒绝',
      description: '需要修改，请说明原因',
      color: 'error',
      icon: '✕',
    },
    {
      value: 'close',
      label: '关闭',
      description: '取消任务，保存成果',
      color: 'warning',
      icon: '−',
    },
  ]

  const isMultiPerson = allAssignees.length > 1

  // 快捷回复模板
  const feedbackTemplates = {
    pass: [
      '完成出色，超出预期！',
      '符合要求，质量良好',
      '基本达到验收标准',
    ],
    reject: [
      '代码质量需改进，请参考最佳实践',
      '功能不完整，缺少：',
      '文档不充分，需要补充：',
    ],
    close: [
      '需求变更，关闭任务',
      '技术方案调整，重新派发',
    ],
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset()
        setSelectedDecision('')
        setIndividualScores({})
        onClose()
      }}
      title="验收交付"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Delivery Info */}
        <div className="bg-neutral-50 p-4 rounded-lg">
          <p className="text-sm text-neutral-600">
            <span className="font-medium">承接人：</span>
            {isMultiPerson ? allAssignees.map(a => a.username).join(', ') : submitterName}
          </p>
          <p className="text-sm text-neutral-600">
            <span className="font-medium">模块：</span>{moduleTitle}
          </p>
          {isMultiPerson && (
            <p className="text-sm text-neutral-600">
              <span className="font-medium">协作人数：</span>{allAssignees.length} 人
            </p>
          )}
        </div>

        {/* Decision Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            验收决定 <span className="text-error-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {decisionOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSelectedDecision(option.value)
                  setValue('decision', option.value)
                }}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${selectedDecision === option.value
                    ? `border-${option.color}-500 bg-${option.color}-50`
                    : 'border-neutral-200 hover:border-neutral-300'
                  }
                `}
              >
                <div className="text-2xl mb-1">{option.icon}</div>
                <div className={`font-semibold text-${option.color}-700`}>
                  {option.label}
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
          <input
            type="hidden"
            {...register('decision', { required: '请选择验收决定' })}
          />
          {errors.decision && (
            <p className="mt-1 text-sm text-error-500">{errors.decision.message}</p>
          )}
        </div>

        {/* Scoring Guide */}
        {selectedDecision === 'pass' && (
          <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-primary-900 mb-2 flex items-center">
              💡 评分参考
            </h4>
            <div className="text-sm text-primary-800 space-y-1">
              <p>• 承接人数: <strong>{assigneeCount} 人</strong></p>
              <p>• 建议分数范围：</p>
              <ul className="ml-4 list-disc space-y-0.5">
                <li>优秀: 总分的 100%-120%</li>
                <li>良好: 总分的 80%-99%</li>
                <li>合格: 总分的 60%-79%</li>
              </ul>
            </div>
          </div>
        )}

        {/* Reputation Change (only for pass) */}
        {selectedDecision === 'pass' && (
          <>
            <Input
              label="总奖励分数"
              type="number"
              placeholder="输入总奖励分数"
              {...register('reputation_change', { required: '通过时必须设置奖励分数' })}
              error={errors.reputation_change?.message}
            />

            {isMultiPerson && (
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-neutral-700">
                    分数分配方式
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setUseEqualDistribution(true)}
                      className={`px-3 py-1 rounded text-sm ${
                        useEqualDistribution
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      平均分配
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseEqualDistribution(false)}
                      className={`px-3 py-1 rounded text-sm ${
                        !useEqualDistribution
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      自定义分配
                    </button>
                  </div>
                                        </div>

                {useEqualDistribution ? (
                  <div className="text-sm text-neutral-600">
                    平均每人: <span className="font-semibold">{Math.floor(totalScore / assigneeCount)}</span> 分
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allAssignees.map((assignee) => (
                      <div key={assignee.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar name={assignee.username} size="sm" />
                          <span className="text-sm">{assignee.username}</span>
                        </div>
                        <input
                          type="number"
                          value={individualScores[assignee.id] || 0}
                          onChange={(e) =>
                            setIndividualScores({
                              ...individualScores,
                              [assignee.id]: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-24 px-2 py-1 text-sm border border-neutral-300 rounded"
                        />
                      </div>
                    ))}
                    <div className="text-sm text-neutral-600 pt-2 border-t">
                      已分配: <span className="font-semibold">
                        {Object.values(individualScores).reduce((a, b) => a + b, 0)}
                      </span> / {totalScore}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Feedback */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-neutral-700">
              反馈意见 {selectedDecision === 'reject' && <span className="text-error-500">*</span>}
            </label>
            {selectedDecision && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                {showTemplates ? '隐藏模板' : '选择模板'}
              </Button>
            )}
          </div>

          {/* Quick Templates */}
          {showTemplates && selectedDecision && feedbackTemplates[selectedDecision as keyof typeof feedbackTemplates] && (
            <div className="mb-3 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
              <p className="text-xs text-neutral-600 mb-2">点击模板快速填充：</p>
              <div className="space-y-1">
                {feedbackTemplates[selectedDecision as keyof typeof feedbackTemplates].map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setValue('feedback', template)
                      setShowTemplates(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm bg-white border border-neutral-300 rounded hover:bg-primary-50 hover:border-primary-300 transition-colors"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          )}

          <textarea
            {...register('feedback', {
              required: selectedDecision === 'reject' ? '拒绝时必须提供反馈' : false,
            })}
            placeholder="请提供您的反馈..."
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.feedback && (
            <p className="mt-1 text-sm text-error-500">{errors.feedback.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              reset()
              setSelectedDecision('')
              setIndividualScores({})
              onClose()
            }}
          >
            取消
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={createReview.isPending}
            disabled={!selectedDecision}
          >
            提交验收
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ReviewModal
