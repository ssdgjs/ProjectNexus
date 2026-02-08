import React from 'react'
import { useForm } from 'react-hook-form'
import { Modal, Button } from '@/components/ui'
import { useAbandonRequest } from '@/services/queries'

interface AbandonRequestModalProps {
  isOpen: boolean
  onClose: () => void
  moduleId: number
  moduleTitle: string
  onSuccess: () => void
}

interface AbandonRequestForm {
  reason: string
}

const AbandonRequestModal: React.FC<AbandonRequestModalProps> = ({
  isOpen,
  onClose,
  moduleId,
  moduleTitle,
  onSuccess,
}) => {
  const abandonRequest = useAbandonRequest()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AbandonRequestForm>()

  const onSubmit = async (data: AbandonRequestForm) => {
    try {
      await abandonRequest.mutateAsync({
        module_id: moduleId,
        reason: data.reason,
      })

      reset()
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to submit abandon request:', error)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset()
        onClose()
      }}
      title="申请放弃任务"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 警告提示 */}
        <div className="bg-warning-50 border border-warning-200 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-warning-800 mb-2">⚠️ 注意事项</h4>
          <ul className="text-sm text-warning-700 space-y-1 list-disc list-inside">
            <li>提交申请后，需要等待指挥官审批</li>
            <li>批准后将释放您的任务槽位</li>
            <li>您将无法再访问此任务</li>
            <li>已完成的工作不会被保存</li>
          </ul>
        </div>

        {/* 模块信息 */}
        <div className="bg-neutral-50 p-3 rounded-lg">
          <p className="text-sm text-neutral-600">
            <span className="font-medium">任务名称：</span>
          </p>
          <p className="text-base font-semibold text-neutral-900">{moduleTitle}</p>
        </div>

        {/* 放弃原因 */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            放弃原因 <span className="text-error-500">*</span>
          </label>
          <textarea
            {...register('reason', {
              required: '请说明放弃原因',
              minLength: { value: 10, message: '原因至少需要10个字符' }
            })}
            placeholder="请详细说明为什么需要放弃此任务..."
            rows={5}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-error-500">{errors.reason.message}</p>
          )}
          <p className="mt-1 text-xs text-neutral-500">
            {errors.reason ? '' : '至少输入10个字符'}
          </p>
        </div>

        {/* 按钮组 */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              reset()
              onClose()
            }}
          >
            取消
          </Button>
          <Button
            type="submit"
            variant="danger"
            loading={abandonRequest.isPending}
          >
            提交申请
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AbandonRequestModal
