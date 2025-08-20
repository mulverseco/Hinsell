'use server'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  OpeningBalancesListResponseSchema,
  OpeningBalancesCreateRequestSchema,
  OpeningBalancesCreateResponseSchema,
  OpeningBalancesReadParamsSchema,
  OpeningBalancesReadResponseSchema,
  OpeningBalancesUpdateRequestSchema,
  OpeningBalancesUpdateParamsSchema,
  OpeningBalancesUpdateResponseSchema,
  OpeningBalancesPartialUpdateRequestSchema,
  OpeningBalancesPartialUpdateParamsSchema,
  OpeningBalancesPartialUpdateResponseSchema,
  OpeningBalancesDeleteParamsSchema,
  OpeningBalancesDeleteResponseSchema
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
 * ViewSet for OpeningBalance model.
 * @generated from GET /opening-balances/
 * Features: React cache, input validation, error handling
 */
export const openingBalancesList = cache(
  actionClientWithMeta
    .metadata({
      name: "opening-balances-list",
      requiresAuth: false
    })
    .schema(z.void())
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {

        // Execute API call with enhanced error handling
        const response = await apiClient.openingBalances.openingBalancesList({
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: OpeningBalancesListResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('openingBalancesList', true, duration, {
          method: 'GET',
          path: '/opening-balances/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('openingBalancesList', false, duration, {
          method: 'GET',
          path: '/opening-balances/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/opening-balances/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for OpeningBalance model.
 * @generated from POST /opening-balances/
 * Features: Input validation, revalidation, error handling
 */
export const openingBalancesCreate = actionClientWithMeta
  .metadata({
    name: "opening-balances-create",
    requiresAuth: false
  })
  .schema(OpeningBalancesCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(OpeningBalancesCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.openingBalances.openingBalancesCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: OpeningBalancesCreateResponseSchema
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
      revalidateTag('opening-balances')
      console.log('Revalidated tag: opening-balances')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('openingBalancesCreate', true, duration, {
        method: 'POST',
        path: '/opening-balances/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('openingBalancesCreate', false, duration, {
        method: 'POST',
        path: '/opening-balances/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/opening-balances/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for OpeningBalance model.
 * @generated from GET /opening-balances/{id}/
 * Features: React cache, input validation, error handling
 */
export const openingBalancesRead = cache(
  actionClientWithMeta
    .metadata({
      name: "opening-balances-read",
      requiresAuth: false
    })
    .schema(OpeningBalancesReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(OpeningBalancesReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.openingBalances.openingBalancesRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: OpeningBalancesReadResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('openingBalancesRead', true, duration, {
          method: 'GET',
          path: '/opening-balances/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('openingBalancesRead', false, duration, {
          method: 'GET',
          path: '/opening-balances/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/opening-balances/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for OpeningBalance model.
 * @generated from PUT /opening-balances/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const openingBalancesUpdate = actionClientWithMeta
  .metadata({
    name: "opening-balances-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: OpeningBalancesUpdateRequestSchema,
        params: OpeningBalancesUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: OpeningBalancesUpdateRequestSchema,
        params: OpeningBalancesUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.openingBalances.openingBalancesUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: OpeningBalancesUpdateResponseSchema
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
      revalidateTag('opening-balances')
      console.log('Revalidated tag: opening-balances')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('openingBalancesUpdate', true, duration, {
        method: 'PUT',
        path: '/opening-balances/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('openingBalancesUpdate', false, duration, {
        method: 'PUT',
        path: '/opening-balances/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/opening-balances/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for OpeningBalance model.
 * @generated from PATCH /opening-balances/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const openingBalancesPartialUpdate = actionClientWithMeta
  .metadata({
    name: "opening-balances-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: OpeningBalancesPartialUpdateRequestSchema,
        params: OpeningBalancesPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: OpeningBalancesPartialUpdateRequestSchema,
        params: OpeningBalancesPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.openingBalances.openingBalancesPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: OpeningBalancesPartialUpdateResponseSchema
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
      revalidateTag('opening-balances')
      console.log('Revalidated tag: opening-balances')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('openingBalancesPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/opening-balances/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('openingBalancesPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/opening-balances/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/opening-balances/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for OpeningBalance model.
 * @generated from DELETE /opening-balances/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const openingBalancesDelete = actionClientWithMeta
  .metadata({
    name: "opening-balances-delete",
    requiresAuth: false
  })
  .schema(OpeningBalancesDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(OpeningBalancesDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.openingBalances.openingBalancesDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: OpeningBalancesDeleteResponseSchema
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
      revalidateTag('opening-balances')
      console.log('Revalidated tag: opening-balances')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('openingBalancesDelete', true, duration, {
        method: 'DELETE',
        path: '/opening-balances/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('openingBalancesDelete', false, duration, {
        method: 'DELETE',
        path: '/opening-balances/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/opening-balances/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })