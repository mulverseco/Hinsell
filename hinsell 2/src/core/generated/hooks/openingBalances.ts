'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { openingBalancesList, openingBalancesRead, openingBalancesCreate, openingBalancesUpdate, openingBalancesPartialUpdate, openingBalancesDelete } from '@/core/generated/actions/openingBalances'
import {
  OpeningBalancesListResponseSchema,
  OpeningBalancesReadResponseSchema,
  OpeningBalancesReadParamsSchema,
  OpeningBalancesCreateResponseSchema,
  OpeningBalancesCreateRequestSchema,
  OpeningBalancesUpdateResponseSchema,
  OpeningBalancesUpdateRequestSchema,
  OpeningBalancesUpdateParamsSchema,
  OpeningBalancesPartialUpdateResponseSchema,
  OpeningBalancesPartialUpdateRequestSchema,
  OpeningBalancesPartialUpdateParamsSchema,
  OpeningBalancesDeleteResponseSchema,
  OpeningBalancesDeleteParamsSchema
} from '@/core/generated/schemas'
import type { z } from 'zod'



// Error handling utility
function handleActionError(error: unknown): never {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  toast.error(message)
  throw new Error(message)
}

/**
 * Optimized query hook for GET /opening-balances/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof OpeningBalancesListResponseSchema>
 */
export function useOpeningBalancesList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof OpeningBalancesListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['openingBalancesList'],
    queryFn: async ({ signal }) => {
      try {
        const result = await openingBalancesList({})
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
 * Suspense version for /opening-balances/
 * @returns useSuspenseQuery result with data of type z.infer<typeof OpeningBalancesListResponseSchema>
 */
export function useSuspenseOpeningBalancesList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof OpeningBalancesListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['openingBalancesList'],
    queryFn: async () => {
      const result = await openingBalancesList({})
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /opening-balances/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof OpeningBalancesReadResponseSchema>
 */
export function useOpeningBalancesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof OpeningBalancesReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['openingBalancesRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await openingBalancesRead({ params: { path: { id } } })
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
 * Suspense version for /opening-balances/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof OpeningBalancesReadResponseSchema>
 */
export function useSuspenseOpeningBalancesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof OpeningBalancesReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['openingBalancesRead', id],
    queryFn: async () => {
      const result = await openingBalancesRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /opening-balances/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useOpeningBalancesCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof OpeningBalancesCreateResponseSchema>, variables: z.infer<typeof OpeningBalancesCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof OpeningBalancesCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof OpeningBalancesCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof OpeningBalancesCreateRequestSchema>): Promise<z.infer<typeof OpeningBalancesCreateResponseSchema>> => {
      try {
        const result = await openingBalancesCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['opening-balances'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['opening-balances'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['opening-balances'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['opening-balances'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['opening-balances'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['opening-balances'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof OpeningBalancesCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /opening-balances/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useOpeningBalancesUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof OpeningBalancesUpdateResponseSchema>, variables: { body: z.infer<typeof OpeningBalancesUpdateRequestSchema>, params: z.infer<typeof OpeningBalancesUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof OpeningBalancesUpdateRequestSchema>, params: z.infer<typeof OpeningBalancesUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof OpeningBalancesUpdateRequestSchema>, params: z.infer<typeof OpeningBalancesUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof OpeningBalancesUpdateRequestSchema>, params: z.infer<typeof OpeningBalancesUpdateParamsSchema> }): Promise<z.infer<typeof OpeningBalancesUpdateResponseSchema>> => {
      try {
        const result = await openingBalancesUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['opening-balances'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['opening-balances'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['opening-balances'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['opening-balances'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['opening-balances'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['opening-balances'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof OpeningBalancesUpdateRequestSchema>, params: z.infer<typeof OpeningBalancesUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /opening-balances/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useOpeningBalancesPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof OpeningBalancesPartialUpdateResponseSchema>, variables: { body: z.infer<typeof OpeningBalancesPartialUpdateRequestSchema>, params: z.infer<typeof OpeningBalancesPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof OpeningBalancesPartialUpdateRequestSchema>, params: z.infer<typeof OpeningBalancesPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof OpeningBalancesPartialUpdateRequestSchema>, params: z.infer<typeof OpeningBalancesPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof OpeningBalancesPartialUpdateRequestSchema>, params: z.infer<typeof OpeningBalancesPartialUpdateParamsSchema> }): Promise<z.infer<typeof OpeningBalancesPartialUpdateResponseSchema>> => {
      try {
        const result = await openingBalancesPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['opening-balances'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['opening-balances'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['opening-balances'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['opening-balances'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['opening-balances'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['opening-balances'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof OpeningBalancesPartialUpdateRequestSchema>, params: z.infer<typeof OpeningBalancesPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /opening-balances/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useOpeningBalancesDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof OpeningBalancesDeleteResponseSchema>, variables: z.infer<typeof OpeningBalancesDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof OpeningBalancesDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof OpeningBalancesDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof OpeningBalancesDeleteParamsSchema>): Promise<z.infer<typeof OpeningBalancesDeleteResponseSchema>> => {
      try {
        const result = await openingBalancesDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['opening-balances'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['opening-balances'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['opening-balances'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['opening-balances'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['opening-balances'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['opening-balances'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof OpeningBalancesDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}