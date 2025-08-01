import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  NotesListParamsSchema,
  NotesListResponseSchema,
  NotesCreateRequestSchema,
  NotesCreateResponseSchema,
  NotesReadParamsSchema,
  NotesReadResponseSchema,
  NotesUpdateRequestSchema,
  NotesUpdateParamsSchema,
  NotesUpdateResponseSchema,
  NotesPartialUpdateRequestSchema,
  NotesPartialUpdateParamsSchema,
  NotesPartialUpdateResponseSchema,
  NotesDeleteParamsSchema,
  NotesDeleteResponseSchema,
  NotesMarkReminderSentRequestSchema,
  NotesMarkReminderSentParamsSchema,
  NotesMarkReminderSentResponseSchema
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
 * ViewSet for managing user notes.
 * @generated from GET /notes/
 * Features: React cache, input validation, error handling
 */
export const notesList = cache(
  actionClientWithMeta
    .metadata({
      name: "notes-list",
      requiresAuth: false
    })
    .schema(NotesListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(NotesListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.notes.notesList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('notesList', true, duration, {
          method: 'GET',
          path: '/notes/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('notesList', false, duration, {
          method: 'GET',
          path: '/notes/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/notes/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for managing user notes.
 * @generated from POST /notes/
 * Features: Input validation, revalidation, error handling
 */
export const notesCreate = actionClientWithMeta
  .metadata({
    name: "notes-create",
    requiresAuth: false
  })
  .schema(NotesCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(NotesCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.notes.notesCreate({        body: validatedBody,
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
      revalidateTag('notes')
      console.log('Revalidated tag: notes')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('notesCreate', true, duration, {
        method: 'POST',
        path: '/notes/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('notesCreate', false, duration, {
        method: 'POST',
        path: '/notes/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/notes/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for managing user notes.
 * @generated from GET /notes/{id}/
 * Features: React cache, input validation, error handling
 */
export const notesRead = cache(
  actionClientWithMeta
    .metadata({
      name: "notes-read",
      requiresAuth: false
    })
    .schema(NotesReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(NotesReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.notes.notesRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('notesRead', true, duration, {
          method: 'GET',
          path: '/notes/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('notesRead', false, duration, {
          method: 'GET',
          path: '/notes/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/notes/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for managing user notes.
 * @generated from PUT /notes/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const notesUpdate = actionClientWithMeta
  .metadata({
    name: "notes-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: NotesUpdateRequestSchema,
        params: NotesUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: NotesUpdateRequestSchema,
        params: NotesUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.notes.notesUpdate({params: validatedParams,
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
      revalidateTag('notes')
      console.log('Revalidated tag: notes')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('notesUpdate', true, duration, {
        method: 'PUT',
        path: '/notes/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('notesUpdate', false, duration, {
        method: 'PUT',
        path: '/notes/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/notes/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for managing user notes.
 * @generated from PATCH /notes/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const notesPartialUpdate = actionClientWithMeta
  .metadata({
    name: "notes-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: NotesPartialUpdateRequestSchema,
        params: NotesPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: NotesPartialUpdateRequestSchema,
        params: NotesPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.notes.notesPartialUpdate({params: validatedParams,
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
      revalidateTag('notes')
      console.log('Revalidated tag: notes')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('notesPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/notes/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('notesPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/notes/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/notes/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for managing user notes.
 * @generated from DELETE /notes/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const notesDelete = actionClientWithMeta
  .metadata({
    name: "notes-delete",
    requiresAuth: false
  })
  .schema(NotesDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(NotesDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.notes.notesDelete({params: validatedParams,
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
      revalidateTag('notes')
      console.log('Revalidated tag: notes')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('notesDelete', true, duration, {
        method: 'DELETE',
        path: '/notes/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('notesDelete', false, duration, {
        method: 'DELETE',
        path: '/notes/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/notes/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Mark a user note reminder as sent.
 * @generated from POST /notes/{id}/mark_reminder_sent/
 * Features: Input validation, revalidation, error handling
 */
export const notesMarkReminderSent = actionClientWithMeta
  .metadata({
    name: "notes-mark-reminder-sent",
    requiresAuth: false
  })
  .schema(z.object({
        body: NotesMarkReminderSentRequestSchema,
        params: NotesMarkReminderSentParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: NotesMarkReminderSentRequestSchema,
        params: NotesMarkReminderSentParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.notes.notesMarkReminderSent({params: validatedParams,
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
      revalidateTag('notes')
      console.log('Revalidated tag: notes')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('notesMarkReminderSent', true, duration, {
        method: 'POST',
        path: '/notes/{id}/mark_reminder_sent/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('notesMarkReminderSent', false, duration, {
        method: 'POST',
        path: '/notes/{id}/mark_reminder_sent/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/notes/{id}/mark_reminder_sent/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })