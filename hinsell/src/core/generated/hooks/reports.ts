'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { reportsList, reportsAvailableModels, reportsRead, reportsPreview, reportsCreate, reportsValidateQuery, reportsUpdate, reportsPartialUpdate, reportsDelete, reportsExecute } from '@/core/generated/actions/reports'
import {
  ReportsListResponseSchema,
  ReportsListParamsSchema,
  ReportsAvailableModelsResponseSchema,
  ReportsAvailableModelsParamsSchema,
  ReportsReadResponseSchema,
  ReportsReadParamsSchema,
  ReportsPreviewResponseSchema,
  ReportsPreviewParamsSchema,
  ReportsCreateResponseSchema,
  ReportsCreateRequestSchema,
  ReportsValidateQueryResponseSchema,
  ReportsValidateQueryRequestSchema,
  ReportsUpdateResponseSchema,
  ReportsUpdateRequestSchema,
  ReportsUpdateParamsSchema,
  ReportsPartialUpdateResponseSchema,
  ReportsPartialUpdateRequestSchema,
  ReportsPartialUpdateParamsSchema,
  ReportsDeleteResponseSchema,
  ReportsDeleteParamsSchema,
  ReportsExecuteResponseSchema,
  ReportsExecuteRequestSchema,
  ReportsExecuteParamsSchema
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
 * Optimized query hook for GET /reports/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ReportsListResponseSchema>
 */
export function useReportsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ReportsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['reportsList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await reportsList({ params: { query: { search, ordering } } })
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
 * Suspense version for /reports/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ReportsListResponseSchema>
 */
export function useSuspenseReportsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ReportsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['reportsList', search, ordering],
    queryFn: async () => {
      const result = await reportsList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /reports/available_models/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ReportsAvailableModelsResponseSchema>
 */
export function useReportsAvailableModels(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ReportsAvailableModelsResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['reportsAvailableModels', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await reportsAvailableModels({ params: { query: { search, ordering } } })
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
 * Suspense version for /reports/available_models/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ReportsAvailableModelsResponseSchema>
 */
export function useSuspenseReportsAvailableModels(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ReportsAvailableModelsResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['reportsAvailableModels', search, ordering],
    queryFn: async () => {
      const result = await reportsAvailableModels({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /reports/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ReportsReadResponseSchema>
 */
export function useReportsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ReportsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['reportsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await reportsRead({ params: { path: { id } } })
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
 * Suspense version for /reports/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ReportsReadResponseSchema>
 */
export function useSuspenseReportsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ReportsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['reportsRead', id],
    queryFn: async () => {
      const result = await reportsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /reports/{id}/preview/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ReportsPreviewResponseSchema>
 */
export function useReportsPreview(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ReportsPreviewResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['reportsPreview', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await reportsPreview({ params: { path: { id } } })
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
 * Suspense version for /reports/{id}/preview/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ReportsPreviewResponseSchema>
 */
export function useSuspenseReportsPreview(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ReportsPreviewResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['reportsPreview', id],
    queryFn: async () => {
      const result = await reportsPreview({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /reports/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useReportsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ReportsCreateResponseSchema>, variables: z.infer<typeof ReportsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ReportsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ReportsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ReportsCreateRequestSchema>): Promise<z.infer<typeof ReportsCreateResponseSchema>> => {
      try {
        const result = await reportsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reports'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['reports'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['reports'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['reports'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ReportsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /reports/validate_query/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useReportsValidateQueryMutation(options?: {
  onSuccess?: (data: z.infer<typeof ReportsValidateQueryResponseSchema>, variables: z.infer<typeof ReportsValidateQueryRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ReportsValidateQueryRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ReportsValidateQueryRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ReportsValidateQueryRequestSchema>): Promise<z.infer<typeof ReportsValidateQueryResponseSchema>> => {
      try {
        const result = await reportsValidateQuery(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reports'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['reports'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['reports'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['reports'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ReportsValidateQueryRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /reports/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useReportsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ReportsUpdateResponseSchema>, variables: { body: z.infer<typeof ReportsUpdateRequestSchema>, params: z.infer<typeof ReportsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ReportsUpdateRequestSchema>, params: z.infer<typeof ReportsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ReportsUpdateRequestSchema>, params: z.infer<typeof ReportsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ReportsUpdateRequestSchema>, params: z.infer<typeof ReportsUpdateParamsSchema> }): Promise<z.infer<typeof ReportsUpdateResponseSchema>> => {
      try {
        const result = await reportsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reports'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['reports'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['reports'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['reports'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ReportsUpdateRequestSchema>, params: z.infer<typeof ReportsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /reports/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useReportsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ReportsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof ReportsPartialUpdateRequestSchema>, params: z.infer<typeof ReportsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ReportsPartialUpdateRequestSchema>, params: z.infer<typeof ReportsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ReportsPartialUpdateRequestSchema>, params: z.infer<typeof ReportsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ReportsPartialUpdateRequestSchema>, params: z.infer<typeof ReportsPartialUpdateParamsSchema> }): Promise<z.infer<typeof ReportsPartialUpdateResponseSchema>> => {
      try {
        const result = await reportsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reports'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['reports'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['reports'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['reports'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ReportsPartialUpdateRequestSchema>, params: z.infer<typeof ReportsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /reports/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useReportsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof ReportsDeleteResponseSchema>, variables: z.infer<typeof ReportsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ReportsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ReportsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ReportsDeleteParamsSchema>): Promise<z.infer<typeof ReportsDeleteResponseSchema>> => {
      try {
        const result = await reportsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reports'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['reports'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['reports'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['reports'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ReportsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /reports/{id}/execute/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useReportsExecuteMutation(options?: {
  onSuccess?: (data: z.infer<typeof ReportsExecuteResponseSchema>, variables: { body: z.infer<typeof ReportsExecuteRequestSchema>, params: z.infer<typeof ReportsExecuteParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ReportsExecuteRequestSchema>, params: z.infer<typeof ReportsExecuteParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ReportsExecuteRequestSchema>, params: z.infer<typeof ReportsExecuteParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ReportsExecuteRequestSchema>, params: z.infer<typeof ReportsExecuteParamsSchema> }): Promise<z.infer<typeof ReportsExecuteResponseSchema>> => {
      try {
        const result = await reportsExecute(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reports'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['reports'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['reports'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['reports'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ReportsExecuteRequestSchema>, params: z.infer<typeof ReportsExecuteParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}