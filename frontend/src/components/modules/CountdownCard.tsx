import React, { useState, useEffect } from 'react'

interface CountdownCardProps {
  deadline: string | null
  isTimeout?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const CountdownCard: React.FC<CountdownCardProps> = ({ deadline, isTimeout = false, size = 'md' }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    isExpired: boolean
  }>({ days: 0, hours: 0, minutes: 0, isExpired: false })

  useEffect(() => {
    if (!deadline || isTimeout) return

    const calculateTimeLeft = () => {
      const deadlineDate = new Date(deadline)
      const now = new Date()
      const diff = deadlineDate.getTime() - now.getTime()

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, isExpired: true }
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      return { days, hours, minutes, isExpired: false }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 60000) // 每分钟更新一次

    return () => clearInterval(timer)
  }, [deadline, isTimeout])

  // 无截止时间
  if (!deadline) {
    return (
      <div className={`bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex items-center justify-center ${
        size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
      }`}>
        <span className="text-neutral-500">⏰ 无截止期限</span>
      </div>
    )
  }

  // 已超时
  if (isTimeout || timeLeft.isExpired) {
    return (
      <div className={`bg-error-50 border border-error-200 rounded-lg p-3 animate-pulse ${
        size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
      }`}>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold text-error-700">已超时</p>
            <p className="text-xs text-error-600">
              截止于 {new Date(deadline).toLocaleDateString('zh-CN')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 计算紧急程度
  const totalHours = timeLeft.days * 24 + timeLeft.hours
  let urgencyColor = ''
  let urgencyIcon = ''

  if (timeLeft.days > 7) {
    urgencyColor = 'bg-success-50 border-success-200 text-success-800'
    urgencyIcon = '🟢'
  } else if (timeLeft.days >= 3) {
    urgencyColor = 'bg-warning-50 border-warning-200 text-warning-800'
    urgencyIcon = '🟡'
  } else if (totalHours > 0) {
    urgencyColor = 'bg-orange-50 border-orange-200 text-orange-800'
    urgencyIcon = '🟠'
  } else {
    urgencyColor = 'bg-error-50 border-error-200 text-error-800 animate-pulse'
    urgencyIcon = '🔴'
  }

  // 大小样式
  const sizeClasses = {
    sm: 'text-xs p-2',
    md: 'text-sm p-3',
    lg: 'text-base p-4',
  }

  return (
    <div className={`${urgencyColor} border rounded-lg ${sizeClasses[size]}`}>
      <div className="flex items-center space-x-2">
        <span className="text-xl">{urgencyIcon}</span>
        <div className="flex-1">
          <p className={`font-semibold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            剩余时间
          </p>
          <div className={`font-bold ${size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-lg'}`}>
            {timeLeft.days > 0 && <span>{timeLeft.days}<span className="text-xs font-normal">天</span></span>}
            <span>{timeLeft.hours}<span className="text-xs font-normal">时</span></span>
            <span>{timeLeft.minutes}<span className="text-xs font-normal">分</span></span>
          </div>
        </div>
      </div>
      <p className={`text-xs opacity-70 mt-1 ${size === 'sm' ? 'hidden' : ''}`}>
        📅 截止于 {new Date(deadline).toLocaleString('zh-CN')}
      </p>
    </div>
  )
}

export default CountdownCard
