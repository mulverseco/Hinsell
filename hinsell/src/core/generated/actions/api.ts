import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  ApiWebhooksDeliveriesListParamsSchema,
  ApiWebhooksDeliveriesListResponseSchema,
  ApiWebhooksDeliveriesCreateRequestSchema,
  ApiWebhooksDeliveriesCreateResponseSchema,
  ApiWebhooksDeliveriesReadParamsSchema,
  ApiWebhooksDeliveriesReadResponseSchema,
  ApiWebhooksDeliveriesUpdateRequestSchema,
  ApiWebhooksDeliveriesUpdateParamsSchema,
  ApiWebhooksDeliveriesUpdateResponseSchema,
  ApiWebhooksDeliveriesPartialUpdateRequestSchema,
  ApiWebhooksDeliveriesPartialUpdateParamsSchema,
  ApiWebhooksDeliveriesPartialUpdateResponseSchema,
  ApiWebhooksDeliveriesDeleteParamsSchema,
  ApiWebhooksDeliveriesDeleteResponseSchema,
  ApiWebhooksDeliveriesRetryRequestSchema,
  ApiWebhooksDeliveriesRetryParamsSchema,
  ApiWebhooksDeliveriesRetryResponseSchema,
  ApiWebhooksEndpointsListParamsSchema,
  ApiWebhooksEndpointsListResponseSchema,
  ApiWebhooksEndpointsCreateRequestSchema,
  ApiWebhooksEndpointsCreateResponseSchema,
  ApiWebhooksEndpointsReadParamsSchema,
  ApiWebhooksEndpointsReadResponseSchema,
  ApiWebhooksEndpointsUpdateRequestSchema,
  ApiWebhooksEndpointsUpdateParamsSchema,
  ApiWebhooksEndpointsUpdateResponseSchema,
  ApiWebhooksEndpointsPartialUpdateRequestSchema,
  ApiWebhooksEndpointsPartialUpdateParamsSchema,
  ApiWebhooksEndpointsPartialUpdateResponseSchema,
  ApiWebhooksEndpointsDeleteParamsSchema,
  ApiWebhooksEndpointsDeleteResponseSchema,
  ApiWebhooksEndpointsReactivateRequestSchema,
  ApiWebhooksEndpointsReactivateParamsSchema,
  ApiWebhooksEndpointsReactivateResponseSchema,
  ApiWebhooksEndpointsStatisticsParamsSchema,
  ApiWebhooksEndpointsStatisticsResponseSchema,
  ApiWebhooksEndpointsSuspendRequestSchema,
  ApiWebhooksEndpointsSuspendParamsSchema,
  ApiWebhooksEndpointsSuspendResponseSchema,
  ApiWebhooksEndpointsTestRequestSchema,
  ApiWebhooksEndpointsTestParamsSchema,
  ApiWebhooksEndpointsTestResponseSchema,
  ApiWebhooksEventsListParamsSchema,
  ApiWebhooksEventsListResponseSchema,
  ApiWebhooksEventsCreateRequestSchema,
  ApiWebhooksEventsCreateResponseSchema,
  ApiWebhooksEventsReadParamsSchema,
  ApiWebhooksEventsReadResponseSchema,
  ApiWebhooksEventsUpdateRequestSchema,
  ApiWebhooksEventsUpdateParamsSchema,
  ApiWebhooksEventsUpdateResponseSchema,
  ApiWebhooksEventsPartialUpdateRequestSchema,
  ApiWebhooksEventsPartialUpdateParamsSchema,
  ApiWebhooksEventsPartialUpdateResponseSchema,
  ApiWebhooksEventsDeleteParamsSchema,
  ApiWebhooksEventsDeleteResponseSchema,
  ApiWebhooksLogsListParamsSchema,
  ApiWebhooksLogsListResponseSchema,
  ApiWebhooksLogsCreateRequestSchema,
  ApiWebhooksLogsCreateResponseSchema,
  ApiWebhooksLogsReadParamsSchema,
  ApiWebhooksLogsReadResponseSchema,
  ApiWebhooksLogsUpdateRequestSchema,
  ApiWebhooksLogsUpdateParamsSchema,
  ApiWebhooksLogsUpdateResponseSchema,
  ApiWebhooksLogsPartialUpdateRequestSchema,
  ApiWebhooksLogsPartialUpdateParamsSchema,
  ApiWebhooksLogsPartialUpdateResponseSchema,
  ApiWebhooksLogsDeleteParamsSchema,
  ApiWebhooksLogsDeleteResponseSchema
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
 * ViewSet for webhook deliveries.
 * @generated from GET /api/webhooks/deliveries/
 * Features: React cache, input validation, error handling
 */
