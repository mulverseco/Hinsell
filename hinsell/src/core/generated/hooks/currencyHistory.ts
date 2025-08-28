'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { currencyHistoryList, currencyHistoryRead, currencyHistoryCreate, currencyHistoryUpdate, currencyHistoryPartialUpdate, currencyHistoryDelete } from '@/core/generated/actions/currencyHistory'
import {
  CurrencyHistoryListResponseSchema,
  CurrencyHistoryListParamsSchema,
  CurrencyHistoryReadResponseSchema,
  CurrencyHistoryReadParamsSchema,
  CurrencyHistoryCreateResponseSchema,
  CurrencyHistoryCreateRequestSchema,
  CurrencyHistoryUpdateResponseSchema,
  CurrencyHistoryUpdateRequestSchema,
  CurrencyHistoryUpdateParamsSchema,
  CurrencyHistoryPartialUpdateResponseSchema,
  CurrencyHistoryPartialUpdateRequestSchema,
  CurrencyHistoryPartialUpdateParamsSchema,
  CurrencyHistoryDeleteResponseSchema,
  CurrencyHistoryDeleteParamsSchema
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
 * Optimized query hook for GET /currency-history/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof CurrencyHistoryListResponseSchema>
 */
export function useCurrencyHistoryList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof CurrencyHistoryListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['currencyHistoryList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await currencyHistoryList({ params: { query: { search, ordering } } })
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
 * Suspense version for /currency-history/
 * @returns useSuspenseQuery result with data of type z.infer<typeof CurrencyHistoryListResponseSchema>
 */
export function useSuspenseCurrencyHistoryList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof CurrencyHistoryListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['currencyHistoryList', search, ordering],
    queryFn: async () => {
      const result = await currencyHistoryList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /currency-history/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof CurrencyHistoryReadResponseSchema>
 */
export function useCurrencyHistoryRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof CurrencyHistoryReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['currencyHistoryRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await currencyHistoryRead({ params: { path: { id } } })
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
 * Suspense version for /currency-history/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof CurrencyHistoryReadResponseSchema>
 */
export function useSuspenseCurrencyHistoryRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof CurrencyHistoryReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['currencyHistoryRead', id],
    queryFn: async () => {
      const result = await currencyHistoryRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /currency-history/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCurrencyHistoryCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof CurrencyHistoryCreateResponseSchema>, variables: z.infer<typeof CurrencyHistoryCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof CurrencyHistoryCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof CurrencyHistoryCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof CurrencyHistoryCreateRequestSchema>): Promise<z.infer<typeof CurrencyHistoryCreateResponseSchema>> => {
      try {
        const result = await currencyHistoryCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['currency-history'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['currency-history'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['currency-history'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['currency-history'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['currency-history'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['currency-history'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof CurrencyHistoryCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /currency-history/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCurrencyHistoryUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof CurrencyHistoryUpdateResponseSchema>, variables: { body: z.infer<typeof CurrencyHistoryUpdateRequestSchema>, params: z.infer<typeof CurrencyHistoryUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof CurrencyHistoryUpdateRequestSchema>, params: z.infer<typeof CurrencyHistoryUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof CurrencyHistoryUpdateRequestSchema>, params: z.infer<typeof CurrencyHistoryUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof CurrencyHistoryUpdateRequestSchema>, params: z.infer<typeof CurrencyHistoryUpdateParamsSchema> }): Promise<z.infer<typeof CurrencyHistoryUpdateResponseSchema>> => {
      try {
        const result = await currencyHistoryUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['currency-history'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['currency-history'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['currency-history'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['currency-history'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['currency-history'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['currency-history'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof CurrencyHistoryUpdateRequestSchema>, params: z.infer<typeof CurrencyHistoryUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /currency-history/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCurrencyHistoryPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof CurrencyHistoryPartialUpdateResponseSchema>, variables: { body: z.infer<typeof CurrencyHistoryPartialUpdateRequestSchema>, params: z.infer<typeof CurrencyHistoryPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof CurrencyHistoryPartialUpdateRequestSchema>, params: z.infer<typeof CurrencyHistoryPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof CurrencyHistoryPartialUpdateRequestSchema>, params: z.infer<typeof CurrencyHistoryPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof CurrencyHistoryPartialUpdateRequestSchema>, params: z.infer<typeof CurrencyHistoryPartialUpdateParamsSchema> }): Promise<z.infer<typeof CurrencyHistoryPartialUpdateResponseSchema>> => {
      try {
        const result = await currencyHistoryPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['currency-history'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['currency-history'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['currency-history'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['currency-history'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['currency-history'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['currency-history'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof CurrencyHistoryPartialUpdateRequestSchema>, params: z.infer<typeof CurrencyHistoryPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /currency-history/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCurrencyHistoryDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof CurrencyHistoryDeleteResponseSchema>, variables: z.infer<typeof CurrencyHistoryDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof CurrencyHistoryDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof CurrencyHistoryDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof CurrencyHistoryDeleteParamsSchema>): Promise<z.infer<typeof CurrencyHistoryDeleteResponseSchema>> => {
      try {
        const result = await currencyHistoryDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['currency-history'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['currency-history'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['currency-history'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['currency-history'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['currency-history'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['currency-history'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof CurrencyHistoryDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}