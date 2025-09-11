'use server'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  TransactionHeadersListParamsSchema,
  TransactionHeadersListResponseSchema,
  TransactionHeadersCreateRequestSchema,
  TransactionHeadersCreateResponseSchema,
  TransactionHeadersReadParamsSchema,
  TransactionHeadersReadResponseSchema,
  TransactionHeadersUpdateRequestSchema,
  TransactionHeadersUpdateParamsSchema,
  TransactionHeadersUpdateResponseSchema,
  TransactionHeadersPartialUpdateRequestSchema,
  TransactionHeadersPartialUpdateParamsSchema,
  TransactionHeadersPartialUpdateResponseSchema,
  TransactionHeadersDeleteParamsSchema,
  TransactionHeadersDeleteResponseSchema,
  TransactionHeadersApproveRequestSchema,
  TransactionHeadersApproveParamsSchema,
  TransactionHeadersApproveResponseSchema,
  TransactionHeadersPostRequestSchema,
  TransactionHeadersPostParamsSchema,
  TransactionHeadersPostResponseSchema,
  TransactionHeadersReverseRequestSchema,
  TransactionHeadersReverseParamsSchema,
  TransactionHeadersReverseResponseSchema
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
 * GET /transaction-headers/
 * @generated from GET /transaction-headers/
 * Features: React cache, input validation, error handling
 */
