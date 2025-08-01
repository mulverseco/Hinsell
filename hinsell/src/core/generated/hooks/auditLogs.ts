'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { auditLogsList, auditLogsRead, auditLogsCreate, auditLogsUpdate, auditLogsPartialUpdate, auditLogsDelete } from '@/core/generated/actions/auditLogs'
import {
  AuditLogsListResponseSchema,
  AuditLogsListParamsSchema,
  AuditLogsReadResponseSchema,
  AuditLogsReadParamsSchema,
  AuditLogsCreateResponseSchema,
  AuditLogsCreateRequestSchema,
  AuditLogsUpdateResponseSchema,
  AuditLogsUpdateRequestSchema,
  AuditLogsUpdateParamsSchema,
  AuditLogsPartialUpdateResponseSchema,
  AuditLogsPartialUpdateRequestSchema,
  AuditLogsPartialUpdateParamsSchema,
  AuditLogsDeleteResponseSchema,
  AuditLogsDeleteParamsSchema
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
 * Optimized query hook for GET /audit-logs/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof AuditLogsListResponseSchema>
 */
export function useAuditLogsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['auditLogsList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await auditLogsList({ params: { query: { search, ordering } } })
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
    ...options
  })
}

/**
 * Suspense version for /audit-logs/
 * @returns useSuspenseQuery result with data of type z.infer<typeof AuditLogsListResponseSchema>
 */
export function useSuspenseAuditLogsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['auditLogsList', search, ordering],
    queryFn: async () => {
      const result = await auditLogsList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized query hook for GET /audit-logs/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof AuditLogsReadResponseSchema>
 */
export function useAuditLogsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['auditLogsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await auditLogsRead({ params: { path: { id } } })
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
    ...options
  })
}

/**
 * Suspense version for /audit-logs/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof AuditLogsReadResponseSchema>
 */
export function useSuspenseAuditLogsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['auditLogsRead', id],
    queryFn: async () => {
      const result = await auditLogsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized mutation hook for POST /audit-logs/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuditLogsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuditLogsCreateResponseSchema>, variables: z.infer<typeof AuditLogsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AuditLogsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AuditLogsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AuditLogsCreateRequestSchema>): Promise<z.infer<typeof AuditLogsCreateResponseSchema>> => {
      try {
        const result = await auditLogsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['audit-logs'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['audit-logs'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['audit-logs'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['audit-logs'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AuditLogsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /audit-logs/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuditLogsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuditLogsUpdateResponseSchema>, variables: { body: z.infer<typeof AuditLogsUpdateRequestSchema>, params: z.infer<typeof AuditLogsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof AuditLogsUpdateRequestSchema>, params: z.infer<typeof AuditLogsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof AuditLogsUpdateRequestSchema>, params: z.infer<typeof AuditLogsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof AuditLogsUpdateRequestSchema>, params: z.infer<typeof AuditLogsUpdateParamsSchema> }): Promise<z.infer<typeof AuditLogsUpdateResponseSchema>> => {
      try {
        const result = await auditLogsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['audit-logs'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['audit-logs'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['audit-logs'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['audit-logs'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof AuditLogsUpdateRequestSchema>, params: z.infer<typeof AuditLogsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /audit-logs/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuditLogsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuditLogsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof AuditLogsPartialUpdateRequestSchema>, params: z.infer<typeof AuditLogsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof AuditLogsPartialUpdateRequestSchema>, params: z.infer<typeof AuditLogsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof AuditLogsPartialUpdateRequestSchema>, params: z.infer<typeof AuditLogsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof AuditLogsPartialUpdateRequestSchema>, params: z.infer<typeof AuditLogsPartialUpdateParamsSchema> }): Promise<z.infer<typeof AuditLogsPartialUpdateResponseSchema>> => {
      try {
        const result = await auditLogsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['audit-logs'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['audit-logs'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['audit-logs'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['audit-logs'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof AuditLogsPartialUpdateRequestSchema>, params: z.infer<typeof AuditLogsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /audit-logs/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuditLogsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuditLogsDeleteResponseSchema>, variables: z.infer<typeof AuditLogsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AuditLogsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AuditLogsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AuditLogsDeleteParamsSchema>): Promise<z.infer<typeof AuditLogsDeleteResponseSchema>> => {
      try {
        const result = await auditLogsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['audit-logs'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['audit-logs'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['audit-logs'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['audit-logs'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AuditLogsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}