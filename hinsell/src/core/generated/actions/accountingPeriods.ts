'use server'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  AccountingPeriodsListResponseSchema,
  AccountingPeriodsCreateRequestSchema,
  AccountingPeriodsCreateResponseSchema,
  AccountingPeriodsReadParamsSchema,
  AccountingPeriodsReadResponseSchema,
  AccountingPeriodsUpdateRequestSchema,
  AccountingPeriodsUpdateParamsSchema,
  AccountingPeriodsUpdateResponseSchema,
  AccountingPeriodsPartialUpdateRequestSchema,
  AccountingPeriodsPartialUpdateParamsSchema,
  AccountingPeriodsPartialUpdateResponseSchema,
  AccountingPeriodsDeleteParamsSchema,
  AccountingPeriodsDeleteResponseSchema
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
 * ViewSet for AccountingPeriod model.
 * @generated from GET /accounting-periods/
 * Features: React cache, input validation, error handling
 */
export const accountingPeriodsList = cache(
  actionClientWithMeta
    .metadata({
      name: "accounting-periods-list",
      requiresAuth: false
    })
    .schema(z.void())
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {

        // Execute API call with enhanced error handling
        const response = await apiClient.accountingPeriods.accountingPeriodsList({
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: AccountingPeriodsListResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('accountingPeriodsList', true, duration, {
          method: 'GET',
          path: '/accounting-periods/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('accountingPeriodsList', false, duration, {
          method: 'GET',
          path: '/accounting-periods/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/accounting-periods/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for AccountingPeriod model.
 * @generated from POST /accounting-periods/
 * Features: Input validation, revalidation, error handling
 */
export const accountingPeriodsCreate = actionClientWithMeta
  .metadata({
    name: "accounting-periods-create",
    requiresAuth: false
  })
  .schema(AccountingPeriodsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(AccountingPeriodsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.accountingPeriods.accountingPeriodsCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: AccountingPeriodsCreateResponseSchema
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
      revalidateTag('accounting-periods')
      console.log('Revalidated tag: accounting-periods')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('accountingPeriodsCreate', true, duration, {
        method: 'POST',
        path: '/accounting-periods/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('accountingPeriodsCreate', false, duration, {
        method: 'POST',
        path: '/accounting-periods/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/accounting-periods/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for AccountingPeriod model.
 * @generated from GET /accounting-periods/{id}/
 * Features: React cache, input validation, error handling
 */
export const accountingPeriodsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "accounting-periods-read",
      requiresAuth: false
    })
    .schema(AccountingPeriodsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(AccountingPeriodsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.accountingPeriods.accountingPeriodsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: AccountingPeriodsReadResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('accountingPeriodsRead', true, duration, {
          method: 'GET',
          path: '/accounting-periods/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('accountingPeriodsRead', false, duration, {
          method: 'GET',
          path: '/accounting-periods/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/accounting-periods/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for AccountingPeriod model.
 * @generated from PUT /accounting-periods/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const accountingPeriodsUpdate = actionClientWithMeta
  .metadata({
    name: "accounting-periods-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: AccountingPeriodsUpdateRequestSchema,
        params: AccountingPeriodsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: AccountingPeriodsUpdateRequestSchema,
        params: AccountingPeriodsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.accountingPeriods.accountingPeriodsUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: AccountingPeriodsUpdateResponseSchema
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
      revalidateTag('accounting-periods')
      console.log('Revalidated tag: accounting-periods')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('accountingPeriodsUpdate', true, duration, {
        method: 'PUT',
        path: '/accounting-periods/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('accountingPeriodsUpdate', false, duration, {
        method: 'PUT',
        path: '/accounting-periods/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/accounting-periods/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for AccountingPeriod model.
 * @generated from PATCH /accounting-periods/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const accountingPeriodsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "accounting-periods-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: AccountingPeriodsPartialUpdateRequestSchema,
        params: AccountingPeriodsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: AccountingPeriodsPartialUpdateRequestSchema,
        params: AccountingPeriodsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.accountingPeriods.accountingPeriodsPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: AccountingPeriodsPartialUpdateResponseSchema
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
      revalidateTag('accounting-periods')
      console.log('Revalidated tag: accounting-periods')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('accountingPeriodsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/accounting-periods/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('accountingPeriodsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/accounting-periods/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/accounting-periods/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for AccountingPeriod model.
 * @generated from DELETE /accounting-periods/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const accountingPeriodsDelete = actionClientWithMeta
  .metadata({
    name: "accounting-periods-delete",
    requiresAuth: false
  })
  .schema(AccountingPeriodsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(AccountingPeriodsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.accountingPeriods.accountingPeriodsDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: AccountingPeriodsDeleteResponseSchema
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
      revalidateTag('accounting-periods')
      console.log('Revalidated tag: accounting-periods')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('accountingPeriodsDelete', true, duration, {
        method: 'DELETE',
        path: '/accounting-periods/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('accountingPeriodsDelete', false, duration, {
        method: 'DELETE',
        path: '/accounting-periods/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/accounting-periods/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })