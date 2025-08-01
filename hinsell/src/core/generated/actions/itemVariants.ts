import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  ItemVariantsListParamsSchema,
  ItemVariantsListResponseSchema,
  ItemVariantsCreateRequestSchema,
  ItemVariantsCreateResponseSchema,
  ItemVariantsReadParamsSchema,
  ItemVariantsReadResponseSchema,
  ItemVariantsUpdateRequestSchema,
  ItemVariantsUpdateParamsSchema,
  ItemVariantsUpdateResponseSchema,
  ItemVariantsPartialUpdateRequestSchema,
  ItemVariantsPartialUpdateParamsSchema,
  ItemVariantsPartialUpdateResponseSchema,
  ItemVariantsDeleteParamsSchema,
  ItemVariantsDeleteResponseSchema
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
 * ViewSet for ItemVariant model.
 * @generated from GET /item-variants/
 * Features: React cache, input validation, error handling
 */
export const itemVariantsList = cache(
  actionClientWithMeta
    .metadata({
      name: "item-variants-list",
      requiresAuth: false
    })
    .schema(ItemVariantsListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ItemVariantsListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.itemVariants.itemVariantsList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('itemVariantsList', true, duration, {
          method: 'GET',
          path: '/item-variants/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('itemVariantsList', false, duration, {
          method: 'GET',
          path: '/item-variants/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/item-variants/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for ItemVariant model.
 * @generated from POST /item-variants/
 * Features: Input validation, revalidation, error handling
 */
export const itemVariantsCreate = actionClientWithMeta
  .metadata({
    name: "item-variants-create",
    requiresAuth: false
  })
  .schema(ItemVariantsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(ItemVariantsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.itemVariants.itemVariantsCreate({        body: validatedBody,
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
      revalidateTag('item-variants')
      console.log('Revalidated tag: item-variants')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemVariantsCreate', true, duration, {
        method: 'POST',
        path: '/item-variants/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemVariantsCreate', false, duration, {
        method: 'POST',
        path: '/item-variants/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/item-variants/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for ItemVariant model.
 * @generated from GET /item-variants/{id}/
 * Features: React cache, input validation, error handling
 */
export const itemVariantsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "item-variants-read",
      requiresAuth: false
    })
    .schema(ItemVariantsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ItemVariantsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.itemVariants.itemVariantsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('itemVariantsRead', true, duration, {
          method: 'GET',
          path: '/item-variants/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('itemVariantsRead', false, duration, {
          method: 'GET',
          path: '/item-variants/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/item-variants/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for ItemVariant model.
 * @generated from PUT /item-variants/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const itemVariantsUpdate = actionClientWithMeta
  .metadata({
    name: "item-variants-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ItemVariantsUpdateRequestSchema,
        params: ItemVariantsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ItemVariantsUpdateRequestSchema,
        params: ItemVariantsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.itemVariants.itemVariantsUpdate({params: validatedParams,
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
      revalidateTag('item-variants')
      console.log('Revalidated tag: item-variants')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemVariantsUpdate', true, duration, {
        method: 'PUT',
        path: '/item-variants/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemVariantsUpdate', false, duration, {
        method: 'PUT',
        path: '/item-variants/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/item-variants/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for ItemVariant model.
 * @generated from PATCH /item-variants/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const itemVariantsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "item-variants-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ItemVariantsPartialUpdateRequestSchema,
        params: ItemVariantsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ItemVariantsPartialUpdateRequestSchema,
        params: ItemVariantsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.itemVariants.itemVariantsPartialUpdate({params: validatedParams,
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
      revalidateTag('item-variants')
      console.log('Revalidated tag: item-variants')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemVariantsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/item-variants/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemVariantsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/item-variants/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/item-variants/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for ItemVariant model.
 * @generated from DELETE /item-variants/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const itemVariantsDelete = actionClientWithMeta
  .metadata({
    name: "item-variants-delete",
    requiresAuth: false
  })
  .schema(ItemVariantsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ItemVariantsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.itemVariants.itemVariantsDelete({params: validatedParams,
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
      revalidateTag('item-variants')
      console.log('Revalidated tag: item-variants')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemVariantsDelete', true, duration, {
        method: 'DELETE',
        path: '/item-variants/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemVariantsDelete', false, duration, {
        method: 'DELETE',
        path: '/item-variants/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/item-variants/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })