'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { licensesList, licensesRead, licensesCreate, licensesUpdate, licensesPartialUpdate, licensesDelete, licensesValidate } from '@/core/generated/actions/licenses'
import {
  LicensesListResponseSchema,
  LicensesListParamsSchema,
  LicensesReadResponseSchema,
  LicensesReadParamsSchema,
  LicensesCreateResponseSchema,
  LicensesCreateRequestSchema,
  LicensesUpdateResponseSchema,
  LicensesUpdateRequestSchema,
  LicensesUpdateParamsSchema,
  LicensesPartialUpdateResponseSchema,
  LicensesPartialUpdateRequestSchema,
  LicensesPartialUpdateParamsSchema,
  LicensesDeleteResponseSchema,
  LicensesDeleteParamsSchema,
  LicensesValidateResponseSchema,
  LicensesValidateRequestSchema,
  LicensesValidateParamsSchema
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
 * Optimized query hook for GET /licenses/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof LicensesListResponseSchema>
 */
export function useLicensesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['licensesList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await licensesList({ params: { query: { search, ordering } } })
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
 * Suspense version for /licenses/
 * @returns useSuspenseQuery result with data of type z.infer<typeof LicensesListResponseSchema>
 */
export function useSuspenseLicensesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['licensesList', search, ordering],
    queryFn: async () => {
      const result = await licensesList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized query hook for GET /licenses/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof LicensesReadResponseSchema>
 */
export function useLicensesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['licensesRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await licensesRead({ params: { path: { id } } })
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
 * Suspense version for /licenses/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof LicensesReadResponseSchema>
 */
export function useSuspenseLicensesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['licensesRead', id],
    queryFn: async () => {
      const result = await licensesRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized mutation hook for POST /licenses/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useLicensesCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof LicensesCreateResponseSchema>, variables: z.infer<typeof LicensesCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof LicensesCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof LicensesCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof LicensesCreateRequestSchema>): Promise<z.infer<typeof LicensesCreateResponseSchema>> => {
      try {
        const result = await licensesCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['licenses'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['licenses'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['licenses'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['licenses'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['licenses'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['licenses'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof LicensesCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /licenses/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useLicensesUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof LicensesUpdateResponseSchema>, variables: { body: z.infer<typeof LicensesUpdateRequestSchema>, params: z.infer<typeof LicensesUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof LicensesUpdateRequestSchema>, params: z.infer<typeof LicensesUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof LicensesUpdateRequestSchema>, params: z.infer<typeof LicensesUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof LicensesUpdateRequestSchema>, params: z.infer<typeof LicensesUpdateParamsSchema> }): Promise<z.infer<typeof LicensesUpdateResponseSchema>> => {
      try {
        const result = await licensesUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['licenses'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['licenses'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['licenses'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['licenses'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['licenses'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['licenses'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof LicensesUpdateRequestSchema>, params: z.infer<typeof LicensesUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /licenses/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useLicensesPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof LicensesPartialUpdateResponseSchema>, variables: { body: z.infer<typeof LicensesPartialUpdateRequestSchema>, params: z.infer<typeof LicensesPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof LicensesPartialUpdateRequestSchema>, params: z.infer<typeof LicensesPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof LicensesPartialUpdateRequestSchema>, params: z.infer<typeof LicensesPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof LicensesPartialUpdateRequestSchema>, params: z.infer<typeof LicensesPartialUpdateParamsSchema> }): Promise<z.infer<typeof LicensesPartialUpdateResponseSchema>> => {
      try {
        const result = await licensesPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['licenses'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['licenses'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['licenses'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['licenses'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['licenses'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['licenses'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof LicensesPartialUpdateRequestSchema>, params: z.infer<typeof LicensesPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /licenses/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useLicensesDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof LicensesDeleteResponseSchema>, variables: z.infer<typeof LicensesDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof LicensesDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof LicensesDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof LicensesDeleteParamsSchema>): Promise<z.infer<typeof LicensesDeleteResponseSchema>> => {
      try {
        const result = await licensesDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['licenses'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['licenses'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['licenses'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['licenses'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['licenses'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['licenses'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof LicensesDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /licenses/{id}/validate/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useLicensesValidateMutation(options?: {
  onSuccess?: (data: z.infer<typeof LicensesValidateResponseSchema>, variables: { body: z.infer<typeof LicensesValidateRequestSchema>, params: z.infer<typeof LicensesValidateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof LicensesValidateRequestSchema>, params: z.infer<typeof LicensesValidateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof LicensesValidateRequestSchema>, params: z.infer<typeof LicensesValidateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof LicensesValidateRequestSchema>, params: z.infer<typeof LicensesValidateParamsSchema> }): Promise<z.infer<typeof LicensesValidateResponseSchema>> => {
      try {
        const result = await licensesValidate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['licenses'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['licenses'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['licenses'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['licenses'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['licenses'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['licenses'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof LicensesValidateRequestSchema>, params: z.infer<typeof LicensesValidateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}