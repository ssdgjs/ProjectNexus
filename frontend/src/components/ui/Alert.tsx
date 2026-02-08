import React from 'react'

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  className?: string
}

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className = '',
}) => {
  const configurations = {
    info: {
      container: 'bg-info-50 border-info-200',
      icon: 'ℹ️',
      title: 'text-info-900',
      content: 'text-info-700',
    },
    success: {
      container: 'bg-success-50 border-success-200',
      icon: '✓',
      title: 'text-success-900',
      content: 'text-success-700',
    },
    warning: {
      container: 'bg-warning-50 border-warning-200',
      icon: '⚠️',
      title: 'text-warning-900',
      content: 'text-warning-700',
    },
    error: {
      container: 'bg-error-50 border-error-200',
      icon: '✕',
      title: 'text-error-900',
      content: 'text-error-700',
    },
  }

  const config = configurations[variant]

  return (
    <div className={`border rounded-lg p-4 ${config.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-xl" role="img" aria-label={variant}>
            {config.icon}
          </span>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-semibold mb-1 ${config.title}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${config.content}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Alert
