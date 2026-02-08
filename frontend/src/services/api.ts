import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import type { User, Token, LoginCredentials, RegisterData } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<Token> => {
    const response = await api.post<Token>('/api/v1/auth/login', credentials)
    return response.data
  },

  register: async (data: RegisterData): Promise<Token> => {
    const response = await api.post<Token>('/api/v1/auth/register', data)
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/v1/auth/me')
    return response.data
  },
}

// Projects API
export const projectsApi = {
  list: async (skip = 0, limit = 100): Promise<any[]> => {
    const response = await api.get('/api/v1/projects/', { params: { skip, limit } })
    return response.data
  },

  get: async (id: number): Promise<any> => {
    const response = await api.get(`/api/v1/projects/${id}`)
    return response.data
  },

  create: async (data: { name: string; description?: string }): Promise<any> => {
    const response = await api.post('/api/v1/projects/', data)
    return response.data
  },

  update: async (id: number, data: { name?: string; description?: string; status?: string }): Promise<any> => {
    const response = await api.put(`/api/v1/projects/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/projects/${id}`)
  },
}

// Modules API
export const modulesApi = {
  list: async (skip = 0, limit = 100, projectId?: number): Promise<any[]> => {
    const params: any = { skip, limit }
    if (projectId) params.project_id = projectId
    const response = await api.get('/api/v1/modules/', { params })
    return response.data
  },

  get: async (id: number): Promise<any> => {
    const response = await api.get(`/api/v1/modules/${id}`)
    return response.data
  },

  create: async (data: { title: string; description: string; project_id: number; deadline?: string; bounty?: number }): Promise<any> => {
    const response = await api.post('/api/v1/modules/', data)
    return response.data
  },

  update: async (id: number, data: any): Promise<any> => {
    const response = await api.put(`/api/v1/modules/${id}`, data)
    return response.data
  },

  assign: async (id: number): Promise<any> => {
    const response = await api.post(`/api/v1/modules/${id}/assign`)
    return response.data
  },
}

// Deliveries API
export const deliveriesApi = {
  submit: async (data: {
    module_id: number
    content: string
    attachment_url?: string
    attachments?: Array<{ name: string; url: string }>
  }): Promise<any> => {
    const response = await api.post('/api/v1/deliveries/', data)
    return response.data
  },

  list: async (moduleId: number): Promise<any[]> => {
    const response = await api.get(`/api/v1/deliveries/${moduleId}`)
    return response.data
  },

  get: async (deliveryId: number): Promise<any> => {
    const response = await api.get(`/api/v1/deliveries/${deliveryId}`)
    return response.data
  },
}

// Reviews API
export const reviewsApi = {
  create: async (data: { delivery_id: number; decision: string; feedback?: string; reputation_change?: number }): Promise<any> => {
    const response = await api.post('/api/v1/reviews/', data)
    return response.data
  },
}

// Notifications API
export const notificationsApi = {
  list: async (skip = 0, limit = 50, unreadOnly = false): Promise<any[]> => {
    const response = await api.get('/api/v1/notifications/', {
      params: { skip, limit, unread_only: unreadOnly },
    })
    return response.data
  },

  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const response = await api.get('/api/v1/notifications/unread-count')
    return response.data
  },

  markAsRead: async (notificationId: number): Promise<any> => {
    const response = await api.post(`/api/v1/notifications/${notificationId}/read`)
    return response.data
  },

  markAllAsRead: async (): Promise<any> => {
    const response = await api.post('/api/v1/notifications/read-all')
    return response.data
  },
}

export default api
