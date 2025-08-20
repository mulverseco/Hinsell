'use server'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  LicenseTypesListParamsSchema,
  LicenseTypesListResponseSchema,
  LicenseTypesCreateRequestSchema,
  LicenseTypesCreateResponseSchema,
  LicenseTypesReadParamsSchema,
  LicenseTypesReadResponseSchema,
  LicenseTypesUpdateRequestSchema,
  LicenseTypesUpdateParamsSchema,
  LicenseTypesUpdateResponseSchema,
  LicenseTypesPartialUpdateRequestSchema,
  LicenseTypesPartialUpdateParamsSchema,
  LicenseTypesPartialUpdateResponseSchema,
  LicenseTypesDeleteParamsSchema,
  LicenseTypesDeleteResponseSchema
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
 * GET /license-types/
 * @generated from GET /license-types/
 * Features: React cache, input validation, error handling
 */
export const licenseTypesList = cache(
  actionClientWithMeta
    .metadata({
      name: "license-types-list",
      requiresAuth: false
    })
    .schema(LicenseTypesListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(LicenseTypesListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.licenseTypes.licenseTypesList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: LicenseTypesListResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('licenseTypesList', true, duration, {
          method: 'GET',
          path: '/license-types/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('licenseTypesList', false, duration, {
          method: 'GET',
          path: '/license-types/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/license-types/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * POST /license-types/
 * @generated from POST /license-types/
 * Features: Input validation, revalidation, error handling
 */
export const licenseTypesCreate = actionClientWithMeta
  .metadata({
    name: "license-types-create",
    requiresAuth: false
  })
  .schema(LicenseTypesCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(LicenseTypesCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.licenseTypes.licenseTypesCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: LicenseTypesCreateResponseSchema
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
      revalidateTag('license-types')
      console.log('Revalidated tag: license-types')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('licenseTypesCreate', true, duration, {
        method: 'POST',
        path: '/license-types/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('licenseTypesCreate', false, duration, {
        method: 'POST',
        path: '/license-types/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/license-types/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /license-types/{id}/
 * @generated from GET /license-types/{id}/
 * Features: React cache, input validation, error handling
 */
export const licenseTypesRead = cache(
  actionClientWithMeta
    .metadata({
      name: "license-types-read",
      requiresAuth: false
    })
    .schema(LicenseTypesReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(LicenseTypesReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.licenseTypes.licenseTypesRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: LicenseTypesReadResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('licenseTypesRead', true, duration, {
          method: 'GET',
          path: '/license-types/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('licenseTypesRead', false, duration, {
          method: 'GET',
          path: '/license-types/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/license-types/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * PUT /license-types/{id}/
 * @generated from PUT /license-types/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const licenseTypesUpdate = actionClientWithMeta
  .metadata({
    name: "license-types-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: LicenseTypesUpdateRequestSchema,
        params: LicenseTypesUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: LicenseTypesUpdateRequestSchema,
        params: LicenseTypesUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.licenseTypes.licenseTypesUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: LicenseTypesUpdateResponseSchema
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
      revalidateTag('license-types')
      console.log('Revalidated tag: license-types')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('licenseTypesUpdate', true, duration, {
        method: 'PUT',
        path: '/license-types/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('licenseTypesUpdate', false, duration, {
        method: 'PUT',
        path: '/license-types/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/license-types/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * PATCH /license-types/{id}/
 * @generated from PATCH /license-types/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const licenseTypesPartialUpdate = actionClientWithMeta
  .metadata({
    name: "license-types-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: LicenseTypesPartialUpdateRequestSchema,
        params: LicenseTypesPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: LicenseTypesPartialUpdateRequestSchema,
        params: LicenseTypesPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.licenseTypes.licenseTypesPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: LicenseTypesPartialUpdateResponseSchema
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
      revalidateTag('license-types')
      console.log('Revalidated tag: license-types')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('licenseTypesPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/license-types/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('licenseTypesPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/license-types/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/license-types/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * DELETE /license-types/{id}/
 * @generated from DELETE /license-types/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const licenseTypesDelete = actionClientWithMeta
  .metadata({
    name: "license-types-delete",
    requiresAuth: false
  })
  .schema(LicenseTypesDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(LicenseTypesDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.licenseTypes.licenseTypesDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: LicenseTypesDeleteResponseSchema
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
      revalidateTag('license-types')
      console.log('Revalidated tag: license-types')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('licenseTypesDelete', true, duration, {
        method: 'DELETE',
        path: '/license-types/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('licenseTypesDelete', false, duration, {
        method: 'DELETE',
        path: '/license-types/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/license-types/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })