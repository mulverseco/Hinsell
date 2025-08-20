'use client'
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { authSocialORead, authUsersList, authUsersMeRead, authUsersRead, authJwtCreateCreate, authJwtRefreshCreate, authJwtVerifyCreate, authSocialOCreate, authUsersCreate, authUsersActivation, authUsersMeUpdate, authUsersMePartialUpdate, authUsersMeDelete, authUsersResendActivation, authUsersResetUsername, authUsersResetUsernameConfirm, authUsersResetPassword, authUsersResetPasswordConfirm, authUsersSetUsername, authUsersSetPassword, authUsersUpdate, authUsersPartialUpdate, authUsersDelete } from '@/core/generated/actions/auth'
import {
  AuthSocialOReadResponseSchema,
  AuthSocialOReadParamsSchema,
  AuthUsersListResponseSchema,
  AuthUsersMeReadResponseSchema,
  AuthUsersReadResponseSchema,
  AuthUsersReadParamsSchema,
  AuthJwtCreateCreateResponseSchema,
  AuthJwtCreateCreateRequestSchema,
  AuthJwtRefreshCreateResponseSchema,
  AuthJwtRefreshCreateRequestSchema,
  AuthJwtVerifyCreateResponseSchema,
  AuthJwtVerifyCreateRequestSchema,
  AuthSocialOCreateResponseSchema,
  AuthSocialOCreateRequestSchema,
  AuthSocialOCreateParamsSchema,
  AuthUsersCreateResponseSchema,
  AuthUsersActivationResponseSchema,
  AuthUsersActivationRequestSchema,
  AuthUsersMeUpdateResponseSchema,
  AuthUsersMeUpdateRequestSchema,
  AuthUsersMePartialUpdateResponseSchema,
  AuthUsersMePartialUpdateRequestSchema,
  AuthUsersMeDeleteResponseSchema,
  AuthUsersResendActivationResponseSchema,
  AuthUsersResendActivationRequestSchema,
  AuthUsersResetUsernameResponseSchema,
  AuthUsersResetUsernameRequestSchema,
  AuthUsersResetUsernameConfirmResponseSchema,
  AuthUsersResetUsernameConfirmRequestSchema,
  AuthUsersResetPasswordResponseSchema,
  AuthUsersResetPasswordRequestSchema,
  AuthUsersResetPasswordConfirmResponseSchema,
  AuthUsersResetPasswordConfirmRequestSchema,
  AuthUsersSetUsernameResponseSchema,
  AuthUsersSetUsernameRequestSchema,
  AuthUsersSetPasswordResponseSchema,
  AuthUsersSetPasswordRequestSchema,
  AuthUsersUpdateResponseSchema,
  AuthUsersUpdateRequestSchema,
  AuthUsersUpdateParamsSchema,
  AuthUsersPartialUpdateResponseSchema,
  AuthUsersPartialUpdateRequestSchema,
  AuthUsersPartialUpdateParamsSchema,
  AuthUsersDeleteResponseSchema,
  AuthUsersDeleteParamsSchema
} from '@/core/generated/schemas'
import type { z } from 'zod'



// Error handling utility
function handleActionError(error: unknown): never {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  toast.error(message)
  throw new Error(message)
}

/**
 * Optimized query hook for GET /auth/social/o/{provider}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof AuthSocialOReadResponseSchema>
 */
