import React from 'react'
import { Card, Badge, Button } from '@/components/ui'
import { useDeleteKnowledge } from '@/services/queries'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'

interface KnowledgeCardProps {
  id: number
  title: string
  description?: string
  fileName: string
  fileSize: number
  fileType: string
  uploaderName?: string
  uploaderId: number
  uploadedAt: string
  linkedModulesCount: number
  isOwned: boolean
  onLink?: () => void
  onRefresh?: () => void
}

const KnowledgeCard: React.FC<KnowledgeCardProps> = ({
  id,
  title,
  description,
  fileName,
  fileSize,
  fileType: _fileType,
  uploaderName,
  uploaderId: _uploaderId,
  uploadedAt,
  linkedModulesCount,
  isOwned,
  onLink,
  onRefresh,
}) => {
  const { user } = useAuthStore()
  const deleteKnowledge = useDeleteKnowledge()

  const handleDelete = async () => {
    if (!confirm('确定要删除这个知识吗？此操作不可恢复。')) {
      return
    }

    try {
      await deleteKnowledge.mutateAsync(id)
      toast.success('删除成功', '知识已删除')
      onRefresh?.()
    } catch (error: any) {
      console.error('Failed to delete knowledge:', error)
      toast.error('删除失败', error.response?.data?.detail || '请重试')
    }
  }

  const handleDownload = () => {
    // TODO: 实现下载功能
    toast.info('下载功能', '下载功能正在开发中')
  }

  const getFileIcon = () => {
    const ext = fileName.split('.').pop()?.toLowerCase() || ''

    if (['zip'].includes(ext)) {
      return '📦'
    } else if (['md', 'txt'].includes(ext)) {
      return '📄'
    } else if (ext === 'pdf') {
      return '📕'
    } else if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
      return '🖼️'
    } else if (['doc', 'docx'].includes(ext)) {
      return '📝'
    }
    return '📎'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const canDelete = isOwned || user?.role?.toLowerCase() === 'commander'

  return (
    <Card hover className="h-full flex flex-col">
      {/* 头部：文件图标和标题 */}
      <div className="flex items-start space-x-3 mb-3">
        <div className="text-4xl flex-shrink-0">{getFileIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-neutral-900 truncate">{title}</h4>
          <p className="text-xs text-neutral-500 truncate">{fileName}</p>
        </div>
        {linkedModulesCount > 0 && (
          <Badge variant="info" size="sm">{linkedModulesCount} 个关联</Badge>
        )}
      </div>

      {/* 描述 */}
      {description && (
        <p className="text-sm text-neutral-600 mb-3 line-clamp-2 flex-1">
          {description}
        </p>
      )}

      {/* 元信息 */}
      <div className="space-y-2 mb-4 text-xs text-neutral-500">
        <div className="flex items-center justify-between">
          <span>文件大小</span>
          <span className="font-medium">{formatFileSize(fileSize)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>上传者</span>
          <span className="font-medium">{uploaderName || '未知'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>上传时间</span>
          <span className="font-medium">
            {new Date(uploadedAt).toLocaleDateString('zh-CN')}
          </span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center space-x-2 pt-3 border-t border-neutral-200">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={handleDownload}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载
        </Button>

        {onLink && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={onLink}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            关联
          </Button>
        )}

        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            loading={deleteKnowledge.isPending}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        )}
      </div>
    </Card>
  )
}

export default KnowledgeCard
