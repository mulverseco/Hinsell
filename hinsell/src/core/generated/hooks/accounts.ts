'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { accountsList, accountsRead, accountsCreate, accountsUpdate, accountsPartialUpdate, accountsDelete, accountsUpdateBalance, accountsUpdateBalance } from '@/core/generated/actions/accounts'
import {
  AccountsListResponseSchema,
  AccountsReadResponseSchema,
  AccountsReadParamsSchema,
  AccountsCreateResponseSchema,
  AccountsCreateRequestSchema,
  AccountsUpdateResponseSchema,
  AccountsUpdateRequestSchema,
  AccountsUpdateParamsSchema,
  AccountsPartialUpdateResponseSchema,
  AccountsPartialUpdateRequestSchema,
  AccountsPartialUpdateParamsSchema,
  AccountsDeleteResponseSchema,
  AccountsDeleteParamsSchema,
  AccountsUpdateBalanceResponseSchema,
  AccountsUpdateBalanceRequestSchema,
  AccountsUpdateBalanceParamsSchema
} from '@/core/generated/schemas'
import type { z } from 'zod'



// Error handling utility
function handleActionError(error: unknown): never {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  toast.error(message)
  throw new Error(message)
}

/**
 * Optimized query hook for GET /accounts/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof AccountsListResponseSchema>
 */
export function useAccountsList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof AccountsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['accountsList'],
    queryFn: async ({ signal }) => {
      try {
        const result = await accountsList({})
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
 * Suspense version for /accounts/
 * @returns useSuspenseQuery result with data of type z.infer<typeof AccountsListResponseSchema>
 */
export function useSuspenseAccountsList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof AccountsListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['accountsList'],
    queryFn: async () => {
      const result = await accountsList({})
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /accounts/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof AccountsReadResponseSchema>
 */
export function useAccountsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof AccountsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['accountsRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await accountsRead({ params: { path: { id } } })
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
 * Suspense version for /accounts/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof AccountsReadResponseSchema>
 */
export function useSuspenseAccountsRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof AccountsReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['accountsRead', id],
    queryFn: async () => {
      const result = await accountsRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /accounts/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAccountsCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AccountsCreateResponseSchema>, variables: z.infer<typeof AccountsCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AccountsCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AccountsCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AccountsCreateRequestSchema>): Promise<z.infer<typeof AccountsCreateResponseSchema>> => {
      try {
        const result = await accountsCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['accounts'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['accounts'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['accounts'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['accounts'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AccountsCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /accounts/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAccountsUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AccountsUpdateResponseSchema>, variables: { body: z.infer<typeof AccountsUpdateRequestSchema>, params: z.infer<typeof AccountsUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof AccountsUpdateRequestSchema>, params: z.infer<typeof AccountsUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof AccountsUpdateRequestSchema>, params: z.infer<typeof AccountsUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof AccountsUpdateRequestSchema>, params: z.infer<typeof AccountsUpdateParamsSchema> }): Promise<z.infer<typeof AccountsUpdateResponseSchema>> => {
      try {
        const result = await accountsUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['accounts'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['accounts'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['accounts'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['accounts'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof AccountsUpdateRequestSchema>, params: z.infer<typeof AccountsUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /accounts/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAccountsPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AccountsPartialUpdateResponseSchema>, variables: { body: z.infer<typeof AccountsPartialUpdateRequestSchema>, params: z.infer<typeof AccountsPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof AccountsPartialUpdateRequestSchema>, params: z.infer<typeof AccountsPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof AccountsPartialUpdateRequestSchema>, params: z.infer<typeof AccountsPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof AccountsPartialUpdateRequestSchema>, params: z.infer<typeof AccountsPartialUpdateParamsSchema> }): Promise<z.infer<typeof AccountsPartialUpdateResponseSchema>> => {
      try {
        const result = await accountsPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['accounts'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['accounts'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['accounts'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['accounts'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof AccountsPartialUpdateRequestSchema>, params: z.infer<typeof AccountsPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /accounts/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAccountsDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof AccountsDeleteResponseSchema>, variables: z.infer<typeof AccountsDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AccountsDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AccountsDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AccountsDeleteParamsSchema>): Promise<z.infer<typeof AccountsDeleteResponseSchema>> => {
      try {
        const result = await accountsDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['accounts'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['accounts'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['accounts'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['accounts'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AccountsDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /accounts/{id}/update-balance/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAccountsUpdateBalanceMutation(options?: {
  onSuccess?: (data: z.infer<typeof AccountsUpdateBalanceResponseSchema>, variables: { body: z.infer<typeof AccountsUpdateBalanceRequestSchema>, params: z.infer<typeof AccountsUpdateBalanceParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof AccountsUpdateBalanceRequestSchema>, params: z.infer<typeof AccountsUpdateBalanceParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof AccountsUpdateBalanceRequestSchema>, params: z.infer<typeof AccountsUpdateBalanceParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof AccountsUpdateBalanceRequestSchema>, params: z.infer<typeof AccountsUpdateBalanceParamsSchema> }): Promise<z.infer<typeof AccountsUpdateBalanceResponseSchema>> => {
      try {
        const result = await accountsUpdateBalance(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['accounts'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['accounts'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['accounts'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['accounts'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof AccountsUpdateBalanceRequestSchema>, params: z.infer<typeof AccountsUpdateBalanceParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /accounts/{id}/update_balance/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAccountsUpdateBalanceMutation(options?: {
  onSuccess?: (data: z.infer<typeof AccountsUpdateBalanceResponseSchema>, variables: { body: z.infer<typeof AccountsUpdateBalanceRequestSchema>, params: z.infer<typeof AccountsUpdateBalanceParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof AccountsUpdateBalanceRequestSchema>, params: z.infer<typeof AccountsUpdateBalanceParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof AccountsUpdateBalanceRequestSchema>, params: z.infer<typeof AccountsUpdateBalanceParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof AccountsUpdateBalanceRequestSchema>, params: z.infer<typeof AccountsUpdateBalanceParamsSchema> }): Promise<z.infer<typeof AccountsUpdateBalanceResponseSchema>> => {
      try {
        const result = await accountsUpdateBalance(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['accounts'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['accounts'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['accounts'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['accounts'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof AccountsUpdateBalanceRequestSchema>, params: z.infer<typeof AccountsUpdateBalanceParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}