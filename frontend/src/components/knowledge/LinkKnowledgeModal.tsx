import React from 'react'
import { useForm } from 'react-hook-form'
import { Modal, Button } from '@/components/ui'
import { useLinkKnowledge, useModules } from '@/services/queries'
import { toast } from '@/store/toastStore'

interface LinkKnowledgeModalProps {
  isOpen: boolean
  onClose: () => void
  knowledgeId: number
  knowledgeTitle: string
  onSuccess: () => void
}

interface LinkKnowledgeForm {
  module_id: number
}

const LinkKnowledgeModal: React.FC<LinkKnowledgeModalProps> = ({
  isOpen,
  onClose,
  knowledgeId,
  knowledgeTitle,
  onSuccess,
}) => {
  const linkKnowledge = useLinkKnowledge()
  const { data: modules, isLoading: modulesLoading } = useModules(0, 100)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LinkKnowledgeForm>()

  const onSubmit = async (data: LinkKnowledgeForm) => {
    try {
      await linkKnowledge.mutateAsync({
        knowledgeId,
        moduleId: data.module_id,
      })

      toast.success('关联成功', `已将"${knowledgeTitle}"关联到任务`)
      reset()
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to link knowledge:', error)
      toast.error('关联失败', error.response?.data?.detail || '请重试')
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="关联知识到任务"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 说明 */}
        <div className="bg-info-50 border border-info-200 p-4 rounded-lg">
          <p className="text-sm text-info-700">
            将知识关联到任务后，承接人可以在任务详情页查看相关知识。
          </p>
          <p className="text-xs text-info-600 mt-1 font-medium">
            知识：{knowledgeTitle}
          </p>
        </div>

        {/* 任务选择 */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            选择任务 <span className="text-error-500">*</span>
          </label>

          {modulesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <select
              {...register('module_id', {
                required: '请选择一个任务'
              })}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- 请选择任务 --</option>
              {modules?.map((module: any) => (
                <option key={module.id} value={module.id}>
                  {module.title} ({module.status === 'open' ? '可承接' : module.status === 'in_progress' ? '进行中' : module.status})
                </option>
              ))}
            </select>
          )}

          {errors.module_id && (
            <p className="mt-1 text-sm text-error-500">{errors.module_id.message}</p>
          )}
        </div>

        {/* 提示 */}
        <div className="bg-neutral-50 p-3 rounded-lg">
          <p className="text-xs text-neutral-600">
            💡 提示：您可以在任务详情页的"关联知识"区域查看所有已关联的知识。
          </p>
        </div>

        {/* 按钮组 */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={linkKnowledge.isPending}
          >
            取消
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={linkKnowledge.isPending}
          >
            {linkKnowledge.isPending ? '关联中...' : '确认关联'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default LinkKnowledgeModal
