'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { transactionDetailsList, transactionDetailsRead, transactionDetailsCreate, transactionDetailsUpdate, transactionDetailsPartialUpdate, transactionDetailsDelete } from '@/core/generated/actions/transactionDetails'
import {
  TransactionDetailsListResponseSchema,
  TransactionDetailsListParamsSchema,
  TransactionDetailsReadResponseSchema,
  TransactionDetailsReadParamsSchema,
  TransactionDetailsCreateResponseSchema,
  TransactionDetailsCreateRequestSchema,
  TransactionDetailsUpdateResponseSchema,
  TransactionDetailsUpdateRequestSchema,
  TransactionDetailsUpdateParamsSchema,
  TransactionDetailsPartialUpdateResponseSchema,
  TransactionDetailsPartialUpdateRequestSchema,
  TransactionDetailsPartialUpdateParamsSchema,
  TransactionDetailsDeleteResponseSchema,
  TransactionDetailsDeleteParamsSchema
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
 * Optimized query hook for GET /transaction-details/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof TransactionDetailsListResponseSchema>
 */
export function useTransactionDetailsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof TransactionDetailsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['transactionDetailsList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await transactionDetailsList({ params: { query: { search, ordering } } })
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
 * Suspense version for /transaction-details/
 * @returns useSuspenseQuery result with data of type z.infer<typeof TransactionDetailsListResponseSchema>
 */
export function useSuspenseTransactionDetailsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof TransactionDetailsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['transactionDetailsList', search, ordering],
    queryFn: async () => {
      const result = await transactionDetailsList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /transaction-details/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof TransactionDetailsReadResponseSchema>
 */
export function useTransactionDetailsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof TransactionDetailsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['transactionDetailsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await transactionDetailsRead({ params: { path: { id } } })
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
 * Suspense version for /transaction-details/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof TransactionDetailsReadResponseSchema>
 */
export function useSuspenseTransactionDetailsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof TransactionDetailsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['transactionDetailsRead', id],
    queryFn: async () => {
      const result = await transactionDetailsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /transaction-details/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useTransactionDetailsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof TransactionDetailsCreateResponseSchema>, variables: z.infer<typeof TransactionDetailsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof TransactionDetailsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof TransactionDetailsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof TransactionDetailsCreateRequestSchema>): Promise<z.infer<typeof TransactionDetailsCreateResponseSchema>> => {
      try {
        const result = await transactionDetailsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transaction-details'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['transaction-details'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['transaction-details'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transaction-details'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['transaction-details'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['transaction-details'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof TransactionDetailsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /transaction-details/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useTransactionDetailsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof TransactionDetailsUpdateResponseSchema>, variables: { body: z.infer<typeof TransactionDetailsUpdateRequestSchema>, params: z.infer<typeof TransactionDetailsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof TransactionDetailsUpdateRequestSchema>, params: z.infer<typeof TransactionDetailsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof TransactionDetailsUpdateRequestSchema>, params: z.infer<typeof TransactionDetailsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof TransactionDetailsUpdateRequestSchema>, params: z.infer<typeof TransactionDetailsUpdateParamsSchema> }): Promise<z.infer<typeof TransactionDetailsUpdateResponseSchema>> => {
      try {
        const result = await transactionDetailsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transaction-details'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['transaction-details'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['transaction-details'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transaction-details'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['transaction-details'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['transaction-details'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof TransactionDetailsUpdateRequestSchema>, params: z.infer<typeof TransactionDetailsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /transaction-details/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useTransactionDetailsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof TransactionDetailsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof TransactionDetailsPartialUpdateRequestSchema>, params: z.infer<typeof TransactionDetailsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof TransactionDetailsPartialUpdateRequestSchema>, params: z.infer<typeof TransactionDetailsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof TransactionDetailsPartialUpdateRequestSchema>, params: z.infer<typeof TransactionDetailsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof TransactionDetailsPartialUpdateRequestSchema>, params: z.infer<typeof TransactionDetailsPartialUpdateParamsSchema> }): Promise<z.infer<typeof TransactionDetailsPartialUpdateResponseSchema>> => {
      try {
        const result = await transactionDetailsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transaction-details'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['transaction-details'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['transaction-details'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transaction-details'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['transaction-details'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['transaction-details'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof TransactionDetailsPartialUpdateRequestSchema>, params: z.infer<typeof TransactionDetailsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /transaction-details/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useTransactionDetailsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof TransactionDetailsDeleteResponseSchema>, variables: z.infer<typeof TransactionDetailsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof TransactionDetailsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof TransactionDetailsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof TransactionDetailsDeleteParamsSchema>): Promise<z.infer<typeof TransactionDetailsDeleteResponseSchema>> => {
      try {
        const result = await transactionDetailsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transaction-details'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['transaction-details'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['transaction-details'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transaction-details'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['transaction-details'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['transaction-details'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof TransactionDetailsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}