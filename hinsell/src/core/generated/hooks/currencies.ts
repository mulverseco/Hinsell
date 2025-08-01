'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { currenciesList, currenciesRead, currenciesCreate, currenciesUpdate, currenciesPartialUpdate, currenciesDelete } from '@/core/generated/actions/currencies'
import {
  CurrenciesListResponseSchema,
  CurrenciesReadResponseSchema,
  CurrenciesReadParamsSchema,
  CurrenciesCreateResponseSchema,
  CurrenciesCreateRequestSchema,
  CurrenciesUpdateResponseSchema,
  CurrenciesUpdateRequestSchema,
  CurrenciesUpdateParamsSchema,
  CurrenciesPartialUpdateResponseSchema,
  CurrenciesPartialUpdateRequestSchema,
  CurrenciesPartialUpdateParamsSchema,
  CurrenciesDeleteResponseSchema,
  CurrenciesDeleteParamsSchema
} from '@/core/generated/schemas'
import type { z } from 'zod'



// Error handling utility
function handleActionError(error: unknown): never {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  toast.error(message)
  throw new Error(message)
}

/**
 * Optimized query hook for GET /currencies/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof CurrenciesListResponseSchema>
 */
export function useCurrenciesList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['currenciesList'],
    queryFn: async ({ signal }) => {
      try {
        const result = await currenciesList({})
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
 * Suspense version for /currencies/
 * @returns useSuspenseQuery result with data of type z.infer<typeof CurrenciesListResponseSchema>
 */
export function useSuspenseCurrenciesList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['currenciesList'],
    queryFn: async () => {
      const result = await currenciesList({})
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized query hook for GET /currencies/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof CurrenciesReadResponseSchema>
 */
export function useCurrenciesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['currenciesRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await currenciesRead({ params: { path: { id } } })
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
 * Suspense version for /currencies/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof CurrenciesReadResponseSchema>
 */
export function useSuspenseCurrenciesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['currenciesRead', id],
    queryFn: async () => {
      const result = await currenciesRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized mutation hook for POST /currencies/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCurrenciesCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof CurrenciesCreateResponseSchema>, variables: z.infer<typeof CurrenciesCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof CurrenciesCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof CurrenciesCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof CurrenciesCreateRequestSchema>): Promise<z.infer<typeof CurrenciesCreateResponseSchema>> => {
      try {
        const result = await currenciesCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['currencies'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['currencies'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['currencies'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['currencies'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['currencies'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['currencies'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof CurrenciesCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /currencies/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCurrenciesUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof CurrenciesUpdateResponseSchema>, variables: { body: z.infer<typeof CurrenciesUpdateRequestSchema>, params: z.infer<typeof CurrenciesUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof CurrenciesUpdateRequestSchema>, params: z.infer<typeof CurrenciesUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof CurrenciesUpdateRequestSchema>, params: z.infer<typeof CurrenciesUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof CurrenciesUpdateRequestSchema>, params: z.infer<typeof CurrenciesUpdateParamsSchema> }): Promise<z.infer<typeof CurrenciesUpdateResponseSchema>> => {
      try {
        const result = await currenciesUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['currencies'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['currencies'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['currencies'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['currencies'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['currencies'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['currencies'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof CurrenciesUpdateRequestSchema>, params: z.infer<typeof CurrenciesUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /currencies/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCurrenciesPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof CurrenciesPartialUpdateResponseSchema>, variables: { body: z.infer<typeof CurrenciesPartialUpdateRequestSchema>, params: z.infer<typeof CurrenciesPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof CurrenciesPartialUpdateRequestSchema>, params: z.infer<typeof CurrenciesPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof CurrenciesPartialUpdateRequestSchema>, params: z.infer<typeof CurrenciesPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof CurrenciesPartialUpdateRequestSchema>, params: z.infer<typeof CurrenciesPartialUpdateParamsSchema> }): Promise<z.infer<typeof CurrenciesPartialUpdateResponseSchema>> => {
      try {
        const result = await currenciesPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['currencies'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['currencies'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['currencies'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['currencies'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['currencies'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['currencies'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof CurrenciesPartialUpdateRequestSchema>, params: z.infer<typeof CurrenciesPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /currencies/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCurrenciesDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof CurrenciesDeleteResponseSchema>, variables: z.infer<typeof CurrenciesDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof CurrenciesDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof CurrenciesDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof CurrenciesDeleteParamsSchema>): Promise<z.infer<typeof CurrenciesDeleteResponseSchema>> => {
      try {
        const result = await currenciesDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['currencies'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['currencies'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['currencies'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['currencies'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['currencies'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['currencies'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof CurrenciesDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}