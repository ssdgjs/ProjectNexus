import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useLogin } from '@/services/queries'
import { Button, Input } from '@/components/ui'

interface LoginForm {
  username: string
  password: string
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const login = useLogin()
  const [error, setError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setError('')
    try {
      await login.mutateAsync(data)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || '登录失败，请检查用户名和密码')
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

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-6">登录</h2>

          {error && (
            <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
              <p className="text-sm text-error-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="用户名"
              placeholder="请输入用户名"
              error={errors.username?.message}
              {...register('username', { required: '请输入用户名' })}
            />

            <Input
              label="密码"
              type="password"
              placeholder="请输入密码"
              error={errors.password?.message}
              {...register('password', { required: '请输入密码' })}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isSubmitting}
            >
              登录
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              还没有账户？{' '}
              <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
