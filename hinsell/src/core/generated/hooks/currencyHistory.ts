'use client'
import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { currencyHistoryList, currencyHistoryRead } from '@/core/generated/actions/currencyHistory'
import {
  CurrencyHistoryListResponseSchema,
  CurrencyHistoryReadResponseSchema,
  CurrencyHistoryReadParamsSchema
} from '@/core/generated/schemas'
import type { z } from 'zod'





/**
 * Optimized query hook for GET /currency-history/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof CurrencyHistoryListResponseSchema>
 */
export function useCurrencyHistoryList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof CurrencyHistoryListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['currencyHistoryList'],
    queryFn: async ({ signal }) => {
      try {
        const result = await currencyHistoryList({})
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
 * Suspense version for /currency-history/
 * @returns useSuspenseQuery result with data of type z.infer<typeof CurrencyHistoryListResponseSchema>
 */
export function useSuspenseCurrencyHistoryList(options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof CurrencyHistoryListResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['currencyHistoryList'],
    queryFn: async () => {
      const result = await currencyHistoryList({})
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

/**
 * Optimized query hook for GET /currency-history/{id}/
 * Features: Smart caching, error handling, type safety
 * @returns useQuery result with data of type z.infer<typeof CurrencyHistoryReadResponseSchema>
 */
export function useCurrencyHistoryRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof CurrencyHistoryReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useQuery({
    queryKey: ['currencyHistoryRead', id],
    queryFn: async ({ signal }) => {
      try {
        const result = await currencyHistoryRead({ params: { path: { id } } })
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
 * Suspense version for /currency-history/{id}/
 * @returns useSuspenseQuery result with data of type z.infer<typeof CurrencyHistoryReadResponseSchema>
 */
export function useSuspenseCurrencyHistoryRead(id: string, options?: { enabled?: boolean; suspense?: boolean; refetchInterval?: number; initialData?: z.infer<typeof CurrencyHistoryReadResponseSchema> }) {
  const { initialData, ...restOptions } = options ?? {}

  return useSuspenseQuery({
    queryKey: ['currencyHistoryRead', id],
    queryFn: async () => {
      const result = await currencyHistoryRead({ params: { path: { id } } })
      return result
    },
    staleTime: 180000,
    initialData: initialData as any,
    ...restOptions
  })
}

