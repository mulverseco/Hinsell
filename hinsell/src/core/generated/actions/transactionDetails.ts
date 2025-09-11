'use server'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  TransactionDetailsListParamsSchema,
  TransactionDetailsListResponseSchema,
  TransactionDetailsCreateRequestSchema,
  TransactionDetailsCreateResponseSchema,
  TransactionDetailsReadParamsSchema,
  TransactionDetailsReadResponseSchema,
  TransactionDetailsUpdateRequestSchema,
  TransactionDetailsUpdateParamsSchema,
  TransactionDetailsUpdateResponseSchema,
  TransactionDetailsPartialUpdateRequestSchema,
  TransactionDetailsPartialUpdateParamsSchema,
  TransactionDetailsPartialUpdateResponseSchema,
  TransactionDetailsDeleteParamsSchema,
  TransactionDetailsDeleteResponseSchema
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
 * GET /transaction-details/
 * @generated from GET /transaction-details/
 * Features: React cache, input validation, error handling
 */
export const transactionDetailsList = cache(
  actionClientWithMeta
    .metadata({
      name: "transaction-details-list",
      requiresAuth: false
    })
    .schema(TransactionDetailsListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(TransactionDetailsListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.transactionDetails.transactionDetailsList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: TransactionDetailsListResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('transactionDetailsList', true, duration, {
          method: 'GET',
          path: '/transaction-details/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('transactionDetailsList', false, duration, {
          method: 'GET',
          path: '/transaction-details/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/transaction-details/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * POST /transaction-details/
 * @generated from POST /transaction-details/
 * Features: Input validation, revalidation, error handling
 */
export const transactionDetailsCreate = actionClientWithMeta
  .metadata({
    name: "transaction-details-create",
    requiresAuth: false
  })
  .schema(TransactionDetailsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(TransactionDetailsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.transactionDetails.transactionDetailsCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TransactionDetailsCreateResponseSchema
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
      revalidateTag('transaction-details')
      console.log('Revalidated tag: transaction-details')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('transactionDetailsCreate', true, duration, {
        method: 'POST',
        path: '/transaction-details/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('transactionDetailsCreate', false, duration, {
        method: 'POST',
        path: '/transaction-details/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/transaction-details/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /transaction-details/{id}/
 * @generated from GET /transaction-details/{id}/
 * Features: React cache, input validation, error handling
 */
export const transactionDetailsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "transaction-details-read",
      requiresAuth: false
    })
    .schema(TransactionDetailsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(TransactionDetailsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.transactionDetails.transactionDetailsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: TransactionDetailsReadResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('transactionDetailsRead', true, duration, {
          method: 'GET',
          path: '/transaction-details/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('transactionDetailsRead', false, duration, {
          method: 'GET',
          path: '/transaction-details/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/transaction-details/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * PUT /transaction-details/{id}/
 * @generated from PUT /transaction-details/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const transactionDetailsUpdate = actionClientWithMeta
  .metadata({
    name: "transaction-details-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: TransactionDetailsUpdateRequestSchema,
        params: TransactionDetailsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: TransactionDetailsUpdateRequestSchema,
        params: TransactionDetailsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.transactionDetails.transactionDetailsUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TransactionDetailsUpdateResponseSchema
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
      revalidateTag('transaction-details')
      console.log('Revalidated tag: transaction-details')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('transactionDetailsUpdate', true, duration, {
        method: 'PUT',
        path: '/transaction-details/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('transactionDetailsUpdate', false, duration, {
        method: 'PUT',
        path: '/transaction-details/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/transaction-details/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * PATCH /transaction-details/{id}/
 * @generated from PATCH /transaction-details/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const transactionDetailsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "transaction-details-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: TransactionDetailsPartialUpdateRequestSchema,
        params: TransactionDetailsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: TransactionDetailsPartialUpdateRequestSchema,
        params: TransactionDetailsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.transactionDetails.transactionDetailsPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TransactionDetailsPartialUpdateResponseSchema
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
      revalidateTag('transaction-details')
      console.log('Revalidated tag: transaction-details')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('transactionDetailsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/transaction-details/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('transactionDetailsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/transaction-details/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/transaction-details/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * DELETE /transaction-details/{id}/
 * @generated from DELETE /transaction-details/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const transactionDetailsDelete = actionClientWithMeta
  .metadata({
    name: "transaction-details-delete",
    requiresAuth: false
  })
  .schema(TransactionDetailsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(TransactionDetailsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.transactionDetails.transactionDetailsDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TransactionDetailsDeleteResponseSchema
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
      revalidateTag('transaction-details')
      console.log('Revalidated tag: transaction-details')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('transactionDetailsDelete', true, duration, {
        method: 'DELETE',
        path: '/transaction-details/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('transactionDetailsDelete', false, duration, {
        method: 'DELETE',
        path: '/transaction-details/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/transaction-details/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })