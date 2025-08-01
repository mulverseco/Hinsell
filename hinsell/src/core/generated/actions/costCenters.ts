import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  CostCentersListResponseSchema,
  CostCentersCreateRequestSchema,
  CostCentersCreateResponseSchema,
  CostCentersReadParamsSchema,
  CostCentersReadResponseSchema,
  CostCentersUpdateRequestSchema,
  CostCentersUpdateParamsSchema,
  CostCentersUpdateResponseSchema,
  CostCentersPartialUpdateRequestSchema,
  CostCentersPartialUpdateParamsSchema,
  CostCentersPartialUpdateResponseSchema,
  CostCentersDeleteParamsSchema,
  CostCentersDeleteResponseSchema
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
 * ViewSet for CostCenter model.
 * @generated from GET /cost-centers/
 * Features: React cache, input validation, error handling
 */
export const costCentersList = cache(
  actionClientWithMeta
    .metadata({
      name: "cost-centers-list",
      requiresAuth: false
    })
    .schema(z.void())
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {

        // Execute API call with enhanced error handling
        const response = await apiClient.costCenters.costCentersList({
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('costCentersList', true, duration, {
          method: 'GET',
          path: '/cost-centers/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('costCentersList', false, duration, {
          method: 'GET',
          path: '/cost-centers/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/cost-centers/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for CostCenter model.
 * @generated from POST /cost-centers/
 * Features: Input validation, revalidation, error handling
 */
export const costCentersCreate = actionClientWithMeta
  .metadata({
    name: "cost-centers-create",
    requiresAuth: false
  })
  .schema(CostCentersCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(CostCentersCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.costCenters.costCentersCreate({        body: validatedBody,
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
      revalidateTag('cost-centers')
      console.log('Revalidated tag: cost-centers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('costCentersCreate', true, duration, {
        method: 'POST',
        path: '/cost-centers/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('costCentersCreate', false, duration, {
        method: 'POST',
        path: '/cost-centers/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/cost-centers/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for CostCenter model.
 * @generated from GET /cost-centers/{id}/
 * Features: React cache, input validation, error handling
 */
export const costCentersRead = cache(
  actionClientWithMeta
    .metadata({
      name: "cost-centers-read",
      requiresAuth: false
    })
    .schema(CostCentersReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(CostCentersReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.costCenters.costCentersRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('costCentersRead', true, duration, {
          method: 'GET',
          path: '/cost-centers/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('costCentersRead', false, duration, {
          method: 'GET',
          path: '/cost-centers/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/cost-centers/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for CostCenter model.
 * @generated from PUT /cost-centers/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const costCentersUpdate = actionClientWithMeta
  .metadata({
    name: "cost-centers-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: CostCentersUpdateRequestSchema,
        params: CostCentersUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: CostCentersUpdateRequestSchema,
        params: CostCentersUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.costCenters.costCentersUpdate({params: validatedParams,
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
      revalidateTag('cost-centers')
      console.log('Revalidated tag: cost-centers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('costCentersUpdate', true, duration, {
        method: 'PUT',
        path: '/cost-centers/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('costCentersUpdate', false, duration, {
        method: 'PUT',
        path: '/cost-centers/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/cost-centers/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for CostCenter model.
 * @generated from PATCH /cost-centers/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const costCentersPartialUpdate = actionClientWithMeta
  .metadata({
    name: "cost-centers-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: CostCentersPartialUpdateRequestSchema,
        params: CostCentersPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: CostCentersPartialUpdateRequestSchema,
        params: CostCentersPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.costCenters.costCentersPartialUpdate({params: validatedParams,
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
      revalidateTag('cost-centers')
      console.log('Revalidated tag: cost-centers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('costCentersPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/cost-centers/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('costCentersPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/cost-centers/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/cost-centers/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for CostCenter model.
 * @generated from DELETE /cost-centers/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const costCentersDelete = actionClientWithMeta
  .metadata({
    name: "cost-centers-delete",
    requiresAuth: false
  })
  .schema(CostCentersDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(CostCentersDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.costCenters.costCentersDelete({params: validatedParams,
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
      revalidateTag('cost-centers')
      console.log('Revalidated tag: cost-centers')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('costCentersDelete', true, duration, {
        method: 'DELETE',
        path: '/cost-centers/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('costCentersDelete', false, duration, {
        method: 'DELETE',
        path: '/cost-centers/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/cost-centers/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })