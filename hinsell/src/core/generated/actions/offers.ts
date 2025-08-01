import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  OffersListParamsSchema,
  OffersListResponseSchema,
  OffersCreateRequestSchema,
  OffersCreateResponseSchema,
  OffersReadParamsSchema,
  OffersReadResponseSchema,
  OffersUpdateRequestSchema,
  OffersUpdateParamsSchema,
  OffersUpdateResponseSchema,
  OffersPartialUpdateRequestSchema,
  OffersPartialUpdateParamsSchema,
  OffersPartialUpdateResponseSchema,
  OffersDeleteParamsSchema,
  OffersDeleteResponseSchema,
  OffersApplyRequestSchema,
  OffersApplyParamsSchema,
  OffersApplyResponseSchema
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
 * GET /offers/
 * @generated from GET /offers/
 * Features: React cache, input validation, error handling
 */
export const offersList = cache(
  actionClientWithMeta
    .metadata({
      name: "offers-list",
      requiresAuth: false
    })
    .schema(OffersListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(OffersListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.offers.offersList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('offersList', true, duration, {
          method: 'GET',
          path: '/offers/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('offersList', false, duration, {
          method: 'GET',
          path: '/offers/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/offers/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * POST /offers/
 * @generated from POST /offers/
 * Features: Input validation, revalidation, error handling
 */
export const offersCreate = actionClientWithMeta
  .metadata({
    name: "offers-create",
    requiresAuth: false
  })
  .schema(OffersCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(OffersCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.offers.offersCreate({        body: validatedBody,
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
      revalidateTag('offers')
      console.log('Revalidated tag: offers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('offersCreate', true, duration, {
        method: 'POST',
        path: '/offers/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('offersCreate', false, duration, {
        method: 'POST',
        path: '/offers/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/offers/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /offers/{id}/
 * @generated from GET /offers/{id}/
 * Features: React cache, input validation, error handling
 */
export const offersRead = cache(
  actionClientWithMeta
    .metadata({
      name: "offers-read",
      requiresAuth: false
    })
    .schema(OffersReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(OffersReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.offers.offersRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('offersRead', true, duration, {
          method: 'GET',
          path: '/offers/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('offersRead', false, duration, {
          method: 'GET',
          path: '/offers/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/offers/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * PUT /offers/{id}/
 * @generated from PUT /offers/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const offersUpdate = actionClientWithMeta
  .metadata({
    name: "offers-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: OffersUpdateRequestSchema,
        params: OffersUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: OffersUpdateRequestSchema,
        params: OffersUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.offers.offersUpdate({params: validatedParams,
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
      revalidateTag('offers')
      console.log('Revalidated tag: offers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('offersUpdate', true, duration, {
        method: 'PUT',
        path: '/offers/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('offersUpdate', false, duration, {
        method: 'PUT',
        path: '/offers/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/offers/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * PATCH /offers/{id}/
 * @generated from PATCH /offers/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const offersPartialUpdate = actionClientWithMeta
  .metadata({
    name: "offers-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: OffersPartialUpdateRequestSchema,
        params: OffersPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: OffersPartialUpdateRequestSchema,
        params: OffersPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.offers.offersPartialUpdate({params: validatedParams,
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
      revalidateTag('offers')
      console.log('Revalidated tag: offers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('offersPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/offers/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('offersPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/offers/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/offers/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * DELETE /offers/{id}/
 * @generated from DELETE /offers/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const offersDelete = actionClientWithMeta
  .metadata({
    name: "offers-delete",
    requiresAuth: false
  })
  .schema(OffersDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(OffersDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.offers.offersDelete({params: validatedParams,
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
      revalidateTag('offers')
      console.log('Revalidated tag: offers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('offersDelete', true, duration, {
        method: 'DELETE',
        path: '/offers/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('offersDelete', false, duration, {
        method: 'DELETE',
        path: '/offers/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/offers/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Apply an offer to a given price and quantity.
 * @generated from POST /offers/{id}/apply/
 * Features: Input validation, revalidation, error handling
 */
export const offersApply = actionClientWithMeta
  .metadata({
    name: "offers-apply",
    requiresAuth: false
  })
  .schema(z.object({
        body: OffersApplyRequestSchema,
        params: OffersApplyParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: OffersApplyRequestSchema,
        params: OffersApplyParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.offers.offersApply({params: validatedParams,
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
      revalidateTag('offers')
      console.log('Revalidated tag: offers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('offersApply', true, duration, {
        method: 'POST',
        path: '/offers/{id}/apply/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('offersApply', false, duration, {
        method: 'POST',
        path: '/offers/{id}/apply/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/offers/{id}/apply/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })