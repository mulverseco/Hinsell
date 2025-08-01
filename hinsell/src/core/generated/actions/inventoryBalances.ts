import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  InventoryBalancesListParamsSchema,
  InventoryBalancesListResponseSchema,
  InventoryBalancesCreateRequestSchema,
  InventoryBalancesCreateResponseSchema,
  InventoryBalancesReadParamsSchema,
  InventoryBalancesReadResponseSchema,
  InventoryBalancesUpdateRequestSchema,
  InventoryBalancesUpdateParamsSchema,
  InventoryBalancesUpdateResponseSchema,
  InventoryBalancesPartialUpdateRequestSchema,
  InventoryBalancesPartialUpdateParamsSchema,
  InventoryBalancesPartialUpdateResponseSchema,
  InventoryBalancesDeleteParamsSchema,
  InventoryBalancesDeleteResponseSchema
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
 * ViewSet for InventoryBalance model.
 * @generated from GET /inventory-balances/
 * Features: React cache, input validation, error handling
 */
export const inventoryBalancesList = cache(
  actionClientWithMeta
    .metadata({
      name: "inventory-balances-list",
      requiresAuth: false
    })
    .schema(InventoryBalancesListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(InventoryBalancesListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.inventoryBalances.inventoryBalancesList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('inventoryBalancesList', true, duration, {
          method: 'GET',
          path: '/inventory-balances/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('inventoryBalancesList', false, duration, {
          method: 'GET',
          path: '/inventory-balances/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/inventory-balances/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for InventoryBalance model.
 * @generated from POST /inventory-balances/
 * Features: Input validation, revalidation, error handling
 */
export const inventoryBalancesCreate = actionClientWithMeta
  .metadata({
    name: "inventory-balances-create",
    requiresAuth: false
  })
  .schema(InventoryBalancesCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(InventoryBalancesCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.inventoryBalances.inventoryBalancesCreate({        body: validatedBody,
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
      revalidateTag('inventory-balances')
      console.log('Revalidated tag: inventory-balances')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('inventoryBalancesCreate', true, duration, {
        method: 'POST',
        path: '/inventory-balances/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('inventoryBalancesCreate', false, duration, {
        method: 'POST',
        path: '/inventory-balances/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/inventory-balances/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for InventoryBalance model.
 * @generated from GET /inventory-balances/{id}/
 * Features: React cache, input validation, error handling
 */
export const inventoryBalancesRead = cache(
  actionClientWithMeta
    .metadata({
      name: "inventory-balances-read",
      requiresAuth: false
    })
    .schema(InventoryBalancesReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(InventoryBalancesReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.inventoryBalances.inventoryBalancesRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('inventoryBalancesRead', true, duration, {
          method: 'GET',
          path: '/inventory-balances/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('inventoryBalancesRead', false, duration, {
          method: 'GET',
          path: '/inventory-balances/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/inventory-balances/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for InventoryBalance model.
 * @generated from PUT /inventory-balances/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const inventoryBalancesUpdate = actionClientWithMeta
  .metadata({
    name: "inventory-balances-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: InventoryBalancesUpdateRequestSchema,
        params: InventoryBalancesUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: InventoryBalancesUpdateRequestSchema,
        params: InventoryBalancesUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.inventoryBalances.inventoryBalancesUpdate({params: validatedParams,
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
      revalidateTag('inventory-balances')
      console.log('Revalidated tag: inventory-balances')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('inventoryBalancesUpdate', true, duration, {
        method: 'PUT',
        path: '/inventory-balances/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('inventoryBalancesUpdate', false, duration, {
        method: 'PUT',
        path: '/inventory-balances/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/inventory-balances/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for InventoryBalance model.
 * @generated from PATCH /inventory-balances/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const inventoryBalancesPartialUpdate = actionClientWithMeta
  .metadata({
    name: "inventory-balances-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: InventoryBalancesPartialUpdateRequestSchema,
        params: InventoryBalancesPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: InventoryBalancesPartialUpdateRequestSchema,
        params: InventoryBalancesPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.inventoryBalances.inventoryBalancesPartialUpdate({params: validatedParams,
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
      revalidateTag('inventory-balances')
      console.log('Revalidated tag: inventory-balances')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('inventoryBalancesPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/inventory-balances/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('inventoryBalancesPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/inventory-balances/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/inventory-balances/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for InventoryBalance model.
 * @generated from DELETE /inventory-balances/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const inventoryBalancesDelete = actionClientWithMeta
  .metadata({
    name: "inventory-balances-delete",
    requiresAuth: false
  })
  .schema(InventoryBalancesDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(InventoryBalancesDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.inventoryBalances.inventoryBalancesDelete({params: validatedParams,
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
      revalidateTag('inventory-balances')
      console.log('Revalidated tag: inventory-balances')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('inventoryBalancesDelete', true, duration, {
        method: 'DELETE',
        path: '/inventory-balances/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('inventoryBalancesDelete', false, duration, {
        method: 'DELETE',
        path: '/inventory-balances/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/inventory-balances/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })