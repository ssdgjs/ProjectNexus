import React, { useCallback, useState } from 'react'

interface FileUploadProps {
  accept: string
  maxSize: number // in bytes
  onFileSelect: (file: File) => void
  disabled?: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSize,
  onFileSelect,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      validateAndSelectFile(files[0])
    }
  }, [disabled])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      validateAndSelectFile(files[0])
    }
  }, [])

  const validateAndSelectFile = (file: File) => {
    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
      alert(`文件大小超过限制（最大 ${maxSizeMB}MB）`)
      return
    }

    // Check file type
    const acceptedTypes = accept.split(',').map((t) => t.trim())
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const isAccepted = acceptedTypes.some((type) => {
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase()
      }
      return file.type.match(type)
    })

    if (!isAccepted) {
      alert(`不支持的文件类型。允许的类型：${accept}`)
      return
    }

    onFileSelect(file)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging
          ? 'border-primary-500 bg-primary-50'
          : 'border-neutral-300 hover:border-primary-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />

      <div className="space-y-2">
        <svg
          className="mx-auto h-12 w-12 text-neutral-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="text-sm text-neutral-600">
          <p className="font-medium">拖拽文件到此处，或点击选择</p>
          <p className="text-xs text-neutral-500 mt-1">
            支持类型：{accept} | 最大 {formatFileSize(maxSize)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FileUpload
