import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  ItemsListParamsSchema,
  ItemsListResponseSchema,
  ItemsCreateRequestSchema,
  ItemsCreateResponseSchema,
  ItemsReadParamsSchema,
  ItemsReadResponseSchema,
  ItemsUpdateRequestSchema,
  ItemsUpdateParamsSchema,
  ItemsUpdateResponseSchema,
  ItemsPartialUpdateRequestSchema,
  ItemsPartialUpdateParamsSchema,
  ItemsPartialUpdateResponseSchema,
  ItemsDeleteParamsSchema,
  ItemsDeleteResponseSchema
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
 * ViewSet for Item model.
 * @generated from GET /items/
 * Features: React cache, input validation, error handling
 */
export const itemsList = cache(
  actionClientWithMeta
    .metadata({
      name: "items-list",
      requiresAuth: false
    })
    .schema(ItemsListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ItemsListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.items.itemsList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('itemsList', true, duration, {
          method: 'GET',
          path: '/items/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('itemsList', false, duration, {
          method: 'GET',
          path: '/items/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/items/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for Item model.
 * @generated from POST /items/
 * Features: Input validation, revalidation, error handling
 */
export const itemsCreate = actionClientWithMeta
  .metadata({
    name: "items-create",
    requiresAuth: false
  })
  .schema(ItemsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(ItemsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.items.itemsCreate({        body: validatedBody,
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
      revalidateTag('items')
      console.log('Revalidated tag: items')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemsCreate', true, duration, {
        method: 'POST',
        path: '/items/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemsCreate', false, duration, {
        method: 'POST',
        path: '/items/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/items/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for Item model.
 * @generated from GET /items/{id}/
 * Features: React cache, input validation, error handling
 */
export const itemsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "items-read",
      requiresAuth: false
    })
    .schema(ItemsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ItemsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.items.itemsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('itemsRead', true, duration, {
          method: 'GET',
          path: '/items/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('itemsRead', false, duration, {
          method: 'GET',
          path: '/items/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/items/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for Item model.
 * @generated from PUT /items/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const itemsUpdate = actionClientWithMeta
  .metadata({
    name: "items-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ItemsUpdateRequestSchema,
        params: ItemsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ItemsUpdateRequestSchema,
        params: ItemsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.items.itemsUpdate({params: validatedParams,
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
      revalidateTag('items')
      console.log('Revalidated tag: items')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemsUpdate', true, duration, {
        method: 'PUT',
        path: '/items/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemsUpdate', false, duration, {
        method: 'PUT',
        path: '/items/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/items/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for Item model.
 * @generated from PATCH /items/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const itemsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "items-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ItemsPartialUpdateRequestSchema,
        params: ItemsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ItemsPartialUpdateRequestSchema,
        params: ItemsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.items.itemsPartialUpdate({params: validatedParams,
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
      revalidateTag('items')
      console.log('Revalidated tag: items')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/items/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/items/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/items/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for Item model.
 * @generated from DELETE /items/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const itemsDelete = actionClientWithMeta
  .metadata({
    name: "items-delete",
    requiresAuth: false
  })
  .schema(ItemsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ItemsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.items.itemsDelete({params: validatedParams,
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
      revalidateTag('items')
      console.log('Revalidated tag: items')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemsDelete', true, duration, {
        method: 'DELETE',
        path: '/items/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemsDelete', false, duration, {
        method: 'DELETE',
        path: '/items/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/items/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })