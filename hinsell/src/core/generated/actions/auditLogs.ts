import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  AuditLogsListParamsSchema,
  AuditLogsListResponseSchema,
  AuditLogsCreateRequestSchema,
  AuditLogsCreateResponseSchema,
  AuditLogsReadParamsSchema,
  AuditLogsReadResponseSchema,
  AuditLogsUpdateRequestSchema,
  AuditLogsUpdateParamsSchema,
  AuditLogsUpdateResponseSchema,
  AuditLogsPartialUpdateRequestSchema,
  AuditLogsPartialUpdateParamsSchema,
  AuditLogsPartialUpdateResponseSchema,
  AuditLogsDeleteParamsSchema,
  AuditLogsDeleteResponseSchema
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
 * ViewSet for viewing AuditLog instances (admin only).
 * @generated from GET /audit-logs/
 * Features: React cache, input validation, error handling
 */
export const auditLogsList = cache(
  actionClientWithMeta
    .metadata({
      name: "audit-logs-list",
      requiresAuth: false
    })
    .schema(AuditLogsListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(AuditLogsListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.auditLogs.auditLogsList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('auditLogsList', true, duration, {
          method: 'GET',
          path: '/audit-logs/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('auditLogsList', false, duration, {
          method: 'GET',
          path: '/audit-logs/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/audit-logs/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for viewing AuditLog instances (admin only).
 * @generated from POST /audit-logs/
 * Features: Input validation, revalidation, error handling
 */
export const auditLogsCreate = actionClientWithMeta
  .metadata({
    name: "audit-logs-create",
    requiresAuth: false
  })
  .schema(AuditLogsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(AuditLogsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.auditLogs.auditLogsCreate({        body: validatedBody,
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
      revalidateTag('audit-logs')
      console.log('Revalidated tag: audit-logs')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('auditLogsCreate', true, duration, {
        method: 'POST',
        path: '/audit-logs/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('auditLogsCreate', false, duration, {
        method: 'POST',
        path: '/audit-logs/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/audit-logs/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for viewing AuditLog instances (admin only).
 * @generated from GET /audit-logs/{id}/
 * Features: React cache, input validation, error handling
 */
export const auditLogsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "audit-logs-read",
      requiresAuth: false
    })
    .schema(AuditLogsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(AuditLogsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.auditLogs.auditLogsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('auditLogsRead', true, duration, {
          method: 'GET',
          path: '/audit-logs/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('auditLogsRead', false, duration, {
          method: 'GET',
          path: '/audit-logs/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/audit-logs/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * ViewSet for viewing AuditLog instances (admin only).
 * @generated from PUT /audit-logs/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const auditLogsUpdate = actionClientWithMeta
  .metadata({
    name: "audit-logs-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: AuditLogsUpdateRequestSchema,
        params: AuditLogsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: AuditLogsUpdateRequestSchema,
        params: AuditLogsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.auditLogs.auditLogsUpdate({params: validatedParams,
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
      revalidateTag('audit-logs')
      console.log('Revalidated tag: audit-logs')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('auditLogsUpdate', true, duration, {
        method: 'PUT',
        path: '/audit-logs/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('auditLogsUpdate', false, duration, {
        method: 'PUT',
        path: '/audit-logs/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/audit-logs/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for viewing AuditLog instances (admin only).
 * @generated from PATCH /audit-logs/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const auditLogsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "audit-logs-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: AuditLogsPartialUpdateRequestSchema,
        params: AuditLogsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: AuditLogsPartialUpdateRequestSchema,
        params: AuditLogsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.auditLogs.auditLogsPartialUpdate({params: validatedParams,
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
      revalidateTag('audit-logs')
      console.log('Revalidated tag: audit-logs')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('auditLogsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/audit-logs/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('auditLogsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/audit-logs/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/audit-logs/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * ViewSet for viewing AuditLog instances (admin only).
 * @generated from DELETE /audit-logs/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const auditLogsDelete = actionClientWithMeta
  .metadata({
    name: "audit-logs-delete",
    requiresAuth: false
  })
  .schema(AuditLogsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(AuditLogsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.auditLogs.auditLogsDelete({params: validatedParams,
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
      revalidateTag('audit-logs')
      console.log('Revalidated tag: audit-logs')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('auditLogsDelete', true, duration, {
        method: 'DELETE',
        path: '/audit-logs/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('auditLogsDelete', false, duration, {
        method: 'DELETE',
        path: '/audit-logs/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/audit-logs/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })