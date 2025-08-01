import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  NotificationsListParamsSchema,
  NotificationsListResponseSchema,
  NotificationsCreateRequestSchema,
  NotificationsCreateResponseSchema,
  NotificationsReadParamsSchema,
  NotificationsReadResponseSchema,
  NotificationsUpdateRequestSchema,
  NotificationsUpdateParamsSchema,
  NotificationsUpdateResponseSchema,
  NotificationsPartialUpdateRequestSchema,
  NotificationsPartialUpdateParamsSchema,
  NotificationsPartialUpdateResponseSchema,
  NotificationsDeleteParamsSchema,
  NotificationsDeleteResponseSchema,
  NotificationsMarkAsReadRequestSchema,
  NotificationsMarkAsReadParamsSchema,
  NotificationsMarkAsReadResponseSchema
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
 * ViewSet for managing notifications.
 * @generated from GET /notifications/
 * Features: React cache, input validation, error handling
 */
export const notificationsList = cache(
  actionClientWithMeta
    .metadata({
      name: "notifications-list",
      requiresAuth: false
    })
    .schema(NotificationsListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(NotificationsListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.notifications.notificationsList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('notificationsList', true, duration, {
          method: 'GET',
          path: '/notifications/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('notificationsList', false, duration, {
          method: 'GET',
          path: '/notifications/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/notifications/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for managing notifications.
 * @generated from POST /notifications/
 * Features: Input validation, revalidation, error handling
 */
export const notificationsCreate = actionClientWithMeta
  .metadata({
    name: "notifications-create",
    requiresAuth: false
  })
  .schema(NotificationsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(NotificationsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.notifications.notificationsCreate({        body: validatedBody,
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
      revalidateTag('notifications')
      console.log('Revalidated tag: notifications')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('notificationsCreate', true, duration, {
        method: 'POST',
        path: '/notifications/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('notificationsCreate', false, duration, {
        method: 'POST',
        path: '/notifications/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/notifications/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for managing notifications.
 * @generated from GET /notifications/{id}/
 * Features: React cache, input validation, error handling
 */
export const notificationsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "notifications-read",
      requiresAuth: false
    })
    .schema(NotificationsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(NotificationsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.notifications.notificationsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('notificationsRead', true, duration, {
          method: 'GET',
          path: '/notifications/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('notificationsRead', false, duration, {
          method: 'GET',
          path: '/notifications/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/notifications/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for managing notifications.
 * @generated from PUT /notifications/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const notificationsUpdate = actionClientWithMeta
  .metadata({
    name: "notifications-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: NotificationsUpdateRequestSchema,
        params: NotificationsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: NotificationsUpdateRequestSchema,
        params: NotificationsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.notifications.notificationsUpdate({params: validatedParams,
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
      revalidateTag('notifications')
      console.log('Revalidated tag: notifications')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('notificationsUpdate', true, duration, {
        method: 'PUT',
        path: '/notifications/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('notificationsUpdate', false, duration, {
        method: 'PUT',
        path: '/notifications/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/notifications/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for managing notifications.
 * @generated from PATCH /notifications/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const notificationsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "notifications-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: NotificationsPartialUpdateRequestSchema,
        params: NotificationsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: NotificationsPartialUpdateRequestSchema,
        params: NotificationsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.notifications.notificationsPartialUpdate({params: validatedParams,
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
      revalidateTag('notifications')
      console.log('Revalidated tag: notifications')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('notificationsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/notifications/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('notificationsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/notifications/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/notifications/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for managing notifications.
 * @generated from DELETE /notifications/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const notificationsDelete = actionClientWithMeta
  .metadata({
    name: "notifications-delete",
    requiresAuth: false
  })
  .schema(NotificationsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(NotificationsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.notifications.notificationsDelete({params: validatedParams,
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
      revalidateTag('notifications')
      console.log('Revalidated tag: notifications')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('notificationsDelete', true, duration, {
        method: 'DELETE',
        path: '/notifications/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('notificationsDelete', false, duration, {
        method: 'DELETE',
        path: '/notifications/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/notifications/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Mark a notification as read.
 * @generated from POST /notifications/{id}/mark_as_read/
 * Features: Input validation, revalidation, error handling
 */
export const notificationsMarkAsRead = actionClientWithMeta
  .metadata({
    name: "notifications-mark-as-read",
    requiresAuth: false
  })
  .schema(z.object({
        body: NotificationsMarkAsReadRequestSchema,
        params: NotificationsMarkAsReadParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: NotificationsMarkAsReadRequestSchema,
        params: NotificationsMarkAsReadParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.notifications.notificationsMarkAsRead({params: validatedParams,
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
      revalidateTag('notifications')
      console.log('Revalidated tag: notifications')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('notificationsMarkAsRead', true, duration, {
        method: 'POST',
        path: '/notifications/{id}/mark_as_read/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('notificationsMarkAsRead', false, duration, {
        method: 'POST',
        path: '/notifications/{id}/mark_as_read/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/notifications/{id}/mark_as_read/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })