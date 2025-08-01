'use client'
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { accountingPeriodsCreate, accountingPeriodsDelete, accountingPeriodsList, accountingPeriodsPartialUpdate, accountingPeriodsRead, accountingPeriodsUpdate } from '@/core/generated/actions/accountingPeriods'
import {
  AccountingPeriodsCreateResponseSchema,
  AccountingPeriodsCreateRequestSchema,
  AccountingPeriodsUpdateResponseSchema,
  AccountingPeriodsUpdateRequestSchema,
  AccountingPeriodsUpdateParamsSchema,
  AccountingPeriodsPartialUpdateResponseSchema,
  AccountingPeriodsPartialUpdateRequestSchema,
  AccountingPeriodsPartialUpdateParamsSchema,
  AccountingPeriodsDeleteResponseSchema,
  AccountingPeriodsDeleteParamsSchema
} from '@/core/generated/schemas'
import type { z } from 'zod'



// Error handling utility
function handleActionError(error: unknown): never {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  toast.error(message)
  throw new Error(message)
}

/**
 * Optimized query hook for GET /accounting-periods/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof AccountingPeriodsListResponseSchema>
 */
export function useAccountingPeriodsList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['accountingPeriodsList'],
    queryFn: async ({ signal }) => {
      try {
        const result = await accountingPeriodsList({})
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
 * Suspense version for /accounting-periods/
 * @returns useSuspenseQuery result with data of type z.infer<typeof AccountingPeriodsListResponseSchema>
 */
export function useSuspenseAccountingPeriodsList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['accountingPeriodsList'],
    queryFn: async () => {
      const result = await accountingPeriodsList({})
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized query hook for GET /accounting-periods/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof AccountingPeriodsReadResponseSchema>
 */
export function useAccountingPeriodsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['accountingPeriodsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await accountingPeriodsRead({ params: { path: { id } } })
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
 * Suspense version for /accounting-periods/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof AccountingPeriodsReadResponseSchema>
 */
export function useSuspenseAccountingPeriodsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['accountingPeriodsRead', id],
    queryFn: async () => {
      const result = await accountingPeriodsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized mutation hook for POST /accounting-periods/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAccountingPeriodsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AccountingPeriodsCreateResponseSchema>, variables: z.infer<typeof AccountingPeriodsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AccountingPeriodsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AccountingPeriodsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AccountingPeriodsCreateRequestSchema>): Promise<z.infer<typeof AccountingPeriodsCreateResponseSchema>> => {
      try {
        const result = await accountingPeriodsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['accounting-periods'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['accounting-periods'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['accounting-periods'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['accounting-periods'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['accounting-periods'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['accounting-periods'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AccountingPeriodsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /accounting-periods/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAccountingPeriodsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AccountingPeriodsUpdateResponseSchema>, variables: { body: z.infer<typeof AccountingPeriodsUpdateRequestSchema>, params: z.infer<typeof AccountingPeriodsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof AccountingPeriodsUpdateRequestSchema>, params: z.infer<typeof AccountingPeriodsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof AccountingPeriodsUpdateRequestSchema>, params: z.infer<typeof AccountingPeriodsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof AccountingPeriodsUpdateRequestSchema>, params: z.infer<typeof AccountingPeriodsUpdateParamsSchema> }): Promise<z.infer<typeof AccountingPeriodsUpdateResponseSchema>> => {
      try {
        const result = await accountingPeriodsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['accounting-periods'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['accounting-periods'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['accounting-periods'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['accounting-periods'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['accounting-periods'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['accounting-periods'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof AccountingPeriodsUpdateRequestSchema>, params: z.infer<typeof AccountingPeriodsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /accounting-periods/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAccountingPeriodsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AccountingPeriodsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof AccountingPeriodsPartialUpdateRequestSchema>, params: z.infer<typeof AccountingPeriodsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof AccountingPeriodsPartialUpdateRequestSchema>, params: z.infer<typeof AccountingPeriodsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof AccountingPeriodsPartialUpdateRequestSchema>, params: z.infer<typeof AccountingPeriodsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof AccountingPeriodsPartialUpdateRequestSchema>, params: z.infer<typeof AccountingPeriodsPartialUpdateParamsSchema> }): Promise<z.infer<typeof AccountingPeriodsPartialUpdateResponseSchema>> => {
      try {
        const result = await accountingPeriodsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['accounting-periods'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['accounting-periods'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['accounting-periods'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['accounting-periods'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['accounting-periods'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['accounting-periods'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof AccountingPeriodsPartialUpdateRequestSchema>, params: z.infer<typeof AccountingPeriodsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /accounting-periods/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAccountingPeriodsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof AccountingPeriodsDeleteResponseSchema>, variables: z.infer<typeof AccountingPeriodsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AccountingPeriodsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AccountingPeriodsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AccountingPeriodsDeleteParamsSchema>): Promise<z.infer<typeof AccountingPeriodsDeleteResponseSchema>> => {
      try {
        const result = await accountingPeriodsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['accounting-periods'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['accounting-periods'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['accounting-periods'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['accounting-periods'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['accounting-periods'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['accounting-periods'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AccountingPeriodsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}