'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { licenseTypesList, licenseTypesRead, licenseTypesCreate, licenseTypesUpdate, licenseTypesPartialUpdate, licenseTypesDelete } from '@/core/generated/actions/licenseTypes'
import {
  LicenseTypesListResponseSchema,
  LicenseTypesListParamsSchema,
  LicenseTypesReadResponseSchema,
  LicenseTypesReadParamsSchema,
  LicenseTypesCreateResponseSchema,
  LicenseTypesCreateRequestSchema,
  LicenseTypesUpdateResponseSchema,
  LicenseTypesUpdateRequestSchema,
  LicenseTypesUpdateParamsSchema,
  LicenseTypesPartialUpdateResponseSchema,
  LicenseTypesPartialUpdateRequestSchema,
  LicenseTypesPartialUpdateParamsSchema,
  LicenseTypesDeleteResponseSchema,
  LicenseTypesDeleteParamsSchema
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
 * Optimized query hook for GET /license-types/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof LicenseTypesListResponseSchema>
 */
export function useLicenseTypesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof LicenseTypesListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['licenseTypesList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await licenseTypesList({ params: { query: { search, ordering } } })
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
 * Suspense version for /license-types/
 * @returns useSuspenseQuery result with data of type z.infer<typeof LicenseTypesListResponseSchema>
 */
export function useSuspenseLicenseTypesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof LicenseTypesListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['licenseTypesList', search, ordering],
    queryFn: async () => {
      const result = await licenseTypesList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /license-types/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof LicenseTypesReadResponseSchema>
 */
export function useLicenseTypesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof LicenseTypesReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['licenseTypesRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await licenseTypesRead({ params: { path: { id } } })
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
 * Suspense version for /license-types/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof LicenseTypesReadResponseSchema>
 */
export function useSuspenseLicenseTypesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof LicenseTypesReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['licenseTypesRead', id],
    queryFn: async () => {
      const result = await licenseTypesRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /license-types/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useLicenseTypesCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof LicenseTypesCreateResponseSchema>, variables: z.infer<typeof LicenseTypesCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof LicenseTypesCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof LicenseTypesCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof LicenseTypesCreateRequestSchema>): Promise<z.infer<typeof LicenseTypesCreateResponseSchema>> => {
      try {
        const result = await licenseTypesCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['license-types'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['license-types'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['license-types'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['license-types'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['license-types'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['license-types'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof LicenseTypesCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /license-types/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useLicenseTypesUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof LicenseTypesUpdateResponseSchema>, variables: { body: z.infer<typeof LicenseTypesUpdateRequestSchema>, params: z.infer<typeof LicenseTypesUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof LicenseTypesUpdateRequestSchema>, params: z.infer<typeof LicenseTypesUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof LicenseTypesUpdateRequestSchema>, params: z.infer<typeof LicenseTypesUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof LicenseTypesUpdateRequestSchema>, params: z.infer<typeof LicenseTypesUpdateParamsSchema> }): Promise<z.infer<typeof LicenseTypesUpdateResponseSchema>> => {
      try {
        const result = await licenseTypesUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['license-types'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['license-types'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['license-types'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['license-types'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['license-types'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['license-types'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof LicenseTypesUpdateRequestSchema>, params: z.infer<typeof LicenseTypesUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /license-types/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useLicenseTypesPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof LicenseTypesPartialUpdateResponseSchema>, variables: { body: z.infer<typeof LicenseTypesPartialUpdateRequestSchema>, params: z.infer<typeof LicenseTypesPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof LicenseTypesPartialUpdateRequestSchema>, params: z.infer<typeof LicenseTypesPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof LicenseTypesPartialUpdateRequestSchema>, params: z.infer<typeof LicenseTypesPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof LicenseTypesPartialUpdateRequestSchema>, params: z.infer<typeof LicenseTypesPartialUpdateParamsSchema> }): Promise<z.infer<typeof LicenseTypesPartialUpdateResponseSchema>> => {
      try {
        const result = await licenseTypesPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['license-types'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['license-types'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['license-types'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['license-types'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['license-types'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['license-types'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof LicenseTypesPartialUpdateRequestSchema>, params: z.infer<typeof LicenseTypesPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /license-types/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useLicenseTypesDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof LicenseTypesDeleteResponseSchema>, variables: z.infer<typeof LicenseTypesDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof LicenseTypesDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof LicenseTypesDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof LicenseTypesDeleteParamsSchema>): Promise<z.infer<typeof LicenseTypesDeleteResponseSchema>> => {
      try {
        const result = await licenseTypesDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['license-types'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['license-types'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['license-types'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['license-types'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['license-types'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['license-types'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof LicenseTypesDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}