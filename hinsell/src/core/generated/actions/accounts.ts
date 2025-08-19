'use server'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  AccountsListResponseSchema,
  AccountsCreateRequestSchema,
  AccountsCreateResponseSchema,
  AccountsReadParamsSchema,
  AccountsReadResponseSchema,
  AccountsUpdateRequestSchema,
  AccountsUpdateParamsSchema,
  AccountsUpdateResponseSchema,
  AccountsPartialUpdateRequestSchema,
  AccountsPartialUpdateParamsSchema,
  AccountsPartialUpdateResponseSchema,
  AccountsDeleteParamsSchema,
  AccountsDeleteResponseSchema,
  AccountsUpdateBalanceRequestSchema,
  AccountsUpdateBalanceParamsSchema,
  AccountsUpdateBalanceResponseSchema
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
 * ViewSet for Account model.
 * @generated from GET /accounts/
 * Features: React cache, input validation, error handling
 */
export const accountsList = cache(
  actionClientWithMeta
    .metadata({
      name: "accounts-list",
      requiresAuth: false
    })
    .schema(z.void())
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {

        // Execute API call with enhanced error handling
        const response = await apiClient.accounts.accountsList({
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: AccountsListResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('accountsList', true, duration, {
          method: 'GET',
          path: '/accounts/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('accountsList', false, duration, {
          method: 'GET',
          path: '/accounts/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/accounts/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for Account model.
 * @generated from POST /accounts/
 * Features: Input validation, revalidation, error handling
 */
export const accountsCreate = actionClientWithMeta
  .metadata({
    name: "accounts-create",
    requiresAuth: false
  })
  .schema(AccountsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(AccountsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.accounts.accountsCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: AccountsCreateResponseSchema
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
      revalidateTag('accounts')
      console.log('Revalidated tag: accounts')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('accountsCreate', true, duration, {
        method: 'POST',
        path: '/accounts/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('accountsCreate', false, duration, {
        method: 'POST',
        path: '/accounts/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/accounts/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for Account model.
 * @generated from GET /accounts/{id}/
 * Features: React cache, input validation, error handling
 */
export const accountsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "accounts-read",
      requiresAuth: false
    })
    .schema(AccountsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(AccountsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.accounts.accountsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: AccountsReadResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('accountsRead', true, duration, {
          method: 'GET',
          path: '/accounts/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('accountsRead', false, duration, {
          method: 'GET',
          path: '/accounts/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/accounts/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for Account model.
 * @generated from PUT /accounts/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const accountsUpdate = actionClientWithMeta
  .metadata({
    name: "accounts-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: AccountsUpdateRequestSchema,
        params: AccountsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: AccountsUpdateRequestSchema,
        params: AccountsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.accounts.accountsUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: AccountsUpdateResponseSchema
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
      revalidateTag('accounts')
      console.log('Revalidated tag: accounts')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('accountsUpdate', true, duration, {
        method: 'PUT',
        path: '/accounts/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('accountsUpdate', false, duration, {
        method: 'PUT',
        path: '/accounts/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/accounts/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for Account model.
 * @generated from PATCH /accounts/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const accountsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "accounts-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: AccountsPartialUpdateRequestSchema,
        params: AccountsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: AccountsPartialUpdateRequestSchema,
        params: AccountsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.accounts.accountsPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: AccountsPartialUpdateResponseSchema
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
      revalidateTag('accounts')
      console.log('Revalidated tag: accounts')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('accountsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/accounts/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('accountsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/accounts/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/accounts/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for Account model.
 * @generated from DELETE /accounts/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const accountsDelete = actionClientWithMeta
  .metadata({
    name: "accounts-delete",
    requiresAuth: false
  })
  .schema(AccountsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(AccountsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.accounts.accountsDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: AccountsDeleteResponseSchema
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
      revalidateTag('accounts')
      console.log('Revalidated tag: accounts')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('accountsDelete', true, duration, {
        method: 'DELETE',
        path: '/accounts/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('accountsDelete', false, duration, {
        method: 'DELETE',
        path: '/accounts/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/accounts/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Update account balance.
 * @generated from POST /accounts/{id}/update-balance/
 * Features: Input validation, revalidation, error handling
 */
export const accountsUpdateBalance = actionClientWithMeta
  .metadata({
    name: "accounts-update-balance",
    requiresAuth: false
  })
  .schema(z.object({
        body: AccountsUpdateBalanceRequestSchema,
        params: AccountsUpdateBalanceParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: AccountsUpdateBalanceRequestSchema,
        params: AccountsUpdateBalanceParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.accounts.accountsUpdateBalance({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: AccountsUpdateBalanceResponseSchema
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
      revalidateTag('accounts')
      console.log('Revalidated tag: accounts')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('accountsUpdateBalance', true, duration, {
        method: 'POST',
        path: '/accounts/{id}/update-balance/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('accountsUpdateBalance', false, duration, {
        method: 'POST',
        path: '/accounts/{id}/update-balance/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/accounts/{id}/update-balance/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })
