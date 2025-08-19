'use server'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  SystemSettingsListParamsSchema,
  SystemSettingsListResponseSchema,
  SystemSettingsCreateRequestSchema,
  SystemSettingsCreateResponseSchema,
  SystemSettingsReadParamsSchema,
  SystemSettingsReadResponseSchema,
  SystemSettingsUpdateRequestSchema,
  SystemSettingsUpdateParamsSchema,
  SystemSettingsUpdateResponseSchema,
  SystemSettingsPartialUpdateRequestSchema,
  SystemSettingsPartialUpdateParamsSchema,
  SystemSettingsPartialUpdateResponseSchema,
  SystemSettingsDeleteParamsSchema,
  SystemSettingsDeleteResponseSchema
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
 * GET /system-settings/
 * @generated from GET /system-settings/
 * Features: React cache, input validation, error handling
 */
export const systemSettingsList = cache(
  actionClientWithMeta
    .metadata({
      name: "system-settings-list",
      requiresAuth: false
    })
    .schema(SystemSettingsListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(SystemSettingsListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.systemSettings.systemSettingsList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: SystemSettingsListResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('systemSettingsList', true, duration, {
          method: 'GET',
          path: '/system-settings/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('systemSettingsList', false, duration, {
          method: 'GET',
          path: '/system-settings/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/system-settings/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * POST /system-settings/
 * @generated from POST /system-settings/
 * Features: Input validation, revalidation, error handling
 */
export const systemSettingsCreate = actionClientWithMeta
  .metadata({
    name: "system-settings-create",
    requiresAuth: false
  })
  .schema(SystemSettingsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(SystemSettingsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.systemSettings.systemSettingsCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: SystemSettingsCreateResponseSchema
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
      revalidateTag('system-settings')
      console.log('Revalidated tag: system-settings')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('systemSettingsCreate', true, duration, {
        method: 'POST',
        path: '/system-settings/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('systemSettingsCreate', false, duration, {
        method: 'POST',
        path: '/system-settings/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/system-settings/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /system-settings/{id}/
 * @generated from GET /system-settings/{id}/
 * Features: React cache, input validation, error handling
 */
export const systemSettingsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "system-settings-read",
      requiresAuth: false
    })
    .schema(SystemSettingsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(SystemSettingsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.systemSettings.systemSettingsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: SystemSettingsReadResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('systemSettingsRead', true, duration, {
          method: 'GET',
          path: '/system-settings/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('systemSettingsRead', false, duration, {
          method: 'GET',
          path: '/system-settings/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/system-settings/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * PUT /system-settings/{id}/
 * @generated from PUT /system-settings/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const systemSettingsUpdate = actionClientWithMeta
  .metadata({
    name: "system-settings-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: SystemSettingsUpdateRequestSchema,
        params: SystemSettingsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: SystemSettingsUpdateRequestSchema,
        params: SystemSettingsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.systemSettings.systemSettingsUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: SystemSettingsUpdateResponseSchema
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
      revalidateTag('system-settings')
      console.log('Revalidated tag: system-settings')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('systemSettingsUpdate', true, duration, {
        method: 'PUT',
        path: '/system-settings/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('systemSettingsUpdate', false, duration, {
        method: 'PUT',
        path: '/system-settings/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/system-settings/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * PATCH /system-settings/{id}/
 * @generated from PATCH /system-settings/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const systemSettingsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "system-settings-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: SystemSettingsPartialUpdateRequestSchema,
        params: SystemSettingsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: SystemSettingsPartialUpdateRequestSchema,
        params: SystemSettingsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.systemSettings.systemSettingsPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: SystemSettingsPartialUpdateResponseSchema
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
      revalidateTag('system-settings')
      console.log('Revalidated tag: system-settings')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('systemSettingsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/system-settings/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('systemSettingsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/system-settings/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/system-settings/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * DELETE /system-settings/{id}/
 * @generated from DELETE /system-settings/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const systemSettingsDelete = actionClientWithMeta
  .metadata({
    name: "system-settings-delete",
    requiresAuth: false
  })
  .schema(SystemSettingsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(SystemSettingsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.systemSettings.systemSettingsDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: SystemSettingsDeleteResponseSchema
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
      revalidateTag('system-settings')
      console.log('Revalidated tag: system-settings')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('systemSettingsDelete', true, duration, {
        method: 'DELETE',
        path: '/system-settings/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('systemSettingsDelete', false, duration, {
        method: 'DELETE',
        path: '/system-settings/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/system-settings/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })