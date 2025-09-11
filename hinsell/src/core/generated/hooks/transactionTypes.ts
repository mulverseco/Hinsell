'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { transactionTypesList, transactionTypesRead, transactionTypesCreate, transactionTypesUpdate, transactionTypesPartialUpdate, transactionTypesDelete } from '@/core/generated/actions/transactionTypes'
import {
  TransactionTypesListResponseSchema,
  TransactionTypesListParamsSchema,
  TransactionTypesReadResponseSchema,
  TransactionTypesReadParamsSchema,
  TransactionTypesCreateResponseSchema,
  TransactionTypesCreateRequestSchema,
  TransactionTypesUpdateResponseSchema,
  TransactionTypesUpdateRequestSchema,
  TransactionTypesUpdateParamsSchema,
  TransactionTypesPartialUpdateResponseSchema,
  TransactionTypesPartialUpdateRequestSchema,
  TransactionTypesPartialUpdateParamsSchema,
  TransactionTypesDeleteResponseSchema,
  TransactionTypesDeleteParamsSchema
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
 * Optimized query hook for GET /transaction-types/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof TransactionTypesListResponseSchema>
 */
export function useTransactionTypesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof TransactionTypesListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['transactionTypesList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await transactionTypesList({ params: { query: { search, ordering } } })
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
 * Suspense version for /transaction-types/
 * @returns useSuspenseQuery result with data of type z.infer<typeof TransactionTypesListResponseSchema>
 */
export function useSuspenseTransactionTypesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof TransactionTypesListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['transactionTypesList', search, ordering],
    queryFn: async () => {
      const result = await transactionTypesList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /transaction-types/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof TransactionTypesReadResponseSchema>
 */
export function useTransactionTypesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof TransactionTypesReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['transactionTypesRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await transactionTypesRead({ params: { path: { id } } })
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
 * Suspense version for /transaction-types/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof TransactionTypesReadResponseSchema>
 */
export function useSuspenseTransactionTypesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof TransactionTypesReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['transactionTypesRead', id],
    queryFn: async () => {
      const result = await transactionTypesRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /transaction-types/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useTransactionTypesCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof TransactionTypesCreateResponseSchema>, variables: z.infer<typeof TransactionTypesCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof TransactionTypesCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof TransactionTypesCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof TransactionTypesCreateRequestSchema>): Promise<z.infer<typeof TransactionTypesCreateResponseSchema>> => {
      try {
        const result = await transactionTypesCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transaction-types'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['transaction-types'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['transaction-types'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transaction-types'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['transaction-types'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['transaction-types'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof TransactionTypesCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /transaction-types/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useTransactionTypesUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof TransactionTypesUpdateResponseSchema>, variables: { body: z.infer<typeof TransactionTypesUpdateRequestSchema>, params: z.infer<typeof TransactionTypesUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof TransactionTypesUpdateRequestSchema>, params: z.infer<typeof TransactionTypesUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof TransactionTypesUpdateRequestSchema>, params: z.infer<typeof TransactionTypesUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof TransactionTypesUpdateRequestSchema>, params: z.infer<typeof TransactionTypesUpdateParamsSchema> }): Promise<z.infer<typeof TransactionTypesUpdateResponseSchema>> => {
      try {
        const result = await transactionTypesUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transaction-types'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['transaction-types'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['transaction-types'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transaction-types'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['transaction-types'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['transaction-types'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof TransactionTypesUpdateRequestSchema>, params: z.infer<typeof TransactionTypesUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /transaction-types/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useTransactionTypesPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof TransactionTypesPartialUpdateResponseSchema>, variables: { body: z.infer<typeof TransactionTypesPartialUpdateRequestSchema>, params: z.infer<typeof TransactionTypesPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof TransactionTypesPartialUpdateRequestSchema>, params: z.infer<typeof TransactionTypesPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof TransactionTypesPartialUpdateRequestSchema>, params: z.infer<typeof TransactionTypesPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof TransactionTypesPartialUpdateRequestSchema>, params: z.infer<typeof TransactionTypesPartialUpdateParamsSchema> }): Promise<z.infer<typeof TransactionTypesPartialUpdateResponseSchema>> => {
      try {
        const result = await transactionTypesPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transaction-types'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['transaction-types'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['transaction-types'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transaction-types'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['transaction-types'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['transaction-types'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof TransactionTypesPartialUpdateRequestSchema>, params: z.infer<typeof TransactionTypesPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /transaction-types/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useTransactionTypesDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof TransactionTypesDeleteResponseSchema>, variables: z.infer<typeof TransactionTypesDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof TransactionTypesDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof TransactionTypesDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof TransactionTypesDeleteParamsSchema>): Promise<z.infer<typeof TransactionTypesDeleteResponseSchema>> => {
      try {
        const result = await transactionTypesDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transaction-types'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['transaction-types'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['transaction-types'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transaction-types'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['transaction-types'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['transaction-types'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof TransactionTypesDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}