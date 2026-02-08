import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Modal, Button } from '@/components/ui'
import { useUploadKnowledge } from '@/services/queries'
import FileUpload from './FileUpload'
import { toast } from '@/store/toastStore'

interface KnowledgeUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface KnowledgeUploadForm {
  title: string
  description: string
}

const KnowledgeUploadModal: React.FC<KnowledgeUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const uploadKnowledge = useUploadKnowledge()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<KnowledgeUploadForm>()

  const onSubmit = async (data: KnowledgeUploadForm) => {
    if (!selectedFile) {
      toast.error('请选择文件', '需要上传一个文件')
      return
    }

    setIsUploading(true)
    try {
      await uploadKnowledge.mutateAsync({
        title: data.title,
        description: data.description,
        file: selectedFile,
      })

      toast.success('上传成功', '知识已成功上传到知识库')
      setSelectedFile(null)
      reset()
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to upload knowledge:', error)
      toast.error('上传失败', error.response?.data?.detail || '请重试')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  const handleClose = () => {
    setSelectedFile(null)
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="上传知识"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 说明 */}
        <div className="bg-info-50 border border-info-200 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-info-800 mb-2">📚 知识库说明</h4>
          <ul className="text-sm text-info-700 space-y-1 list-disc list-inside">
            <li>知识库用于沉淀可复用的经验和成果</li>
            <li>支持的文件类型：zip, md, pdf, 图片, doc, txt</li>
            <li>文件大小限制：≤30MB</li>
            <li>所有用户都可以查看和下载知识</li>
          </ul>
        </div>

        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            标题 <span className="text-error-500">*</span>
          </label>
          <input
            {...register('title', {
              required: '请输入标题',
              minLength: { value: 1, message: '标题不能为空' },
              maxLength: { value: 200, message: '标题最多200个字符' }
            })}
            type="text"
            placeholder="给知识起个清晰的名字..."
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-error-500">{errors.title.message}</p>
          )}
        </div>

        {/* 描述 */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            描述
          </label>
          <textarea
            {...register('description', {
              maxLength: { value: 1000, message: '描述最多1000个字符' }
            })}
            placeholder="简要描述这个知识的内容和用途..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-error-500">{errors.description.message}</p>
          )}
        </div>

        {/* 文件上传 */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            文件 <span className="text-error-500">*</span>
          </label>
          <FileUpload
            accept=".zip,.md,.pdf,.png,.jpg,.jpeg,.gif,.doc,.docx,.txt"
            maxSize={30 * 1024 * 1024} // 30MB
            onFileSelect={handleFileSelect}
            disabled={isUploading}
          />

          {/* 已选择的文件 */}
          {selectedFile && (
            <div className="mt-3 p-3 bg-success-50 border border-success-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-success-900">{selectedFile.name}</span>
                <span className="text-xs text-success-700">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-error-500 hover:text-error-700"
                disabled={isUploading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* 按钮组 */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isUploading}
          >
            取消
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isUploading}
          >
            {isUploading ? '上传中...' : '上传知识'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default KnowledgeUploadModal
