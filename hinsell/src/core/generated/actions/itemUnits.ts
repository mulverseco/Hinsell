'use server'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  ItemUnitsListParamsSchema,
  ItemUnitsListResponseSchema,
  ItemUnitsCreateRequestSchema,
  ItemUnitsCreateResponseSchema,
  ItemUnitsReadParamsSchema,
  ItemUnitsReadResponseSchema,
  ItemUnitsUpdateRequestSchema,
  ItemUnitsUpdateParamsSchema,
  ItemUnitsUpdateResponseSchema,
  ItemUnitsPartialUpdateRequestSchema,
  ItemUnitsPartialUpdateParamsSchema,
  ItemUnitsPartialUpdateResponseSchema,
  ItemUnitsDeleteParamsSchema,
  ItemUnitsDeleteResponseSchema
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
 * ViewSet for ItemUnit model.
 * @generated from GET /item-units/
 * Features: React cache, input validation, error handling
 */
export const itemUnitsList = cache(
  actionClientWithMeta
    .metadata({
      name: "item-units-list",
      requiresAuth: false
    })
    .schema(ItemUnitsListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ItemUnitsListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.itemUnits.itemUnitsList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: ItemUnitsListResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('itemUnitsList', true, duration, {
          method: 'GET',
          path: '/item-units/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('itemUnitsList', false, duration, {
          method: 'GET',
          path: '/item-units/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/item-units/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for ItemUnit model.
 * @generated from POST /item-units/
 * Features: Input validation, revalidation, error handling
 */
export const itemUnitsCreate = actionClientWithMeta
  .metadata({
    name: "item-units-create",
    requiresAuth: false
  })
  .schema(ItemUnitsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(ItemUnitsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.itemUnits.itemUnitsCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: ItemUnitsCreateResponseSchema
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
      revalidateTag('item-units')
      console.log('Revalidated tag: item-units')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemUnitsCreate', true, duration, {
        method: 'POST',
        path: '/item-units/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemUnitsCreate', false, duration, {
        method: 'POST',
        path: '/item-units/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/item-units/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for ItemUnit model.
 * @generated from GET /item-units/{id}/
 * Features: React cache, input validation, error handling
 */
export const itemUnitsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "item-units-read",
      requiresAuth: false
    })
    .schema(ItemUnitsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ItemUnitsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.itemUnits.itemUnitsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: ItemUnitsReadResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('itemUnitsRead', true, duration, {
          method: 'GET',
          path: '/item-units/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('itemUnitsRead', false, duration, {
          method: 'GET',
          path: '/item-units/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/item-units/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for ItemUnit model.
 * @generated from PUT /item-units/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const itemUnitsUpdate = actionClientWithMeta
  .metadata({
    name: "item-units-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ItemUnitsUpdateRequestSchema,
        params: ItemUnitsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ItemUnitsUpdateRequestSchema,
        params: ItemUnitsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.itemUnits.itemUnitsUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: ItemUnitsUpdateResponseSchema
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
      revalidateTag('item-units')
      console.log('Revalidated tag: item-units')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemUnitsUpdate', true, duration, {
        method: 'PUT',
        path: '/item-units/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemUnitsUpdate', false, duration, {
        method: 'PUT',
        path: '/item-units/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/item-units/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for ItemUnit model.
 * @generated from PATCH /item-units/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const itemUnitsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "item-units-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ItemUnitsPartialUpdateRequestSchema,
        params: ItemUnitsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ItemUnitsPartialUpdateRequestSchema,
        params: ItemUnitsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.itemUnits.itemUnitsPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: ItemUnitsPartialUpdateResponseSchema
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
      revalidateTag('item-units')
      console.log('Revalidated tag: item-units')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemUnitsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/item-units/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemUnitsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/item-units/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/item-units/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for ItemUnit model.
 * @generated from DELETE /item-units/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const itemUnitsDelete = actionClientWithMeta
  .metadata({
    name: "item-units-delete",
    requiresAuth: false
  })
  .schema(ItemUnitsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ItemUnitsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.itemUnits.itemUnitsDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: ItemUnitsDeleteResponseSchema
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
      revalidateTag('item-units')
      console.log('Revalidated tag: item-units')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemUnitsDelete', true, duration, {
        method: 'DELETE',
        path: '/item-units/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemUnitsDelete', false, duration, {
        method: 'DELETE',
        path: '/item-units/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/item-units/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })