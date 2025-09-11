'use server'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  LedgerEntriesListParamsSchema,
  LedgerEntriesListResponseSchema,
  LedgerEntriesCreateRequestSchema,
  LedgerEntriesCreateResponseSchema,
  LedgerEntriesReadParamsSchema,
  LedgerEntriesReadResponseSchema,
  LedgerEntriesUpdateRequestSchema,
  LedgerEntriesUpdateParamsSchema,
  LedgerEntriesUpdateResponseSchema,
  LedgerEntriesPartialUpdateRequestSchema,
  LedgerEntriesPartialUpdateParamsSchema,
  LedgerEntriesPartialUpdateResponseSchema,
  LedgerEntriesDeleteParamsSchema,
  LedgerEntriesDeleteResponseSchema
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
 * GET /ledger-entries/
 * @generated from GET /ledger-entries/
 * Features: React cache, input validation, error handling
 */
export const ledgerEntriesList = cache(
  actionClientWithMeta
    .metadata({
      name: "ledger-entries-list",
      requiresAuth: false
    })
    .schema(LedgerEntriesListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(LedgerEntriesListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.ledgerEntries.ledgerEntriesList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: LedgerEntriesListResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('ledgerEntriesList', true, duration, {
          method: 'GET',
          path: '/ledger-entries/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('ledgerEntriesList', false, duration, {
          method: 'GET',
          path: '/ledger-entries/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/ledger-entries/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * POST /ledger-entries/
 * @generated from POST /ledger-entries/
 * Features: Input validation, revalidation, error handling
 */
export const ledgerEntriesCreate = actionClientWithMeta
  .metadata({
    name: "ledger-entries-create",
    requiresAuth: false
  })
  .schema(LedgerEntriesCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(LedgerEntriesCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.ledgerEntries.ledgerEntriesCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: LedgerEntriesCreateResponseSchema
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
      revalidateTag('ledger-entries')
      console.log('Revalidated tag: ledger-entries')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('ledgerEntriesCreate', true, duration, {
        method: 'POST',
        path: '/ledger-entries/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('ledgerEntriesCreate', false, duration, {
        method: 'POST',
        path: '/ledger-entries/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/ledger-entries/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /ledger-entries/{id}/
 * @generated from GET /ledger-entries/{id}/
 * Features: React cache, input validation, error handling
 */
export const ledgerEntriesRead = cache(
  actionClientWithMeta
    .metadata({
      name: "ledger-entries-read",
      requiresAuth: false
    })
    .schema(LedgerEntriesReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(LedgerEntriesReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.ledgerEntries.ledgerEntriesRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: LedgerEntriesReadResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('ledgerEntriesRead', true, duration, {
          method: 'GET',
          path: '/ledger-entries/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('ledgerEntriesRead', false, duration, {
          method: 'GET',
          path: '/ledger-entries/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/ledger-entries/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * PUT /ledger-entries/{id}/
 * @generated from PUT /ledger-entries/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const ledgerEntriesUpdate = actionClientWithMeta
  .metadata({
    name: "ledger-entries-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: LedgerEntriesUpdateRequestSchema,
        params: LedgerEntriesUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: LedgerEntriesUpdateRequestSchema,
        params: LedgerEntriesUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.ledgerEntries.ledgerEntriesUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: LedgerEntriesUpdateResponseSchema
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
      revalidateTag('ledger-entries')
      console.log('Revalidated tag: ledger-entries')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('ledgerEntriesUpdate', true, duration, {
        method: 'PUT',
        path: '/ledger-entries/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('ledgerEntriesUpdate', false, duration, {
        method: 'PUT',
        path: '/ledger-entries/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/ledger-entries/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * PATCH /ledger-entries/{id}/
 * @generated from PATCH /ledger-entries/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const ledgerEntriesPartialUpdate = actionClientWithMeta
  .metadata({
    name: "ledger-entries-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: LedgerEntriesPartialUpdateRequestSchema,
        params: LedgerEntriesPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: LedgerEntriesPartialUpdateRequestSchema,
        params: LedgerEntriesPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.ledgerEntries.ledgerEntriesPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: LedgerEntriesPartialUpdateResponseSchema
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
      revalidateTag('ledger-entries')
      console.log('Revalidated tag: ledger-entries')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('ledgerEntriesPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/ledger-entries/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('ledgerEntriesPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/ledger-entries/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/ledger-entries/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * DELETE /ledger-entries/{id}/
 * @generated from DELETE /ledger-entries/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const ledgerEntriesDelete = actionClientWithMeta
  .metadata({
    name: "ledger-entries-delete",
    requiresAuth: false
  })
  .schema(LedgerEntriesDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(LedgerEntriesDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.ledgerEntries.ledgerEntriesDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: LedgerEntriesDeleteResponseSchema
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
      revalidateTag('ledger-entries')
      console.log('Revalidated tag: ledger-entries')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('ledgerEntriesDelete', true, duration, {
        method: 'DELETE',
        path: '/ledger-entries/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('ledgerEntriesDelete', false, duration, {
        method: 'DELETE',
        path: '/ledger-entries/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/ledger-entries/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })