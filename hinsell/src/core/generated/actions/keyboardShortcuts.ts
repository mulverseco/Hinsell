import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  KeyboardShortcutsListParamsSchema,
  KeyboardShortcutsListResponseSchema,
  KeyboardShortcutsCreateRequestSchema,
  KeyboardShortcutsCreateResponseSchema,
  KeyboardShortcutsReadParamsSchema,
  KeyboardShortcutsReadResponseSchema,
  KeyboardShortcutsUpdateRequestSchema,
  KeyboardShortcutsUpdateParamsSchema,
  KeyboardShortcutsUpdateResponseSchema,
  KeyboardShortcutsPartialUpdateRequestSchema,
  KeyboardShortcutsPartialUpdateParamsSchema,
  KeyboardShortcutsPartialUpdateResponseSchema,
  KeyboardShortcutsDeleteParamsSchema,
  KeyboardShortcutsDeleteResponseSchema
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
 * GET /keyboard-shortcuts/
 * @generated from GET /keyboard-shortcuts/
 * Features: React cache, input validation, error handling
 */
export const keyboardShortcutsList = cache(
  actionClientWithMeta
    .metadata({
      name: "keyboard-shortcuts-list",
      requiresAuth: false
    })
    .schema(KeyboardShortcutsListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(KeyboardShortcutsListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.keyboardShortcuts.keyboardShortcutsList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('keyboardShortcutsList', true, duration, {
          method: 'GET',
          path: '/keyboard-shortcuts/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('keyboardShortcutsList', false, duration, {
          method: 'GET',
          path: '/keyboard-shortcuts/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/keyboard-shortcuts/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * POST /keyboard-shortcuts/
 * @generated from POST /keyboard-shortcuts/
 * Features: Input validation, revalidation, error handling
 */
export const keyboardShortcutsCreate = actionClientWithMeta
  .metadata({
    name: "keyboard-shortcuts-create",
    requiresAuth: false
  })
  .schema(KeyboardShortcutsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(KeyboardShortcutsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.keyboardShortcuts.keyboardShortcutsCreate({        body: validatedBody,
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
      revalidateTag('keyboard-shortcuts')
      console.log('Revalidated tag: keyboard-shortcuts')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('keyboardShortcutsCreate', true, duration, {
        method: 'POST',
        path: '/keyboard-shortcuts/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('keyboardShortcutsCreate', false, duration, {
        method: 'POST',
        path: '/keyboard-shortcuts/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/keyboard-shortcuts/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /keyboard-shortcuts/{id}/
 * @generated from GET /keyboard-shortcuts/{id}/
 * Features: React cache, input validation, error handling
 */
export const keyboardShortcutsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "keyboard-shortcuts-read",
      requiresAuth: false
    })
    .schema(KeyboardShortcutsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(KeyboardShortcutsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.keyboardShortcuts.keyboardShortcutsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('keyboardShortcutsRead', true, duration, {
          method: 'GET',
          path: '/keyboard-shortcuts/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('keyboardShortcutsRead', false, duration, {
          method: 'GET',
          path: '/keyboard-shortcuts/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/keyboard-shortcuts/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * PUT /keyboard-shortcuts/{id}/
 * @generated from PUT /keyboard-shortcuts/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const keyboardShortcutsUpdate = actionClientWithMeta
  .metadata({
    name: "keyboard-shortcuts-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: KeyboardShortcutsUpdateRequestSchema,
        params: KeyboardShortcutsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: KeyboardShortcutsUpdateRequestSchema,
        params: KeyboardShortcutsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.keyboardShortcuts.keyboardShortcutsUpdate({params: validatedParams,
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
      revalidateTag('keyboard-shortcuts')
      console.log('Revalidated tag: keyboard-shortcuts')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('keyboardShortcutsUpdate', true, duration, {
        method: 'PUT',
        path: '/keyboard-shortcuts/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('keyboardShortcutsUpdate', false, duration, {
        method: 'PUT',
        path: '/keyboard-shortcuts/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/keyboard-shortcuts/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * PATCH /keyboard-shortcuts/{id}/
 * @generated from PATCH /keyboard-shortcuts/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const keyboardShortcutsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "keyboard-shortcuts-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: KeyboardShortcutsPartialUpdateRequestSchema,
        params: KeyboardShortcutsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: KeyboardShortcutsPartialUpdateRequestSchema,
        params: KeyboardShortcutsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.keyboardShortcuts.keyboardShortcutsPartialUpdate({params: validatedParams,
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
      revalidateTag('keyboard-shortcuts')
      console.log('Revalidated tag: keyboard-shortcuts')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('keyboardShortcutsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/keyboard-shortcuts/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('keyboardShortcutsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/keyboard-shortcuts/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/keyboard-shortcuts/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * DELETE /keyboard-shortcuts/{id}/
 * @generated from DELETE /keyboard-shortcuts/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const keyboardShortcutsDelete = actionClientWithMeta
  .metadata({
    name: "keyboard-shortcuts-delete",
    requiresAuth: false
  })
  .schema(KeyboardShortcutsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(KeyboardShortcutsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.keyboardShortcuts.keyboardShortcutsDelete({params: validatedParams,
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
      revalidateTag('keyboard-shortcuts')
      console.log('Revalidated tag: keyboard-shortcuts')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('keyboardShortcutsDelete', true, duration, {
        method: 'DELETE',
        path: '/keyboard-shortcuts/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('keyboardShortcutsDelete', false, duration, {
        method: 'DELETE',
        path: '/keyboard-shortcuts/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/keyboard-shortcuts/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })