'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { itemVariantsList, itemVariantsRead, itemVariantsCreate, itemVariantsUpdate, itemVariantsPartialUpdate, itemVariantsDelete } from '@/core/generated/actions/itemVariants'
import {
  ItemVariantsListResponseSchema,
  ItemVariantsListParamsSchema,
  ItemVariantsReadResponseSchema,
  ItemVariantsReadParamsSchema,
  ItemVariantsCreateResponseSchema,
  ItemVariantsCreateRequestSchema,
  ItemVariantsUpdateResponseSchema,
  ItemVariantsUpdateRequestSchema,
  ItemVariantsUpdateParamsSchema,
  ItemVariantsPartialUpdateResponseSchema,
  ItemVariantsPartialUpdateRequestSchema,
  ItemVariantsPartialUpdateParamsSchema,
  ItemVariantsDeleteResponseSchema,
  ItemVariantsDeleteParamsSchema
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
 * Optimized query hook for GET /item-variants/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ItemVariantsListResponseSchema>
 */
export function useItemVariantsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['itemVariantsList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await itemVariantsList({ params: { query: { search, ordering } } })
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
 * Suspense version for /item-variants/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ItemVariantsListResponseSchema>
 */
export function useSuspenseItemVariantsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['itemVariantsList', search, ordering],
    queryFn: async () => {
      const result = await itemVariantsList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized query hook for GET /item-variants/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ItemVariantsReadResponseSchema>
 */
export function useItemVariantsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['itemVariantsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await itemVariantsRead({ params: { path: { id } } })
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
 * Suspense version for /item-variants/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ItemVariantsReadResponseSchema>
 */
export function useSuspenseItemVariantsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['itemVariantsRead', id],
    queryFn: async () => {
      const result = await itemVariantsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized mutation hook for POST /item-variants/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useItemVariantsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ItemVariantsCreateResponseSchema>, variables: z.infer<typeof ItemVariantsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ItemVariantsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ItemVariantsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ItemVariantsCreateRequestSchema>): Promise<z.infer<typeof ItemVariantsCreateResponseSchema>> => {
      try {
        const result = await itemVariantsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['item-variants'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['item-variants'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['item-variants'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['item-variants'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['item-variants'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['item-variants'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ItemVariantsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /item-variants/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useItemVariantsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ItemVariantsUpdateResponseSchema>, variables: { body: z.infer<typeof ItemVariantsUpdateRequestSchema>, params: z.infer<typeof ItemVariantsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ItemVariantsUpdateRequestSchema>, params: z.infer<typeof ItemVariantsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ItemVariantsUpdateRequestSchema>, params: z.infer<typeof ItemVariantsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ItemVariantsUpdateRequestSchema>, params: z.infer<typeof ItemVariantsUpdateParamsSchema> }): Promise<z.infer<typeof ItemVariantsUpdateResponseSchema>> => {
      try {
        const result = await itemVariantsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['item-variants'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['item-variants'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['item-variants'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['item-variants'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['item-variants'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['item-variants'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ItemVariantsUpdateRequestSchema>, params: z.infer<typeof ItemVariantsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /item-variants/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useItemVariantsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ItemVariantsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof ItemVariantsPartialUpdateRequestSchema>, params: z.infer<typeof ItemVariantsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ItemVariantsPartialUpdateRequestSchema>, params: z.infer<typeof ItemVariantsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ItemVariantsPartialUpdateRequestSchema>, params: z.infer<typeof ItemVariantsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ItemVariantsPartialUpdateRequestSchema>, params: z.infer<typeof ItemVariantsPartialUpdateParamsSchema> }): Promise<z.infer<typeof ItemVariantsPartialUpdateResponseSchema>> => {
      try {
        const result = await itemVariantsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['item-variants'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['item-variants'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['item-variants'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['item-variants'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['item-variants'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['item-variants'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ItemVariantsPartialUpdateRequestSchema>, params: z.infer<typeof ItemVariantsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /item-variants/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useItemVariantsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof ItemVariantsDeleteResponseSchema>, variables: z.infer<typeof ItemVariantsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ItemVariantsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ItemVariantsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ItemVariantsDeleteParamsSchema>): Promise<z.infer<typeof ItemVariantsDeleteResponseSchema>> => {
      try {
        const result = await itemVariantsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['item-variants'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['item-variants'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['item-variants'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['item-variants'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['item-variants'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['item-variants'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ItemVariantsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}