'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { notificationsList, notificationsRead, notificationsCreate, notificationsUpdate, notificationsPartialUpdate, notificationsDelete, notificationsMarkAsRead } from '@/core/generated/actions/notifications'
import {
  NotificationsListResponseSchema,
  NotificationsListParamsSchema,
  NotificationsReadResponseSchema,
  NotificationsReadParamsSchema,
  NotificationsCreateResponseSchema,
  NotificationsCreateRequestSchema,
  NotificationsUpdateResponseSchema,
  NotificationsUpdateRequestSchema,
  NotificationsUpdateParamsSchema,
  NotificationsPartialUpdateResponseSchema,
  NotificationsPartialUpdateRequestSchema,
  NotificationsPartialUpdateParamsSchema,
  NotificationsDeleteResponseSchema,
  NotificationsDeleteParamsSchema,
  NotificationsMarkAsReadResponseSchema,
  NotificationsMarkAsReadRequestSchema,
  NotificationsMarkAsReadParamsSchema
} from '@/core/generated/schemas'
import type { z } from 'zod'

// Search params parsers for filtering and sorting
const searchParamsParser = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault(''),
  sort: parseAsString.withDefault(''),
  filter: parseAsString.withDefault(''),
}

// Error handling utility
function handleActionError(error: unknown): never {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  toast.error(message)
  throw new Error(message)
}

/**
 * Optimized query hook for GET /notifications/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof NotificationsListResponseSchema>
 */
export function useNotificationsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof NotificationsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['notificationsList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await notificationsList({ params: { query: { search, ordering } } })
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    staleTime: 180000,
    gcTime: 360000,
    enabled: true && (options?.enabled ?? true),
    refetchOnWindowFocus: false,
    refetchInterval: options?.refetchInterval,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('4')) return false
      return failureCount < 3
    },
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Suspense version for /notifications/
 * @returns useSuspenseQuery result with data of type z.infer<typeof NotificationsListResponseSchema>
 */
export function useSuspenseNotificationsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof NotificationsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['notificationsList', search, ordering],
    queryFn: async () => {
      const result = await notificationsList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /notifications/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof NotificationsReadResponseSchema>
 */
export function useNotificationsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof NotificationsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['notificationsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await notificationsRead({ params: { path: { id } } })
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    staleTime: 180000,
    gcTime: 360000,
    enabled: !!id && (options?.enabled ?? true),
    refetchOnWindowFocus: false,
    refetchInterval: options?.refetchInterval,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('4')) return false
      return failureCount < 3
    },
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Suspense version for /notifications/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof NotificationsReadResponseSchema>
 */
export function useSuspenseNotificationsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof NotificationsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['notificationsRead', id],
    queryFn: async () => {
      const result = await notificationsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /notifications/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useNotificationsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof NotificationsCreateResponseSchema>, variables: z.infer<typeof NotificationsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof NotificationsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof NotificationsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof NotificationsCreateRequestSchema>): Promise<z.infer<typeof NotificationsCreateResponseSchema>> => {
      try {
        const result = await notificationsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['notifications'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['notifications'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['notifications'], context.previousData)
      }
      
      // Show error toast
      if (options?.showToast !== false) {
        toast.error(error.message || 'Operation failed')
      }
      
      // Custom error handler
      options?.onError?.(error as Error, variables)
    },
    
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof NotificationsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /notifications/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useNotificationsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof NotificationsUpdateResponseSchema>, variables: { body: z.infer<typeof NotificationsUpdateRequestSchema>, params: z.infer<typeof NotificationsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof NotificationsUpdateRequestSchema>, params: z.infer<typeof NotificationsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof NotificationsUpdateRequestSchema>, params: z.infer<typeof NotificationsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof NotificationsUpdateRequestSchema>, params: z.infer<typeof NotificationsUpdateParamsSchema> }): Promise<z.infer<typeof NotificationsUpdateResponseSchema>> => {
      try {
        const result = await notificationsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['notifications'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['notifications'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['notifications'], context.previousData)
      }
      
      // Show error toast
      if (options?.showToast !== false) {
        toast.error(error.message || 'Operation failed')
      }
      
      // Custom error handler
      options?.onError?.(error as Error, variables)
    },
    
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof NotificationsUpdateRequestSchema>, params: z.infer<typeof NotificationsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /notifications/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useNotificationsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof NotificationsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof NotificationsPartialUpdateRequestSchema>, params: z.infer<typeof NotificationsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof NotificationsPartialUpdateRequestSchema>, params: z.infer<typeof NotificationsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof NotificationsPartialUpdateRequestSchema>, params: z.infer<typeof NotificationsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof NotificationsPartialUpdateRequestSchema>, params: z.infer<typeof NotificationsPartialUpdateParamsSchema> }): Promise<z.infer<typeof NotificationsPartialUpdateResponseSchema>> => {
      try {
        const result = await notificationsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['notifications'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['notifications'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['notifications'], context.previousData)
      }
      
      // Show error toast
      if (options?.showToast !== false) {
        toast.error(error.message || 'Operation failed')
      }
      
      // Custom error handler
      options?.onError?.(error as Error, variables)
    },
    
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof NotificationsPartialUpdateRequestSchema>, params: z.infer<typeof NotificationsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /notifications/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useNotificationsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof NotificationsDeleteResponseSchema>, variables: z.infer<typeof NotificationsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof NotificationsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof NotificationsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof NotificationsDeleteParamsSchema>): Promise<z.infer<typeof NotificationsDeleteResponseSchema>> => {
      try {
        const result = await notificationsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['notifications'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['notifications'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['notifications'], context.previousData)
      }
      
      // Show error toast
      if (options?.showToast !== false) {
        toast.error(error.message || 'Operation failed')
      }
      
      // Custom error handler
      options?.onError?.(error as Error, variables)
    },
    
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof NotificationsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /notifications/{id}/mark_as_read/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useNotificationsMarkAsReadMutation(options?: {
  onSuccess?: (data: z.infer<typeof NotificationsMarkAsReadResponseSchema>, variables: { body: z.infer<typeof NotificationsMarkAsReadRequestSchema>, params: z.infer<typeof NotificationsMarkAsReadParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof NotificationsMarkAsReadRequestSchema>, params: z.infer<typeof NotificationsMarkAsReadParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof NotificationsMarkAsReadRequestSchema>, params: z.infer<typeof NotificationsMarkAsReadParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof NotificationsMarkAsReadRequestSchema>, params: z.infer<typeof NotificationsMarkAsReadParamsSchema> }): Promise<z.infer<typeof NotificationsMarkAsReadResponseSchema>> => {
      try {
        const result = await notificationsMarkAsRead(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['notifications'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['notifications'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['notifications'], context.previousData)
      }
      
      // Show error toast
      if (options?.showToast !== false) {
        toast.error(error.message || 'Operation failed')
      }
      
      // Custom error handler
      options?.onError?.(error as Error, variables)
    },
    
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof NotificationsMarkAsReadRequestSchema>, params: z.infer<typeof NotificationsMarkAsReadParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}