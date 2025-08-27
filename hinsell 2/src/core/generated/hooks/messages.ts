'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { messagesList, messagesRead, messagesCreate, messagesUpdate, messagesPartialUpdate, messagesDelete, messagesMarkAsRead } from '@/core/generated/actions/messages'
import {
  MessagesListResponseSchema,
  MessagesListParamsSchema,
  MessagesReadResponseSchema,
  MessagesReadParamsSchema,
  MessagesCreateResponseSchema,
  MessagesCreateRequestSchema,
  MessagesUpdateResponseSchema,
  MessagesUpdateRequestSchema,
  MessagesUpdateParamsSchema,
  MessagesPartialUpdateResponseSchema,
  MessagesPartialUpdateRequestSchema,
  MessagesPartialUpdateParamsSchema,
  MessagesDeleteResponseSchema,
  MessagesDeleteParamsSchema,
  MessagesMarkAsReadResponseSchema,
  MessagesMarkAsReadRequestSchema,
  MessagesMarkAsReadParamsSchema
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
 * Optimized query hook for GET /messages/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof MessagesListResponseSchema>
 */
export function useMessagesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof MessagesListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['messagesList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await messagesList({ params: { query: { search, ordering } } })
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
 * Suspense version for /messages/
 * @returns useSuspenseQuery result with data of type z.infer<typeof MessagesListResponseSchema>
 */
export function useSuspenseMessagesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof MessagesListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['messagesList', search, ordering],
    queryFn: async () => {
      const result = await messagesList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /messages/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof MessagesReadResponseSchema>
 */
export function useMessagesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof MessagesReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['messagesRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await messagesRead({ params: { path: { id } } })
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
 * Suspense version for /messages/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof MessagesReadResponseSchema>
 */
export function useSuspenseMessagesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof MessagesReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['messagesRead', id],
    queryFn: async () => {
      const result = await messagesRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /messages/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useMessagesCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof MessagesCreateResponseSchema>, variables: z.infer<typeof MessagesCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof MessagesCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof MessagesCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof MessagesCreateRequestSchema>): Promise<z.infer<typeof MessagesCreateResponseSchema>> => {
      try {
        const result = await messagesCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['messages'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['messages'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['messages'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof MessagesCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /messages/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useMessagesUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof MessagesUpdateResponseSchema>, variables: { body: z.infer<typeof MessagesUpdateRequestSchema>, params: z.infer<typeof MessagesUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof MessagesUpdateRequestSchema>, params: z.infer<typeof MessagesUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof MessagesUpdateRequestSchema>, params: z.infer<typeof MessagesUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof MessagesUpdateRequestSchema>, params: z.infer<typeof MessagesUpdateParamsSchema> }): Promise<z.infer<typeof MessagesUpdateResponseSchema>> => {
      try {
        const result = await messagesUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['messages'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['messages'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['messages'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof MessagesUpdateRequestSchema>, params: z.infer<typeof MessagesUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /messages/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useMessagesPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof MessagesPartialUpdateResponseSchema>, variables: { body: z.infer<typeof MessagesPartialUpdateRequestSchema>, params: z.infer<typeof MessagesPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof MessagesPartialUpdateRequestSchema>, params: z.infer<typeof MessagesPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof MessagesPartialUpdateRequestSchema>, params: z.infer<typeof MessagesPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof MessagesPartialUpdateRequestSchema>, params: z.infer<typeof MessagesPartialUpdateParamsSchema> }): Promise<z.infer<typeof MessagesPartialUpdateResponseSchema>> => {
      try {
        const result = await messagesPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['messages'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['messages'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['messages'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof MessagesPartialUpdateRequestSchema>, params: z.infer<typeof MessagesPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /messages/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useMessagesDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof MessagesDeleteResponseSchema>, variables: z.infer<typeof MessagesDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof MessagesDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof MessagesDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof MessagesDeleteParamsSchema>): Promise<z.infer<typeof MessagesDeleteResponseSchema>> => {
      try {
        const result = await messagesDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['messages'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['messages'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['messages'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof MessagesDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /messages/{id}/mark_as_read/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useMessagesMarkAsReadMutation(options?: {
  onSuccess?: (data: z.infer<typeof MessagesMarkAsReadResponseSchema>, variables: { body: z.infer<typeof MessagesMarkAsReadRequestSchema>, params: z.infer<typeof MessagesMarkAsReadParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof MessagesMarkAsReadRequestSchema>, params: z.infer<typeof MessagesMarkAsReadParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof MessagesMarkAsReadRequestSchema>, params: z.infer<typeof MessagesMarkAsReadParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof MessagesMarkAsReadRequestSchema>, params: z.infer<typeof MessagesMarkAsReadParamsSchema> }): Promise<z.infer<typeof MessagesMarkAsReadResponseSchema>> => {
      try {
        const result = await messagesMarkAsRead(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['messages'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['messages'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['messages'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof MessagesMarkAsReadRequestSchema>, params: z.infer<typeof MessagesMarkAsReadParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}