'use server'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  CurrencyHistoryListParamsSchema,
  CurrencyHistoryListResponseSchema,
  CurrencyHistoryCreateRequestSchema,
  CurrencyHistoryCreateResponseSchema,
  CurrencyHistoryReadParamsSchema,
  CurrencyHistoryReadResponseSchema,
  CurrencyHistoryUpdateRequestSchema,
  CurrencyHistoryUpdateParamsSchema,
  CurrencyHistoryUpdateResponseSchema,
  CurrencyHistoryPartialUpdateRequestSchema,
  CurrencyHistoryPartialUpdateParamsSchema,
  CurrencyHistoryPartialUpdateResponseSchema,
  CurrencyHistoryDeleteParamsSchema,
  CurrencyHistoryDeleteResponseSchema
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
    .schema(CurrencyHistoryListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(CurrencyHistoryListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.currencyHistory.currencyHistoryList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: CurrencyHistoryListResponseSchema
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
 * @generated from POST /currency-history/
 * Features: Input validation, revalidation, error handling
 */
export const currencyHistoryCreate = actionClientWithMeta
  .metadata({
    name: "currency-history-create",
    requiresAuth: false
  })
  .schema(CurrencyHistoryCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(CurrencyHistoryCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.currencyHistory.currencyHistoryCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: CurrencyHistoryCreateResponseSchema
        }
      })
        // Handle streaming responses
        if (response.headers.get('content-type')?.includes('text/stream')) {
          // Process streaming response
          return response.data
        }
        // Handle potential redirects based on response
        if (response.status === 201 && response.headers.get('location')) {
          const location = response.headers.get('location')!
          redirect(location)
        }

      // Revalidate cache after successful mutation
      revalidateTag('currency-history')
      console.log('Revalidated tag: currency-history')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('currencyHistoryCreate', true, duration, {
        method: 'POST',
        path: '/currency-history/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('currencyHistoryCreate', false, duration, {
        method: 'POST',
        path: '/currency-history/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/currency-history/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

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
            validateResponse: false,
            responseSchema: CurrencyHistoryReadResponseSchema
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

/**
 * ViewSet for CurrencyHistory model.
 * @generated from PUT /currency-history/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const currencyHistoryUpdate = actionClientWithMeta
  .metadata({
    name: "currency-history-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: CurrencyHistoryUpdateRequestSchema,
        params: CurrencyHistoryUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: CurrencyHistoryUpdateRequestSchema,
        params: CurrencyHistoryUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.currencyHistory.currencyHistoryUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: CurrencyHistoryUpdateResponseSchema
        }
      })
        // Handle streaming responses
        if (response.headers.get('content-type')?.includes('text/stream')) {
          // Process streaming response
          return response.data
        }
        // Handle potential redirects based on response
        if (response.status === 201 && response.headers.get('location')) {
          const location = response.headers.get('location')!
          redirect(location)
        }

      // Revalidate cache after successful mutation
      revalidateTag('currency-history')
      console.log('Revalidated tag: currency-history')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('currencyHistoryUpdate', true, duration, {
        method: 'PUT',
        path: '/currency-history/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('currencyHistoryUpdate', false, duration, {
        method: 'PUT',
        path: '/currency-history/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/currency-history/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for CurrencyHistory model.
 * @generated from PATCH /currency-history/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const currencyHistoryPartialUpdate = actionClientWithMeta
  .metadata({
    name: "currency-history-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: CurrencyHistoryPartialUpdateRequestSchema,
        params: CurrencyHistoryPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: CurrencyHistoryPartialUpdateRequestSchema,
        params: CurrencyHistoryPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.currencyHistory.currencyHistoryPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: CurrencyHistoryPartialUpdateResponseSchema
        }
      })
        // Handle streaming responses
        if (response.headers.get('content-type')?.includes('text/stream')) {
          // Process streaming response
          return response.data
        }
        // Handle potential redirects based on response
        if (response.status === 201 && response.headers.get('location')) {
          const location = response.headers.get('location')!
          redirect(location)
        }

      // Revalidate cache after successful mutation
      revalidateTag('currency-history')
      console.log('Revalidated tag: currency-history')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('currencyHistoryPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/currency-history/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('currencyHistoryPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/currency-history/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/currency-history/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for CurrencyHistory model.
 * @generated from DELETE /currency-history/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const currencyHistoryDelete = actionClientWithMeta
  .metadata({
    name: "currency-history-delete",
    requiresAuth: false
  })
  .schema(CurrencyHistoryDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(CurrencyHistoryDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.currencyHistory.currencyHistoryDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: CurrencyHistoryDeleteResponseSchema
        }
      })
        // Handle streaming responses
        if (response.headers.get('content-type')?.includes('text/stream')) {
          // Process streaming response
          return response.data
        }
        // Handle potential redirects based on response
        if (response.status === 201 && response.headers.get('location')) {
          const location = response.headers.get('location')!
          redirect(location)
        }

      // Revalidate cache after successful mutation
      revalidateTag('currency-history')
      console.log('Revalidated tag: currency-history')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('currencyHistoryDelete', true, duration, {
        method: 'DELETE',
        path: '/currency-history/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('currencyHistoryDelete', false, duration, {
        method: 'DELETE',
        path: '/currency-history/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/currency-history/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })