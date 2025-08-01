import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  UserCouponsListParamsSchema,
  UserCouponsListResponseSchema,
  UserCouponsCreateRequestSchema,
  UserCouponsCreateResponseSchema,
  UserCouponsReadParamsSchema,
  UserCouponsReadResponseSchema,
  UserCouponsUpdateRequestSchema,
  UserCouponsUpdateParamsSchema,
  UserCouponsUpdateResponseSchema,
  UserCouponsPartialUpdateRequestSchema,
  UserCouponsPartialUpdateParamsSchema,
  UserCouponsPartialUpdateResponseSchema,
  UserCouponsDeleteParamsSchema,
  UserCouponsDeleteResponseSchema
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
 * GET /user-coupons/
 * @generated from GET /user-coupons/
 * Features: React cache, input validation, error handling
 */
export const userCouponsList = cache(
  actionClientWithMeta
    .metadata({
      name: "user-coupons-list",
      requiresAuth: false
    })
    .schema(UserCouponsListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(UserCouponsListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.userCoupons.userCouponsList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('userCouponsList', true, duration, {
          method: 'GET',
          path: '/user-coupons/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('userCouponsList', false, duration, {
          method: 'GET',
          path: '/user-coupons/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/user-coupons/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * POST /user-coupons/
 * @generated from POST /user-coupons/
 * Features: Input validation, revalidation, error handling
 */
export const userCouponsCreate = actionClientWithMeta
  .metadata({
    name: "user-coupons-create",
    requiresAuth: false
  })
  .schema(UserCouponsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(UserCouponsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.userCoupons.userCouponsCreate({        body: validatedBody,
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
      revalidateTag('user-coupons')
      console.log('Revalidated tag: user-coupons')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('userCouponsCreate', true, duration, {
        method: 'POST',
        path: '/user-coupons/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('userCouponsCreate', false, duration, {
        method: 'POST',
        path: '/user-coupons/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/user-coupons/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /user-coupons/{id}/
 * @generated from GET /user-coupons/{id}/
 * Features: React cache, input validation, error handling
 */
export const userCouponsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "user-coupons-read",
      requiresAuth: false
    })
    .schema(UserCouponsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(UserCouponsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.userCoupons.userCouponsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('userCouponsRead', true, duration, {
          method: 'GET',
          path: '/user-coupons/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('userCouponsRead', false, duration, {
          method: 'GET',
          path: '/user-coupons/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/user-coupons/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * PUT /user-coupons/{id}/
 * @generated from PUT /user-coupons/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const userCouponsUpdate = actionClientWithMeta
  .metadata({
    name: "user-coupons-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: UserCouponsUpdateRequestSchema,
        params: UserCouponsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: UserCouponsUpdateRequestSchema,
        params: UserCouponsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.userCoupons.userCouponsUpdate({params: validatedParams,
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
      revalidateTag('user-coupons')
      console.log('Revalidated tag: user-coupons')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('userCouponsUpdate', true, duration, {
        method: 'PUT',
        path: '/user-coupons/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('userCouponsUpdate', false, duration, {
        method: 'PUT',
        path: '/user-coupons/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/user-coupons/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * PATCH /user-coupons/{id}/
 * @generated from PATCH /user-coupons/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const userCouponsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "user-coupons-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: UserCouponsPartialUpdateRequestSchema,
        params: UserCouponsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: UserCouponsPartialUpdateRequestSchema,
        params: UserCouponsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.userCoupons.userCouponsPartialUpdate({params: validatedParams,
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
      revalidateTag('user-coupons')
      console.log('Revalidated tag: user-coupons')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('userCouponsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/user-coupons/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('userCouponsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/user-coupons/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/user-coupons/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * DELETE /user-coupons/{id}/
 * @generated from DELETE /user-coupons/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const userCouponsDelete = actionClientWithMeta
  .metadata({
    name: "user-coupons-delete",
    requiresAuth: false
  })
  .schema(UserCouponsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(UserCouponsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.userCoupons.userCouponsDelete({params: validatedParams,
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
      revalidateTag('user-coupons')
      console.log('Revalidated tag: user-coupons')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('userCouponsDelete', true, duration, {
        method: 'DELETE',
        path: '/user-coupons/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('userCouponsDelete', false, duration, {
        method: 'DELETE',
        path: '/user-coupons/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/user-coupons/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })