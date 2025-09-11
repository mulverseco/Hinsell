'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { transactionHeadersList, transactionHeadersRead, transactionHeadersCreate, transactionHeadersUpdate, transactionHeadersPartialUpdate, transactionHeadersDelete, transactionHeadersApprove, transactionHeadersPost, transactionHeadersReverse } from '@/core/generated/actions/transactionHeaders'
import {
  TransactionHeadersListResponseSchema,
  TransactionHeadersListParamsSchema,
  TransactionHeadersReadResponseSchema,
  TransactionHeadersReadParamsSchema,
  TransactionHeadersCreateResponseSchema,
  TransactionHeadersCreateRequestSchema,
  TransactionHeadersUpdateResponseSchema,
  TransactionHeadersUpdateRequestSchema,
  TransactionHeadersUpdateParamsSchema,
  TransactionHeadersPartialUpdateResponseSchema,
  TransactionHeadersPartialUpdateRequestSchema,
  TransactionHeadersPartialUpdateParamsSchema,
  TransactionHeadersDeleteResponseSchema,
  TransactionHeadersDeleteParamsSchema,
  TransactionHeadersApproveResponseSchema,
  TransactionHeadersApproveRequestSchema,
  TransactionHeadersApproveParamsSchema,
  TransactionHeadersPostResponseSchema,
  TransactionHeadersPostRequestSchema,
  TransactionHeadersPostParamsSchema,
  TransactionHeadersReverseResponseSchema,
  TransactionHeadersReverseRequestSchema,
  TransactionHeadersReverseParamsSchema
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
 * Optimized query hook for GET /transaction-headers/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof TransactionHeadersListResponseSchema>
 */
export function useTransactionHeadersList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof TransactionHeadersListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['transactionHeadersList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await transactionHeadersList({ params: { query: { search, ordering } } })
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
 * Suspense version for /transaction-headers/
 * @returns useSuspenseQuery result with data of type z.infer<typeof TransactionHeadersListResponseSchema>
 */
export function useSuspenseTransactionHeadersList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof TransactionHeadersListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['transactionHeadersList', search, ordering],
    queryFn: async () => {
      const result = await transactionHeadersList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /transaction-headers/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof TransactionHeadersReadResponseSchema>
 */
export function useTransactionHeadersRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof TransactionHeadersReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['transactionHeadersRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await transactionHeadersRead({ params: { path: { id } } })
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
 * Suspense version for /transaction-headers/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof TransactionHeadersReadResponseSchema>
 */
export function useSuspenseTransactionHeadersRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof TransactionHeadersReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['transactionHeadersRead', id],
    queryFn: async () => {
      const result = await transactionHeadersRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /transaction-headers/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useTransactionHeadersCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof TransactionHeadersCreateResponseSchema>, variables: z.infer<typeof TransactionHeadersCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof TransactionHeadersCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof TransactionHeadersCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof TransactionHeadersCreateRequestSchema>): Promise<z.infer<typeof TransactionHeadersCreateResponseSchema>> => {
      try {
        const result = await transactionHeadersCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transaction-headers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['transaction-headers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['transaction-headers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transaction-headers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['transaction-headers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['transaction-headers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof TransactionHeadersCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /transaction-headers/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useTransactionHeadersUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof TransactionHeadersUpdateResponseSchema>, variables: { body: z.infer<typeof TransactionHeadersUpdateRequestSchema>, params: z.infer<typeof TransactionHeadersUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof TransactionHeadersUpdateRequestSchema>, params: z.infer<typeof TransactionHeadersUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof TransactionHeadersUpdateRequestSchema>, params: z.infer<typeof TransactionHeadersUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof TransactionHeadersUpdateRequestSchema>, params: z.infer<typeof TransactionHeadersUpdateParamsSchema> }): Promise<z.infer<typeof TransactionHeadersUpdateResponseSchema>> => {
      try {
        const result = await transactionHeadersUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transaction-headers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['transaction-headers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['transaction-headers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transaction-headers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['transaction-headers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['transaction-headers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof TransactionHeadersUpdateRequestSchema>, params: z.infer<typeof TransactionHeadersUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /transaction-headers/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useTransactionHeadersPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof TransactionHeadersPartialUpdateResponseSchema>, variables: { body: z.infer<typeof TransactionHeadersPartialUpdateRequestSchema>, params: z.infer<typeof TransactionHeadersPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof TransactionHeadersPartialUpdateRequestSchema>, params: z.infer<typeof TransactionHeadersPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof TransactionHeadersPartialUpdateRequestSchema>, params: z.infer<typeof TransactionHeadersPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof TransactionHeadersPartialUpdateRequestSchema>, params: z.infer<typeof TransactionHeadersPartialUpdateParamsSchema> }): Promise<z.infer<typeof TransactionHeadersPartialUpdateResponseSchema>> => {
      try {
        const result = await transactionHeadersPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transaction-headers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['transaction-headers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['transaction-headers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transaction-headers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['transaction-headers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['transaction-headers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof TransactionHeadersPartialUpdateRequestSchema>, params: z.infer<typeof TransactionHeadersPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /transaction-headers/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useTransactionHeadersDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof TransactionHeadersDeleteResponseSchema>, variables: z.infer<typeof TransactionHeadersDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof TransactionHeadersDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof TransactionHeadersDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof TransactionHeadersDeleteParamsSchema>): Promise<z.infer<typeof TransactionHeadersDeleteResponseSchema>> => {
      try {
        const result = await transactionHeadersDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transaction-headers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['transaction-headers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['transaction-headers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transaction-headers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['transaction-headers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['transaction-headers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof TransactionHeadersDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /transaction-headers/{id}/approve/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useTransactionHeadersApproveMutation(options?: {
  onSuccess?: (data: z.infer<typeof TransactionHeadersApproveResponseSchema>, variables: { body: z.infer<typeof TransactionHeadersApproveRequestSchema>, params: z.infer<typeof TransactionHeadersApproveParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof TransactionHeadersApproveRequestSchema>, params: z.infer<typeof TransactionHeadersApproveParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof TransactionHeadersApproveRequestSchema>, params: z.infer<typeof TransactionHeadersApproveParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof TransactionHeadersApproveRequestSchema>, params: z.infer<typeof TransactionHeadersApproveParamsSchema> }): Promise<z.infer<typeof TransactionHeadersApproveResponseSchema>> => {
      try {
        const result = await transactionHeadersApprove(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transaction-headers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['transaction-headers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['transaction-headers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transaction-headers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['transaction-headers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['transaction-headers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof TransactionHeadersApproveRequestSchema>, params: z.infer<typeof TransactionHeadersApproveParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /transaction-headers/{id}/post/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useTransactionHeadersPostMutation(options?: {
  onSuccess?: (data: z.infer<typeof TransactionHeadersPostResponseSchema>, variables: { body: z.infer<typeof TransactionHeadersPostRequestSchema>, params: z.infer<typeof TransactionHeadersPostParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof TransactionHeadersPostRequestSchema>, params: z.infer<typeof TransactionHeadersPostParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof TransactionHeadersPostRequestSchema>, params: z.infer<typeof TransactionHeadersPostParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof TransactionHeadersPostRequestSchema>, params: z.infer<typeof TransactionHeadersPostParamsSchema> }): Promise<z.infer<typeof TransactionHeadersPostResponseSchema>> => {
      try {
        const result = await transactionHeadersPost(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transaction-headers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['transaction-headers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['transaction-headers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transaction-headers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['transaction-headers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['transaction-headers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof TransactionHeadersPostRequestSchema>, params: z.infer<typeof TransactionHeadersPostParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /transaction-headers/{id}/reverse/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useTransactionHeadersReverseMutation(options?: {
  onSuccess?: (data: z.infer<typeof TransactionHeadersReverseResponseSchema>, variables: { body: z.infer<typeof TransactionHeadersReverseRequestSchema>, params: z.infer<typeof TransactionHeadersReverseParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof TransactionHeadersReverseRequestSchema>, params: z.infer<typeof TransactionHeadersReverseParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof TransactionHeadersReverseRequestSchema>, params: z.infer<typeof TransactionHeadersReverseParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof TransactionHeadersReverseRequestSchema>, params: z.infer<typeof TransactionHeadersReverseParamsSchema> }): Promise<z.infer<typeof TransactionHeadersReverseResponseSchema>> => {
      try {
        const result = await transactionHeadersReverse(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transaction-headers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['transaction-headers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['transaction-headers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transaction-headers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['transaction-headers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['transaction-headers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof TransactionHeadersReverseRequestSchema>, params: z.infer<typeof TransactionHeadersReverseParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}