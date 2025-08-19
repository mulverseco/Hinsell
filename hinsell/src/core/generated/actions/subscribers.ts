'use server'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  SubscribersListParamsSchema,
  SubscribersListResponseSchema,
  SubscribersCreateRequestSchema,
  SubscribersCreateResponseSchema,
  SubscribersReadParamsSchema,
  SubscribersReadResponseSchema,
  SubscribersUpdateRequestSchema,
  SubscribersUpdateParamsSchema,
  SubscribersUpdateResponseSchema,
  SubscribersPartialUpdateRequestSchema,
  SubscribersPartialUpdateParamsSchema,
  SubscribersPartialUpdateResponseSchema,
  SubscribersDeleteParamsSchema,
  SubscribersDeleteResponseSchema
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
 * ViewSet for InsuranceSubscriber model.
 * @generated from GET /subscribers/
 * Features: React cache, input validation, error handling
 */
export const subscribersList = cache(
  actionClientWithMeta
    .metadata({
      name: "subscribers-list",
      requiresAuth: false
    })
    .schema(SubscribersListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(SubscribersListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.subscribers.subscribersList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: SubscribersListResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('subscribersList', true, duration, {
          method: 'GET',
          path: '/subscribers/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('subscribersList', false, duration, {
          method: 'GET',
          path: '/subscribers/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/subscribers/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for InsuranceSubscriber model.
 * @generated from POST /subscribers/
 * Features: Input validation, revalidation, error handling
 */
export const subscribersCreate = actionClientWithMeta
  .metadata({
    name: "subscribers-create",
    requiresAuth: false
  })
  .schema(SubscribersCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(SubscribersCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.subscribers.subscribersCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: SubscribersCreateResponseSchema
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
      revalidateTag('subscribers')
      console.log('Revalidated tag: subscribers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('subscribersCreate', true, duration, {
        method: 'POST',
        path: '/subscribers/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('subscribersCreate', false, duration, {
        method: 'POST',
        path: '/subscribers/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/subscribers/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for InsuranceSubscriber model.
 * @generated from GET /subscribers/{id}/
 * Features: React cache, input validation, error handling
 */
export const subscribersRead = cache(
  actionClientWithMeta
    .metadata({
      name: "subscribers-read",
      requiresAuth: false
    })
    .schema(SubscribersReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(SubscribersReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.subscribers.subscribersRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: SubscribersReadResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('subscribersRead', true, duration, {
          method: 'GET',
          path: '/subscribers/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('subscribersRead', false, duration, {
          method: 'GET',
          path: '/subscribers/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/subscribers/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for InsuranceSubscriber model.
 * @generated from PUT /subscribers/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const subscribersUpdate = actionClientWithMeta
  .metadata({
    name: "subscribers-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: SubscribersUpdateRequestSchema,
        params: SubscribersUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: SubscribersUpdateRequestSchema,
        params: SubscribersUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.subscribers.subscribersUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: SubscribersUpdateResponseSchema
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
      revalidateTag('subscribers')
      console.log('Revalidated tag: subscribers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('subscribersUpdate', true, duration, {
        method: 'PUT',
        path: '/subscribers/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('subscribersUpdate', false, duration, {
        method: 'PUT',
        path: '/subscribers/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/subscribers/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for InsuranceSubscriber model.
 * @generated from PATCH /subscribers/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const subscribersPartialUpdate = actionClientWithMeta
  .metadata({
    name: "subscribers-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: SubscribersPartialUpdateRequestSchema,
        params: SubscribersPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: SubscribersPartialUpdateRequestSchema,
        params: SubscribersPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.subscribers.subscribersPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: SubscribersPartialUpdateResponseSchema
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
      revalidateTag('subscribers')
      console.log('Revalidated tag: subscribers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('subscribersPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/subscribers/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('subscribersPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/subscribers/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/subscribers/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for InsuranceSubscriber model.
 * @generated from DELETE /subscribers/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const subscribersDelete = actionClientWithMeta
  .metadata({
    name: "subscribers-delete",
    requiresAuth: false
  })
  .schema(SubscribersDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(SubscribersDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.subscribers.subscribersDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: SubscribersDeleteResponseSchema
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
      revalidateTag('subscribers')
      console.log('Revalidated tag: subscribers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('subscribersDelete', true, duration, {
        method: 'DELETE',
        path: '/subscribers/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('subscribersDelete', false, duration, {
        method: 'DELETE',
        path: '/subscribers/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/subscribers/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })