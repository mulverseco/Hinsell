'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { subscribersList, subscribersRead, subscribersCreate, subscribersUpdate, subscribersPartialUpdate, subscribersDelete } from '@/core/generated/actions/subscribers'
import {
  SubscribersListResponseSchema,
  SubscribersListParamsSchema,
  SubscribersReadResponseSchema,
  SubscribersReadParamsSchema,
  SubscribersCreateResponseSchema,
  SubscribersCreateRequestSchema,
  SubscribersUpdateResponseSchema,
  SubscribersUpdateRequestSchema,
  SubscribersUpdateParamsSchema,
  SubscribersPartialUpdateResponseSchema,
  SubscribersPartialUpdateRequestSchema,
  SubscribersPartialUpdateParamsSchema,
  SubscribersDeleteResponseSchema,
  SubscribersDeleteParamsSchema
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
 * Optimized query hook for GET /subscribers/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof SubscribersListResponseSchema>
 */
export function useSubscribersList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof SubscribersListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['subscribersList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await subscribersList({ params: { query: { search, ordering } } })
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
 * Suspense version for /subscribers/
 * @returns useSuspenseQuery result with data of type z.infer<typeof SubscribersListResponseSchema>
 */
export function useSuspenseSubscribersList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof SubscribersListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['subscribersList', search, ordering],
    queryFn: async () => {
      const result = await subscribersList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /subscribers/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof SubscribersReadResponseSchema>
 */
export function useSubscribersRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof SubscribersReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['subscribersRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await subscribersRead({ params: { path: { id } } })
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
 * Suspense version for /subscribers/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof SubscribersReadResponseSchema>
 */
export function useSuspenseSubscribersRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof SubscribersReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['subscribersRead', id],
    queryFn: async () => {
      const result = await subscribersRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /subscribers/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useSubscribersCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof SubscribersCreateResponseSchema>, variables: z.infer<typeof SubscribersCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof SubscribersCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof SubscribersCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof SubscribersCreateRequestSchema>): Promise<z.infer<typeof SubscribersCreateResponseSchema>> => {
      try {
        const result = await subscribersCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['subscribers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['subscribers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['subscribers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['subscribers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['subscribers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['subscribers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof SubscribersCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /subscribers/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useSubscribersUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof SubscribersUpdateResponseSchema>, variables: { body: z.infer<typeof SubscribersUpdateRequestSchema>, params: z.infer<typeof SubscribersUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof SubscribersUpdateRequestSchema>, params: z.infer<typeof SubscribersUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof SubscribersUpdateRequestSchema>, params: z.infer<typeof SubscribersUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof SubscribersUpdateRequestSchema>, params: z.infer<typeof SubscribersUpdateParamsSchema> }): Promise<z.infer<typeof SubscribersUpdateResponseSchema>> => {
      try {
        const result = await subscribersUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['subscribers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['subscribers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['subscribers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['subscribers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['subscribers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['subscribers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof SubscribersUpdateRequestSchema>, params: z.infer<typeof SubscribersUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /subscribers/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useSubscribersPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof SubscribersPartialUpdateResponseSchema>, variables: { body: z.infer<typeof SubscribersPartialUpdateRequestSchema>, params: z.infer<typeof SubscribersPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof SubscribersPartialUpdateRequestSchema>, params: z.infer<typeof SubscribersPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof SubscribersPartialUpdateRequestSchema>, params: z.infer<typeof SubscribersPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof SubscribersPartialUpdateRequestSchema>, params: z.infer<typeof SubscribersPartialUpdateParamsSchema> }): Promise<z.infer<typeof SubscribersPartialUpdateResponseSchema>> => {
      try {
        const result = await subscribersPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['subscribers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['subscribers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['subscribers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['subscribers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['subscribers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['subscribers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof SubscribersPartialUpdateRequestSchema>, params: z.infer<typeof SubscribersPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /subscribers/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useSubscribersDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof SubscribersDeleteResponseSchema>, variables: z.infer<typeof SubscribersDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof SubscribersDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof SubscribersDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof SubscribersDeleteParamsSchema>): Promise<z.infer<typeof SubscribersDeleteResponseSchema>> => {
      try {
        const result = await subscribersDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['subscribers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['subscribers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['subscribers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['subscribers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['subscribers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['subscribers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof SubscribersDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}