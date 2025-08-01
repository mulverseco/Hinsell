'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { inventoryBalancesList, inventoryBalancesRead, inventoryBalancesCreate, inventoryBalancesUpdate, inventoryBalancesPartialUpdate, inventoryBalancesDelete } from '@/core/generated/actions/inventoryBalances'
import {
  InventoryBalancesListResponseSchema,
  InventoryBalancesListParamsSchema,
  InventoryBalancesReadResponseSchema,
  InventoryBalancesReadParamsSchema,
  InventoryBalancesCreateResponseSchema,
  InventoryBalancesCreateRequestSchema,
  InventoryBalancesUpdateResponseSchema,
  InventoryBalancesUpdateRequestSchema,
  InventoryBalancesUpdateParamsSchema,
  InventoryBalancesPartialUpdateResponseSchema,
  InventoryBalancesPartialUpdateRequestSchema,
  InventoryBalancesPartialUpdateParamsSchema,
  InventoryBalancesDeleteResponseSchema,
  InventoryBalancesDeleteParamsSchema
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
 * Optimized query hook for GET /inventory-balances/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof InventoryBalancesListResponseSchema>
 */
export function useInventoryBalancesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['inventoryBalancesList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await inventoryBalancesList({ params: { query: { search, ordering } } })
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
 * Suspense version for /inventory-balances/
 * @returns useSuspenseQuery result with data of type z.infer<typeof InventoryBalancesListResponseSchema>
 */
export function useSuspenseInventoryBalancesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['inventoryBalancesList', search, ordering],
    queryFn: async () => {
      const result = await inventoryBalancesList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized query hook for GET /inventory-balances/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof InventoryBalancesReadResponseSchema>
 */
export function useInventoryBalancesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['inventoryBalancesRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await inventoryBalancesRead({ params: { path: { id } } })
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
 * Suspense version for /inventory-balances/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof InventoryBalancesReadResponseSchema>
 */
export function useSuspenseInventoryBalancesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['inventoryBalancesRead', id],
    queryFn: async () => {
      const result = await inventoryBalancesRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized mutation hook for POST /inventory-balances/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useInventoryBalancesCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof InventoryBalancesCreateResponseSchema>, variables: z.infer<typeof InventoryBalancesCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof InventoryBalancesCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof InventoryBalancesCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof InventoryBalancesCreateRequestSchema>): Promise<z.infer<typeof InventoryBalancesCreateResponseSchema>> => {
      try {
        const result = await inventoryBalancesCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['inventory-balances'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['inventory-balances'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['inventory-balances'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['inventory-balances'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof InventoryBalancesCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /inventory-balances/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useInventoryBalancesUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof InventoryBalancesUpdateResponseSchema>, variables: { body: z.infer<typeof InventoryBalancesUpdateRequestSchema>, params: z.infer<typeof InventoryBalancesUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof InventoryBalancesUpdateRequestSchema>, params: z.infer<typeof InventoryBalancesUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof InventoryBalancesUpdateRequestSchema>, params: z.infer<typeof InventoryBalancesUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof InventoryBalancesUpdateRequestSchema>, params: z.infer<typeof InventoryBalancesUpdateParamsSchema> }): Promise<z.infer<typeof InventoryBalancesUpdateResponseSchema>> => {
      try {
        const result = await inventoryBalancesUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['inventory-balances'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['inventory-balances'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['inventory-balances'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['inventory-balances'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof InventoryBalancesUpdateRequestSchema>, params: z.infer<typeof InventoryBalancesUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /inventory-balances/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useInventoryBalancesPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof InventoryBalancesPartialUpdateResponseSchema>, variables: { body: z.infer<typeof InventoryBalancesPartialUpdateRequestSchema>, params: z.infer<typeof InventoryBalancesPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof InventoryBalancesPartialUpdateRequestSchema>, params: z.infer<typeof InventoryBalancesPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof InventoryBalancesPartialUpdateRequestSchema>, params: z.infer<typeof InventoryBalancesPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof InventoryBalancesPartialUpdateRequestSchema>, params: z.infer<typeof InventoryBalancesPartialUpdateParamsSchema> }): Promise<z.infer<typeof InventoryBalancesPartialUpdateResponseSchema>> => {
      try {
        const result = await inventoryBalancesPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['inventory-balances'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['inventory-balances'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['inventory-balances'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['inventory-balances'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof InventoryBalancesPartialUpdateRequestSchema>, params: z.infer<typeof InventoryBalancesPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /inventory-balances/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useInventoryBalancesDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof InventoryBalancesDeleteResponseSchema>, variables: z.infer<typeof InventoryBalancesDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof InventoryBalancesDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof InventoryBalancesDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof InventoryBalancesDeleteParamsSchema>): Promise<z.infer<typeof InventoryBalancesDeleteResponseSchema>> => {
      try {
        const result = await inventoryBalancesDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['inventory-balances'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['inventory-balances'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['inventory-balances'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['inventory-balances'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof InventoryBalancesDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}