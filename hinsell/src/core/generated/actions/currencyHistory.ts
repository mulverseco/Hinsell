import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  CurrencyHistoryListResponseSchema,
  CurrencyHistoryReadParamsSchema,
  CurrencyHistoryReadResponseSchema
} from '@/core/generated/schemas'


// Utility functions for enhanced server actions
async function getClientInfo() {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || 'unknown'
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  
  return { userAgent, ip }
}

async function validateAndSanitizeInput<T>(schema: z.ZodSchema<T>, input: unknown): Promise<T> {
  try {
    return await schema.parseAsync(input)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ActionError('Input validation failed: ' + error.errors.map(e => e.message).join(', '), 'VALIDATION_ERROR')
    }
    throw new ActionError('Invalid input format', 'VALIDATION_ERROR')
  }
}

// Enhanced error handling with context
class ActionExecutionError extends ActionError {
  constructor(
    message: string,
    public readonly context: {
      endpoint: string
      method: string
      timestamp: number
    },
    public readonly originalError?: unknown
  ) {
    super(message, 'EXECUTION_ERROR')
  }
}

// Logging utility for server actions
async function logActionExecution(
  action: string,
  success: boolean,
  duration: number,
  context?: Record<string, any>
) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[ACTION] ${action} - ${success ? 'SUCCESS' : 'FAILED'} (${duration}ms)`, context)
  }
  
  // In production, send to your logging service
  // await analytics.track('server_action_executed', { action, success, duration, ...context })
}

/**
 * ViewSet for CurrencyHistory model.
 * @generated from GET /currency-history/
 * Features: React cache, input validation, error handling
 */
export const currencyHistoryList = cache(
  actionClientWithMeta
    .metadata({
      name: "currency-history-list",
      requiresAuth: false
    })
    .schema(z.void())
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {

        // Execute API call with enhanced error handling
        const response = await apiClient.currencyHistory.currencyHistoryList({
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('currencyHistoryList', true, duration, {
          method: 'GET',
          path: '/currency-history/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('currencyHistoryList', false, duration, {
          method: 'GET',
          path: '/currency-history/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/currency-history/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for CurrencyHistory model.
 * @generated from GET /currency-history/{id}/
 * Features: React cache, input validation, error handling
 */
export const currencyHistoryRead = cache(
  actionClientWithMeta
    .metadata({
      name: "currency-history-read",
      requiresAuth: false
    })
    .schema(CurrencyHistoryReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(CurrencyHistoryReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.currencyHistory.currencyHistoryRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('currencyHistoryRead', true, duration, {
          method: 'GET',
          path: '/currency-history/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('currencyHistoryRead', false, duration, {
          method: 'GET',
          path: '/currency-history/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/currency-history/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)