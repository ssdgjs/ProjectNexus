import React from 'react'
import { Button } from '@/components/ui'

interface Attachment {
  name: string
  url: string
}

interface DeliveryPreviewProps {
  attachments: Attachment[]
}

const DeliveryPreview: React.FC<DeliveryPreviewProps> = ({ attachments }) => {
  if (!attachments || attachments.length === 0) {
    return (
      <div className="text-center py-6 text-neutral-500 text-sm">
        📎 暂无附件
      </div>
    )
  }

  const getFileIcon = (url: string, name: string) => {
    const lowerUrl = url.toLowerCase()
    const lowerName = name.toLowerCase()

    // 图片
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) || lowerName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return '🖼️'
    }
    // PDF
    if (lowerUrl.match(/\.pdf$/i) || lowerName.match(/\.pdf$/i)) {
      return '📄'
    }
    // 代码仓库
    if (lowerUrl.includes('github') || lowerUrl.includes('gitlab') || lowerUrl.includes('gitee')) {
      return '💻'
    }
    // 压缩包
    if (lowerUrl.match(/\.(zip|rar|7z|tar)$/i) || lowerName.match(/\.(zip|rar|7z|tar)$/i)) {
      return '📦'
    }
    // Markdown
    if (lowerUrl.match(/\.md$/i) || lowerName.match(/\.md$/i)) {
      return '📝'
    }
    // 默认
    return '📎'
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-neutral-900 flex items-center">
        📎 交付物预览 ({attachments.length})
      </h4>
      {attachments.map((attachment, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg hover:border-primary-300 transition-colors"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">
              {getFileIcon(attachment.url, attachment.name)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {attachment.name}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {attachment.url}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(attachment.url, '_blank')}
            className="flex-shrink-0"
          >
            查看
          </Button>
        </div>
      ))}
    </div>
  )
}

export default DeliveryPreview
