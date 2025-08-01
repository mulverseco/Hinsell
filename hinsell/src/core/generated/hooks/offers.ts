'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { offersList, offersRead, offersCreate, offersUpdate, offersPartialUpdate, offersDelete, offersApply } from '@/core/generated/actions/offers'
import {
  OffersListResponseSchema,
  OffersListParamsSchema,
  OffersReadResponseSchema,
  OffersReadParamsSchema,
  OffersCreateResponseSchema,
  OffersCreateRequestSchema,
  OffersUpdateResponseSchema,
  OffersUpdateRequestSchema,
  OffersUpdateParamsSchema,
  OffersPartialUpdateResponseSchema,
  OffersPartialUpdateRequestSchema,
  OffersPartialUpdateParamsSchema,
  OffersDeleteResponseSchema,
  OffersDeleteParamsSchema,
  OffersApplyResponseSchema,
  OffersApplyRequestSchema,
  OffersApplyParamsSchema
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
 * Optimized query hook for GET /offers/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof OffersListResponseSchema>
 */
export function useOffersList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['offersList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await offersList({ params: { query: { search, ordering } } })
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
 * Suspense version for /offers/
 * @returns useSuspenseQuery result with data of type z.infer<typeof OffersListResponseSchema>
 */
export function useSuspenseOffersList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['offersList', search, ordering],
    queryFn: async () => {
      const result = await offersList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized query hook for GET /offers/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof OffersReadResponseSchema>
 */
export function useOffersRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['offersRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await offersRead({ params: { path: { id } } })
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
 * Suspense version for /offers/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof OffersReadResponseSchema>
 */
export function useSuspenseOffersRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['offersRead', id],
    queryFn: async () => {
      const result = await offersRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized mutation hook for POST /offers/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useOffersCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof OffersCreateResponseSchema>, variables: z.infer<typeof OffersCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof OffersCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof OffersCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof OffersCreateRequestSchema>): Promise<z.infer<typeof OffersCreateResponseSchema>> => {
      try {
        const result = await offersCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['offers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['offers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['offers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['offers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['offers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['offers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof OffersCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /offers/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useOffersUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof OffersUpdateResponseSchema>, variables: { body: z.infer<typeof OffersUpdateRequestSchema>, params: z.infer<typeof OffersUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof OffersUpdateRequestSchema>, params: z.infer<typeof OffersUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof OffersUpdateRequestSchema>, params: z.infer<typeof OffersUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof OffersUpdateRequestSchema>, params: z.infer<typeof OffersUpdateParamsSchema> }): Promise<z.infer<typeof OffersUpdateResponseSchema>> => {
      try {
        const result = await offersUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['offers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['offers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['offers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['offers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['offers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['offers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof OffersUpdateRequestSchema>, params: z.infer<typeof OffersUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /offers/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useOffersPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof OffersPartialUpdateResponseSchema>, variables: { body: z.infer<typeof OffersPartialUpdateRequestSchema>, params: z.infer<typeof OffersPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof OffersPartialUpdateRequestSchema>, params: z.infer<typeof OffersPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof OffersPartialUpdateRequestSchema>, params: z.infer<typeof OffersPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof OffersPartialUpdateRequestSchema>, params: z.infer<typeof OffersPartialUpdateParamsSchema> }): Promise<z.infer<typeof OffersPartialUpdateResponseSchema>> => {
      try {
        const result = await offersPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['offers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['offers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['offers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['offers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['offers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['offers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof OffersPartialUpdateRequestSchema>, params: z.infer<typeof OffersPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /offers/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useOffersDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof OffersDeleteResponseSchema>, variables: z.infer<typeof OffersDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof OffersDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof OffersDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof OffersDeleteParamsSchema>): Promise<z.infer<typeof OffersDeleteResponseSchema>> => {
      try {
        const result = await offersDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['offers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['offers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['offers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['offers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['offers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['offers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof OffersDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /offers/{id}/apply/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useOffersApplyMutation(options?: {
  onSuccess?: (data: z.infer<typeof OffersApplyResponseSchema>, variables: { body: z.infer<typeof OffersApplyRequestSchema>, params: z.infer<typeof OffersApplyParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof OffersApplyRequestSchema>, params: z.infer<typeof OffersApplyParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof OffersApplyRequestSchema>, params: z.infer<typeof OffersApplyParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof OffersApplyRequestSchema>, params: z.infer<typeof OffersApplyParamsSchema> }): Promise<z.infer<typeof OffersApplyResponseSchema>> => {
      try {
        const result = await offersApply(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['offers'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['offers'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['offers'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['offers'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['offers'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['offers'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof OffersApplyRequestSchema>, params: z.infer<typeof OffersApplyParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}