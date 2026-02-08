import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Modal, Button, Input } from '@/components/ui'
import { useSubmitDelivery } from '@/services/queries'
import { toast } from '@/store/toastStore'

interface DeliverySubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  moduleId: number
  onSuccess: () => void
}

interface Attachment {
  name: string
  url: string
}

interface DeliveryForm {
  content: string
  attachments: Attachment[]
}

const DeliverySubmissionModal: React.FC<DeliverySubmissionModalProps> = ({
  isOpen,
  onClose,
  moduleId,
  onSuccess,
}) => {
  const submitDelivery = useSubmitDelivery()
  const [attachments, setAttachments] = useState<Attachment[]>([
    { name: '', url: '' }
  ])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeliveryForm>({
    defaultValues: {
      content: '',
      attachments: [{ name: '', url: '' }]
    }
  })

  const addAttachment = () => {
    setAttachments([...attachments, { name: '', url: '' }])
  }

  const removeAttachment = (index: number) => {
    if (attachments.length > 1) {
      const newAttachments = attachments.filter((_, i) => i !== index)
      setAttachments(newAttachments)
    }
  }

  const updateAttachment = (index: number, field: 'name' | 'url', value: string) => {
    const newAttachments = [...attachments]
    newAttachments[index][field] = value
    setAttachments(newAttachments)
  }

  const onSubmit = async (data: DeliveryForm) => {
    console.log('📝 表单数据:', data)
    console.log('📎 附件数据:', attachments)

    try {
      // 过滤掉空的附件
      const validAttachments = attachments.filter(a => a.name && a.url)
      console.log('✅ 有效附件:', validAttachments)

      const payload = {
        module_id: moduleId,
        content: data.content,
        attachments: validAttachments.length > 0 ? validAttachments : undefined,
      }
      console.log('🚀 提交数据:', payload)

      await submitDelivery.mutateAsync(payload)
      console.log('✅ 提交成功')

      reset()
      setAttachments([{ name: '', url: '' }])
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('❌ 提交失败:', error)
      console.error('错误详情:', error.response?.data)
      toast.error('提交失败', error.response?.data?.detail || '请重试')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset()
        setAttachments([{ name: '', url: '' }])
        onClose()
      }}
      title="提交交付"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            交付内容
          </label>
          <textarea
            {...register('content', { required: '请输入交付内容' })}
            rows={6}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="请描述您的工作成果..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-error-500">{errors.content.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-neutral-700">
              交付物链接
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addAttachment}
            >
              + 添加链接
            </Button>
          </div>

          <div className="space-y-3">
            {attachments.map((attachment, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 border border-neutral-200 rounded-lg">
                <div className="flex-1 space-y-2">
                  <Input
                    label="名称"
                    placeholder="例如：代码仓库、演示视频、设计文档"
                    value={attachment.name}
                    onChange={(e) => updateAttachment(index, 'name', e.target.value)}
                  />
                  <Input
                    label="链接"
                    placeholder="https://..."
                    value={attachment.url}
                    onChange={(e) => updateAttachment(index, 'url', e.target.value)}
                  />
                </div>
                {attachments.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                    className="mt-6"
                  >
                    删除
                  </Button>
                )}
              </div>
            ))}
          </div>

          {attachments.length === 0 && (
            <p className="text-sm text-neutral-500 text-center py-4">
              点击"添加链接"来添加交付物
            </p>
          )}
        </div>

        <div className="bg-neutral-50 p-3 rounded-lg text-sm text-neutral-600">
          <p className="font-medium mb-1">💡 提示：</p>
          <ul className="list-disc list-inside space-y-1">
            <li>详细描述您完成的工作内容</li>
            <li>可以添加多个交付物链接（代码、文档、演示等）</li>
            <li>建议为每个链接命名，方便指挥官查看</li>
            <li>提交后指挥官将进行验收</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              reset()
              setAttachments([{ name: '', url: '' }])
              onClose()
            }}
          >
            取消
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitDelivery.isPending}
          >
            提交交付
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default DeliverySubmissionModal
