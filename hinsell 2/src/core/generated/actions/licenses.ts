'use server'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  LicensesListParamsSchema,
  LicensesListResponseSchema,
  LicensesCreateRequestSchema,
  LicensesCreateResponseSchema,
  LicensesReadParamsSchema,
  LicensesReadResponseSchema,
  LicensesUpdateRequestSchema,
  LicensesUpdateParamsSchema,
  LicensesUpdateResponseSchema,
  LicensesPartialUpdateRequestSchema,
  LicensesPartialUpdateParamsSchema,
  LicensesPartialUpdateResponseSchema,
  LicensesDeleteParamsSchema,
  LicensesDeleteResponseSchema,
  LicensesValidateRequestSchema,
  LicensesValidateParamsSchema,
  LicensesValidateResponseSchema
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
 * GET /licenses/
 * @generated from GET /licenses/
 * Features: React cache, input validation, error handling
 */
export const licensesList = cache(
  actionClientWithMeta
    .metadata({
      name: "licenses-list",
      requiresAuth: false
    })
    .schema(LicensesListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(LicensesListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.licenses.licensesList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: LicensesListResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('licensesList', true, duration, {
          method: 'GET',
          path: '/licenses/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('licensesList', false, duration, {
          method: 'GET',
          path: '/licenses/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/licenses/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * POST /licenses/
 * @generated from POST /licenses/
 * Features: Input validation, revalidation, error handling
 */
export const licensesCreate = actionClientWithMeta
  .metadata({
    name: "licenses-create",
    requiresAuth: false
  })
  .schema(LicensesCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(LicensesCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.licenses.licensesCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: LicensesCreateResponseSchema
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
      revalidateTag('licenses')
      console.log('Revalidated tag: licenses')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('licensesCreate', true, duration, {
        method: 'POST',
        path: '/licenses/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('licensesCreate', false, duration, {
        method: 'POST',
        path: '/licenses/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/licenses/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /licenses/{id}/
 * @generated from GET /licenses/{id}/
 * Features: React cache, input validation, error handling
 */
export const licensesRead = cache(
  actionClientWithMeta
    .metadata({
      name: "licenses-read",
      requiresAuth: false
    })
    .schema(LicensesReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(LicensesReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.licenses.licensesRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: LicensesReadResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('licensesRead', true, duration, {
          method: 'GET',
          path: '/licenses/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('licensesRead', false, duration, {
          method: 'GET',
          path: '/licenses/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/licenses/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * PUT /licenses/{id}/
 * @generated from PUT /licenses/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const licensesUpdate = actionClientWithMeta
  .metadata({
    name: "licenses-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: LicensesUpdateRequestSchema,
        params: LicensesUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: LicensesUpdateRequestSchema,
        params: LicensesUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.licenses.licensesUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: LicensesUpdateResponseSchema
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
      revalidateTag('licenses')
      console.log('Revalidated tag: licenses')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('licensesUpdate', true, duration, {
        method: 'PUT',
        path: '/licenses/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('licensesUpdate', false, duration, {
        method: 'PUT',
        path: '/licenses/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/licenses/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * PATCH /licenses/{id}/
 * @generated from PATCH /licenses/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const licensesPartialUpdate = actionClientWithMeta
  .metadata({
    name: "licenses-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: LicensesPartialUpdateRequestSchema,
        params: LicensesPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: LicensesPartialUpdateRequestSchema,
        params: LicensesPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.licenses.licensesPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: LicensesPartialUpdateResponseSchema
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
      revalidateTag('licenses')
      console.log('Revalidated tag: licenses')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('licensesPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/licenses/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('licensesPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/licenses/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/licenses/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * DELETE /licenses/{id}/
 * @generated from DELETE /licenses/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const licensesDelete = actionClientWithMeta
  .metadata({
    name: "licenses-delete",
    requiresAuth: false
  })
  .schema(LicensesDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(LicensesDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.licenses.licensesDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: LicensesDeleteResponseSchema
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
      revalidateTag('licenses')
      console.log('Revalidated tag: licenses')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('licensesDelete', true, duration, {
        method: 'DELETE',
        path: '/licenses/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('licensesDelete', false, duration, {
        method: 'DELETE',
        path: '/licenses/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/licenses/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * POST /licenses/{id}/validate/
 * @generated from POST /licenses/{id}/validate/
 * Features: Input validation, revalidation, error handling
 */
export const licensesValidate = actionClientWithMeta
  .metadata({
    name: "licenses-validate",
    requiresAuth: false
  })
  .schema(z.object({
        body: LicensesValidateRequestSchema,
        params: LicensesValidateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: LicensesValidateRequestSchema,
        params: LicensesValidateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.licenses.licensesValidate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: LicensesValidateResponseSchema
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
      revalidateTag('licenses')
      console.log('Revalidated tag: licenses')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('licensesValidate', true, duration, {
        method: 'POST',
        path: '/licenses/{id}/validate/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('licensesValidate', false, duration, {
        method: 'POST',
        path: '/licenses/{id}/validate/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/licenses/{id}/validate/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })