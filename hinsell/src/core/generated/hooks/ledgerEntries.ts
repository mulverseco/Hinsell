'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { ledgerEntriesList, ledgerEntriesRead, ledgerEntriesCreate, ledgerEntriesUpdate, ledgerEntriesPartialUpdate, ledgerEntriesDelete } from '@/core/generated/actions/ledgerEntries'
import {
  LedgerEntriesListResponseSchema,
  LedgerEntriesListParamsSchema,
  LedgerEntriesReadResponseSchema,
  LedgerEntriesReadParamsSchema,
  LedgerEntriesCreateResponseSchema,
  LedgerEntriesCreateRequestSchema,
  LedgerEntriesUpdateResponseSchema,
  LedgerEntriesUpdateRequestSchema,
  LedgerEntriesUpdateParamsSchema,
  LedgerEntriesPartialUpdateResponseSchema,
  LedgerEntriesPartialUpdateRequestSchema,
  LedgerEntriesPartialUpdateParamsSchema,
  LedgerEntriesDeleteResponseSchema,
  LedgerEntriesDeleteParamsSchema
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
 * Optimized query hook for GET /ledger-entries/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof LedgerEntriesListResponseSchema>
 */
export function useLedgerEntriesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof LedgerEntriesListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['ledgerEntriesList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await ledgerEntriesList({ params: { query: { search, ordering } } })
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
 * Suspense version for /ledger-entries/
 * @returns useSuspenseQuery result with data of type z.infer<typeof LedgerEntriesListResponseSchema>
 */
export function useSuspenseLedgerEntriesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof LedgerEntriesListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['ledgerEntriesList', search, ordering],
    queryFn: async () => {
      const result = await ledgerEntriesList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /ledger-entries/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof LedgerEntriesReadResponseSchema>
 */
export function useLedgerEntriesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof LedgerEntriesReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['ledgerEntriesRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await ledgerEntriesRead({ params: { path: { id } } })
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
 * Suspense version for /ledger-entries/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof LedgerEntriesReadResponseSchema>
 */
export function useSuspenseLedgerEntriesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof LedgerEntriesReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['ledgerEntriesRead', id],
    queryFn: async () => {
      const result = await ledgerEntriesRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /ledger-entries/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useLedgerEntriesCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof LedgerEntriesCreateResponseSchema>, variables: z.infer<typeof LedgerEntriesCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof LedgerEntriesCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof LedgerEntriesCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof LedgerEntriesCreateRequestSchema>): Promise<z.infer<typeof LedgerEntriesCreateResponseSchema>> => {
      try {
        const result = await ledgerEntriesCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['ledger-entries'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['ledger-entries'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['ledger-entries'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['ledger-entries'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof LedgerEntriesCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /ledger-entries/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useLedgerEntriesUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof LedgerEntriesUpdateResponseSchema>, variables: { body: z.infer<typeof LedgerEntriesUpdateRequestSchema>, params: z.infer<typeof LedgerEntriesUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof LedgerEntriesUpdateRequestSchema>, params: z.infer<typeof LedgerEntriesUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof LedgerEntriesUpdateRequestSchema>, params: z.infer<typeof LedgerEntriesUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof LedgerEntriesUpdateRequestSchema>, params: z.infer<typeof LedgerEntriesUpdateParamsSchema> }): Promise<z.infer<typeof LedgerEntriesUpdateResponseSchema>> => {
      try {
        const result = await ledgerEntriesUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['ledger-entries'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['ledger-entries'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['ledger-entries'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['ledger-entries'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof LedgerEntriesUpdateRequestSchema>, params: z.infer<typeof LedgerEntriesUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /ledger-entries/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useLedgerEntriesPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof LedgerEntriesPartialUpdateResponseSchema>, variables: { body: z.infer<typeof LedgerEntriesPartialUpdateRequestSchema>, params: z.infer<typeof LedgerEntriesPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof LedgerEntriesPartialUpdateRequestSchema>, params: z.infer<typeof LedgerEntriesPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof LedgerEntriesPartialUpdateRequestSchema>, params: z.infer<typeof LedgerEntriesPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof LedgerEntriesPartialUpdateRequestSchema>, params: z.infer<typeof LedgerEntriesPartialUpdateParamsSchema> }): Promise<z.infer<typeof LedgerEntriesPartialUpdateResponseSchema>> => {
      try {
        const result = await ledgerEntriesPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['ledger-entries'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['ledger-entries'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['ledger-entries'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['ledger-entries'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof LedgerEntriesPartialUpdateRequestSchema>, params: z.infer<typeof LedgerEntriesPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /ledger-entries/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useLedgerEntriesDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof LedgerEntriesDeleteResponseSchema>, variables: z.infer<typeof LedgerEntriesDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof LedgerEntriesDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof LedgerEntriesDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof LedgerEntriesDeleteParamsSchema>): Promise<z.infer<typeof LedgerEntriesDeleteResponseSchema>> => {
      try {
        const result = await ledgerEntriesDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['ledger-entries'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['ledger-entries'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['ledger-entries'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['ledger-entries'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof LedgerEntriesDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}