'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { couponsList, couponsRead, couponsCreate, couponsUpdate, couponsPartialUpdate, couponsDelete, couponsApply } from '@/core/generated/actions/coupons'
import {
  CouponsListResponseSchema,
  CouponsListParamsSchema,
  CouponsReadResponseSchema,
  CouponsReadParamsSchema,
  CouponsCreateResponseSchema,
  CouponsCreateRequestSchema,
  CouponsUpdateResponseSchema,
  CouponsUpdateRequestSchema,
  CouponsUpdateParamsSchema,
  CouponsPartialUpdateResponseSchema,
  CouponsPartialUpdateRequestSchema,
  CouponsPartialUpdateParamsSchema,
  CouponsDeleteResponseSchema,
  CouponsDeleteParamsSchema,
  CouponsApplyResponseSchema,
  CouponsApplyRequestSchema,
  CouponsApplyParamsSchema
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
 * Optimized query hook for GET /coupons/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof CouponsListResponseSchema>
 */
export function useCouponsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof CouponsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['couponsList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await couponsList({ params: { query: { search, ordering } } })
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
 * Suspense version for /coupons/
 * @returns useSuspenseQuery result with data of type z.infer<typeof CouponsListResponseSchema>
 */
export function useSuspenseCouponsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof CouponsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['couponsList', search, ordering],
    queryFn: async () => {
      const result = await couponsList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /coupons/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof CouponsReadResponseSchema>
 */
export function useCouponsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof CouponsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['couponsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await couponsRead({ params: { path: { id } } })
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
 * Suspense version for /coupons/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof CouponsReadResponseSchema>
 */
export function useSuspenseCouponsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof CouponsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['couponsRead', id],
    queryFn: async () => {
      const result = await couponsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /coupons/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCouponsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof CouponsCreateResponseSchema>, variables: z.infer<typeof CouponsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof CouponsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof CouponsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof CouponsCreateRequestSchema>): Promise<z.infer<typeof CouponsCreateResponseSchema>> => {
      try {
        const result = await couponsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['coupons'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['coupons'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['coupons'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['coupons'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof CouponsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /coupons/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCouponsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof CouponsUpdateResponseSchema>, variables: { body: z.infer<typeof CouponsUpdateRequestSchema>, params: z.infer<typeof CouponsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof CouponsUpdateRequestSchema>, params: z.infer<typeof CouponsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof CouponsUpdateRequestSchema>, params: z.infer<typeof CouponsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof CouponsUpdateRequestSchema>, params: z.infer<typeof CouponsUpdateParamsSchema> }): Promise<z.infer<typeof CouponsUpdateResponseSchema>> => {
      try {
        const result = await couponsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['coupons'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['coupons'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['coupons'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['coupons'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof CouponsUpdateRequestSchema>, params: z.infer<typeof CouponsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /coupons/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCouponsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof CouponsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof CouponsPartialUpdateRequestSchema>, params: z.infer<typeof CouponsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof CouponsPartialUpdateRequestSchema>, params: z.infer<typeof CouponsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof CouponsPartialUpdateRequestSchema>, params: z.infer<typeof CouponsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof CouponsPartialUpdateRequestSchema>, params: z.infer<typeof CouponsPartialUpdateParamsSchema> }): Promise<z.infer<typeof CouponsPartialUpdateResponseSchema>> => {
      try {
        const result = await couponsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['coupons'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['coupons'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['coupons'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['coupons'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof CouponsPartialUpdateRequestSchema>, params: z.infer<typeof CouponsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /coupons/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCouponsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof CouponsDeleteResponseSchema>, variables: z.infer<typeof CouponsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof CouponsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof CouponsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof CouponsDeleteParamsSchema>): Promise<z.infer<typeof CouponsDeleteResponseSchema>> => {
      try {
        const result = await couponsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['coupons'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['coupons'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['coupons'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['coupons'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof CouponsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /coupons/{id}/apply/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCouponsApplyMutation(options?: {
  onSuccess?: (data: z.infer<typeof CouponsApplyResponseSchema>, variables: { body: z.infer<typeof CouponsApplyRequestSchema>, params: z.infer<typeof CouponsApplyParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof CouponsApplyRequestSchema>, params: z.infer<typeof CouponsApplyParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof CouponsApplyRequestSchema>, params: z.infer<typeof CouponsApplyParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof CouponsApplyRequestSchema>, params: z.infer<typeof CouponsApplyParamsSchema> }): Promise<z.infer<typeof CouponsApplyResponseSchema>> => {
      try {
        const result = await couponsApply(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['coupons'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['coupons'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['coupons'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['coupons'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof CouponsApplyRequestSchema>, params: z.infer<typeof CouponsApplyParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}