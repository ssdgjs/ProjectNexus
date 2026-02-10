import React from 'react'

interface EmptyStateProps {
  type: 'no-projects' | 'no-modules' | 'no-deliveries' | 'no-assignees' | 'no-knowledge' | 'no-linked-knowledge'
  action?: {
    label: string
    onClick: () => void
  }
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, action }) => {
  const configurations = {
    'no-projects': {
      icon: '📁',
      title: '还没有项目',
      description: '项目是组织的基石。创建第一个项目，开始拆解和管理任务吧！',
      actionLabel: action?.label || '创建项目',
    },
    'no-modules': {
      icon: '📝',
      title: '还没有任务',
      description: '任务是执行的基本单元。拆解项目目标，创建可执行的任务。',
      commanderAction: '创建任务',
      nodeAction: '浏览所有项目',
    },
    'no-deliveries': {
      icon: '📦',
      title: '还没有交付记录',
      description: '等待承接人提交交付物。提交后，指挥官会进行验收评审。',
    },
    'no-assignees': {
      icon: '👥',
      title: '还没有承接人',
      description: '任务开放承接中，可以主动承接参与任务。',
      actionLabel: action?.label || '立即承接',
    },
    'no-knowledge': {
      icon: '📚',
      title: '知识库为空',
      description: '知识库帮助团队积累经验和智慧。上传文档、代码或其他知识资源。',
      actionLabel: action?.label || '上传知识',
    },
    'no-linked-knowledge': {
      icon: '🔗',
      title: '还没有关联知识',
      description: '关联相关知识可以帮助承接人更好地理解和完成任务。',
    },
  }

  const config = configurations[type]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      {/* Icon */}
      <div className="text-6xl mb-6 animate-pulse">{config.icon}</div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-neutral-900 mb-2">
        {config.title}
      </h3>

      {/* Description */}
      <p className="text-neutral-600 text-center max-w-md mb-6">
        {config.description}
      </p>

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-ethereal font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
