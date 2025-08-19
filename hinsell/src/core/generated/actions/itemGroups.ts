"use server";
// import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  ItemGroupsListParamsSchema,
  ItemGroupsListResponseSchema,
  ItemGroupsCreateRequestSchema,
  ItemGroupsCreateResponseSchema,
  ItemGroupsReadParamsSchema,
  ItemGroupsReadResponseSchema,
  ItemGroupsUpdateRequestSchema,
  ItemGroupsUpdateParamsSchema,
  ItemGroupsUpdateResponseSchema,
  ItemGroupsPartialUpdateRequestSchema,
  ItemGroupsPartialUpdateParamsSchema,
  ItemGroupsPartialUpdateResponseSchema,
  ItemGroupsDeleteParamsSchema,
  ItemGroupsDeleteResponseSchema
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
 * ViewSet for ItemGroup model.
 * @generated from GET /item-groups/
 * Features: React cache, input validation, error handling
 */
export const itemGroupsList = cache(
  actionClientWithMeta
    .metadata({
      name: "item-groups-list",
      requiresAuth: false
    })
    .schema(ItemGroupsListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ItemGroupsListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.itemGroups.itemGroupsList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('itemGroupsList', true, duration, {
          method: 'GET',
          path: '/item-groups/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('itemGroupsList', false, duration, {
          method: 'GET',
          path: '/item-groups/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/item-groups/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for ItemGroup model.
 * @generated from POST /item-groups/
 * Features: Input validation, revalidation, error handling
 */
export const itemGroupsCreate = actionClientWithMeta
  .metadata({
    name: "item-groups-create",
    requiresAuth: false
  })
  .schema(ItemGroupsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(ItemGroupsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.itemGroups.itemGroupsCreate({        body: validatedBody,
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
      revalidateTag('item-groups')
      console.log('Revalidated tag: item-groups')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemGroupsCreate', true, duration, {
        method: 'POST',
        path: '/item-groups/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemGroupsCreate', false, duration, {
        method: 'POST',
        path: '/item-groups/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/item-groups/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for ItemGroup model.
 * @generated from GET /item-groups/{id}/
 * Features: React cache, input validation, error handling
 */
export const itemGroupsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "item-groups-read",
      requiresAuth: false
    })
    .schema(ItemGroupsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ItemGroupsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.itemGroups.itemGroupsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('itemGroupsRead', true, duration, {
          method: 'GET',
          path: '/item-groups/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('itemGroupsRead', false, duration, {
          method: 'GET',
          path: '/item-groups/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/item-groups/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for ItemGroup model.
 * @generated from PUT /item-groups/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const itemGroupsUpdate = actionClientWithMeta
  .metadata({
    name: "item-groups-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ItemGroupsUpdateRequestSchema,
        params: ItemGroupsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ItemGroupsUpdateRequestSchema,
        params: ItemGroupsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.itemGroups.itemGroupsUpdate({params: validatedParams,
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
      revalidateTag('item-groups')
      console.log('Revalidated tag: item-groups')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemGroupsUpdate', true, duration, {
        method: 'PUT',
        path: '/item-groups/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemGroupsUpdate', false, duration, {
        method: 'PUT',
        path: '/item-groups/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/item-groups/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for ItemGroup model.
 * @generated from PATCH /item-groups/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const itemGroupsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "item-groups-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ItemGroupsPartialUpdateRequestSchema,
        params: ItemGroupsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ItemGroupsPartialUpdateRequestSchema,
        params: ItemGroupsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.itemGroups.itemGroupsPartialUpdate({params: validatedParams,
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
      revalidateTag('item-groups')
      console.log('Revalidated tag: item-groups')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemGroupsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/item-groups/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemGroupsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/item-groups/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/item-groups/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for ItemGroup model.
 * @generated from DELETE /item-groups/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const itemGroupsDelete = actionClientWithMeta
  .metadata({
    name: "item-groups-delete",
    requiresAuth: false
  })
  .schema(ItemGroupsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ItemGroupsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.itemGroups.itemGroupsDelete({params: validatedParams,
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
      revalidateTag('item-groups')
      console.log('Revalidated tag: item-groups')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('itemGroupsDelete', true, duration, {
        method: 'DELETE',
        path: '/item-groups/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('itemGroupsDelete', false, duration, {
        method: 'DELETE',
        path: '/item-groups/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/item-groups/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })