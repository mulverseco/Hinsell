'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { storeGroupsList, storeGroupsRead, storeGroupsCreate, storeGroupsUpdate, storeGroupsPartialUpdate, storeGroupsDelete } from '@/core/generated/actions/storeGroups'
import {
  StoreGroupsListResponseSchema,
  StoreGroupsListParamsSchema,
  StoreGroupsReadResponseSchema,
  StoreGroupsReadParamsSchema,
  StoreGroupsCreateResponseSchema,
  StoreGroupsCreateRequestSchema,
  StoreGroupsUpdateResponseSchema,
  StoreGroupsUpdateRequestSchema,
  StoreGroupsUpdateParamsSchema,
  StoreGroupsPartialUpdateResponseSchema,
  StoreGroupsPartialUpdateRequestSchema,
  StoreGroupsPartialUpdateParamsSchema,
  StoreGroupsDeleteResponseSchema,
  StoreGroupsDeleteParamsSchema
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
 * Optimized query hook for GET /store-groups/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof StoreGroupsListResponseSchema>
 */
export function useStoreGroupsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof StoreGroupsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['storeGroupsList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await storeGroupsList({ params: { query: { search, ordering } } })
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
 * Suspense version for /store-groups/
 * @returns useSuspenseQuery result with data of type z.infer<typeof StoreGroupsListResponseSchema>
 */
export function useSuspenseStoreGroupsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof StoreGroupsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['storeGroupsList', search, ordering],
    queryFn: async () => {
      const result = await storeGroupsList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /store-groups/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof StoreGroupsReadResponseSchema>
 */
export function useStoreGroupsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof StoreGroupsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['storeGroupsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await storeGroupsRead({ params: { path: { id } } })
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
 * Suspense version for /store-groups/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof StoreGroupsReadResponseSchema>
 */
export function useSuspenseStoreGroupsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof StoreGroupsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['storeGroupsRead', id],
    queryFn: async () => {
      const result = await storeGroupsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /store-groups/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useStoreGroupsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof StoreGroupsCreateResponseSchema>, variables: z.infer<typeof StoreGroupsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof StoreGroupsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof StoreGroupsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof StoreGroupsCreateRequestSchema>): Promise<z.infer<typeof StoreGroupsCreateResponseSchema>> => {
      try {
        const result = await storeGroupsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['store-groups'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['store-groups'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['store-groups'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['store-groups'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['store-groups'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['store-groups'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof StoreGroupsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /store-groups/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useStoreGroupsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof StoreGroupsUpdateResponseSchema>, variables: { body: z.infer<typeof StoreGroupsUpdateRequestSchema>, params: z.infer<typeof StoreGroupsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof StoreGroupsUpdateRequestSchema>, params: z.infer<typeof StoreGroupsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof StoreGroupsUpdateRequestSchema>, params: z.infer<typeof StoreGroupsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof StoreGroupsUpdateRequestSchema>, params: z.infer<typeof StoreGroupsUpdateParamsSchema> }): Promise<z.infer<typeof StoreGroupsUpdateResponseSchema>> => {
      try {
        const result = await storeGroupsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['store-groups'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['store-groups'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['store-groups'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['store-groups'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['store-groups'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['store-groups'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof StoreGroupsUpdateRequestSchema>, params: z.infer<typeof StoreGroupsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /store-groups/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useStoreGroupsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof StoreGroupsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof StoreGroupsPartialUpdateRequestSchema>, params: z.infer<typeof StoreGroupsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof StoreGroupsPartialUpdateRequestSchema>, params: z.infer<typeof StoreGroupsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof StoreGroupsPartialUpdateRequestSchema>, params: z.infer<typeof StoreGroupsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof StoreGroupsPartialUpdateRequestSchema>, params: z.infer<typeof StoreGroupsPartialUpdateParamsSchema> }): Promise<z.infer<typeof StoreGroupsPartialUpdateResponseSchema>> => {
      try {
        const result = await storeGroupsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['store-groups'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['store-groups'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['store-groups'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['store-groups'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['store-groups'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['store-groups'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof StoreGroupsPartialUpdateRequestSchema>, params: z.infer<typeof StoreGroupsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /store-groups/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useStoreGroupsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof StoreGroupsDeleteResponseSchema>, variables: z.infer<typeof StoreGroupsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof StoreGroupsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof StoreGroupsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof StoreGroupsDeleteParamsSchema>): Promise<z.infer<typeof StoreGroupsDeleteResponseSchema>> => {
      try {
        const result = await storeGroupsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['store-groups'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['store-groups'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['store-groups'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['store-groups'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['store-groups'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['store-groups'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof StoreGroupsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}