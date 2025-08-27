'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { budgetsList, budgetsRead, budgetsCreate, budgetsUpdate, budgetsPartialUpdate, budgetsDelete } from '@/core/generated/actions/budgets'
import {
  BudgetsListResponseSchema,
  BudgetsReadResponseSchema,
  BudgetsReadParamsSchema,
  BudgetsCreateResponseSchema,
  BudgetsCreateRequestSchema,
  BudgetsUpdateResponseSchema,
  BudgetsUpdateRequestSchema,
  BudgetsUpdateParamsSchema,
  BudgetsPartialUpdateResponseSchema,
  BudgetsPartialUpdateRequestSchema,
  BudgetsPartialUpdateParamsSchema,
  BudgetsDeleteResponseSchema,
  BudgetsDeleteParamsSchema
} from '@/core/generated/schemas'
import type { z } from 'zod'



// Error handling utility
function handleActionError(error: unknown): never {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  toast.error(message)
  throw new Error(message)
}

/**
 * Optimized query hook for GET /budgets/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof BudgetsListResponseSchema>
 */
export function useBudgetsList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof BudgetsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['budgetsList'],
    queryFn: async ({ signal }) => {
      try {
        const result = await budgetsList({})
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
 * Suspense version for /budgets/
 * @returns useSuspenseQuery result with data of type z.infer<typeof BudgetsListResponseSchema>
 */
export function useSuspenseBudgetsList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof BudgetsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['budgetsList'],
    queryFn: async () => {
      const result = await budgetsList({})
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /budgets/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof BudgetsReadResponseSchema>
 */
export function useBudgetsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof BudgetsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['budgetsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await budgetsRead({ params: { path: { id } } })
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
 * Suspense version for /budgets/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof BudgetsReadResponseSchema>
 */
export function useSuspenseBudgetsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof BudgetsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['budgetsRead', id],
    queryFn: async () => {
      const result = await budgetsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /budgets/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useBudgetsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof BudgetsCreateResponseSchema>, variables: z.infer<typeof BudgetsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof BudgetsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof BudgetsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof BudgetsCreateRequestSchema>): Promise<z.infer<typeof BudgetsCreateResponseSchema>> => {
      try {
        const result = await budgetsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['budgets'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['budgets'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['budgets'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['budgets'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof BudgetsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /budgets/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useBudgetsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof BudgetsUpdateResponseSchema>, variables: { body: z.infer<typeof BudgetsUpdateRequestSchema>, params: z.infer<typeof BudgetsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof BudgetsUpdateRequestSchema>, params: z.infer<typeof BudgetsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof BudgetsUpdateRequestSchema>, params: z.infer<typeof BudgetsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof BudgetsUpdateRequestSchema>, params: z.infer<typeof BudgetsUpdateParamsSchema> }): Promise<z.infer<typeof BudgetsUpdateResponseSchema>> => {
      try {
        const result = await budgetsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['budgets'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['budgets'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['budgets'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['budgets'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof BudgetsUpdateRequestSchema>, params: z.infer<typeof BudgetsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /budgets/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useBudgetsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof BudgetsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof BudgetsPartialUpdateRequestSchema>, params: z.infer<typeof BudgetsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof BudgetsPartialUpdateRequestSchema>, params: z.infer<typeof BudgetsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof BudgetsPartialUpdateRequestSchema>, params: z.infer<typeof BudgetsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof BudgetsPartialUpdateRequestSchema>, params: z.infer<typeof BudgetsPartialUpdateParamsSchema> }): Promise<z.infer<typeof BudgetsPartialUpdateResponseSchema>> => {
      try {
        const result = await budgetsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['budgets'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['budgets'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['budgets'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['budgets'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof BudgetsPartialUpdateRequestSchema>, params: z.infer<typeof BudgetsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /budgets/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useBudgetsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof BudgetsDeleteResponseSchema>, variables: z.infer<typeof BudgetsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof BudgetsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof BudgetsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof BudgetsDeleteParamsSchema>): Promise<z.infer<typeof BudgetsDeleteResponseSchema>> => {
      try {
        const result = await budgetsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['budgets'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['budgets'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['budgets'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['budgets'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof BudgetsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}