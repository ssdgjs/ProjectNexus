import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  render?: (props: any) => React.ReactElement
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  render,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')

  if (render) {
    return render({ field: props, id: inputId, error })
  }

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`
          w-full px-4 py-2 rounded-lg border
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-error-500' : 'border-neutral-300'}
          ${error ? 'text-error-900' : 'text-neutral-900'}
          placeholder-neutral-400
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
