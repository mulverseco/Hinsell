'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { apiWebhooksDeliveriesList, apiWebhooksDeliveriesRead, apiWebhooksEndpointsList, apiWebhooksEndpointsRead, apiWebhooksEndpointsStatistics, apiWebhooksEventsList, apiWebhooksEventsRead, apiWebhooksLogsList, apiWebhooksLogsRead, apiWebhooksDeliveriesCreate, apiWebhooksDeliveriesUpdate, apiWebhooksDeliveriesPartialUpdate, apiWebhooksDeliveriesDelete, apiWebhooksDeliveriesRetry, apiWebhooksEndpointsCreate, apiWebhooksEndpointsUpdate, apiWebhooksEndpointsPartialUpdate, apiWebhooksEndpointsDelete, apiWebhooksEndpointsReactivate, apiWebhooksEndpointsSuspend, apiWebhooksEndpointsTest, apiWebhooksEventsCreate, apiWebhooksEventsUpdate, apiWebhooksEventsPartialUpdate, apiWebhooksEventsDelete, apiWebhooksLogsCreate, apiWebhooksLogsUpdate, apiWebhooksLogsPartialUpdate, apiWebhooksLogsDelete } from '@/core/generated/actions/api'
import {
  ApiWebhooksDeliveriesListResponseSchema,
  ApiWebhooksDeliveriesListParamsSchema,
  ApiWebhooksDeliveriesReadResponseSchema,
  ApiWebhooksDeliveriesReadParamsSchema,
  ApiWebhooksEndpointsListResponseSchema,
  ApiWebhooksEndpointsListParamsSchema,
  ApiWebhooksEndpointsReadResponseSchema,
  ApiWebhooksEndpointsReadParamsSchema,
  ApiWebhooksEndpointsStatisticsResponseSchema,
  ApiWebhooksEndpointsStatisticsParamsSchema,
  ApiWebhooksEventsListResponseSchema,
  ApiWebhooksEventsListParamsSchema,
  ApiWebhooksEventsReadResponseSchema,
  ApiWebhooksEventsReadParamsSchema,
  ApiWebhooksLogsListResponseSchema,
  ApiWebhooksLogsListParamsSchema,
  ApiWebhooksLogsReadResponseSchema,
  ApiWebhooksLogsReadParamsSchema,
  ApiWebhooksDeliveriesCreateResponseSchema,
  ApiWebhooksDeliveriesCreateRequestSchema,
  ApiWebhooksDeliveriesUpdateResponseSchema,
  ApiWebhooksDeliveriesUpdateRequestSchema,
  ApiWebhooksDeliveriesUpdateParamsSchema,
  ApiWebhooksDeliveriesPartialUpdateResponseSchema,
  ApiWebhooksDeliveriesPartialUpdateRequestSchema,
  ApiWebhooksDeliveriesPartialUpdateParamsSchema,
  ApiWebhooksDeliveriesDeleteResponseSchema,
  ApiWebhooksDeliveriesDeleteParamsSchema,
  ApiWebhooksDeliveriesRetryResponseSchema,
  ApiWebhooksDeliveriesRetryRequestSchema,
  ApiWebhooksDeliveriesRetryParamsSchema,
  ApiWebhooksEndpointsCreateResponseSchema,
  ApiWebhooksEndpointsCreateRequestSchema,
  ApiWebhooksEndpointsUpdateResponseSchema,
  ApiWebhooksEndpointsUpdateRequestSchema,
  ApiWebhooksEndpointsUpdateParamsSchema,
  ApiWebhooksEndpointsPartialUpdateResponseSchema,
  ApiWebhooksEndpointsPartialUpdateRequestSchema,
  ApiWebhooksEndpointsPartialUpdateParamsSchema,
  ApiWebhooksEndpointsDeleteResponseSchema,
  ApiWebhooksEndpointsDeleteParamsSchema,
  ApiWebhooksEndpointsReactivateResponseSchema,
  ApiWebhooksEndpointsReactivateRequestSchema,
  ApiWebhooksEndpointsReactivateParamsSchema,
  ApiWebhooksEndpointsSuspendResponseSchema,
  ApiWebhooksEndpointsSuspendRequestSchema,
  ApiWebhooksEndpointsSuspendParamsSchema,
  ApiWebhooksEndpointsTestResponseSchema,
  ApiWebhooksEndpointsTestRequestSchema,
  ApiWebhooksEndpointsTestParamsSchema,
  ApiWebhooksEventsCreateResponseSchema,
  ApiWebhooksEventsCreateRequestSchema,
  ApiWebhooksEventsUpdateResponseSchema,
  ApiWebhooksEventsUpdateRequestSchema,
  ApiWebhooksEventsUpdateParamsSchema,
  ApiWebhooksEventsPartialUpdateResponseSchema,
  ApiWebhooksEventsPartialUpdateRequestSchema,
  ApiWebhooksEventsPartialUpdateParamsSchema,
  ApiWebhooksEventsDeleteResponseSchema,
  ApiWebhooksEventsDeleteParamsSchema,
  ApiWebhooksLogsCreateResponseSchema,
  ApiWebhooksLogsCreateRequestSchema,
  ApiWebhooksLogsUpdateResponseSchema,
  ApiWebhooksLogsUpdateRequestSchema,
  ApiWebhooksLogsUpdateParamsSchema,
  ApiWebhooksLogsPartialUpdateResponseSchema,
  ApiWebhooksLogsPartialUpdateRequestSchema,
  ApiWebhooksLogsPartialUpdateParamsSchema,
  ApiWebhooksLogsDeleteResponseSchema,
  ApiWebhooksLogsDeleteParamsSchema
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
 * Optimized query hook for GET /api/webhooks/deliveries/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ApiWebhooksDeliveriesListResponseSchema>
 */
export function useApiWebhooksDeliveriesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksDeliveriesListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['apiWebhooksDeliveriesList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await apiWebhooksDeliveriesList({ params: { query: { search, ordering } } })
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
 * Suspense version for /api/webhooks/deliveries/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ApiWebhooksDeliveriesListResponseSchema>
 */
export function useSuspenseApiWebhooksDeliveriesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksDeliveriesListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['apiWebhooksDeliveriesList', search, ordering],
    queryFn: async () => {
      const result = await apiWebhooksDeliveriesList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /api/webhooks/deliveries/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ApiWebhooksDeliveriesReadResponseSchema>
 */
export function useApiWebhooksDeliveriesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksDeliveriesReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['apiWebhooksDeliveriesRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await apiWebhooksDeliveriesRead({ params: { path: { id } } })
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
 * Suspense version for /api/webhooks/deliveries/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ApiWebhooksDeliveriesReadResponseSchema>
 */
export function useSuspenseApiWebhooksDeliveriesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksDeliveriesReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['apiWebhooksDeliveriesRead', id],
    queryFn: async () => {
      const result = await apiWebhooksDeliveriesRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /api/webhooks/endpoints/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ApiWebhooksEndpointsListResponseSchema>
 */
export function useApiWebhooksEndpointsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksEndpointsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['apiWebhooksEndpointsList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await apiWebhooksEndpointsList({ params: { query: { search, ordering } } })
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
 * Suspense version for /api/webhooks/endpoints/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ApiWebhooksEndpointsListResponseSchema>
 */
export function useSuspenseApiWebhooksEndpointsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksEndpointsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['apiWebhooksEndpointsList', search, ordering],
    queryFn: async () => {
      const result = await apiWebhooksEndpointsList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /api/webhooks/endpoints/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ApiWebhooksEndpointsReadResponseSchema>
 */
export function useApiWebhooksEndpointsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksEndpointsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['apiWebhooksEndpointsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await apiWebhooksEndpointsRead({ params: { path: { id } } })
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
 * Suspense version for /api/webhooks/endpoints/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ApiWebhooksEndpointsReadResponseSchema>
 */
export function useSuspenseApiWebhooksEndpointsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksEndpointsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['apiWebhooksEndpointsRead', id],
    queryFn: async () => {
      const result = await apiWebhooksEndpointsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /api/webhooks/endpoints/{id}/statistics/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ApiWebhooksEndpointsStatisticsResponseSchema>
 */
export function useApiWebhooksEndpointsStatistics(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksEndpointsStatisticsResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['apiWebhooksEndpointsStatistics', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await apiWebhooksEndpointsStatistics({ params: { path: { id } } })
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
 * Suspense version for /api/webhooks/endpoints/{id}/statistics/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ApiWebhooksEndpointsStatisticsResponseSchema>
 */
export function useSuspenseApiWebhooksEndpointsStatistics(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksEndpointsStatisticsResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['apiWebhooksEndpointsStatistics', id],
    queryFn: async () => {
      const result = await apiWebhooksEndpointsStatistics({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /api/webhooks/events/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ApiWebhooksEventsListResponseSchema>
 */
export function useApiWebhooksEventsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksEventsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['apiWebhooksEventsList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await apiWebhooksEventsList({ params: { query: { search, ordering } } })
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
 * Suspense version for /api/webhooks/events/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ApiWebhooksEventsListResponseSchema>
 */
export function useSuspenseApiWebhooksEventsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksEventsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['apiWebhooksEventsList', search, ordering],
    queryFn: async () => {
      const result = await apiWebhooksEventsList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /api/webhooks/events/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ApiWebhooksEventsReadResponseSchema>
 */
export function useApiWebhooksEventsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksEventsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['apiWebhooksEventsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await apiWebhooksEventsRead({ params: { path: { id } } })
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
 * Suspense version for /api/webhooks/events/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ApiWebhooksEventsReadResponseSchema>
 */
export function useSuspenseApiWebhooksEventsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksEventsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['apiWebhooksEventsRead', id],
    queryFn: async () => {
      const result = await apiWebhooksEventsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /api/webhooks/logs/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ApiWebhooksLogsListResponseSchema>
 */
export function useApiWebhooksLogsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksLogsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['apiWebhooksLogsList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await apiWebhooksLogsList({ params: { query: { search, ordering } } })
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
 * Suspense version for /api/webhooks/logs/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ApiWebhooksLogsListResponseSchema>
 */
export function useSuspenseApiWebhooksLogsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksLogsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['apiWebhooksLogsList', search, ordering],
    queryFn: async () => {
      const result = await apiWebhooksLogsList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /api/webhooks/logs/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ApiWebhooksLogsReadResponseSchema>
 */
export function useApiWebhooksLogsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksLogsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['apiWebhooksLogsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await apiWebhooksLogsRead({ params: { path: { id } } })
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
 * Suspense version for /api/webhooks/logs/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ApiWebhooksLogsReadResponseSchema>
 */
export function useSuspenseApiWebhooksLogsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ApiWebhooksLogsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['apiWebhooksLogsRead', id],
    queryFn: async () => {
      const result = await apiWebhooksLogsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /api/webhooks/deliveries/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksDeliveriesCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksDeliveriesCreateResponseSchema>, variables: z.infer<typeof ApiWebhooksDeliveriesCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ApiWebhooksDeliveriesCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ApiWebhooksDeliveriesCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ApiWebhooksDeliveriesCreateRequestSchema>): Promise<z.infer<typeof ApiWebhooksDeliveriesCreateResponseSchema>> => {
      try {
        const result = await apiWebhooksDeliveriesCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ApiWebhooksDeliveriesCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /api/webhooks/deliveries/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksDeliveriesUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksDeliveriesUpdateResponseSchema>, variables: { body: z.infer<typeof ApiWebhooksDeliveriesUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksDeliveriesUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ApiWebhooksDeliveriesUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksDeliveriesUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ApiWebhooksDeliveriesUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksDeliveriesUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ApiWebhooksDeliveriesUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksDeliveriesUpdateParamsSchema> }): Promise<z.infer<typeof ApiWebhooksDeliveriesUpdateResponseSchema>> => {
      try {
        const result = await apiWebhooksDeliveriesUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ApiWebhooksDeliveriesUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksDeliveriesUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /api/webhooks/deliveries/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksDeliveriesPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksDeliveriesPartialUpdateResponseSchema>, variables: { body: z.infer<typeof ApiWebhooksDeliveriesPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksDeliveriesPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ApiWebhooksDeliveriesPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksDeliveriesPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ApiWebhooksDeliveriesPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksDeliveriesPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ApiWebhooksDeliveriesPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksDeliveriesPartialUpdateParamsSchema> }): Promise<z.infer<typeof ApiWebhooksDeliveriesPartialUpdateResponseSchema>> => {
      try {
        const result = await apiWebhooksDeliveriesPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ApiWebhooksDeliveriesPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksDeliveriesPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /api/webhooks/deliveries/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksDeliveriesDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksDeliveriesDeleteResponseSchema>, variables: z.infer<typeof ApiWebhooksDeliveriesDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ApiWebhooksDeliveriesDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ApiWebhooksDeliveriesDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ApiWebhooksDeliveriesDeleteParamsSchema>): Promise<z.infer<typeof ApiWebhooksDeliveriesDeleteResponseSchema>> => {
      try {
        const result = await apiWebhooksDeliveriesDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ApiWebhooksDeliveriesDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /api/webhooks/deliveries/{id}/retry/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksDeliveriesRetryMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksDeliveriesRetryResponseSchema>, variables: { body: z.infer<typeof ApiWebhooksDeliveriesRetryRequestSchema>, params: z.infer<typeof ApiWebhooksDeliveriesRetryParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ApiWebhooksDeliveriesRetryRequestSchema>, params: z.infer<typeof ApiWebhooksDeliveriesRetryParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ApiWebhooksDeliveriesRetryRequestSchema>, params: z.infer<typeof ApiWebhooksDeliveriesRetryParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ApiWebhooksDeliveriesRetryRequestSchema>, params: z.infer<typeof ApiWebhooksDeliveriesRetryParamsSchema> }): Promise<z.infer<typeof ApiWebhooksDeliveriesRetryResponseSchema>> => {
      try {
        const result = await apiWebhooksDeliveriesRetry(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ApiWebhooksDeliveriesRetryRequestSchema>, params: z.infer<typeof ApiWebhooksDeliveriesRetryParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /api/webhooks/endpoints/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksEndpointsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksEndpointsCreateResponseSchema>, variables: z.infer<typeof ApiWebhooksEndpointsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ApiWebhooksEndpointsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ApiWebhooksEndpointsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ApiWebhooksEndpointsCreateRequestSchema>): Promise<z.infer<typeof ApiWebhooksEndpointsCreateResponseSchema>> => {
      try {
        const result = await apiWebhooksEndpointsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ApiWebhooksEndpointsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /api/webhooks/endpoints/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksEndpointsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksEndpointsUpdateResponseSchema>, variables: { body: z.infer<typeof ApiWebhooksEndpointsUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ApiWebhooksEndpointsUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ApiWebhooksEndpointsUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ApiWebhooksEndpointsUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsUpdateParamsSchema> }): Promise<z.infer<typeof ApiWebhooksEndpointsUpdateResponseSchema>> => {
      try {
        const result = await apiWebhooksEndpointsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ApiWebhooksEndpointsUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /api/webhooks/endpoints/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksEndpointsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksEndpointsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof ApiWebhooksEndpointsPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ApiWebhooksEndpointsPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ApiWebhooksEndpointsPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ApiWebhooksEndpointsPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsPartialUpdateParamsSchema> }): Promise<z.infer<typeof ApiWebhooksEndpointsPartialUpdateResponseSchema>> => {
      try {
        const result = await apiWebhooksEndpointsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ApiWebhooksEndpointsPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /api/webhooks/endpoints/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksEndpointsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksEndpointsDeleteResponseSchema>, variables: z.infer<typeof ApiWebhooksEndpointsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ApiWebhooksEndpointsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ApiWebhooksEndpointsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ApiWebhooksEndpointsDeleteParamsSchema>): Promise<z.infer<typeof ApiWebhooksEndpointsDeleteResponseSchema>> => {
      try {
        const result = await apiWebhooksEndpointsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ApiWebhooksEndpointsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /api/webhooks/endpoints/{id}/reactivate/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksEndpointsReactivateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksEndpointsReactivateResponseSchema>, variables: { body: z.infer<typeof ApiWebhooksEndpointsReactivateRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsReactivateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ApiWebhooksEndpointsReactivateRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsReactivateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ApiWebhooksEndpointsReactivateRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsReactivateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ApiWebhooksEndpointsReactivateRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsReactivateParamsSchema> }): Promise<z.infer<typeof ApiWebhooksEndpointsReactivateResponseSchema>> => {
      try {
        const result = await apiWebhooksEndpointsReactivate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ApiWebhooksEndpointsReactivateRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsReactivateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /api/webhooks/endpoints/{id}/suspend/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksEndpointsSuspendMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksEndpointsSuspendResponseSchema>, variables: { body: z.infer<typeof ApiWebhooksEndpointsSuspendRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsSuspendParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ApiWebhooksEndpointsSuspendRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsSuspendParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ApiWebhooksEndpointsSuspendRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsSuspendParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ApiWebhooksEndpointsSuspendRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsSuspendParamsSchema> }): Promise<z.infer<typeof ApiWebhooksEndpointsSuspendResponseSchema>> => {
      try {
        const result = await apiWebhooksEndpointsSuspend(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ApiWebhooksEndpointsSuspendRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsSuspendParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /api/webhooks/endpoints/{id}/test/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksEndpointsTestMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksEndpointsTestResponseSchema>, variables: { body: z.infer<typeof ApiWebhooksEndpointsTestRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsTestParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ApiWebhooksEndpointsTestRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsTestParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ApiWebhooksEndpointsTestRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsTestParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ApiWebhooksEndpointsTestRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsTestParamsSchema> }): Promise<z.infer<typeof ApiWebhooksEndpointsTestResponseSchema>> => {
      try {
        const result = await apiWebhooksEndpointsTest(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ApiWebhooksEndpointsTestRequestSchema>, params: z.infer<typeof ApiWebhooksEndpointsTestParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /api/webhooks/events/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksEventsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksEventsCreateResponseSchema>, variables: z.infer<typeof ApiWebhooksEventsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ApiWebhooksEventsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ApiWebhooksEventsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ApiWebhooksEventsCreateRequestSchema>): Promise<z.infer<typeof ApiWebhooksEventsCreateResponseSchema>> => {
      try {
        const result = await apiWebhooksEventsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ApiWebhooksEventsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /api/webhooks/events/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksEventsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksEventsUpdateResponseSchema>, variables: { body: z.infer<typeof ApiWebhooksEventsUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEventsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ApiWebhooksEventsUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEventsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ApiWebhooksEventsUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEventsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ApiWebhooksEventsUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEventsUpdateParamsSchema> }): Promise<z.infer<typeof ApiWebhooksEventsUpdateResponseSchema>> => {
      try {
        const result = await apiWebhooksEventsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ApiWebhooksEventsUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEventsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /api/webhooks/events/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksEventsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksEventsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof ApiWebhooksEventsPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEventsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ApiWebhooksEventsPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEventsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ApiWebhooksEventsPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEventsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ApiWebhooksEventsPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEventsPartialUpdateParamsSchema> }): Promise<z.infer<typeof ApiWebhooksEventsPartialUpdateResponseSchema>> => {
      try {
        const result = await apiWebhooksEventsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ApiWebhooksEventsPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksEventsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /api/webhooks/events/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksEventsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksEventsDeleteResponseSchema>, variables: z.infer<typeof ApiWebhooksEventsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ApiWebhooksEventsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ApiWebhooksEventsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ApiWebhooksEventsDeleteParamsSchema>): Promise<z.infer<typeof ApiWebhooksEventsDeleteResponseSchema>> => {
      try {
        const result = await apiWebhooksEventsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ApiWebhooksEventsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /api/webhooks/logs/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksLogsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksLogsCreateResponseSchema>, variables: z.infer<typeof ApiWebhooksLogsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ApiWebhooksLogsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ApiWebhooksLogsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ApiWebhooksLogsCreateRequestSchema>): Promise<z.infer<typeof ApiWebhooksLogsCreateResponseSchema>> => {
      try {
        const result = await apiWebhooksLogsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ApiWebhooksLogsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /api/webhooks/logs/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksLogsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksLogsUpdateResponseSchema>, variables: { body: z.infer<typeof ApiWebhooksLogsUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksLogsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ApiWebhooksLogsUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksLogsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ApiWebhooksLogsUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksLogsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ApiWebhooksLogsUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksLogsUpdateParamsSchema> }): Promise<z.infer<typeof ApiWebhooksLogsUpdateResponseSchema>> => {
      try {
        const result = await apiWebhooksLogsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ApiWebhooksLogsUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksLogsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /api/webhooks/logs/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksLogsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksLogsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof ApiWebhooksLogsPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksLogsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ApiWebhooksLogsPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksLogsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ApiWebhooksLogsPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksLogsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ApiWebhooksLogsPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksLogsPartialUpdateParamsSchema> }): Promise<z.infer<typeof ApiWebhooksLogsPartialUpdateResponseSchema>> => {
      try {
        const result = await apiWebhooksLogsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ApiWebhooksLogsPartialUpdateRequestSchema>, params: z.infer<typeof ApiWebhooksLogsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /api/webhooks/logs/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useApiWebhooksLogsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof ApiWebhooksLogsDeleteResponseSchema>, variables: z.infer<typeof ApiWebhooksLogsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ApiWebhooksLogsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ApiWebhooksLogsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ApiWebhooksLogsDeleteParamsSchema>): Promise<z.infer<typeof ApiWebhooksLogsDeleteResponseSchema>> => {
      try {
        const result = await apiWebhooksLogsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['api'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['api'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['api'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['api'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['api'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ApiWebhooksLogsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}