export const apiWebhooksDeliveriesList = cache(
  actionClientWithMeta
    .metadata({
      name: "api-webhooks-deliveries-list",
      requiresAuth: false
    })
    .schema(ApiWebhooksDeliveriesListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ApiWebhooksDeliveriesListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.api.apiWebhooksDeliveriesList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('apiWebhooksDeliveriesList', true, duration, {
          method: 'GET',
          path: '/api/webhooks/deliveries/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('apiWebhooksDeliveriesList', false, duration, {
          method: 'GET',
          path: '/api/webhooks/deliveries/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/api/webhooks/deliveries/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for webhook deliveries.
 * @generated from POST /api/webhooks/deliveries/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksDeliveriesCreate = actionClientWithMeta
  .metadata({
    name: "api-webhooks-deliveries-create",
    requiresAuth: false
  })
  .schema(ApiWebhooksDeliveriesCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(ApiWebhooksDeliveriesCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksDeliveriesCreate({        body: validatedBody,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksDeliveriesCreate', true, duration, {
        method: 'POST',
        path: '/api/webhooks/deliveries/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksDeliveriesCreate', false, duration, {
        method: 'POST',
        path: '/api/webhooks/deliveries/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/deliveries/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for webhook deliveries.
 * @generated from GET /api/webhooks/deliveries/{id}/
 * Features: React cache, input validation, error handling
 */
export const apiWebhooksDeliveriesRead = cache(
  actionClientWithMeta
    .metadata({
      name: "api-webhooks-deliveries-read",
      requiresAuth: false
    })
    .schema(ApiWebhooksDeliveriesReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ApiWebhooksDeliveriesReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.api.apiWebhooksDeliveriesRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('apiWebhooksDeliveriesRead', true, duration, {
          method: 'GET',
          path: '/api/webhooks/deliveries/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('apiWebhooksDeliveriesRead', false, duration, {
          method: 'GET',
          path: '/api/webhooks/deliveries/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/api/webhooks/deliveries/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for webhook deliveries.
 * @generated from PUT /api/webhooks/deliveries/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksDeliveriesUpdate = actionClientWithMeta
  .metadata({
    name: "api-webhooks-deliveries-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ApiWebhooksDeliveriesUpdateRequestSchema,
        params: ApiWebhooksDeliveriesUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ApiWebhooksDeliveriesUpdateRequestSchema,
        params: ApiWebhooksDeliveriesUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksDeliveriesUpdate({params: validatedParams,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksDeliveriesUpdate', true, duration, {
        method: 'PUT',
        path: '/api/webhooks/deliveries/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksDeliveriesUpdate', false, duration, {
        method: 'PUT',
        path: '/api/webhooks/deliveries/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/deliveries/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for webhook deliveries.
 * @generated from PATCH /api/webhooks/deliveries/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksDeliveriesPartialUpdate = actionClientWithMeta
  .metadata({
    name: "api-webhooks-deliveries-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ApiWebhooksDeliveriesPartialUpdateRequestSchema,
        params: ApiWebhooksDeliveriesPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ApiWebhooksDeliveriesPartialUpdateRequestSchema,
        params: ApiWebhooksDeliveriesPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksDeliveriesPartialUpdate({params: validatedParams,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksDeliveriesPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/api/webhooks/deliveries/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksDeliveriesPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/api/webhooks/deliveries/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/deliveries/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for webhook deliveries.
 * @generated from DELETE /api/webhooks/deliveries/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksDeliveriesDelete = actionClientWithMeta
  .metadata({
    name: "api-webhooks-deliveries-delete",
    requiresAuth: false
  })
  .schema(ApiWebhooksDeliveriesDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ApiWebhooksDeliveriesDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksDeliveriesDelete({params: validatedParams,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksDeliveriesDelete', true, duration, {
        method: 'DELETE',
        path: '/api/webhooks/deliveries/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksDeliveriesDelete', false, duration, {
        method: 'DELETE',
        path: '/api/webhooks/deliveries/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/deliveries/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Retry failed delivery.
 * @generated from POST /api/webhooks/deliveries/{id}/retry/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksDeliveriesRetry = actionClientWithMeta
  .metadata({
    name: "api-webhooks-deliveries-retry",
    requiresAuth: false
  })
  .schema(z.object({
        body: ApiWebhooksDeliveriesRetryRequestSchema,
        params: ApiWebhooksDeliveriesRetryParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ApiWebhooksDeliveriesRetryRequestSchema,
        params: ApiWebhooksDeliveriesRetryParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksDeliveriesRetry({params: validatedParams,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksDeliveriesRetry', true, duration, {
        method: 'POST',
        path: '/api/webhooks/deliveries/{id}/retry/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksDeliveriesRetry', false, duration, {
        method: 'POST',
        path: '/api/webhooks/deliveries/{id}/retry/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/deliveries/{id}/retry/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for webhook endpoints.
 * @generated from GET /api/webhooks/endpoints/
 * Features: React cache, input validation, error handling
 */
export const apiWebhooksEndpointsList = cache(
  actionClientWithMeta
    .metadata({
      name: "api-webhooks-endpoints-list",
      requiresAuth: false
    })
    .schema(ApiWebhooksEndpointsListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ApiWebhooksEndpointsListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.api.apiWebhooksEndpointsList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('apiWebhooksEndpointsList', true, duration, {
          method: 'GET',
          path: '/api/webhooks/endpoints/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('apiWebhooksEndpointsList', false, duration, {
          method: 'GET',
          path: '/api/webhooks/endpoints/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/api/webhooks/endpoints/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for webhook endpoints.
 * @generated from POST /api/webhooks/endpoints/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksEndpointsCreate = actionClientWithMeta
  .metadata({
    name: "api-webhooks-endpoints-create",
    requiresAuth: false
  })
  .schema(ApiWebhooksEndpointsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(ApiWebhooksEndpointsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksEndpointsCreate({        body: validatedBody,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksEndpointsCreate', true, duration, {
        method: 'POST',
        path: '/api/webhooks/endpoints/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksEndpointsCreate', false, duration, {
        method: 'POST',
        path: '/api/webhooks/endpoints/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/endpoints/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for webhook endpoints.
 * @generated from GET /api/webhooks/endpoints/{id}/
 * Features: React cache, input validation, error handling
 */
export const apiWebhooksEndpointsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "api-webhooks-endpoints-read",
      requiresAuth: false
    })
    .schema(ApiWebhooksEndpointsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ApiWebhooksEndpointsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.api.apiWebhooksEndpointsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('apiWebhooksEndpointsRead', true, duration, {
          method: 'GET',
          path: '/api/webhooks/endpoints/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('apiWebhooksEndpointsRead', false, duration, {
          method: 'GET',
          path: '/api/webhooks/endpoints/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/api/webhooks/endpoints/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for webhook endpoints.
 * @generated from PUT /api/webhooks/endpoints/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksEndpointsUpdate = actionClientWithMeta
  .metadata({
    name: "api-webhooks-endpoints-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ApiWebhooksEndpointsUpdateRequestSchema,
        params: ApiWebhooksEndpointsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ApiWebhooksEndpointsUpdateRequestSchema,
        params: ApiWebhooksEndpointsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksEndpointsUpdate({params: validatedParams,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksEndpointsUpdate', true, duration, {
        method: 'PUT',
        path: '/api/webhooks/endpoints/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksEndpointsUpdate', false, duration, {
        method: 'PUT',
        path: '/api/webhooks/endpoints/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/endpoints/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for webhook endpoints.
 * @generated from PATCH /api/webhooks/endpoints/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksEndpointsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "api-webhooks-endpoints-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ApiWebhooksEndpointsPartialUpdateRequestSchema,
        params: ApiWebhooksEndpointsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ApiWebhooksEndpointsPartialUpdateRequestSchema,
        params: ApiWebhooksEndpointsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksEndpointsPartialUpdate({params: validatedParams,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksEndpointsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/api/webhooks/endpoints/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksEndpointsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/api/webhooks/endpoints/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/endpoints/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for webhook endpoints.
 * @generated from DELETE /api/webhooks/endpoints/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksEndpointsDelete = actionClientWithMeta
  .metadata({
    name: "api-webhooks-endpoints-delete",
    requiresAuth: false
  })
  .schema(ApiWebhooksEndpointsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ApiWebhooksEndpointsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksEndpointsDelete({params: validatedParams,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksEndpointsDelete', true, duration, {
        method: 'DELETE',
        path: '/api/webhooks/endpoints/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksEndpointsDelete', false, duration, {
        method: 'DELETE',
        path: '/api/webhooks/endpoints/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/endpoints/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Reactivate suspended endpoint.
 * @generated from POST /api/webhooks/endpoints/{id}/reactivate/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksEndpointsReactivate = actionClientWithMeta
  .metadata({
    name: "api-webhooks-endpoints-reactivate",
    requiresAuth: false
  })
  .schema(z.object({
        body: ApiWebhooksEndpointsReactivateRequestSchema,
        params: ApiWebhooksEndpointsReactivateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ApiWebhooksEndpointsReactivateRequestSchema,
        params: ApiWebhooksEndpointsReactivateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksEndpointsReactivate({params: validatedParams,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksEndpointsReactivate', true, duration, {
        method: 'POST',
        path: '/api/webhooks/endpoints/{id}/reactivate/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksEndpointsReactivate', false, duration, {
        method: 'POST',
        path: '/api/webhooks/endpoints/{id}/reactivate/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/endpoints/{id}/reactivate/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Get endpoint statistics.
 * @generated from GET /api/webhooks/endpoints/{id}/statistics/
 * Features: React cache, input validation, error handling
 */
export const apiWebhooksEndpointsStatistics = cache(
  actionClientWithMeta
    .metadata({
      name: "api-webhooks-endpoints-statistics",
      requiresAuth: false
    })
    .schema(ApiWebhooksEndpointsStatisticsParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ApiWebhooksEndpointsStatisticsParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.api.apiWebhooksEndpointsStatistics({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('apiWebhooksEndpointsStatistics', true, duration, {
          method: 'GET',
          path: '/api/webhooks/endpoints/{id}/statistics/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('apiWebhooksEndpointsStatistics', false, duration, {
          method: 'GET',
          path: '/api/webhooks/endpoints/{id}/statistics/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/api/webhooks/endpoints/{id}/statistics/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * Suspend endpoint.
 * @generated from POST /api/webhooks/endpoints/{id}/suspend/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksEndpointsSuspend = actionClientWithMeta
  .metadata({
    name: "api-webhooks-endpoints-suspend",
    requiresAuth: false
  })
  .schema(z.object({
        body: ApiWebhooksEndpointsSuspendRequestSchema,
        params: ApiWebhooksEndpointsSuspendParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ApiWebhooksEndpointsSuspendRequestSchema,
        params: ApiWebhooksEndpointsSuspendParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksEndpointsSuspend({params: validatedParams,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksEndpointsSuspend', true, duration, {
        method: 'POST',
        path: '/api/webhooks/endpoints/{id}/suspend/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksEndpointsSuspend', false, duration, {
        method: 'POST',
        path: '/api/webhooks/endpoints/{id}/suspend/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/endpoints/{id}/suspend/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Test webhook endpoint with sample payload.
 * @generated from POST /api/webhooks/endpoints/{id}/test/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksEndpointsTest = actionClientWithMeta
  .metadata({
    name: "api-webhooks-endpoints-test",
    requiresAuth: false
  })
  .schema(z.object({
        body: ApiWebhooksEndpointsTestRequestSchema,
        params: ApiWebhooksEndpointsTestParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ApiWebhooksEndpointsTestRequestSchema,
        params: ApiWebhooksEndpointsTestParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksEndpointsTest({params: validatedParams,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksEndpointsTest', true, duration, {
        method: 'POST',
        path: '/api/webhooks/endpoints/{id}/test/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksEndpointsTest', false, duration, {
        method: 'POST',
        path: '/api/webhooks/endpoints/{id}/test/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/endpoints/{id}/test/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for webhook events.
 * @generated from GET /api/webhooks/events/
 * Features: React cache, input validation, error handling
 */
export const apiWebhooksEventsList = cache(
  actionClientWithMeta
    .metadata({
      name: "api-webhooks-events-list",
      requiresAuth: false
    })
    .schema(ApiWebhooksEventsListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ApiWebhooksEventsListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.api.apiWebhooksEventsList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('apiWebhooksEventsList', true, duration, {
          method: 'GET',
          path: '/api/webhooks/events/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('apiWebhooksEventsList', false, duration, {
          method: 'GET',
          path: '/api/webhooks/events/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/api/webhooks/events/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for webhook events.
 * @generated from POST /api/webhooks/events/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksEventsCreate = actionClientWithMeta
  .metadata({
    name: "api-webhooks-events-create",
    requiresAuth: false
  })
  .schema(ApiWebhooksEventsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(ApiWebhooksEventsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksEventsCreate({        body: validatedBody,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksEventsCreate', true, duration, {
        method: 'POST',
        path: '/api/webhooks/events/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksEventsCreate', false, duration, {
        method: 'POST',
        path: '/api/webhooks/events/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/events/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for webhook events.
 * @generated from GET /api/webhooks/events/{id}/
 * Features: React cache, input validation, error handling
 */
export const apiWebhooksEventsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "api-webhooks-events-read",
      requiresAuth: false
    })
    .schema(ApiWebhooksEventsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ApiWebhooksEventsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.api.apiWebhooksEventsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('apiWebhooksEventsRead', true, duration, {
          method: 'GET',
          path: '/api/webhooks/events/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('apiWebhooksEventsRead', false, duration, {
          method: 'GET',
          path: '/api/webhooks/events/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/api/webhooks/events/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for webhook events.
 * @generated from PUT /api/webhooks/events/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksEventsUpdate = actionClientWithMeta
  .metadata({
    name: "api-webhooks-events-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ApiWebhooksEventsUpdateRequestSchema,
        params: ApiWebhooksEventsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ApiWebhooksEventsUpdateRequestSchema,
        params: ApiWebhooksEventsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksEventsUpdate({params: validatedParams,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksEventsUpdate', true, duration, {
        method: 'PUT',
        path: '/api/webhooks/events/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksEventsUpdate', false, duration, {
        method: 'PUT',
        path: '/api/webhooks/events/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/events/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for webhook events.
 * @generated from PATCH /api/webhooks/events/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksEventsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "api-webhooks-events-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ApiWebhooksEventsPartialUpdateRequestSchema,
        params: ApiWebhooksEventsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ApiWebhooksEventsPartialUpdateRequestSchema,
        params: ApiWebhooksEventsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksEventsPartialUpdate({params: validatedParams,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksEventsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/api/webhooks/events/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksEventsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/api/webhooks/events/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/events/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for webhook events.
 * @generated from DELETE /api/webhooks/events/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksEventsDelete = actionClientWithMeta
  .metadata({
    name: "api-webhooks-events-delete",
    requiresAuth: false
  })
  .schema(ApiWebhooksEventsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ApiWebhooksEventsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksEventsDelete({params: validatedParams,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksEventsDelete', true, duration, {
        method: 'DELETE',
        path: '/api/webhooks/events/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksEventsDelete', false, duration, {
        method: 'DELETE',
        path: '/api/webhooks/events/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/events/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for webhook event logs.
 * @generated from GET /api/webhooks/logs/
 * Features: React cache, input validation, error handling
 */
export const apiWebhooksLogsList = cache(
  actionClientWithMeta
    .metadata({
      name: "api-webhooks-logs-list",
      requiresAuth: false
    })
    .schema(ApiWebhooksLogsListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ApiWebhooksLogsListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.api.apiWebhooksLogsList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('apiWebhooksLogsList', true, duration, {
          method: 'GET',
          path: '/api/webhooks/logs/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('apiWebhooksLogsList', false, duration, {
          method: 'GET',
          path: '/api/webhooks/logs/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/api/webhooks/logs/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for webhook event logs.
 * @generated from POST /api/webhooks/logs/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksLogsCreate = actionClientWithMeta
  .metadata({
    name: "api-webhooks-logs-create",
    requiresAuth: false
  })
  .schema(ApiWebhooksLogsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(ApiWebhooksLogsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksLogsCreate({        body: validatedBody,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksLogsCreate', true, duration, {
        method: 'POST',
        path: '/api/webhooks/logs/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksLogsCreate', false, duration, {
        method: 'POST',
        path: '/api/webhooks/logs/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/logs/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for webhook event logs.
 * @generated from GET /api/webhooks/logs/{id}/
 * Features: React cache, input validation, error handling
 */
export const apiWebhooksLogsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "api-webhooks-logs-read",
      requiresAuth: false
    })
    .schema(ApiWebhooksLogsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ApiWebhooksLogsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.api.apiWebhooksLogsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('apiWebhooksLogsRead', true, duration, {
          method: 'GET',
          path: '/api/webhooks/logs/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('apiWebhooksLogsRead', false, duration, {
          method: 'GET',
          path: '/api/webhooks/logs/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/api/webhooks/logs/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for webhook event logs.
 * @generated from PUT /api/webhooks/logs/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksLogsUpdate = actionClientWithMeta
  .metadata({
    name: "api-webhooks-logs-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ApiWebhooksLogsUpdateRequestSchema,
        params: ApiWebhooksLogsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ApiWebhooksLogsUpdateRequestSchema,
        params: ApiWebhooksLogsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksLogsUpdate({params: validatedParams,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksLogsUpdate', true, duration, {
        method: 'PUT',
        path: '/api/webhooks/logs/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksLogsUpdate', false, duration, {
        method: 'PUT',
        path: '/api/webhooks/logs/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/logs/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for webhook event logs.
 * @generated from PATCH /api/webhooks/logs/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksLogsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "api-webhooks-logs-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ApiWebhooksLogsPartialUpdateRequestSchema,
        params: ApiWebhooksLogsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ApiWebhooksLogsPartialUpdateRequestSchema,
        params: ApiWebhooksLogsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksLogsPartialUpdate({params: validatedParams,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksLogsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/api/webhooks/logs/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksLogsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/api/webhooks/logs/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/logs/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for webhook event logs.
 * @generated from DELETE /api/webhooks/logs/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const apiWebhooksLogsDelete = actionClientWithMeta
  .metadata({
    name: "api-webhooks-logs-delete",
    requiresAuth: false
  })
  .schema(ApiWebhooksLogsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ApiWebhooksLogsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.api.apiWebhooksLogsDelete({params: validatedParams,
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
      revalidateTag('api')
      console.log('Revalidated tag: api')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('apiWebhooksLogsDelete', true, duration, {
        method: 'DELETE',
        path: '/api/webhooks/logs/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('apiWebhooksLogsDelete', false, duration, {
        method: 'DELETE',
        path: '/api/webhooks/logs/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/api/webhooks/logs/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })