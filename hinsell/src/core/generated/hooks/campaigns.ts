'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { campaignsList, campaignsRead, campaignsCreate, campaignsUpdate, campaignsPartialUpdate, campaignsDelete, campaignsTrackClick, campaignsTrackConversion, campaignsTrackImpression } from '@/core/generated/actions/campaigns'
import {
  CampaignsListResponseSchema,
  CampaignsListParamsSchema,
  CampaignsReadResponseSchema,
  CampaignsReadParamsSchema,
  CampaignsCreateResponseSchema,
  CampaignsCreateRequestSchema,
  CampaignsUpdateResponseSchema,
  CampaignsUpdateRequestSchema,
  CampaignsUpdateParamsSchema,
  CampaignsPartialUpdateResponseSchema,
  CampaignsPartialUpdateRequestSchema,
  CampaignsPartialUpdateParamsSchema,
  CampaignsDeleteResponseSchema,
  CampaignsDeleteParamsSchema,
  CampaignsTrackClickResponseSchema,
  CampaignsTrackClickRequestSchema,
  CampaignsTrackClickParamsSchema,
  CampaignsTrackConversionResponseSchema,
  CampaignsTrackConversionRequestSchema,
  CampaignsTrackConversionParamsSchema,
  CampaignsTrackImpressionResponseSchema,
  CampaignsTrackImpressionRequestSchema,
  CampaignsTrackImpressionParamsSchema
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
 * Optimized query hook for GET /campaigns/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof CampaignsListResponseSchema>
 */
export function useCampaignsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['campaignsList', search, ordering],
    queryFn: async ({ signal }) => {
      try {
        const result = await campaignsList({ params: { query: { search, ordering } } })
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
 * Suspense version for /campaigns/
 * @returns useSuspenseQuery result with data of type z.infer<typeof CampaignsListResponseSchema>
 */
export function useSuspenseCampaignsList(search?: string, ordering?: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['campaignsList', search, ordering],
    queryFn: async () => {
      const result = await campaignsList({ params: { query: { search, ordering } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized query hook for GET /campaigns/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof CampaignsReadResponseSchema>
 */
export function useCampaignsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['campaignsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await campaignsRead({ params: { path: { id } } })
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
 * Suspense version for /campaigns/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof CampaignsReadResponseSchema>
 */
export function useSuspenseCampaignsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number }) {
  return useSuspenseQuery({
    queryKey: ['campaignsRead', id],
    queryFn: async () => {
      const result = await campaignsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    ...options
  })
}

/**
 * Optimized mutation hook for POST /campaigns/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCampaignsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof CampaignsCreateResponseSchema>, variables: z.infer<typeof CampaignsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof CampaignsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof CampaignsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof CampaignsCreateRequestSchema>): Promise<z.infer<typeof CampaignsCreateResponseSchema>> => {
      try {
        const result = await campaignsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['campaigns'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['campaigns'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['campaigns'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['campaigns'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof CampaignsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /campaigns/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCampaignsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof CampaignsUpdateResponseSchema>, variables: { body: z.infer<typeof CampaignsUpdateRequestSchema>, params: z.infer<typeof CampaignsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof CampaignsUpdateRequestSchema>, params: z.infer<typeof CampaignsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof CampaignsUpdateRequestSchema>, params: z.infer<typeof CampaignsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof CampaignsUpdateRequestSchema>, params: z.infer<typeof CampaignsUpdateParamsSchema> }): Promise<z.infer<typeof CampaignsUpdateResponseSchema>> => {
      try {
        const result = await campaignsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['campaigns'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['campaigns'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['campaigns'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['campaigns'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof CampaignsUpdateRequestSchema>, params: z.infer<typeof CampaignsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /campaigns/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCampaignsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof CampaignsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof CampaignsPartialUpdateRequestSchema>, params: z.infer<typeof CampaignsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof CampaignsPartialUpdateRequestSchema>, params: z.infer<typeof CampaignsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof CampaignsPartialUpdateRequestSchema>, params: z.infer<typeof CampaignsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof CampaignsPartialUpdateRequestSchema>, params: z.infer<typeof CampaignsPartialUpdateParamsSchema> }): Promise<z.infer<typeof CampaignsPartialUpdateResponseSchema>> => {
      try {
        const result = await campaignsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['campaigns'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['campaigns'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['campaigns'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['campaigns'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof CampaignsPartialUpdateRequestSchema>, params: z.infer<typeof CampaignsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /campaigns/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCampaignsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof CampaignsDeleteResponseSchema>, variables: z.infer<typeof CampaignsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof CampaignsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof CampaignsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof CampaignsDeleteParamsSchema>): Promise<z.infer<typeof CampaignsDeleteResponseSchema>> => {
      try {
        const result = await campaignsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['campaigns'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['campaigns'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['campaigns'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['campaigns'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof CampaignsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /campaigns/{id}/track_click/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCampaignsTrackClickMutation(options?: {
  onSuccess?: (data: z.infer<typeof CampaignsTrackClickResponseSchema>, variables: { body: z.infer<typeof CampaignsTrackClickRequestSchema>, params: z.infer<typeof CampaignsTrackClickParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof CampaignsTrackClickRequestSchema>, params: z.infer<typeof CampaignsTrackClickParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof CampaignsTrackClickRequestSchema>, params: z.infer<typeof CampaignsTrackClickParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof CampaignsTrackClickRequestSchema>, params: z.infer<typeof CampaignsTrackClickParamsSchema> }): Promise<z.infer<typeof CampaignsTrackClickResponseSchema>> => {
      try {
        const result = await campaignsTrackClick(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['campaigns'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['campaigns'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['campaigns'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['campaigns'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof CampaignsTrackClickRequestSchema>, params: z.infer<typeof CampaignsTrackClickParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /campaigns/{id}/track_conversion/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCampaignsTrackConversionMutation(options?: {
  onSuccess?: (data: z.infer<typeof CampaignsTrackConversionResponseSchema>, variables: { body: z.infer<typeof CampaignsTrackConversionRequestSchema>, params: z.infer<typeof CampaignsTrackConversionParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof CampaignsTrackConversionRequestSchema>, params: z.infer<typeof CampaignsTrackConversionParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof CampaignsTrackConversionRequestSchema>, params: z.infer<typeof CampaignsTrackConversionParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof CampaignsTrackConversionRequestSchema>, params: z.infer<typeof CampaignsTrackConversionParamsSchema> }): Promise<z.infer<typeof CampaignsTrackConversionResponseSchema>> => {
      try {
        const result = await campaignsTrackConversion(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['campaigns'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['campaigns'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['campaigns'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['campaigns'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof CampaignsTrackConversionRequestSchema>, params: z.infer<typeof CampaignsTrackConversionParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /campaigns/{id}/track_impression/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useCampaignsTrackImpressionMutation(options?: {
  onSuccess?: (data: z.infer<typeof CampaignsTrackImpressionResponseSchema>, variables: { body: z.infer<typeof CampaignsTrackImpressionRequestSchema>, params: z.infer<typeof CampaignsTrackImpressionParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof CampaignsTrackImpressionRequestSchema>, params: z.infer<typeof CampaignsTrackImpressionParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof CampaignsTrackImpressionRequestSchema>, params: z.infer<typeof CampaignsTrackImpressionParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof CampaignsTrackImpressionRequestSchema>, params: z.infer<typeof CampaignsTrackImpressionParamsSchema> }): Promise<z.infer<typeof CampaignsTrackImpressionResponseSchema>> => {
      try {
        const result = await campaignsTrackImpression(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['campaigns'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['campaigns'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['campaigns'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['campaigns'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof CampaignsTrackImpressionRequestSchema>, params: z.infer<typeof CampaignsTrackImpressionParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}