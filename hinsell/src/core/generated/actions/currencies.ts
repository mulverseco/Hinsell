import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  CurrenciesListResponseSchema,
  CurrenciesCreateRequestSchema,
  CurrenciesCreateResponseSchema,
  CurrenciesReadParamsSchema,
  CurrenciesReadResponseSchema,
  CurrenciesUpdateRequestSchema,
  CurrenciesUpdateParamsSchema,
  CurrenciesUpdateResponseSchema,
  CurrenciesPartialUpdateRequestSchema,
  CurrenciesPartialUpdateParamsSchema,
  CurrenciesPartialUpdateResponseSchema,
  CurrenciesDeleteParamsSchema,
  CurrenciesDeleteResponseSchema
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
 * ViewSet for Currency model.
 * @generated from GET /currencies/
 * Features: React cache, input validation, error handling
 */
export const currenciesList = cache(
  actionClientWithMeta
    .metadata({
      name: "currencies-list",
      requiresAuth: false
    })
    .schema(z.void())
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {

        // Execute API call with enhanced error handling
        const response = await apiClient.currencies.currenciesList({
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('currenciesList', true, duration, {
          method: 'GET',
          path: '/currencies/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('currenciesList', false, duration, {
          method: 'GET',
          path: '/currencies/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/currencies/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for Currency model.
 * @generated from POST /currencies/
 * Features: Input validation, revalidation, error handling
 */
export const currenciesCreate = actionClientWithMeta
  .metadata({
    name: "currencies-create",
    requiresAuth: false
  })
  .schema(CurrenciesCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(CurrenciesCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.currencies.currenciesCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: true
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
      revalidateTag('currencies')
      console.log('Revalidated tag: currencies')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('currenciesCreate', true, duration, {
        method: 'POST',
        path: '/currencies/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('currenciesCreate', false, duration, {
        method: 'POST',
        path: '/currencies/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/currencies/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for Currency model.
 * @generated from GET /currencies/{id}/
 * Features: React cache, input validation, error handling
 */
export const currenciesRead = cache(
  actionClientWithMeta
    .metadata({
      name: "currencies-read",
      requiresAuth: false
    })
    .schema(CurrenciesReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(CurrenciesReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.currencies.currenciesRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('currenciesRead', true, duration, {
          method: 'GET',
          path: '/currencies/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('currenciesRead', false, duration, {
          method: 'GET',
          path: '/currencies/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/currencies/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for Currency model.
 * @generated from PUT /currencies/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const currenciesUpdate = actionClientWithMeta
  .metadata({
    name: "currencies-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: CurrenciesUpdateRequestSchema,
        params: CurrenciesUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: CurrenciesUpdateRequestSchema,
        params: CurrenciesUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.currencies.currenciesUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: true
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
      revalidateTag('currencies')
      console.log('Revalidated tag: currencies')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('currenciesUpdate', true, duration, {
        method: 'PUT',
        path: '/currencies/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('currenciesUpdate', false, duration, {
        method: 'PUT',
        path: '/currencies/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/currencies/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for Currency model.
 * @generated from PATCH /currencies/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const currenciesPartialUpdate = actionClientWithMeta
  .metadata({
    name: "currencies-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: CurrenciesPartialUpdateRequestSchema,
        params: CurrenciesPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: CurrenciesPartialUpdateRequestSchema,
        params: CurrenciesPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.currencies.currenciesPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: true
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
      revalidateTag('currencies')
      console.log('Revalidated tag: currencies')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('currenciesPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/currencies/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('currenciesPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/currencies/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/currencies/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for Currency model.
 * @generated from DELETE /currencies/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const currenciesDelete = actionClientWithMeta
  .metadata({
    name: "currencies-delete",
    requiresAuth: false
  })
  .schema(CurrenciesDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(CurrenciesDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.currencies.currenciesDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: true
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
      revalidateTag('currencies')
      console.log('Revalidated tag: currencies')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('currenciesDelete', true, duration, {
        method: 'DELETE',
        path: '/currencies/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('currenciesDelete', false, duration, {
        method: 'DELETE',
        path: '/currencies/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/currencies/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })