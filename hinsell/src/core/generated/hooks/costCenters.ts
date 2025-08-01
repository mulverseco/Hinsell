'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { costCentersList, costCentersRead, costCentersCreate, costCentersUpdate, costCentersPartialUpdate, costCentersDelete } from '@/core/generated/actions/costCenters'
import {
  CostCentersListResponseSchema,
  CostCentersReadResponseSchema,
  CostCentersReadParamsSchema,
  CostCentersCreateResponseSchema,
  CostCentersCreateRequestSchema,
  CostCentersUpdateResponseSchema,
  CostCentersUpdateRequestSchema,
  CostCentersUpdateParamsSchema,
  CostCentersPartialUpdateResponseSchema,
  CostCentersPartialUpdateRequestSchema,
  CostCentersPartialUpdateParamsSchema,
  CostCentersDeleteResponseSchema,
  CostCentersDeleteParamsSchema
} from '@/core/generated/schemas'
import type { z } from 'zod'



// Error handling utility
function handleActionError(error: unknown): never {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  toast.error(message)
  throw new Error(message)
}

/**
 * Optimized query hook for GET /cost-centers/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof CostCentersListResponseSchema>
 */
export function useCostCentersList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['costCentersList'],
    queryFn: async ({ signal }) => {
      try {
        const result = await costCentersList({})
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
 * Suspense version for /cost-centers/
 * @returns useSuspenseQuery result with data of type z.infer<typeof CostCentersListResponseSchema>
 */
export function useSuspenseCostCentersList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['costCentersList'],
    queryFn: async () => {
      const result = await costCentersList({})
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized query hook for GET /cost-centers/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof CostCentersReadResponseSchema>
 */
export function useCostCentersRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['costCentersRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await costCentersRead({ params: { path: { id } } })
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
 * Suspense version for /cost-centers/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof CostCentersReadResponseSchema>
 */
export function useSuspenseCostCentersRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['costCentersRead', id],
    queryFn: async () => {
      const result = await costCentersRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized mutation hook for POST /cost-centers/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCostCentersCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof CostCentersCreateResponseSchema>, variables: z.infer<typeof CostCentersCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof CostCentersCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof CostCentersCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof CostCentersCreateRequestSchema>): Promise<z.infer<typeof CostCentersCreateResponseSchema>> => {
      try {
        const result = await costCentersCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cost-centers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['cost-centers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['cost-centers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['cost-centers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof CostCentersCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /cost-centers/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCostCentersUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof CostCentersUpdateResponseSchema>, variables: { body: z.infer<typeof CostCentersUpdateRequestSchema>, params: z.infer<typeof CostCentersUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof CostCentersUpdateRequestSchema>, params: z.infer<typeof CostCentersUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof CostCentersUpdateRequestSchema>, params: z.infer<typeof CostCentersUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof CostCentersUpdateRequestSchema>, params: z.infer<typeof CostCentersUpdateParamsSchema> }): Promise<z.infer<typeof CostCentersUpdateResponseSchema>> => {
      try {
        const result = await costCentersUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cost-centers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['cost-centers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['cost-centers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['cost-centers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof CostCentersUpdateRequestSchema>, params: z.infer<typeof CostCentersUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /cost-centers/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCostCentersPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof CostCentersPartialUpdateResponseSchema>, variables: { body: z.infer<typeof CostCentersPartialUpdateRequestSchema>, params: z.infer<typeof CostCentersPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof CostCentersPartialUpdateRequestSchema>, params: z.infer<typeof CostCentersPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof CostCentersPartialUpdateRequestSchema>, params: z.infer<typeof CostCentersPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof CostCentersPartialUpdateRequestSchema>, params: z.infer<typeof CostCentersPartialUpdateParamsSchema> }): Promise<z.infer<typeof CostCentersPartialUpdateResponseSchema>> => {
      try {
        const result = await costCentersPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cost-centers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['cost-centers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['cost-centers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['cost-centers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof CostCentersPartialUpdateRequestSchema>, params: z.infer<typeof CostCentersPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /cost-centers/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCostCentersDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof CostCentersDeleteResponseSchema>, variables: z.infer<typeof CostCentersDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof CostCentersDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof CostCentersDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof CostCentersDeleteParamsSchema>): Promise<z.infer<typeof CostCentersDeleteResponseSchema>> => {
      try {
        const result = await costCentersDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cost-centers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['cost-centers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['cost-centers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['cost-centers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof CostCentersDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}