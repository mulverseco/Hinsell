'use server'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  TransactionTypesListParamsSchema,
  TransactionTypesListResponseSchema,
  TransactionTypesCreateRequestSchema,
  TransactionTypesCreateResponseSchema,
  TransactionTypesReadParamsSchema,
  TransactionTypesReadResponseSchema,
  TransactionTypesUpdateRequestSchema,
  TransactionTypesUpdateParamsSchema,
  TransactionTypesUpdateResponseSchema,
  TransactionTypesPartialUpdateRequestSchema,
  TransactionTypesPartialUpdateParamsSchema,
  TransactionTypesPartialUpdateResponseSchema,
  TransactionTypesDeleteParamsSchema,
  TransactionTypesDeleteResponseSchema
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
 * GET /transaction-types/
 * @generated from GET /transaction-types/
 * Features: React cache, input validation, error handling
 */
export const transactionTypesList = cache(
  actionClientWithMeta
    .metadata({
      name: "transaction-types-list",
      requiresAuth: false
    })
    .schema(TransactionTypesListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(TransactionTypesListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.transactionTypes.transactionTypesList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: TransactionTypesListResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('transactionTypesList', true, duration, {
          method: 'GET',
          path: '/transaction-types/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('transactionTypesList', false, duration, {
          method: 'GET',
          path: '/transaction-types/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/transaction-types/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * POST /transaction-types/
 * @generated from POST /transaction-types/
 * Features: Input validation, revalidation, error handling
 */
export const transactionTypesCreate = actionClientWithMeta
  .metadata({
    name: "transaction-types-create",
    requiresAuth: false
  })
  .schema(TransactionTypesCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(TransactionTypesCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.transactionTypes.transactionTypesCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TransactionTypesCreateResponseSchema
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
      revalidateTag('transaction-types')
      console.log('Revalidated tag: transaction-types')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('transactionTypesCreate', true, duration, {
        method: 'POST',
        path: '/transaction-types/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('transactionTypesCreate', false, duration, {
        method: 'POST',
        path: '/transaction-types/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/transaction-types/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /transaction-types/{id}/
 * @generated from GET /transaction-types/{id}/
 * Features: React cache, input validation, error handling
 */
export const transactionTypesRead = cache(
  actionClientWithMeta
    .metadata({
      name: "transaction-types-read",
      requiresAuth: false
    })
    .schema(TransactionTypesReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(TransactionTypesReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.transactionTypes.transactionTypesRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: TransactionTypesReadResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('transactionTypesRead', true, duration, {
          method: 'GET',
          path: '/transaction-types/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('transactionTypesRead', false, duration, {
          method: 'GET',
          path: '/transaction-types/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/transaction-types/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * PUT /transaction-types/{id}/
 * @generated from PUT /transaction-types/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const transactionTypesUpdate = actionClientWithMeta
  .metadata({
    name: "transaction-types-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: TransactionTypesUpdateRequestSchema,
        params: TransactionTypesUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: TransactionTypesUpdateRequestSchema,
        params: TransactionTypesUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.transactionTypes.transactionTypesUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TransactionTypesUpdateResponseSchema
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
      revalidateTag('transaction-types')
      console.log('Revalidated tag: transaction-types')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('transactionTypesUpdate', true, duration, {
        method: 'PUT',
        path: '/transaction-types/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('transactionTypesUpdate', false, duration, {
        method: 'PUT',
        path: '/transaction-types/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/transaction-types/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * PATCH /transaction-types/{id}/
 * @generated from PATCH /transaction-types/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const transactionTypesPartialUpdate = actionClientWithMeta
  .metadata({
    name: "transaction-types-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: TransactionTypesPartialUpdateRequestSchema,
        params: TransactionTypesPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: TransactionTypesPartialUpdateRequestSchema,
        params: TransactionTypesPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.transactionTypes.transactionTypesPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TransactionTypesPartialUpdateResponseSchema
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
      revalidateTag('transaction-types')
      console.log('Revalidated tag: transaction-types')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('transactionTypesPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/transaction-types/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('transactionTypesPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/transaction-types/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/transaction-types/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * DELETE /transaction-types/{id}/
 * @generated from DELETE /transaction-types/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const transactionTypesDelete = actionClientWithMeta
  .metadata({
    name: "transaction-types-delete",
    requiresAuth: false
  })
  .schema(TransactionTypesDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(TransactionTypesDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.transactionTypes.transactionTypesDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TransactionTypesDeleteResponseSchema
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
      revalidateTag('transaction-types')
      console.log('Revalidated tag: transaction-types')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('transactionTypesDelete', true, duration, {
        method: 'DELETE',
        path: '/transaction-types/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('transactionTypesDelete', false, duration, {
        method: 'DELETE',
        path: '/transaction-types/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/transaction-types/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })