'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { profilesList, profilesRead, profilesCreate, profilesUpdate, profilesPartialUpdate, profilesDelete, profilesWithdrawConsent } from '@/core/generated/actions/profiles'
import {
  ProfilesListResponseSchema,
  ProfilesListParamsSchema,
  ProfilesReadResponseSchema,
  ProfilesReadParamsSchema,
  ProfilesCreateResponseSchema,
  ProfilesCreateRequestSchema,
  ProfilesUpdateResponseSchema,
  ProfilesUpdateRequestSchema,
  ProfilesUpdateParamsSchema,
  ProfilesPartialUpdateResponseSchema,
  ProfilesPartialUpdateRequestSchema,
  ProfilesPartialUpdateParamsSchema,
  ProfilesDeleteResponseSchema,
  ProfilesDeleteParamsSchema,
  ProfilesWithdrawConsentResponseSchema,
  ProfilesWithdrawConsentRequestSchema,
  ProfilesWithdrawConsentParamsSchema
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
 * Optimized query hook for GET /profiles/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ProfilesListResponseSchema>
 */
export function useProfilesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['profilesList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await profilesList({ params: { query: { search, ordering } } })
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
    ...options
  })
}

/**
 * Suspense version for /profiles/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ProfilesListResponseSchema>
 */
export function useSuspenseProfilesList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['profilesList', search, ordering],
    queryFn: async () => {
      const result = await profilesList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 300000,
    ...options
  })
}

/**
 * Optimized query hook for GET /profiles/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof ProfilesReadResponseSchema>
 */
export function useProfilesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['profilesRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await profilesRead({ params: { path: { id } } })
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
    ...options
  })
}

/**
 * Suspense version for /profiles/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof ProfilesReadResponseSchema>
 */
export function useSuspenseProfilesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['profilesRead', id],
    queryFn: async () => {
      const result = await profilesRead({ params: { path: { id } } })
      return result
    },
    staleTime: 300000,
    ...options
  })
}

/**
 * Optimized mutation hook for POST /profiles/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useProfilesCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ProfilesCreateResponseSchema>, variables: z.infer<typeof ProfilesCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ProfilesCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ProfilesCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ProfilesCreateRequestSchema>): Promise<z.infer<typeof ProfilesCreateResponseSchema>> => {
      try {
        const result = await profilesCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profiles'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['profiles'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['profiles'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['profiles'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ProfilesCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /profiles/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useProfilesUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ProfilesUpdateResponseSchema>, variables: { body: z.infer<typeof ProfilesUpdateRequestSchema>, params: z.infer<typeof ProfilesUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ProfilesUpdateRequestSchema>, params: z.infer<typeof ProfilesUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ProfilesUpdateRequestSchema>, params: z.infer<typeof ProfilesUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ProfilesUpdateRequestSchema>, params: z.infer<typeof ProfilesUpdateParamsSchema> }): Promise<z.infer<typeof ProfilesUpdateResponseSchema>> => {
      try {
        const result = await profilesUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profiles'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['profiles'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['profiles'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['profiles'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ProfilesUpdateRequestSchema>, params: z.infer<typeof ProfilesUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /profiles/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useProfilesPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof ProfilesPartialUpdateResponseSchema>, variables: { body: z.infer<typeof ProfilesPartialUpdateRequestSchema>, params: z.infer<typeof ProfilesPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ProfilesPartialUpdateRequestSchema>, params: z.infer<typeof ProfilesPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ProfilesPartialUpdateRequestSchema>, params: z.infer<typeof ProfilesPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ProfilesPartialUpdateRequestSchema>, params: z.infer<typeof ProfilesPartialUpdateParamsSchema> }): Promise<z.infer<typeof ProfilesPartialUpdateResponseSchema>> => {
      try {
        const result = await profilesPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profiles'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['profiles'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['profiles'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['profiles'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ProfilesPartialUpdateRequestSchema>, params: z.infer<typeof ProfilesPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /profiles/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useProfilesDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof ProfilesDeleteResponseSchema>, variables: z.infer<typeof ProfilesDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof ProfilesDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof ProfilesDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof ProfilesDeleteParamsSchema>): Promise<z.infer<typeof ProfilesDeleteResponseSchema>> => {
      try {
        const result = await profilesDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profiles'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['profiles'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['profiles'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['profiles'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof ProfilesDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /profiles/{id}/withdraw_consent/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useProfilesWithdrawConsentMutation(options?: {
  onSuccess?: (data: z.infer<typeof ProfilesWithdrawConsentResponseSchema>, variables: { body: z.infer<typeof ProfilesWithdrawConsentRequestSchema>, params: z.infer<typeof ProfilesWithdrawConsentParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof ProfilesWithdrawConsentRequestSchema>, params: z.infer<typeof ProfilesWithdrawConsentParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof ProfilesWithdrawConsentRequestSchema>, params: z.infer<typeof ProfilesWithdrawConsentParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof ProfilesWithdrawConsentRequestSchema>, params: z.infer<typeof ProfilesWithdrawConsentParamsSchema> }): Promise<z.infer<typeof ProfilesWithdrawConsentResponseSchema>> => {
      try {
        const result = await profilesWithdrawConsent(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profiles'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['profiles'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['profiles'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['profiles'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof ProfilesWithdrawConsentRequestSchema>, params: z.infer<typeof ProfilesWithdrawConsentParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}