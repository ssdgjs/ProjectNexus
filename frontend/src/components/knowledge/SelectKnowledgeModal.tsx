import React from 'react'
import { Modal, Button } from '@/components/ui'
import { useKnowledge, useLinkKnowledge } from '@/services/queries'
import { toast } from '@/store/toastStore'

interface SelectKnowledgeModalProps {
  isOpen: boolean
  onClose: () => void
  moduleId: number
  moduleTitle: string
  onSuccess: () => void
}

const SelectKnowledgeModal: React.FC<SelectKnowledgeModalProps> = ({
  isOpen,
  onClose,
  moduleId,
  moduleTitle,
  onSuccess,
}) => {
  const { data: knowledgeItems, isLoading } = useKnowledge(0, 100)
  const linkKnowledge = useLinkKnowledge()

  const handleLink = async (knowledgeId: number, knowledgeTitle: string) => {
    try {
      await linkKnowledge.mutateAsync({
        knowledgeId,
        moduleId,
      })

      toast.success('关联成功', `已将"${knowledgeTitle}"关联到任务`)
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to link knowledge:', error)
      toast.error('关联失败', error.response?.data?.detail || '请重试')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="选择知识关联"
      size="lg"
    >
      <div className="space-y-4">
        {/* 说明 */}
        <div className="bg-info-50 border border-info-200 p-4 rounded-lg">
          <p className="text-sm text-info-700">
            从知识库中选择知识关联到此任务。关联后，任务承接人可以在任务详情页查看相关知识。
          </p>
          <p className="text-xs text-info-600 mt-1 font-medium">
            任务：{moduleTitle}
          </p>
        </div>

        {/* 知识列表 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          </div>
        ) : knowledgeItems && knowledgeItems.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {knowledgeItems.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="text-2xl">
                    {item.file_name.endsWith('.zip') ? '📦' :
                     item.file_name.endsWith('.pdf') ? '📕' :
                     item.file_name.endsWith('.md') ? '📄' :
                     item.file_name.match(/\.(png|jpg|jpeg|gif)$/i) ? '🖼️' : '📎'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{item.title}</p>
                    <p className="text-xs text-neutral-500 truncate">
                      {item.file_name} • {(item.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {item.linked_modules_count > 0 && (
                    <span className="text-xs text-neutral-500">
                      已关联 {item.linked_modules_count} 个任务
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLink(item.id, item.title)}
                  loading={linkKnowledge.isPending}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  关联
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-500 mb-2">知识库暂无内容</p>
            <p className="text-xs text-neutral-400">请先上传知识到知识库</p>
          </div>
        )}

        {/* 关闭按钮 */}
        <div className="flex justify-end pt-4 border-t border-neutral-200">
          <Button variant="ghost" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default SelectKnowledgeModal
