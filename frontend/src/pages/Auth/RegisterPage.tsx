import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useRegister } from '@/services/queries'
import { Button, Input } from '@/components/ui'

interface RegisterForm {
  username: string
  password: string
  confirmPassword: string
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const [error, setError] = useState<string>('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>()

  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    setError('')
    try {
      await registerMutation.mutateAsync({
        username: data.username,
        password: data.password,
        role: 'node',
      })
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || '注册失败，请重试')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ethereal mb-2">Project Nexus</h1>
          <p className="text-neutral-600">AI 原生分布式组织操作系统</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-6">注册</h2>

          {error && (
            <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
              <p className="text-sm text-error-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="用户名"
              placeholder="请输入用户名（至少3个字符）"
              error={errors.username?.message}
              {...register('username', {
                required: '请输入用户名',
                minLength: { value: 3, message: '用户名至少3个字符' },
              })}
            />

            <Input
              label="密码"
              type="password"
              placeholder="请输入密码（至少6个字符）"
              error={errors.password?.message}
              {...register('password', {
                required: '请输入密码',
                minLength: { value: 6, message: '密码至少6个字符' },
              })}
            />

            <Input
              label="确认密码"
              type="password"
              placeholder="请再次输入密码"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: '请确认密码',
                validate: (value) => value === password || '两次输入的密码不一致',
              })}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isSubmitting}
            >
              注册
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              已有账户？{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
