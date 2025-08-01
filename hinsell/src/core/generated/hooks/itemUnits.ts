'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { itemUnitsList, itemUnitsRead, itemUnitsCreate, itemUnitsUpdate, itemUnitsPartialUpdate, itemUnitsDelete } from '@/core/generated/actions/itemUnits'
import {
  ItemUnitsListResponseSchema,
  ItemUnitsListParamsSchema,
  ItemUnitsReadResponseSchema,
  ItemUnitsReadParamsSchema,
  ItemUnitsCreateResponseSchema,
  ItemUnitsCreateRequestSchema,
  ItemUnitsUpdateResponseSchema,
  ItemUnitsUpdateRequestSchema,
  ItemUnitsUpdateParamsSchema,
  ItemUnitsPartialUpdateResponseSchema,
  ItemUnitsPartialUpdateRequestSchema,
  ItemUnitsPartialUpdateParamsSchema,
  ItemUnitsDeleteResponseSchema,
  ItemUnitsDeleteParamsSchema
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
 * Optimized query hook for GET /item-units/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ItemUnitsListResponseSchema>
 */
export function useItemUnitsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['itemUnitsList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await itemUnitsList({ params: { query: { search, ordering } } })
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
 * Suspense version for /item-units/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ItemUnitsListResponseSchema>
 */
export function useSuspenseItemUnitsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['itemUnitsList', search, ordering],
    queryFn: async () => {
      const result = await itemUnitsList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized query hook for GET /item-units/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ItemUnitsReadResponseSchema>
 */
export function useItemUnitsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['itemUnitsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await itemUnitsRead({ params: { path: { id } } })
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
 * Suspense version for /item-units/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ItemUnitsReadResponseSchema>
 */
export function useSuspenseItemUnitsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['itemUnitsRead', id],
    queryFn: async () => {
      const result = await itemUnitsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized mutation hook for POST /item-units/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useItemUnitsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ItemUnitsCreateResponseSchema>, variables: z.infer<typeof ItemUnitsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ItemUnitsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ItemUnitsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ItemUnitsCreateRequestSchema>): Promise<z.infer<typeof ItemUnitsCreateResponseSchema>> => {
      try {
        const result = await itemUnitsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['item-units'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['item-units'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['item-units'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['item-units'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['item-units'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['item-units'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ItemUnitsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /item-units/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useItemUnitsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ItemUnitsUpdateResponseSchema>, variables: { body: z.infer<typeof ItemUnitsUpdateRequestSchema>, params: z.infer<typeof ItemUnitsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ItemUnitsUpdateRequestSchema>, params: z.infer<typeof ItemUnitsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ItemUnitsUpdateRequestSchema>, params: z.infer<typeof ItemUnitsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ItemUnitsUpdateRequestSchema>, params: z.infer<typeof ItemUnitsUpdateParamsSchema> }): Promise<z.infer<typeof ItemUnitsUpdateResponseSchema>> => {
      try {
        const result = await itemUnitsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['item-units'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['item-units'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['item-units'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['item-units'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['item-units'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['item-units'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ItemUnitsUpdateRequestSchema>, params: z.infer<typeof ItemUnitsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /item-units/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useItemUnitsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ItemUnitsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof ItemUnitsPartialUpdateRequestSchema>, params: z.infer<typeof ItemUnitsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ItemUnitsPartialUpdateRequestSchema>, params: z.infer<typeof ItemUnitsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ItemUnitsPartialUpdateRequestSchema>, params: z.infer<typeof ItemUnitsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ItemUnitsPartialUpdateRequestSchema>, params: z.infer<typeof ItemUnitsPartialUpdateParamsSchema> }): Promise<z.infer<typeof ItemUnitsPartialUpdateResponseSchema>> => {
      try {
        const result = await itemUnitsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['item-units'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['item-units'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['item-units'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['item-units'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['item-units'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['item-units'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ItemUnitsPartialUpdateRequestSchema>, params: z.infer<typeof ItemUnitsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /item-units/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useItemUnitsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof ItemUnitsDeleteResponseSchema>, variables: z.infer<typeof ItemUnitsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ItemUnitsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ItemUnitsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ItemUnitsDeleteParamsSchema>): Promise<z.infer<typeof ItemUnitsDeleteResponseSchema>> => {
      try {
        const result = await itemUnitsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['item-units'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['item-units'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['item-units'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['item-units'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['item-units'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['item-units'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ItemUnitsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}