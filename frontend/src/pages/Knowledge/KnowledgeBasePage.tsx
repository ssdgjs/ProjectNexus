import React, { useState } from 'react'
import { useKnowledge } from '@/services/queries'
import { Card, Button, Badge } from '@/components/ui'
import EmptyState from '@/components/ui/EmptyState'
import KnowledgeCard from '@/components/knowledge/KnowledgeCard'
import KnowledgeUploadModal from '@/components/knowledge/KnowledgeUploadModal'
import LinkKnowledgeModal from '@/components/knowledge/LinkKnowledgeModal'

const KnowledgeBasePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFileType, setSelectedFileType] = useState('')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [linkModalData, setLinkModalData] = useState<{
    isOpen: boolean
    knowledgeId: number
    knowledgeTitle: string
  }>({
    isOpen: false,
    knowledgeId: 0,
    knowledgeTitle: '',
  })

  const { data: knowledgeItems, isLoading, refetch } = useKnowledge(
    0,
    50,
    searchTerm || undefined,
    selectedFileType || undefined
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    refetch()
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedFileType('')
  }

  const handleLink = (knowledgeId: number, knowledgeTitle: string) => {
    setLinkModalData({
      isOpen: true,
      knowledgeId,
      knowledgeTitle,
    })
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">知识库</h1>
          <p className="text-neutral-600">共享知识，积累智慧</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          上传知识
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 搜索框 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                搜索知识
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索标题或描述..."
                  className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button type="submit" variant="primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* 文件类型筛选 */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                文件类型
              </label>
              <select
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">全部类型</option>
                <option value="application/zip">ZIP</option>
                <option value="application/pdf">PDF</option>
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPEG</option>
                <option value="text/markdown">Markdown</option>
                <option value="text/plain">TXT</option>
              </select>
            </div>
          </div>

          {/* 筛选状态提示 */}
          {(searchTerm || selectedFileType) && (
            <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-neutral-600">当前筛选：</span>
                {searchTerm && (
                  <Badge variant="info">
                    搜索: {searchTerm}
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="ml-2 hover:text-neutral-900"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedFileType && (
                  <Badge variant="info">
                    类型: {selectedFileType.split('/')[1]?.toUpperCase()}
                    <button
                      type="button"
                      onClick={() => setSelectedFileType('')}
                      className="ml-2 hover:text-neutral-900"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                清除筛选
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* 知识列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : knowledgeItems && knowledgeItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {knowledgeItems.map((item: any) => (
            <KnowledgeCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              fileName={item.file_name}
              fileSize={item.file_size}
              fileType={item.file_type}
              uploaderName={item.uploader_name}
              uploaderId={item.uploader_id}
              uploadedAt={item.uploaded_at}
              linkedModulesCount={item.linked_modules_count}
              isOwned={item.is_owned}
              onLink={() => handleLink(item.id, item.title)}
              onRefresh={() => refetch()}
            />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            type={searchTerm || selectedFileType ? 'no-knowledge' : 'no-knowledge'}
          />
          {(searchTerm || selectedFileType) && (
            <div className="text-center mt-4">
              <p className="text-sm text-neutral-600 mb-2">
                没有找到符合条件的知识
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                清除筛选条件
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* 上传模态框 */}
      <KnowledgeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* 关联模态框 */}
      <LinkKnowledgeModal
        isOpen={linkModalData.isOpen}
        onClose={() => setLinkModalData({ isOpen: false, knowledgeId: 0, knowledgeTitle: '' })}
        knowledgeId={linkModalData.knowledgeId}
        knowledgeTitle={linkModalData.knowledgeTitle}
        onSuccess={() => refetch()}
      />
    </div>
  )
}

export default KnowledgeBasePage