export const transactionHeadersList = cache(
  actionClientWithMeta
    .metadata({
      name: "transaction-headers-list",
      requiresAuth: false
    })
    .schema(TransactionHeadersListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(TransactionHeadersListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.transactionHeaders.transactionHeadersList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: TransactionHeadersListResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('transactionHeadersList', true, duration, {
          method: 'GET',
          path: '/transaction-headers/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('transactionHeadersList', false, duration, {
          method: 'GET',
          path: '/transaction-headers/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/transaction-headers/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * POST /transaction-headers/
 * @generated from POST /transaction-headers/
 * Features: Input validation, revalidation, error handling
 */
export const transactionHeadersCreate = actionClientWithMeta
  .metadata({
    name: "transaction-headers-create",
    requiresAuth: false
  })
  .schema(TransactionHeadersCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(TransactionHeadersCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.transactionHeaders.transactionHeadersCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TransactionHeadersCreateResponseSchema
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
      revalidateTag('transaction-headers')
      console.log('Revalidated tag: transaction-headers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('transactionHeadersCreate', true, duration, {
        method: 'POST',
        path: '/transaction-headers/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('transactionHeadersCreate', false, duration, {
        method: 'POST',
        path: '/transaction-headers/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/transaction-headers/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /transaction-headers/{id}/
 * @generated from GET /transaction-headers/{id}/
 * Features: React cache, input validation, error handling
 */
export const transactionHeadersRead = cache(
  actionClientWithMeta
    .metadata({
      name: "transaction-headers-read",
      requiresAuth: false
    })
    .schema(TransactionHeadersReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(TransactionHeadersReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.transactionHeaders.transactionHeadersRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: TransactionHeadersReadResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('transactionHeadersRead', true, duration, {
          method: 'GET',
          path: '/transaction-headers/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('transactionHeadersRead', false, duration, {
          method: 'GET',
          path: '/transaction-headers/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/transaction-headers/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * PUT /transaction-headers/{id}/
 * @generated from PUT /transaction-headers/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const transactionHeadersUpdate = actionClientWithMeta
  .metadata({
    name: "transaction-headers-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: TransactionHeadersUpdateRequestSchema,
        params: TransactionHeadersUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: TransactionHeadersUpdateRequestSchema,
        params: TransactionHeadersUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.transactionHeaders.transactionHeadersUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TransactionHeadersUpdateResponseSchema
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
      revalidateTag('transaction-headers')
      console.log('Revalidated tag: transaction-headers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('transactionHeadersUpdate', true, duration, {
        method: 'PUT',
        path: '/transaction-headers/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('transactionHeadersUpdate', false, duration, {
        method: 'PUT',
        path: '/transaction-headers/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/transaction-headers/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * PATCH /transaction-headers/{id}/
 * @generated from PATCH /transaction-headers/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const transactionHeadersPartialUpdate = actionClientWithMeta
  .metadata({
    name: "transaction-headers-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: TransactionHeadersPartialUpdateRequestSchema,
        params: TransactionHeadersPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: TransactionHeadersPartialUpdateRequestSchema,
        params: TransactionHeadersPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.transactionHeaders.transactionHeadersPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TransactionHeadersPartialUpdateResponseSchema
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
      revalidateTag('transaction-headers')
      console.log('Revalidated tag: transaction-headers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('transactionHeadersPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/transaction-headers/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('transactionHeadersPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/transaction-headers/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/transaction-headers/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * DELETE /transaction-headers/{id}/
 * @generated from DELETE /transaction-headers/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const transactionHeadersDelete = actionClientWithMeta
  .metadata({
    name: "transaction-headers-delete",
    requiresAuth: false
  })
  .schema(TransactionHeadersDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(TransactionHeadersDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.transactionHeaders.transactionHeadersDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TransactionHeadersDeleteResponseSchema
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
      revalidateTag('transaction-headers')
      console.log('Revalidated tag: transaction-headers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('transactionHeadersDelete', true, duration, {
        method: 'DELETE',
        path: '/transaction-headers/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('transactionHeadersDelete', false, duration, {
        method: 'DELETE',
        path: '/transaction-headers/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/transaction-headers/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * POST /transaction-headers/{id}/approve/
 * @generated from POST /transaction-headers/{id}/approve/
 * Features: Input validation, revalidation, error handling
 */
export const transactionHeadersApprove = actionClientWithMeta
  .metadata({
    name: "transaction-headers-approve",
    requiresAuth: false
  })
  .schema(z.object({
        body: TransactionHeadersApproveRequestSchema,
        params: TransactionHeadersApproveParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: TransactionHeadersApproveRequestSchema,
        params: TransactionHeadersApproveParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.transactionHeaders.transactionHeadersApprove({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TransactionHeadersApproveResponseSchema
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
      revalidateTag('transaction-headers')
      console.log('Revalidated tag: transaction-headers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('transactionHeadersApprove', true, duration, {
        method: 'POST',
        path: '/transaction-headers/{id}/approve/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('transactionHeadersApprove', false, duration, {
        method: 'POST',
        path: '/transaction-headers/{id}/approve/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/transaction-headers/{id}/approve/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * POST /transaction-headers/{id}/post/
 * @generated from POST /transaction-headers/{id}/post/
 * Features: Input validation, revalidation, error handling
 */
export const transactionHeadersPost = actionClientWithMeta
  .metadata({
    name: "transaction-headers-post",
    requiresAuth: false
  })
  .schema(z.object({
        body: TransactionHeadersPostRequestSchema,
        params: TransactionHeadersPostParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: TransactionHeadersPostRequestSchema,
        params: TransactionHeadersPostParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.transactionHeaders.transactionHeadersPost({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TransactionHeadersPostResponseSchema
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
      revalidateTag('transaction-headers')
      console.log('Revalidated tag: transaction-headers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('transactionHeadersPost', true, duration, {
        method: 'POST',
        path: '/transaction-headers/{id}/post/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('transactionHeadersPost', false, duration, {
        method: 'POST',
        path: '/transaction-headers/{id}/post/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/transaction-headers/{id}/post/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * POST /transaction-headers/{id}/reverse/
 * @generated from POST /transaction-headers/{id}/reverse/
 * Features: Input validation, revalidation, error handling
 */
export const transactionHeadersReverse = actionClientWithMeta
  .metadata({
    name: "transaction-headers-reverse",
    requiresAuth: false
  })
  .schema(z.object({
        body: TransactionHeadersReverseRequestSchema,
        params: TransactionHeadersReverseParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: TransactionHeadersReverseRequestSchema,
        params: TransactionHeadersReverseParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.transactionHeaders.transactionHeadersReverse({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TransactionHeadersReverseResponseSchema
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
      revalidateTag('transaction-headers')
      console.log('Revalidated tag: transaction-headers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('transactionHeadersReverse', true, duration, {
        method: 'POST',
        path: '/transaction-headers/{id}/reverse/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('transactionHeadersReverse', false, duration, {
        method: 'POST',
        path: '/transaction-headers/{id}/reverse/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/transaction-headers/{id}/reverse/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })