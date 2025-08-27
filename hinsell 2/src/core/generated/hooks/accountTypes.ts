'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { accountTypesList, accountTypesRead, accountTypesCreate, accountTypesUpdate, accountTypesPartialUpdate, accountTypesDelete } from '@/core/generated/actions/accountTypes'
import {
  AccountTypesListResponseSchema,
  AccountTypesReadResponseSchema,
  AccountTypesReadParamsSchema,
  AccountTypesCreateResponseSchema,
  AccountTypesCreateRequestSchema,
  AccountTypesUpdateResponseSchema,
  AccountTypesUpdateRequestSchema,
  AccountTypesUpdateParamsSchema,
  AccountTypesPartialUpdateResponseSchema,
  AccountTypesPartialUpdateRequestSchema,
  AccountTypesPartialUpdateParamsSchema,
  AccountTypesDeleteResponseSchema,
  AccountTypesDeleteParamsSchema
} from '@/core/generated/schemas'
import type { z } from 'zod'



// Error handling utility
function handleActionError(error: unknown): never {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  toast.error(message)
  throw new Error(message)
}

/**
 * Optimized query hook for GET /account-types/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof AccountTypesListResponseSchema>
 */
export function useAccountTypesList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof AccountTypesListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['accountTypesList'],
    queryFn: async ({ signal }) => {
      try {
        const result = await accountTypesList({})
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
 * Suspense version for /account-types/
 * @returns useSuspenseQuery result with data of type z.infer<typeof AccountTypesListResponseSchema>
 */
export function useSuspenseAccountTypesList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof AccountTypesListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['accountTypesList'],
    queryFn: async () => {
      const result = await accountTypesList({})
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /account-types/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof AccountTypesReadResponseSchema>
 */
export function useAccountTypesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof AccountTypesReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['accountTypesRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await accountTypesRead({ params: { path: { id } } })
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
 * Suspense version for /account-types/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof AccountTypesReadResponseSchema>
 */
export function useSuspenseAccountTypesRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof AccountTypesReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['accountTypesRead', id],
    queryFn: async () => {
      const result = await accountTypesRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /account-types/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAccountTypesCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AccountTypesCreateResponseSchema>, variables: z.infer<typeof AccountTypesCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AccountTypesCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AccountTypesCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AccountTypesCreateRequestSchema>): Promise<z.infer<typeof AccountTypesCreateResponseSchema>> => {
      try {
        const result = await accountTypesCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['account-types'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['account-types'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['account-types'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['account-types'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['account-types'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['account-types'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AccountTypesCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /account-types/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAccountTypesUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AccountTypesUpdateResponseSchema>, variables: { body: z.infer<typeof AccountTypesUpdateRequestSchema>, params: z.infer<typeof AccountTypesUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof AccountTypesUpdateRequestSchema>, params: z.infer<typeof AccountTypesUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof AccountTypesUpdateRequestSchema>, params: z.infer<typeof AccountTypesUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof AccountTypesUpdateRequestSchema>, params: z.infer<typeof AccountTypesUpdateParamsSchema> }): Promise<z.infer<typeof AccountTypesUpdateResponseSchema>> => {
      try {
        const result = await accountTypesUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['account-types'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['account-types'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['account-types'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['account-types'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['account-types'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['account-types'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof AccountTypesUpdateRequestSchema>, params: z.infer<typeof AccountTypesUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /account-types/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAccountTypesPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AccountTypesPartialUpdateResponseSchema>, variables: { body: z.infer<typeof AccountTypesPartialUpdateRequestSchema>, params: z.infer<typeof AccountTypesPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof AccountTypesPartialUpdateRequestSchema>, params: z.infer<typeof AccountTypesPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof AccountTypesPartialUpdateRequestSchema>, params: z.infer<typeof AccountTypesPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof AccountTypesPartialUpdateRequestSchema>, params: z.infer<typeof AccountTypesPartialUpdateParamsSchema> }): Promise<z.infer<typeof AccountTypesPartialUpdateResponseSchema>> => {
      try {
        const result = await accountTypesPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['account-types'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['account-types'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['account-types'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['account-types'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['account-types'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['account-types'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof AccountTypesPartialUpdateRequestSchema>, params: z.infer<typeof AccountTypesPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /account-types/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAccountTypesDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof AccountTypesDeleteResponseSchema>, variables: z.infer<typeof AccountTypesDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AccountTypesDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AccountTypesDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AccountTypesDeleteParamsSchema>): Promise<z.infer<typeof AccountTypesDeleteResponseSchema>> => {
      try {
        const result = await accountTypesDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['account-types'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['account-types'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['account-types'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['account-types'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['account-types'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['account-types'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AccountTypesDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}