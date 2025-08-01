import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  AccountTypesListResponseSchema,
  AccountTypesCreateRequestSchema,
  AccountTypesCreateResponseSchema,
  AccountTypesReadParamsSchema,
  AccountTypesReadResponseSchema,
  AccountTypesUpdateRequestSchema,
  AccountTypesUpdateParamsSchema,
  AccountTypesUpdateResponseSchema,
  AccountTypesPartialUpdateRequestSchema,
  AccountTypesPartialUpdateParamsSchema,
  AccountTypesPartialUpdateResponseSchema,
  AccountTypesDeleteParamsSchema,
  AccountTypesDeleteResponseSchema
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
 * ViewSet for AccountType model.
 * @generated from GET /account-types/
 * Features: React cache, input validation, error handling
 */
export const accountTypesList = cache(
  actionClientWithMeta
    .metadata({
      name: "account-types-list",
      requiresAuth: false
    })
    .schema(z.void())
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {

        // Execute API call with enhanced error handling
        const response = await apiClient.accountTypes.accountTypesList({
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('accountTypesList', true, duration, {
          method: 'GET',
          path: '/account-types/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('accountTypesList', false, duration, {
          method: 'GET',
          path: '/account-types/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/account-types/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for AccountType model.
 * @generated from POST /account-types/
 * Features: Input validation, revalidation, error handling
 */
export const accountTypesCreate = actionClientWithMeta
  .metadata({
    name: "account-types-create",
    requiresAuth: false
  })
  .schema(AccountTypesCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(AccountTypesCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.accountTypes.accountTypesCreate({        body: validatedBody,
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
      revalidateTag('account-types')
      console.log('Revalidated tag: account-types')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('accountTypesCreate', true, duration, {
        method: 'POST',
        path: '/account-types/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('accountTypesCreate', false, duration, {
        method: 'POST',
        path: '/account-types/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/account-types/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for AccountType model.
 * @generated from GET /account-types/{id}/
 * Features: React cache, input validation, error handling
 */
export const accountTypesRead = cache(
  actionClientWithMeta
    .metadata({
      name: "account-types-read",
      requiresAuth: false
    })
    .schema(AccountTypesReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(AccountTypesReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.accountTypes.accountTypesRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('accountTypesRead', true, duration, {
          method: 'GET',
          path: '/account-types/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('accountTypesRead', false, duration, {
          method: 'GET',
          path: '/account-types/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/account-types/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for AccountType model.
 * @generated from PUT /account-types/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const accountTypesUpdate = actionClientWithMeta
  .metadata({
    name: "account-types-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: AccountTypesUpdateRequestSchema,
        params: AccountTypesUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: AccountTypesUpdateRequestSchema,
        params: AccountTypesUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.accountTypes.accountTypesUpdate({params: validatedParams,
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
      revalidateTag('account-types')
      console.log('Revalidated tag: account-types')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('accountTypesUpdate', true, duration, {
        method: 'PUT',
        path: '/account-types/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('accountTypesUpdate', false, duration, {
        method: 'PUT',
        path: '/account-types/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/account-types/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for AccountType model.
 * @generated from PATCH /account-types/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const accountTypesPartialUpdate = actionClientWithMeta
  .metadata({
    name: "account-types-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: AccountTypesPartialUpdateRequestSchema,
        params: AccountTypesPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: AccountTypesPartialUpdateRequestSchema,
        params: AccountTypesPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.accountTypes.accountTypesPartialUpdate({params: validatedParams,
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
      revalidateTag('account-types')
      console.log('Revalidated tag: account-types')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('accountTypesPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/account-types/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('accountTypesPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/account-types/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/account-types/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for AccountType model.
 * @generated from DELETE /account-types/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const accountTypesDelete = actionClientWithMeta
  .metadata({
    name: "account-types-delete",
    requiresAuth: false
  })
  .schema(AccountTypesDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(AccountTypesDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.accountTypes.accountTypesDelete({params: validatedParams,
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
      revalidateTag('account-types')
      console.log('Revalidated tag: account-types')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('accountTypesDelete', true, duration, {
        method: 'DELETE',
        path: '/account-types/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('accountTypesDelete', false, duration, {
        method: 'DELETE',
        path: '/account-types/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/account-types/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })