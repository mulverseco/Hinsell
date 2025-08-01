import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  ProfilesListParamsSchema,
  ProfilesListResponseSchema,
  ProfilesCreateRequestSchema,
  ProfilesCreateResponseSchema,
  ProfilesReadParamsSchema,
  ProfilesReadResponseSchema,
  ProfilesUpdateRequestSchema,
  ProfilesUpdateParamsSchema,
  ProfilesUpdateResponseSchema,
  ProfilesPartialUpdateRequestSchema,
  ProfilesPartialUpdateParamsSchema,
  ProfilesPartialUpdateResponseSchema,
  ProfilesDeleteParamsSchema,
  ProfilesDeleteResponseSchema,
  ProfilesWithdrawConsentRequestSchema,
  ProfilesWithdrawConsentParamsSchema,
  ProfilesWithdrawConsentResponseSchema
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
 * GET /profiles/
 * @generated from GET /profiles/
 * Features: React cache, input validation, error handling
 */
export const profilesList = cache(
  actionClientWithMeta
    .metadata({
      name: "profiles-list",
      requiresAuth: false
    })
    .schema(ProfilesListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ProfilesListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.profiles.profilesList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('profilesList', true, duration, {
          method: 'GET',
          path: '/profiles/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('profilesList', false, duration, {
          method: 'GET',
          path: '/profiles/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/profiles/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * POST /profiles/
 * @generated from POST /profiles/
 * Features: Input validation, revalidation, error handling
 */
export const profilesCreate = actionClientWithMeta
  .metadata({
    name: "profiles-create",
    requiresAuth: false
  })
  .schema(ProfilesCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(ProfilesCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.profiles.profilesCreate({        body: validatedBody,
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
      revalidateTag('profiles')
      console.log('Revalidated tag: profiles')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('profilesCreate', true, duration, {
        method: 'POST',
        path: '/profiles/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('profilesCreate', false, duration, {
        method: 'POST',
        path: '/profiles/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/profiles/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /profiles/{id}/
 * @generated from GET /profiles/{id}/
 * Features: React cache, input validation, error handling
 */
export const profilesRead = cache(
  actionClientWithMeta
    .metadata({
      name: "profiles-read",
      requiresAuth: false
    })
    .schema(ProfilesReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ProfilesReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.profiles.profilesRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('profilesRead', true, duration, {
          method: 'GET',
          path: '/profiles/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('profilesRead', false, duration, {
          method: 'GET',
          path: '/profiles/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/profiles/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * PUT /profiles/{id}/
 * @generated from PUT /profiles/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const profilesUpdate = actionClientWithMeta
  .metadata({
    name: "profiles-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ProfilesUpdateRequestSchema,
        params: ProfilesUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ProfilesUpdateRequestSchema,
        params: ProfilesUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.profiles.profilesUpdate({params: validatedParams,
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
      revalidateTag('profiles')
      console.log('Revalidated tag: profiles')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('profilesUpdate', true, duration, {
        method: 'PUT',
        path: '/profiles/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('profilesUpdate', false, duration, {
        method: 'PUT',
        path: '/profiles/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/profiles/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * PATCH /profiles/{id}/
 * @generated from PATCH /profiles/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const profilesPartialUpdate = actionClientWithMeta
  .metadata({
    name: "profiles-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: ProfilesPartialUpdateRequestSchema,
        params: ProfilesPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ProfilesPartialUpdateRequestSchema,
        params: ProfilesPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.profiles.profilesPartialUpdate({params: validatedParams,
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
      revalidateTag('profiles')
      console.log('Revalidated tag: profiles')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('profilesPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/profiles/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('profilesPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/profiles/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/profiles/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * DELETE /profiles/{id}/
 * @generated from DELETE /profiles/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const profilesDelete = actionClientWithMeta
  .metadata({
    name: "profiles-delete",
    requiresAuth: false
  })
  .schema(ProfilesDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(ProfilesDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.profiles.profilesDelete({params: validatedParams,
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
      revalidateTag('profiles')
      console.log('Revalidated tag: profiles')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('profilesDelete', true, duration, {
        method: 'DELETE',
        path: '/profiles/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('profilesDelete', false, duration, {
        method: 'DELETE',
        path: '/profiles/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/profiles/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * POST /profiles/{id}/withdraw_consent/
 * @generated from POST /profiles/{id}/withdraw_consent/
 * Features: Input validation, revalidation, error handling
 */
export const profilesWithdrawConsent = actionClientWithMeta
  .metadata({
    name: "profiles-withdraw-consent",
    requiresAuth: false
  })
  .schema(z.object({
        body: ProfilesWithdrawConsentRequestSchema,
        params: ProfilesWithdrawConsentParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: ProfilesWithdrawConsentRequestSchema,
        params: ProfilesWithdrawConsentParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.profiles.profilesWithdrawConsent({params: validatedParams,
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
      revalidateTag('profiles')
      console.log('Revalidated tag: profiles')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('profilesWithdrawConsent', true, duration, {
        method: 'POST',
        path: '/profiles/{id}/withdraw_consent/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('profilesWithdrawConsent', false, duration, {
        method: 'POST',
        path: '/profiles/{id}/withdraw_consent/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/profiles/{id}/withdraw_consent/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })