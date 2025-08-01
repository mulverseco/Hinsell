import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  StoreGroupsListParamsSchema,
  StoreGroupsListResponseSchema,
  StoreGroupsCreateRequestSchema,
  StoreGroupsCreateResponseSchema,
  StoreGroupsReadParamsSchema,
  StoreGroupsReadResponseSchema,
  StoreGroupsUpdateRequestSchema,
  StoreGroupsUpdateParamsSchema,
  StoreGroupsUpdateResponseSchema,
  StoreGroupsPartialUpdateRequestSchema,
  StoreGroupsPartialUpdateParamsSchema,
  StoreGroupsPartialUpdateResponseSchema,
  StoreGroupsDeleteParamsSchema,
  StoreGroupsDeleteResponseSchema
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
 * ViewSet for StoreGroup model.
 * @generated from GET /store-groups/
 * Features: React cache, input validation, error handling
 */
export const storeGroupsList = cache(
  actionClientWithMeta
    .metadata({
      name: "store-groups-list",
      requiresAuth: false
    })
    .schema(StoreGroupsListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(StoreGroupsListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.storeGroups.storeGroupsList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('storeGroupsList', true, duration, {
          method: 'GET',
          path: '/store-groups/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('storeGroupsList', false, duration, {
          method: 'GET',
          path: '/store-groups/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/store-groups/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for StoreGroup model.
 * @generated from POST /store-groups/
 * Features: Input validation, revalidation, error handling
 */
export const storeGroupsCreate = actionClientWithMeta
  .metadata({
    name: "store-groups-create",
    requiresAuth: false
  })
  .schema(StoreGroupsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(StoreGroupsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.storeGroups.storeGroupsCreate({        body: validatedBody,
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
      revalidateTag('store-groups')
      console.log('Revalidated tag: store-groups')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('storeGroupsCreate', true, duration, {
        method: 'POST',
        path: '/store-groups/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('storeGroupsCreate', false, duration, {
        method: 'POST',
        path: '/store-groups/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/store-groups/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for StoreGroup model.
 * @generated from GET /store-groups/{id}/
 * Features: React cache, input validation, error handling
 */
export const storeGroupsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "store-groups-read",
      requiresAuth: false
    })
    .schema(StoreGroupsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(StoreGroupsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.storeGroups.storeGroupsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('storeGroupsRead', true, duration, {
          method: 'GET',
          path: '/store-groups/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('storeGroupsRead', false, duration, {
          method: 'GET',
          path: '/store-groups/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/store-groups/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for StoreGroup model.
 * @generated from PUT /store-groups/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const storeGroupsUpdate = actionClientWithMeta
  .metadata({
    name: "store-groups-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: StoreGroupsUpdateRequestSchema,
        params: StoreGroupsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: StoreGroupsUpdateRequestSchema,
        params: StoreGroupsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.storeGroups.storeGroupsUpdate({params: validatedParams,
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
      revalidateTag('store-groups')
      console.log('Revalidated tag: store-groups')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('storeGroupsUpdate', true, duration, {
        method: 'PUT',
        path: '/store-groups/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('storeGroupsUpdate', false, duration, {
        method: 'PUT',
        path: '/store-groups/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/store-groups/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for StoreGroup model.
 * @generated from PATCH /store-groups/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const storeGroupsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "store-groups-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: StoreGroupsPartialUpdateRequestSchema,
        params: StoreGroupsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: StoreGroupsPartialUpdateRequestSchema,
        params: StoreGroupsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.storeGroups.storeGroupsPartialUpdate({params: validatedParams,
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
      revalidateTag('store-groups')
      console.log('Revalidated tag: store-groups')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('storeGroupsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/store-groups/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('storeGroupsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/store-groups/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/store-groups/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for StoreGroup model.
 * @generated from DELETE /store-groups/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const storeGroupsDelete = actionClientWithMeta
  .metadata({
    name: "store-groups-delete",
    requiresAuth: false
  })
  .schema(StoreGroupsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(StoreGroupsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.storeGroups.storeGroupsDelete({params: validatedParams,
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
      revalidateTag('store-groups')
      console.log('Revalidated tag: store-groups')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('storeGroupsDelete', true, duration, {
        method: 'DELETE',
        path: '/store-groups/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('storeGroupsDelete', false, duration, {
        method: 'DELETE',
        path: '/store-groups/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/store-groups/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })