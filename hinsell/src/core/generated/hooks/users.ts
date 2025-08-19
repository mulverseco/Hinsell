'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { usersList, usersRead, usersLoyaltyHistory, usersCreate, usersUpdate, usersPartialUpdate, usersDelete } from '@/core/generated/actions/users'
import {
  UsersListResponseSchema,
  UsersListParamsSchema,
  UsersReadResponseSchema,
  UsersReadParamsSchema,
  UsersLoyaltyHistoryResponseSchema,
  UsersLoyaltyHistoryParamsSchema,
  UsersCreateResponseSchema,
  UsersCreateRequestSchema,
  UsersUpdateResponseSchema,
  UsersUpdateRequestSchema,
  UsersUpdateParamsSchema,
  UsersPartialUpdateResponseSchema,
  UsersPartialUpdateRequestSchema,
  UsersPartialUpdateParamsSchema,
  UsersDeleteResponseSchema,
  UsersDeleteParamsSchema
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
 * Optimized query hook for GET /users/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof UsersListResponseSchema>
 */
export function useUsersList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof UsersListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['usersList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await usersList({ params: { query: { search, ordering } } })
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    staleTime: 300000,
    gcTime: 600000,
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
 * Suspense version for /users/
 * @returns useSuspenseQuery result with data of type z.infer<typeof UsersListResponseSchema>
 */
export function useSuspenseUsersList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof UsersListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['usersList', search, ordering],
    queryFn: async () => {
      const result = await usersList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 300000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /users/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof UsersReadResponseSchema>
 */
export function useUsersRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof UsersReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['usersRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await usersRead({ params: { path: { id } } })
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    staleTime: 300000,
    gcTime: 600000,
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
 * Suspense version for /users/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof UsersReadResponseSchema>
 */
export function useSuspenseUsersRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof UsersReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['usersRead', id],
    queryFn: async () => {
      const result = await usersRead({ params: { path: { id } } })
      return result
    },
    staleTime: 300000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /users/{id}/loyalty_history/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof UsersLoyaltyHistoryResponseSchema>
 */
export function useUsersLoyaltyHistory(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof UsersLoyaltyHistoryResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['usersLoyaltyHistory', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await usersLoyaltyHistory({ params: { path: { id } } })
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    staleTime: 300000,
    gcTime: 600000,
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
 * Suspense version for /users/{id}/loyalty_history/
 * @returns useSuspenseQuery result with data of type z.infer<typeof UsersLoyaltyHistoryResponseSchema>
 */
export function useSuspenseUsersLoyaltyHistory(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof UsersLoyaltyHistoryResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['usersLoyaltyHistory', id],
    queryFn: async () => {
      const result = await usersLoyaltyHistory({ params: { path: { id } } })
      return result
    },
    staleTime: 300000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /users/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useUsersCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof UsersCreateResponseSchema>, variables: z.infer<typeof UsersCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof UsersCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof UsersCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof UsersCreateRequestSchema>): Promise<z.infer<typeof UsersCreateResponseSchema>> => {
      try {
        const result = await usersCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['users'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['users'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['users'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['users'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof UsersCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /users/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useUsersUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof UsersUpdateResponseSchema>, variables: { body: z.infer<typeof UsersUpdateRequestSchema>, params: z.infer<typeof UsersUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof UsersUpdateRequestSchema>, params: z.infer<typeof UsersUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof UsersUpdateRequestSchema>, params: z.infer<typeof UsersUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof UsersUpdateRequestSchema>, params: z.infer<typeof UsersUpdateParamsSchema> }): Promise<z.infer<typeof UsersUpdateResponseSchema>> => {
      try {
        const result = await usersUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['users'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['users'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['users'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['users'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof UsersUpdateRequestSchema>, params: z.infer<typeof UsersUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /users/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useUsersPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof UsersPartialUpdateResponseSchema>, variables: { body: z.infer<typeof UsersPartialUpdateRequestSchema>, params: z.infer<typeof UsersPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof UsersPartialUpdateRequestSchema>, params: z.infer<typeof UsersPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof UsersPartialUpdateRequestSchema>, params: z.infer<typeof UsersPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof UsersPartialUpdateRequestSchema>, params: z.infer<typeof UsersPartialUpdateParamsSchema> }): Promise<z.infer<typeof UsersPartialUpdateResponseSchema>> => {
      try {
        const result = await usersPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['users'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['users'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['users'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['users'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof UsersPartialUpdateRequestSchema>, params: z.infer<typeof UsersPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /users/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useUsersDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof UsersDeleteResponseSchema>, variables: z.infer<typeof UsersDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof UsersDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof UsersDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof UsersDeleteParamsSchema>): Promise<z.infer<typeof UsersDeleteResponseSchema>> => {
      try {
        const result = await usersDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['users'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['users'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['users'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['users'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof UsersDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}