export function useAuthSocialORead(provider: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof AuthSocialOReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['authSocialORead', provider],
    queryFn: async ({ signal }) => {
      try {
        const result = await authSocialORead({ params: { path: { provider } } })
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    staleTime: 180000,
    gcTime: 360000,
    enabled: !!provider && (options?.enabled ?? true),
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
 * Suspense version for /auth/social/o/{provider}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof AuthSocialOReadResponseSchema>
 */
export function useSuspenseAuthSocialORead(provider: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof AuthSocialOReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['authSocialORead', provider],
    queryFn: async () => {
      const result = await authSocialORead({ params: { path: { provider } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /auth/users/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof AuthUsersListResponseSchema>
 */
export function useAuthUsersList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof AuthUsersListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['authUsersList'],
    queryFn: async ({ signal }) => {
      try {
        const result = await authUsersList({})
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
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Suspense version for /auth/users/
 * @returns useSuspenseQuery result with data of type z.infer<typeof AuthUsersListResponseSchema>
 */
export function useSuspenseAuthUsersList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof AuthUsersListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['authUsersList'],
    queryFn: async () => {
      const result = await authUsersList({})
      return result
    },
    staleTime: 300000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /auth/users/me/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof AuthUsersMeReadResponseSchema>
 */
export function useAuthUsersMeRead(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof AuthUsersMeReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['authUsersMeRead'],
    queryFn: async ({ signal }) => {
      try {
        const result = await authUsersMeRead({})
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
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Suspense version for /auth/users/me/
 * @returns useSuspenseQuery result with data of type z.infer<typeof AuthUsersMeReadResponseSchema>
 */
export function useSuspenseAuthUsersMeRead(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof AuthUsersMeReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['authUsersMeRead'],
    queryFn: async () => {
      const result = await authUsersMeRead({})
      return result
    },
    staleTime: 300000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /auth/users/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof AuthUsersReadResponseSchema>
 */
export function useAuthUsersRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof AuthUsersReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['authUsersRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await authUsersRead({ params: { path: { id } } })
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
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Suspense version for /auth/users/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof AuthUsersReadResponseSchema>
 */
export function useSuspenseAuthUsersRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof AuthUsersReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['authUsersRead', id],
    queryFn: async () => {
      const result = await authUsersRead({ params: { path: { id } } })
      return result
    },
    staleTime: 300000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized mutation hook for POST /auth/jwt/create/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthJwtCreateCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthJwtCreateCreateResponseSchema>, variables: z.infer<typeof AuthJwtCreateCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AuthJwtCreateCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AuthJwtCreateCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AuthJwtCreateCreateRequestSchema>): Promise<z.infer<typeof AuthJwtCreateCreateResponseSchema>> => {
      try {
        const result = await authJwtCreateCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AuthJwtCreateCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /auth/jwt/refresh/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthJwtRefreshCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthJwtRefreshCreateResponseSchema>, variables: z.infer<typeof AuthJwtRefreshCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AuthJwtRefreshCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AuthJwtRefreshCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AuthJwtRefreshCreateRequestSchema>): Promise<z.infer<typeof AuthJwtRefreshCreateResponseSchema>> => {
      try {
        const result = await authJwtRefreshCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AuthJwtRefreshCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /auth/jwt/verify/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthJwtVerifyCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthJwtVerifyCreateResponseSchema>, variables: z.infer<typeof AuthJwtVerifyCreateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AuthJwtVerifyCreateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AuthJwtVerifyCreateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AuthJwtVerifyCreateRequestSchema>): Promise<z.infer<typeof AuthJwtVerifyCreateResponseSchema>> => {
      try {
        const result = await authJwtVerifyCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AuthJwtVerifyCreateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /auth/social/o/{provider}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthSocialOCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthSocialOCreateResponseSchema>, variables: { body: z.infer<typeof AuthSocialOCreateRequestSchema>, params: z.infer<typeof AuthSocialOCreateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof AuthSocialOCreateRequestSchema>, params: z.infer<typeof AuthSocialOCreateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof AuthSocialOCreateRequestSchema>, params: z.infer<typeof AuthSocialOCreateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof AuthSocialOCreateRequestSchema>, params: z.infer<typeof AuthSocialOCreateParamsSchema> }): Promise<z.infer<typeof AuthSocialOCreateResponseSchema>> => {
      try {
        const result = await authSocialOCreate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof AuthSocialOCreateRequestSchema>, params: z.infer<typeof AuthSocialOCreateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /auth/users/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthUsersCreateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthUsersCreateResponseSchema>, variables: void) => void
  onError?: (error: Error, variables: void) => void
  optimisticUpdate?: (variables: void) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: void): Promise<z.infer<typeof AuthUsersCreateResponseSchema>> => {
      try {
        const result = await authUsersCreate()
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: void) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /auth/users/activation/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthUsersActivationMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthUsersActivationResponseSchema>, variables: z.infer<typeof AuthUsersActivationRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AuthUsersActivationRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AuthUsersActivationRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AuthUsersActivationRequestSchema>): Promise<z.infer<typeof AuthUsersActivationResponseSchema>> => {
      try {
        const result = await authUsersActivation(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AuthUsersActivationRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /auth/users/me/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthUsersMeUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthUsersMeUpdateResponseSchema>, variables: z.infer<typeof AuthUsersMeUpdateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AuthUsersMeUpdateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AuthUsersMeUpdateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AuthUsersMeUpdateRequestSchema>): Promise<z.infer<typeof AuthUsersMeUpdateResponseSchema>> => {
      try {
        const result = await authUsersMeUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AuthUsersMeUpdateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /auth/users/me/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthUsersMePartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthUsersMePartialUpdateResponseSchema>, variables: z.infer<typeof AuthUsersMePartialUpdateRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AuthUsersMePartialUpdateRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AuthUsersMePartialUpdateRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AuthUsersMePartialUpdateRequestSchema>): Promise<z.infer<typeof AuthUsersMePartialUpdateResponseSchema>> => {
      try {
        const result = await authUsersMePartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AuthUsersMePartialUpdateRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /auth/users/me/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthUsersMeDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthUsersMeDeleteResponseSchema>, variables: void) => void
  onError?: (error: Error, variables: void) => void
  optimisticUpdate?: (variables: void) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: void): Promise<z.infer<typeof AuthUsersMeDeleteResponseSchema>> => {
      try {
        const result = await authUsersMeDelete()
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: void) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /auth/users/resend_activation/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthUsersResendActivationMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthUsersResendActivationResponseSchema>, variables: z.infer<typeof AuthUsersResendActivationRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AuthUsersResendActivationRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AuthUsersResendActivationRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AuthUsersResendActivationRequestSchema>): Promise<z.infer<typeof AuthUsersResendActivationResponseSchema>> => {
      try {
        const result = await authUsersResendActivation(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AuthUsersResendActivationRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /auth/users/reset_email/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthUsersResetUsernameMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthUsersResetUsernameResponseSchema>, variables: z.infer<typeof AuthUsersResetUsernameRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AuthUsersResetUsernameRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AuthUsersResetUsernameRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AuthUsersResetUsernameRequestSchema>): Promise<z.infer<typeof AuthUsersResetUsernameResponseSchema>> => {
      try {
        const result = await authUsersResetUsername(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AuthUsersResetUsernameRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /auth/users/reset_email_confirm/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthUsersResetUsernameConfirmMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthUsersResetUsernameConfirmResponseSchema>, variables: z.infer<typeof AuthUsersResetUsernameConfirmRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AuthUsersResetUsernameConfirmRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AuthUsersResetUsernameConfirmRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AuthUsersResetUsernameConfirmRequestSchema>): Promise<z.infer<typeof AuthUsersResetUsernameConfirmResponseSchema>> => {
      try {
        const result = await authUsersResetUsernameConfirm(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AuthUsersResetUsernameConfirmRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /auth/users/reset_password/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthUsersResetPasswordMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthUsersResetPasswordResponseSchema>, variables: z.infer<typeof AuthUsersResetPasswordRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AuthUsersResetPasswordRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AuthUsersResetPasswordRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AuthUsersResetPasswordRequestSchema>): Promise<z.infer<typeof AuthUsersResetPasswordResponseSchema>> => {
      try {
        const result = await authUsersResetPassword(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AuthUsersResetPasswordRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /auth/users/reset_password_confirm/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthUsersResetPasswordConfirmMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthUsersResetPasswordConfirmResponseSchema>, variables: z.infer<typeof AuthUsersResetPasswordConfirmRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AuthUsersResetPasswordConfirmRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AuthUsersResetPasswordConfirmRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AuthUsersResetPasswordConfirmRequestSchema>): Promise<z.infer<typeof AuthUsersResetPasswordConfirmResponseSchema>> => {
      try {
        const result = await authUsersResetPasswordConfirm(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AuthUsersResetPasswordConfirmRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /auth/users/set_email/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthUsersSetUsernameMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthUsersSetUsernameResponseSchema>, variables: z.infer<typeof AuthUsersSetUsernameRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AuthUsersSetUsernameRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AuthUsersSetUsernameRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AuthUsersSetUsernameRequestSchema>): Promise<z.infer<typeof AuthUsersSetUsernameResponseSchema>> => {
      try {
        const result = await authUsersSetUsername(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AuthUsersSetUsernameRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for POST /auth/users/set_password/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthUsersSetPasswordMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthUsersSetPasswordResponseSchema>, variables: z.infer<typeof AuthUsersSetPasswordRequestSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AuthUsersSetPasswordRequestSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AuthUsersSetPasswordRequestSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AuthUsersSetPasswordRequestSchema>): Promise<z.infer<typeof AuthUsersSetPasswordResponseSchema>> => {
      try {
        const result = await authUsersSetPassword(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AuthUsersSetPasswordRequestSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PUT /auth/users/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthUsersUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthUsersUpdateResponseSchema>, variables: { body: z.infer<typeof AuthUsersUpdateRequestSchema>, params: z.infer<typeof AuthUsersUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof AuthUsersUpdateRequestSchema>, params: z.infer<typeof AuthUsersUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof AuthUsersUpdateRequestSchema>, params: z.infer<typeof AuthUsersUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof AuthUsersUpdateRequestSchema>, params: z.infer<typeof AuthUsersUpdateParamsSchema> }): Promise<z.infer<typeof AuthUsersUpdateResponseSchema>> => {
      try {
        const result = await authUsersUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof AuthUsersUpdateRequestSchema>, params: z.infer<typeof AuthUsersUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for PATCH /auth/users/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthUsersPartialUpdateMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthUsersPartialUpdateResponseSchema>, variables: { body: z.infer<typeof AuthUsersPartialUpdateRequestSchema>, params: z.infer<typeof AuthUsersPartialUpdateParamsSchema> }) => void
  onError?: (error: Error, variables: { body: z.infer<typeof AuthUsersPartialUpdateRequestSchema>, params: z.infer<typeof AuthUsersPartialUpdateParamsSchema> }) => void
  optimisticUpdate?: (variables: { body: z.infer<typeof AuthUsersPartialUpdateRequestSchema>, params: z.infer<typeof AuthUsersPartialUpdateParamsSchema> }) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: { body: z.infer<typeof AuthUsersPartialUpdateRequestSchema>, params: z.infer<typeof AuthUsersPartialUpdateParamsSchema> }): Promise<z.infer<typeof AuthUsersPartialUpdateResponseSchema>> => {
      try {
        const result = await authUsersPartialUpdate(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: { body: z.infer<typeof AuthUsersPartialUpdateRequestSchema>, params: z.infer<typeof AuthUsersPartialUpdateParamsSchema> }) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}

/**
 * Optimized mutation hook for DELETE /auth/users/{id}/
 * Features: Optimistic updates, smart invalidation, error handling
 * @param options - Mutation options
 * @returns Mutation result with enhanced features
 */
export function useAuthUsersDeleteMutation(options?: {
  onSuccess?: (data: z.infer<typeof AuthUsersDeleteResponseSchema>, variables: z.infer<typeof AuthUsersDeleteParamsSchema>) => void
  onError?: (error: Error, variables: z.infer<typeof AuthUsersDeleteParamsSchema>) => void
  optimisticUpdate?: (variables: z.infer<typeof AuthUsersDeleteParamsSchema>) => any
  showToast?: boolean
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useOptimistic(null)

  const mutation = useMutation({
    mutationFn: async (variables: z.infer<typeof AuthUsersDeleteParamsSchema>): Promise<z.infer<typeof AuthUsersDeleteResponseSchema>> => {
      try {
        const result = await authUsersDelete(variables)
        return result
      } catch (error) {
        handleActionError(error)
      }
    },
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['auth'])
      
      // Optimistic update
      if (options?.optimisticUpdate) {
        const optimisticValue = options.optimisticUpdate(variables)
        setOptimisticData(optimisticValue)
        queryClient.setQueryData(['auth'], optimisticValue)
      }
      
      return { previousData }
    },
    
    onSuccess: (data, variables) => {
      // Show success toast
      if (options?.showToast !== false) {
        toast.success('Operation completed successfully')
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['auth'], context.previousData)
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
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  return {
    ...mutation,
    mutateWithTransition: (variables: z.infer<typeof AuthUsersDeleteParamsSchema>) => {
      startTransition(() => {
        mutation.mutate(variables)
      })
    },
    isPending: isPending || mutation.isPending,
    optimisticData
  }
}