import React, { useState, useRef } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 200,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<number | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const showTooltip = () => {
    const id = window.setTimeout(() => {
      setIsVisible(true)
    }, delay)
    setTimeoutId(id)
  }

  const hideTooltip = () => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }

  const getPositionClasses = () => {
    switch (placement) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
    }
  }

  const getArrowClasses = () => {
    switch (placement) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 -mt-1 border-t-8 border-t-neutral-900 border-x-8 border-x-transparent'
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-b-8 border-b-neutral-900 border-x-8 border-x-transparent'
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 -ml-1 border-l-8 border-l-neutral-900 border-y-8 border-y-transparent'
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 -mr-1 border-r-8 border-r-neutral-900 border-y-8 border-y-transparent'
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 -mt-1 border-t-8 border-t-neutral-900 border-x-8 border-x-transparent'
    }
  }

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${getPositionClasses()}`}
          style={{ whiteSpace: 'nowrap' }}
        >
          <div className="relative bg-neutral-900 text-white text-xs rounded px-2 py-1 shadow-lg">
            {content}
            <div className={`absolute ${getArrowClasses()}`} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Tooltip
