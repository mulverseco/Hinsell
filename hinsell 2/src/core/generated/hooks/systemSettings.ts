'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { systemSettingsList, systemSettingsRead, systemSettingsCreate, systemSettingsUpdate, systemSettingsPartialUpdate, systemSettingsDelete } from '@/core/generated/actions/systemSettings'
import {
  SystemSettingsListResponseSchema,
  SystemSettingsListParamsSchema,
  SystemSettingsReadResponseSchema,
  SystemSettingsReadParamsSchema,
  SystemSettingsCreateResponseSchema,
  SystemSettingsCreateRequestSchema,
  SystemSettingsUpdateResponseSchema,
  SystemSettingsUpdateRequestSchema,
  SystemSettingsUpdateParamsSchema,
  SystemSettingsPartialUpdateResponseSchema,
  SystemSettingsPartialUpdateRequestSchema,
  SystemSettingsPartialUpdateParamsSchema,
  SystemSettingsDeleteResponseSchema,
  SystemSettingsDeleteParamsSchema
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
 * Optimized query hook for GET /system-settings/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof SystemSettingsListResponseSchema>
 */
export function useSystemSettingsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof SystemSettingsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['systemSettingsList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await systemSettingsList({ params: { query: { search, ordering } } })
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    staleTime: 600000,
    gcTime: 1200000,
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
 * Suspense version for /system-settings/
 * @returns useSuspenseQuery result with data of type z.infer<typeof SystemSettingsListResponseSchema>
 */
export function useSuspenseSystemSettingsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof SystemSettingsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['systemSettingsList', search, ordering],
    queryFn: async () => {
      const result = await systemSettingsList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 600000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /system-settings/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof SystemSettingsReadResponseSchema>
 */
export function useSystemSettingsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof SystemSettingsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['systemSettingsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await systemSettingsRead({ params: { path: { id } } })
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    staleTime: 600000,
    gcTime: 1200000,
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
 * Suspense version for /system-settings/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof SystemSettingsReadResponseSchema>
 */
export function useSuspenseSystemSettingsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof SystemSettingsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['systemSettingsRead', id],
    queryFn: async () => {
      const result = await systemSettingsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 600000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /system-settings/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useSystemSettingsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof SystemSettingsCreateResponseSchema>, variables: z.infer<typeof SystemSettingsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof SystemSettingsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof SystemSettingsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof SystemSettingsCreateRequestSchema>): Promise<z.infer<typeof SystemSettingsCreateResponseSchema>> => {
      try {
        const result = await systemSettingsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['system-settings'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['system-settings'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['system-settings'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['system-settings'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['system-settings'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['system-settings'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof SystemSettingsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /system-settings/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useSystemSettingsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof SystemSettingsUpdateResponseSchema>, variables: { body: z.infer<typeof SystemSettingsUpdateRequestSchema>, params: z.infer<typeof SystemSettingsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof SystemSettingsUpdateRequestSchema>, params: z.infer<typeof SystemSettingsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof SystemSettingsUpdateRequestSchema>, params: z.infer<typeof SystemSettingsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof SystemSettingsUpdateRequestSchema>, params: z.infer<typeof SystemSettingsUpdateParamsSchema> }): Promise<z.infer<typeof SystemSettingsUpdateResponseSchema>> => {
      try {
        const result = await systemSettingsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['system-settings'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['system-settings'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['system-settings'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['system-settings'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['system-settings'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['system-settings'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof SystemSettingsUpdateRequestSchema>, params: z.infer<typeof SystemSettingsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /system-settings/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useSystemSettingsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof SystemSettingsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof SystemSettingsPartialUpdateRequestSchema>, params: z.infer<typeof SystemSettingsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof SystemSettingsPartialUpdateRequestSchema>, params: z.infer<typeof SystemSettingsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof SystemSettingsPartialUpdateRequestSchema>, params: z.infer<typeof SystemSettingsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof SystemSettingsPartialUpdateRequestSchema>, params: z.infer<typeof SystemSettingsPartialUpdateParamsSchema> }): Promise<z.infer<typeof SystemSettingsPartialUpdateResponseSchema>> => {
      try {
        const result = await systemSettingsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['system-settings'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['system-settings'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['system-settings'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['system-settings'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['system-settings'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['system-settings'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof SystemSettingsPartialUpdateRequestSchema>, params: z.infer<typeof SystemSettingsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /system-settings/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useSystemSettingsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof SystemSettingsDeleteResponseSchema>, variables: z.infer<typeof SystemSettingsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof SystemSettingsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof SystemSettingsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof SystemSettingsDeleteParamsSchema>): Promise<z.infer<typeof SystemSettingsDeleteResponseSchema>> => {
      try {
        const result = await systemSettingsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['system-settings'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['system-settings'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['system-settings'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['system-settings'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['system-settings'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['system-settings'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof SystemSettingsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}