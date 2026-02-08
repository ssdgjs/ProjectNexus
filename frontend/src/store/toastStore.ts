import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  description?: string
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: Toast = {
      id,
      duration: 3000,
      ...toast,
    }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // 自动移除
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, newToast.duration)
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearAll: () => set({ toasts: [] }),
}))

// 快捷方法
export const toast = {
  success: (message: string, description?: string) => {
    useToastStore.getState().addToast({ type: 'success', message, description })
  },
  error: (message: string, description?: string) => {
    useToastStore.getState().addToast({ type: 'error', message, description, duration: 5000 })
  },
  warning: (message: string, description?: string) => {
    useToastStore.getState().addToast({ type: 'warning', message, description })
  },
  info: (message: string, description?: string) => {
    useToastStore.getState().addToast({ type: 'info', message, description })
  },
}
