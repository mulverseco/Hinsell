'use server'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  CouponsListParamsSchema,
  CouponsListResponseSchema,
  CouponsCreateRequestSchema,
  CouponsCreateResponseSchema,
  CouponsReadParamsSchema,
  CouponsReadResponseSchema,
  CouponsUpdateRequestSchema,
  CouponsUpdateParamsSchema,
  CouponsUpdateResponseSchema,
  CouponsPartialUpdateRequestSchema,
  CouponsPartialUpdateParamsSchema,
  CouponsPartialUpdateResponseSchema,
  CouponsDeleteParamsSchema,
  CouponsDeleteResponseSchema,
  CouponsApplyRequestSchema,
  CouponsApplyParamsSchema,
  CouponsApplyResponseSchema
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
 * GET /coupons/
 * @generated from GET /coupons/
 * Features: React cache, input validation, error handling
 */
export const couponsList = cache(
  actionClientWithMeta
    .metadata({
      name: "coupons-list",
      requiresAuth: false
    })
    .schema(CouponsListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(CouponsListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.coupons.couponsList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: CouponsListResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('couponsList', true, duration, {
          method: 'GET',
          path: '/coupons/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('couponsList', false, duration, {
          method: 'GET',
          path: '/coupons/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/coupons/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * POST /coupons/
 * @generated from POST /coupons/
 * Features: Input validation, revalidation, error handling
 */
export const couponsCreate = actionClientWithMeta
  .metadata({
    name: "coupons-create",
    requiresAuth: false
  })
  .schema(CouponsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(CouponsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.coupons.couponsCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: CouponsCreateResponseSchema
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
      revalidateTag('coupons')
      console.log('Revalidated tag: coupons')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('couponsCreate', true, duration, {
        method: 'POST',
        path: '/coupons/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('couponsCreate', false, duration, {
        method: 'POST',
        path: '/coupons/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/coupons/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /coupons/{id}/
 * @generated from GET /coupons/{id}/
 * Features: React cache, input validation, error handling
 */
export const couponsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "coupons-read",
      requiresAuth: false
    })
    .schema(CouponsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(CouponsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.coupons.couponsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: CouponsReadResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('couponsRead', true, duration, {
          method: 'GET',
          path: '/coupons/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('couponsRead', false, duration, {
          method: 'GET',
          path: '/coupons/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/coupons/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * PUT /coupons/{id}/
 * @generated from PUT /coupons/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const couponsUpdate = actionClientWithMeta
  .metadata({
    name: "coupons-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: CouponsUpdateRequestSchema,
        params: CouponsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: CouponsUpdateRequestSchema,
        params: CouponsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.coupons.couponsUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: CouponsUpdateResponseSchema
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
      revalidateTag('coupons')
      console.log('Revalidated tag: coupons')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('couponsUpdate', true, duration, {
        method: 'PUT',
        path: '/coupons/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('couponsUpdate', false, duration, {
        method: 'PUT',
        path: '/coupons/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/coupons/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * PATCH /coupons/{id}/
 * @generated from PATCH /coupons/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const couponsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "coupons-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: CouponsPartialUpdateRequestSchema,
        params: CouponsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: CouponsPartialUpdateRequestSchema,
        params: CouponsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.coupons.couponsPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: CouponsPartialUpdateResponseSchema
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
      revalidateTag('coupons')
      console.log('Revalidated tag: coupons')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('couponsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/coupons/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('couponsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/coupons/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/coupons/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * DELETE /coupons/{id}/
 * @generated from DELETE /coupons/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const couponsDelete = actionClientWithMeta
  .metadata({
    name: "coupons-delete",
    requiresAuth: false
  })
  .schema(CouponsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(CouponsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.coupons.couponsDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: CouponsDeleteResponseSchema
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
      revalidateTag('coupons')
      console.log('Revalidated tag: coupons')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('couponsDelete', true, duration, {
        method: 'DELETE',
        path: '/coupons/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('couponsDelete', false, duration, {
        method: 'DELETE',
        path: '/coupons/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/coupons/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Apply a coupon to a given price.
 * @generated from POST /coupons/{id}/apply/
 * Features: Input validation, revalidation, error handling
 */
export const couponsApply = actionClientWithMeta
  .metadata({
    name: "coupons-apply",
    requiresAuth: false
  })
  .schema(z.object({
        body: CouponsApplyRequestSchema,
        params: CouponsApplyParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: CouponsApplyRequestSchema,
        params: CouponsApplyParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.coupons.couponsApply({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: CouponsApplyResponseSchema
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
      revalidateTag('coupons')
      console.log('Revalidated tag: coupons')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('couponsApply', true, duration, {
        method: 'POST',
        path: '/coupons/{id}/apply/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('couponsApply', false, duration, {
        method: 'POST',
        path: '/coupons/{id}/apply/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/coupons/{id}/apply/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })