import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, projectsApi, modulesApi, deliveriesApi, reviewsApi, notificationsApi, abandonRequestsApi, knowledgeApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import type { LoginCredentials, RegisterData } from '@/types'

// Auth hooks
export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const data = await authApi.login(credentials)
      setAuth(data.access_token, data.user)
      localStorage.setItem('token', data.access_token)
      return data
    },
  })
}

export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const result = await authApi.register(data)
      setAuth(result.access_token, result.user)
      localStorage.setItem('token', result.access_token)
      return result
    },
  })
}

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No token found')
      return await authApi.getCurrentUser()
    },
    retry: false,
    enabled: !!localStorage.getItem('token'),
  })
}

// Projects hooks
export const useProjects = (skip = 0, limit = 100) => {
  return useQuery({
    queryKey: ['projects', skip, limit],
    queryFn: () => projectsApi.list(skip, limit),
  })
}

export const useProject = (id: number) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.get(id),
    enabled: !!id,
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

// Modules hooks
export const useModules = (skip = 0, limit = 100, projectId?: number) => {
  return useQuery({
    queryKey: ['modules', skip, limit, projectId],
    queryFn: () => modulesApi.list(skip, limit, projectId),
  })
}

export const useModule = (id: number) => {
  return useQuery({
    queryKey: ['module', id],
    queryFn: () => modulesApi.get(id),
    enabled: !!id,
  })
}

export const useCreateModule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: modulesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
    },
  })
}

export const useAssignModule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => modulesApi.assign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

// Deliveries hooks
export const useSubmitDelivery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      module_id: number
      content: string
      attachment_url?: string
      attachments?: Array<{ name: string; url: string }>
    }) =>
      deliveriesApi.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      queryClient.invalidateQueries({ queryKey: ['deliveries'] })
    },
  })
}

export const useDeliveries = (moduleId: number) => {
  return useQuery({
    queryKey: ['deliveries', moduleId],
    queryFn: () => deliveriesApi.list(moduleId),
    enabled: !!moduleId,
  })
}

// Reviews hooks
export const useCreateReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reviewsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      queryClient.invalidateQueries({ queryKey: ['deliveries'] })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

// Notifications hooks
export const useNotifications = (unreadOnly = false) => {
  return useQuery({
    queryKey: ['notifications', unreadOnly],
    queryFn: () => notificationsApi.list(0, 50, unreadOnly),
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['unreadCount'],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 15000, // Refetch every 15 seconds
  })
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
    },
  })
}

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
    },
  })
}

// Abandon Requests hooks
export const useAbandonRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: abandonRequestsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export const useAbandonRequests = (status?: string) => {
  return useQuery({
    queryKey: ['abandonRequests', status],
    queryFn: () => abandonRequestsApi.list(status),
    enabled: true, // 指挥官总是可以查看
  })
}

export const useReviewAbandonRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ requestId, approve, comment }: { requestId: number; approve: boolean; comment?: string }) => {
      return abandonRequestsApi.review(requestId, { approve, comment })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abandonRequests'] })
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// Knowledge hooks
export const useKnowledge = (skip = 0, limit = 50, search?: string, fileType?: string) => {
  return useQuery({
    queryKey: ['knowledge', skip, limit, search, fileType],
    queryFn: () => knowledgeApi.list(skip, limit, search, fileType),
  })
}

export const useKnowledgeItem = (id: number) => {
  return useQuery({
    queryKey: ['knowledge', id],
    queryFn: () => knowledgeApi.get(id),
    enabled: !!id,
  })
}

export const useUploadKnowledge = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: knowledgeApi.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
    },
  })
}

export const useDeleteKnowledge = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: knowledgeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
    },
  })
}

export const useLinkKnowledge = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ knowledgeId, moduleId }: { knowledgeId: number; moduleId: number }) =>
      knowledgeApi.linkToModule(knowledgeId, moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
      queryClient.invalidateQueries({ queryKey: ['modules'] })
    },
  })
}

export const useUnlinkKnowledge = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ knowledgeId, moduleId }: { knowledgeId: number; moduleId: number }) =>
      knowledgeApi.unlinkFromModule(knowledgeId, moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
      queryClient.invalidateQueries({ queryKey: ['modules'] })
    },
  })
}

export const useKnowledgeLinkedModules = (knowledgeId: number) => {
  return useQuery({
    queryKey: ['knowledgeModules', knowledgeId],
    queryFn: () => knowledgeApi.getLinkedModules(knowledgeId),
    enabled: !!knowledgeId,
  })
}

export const useModuleKnowledge = (moduleId: number) => {
  return useQuery({
    queryKey: ['moduleKnowledge', moduleId],
    queryFn: () => knowledgeApi.getModuleKnowledge(moduleId),
    enabled: !!moduleId,
  })
}
