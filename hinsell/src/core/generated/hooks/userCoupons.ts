'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { userCouponsList, userCouponsRead, userCouponsCreate, userCouponsUpdate, userCouponsPartialUpdate, userCouponsDelete } from '@/core/generated/actions/userCoupons'
import {
  UserCouponsListResponseSchema,
  UserCouponsListParamsSchema,
  UserCouponsReadResponseSchema,
  UserCouponsReadParamsSchema,
  UserCouponsCreateResponseSchema,
  UserCouponsCreateRequestSchema,
  UserCouponsUpdateResponseSchema,
  UserCouponsUpdateRequestSchema,
  UserCouponsUpdateParamsSchema,
  UserCouponsPartialUpdateResponseSchema,
  UserCouponsPartialUpdateRequestSchema,
  UserCouponsPartialUpdateParamsSchema,
  UserCouponsDeleteResponseSchema,
  UserCouponsDeleteParamsSchema
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
 * Optimized query hook for GET /user-coupons/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof UserCouponsListResponseSchema>
 */
export function useUserCouponsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof UserCouponsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['userCouponsList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await userCouponsList({ params: { query: { search, ordering } } })
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
 * Suspense version for /user-coupons/
 * @returns useSuspenseQuery result with data of type z.infer<typeof UserCouponsListResponseSchema>
 */
export function useSuspenseUserCouponsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof UserCouponsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['userCouponsList', search, ordering],
    queryFn: async () => {
      const result = await userCouponsList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 300000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /user-coupons/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof UserCouponsReadResponseSchema>
 */
export function useUserCouponsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof UserCouponsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['userCouponsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await userCouponsRead({ params: { path: { id } } })
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
 * Suspense version for /user-coupons/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof UserCouponsReadResponseSchema>
 */
export function useSuspenseUserCouponsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof UserCouponsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['userCouponsRead', id],
    queryFn: async () => {
      const result = await userCouponsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 300000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /user-coupons/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useUserCouponsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof UserCouponsCreateResponseSchema>, variables: z.infer<typeof UserCouponsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof UserCouponsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof UserCouponsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof UserCouponsCreateRequestSchema>): Promise<z.infer<typeof UserCouponsCreateResponseSchema>> => {
      try {
        const result = await userCouponsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user-coupons'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['user-coupons'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['user-coupons'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['user-coupons'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['user-coupons'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['user-coupons'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof UserCouponsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /user-coupons/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useUserCouponsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof UserCouponsUpdateResponseSchema>, variables: { body: z.infer<typeof UserCouponsUpdateRequestSchema>, params: z.infer<typeof UserCouponsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof UserCouponsUpdateRequestSchema>, params: z.infer<typeof UserCouponsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof UserCouponsUpdateRequestSchema>, params: z.infer<typeof UserCouponsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof UserCouponsUpdateRequestSchema>, params: z.infer<typeof UserCouponsUpdateParamsSchema> }): Promise<z.infer<typeof UserCouponsUpdateResponseSchema>> => {
      try {
        const result = await userCouponsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user-coupons'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['user-coupons'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['user-coupons'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['user-coupons'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['user-coupons'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['user-coupons'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof UserCouponsUpdateRequestSchema>, params: z.infer<typeof UserCouponsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /user-coupons/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useUserCouponsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof UserCouponsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof UserCouponsPartialUpdateRequestSchema>, params: z.infer<typeof UserCouponsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof UserCouponsPartialUpdateRequestSchema>, params: z.infer<typeof UserCouponsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof UserCouponsPartialUpdateRequestSchema>, params: z.infer<typeof UserCouponsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof UserCouponsPartialUpdateRequestSchema>, params: z.infer<typeof UserCouponsPartialUpdateParamsSchema> }): Promise<z.infer<typeof UserCouponsPartialUpdateResponseSchema>> => {
      try {
        const result = await userCouponsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user-coupons'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['user-coupons'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['user-coupons'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['user-coupons'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['user-coupons'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['user-coupons'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof UserCouponsPartialUpdateRequestSchema>, params: z.infer<typeof UserCouponsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /user-coupons/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useUserCouponsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof UserCouponsDeleteResponseSchema>, variables: z.infer<typeof UserCouponsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof UserCouponsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof UserCouponsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof UserCouponsDeleteParamsSchema>): Promise<z.infer<typeof UserCouponsDeleteResponseSchema>> => {
      try {
        const result = await userCouponsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user-coupons'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['user-coupons'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['user-coupons'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['user-coupons'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['user-coupons'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['user-coupons'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof UserCouponsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}