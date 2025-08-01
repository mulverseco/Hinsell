import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  UsersListParamsSchema,
  UsersListResponseSchema,
  UsersCreateRequestSchema,
  UsersCreateResponseSchema,
  UsersReadParamsSchema,
  UsersReadResponseSchema,
  UsersUpdateRequestSchema,
  UsersUpdateParamsSchema,
  UsersUpdateResponseSchema,
  UsersPartialUpdateRequestSchema,
  UsersPartialUpdateParamsSchema,
  UsersPartialUpdateResponseSchema,
  UsersDeleteParamsSchema,
  UsersDeleteResponseSchema,
  UsersLoyaltyHistoryParamsSchema,
  UsersLoyaltyHistoryResponseSchema
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
 * GET /users/
 * @generated from GET /users/
 * Features: React cache, input validation, error handling
 */
export const usersList = cache(
  actionClientWithMeta
    .metadata({
      name: "users-list",
      requiresAuth: false
    })
    .schema(UsersListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(UsersListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.users.usersList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('usersList', true, duration, {
          method: 'GET',
          path: '/users/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('usersList', false, duration, {
          method: 'GET',
          path: '/users/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/users/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * POST /users/
 * @generated from POST /users/
 * Features: Input validation, revalidation, error handling
 */
export const usersCreate = actionClientWithMeta
  .metadata({
    name: "users-create",
    requiresAuth: false
  })
  .schema(UsersCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(UsersCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.users.usersCreate({        body: validatedBody,
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
      revalidateTag('users')
      console.log('Revalidated tag: users')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('usersCreate', true, duration, {
        method: 'POST',
        path: '/users/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('usersCreate', false, duration, {
        method: 'POST',
        path: '/users/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/users/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /users/{id}/
 * @generated from GET /users/{id}/
 * Features: React cache, input validation, error handling
 */
export const usersRead = cache(
  actionClientWithMeta
    .metadata({
      name: "users-read",
      requiresAuth: false
    })
    .schema(UsersReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(UsersReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.users.usersRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('usersRead', true, duration, {
          method: 'GET',
          path: '/users/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('usersRead', false, duration, {
          method: 'GET',
          path: '/users/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/users/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * PUT /users/{id}/
 * @generated from PUT /users/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const usersUpdate = actionClientWithMeta
  .metadata({
    name: "users-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: UsersUpdateRequestSchema,
        params: UsersUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: UsersUpdateRequestSchema,
        params: UsersUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.users.usersUpdate({params: validatedParams,
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
      revalidateTag('users')
      console.log('Revalidated tag: users')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('usersUpdate', true, duration, {
        method: 'PUT',
        path: '/users/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('usersUpdate', false, duration, {
        method: 'PUT',
        path: '/users/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/users/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * PATCH /users/{id}/
 * @generated from PATCH /users/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const usersPartialUpdate = actionClientWithMeta
  .metadata({
    name: "users-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: UsersPartialUpdateRequestSchema,
        params: UsersPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: UsersPartialUpdateRequestSchema,
        params: UsersPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.users.usersPartialUpdate({params: validatedParams,
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
      revalidateTag('users')
      console.log('Revalidated tag: users')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('usersPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/users/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('usersPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/users/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/users/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * DELETE /users/{id}/
 * @generated from DELETE /users/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const usersDelete = actionClientWithMeta
  .metadata({
    name: "users-delete",
    requiresAuth: false
  })
  .schema(UsersDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(UsersDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.users.usersDelete({params: validatedParams,
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
      revalidateTag('users')
      console.log('Revalidated tag: users')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('usersDelete', true, duration, {
        method: 'DELETE',
        path: '/users/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('usersDelete', false, duration, {
        method: 'DELETE',
        path: '/users/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/users/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /users/{id}/loyalty_history/
 * @generated from GET /users/{id}/loyalty_history/
 * Features: React cache, input validation, error handling
 */
export const usersLoyaltyHistory = cache(
  actionClientWithMeta
    .metadata({
      name: "users-loyalty-history",
      requiresAuth: false
    })
    .schema(UsersLoyaltyHistoryParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(UsersLoyaltyHistoryParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.users.usersLoyaltyHistory({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('usersLoyaltyHistory', true, duration, {
          method: 'GET',
          path: '/users/{id}/loyalty_history/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('usersLoyaltyHistory', false, duration, {
          method: 'GET',
          path: '/users/{id}/loyalty_history/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/users/{id}/loyalty_history/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)