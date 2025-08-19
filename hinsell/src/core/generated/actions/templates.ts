'use server'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  TemplatesListParamsSchema,
  TemplatesListResponseSchema,
  TemplatesCreateRequestSchema,
  TemplatesCreateResponseSchema,
  TemplatesReadParamsSchema,
  TemplatesReadResponseSchema,
  TemplatesUpdateRequestSchema,
  TemplatesUpdateParamsSchema,
  TemplatesUpdateResponseSchema,
  TemplatesPartialUpdateRequestSchema,
  TemplatesPartialUpdateParamsSchema,
  TemplatesPartialUpdateResponseSchema,
  TemplatesDeleteParamsSchema,
  TemplatesDeleteResponseSchema
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
 * ViewSet for managing notification templates.
 * @generated from GET /templates/
 * Features: React cache, input validation, error handling
 */
export const templatesList = cache(
  actionClientWithMeta
    .metadata({
      name: "templates-list",
      requiresAuth: false
    })
    .schema(TemplatesListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(TemplatesListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.templates.templatesList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: TemplatesListResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('templatesList', true, duration, {
          method: 'GET',
          path: '/templates/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('templatesList', false, duration, {
          method: 'GET',
          path: '/templates/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/templates/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for managing notification templates.
 * @generated from POST /templates/
 * Features: Input validation, revalidation, error handling
 */
export const templatesCreate = actionClientWithMeta
  .metadata({
    name: "templates-create",
    requiresAuth: false
  })
  .schema(TemplatesCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(TemplatesCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.templates.templatesCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TemplatesCreateResponseSchema
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
      revalidateTag('templates')
      console.log('Revalidated tag: templates')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('templatesCreate', true, duration, {
        method: 'POST',
        path: '/templates/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('templatesCreate', false, duration, {
        method: 'POST',
        path: '/templates/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/templates/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for managing notification templates.
 * @generated from GET /templates/{id}/
 * Features: React cache, input validation, error handling
 */
export const templatesRead = cache(
  actionClientWithMeta
    .metadata({
      name: "templates-read",
      requiresAuth: false
    })
    .schema(TemplatesReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(TemplatesReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.templates.templatesRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: TemplatesReadResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('templatesRead', true, duration, {
          method: 'GET',
          path: '/templates/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('templatesRead', false, duration, {
          method: 'GET',
          path: '/templates/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/templates/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for managing notification templates.
 * @generated from PUT /templates/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const templatesUpdate = actionClientWithMeta
  .metadata({
    name: "templates-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: TemplatesUpdateRequestSchema,
        params: TemplatesUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: TemplatesUpdateRequestSchema,
        params: TemplatesUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.templates.templatesUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TemplatesUpdateResponseSchema
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
      revalidateTag('templates')
      console.log('Revalidated tag: templates')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('templatesUpdate', true, duration, {
        method: 'PUT',
        path: '/templates/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('templatesUpdate', false, duration, {
        method: 'PUT',
        path: '/templates/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/templates/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for managing notification templates.
 * @generated from PATCH /templates/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const templatesPartialUpdate = actionClientWithMeta
  .metadata({
    name: "templates-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: TemplatesPartialUpdateRequestSchema,
        params: TemplatesPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: TemplatesPartialUpdateRequestSchema,
        params: TemplatesPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.templates.templatesPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TemplatesPartialUpdateResponseSchema
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
      revalidateTag('templates')
      console.log('Revalidated tag: templates')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('templatesPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/templates/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('templatesPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/templates/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/templates/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for managing notification templates.
 * @generated from DELETE /templates/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const templatesDelete = actionClientWithMeta
  .metadata({
    name: "templates-delete",
    requiresAuth: false
  })
  .schema(TemplatesDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(TemplatesDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.templates.templatesDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: TemplatesDeleteResponseSchema
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
      revalidateTag('templates')
      console.log('Revalidated tag: templates')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('templatesDelete', true, duration, {
        method: 'DELETE',
        path: '/templates/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('templatesDelete', false, duration, {
        method: 'DELETE',
        path: '/templates/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/templates/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })