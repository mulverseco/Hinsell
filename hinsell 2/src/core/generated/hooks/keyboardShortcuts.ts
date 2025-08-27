'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { keyboardShortcutsList, keyboardShortcutsRead, keyboardShortcutsCreate, keyboardShortcutsUpdate, keyboardShortcutsPartialUpdate, keyboardShortcutsDelete } from '@/core/generated/actions/keyboardShortcuts'
import {
  KeyboardShortcutsListResponseSchema,
  KeyboardShortcutsListParamsSchema,
  KeyboardShortcutsReadResponseSchema,
  KeyboardShortcutsReadParamsSchema,
  KeyboardShortcutsCreateResponseSchema,
  KeyboardShortcutsCreateRequestSchema,
  KeyboardShortcutsUpdateResponseSchema,
  KeyboardShortcutsUpdateRequestSchema,
  KeyboardShortcutsUpdateParamsSchema,
  KeyboardShortcutsPartialUpdateResponseSchema,
  KeyboardShortcutsPartialUpdateRequestSchema,
  KeyboardShortcutsPartialUpdateParamsSchema,
  KeyboardShortcutsDeleteResponseSchema,
  KeyboardShortcutsDeleteParamsSchema
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
 * Optimized query hook for GET /keyboard-shortcuts/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof KeyboardShortcutsListResponseSchema>
 */
export function useKeyboardShortcutsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof KeyboardShortcutsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['keyboardShortcutsList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await keyboardShortcutsList({ params: { query: { search, ordering } } })
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
 * Suspense version for /keyboard-shortcuts/
 * @returns useSuspenseQuery result with data of type z.infer<typeof KeyboardShortcutsListResponseSchema>
 */
export function useSuspenseKeyboardShortcutsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof KeyboardShortcutsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['keyboardShortcutsList', search, ordering],
    queryFn: async () => {
      const result = await keyboardShortcutsList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /keyboard-shortcuts/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof KeyboardShortcutsReadResponseSchema>
 */
export function useKeyboardShortcutsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof KeyboardShortcutsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['keyboardShortcutsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await keyboardShortcutsRead({ params: { path: { id } } })
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
 * Suspense version for /keyboard-shortcuts/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof KeyboardShortcutsReadResponseSchema>
 */
export function useSuspenseKeyboardShortcutsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof KeyboardShortcutsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['keyboardShortcutsRead', id],
    queryFn: async () => {
      const result = await keyboardShortcutsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /keyboard-shortcuts/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useKeyboardShortcutsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof KeyboardShortcutsCreateResponseSchema>, variables: z.infer<typeof KeyboardShortcutsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof KeyboardShortcutsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof KeyboardShortcutsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof KeyboardShortcutsCreateRequestSchema>): Promise<z.infer<typeof KeyboardShortcutsCreateResponseSchema>> => {
      try {
        const result = await keyboardShortcutsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['keyboard-shortcuts'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['keyboard-shortcuts'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['keyboard-shortcuts'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['keyboard-shortcuts'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['keyboard-shortcuts'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['keyboard-shortcuts'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof KeyboardShortcutsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /keyboard-shortcuts/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useKeyboardShortcutsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof KeyboardShortcutsUpdateResponseSchema>, variables: { body: z.infer<typeof KeyboardShortcutsUpdateRequestSchema>, params: z.infer<typeof KeyboardShortcutsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof KeyboardShortcutsUpdateRequestSchema>, params: z.infer<typeof KeyboardShortcutsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof KeyboardShortcutsUpdateRequestSchema>, params: z.infer<typeof KeyboardShortcutsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof KeyboardShortcutsUpdateRequestSchema>, params: z.infer<typeof KeyboardShortcutsUpdateParamsSchema> }): Promise<z.infer<typeof KeyboardShortcutsUpdateResponseSchema>> => {
      try {
        const result = await keyboardShortcutsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['keyboard-shortcuts'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['keyboard-shortcuts'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['keyboard-shortcuts'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['keyboard-shortcuts'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['keyboard-shortcuts'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['keyboard-shortcuts'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof KeyboardShortcutsUpdateRequestSchema>, params: z.infer<typeof KeyboardShortcutsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /keyboard-shortcuts/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useKeyboardShortcutsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof KeyboardShortcutsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof KeyboardShortcutsPartialUpdateRequestSchema>, params: z.infer<typeof KeyboardShortcutsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof KeyboardShortcutsPartialUpdateRequestSchema>, params: z.infer<typeof KeyboardShortcutsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof KeyboardShortcutsPartialUpdateRequestSchema>, params: z.infer<typeof KeyboardShortcutsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof KeyboardShortcutsPartialUpdateRequestSchema>, params: z.infer<typeof KeyboardShortcutsPartialUpdateParamsSchema> }): Promise<z.infer<typeof KeyboardShortcutsPartialUpdateResponseSchema>> => {
      try {
        const result = await keyboardShortcutsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['keyboard-shortcuts'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['keyboard-shortcuts'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['keyboard-shortcuts'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['keyboard-shortcuts'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['keyboard-shortcuts'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['keyboard-shortcuts'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof KeyboardShortcutsPartialUpdateRequestSchema>, params: z.infer<typeof KeyboardShortcutsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /keyboard-shortcuts/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useKeyboardShortcutsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof KeyboardShortcutsDeleteResponseSchema>, variables: z.infer<typeof KeyboardShortcutsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof KeyboardShortcutsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof KeyboardShortcutsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof KeyboardShortcutsDeleteParamsSchema>): Promise<z.infer<typeof KeyboardShortcutsDeleteResponseSchema>> => {
      try {
        const result = await keyboardShortcutsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['keyboard-shortcuts'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['keyboard-shortcuts'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['keyboard-shortcuts'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['keyboard-shortcuts'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['keyboard-shortcuts'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['keyboard-shortcuts'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof KeyboardShortcutsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}