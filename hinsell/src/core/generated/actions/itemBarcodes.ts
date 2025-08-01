import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  ItemBarcodesListParamsSchema,
  ItemBarcodesListResponseSchema,
  ItemBarcodesCreateRequestSchema,
  ItemBarcodesCreateResponseSchema,
  ItemBarcodesReadParamsSchema,
  ItemBarcodesReadResponseSchema,
  ItemBarcodesUpdateRequestSchema,
  ItemBarcodesUpdateParamsSchema,
  ItemBarcodesUpdateResponseSchema,
  ItemBarcodesPartialUpdateRequestSchema,
  ItemBarcodesPartialUpdateParamsSchema,
  ItemBarcodesPartialUpdateResponseSchema,
  ItemBarcodesDeleteParamsSchema,
  ItemBarcodesDeleteResponseSchema
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
 * ViewSet for ItemBarcode model.
 * @generated from GET /item-barcodes/
 * Features: React cache, input validation, error handling
 */
export const itemBarcodesList = cache(
  actionClientWithMeta
    .metadata({
      name: "item-barcodes-list",
      requiresAuth: false
    })
    .schema(ItemBarcodesListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ItemBarcodesListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.itemBarcodes.itemBarcodesList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('itemBarcodesList', true, duration, {
          method: 'GET',
          path: '/item-barcodes/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('itemBarcodesList', false, duration, {
          method: 'GET',
          path: '/item-barcodes/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/item-barcodes/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for ItemBarcode model.
 * @generated from POST /item-barcodes/
 * Features: Input validation, revalidation, error handling
 */
export const itemBarcodesCreate = actionClientWithMeta
  .metadata({
    name: "item-barcodes-create",
    requiresAuth: false
  })
  .schema(ItemBarcodesCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(ItemBarcodesCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.itemBarcodes.itemBarcodesCreate({        body: validatedBody,
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
      revalidateTag('item-barcodes')
      console.log('Revalidated tag: item-barcodes')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemBarcodesCreate', true, duration, {
        method: 'POST',
        path: '/item-barcodes/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemBarcodesCreate', false, duration, {
        method: 'POST',
        path: '/item-barcodes/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/item-barcodes/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for ItemBarcode model.
 * @generated from GET /item-barcodes/{id}/
 * Features: React cache, input validation, error handling
 */
export const itemBarcodesRead = cache(
  actionClientWithMeta
    .metadata({
      name: "item-barcodes-read",
      requiresAuth: false
    })
    .schema(ItemBarcodesReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ItemBarcodesReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.itemBarcodes.itemBarcodesRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('itemBarcodesRead', true, duration, {
          method: 'GET',
          path: '/item-barcodes/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('itemBarcodesRead', false, duration, {
          method: 'GET',
          path: '/item-barcodes/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/item-barcodes/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for ItemBarcode model.
 * @generated from PUT /item-barcodes/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const itemBarcodesUpdate = actionClientWithMeta
  .metadata({
    name: "item-barcodes-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ItemBarcodesUpdateRequestSchema,
        params: ItemBarcodesUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ItemBarcodesUpdateRequestSchema,
        params: ItemBarcodesUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.itemBarcodes.itemBarcodesUpdate({params: validatedParams,
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
      revalidateTag('item-barcodes')
      console.log('Revalidated tag: item-barcodes')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemBarcodesUpdate', true, duration, {
        method: 'PUT',
        path: '/item-barcodes/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemBarcodesUpdate', false, duration, {
        method: 'PUT',
        path: '/item-barcodes/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/item-barcodes/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for ItemBarcode model.
 * @generated from PATCH /item-barcodes/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const itemBarcodesPartialUpdate = actionClientWithMeta
  .metadata({
    name: "item-barcodes-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ItemBarcodesPartialUpdateRequestSchema,
        params: ItemBarcodesPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ItemBarcodesPartialUpdateRequestSchema,
        params: ItemBarcodesPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.itemBarcodes.itemBarcodesPartialUpdate({params: validatedParams,
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
      revalidateTag('item-barcodes')
      console.log('Revalidated tag: item-barcodes')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemBarcodesPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/item-barcodes/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemBarcodesPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/item-barcodes/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/item-barcodes/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for ItemBarcode model.
 * @generated from DELETE /item-barcodes/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const itemBarcodesDelete = actionClientWithMeta
  .metadata({
    name: "item-barcodes-delete",
    requiresAuth: false
  })
  .schema(ItemBarcodesDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ItemBarcodesDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.itemBarcodes.itemBarcodesDelete({params: validatedParams,
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
      revalidateTag('item-barcodes')
      console.log('Revalidated tag: item-barcodes')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemBarcodesDelete', true, duration, {
        method: 'DELETE',
        path: '/item-barcodes/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemBarcodesDelete', false, duration, {
        method: 'DELETE',
        path: '/item-barcodes/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/item-barcodes/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })