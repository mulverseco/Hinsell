'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { itemBarcodesList, itemBarcodesRead, itemBarcodesCreate, itemBarcodesUpdate, itemBarcodesPartialUpdate, itemBarcodesDelete } from '@/core/generated/actions/itemBarcodes'
import {
  ItemBarcodesListResponseSchema,
  ItemBarcodesListParamsSchema,
  ItemBarcodesReadResponseSchema,
  ItemBarcodesReadParamsSchema,
  ItemBarcodesCreateResponseSchema,
  ItemBarcodesCreateRequestSchema,
  ItemBarcodesUpdateResponseSchema,
  ItemBarcodesUpdateRequestSchema,
  ItemBarcodesUpdateParamsSchema,
  ItemBarcodesPartialUpdateResponseSchema,
  ItemBarcodesPartialUpdateRequestSchema,
  ItemBarcodesPartialUpdateParamsSchema,
  ItemBarcodesDeleteResponseSchema,
  ItemBarcodesDeleteParamsSchema
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
 * Optimized query hook for GET /item-barcodes/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ItemBarcodesListResponseSchema>
 */
export function useItemBarcodesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ItemBarcodesListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['itemBarcodesList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await itemBarcodesList({ params: { query: { search, ordering } } })
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
 * Suspense version for /item-barcodes/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ItemBarcodesListResponseSchema>
 */
export function useSuspenseItemBarcodesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ItemBarcodesListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['itemBarcodesList', search, ordering],
    queryFn: async () => {
      const result = await itemBarcodesList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /item-barcodes/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ItemBarcodesReadResponseSchema>
 */
export function useItemBarcodesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ItemBarcodesReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['itemBarcodesRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await itemBarcodesRead({ params: { path: { id } } })
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
 * Suspense version for /item-barcodes/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ItemBarcodesReadResponseSchema>
 */
export function useSuspenseItemBarcodesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof ItemBarcodesReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['itemBarcodesRead', id],
    queryFn: async () => {
      const result = await itemBarcodesRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /item-barcodes/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useItemBarcodesCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ItemBarcodesCreateResponseSchema>, variables: z.infer<typeof ItemBarcodesCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ItemBarcodesCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ItemBarcodesCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ItemBarcodesCreateRequestSchema>): Promise<z.infer<typeof ItemBarcodesCreateResponseSchema>> => {
      try {
        const result = await itemBarcodesCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['item-barcodes'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['item-barcodes'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['item-barcodes'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['item-barcodes'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['item-barcodes'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['item-barcodes'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ItemBarcodesCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /item-barcodes/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useItemBarcodesUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ItemBarcodesUpdateResponseSchema>, variables: { body: z.infer<typeof ItemBarcodesUpdateRequestSchema>, params: z.infer<typeof ItemBarcodesUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ItemBarcodesUpdateRequestSchema>, params: z.infer<typeof ItemBarcodesUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ItemBarcodesUpdateRequestSchema>, params: z.infer<typeof ItemBarcodesUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ItemBarcodesUpdateRequestSchema>, params: z.infer<typeof ItemBarcodesUpdateParamsSchema> }): Promise<z.infer<typeof ItemBarcodesUpdateResponseSchema>> => {
      try {
        const result = await itemBarcodesUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['item-barcodes'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['item-barcodes'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['item-barcodes'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['item-barcodes'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['item-barcodes'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['item-barcodes'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ItemBarcodesUpdateRequestSchema>, params: z.infer<typeof ItemBarcodesUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /item-barcodes/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useItemBarcodesPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ItemBarcodesPartialUpdateResponseSchema>, variables: { body: z.infer<typeof ItemBarcodesPartialUpdateRequestSchema>, params: z.infer<typeof ItemBarcodesPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ItemBarcodesPartialUpdateRequestSchema>, params: z.infer<typeof ItemBarcodesPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ItemBarcodesPartialUpdateRequestSchema>, params: z.infer<typeof ItemBarcodesPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ItemBarcodesPartialUpdateRequestSchema>, params: z.infer<typeof ItemBarcodesPartialUpdateParamsSchema> }): Promise<z.infer<typeof ItemBarcodesPartialUpdateResponseSchema>> => {
      try {
        const result = await itemBarcodesPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['item-barcodes'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['item-barcodes'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['item-barcodes'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['item-barcodes'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['item-barcodes'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['item-barcodes'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ItemBarcodesPartialUpdateRequestSchema>, params: z.infer<typeof ItemBarcodesPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /item-barcodes/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useItemBarcodesDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof ItemBarcodesDeleteResponseSchema>, variables: z.infer<typeof ItemBarcodesDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ItemBarcodesDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ItemBarcodesDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ItemBarcodesDeleteParamsSchema>): Promise<z.infer<typeof ItemBarcodesDeleteResponseSchema>> => {
      try {
        const result = await itemBarcodesDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['item-barcodes'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['item-barcodes'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['item-barcodes'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['item-barcodes'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['item-barcodes'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['item-barcodes'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ItemBarcodesDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}