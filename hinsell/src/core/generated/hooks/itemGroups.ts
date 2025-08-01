'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { itemGroupsList, itemGroupsRead, itemGroupsCreate, itemGroupsUpdate, itemGroupsPartialUpdate, itemGroupsDelete } from '@/core/generated/actions/itemGroups'
import {
  ItemGroupsListResponseSchema,
  ItemGroupsListParamsSchema,
  ItemGroupsReadResponseSchema,
  ItemGroupsReadParamsSchema,
  ItemGroupsCreateResponseSchema,
  ItemGroupsCreateRequestSchema,
  ItemGroupsUpdateResponseSchema,
  ItemGroupsUpdateRequestSchema,
  ItemGroupsUpdateParamsSchema,
  ItemGroupsPartialUpdateResponseSchema,
  ItemGroupsPartialUpdateRequestSchema,
  ItemGroupsPartialUpdateParamsSchema,
  ItemGroupsDeleteResponseSchema,
  ItemGroupsDeleteParamsSchema
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
 * Optimized query hook for GET /item-groups/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ItemGroupsListResponseSchema>
 */
export function useItemGroupsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['itemGroupsList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await itemGroupsList({ params: { query: { search, ordering } } })
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
 * Suspense version for /item-groups/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ItemGroupsListResponseSchema>
 */
export function useSuspenseItemGroupsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['itemGroupsList', search, ordering],
    queryFn: async () => {
      const result = await itemGroupsList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized query hook for GET /item-groups/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ItemGroupsReadResponseSchema>
 */
export function useItemGroupsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['itemGroupsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await itemGroupsRead({ params: { path: { id } } })
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
 * Suspense version for /item-groups/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ItemGroupsReadResponseSchema>
 */
export function useSuspenseItemGroupsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['itemGroupsRead', id],
    queryFn: async () => {
      const result = await itemGroupsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized mutation hook for POST /item-groups/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useItemGroupsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ItemGroupsCreateResponseSchema>, variables: z.infer<typeof ItemGroupsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ItemGroupsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ItemGroupsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ItemGroupsCreateRequestSchema>): Promise<z.infer<typeof ItemGroupsCreateResponseSchema>> => {
      try {
        const result = await itemGroupsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['item-groups'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['item-groups'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['item-groups'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['item-groups'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['item-groups'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['item-groups'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ItemGroupsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /item-groups/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useItemGroupsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ItemGroupsUpdateResponseSchema>, variables: { body: z.infer<typeof ItemGroupsUpdateRequestSchema>, params: z.infer<typeof ItemGroupsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ItemGroupsUpdateRequestSchema>, params: z.infer<typeof ItemGroupsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ItemGroupsUpdateRequestSchema>, params: z.infer<typeof ItemGroupsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ItemGroupsUpdateRequestSchema>, params: z.infer<typeof ItemGroupsUpdateParamsSchema> }): Promise<z.infer<typeof ItemGroupsUpdateResponseSchema>> => {
      try {
        const result = await itemGroupsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['item-groups'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['item-groups'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['item-groups'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['item-groups'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['item-groups'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['item-groups'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ItemGroupsUpdateRequestSchema>, params: z.infer<typeof ItemGroupsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /item-groups/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useItemGroupsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ItemGroupsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof ItemGroupsPartialUpdateRequestSchema>, params: z.infer<typeof ItemGroupsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ItemGroupsPartialUpdateRequestSchema>, params: z.infer<typeof ItemGroupsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ItemGroupsPartialUpdateRequestSchema>, params: z.infer<typeof ItemGroupsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ItemGroupsPartialUpdateRequestSchema>, params: z.infer<typeof ItemGroupsPartialUpdateParamsSchema> }): Promise<z.infer<typeof ItemGroupsPartialUpdateResponseSchema>> => {
      try {
        const result = await itemGroupsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['item-groups'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['item-groups'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['item-groups'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['item-groups'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['item-groups'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['item-groups'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ItemGroupsPartialUpdateRequestSchema>, params: z.infer<typeof ItemGroupsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /item-groups/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useItemGroupsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof ItemGroupsDeleteResponseSchema>, variables: z.infer<typeof ItemGroupsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ItemGroupsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ItemGroupsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ItemGroupsDeleteParamsSchema>): Promise<z.infer<typeof ItemGroupsDeleteResponseSchema>> => {
      try {
        const result = await itemGroupsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['item-groups'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['item-groups'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['item-groups'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['item-groups'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['item-groups'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['item-groups'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ItemGroupsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}