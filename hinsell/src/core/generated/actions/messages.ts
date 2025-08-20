'use server'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  MessagesListParamsSchema,
  MessagesListResponseSchema,
  MessagesCreateRequestSchema,
  MessagesCreateResponseSchema,
  MessagesReadParamsSchema,
  MessagesReadResponseSchema,
  MessagesUpdateRequestSchema,
  MessagesUpdateParamsSchema,
  MessagesUpdateResponseSchema,
  MessagesPartialUpdateRequestSchema,
  MessagesPartialUpdateParamsSchema,
  MessagesPartialUpdateResponseSchema,
  MessagesDeleteParamsSchema,
  MessagesDeleteResponseSchema,
  MessagesMarkAsReadRequestSchema,
  MessagesMarkAsReadParamsSchema,
  MessagesMarkAsReadResponseSchema
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
 * ViewSet for managing internal messages.
 * @generated from GET /messages/
 * Features: React cache, input validation, error handling
 */
export const messagesList = cache(
  actionClientWithMeta
    .metadata({
      name: "messages-list",
      requiresAuth: false
    })
    .schema(MessagesListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(MessagesListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.messages.messagesList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: MessagesListResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('messagesList', true, duration, {
          method: 'GET',
          path: '/messages/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('messagesList', false, duration, {
          method: 'GET',
          path: '/messages/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/messages/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for managing internal messages.
 * @generated from POST /messages/
 * Features: Input validation, revalidation, error handling
 */
export const messagesCreate = actionClientWithMeta
  .metadata({
    name: "messages-create",
    requiresAuth: false
  })
  .schema(MessagesCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(MessagesCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.messages.messagesCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: MessagesCreateResponseSchema
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
      revalidateTag('messages')
      console.log('Revalidated tag: messages')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('messagesCreate', true, duration, {
        method: 'POST',
        path: '/messages/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('messagesCreate', false, duration, {
        method: 'POST',
        path: '/messages/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/messages/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for managing internal messages.
 * @generated from GET /messages/{id}/
 * Features: React cache, input validation, error handling
 */
export const messagesRead = cache(
  actionClientWithMeta
    .metadata({
      name: "messages-read",
      requiresAuth: false
    })
    .schema(MessagesReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(MessagesReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.messages.messagesRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: MessagesReadResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('messagesRead', true, duration, {
          method: 'GET',
          path: '/messages/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('messagesRead', false, duration, {
          method: 'GET',
          path: '/messages/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/messages/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for managing internal messages.
 * @generated from PUT /messages/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const messagesUpdate = actionClientWithMeta
  .metadata({
    name: "messages-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: MessagesUpdateRequestSchema,
        params: MessagesUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: MessagesUpdateRequestSchema,
        params: MessagesUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.messages.messagesUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: MessagesUpdateResponseSchema
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
      revalidateTag('messages')
      console.log('Revalidated tag: messages')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('messagesUpdate', true, duration, {
        method: 'PUT',
        path: '/messages/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('messagesUpdate', false, duration, {
        method: 'PUT',
        path: '/messages/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/messages/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for managing internal messages.
 * @generated from PATCH /messages/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const messagesPartialUpdate = actionClientWithMeta
  .metadata({
    name: "messages-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: MessagesPartialUpdateRequestSchema,
        params: MessagesPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: MessagesPartialUpdateRequestSchema,
        params: MessagesPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.messages.messagesPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: MessagesPartialUpdateResponseSchema
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
      revalidateTag('messages')
      console.log('Revalidated tag: messages')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('messagesPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/messages/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('messagesPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/messages/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/messages/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for managing internal messages.
 * @generated from DELETE /messages/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const messagesDelete = actionClientWithMeta
  .metadata({
    name: "messages-delete",
    requiresAuth: false
  })
  .schema(MessagesDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(MessagesDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.messages.messagesDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: MessagesDeleteResponseSchema
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
      revalidateTag('messages')
      console.log('Revalidated tag: messages')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('messagesDelete', true, duration, {
        method: 'DELETE',
        path: '/messages/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('messagesDelete', false, duration, {
        method: 'DELETE',
        path: '/messages/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/messages/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Mark an internal message as read.
 * @generated from POST /messages/{id}/mark_as_read/
 * Features: Input validation, revalidation, error handling
 */
export const messagesMarkAsRead = actionClientWithMeta
  .metadata({
    name: "messages-mark-as-read",
    requiresAuth: false
  })
  .schema(z.object({
        body: MessagesMarkAsReadRequestSchema,
        params: MessagesMarkAsReadParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: MessagesMarkAsReadRequestSchema,
        params: MessagesMarkAsReadParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.messages.messagesMarkAsRead({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: MessagesMarkAsReadResponseSchema
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
      revalidateTag('messages')
      console.log('Revalidated tag: messages')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('messagesMarkAsRead', true, duration, {
        method: 'POST',
        path: '/messages/{id}/mark_as_read/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('messagesMarkAsRead', false, duration, {
        method: 'POST',
        path: '/messages/{id}/mark_as_read/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/messages/{id}/mark_as_read/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })