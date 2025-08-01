import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  ReportsListParamsSchema,
  ReportsListResponseSchema,
  ReportsCreateRequestSchema,
  ReportsCreateResponseSchema,
  ReportsAvailableModelsParamsSchema,
  ReportsAvailableModelsResponseSchema,
  ReportsValidateQueryRequestSchema,
  ReportsValidateQueryResponseSchema,
  ReportsReadParamsSchema,
  ReportsReadResponseSchema,
  ReportsUpdateRequestSchema,
  ReportsUpdateParamsSchema,
  ReportsUpdateResponseSchema,
  ReportsPartialUpdateRequestSchema,
  ReportsPartialUpdateParamsSchema,
  ReportsPartialUpdateResponseSchema,
  ReportsDeleteParamsSchema,
  ReportsDeleteResponseSchema,
  ReportsExecuteRequestSchema,
  ReportsExecuteParamsSchema,
  ReportsExecuteResponseSchema,
  ReportsPreviewParamsSchema,
  ReportsPreviewResponseSchema
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
 * GET /reports/
 * @generated from GET /reports/
 * Features: React cache, input validation, error handling
 */
export const reportsList = cache(
  actionClientWithMeta
    .metadata({
      name: "reports-list",
      requiresAuth: false
    })
    .schema(ReportsListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ReportsListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.reports.reportsList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('reportsList', true, duration, {
          method: 'GET',
          path: '/reports/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('reportsList', false, duration, {
          method: 'GET',
          path: '/reports/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/reports/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * POST /reports/
 * @generated from POST /reports/
 * Features: Input validation, revalidation, error handling
 */
export const reportsCreate = actionClientWithMeta
  .metadata({
    name: "reports-create",
    requiresAuth: false
  })
  .schema(ReportsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(ReportsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.reports.reportsCreate({        body: validatedBody,
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
      revalidateTag('reports')
      console.log('Revalidated tag: reports')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('reportsCreate', true, duration, {
        method: 'POST',
        path: '/reports/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('reportsCreate', false, duration, {
        method: 'POST',
        path: '/reports/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/reports/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Get list of available models for reporting
 * @generated from GET /reports/available_models/
 * Features: React cache, input validation, error handling
 */
export const reportsAvailableModels = cache(
  actionClientWithMeta
    .metadata({
      name: "reports-available-models",
      requiresAuth: false
    })
    .schema(ReportsAvailableModelsParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ReportsAvailableModelsParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.reports.reportsAvailableModels({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('reportsAvailableModels', true, duration, {
          method: 'GET',
          path: '/reports/available_models/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('reportsAvailableModels', false, duration, {
          method: 'GET',
          path: '/reports/available_models/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/reports/available_models/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * Validate a query configuration
 * @generated from POST /reports/validate_query/
 * Features: Input validation, revalidation, error handling
 */
export const reportsValidateQuery = actionClientWithMeta
  .metadata({
    name: "reports-validate-query",
    requiresAuth: false
  })
  .schema(ReportsValidateQueryRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(ReportsValidateQueryRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.reports.reportsValidateQuery({        body: validatedBody,
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
      revalidateTag('reports')
      console.log('Revalidated tag: reports')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('reportsValidateQuery', true, duration, {
        method: 'POST',
        path: '/reports/validate_query/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('reportsValidateQuery', false, duration, {
        method: 'POST',
        path: '/reports/validate_query/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/reports/validate_query/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /reports/{id}/
 * @generated from GET /reports/{id}/
 * Features: React cache, input validation, error handling
 */
export const reportsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "reports-read",
      requiresAuth: false
    })
    .schema(ReportsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ReportsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.reports.reportsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('reportsRead', true, duration, {
          method: 'GET',
          path: '/reports/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('reportsRead', false, duration, {
          method: 'GET',
          path: '/reports/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/reports/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * PUT /reports/{id}/
 * @generated from PUT /reports/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const reportsUpdate = actionClientWithMeta
  .metadata({
    name: "reports-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ReportsUpdateRequestSchema,
        params: ReportsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ReportsUpdateRequestSchema,
        params: ReportsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.reports.reportsUpdate({params: validatedParams,
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
      revalidateTag('reports')
      console.log('Revalidated tag: reports')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('reportsUpdate', true, duration, {
        method: 'PUT',
        path: '/reports/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('reportsUpdate', false, duration, {
        method: 'PUT',
        path: '/reports/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/reports/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * PATCH /reports/{id}/
 * @generated from PATCH /reports/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const reportsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "reports-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ReportsPartialUpdateRequestSchema,
        params: ReportsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ReportsPartialUpdateRequestSchema,
        params: ReportsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.reports.reportsPartialUpdate({params: validatedParams,
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
      revalidateTag('reports')
      console.log('Revalidated tag: reports')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('reportsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/reports/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('reportsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/reports/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/reports/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * DELETE /reports/{id}/
 * @generated from DELETE /reports/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const reportsDelete = actionClientWithMeta
  .metadata({
    name: "reports-delete",
    requiresAuth: false
  })
  .schema(ReportsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ReportsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.reports.reportsDelete({params: validatedParams,
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
      revalidateTag('reports')
      console.log('Revalidated tag: reports')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('reportsDelete', true, duration, {
        method: 'DELETE',
        path: '/reports/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('reportsDelete', false, duration, {
        method: 'DELETE',
        path: '/reports/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/reports/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Execute a report and return JSON data
 * @generated from POST /reports/{id}/execute/
 * Features: Input validation, revalidation, error handling
 */
export const reportsExecute = actionClientWithMeta
  .metadata({
    name: "reports-execute",
    requiresAuth: false
  })
  .schema(z.object({
        body: ReportsExecuteRequestSchema,
        params: ReportsExecuteParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ReportsExecuteRequestSchema,
        params: ReportsExecuteParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.reports.reportsExecute({params: validatedParams,
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
      revalidateTag('reports')
      console.log('Revalidated tag: reports')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('reportsExecute', true, duration, {
        method: 'POST',
        path: '/reports/{id}/execute/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('reportsExecute', false, duration, {
        method: 'POST',
        path: '/reports/{id}/execute/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/reports/{id}/execute/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Preview report structure without executing
 * @generated from GET /reports/{id}/preview/
 * Features: React cache, input validation, error handling
 */
export const reportsPreview = cache(
  actionClientWithMeta
    .metadata({
      name: "reports-preview",
      requiresAuth: false
    })
    .schema(ReportsPreviewParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ReportsPreviewParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.reports.reportsPreview({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('reportsPreview', true, duration, {
          method: 'GET',
          path: '/reports/{id}/preview/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('reportsPreview', false, duration, {
          method: 'GET',
          path: '/reports/{id}/preview/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/reports/{id}/preview/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)