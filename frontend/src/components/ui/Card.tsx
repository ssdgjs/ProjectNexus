import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
}) => {
  const baseStyles = 'bg-white rounded-xl border border-neutral-200 p-6'
  const hoverStyles = hover ? 'card-hover cursor-pointer' : ''
  const clickableStyles = onClick ? 'cursor-pointer' : ''

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Card
