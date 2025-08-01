import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  AuthJwtCreateCreateRequestSchema,
  AuthJwtCreateCreateResponseSchema,
  AuthJwtRefreshCreateRequestSchema,
  AuthJwtRefreshCreateResponseSchema,
  AuthJwtVerifyCreateRequestSchema,
  AuthJwtVerifyCreateResponseSchema,
  AuthSocialOReadParamsSchema,
  AuthSocialOReadResponseSchema,
  AuthSocialOCreateRequestSchema,
  AuthSocialOCreateParamsSchema,
  AuthSocialOCreateResponseSchema,
  AuthUsersListResponseSchema,
  AuthUsersCreateResponseSchema,
  AuthUsersActivationRequestSchema,
  AuthUsersActivationResponseSchema,
  AuthUsersMeReadResponseSchema,
  AuthUsersMeUpdateRequestSchema,
  AuthUsersMeUpdateResponseSchema,
  AuthUsersMePartialUpdateRequestSchema,
  AuthUsersMePartialUpdateResponseSchema,
  AuthUsersMeDeleteResponseSchema,
  AuthUsersResendActivationRequestSchema,
  AuthUsersResendActivationResponseSchema,
  AuthUsersResetUsernameRequestSchema,
  AuthUsersResetUsernameResponseSchema,
  AuthUsersResetUsernameConfirmRequestSchema,
  AuthUsersResetUsernameConfirmResponseSchema,
  AuthUsersResetPasswordRequestSchema,
  AuthUsersResetPasswordResponseSchema,
  AuthUsersResetPasswordConfirmRequestSchema,
  AuthUsersResetPasswordConfirmResponseSchema,
  AuthUsersSetUsernameRequestSchema,
  AuthUsersSetUsernameResponseSchema,
  AuthUsersSetPasswordRequestSchema,
  AuthUsersSetPasswordResponseSchema,
  AuthUsersReadParamsSchema,
  AuthUsersReadResponseSchema,
  AuthUsersUpdateRequestSchema,
  AuthUsersUpdateParamsSchema,
  AuthUsersUpdateResponseSchema,
  AuthUsersPartialUpdateRequestSchema,
  AuthUsersPartialUpdateParamsSchema,
  AuthUsersPartialUpdateResponseSchema,
  AuthUsersDeleteParamsSchema,
  AuthUsersDeleteResponseSchema
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
 * Takes a set of user credentials and returns an access and refresh JSON web
token pair to prove the authentication of those credentials.
 * @generated from POST /auth/jwt/create/
 * Features: Input validation, revalidation, error handling
 */
export const authJwtCreateCreate = actionClientWithMeta
  .metadata({
    name: "auth-jwt-create-create",
    requiresAuth: false
  })
  .schema(AuthJwtCreateCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(AuthJwtCreateCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authJwtCreateCreate({        body: validatedBody,
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authJwtCreateCreate', true, duration, {
        method: 'POST',
        path: '/auth/jwt/create/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authJwtCreateCreate', false, duration, {
        method: 'POST',
        path: '/auth/jwt/create/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/jwt/create/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Takes a refresh type JSON web token and returns an access type JSON web
token if the refresh token is valid.
 * @generated from POST /auth/jwt/refresh/
 * Features: Input validation, revalidation, error handling
 */
export const authJwtRefreshCreate = actionClientWithMeta
  .metadata({
    name: "auth-jwt-refresh-create",
    requiresAuth: false
  })
  .schema(AuthJwtRefreshCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(AuthJwtRefreshCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authJwtRefreshCreate({        body: validatedBody,
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authJwtRefreshCreate', true, duration, {
        method: 'POST',
        path: '/auth/jwt/refresh/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authJwtRefreshCreate', false, duration, {
        method: 'POST',
        path: '/auth/jwt/refresh/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/jwt/refresh/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Takes a token and indicates if it is valid.  This view provides no
information about a token's fitness for a particular use.
 * @generated from POST /auth/jwt/verify/
 * Features: Input validation, revalidation, error handling
 */
export const authJwtVerifyCreate = actionClientWithMeta
  .metadata({
    name: "auth-jwt-verify-create",
    requiresAuth: false
  })
  .schema(AuthJwtVerifyCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(AuthJwtVerifyCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authJwtVerifyCreate({        body: validatedBody,
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authJwtVerifyCreate', true, duration, {
        method: 'POST',
        path: '/auth/jwt/verify/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authJwtVerifyCreate', false, duration, {
        method: 'POST',
        path: '/auth/jwt/verify/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/jwt/verify/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /auth/social/o/{provider}/
 * @generated from GET /auth/social/o/{provider}/
 * Features: React cache, input validation, error handling
 */
export const authSocialORead = cache(
  actionClientWithMeta
    .metadata({
      name: "auth-social-o-read",
      requiresAuth: false
    })
    .schema(AuthSocialOReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(AuthSocialOReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.auth.authSocialORead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('authSocialORead', true, duration, {
          method: 'GET',
          path: '/auth/social/o/{provider}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('authSocialORead', false, duration, {
          method: 'GET',
          path: '/auth/social/o/{provider}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/auth/social/o/{provider}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * POST /auth/social/o/{provider}/
 * @generated from POST /auth/social/o/{provider}/
 * Features: Input validation, revalidation, error handling
 */
export const authSocialOCreate = actionClientWithMeta
  .metadata({
    name: "auth-social-o-create",
    requiresAuth: false
  })
  .schema(z.object({
        body: AuthSocialOCreateRequestSchema,
        params: AuthSocialOCreateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: AuthSocialOCreateRequestSchema,
        params: AuthSocialOCreateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authSocialOCreate({params: validatedParams,
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authSocialOCreate', true, duration, {
        method: 'POST',
        path: '/auth/social/o/{provider}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authSocialOCreate', false, duration, {
        method: 'POST',
        path: '/auth/social/o/{provider}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/social/o/{provider}/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /auth/users/
 * @generated from GET /auth/users/
 * Features: React cache, input validation, error handling
 */
export const authUsersList = cache(
  actionClientWithMeta
    .metadata({
      name: "auth-users-list",
      requiresAuth: false
    })
    .schema(z.void())
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {

        // Execute API call with enhanced error handling
        const response = await apiClient.auth.authUsersList({
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('authUsersList', true, duration, {
          method: 'GET',
          path: '/auth/users/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('authUsersList', false, duration, {
          method: 'GET',
          path: '/auth/users/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/auth/users/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * POST /auth/users/
 * @generated from POST /auth/users/
 * Features: Input validation, revalidation, error handling
 */
export const authUsersCreate = actionClientWithMeta
  .metadata({
    name: "auth-users-create",
    requiresAuth: false
  })
  .schema(z.void())
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authUsersCreate({
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authUsersCreate', true, duration, {
        method: 'POST',
        path: '/auth/users/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authUsersCreate', false, duration, {
        method: 'POST',
        path: '/auth/users/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/users/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * POST /auth/users/activation/
 * @generated from POST /auth/users/activation/
 * Features: Input validation, revalidation, error handling
 */
export const authUsersActivation = actionClientWithMeta
  .metadata({
    name: "auth-users-activation",
    requiresAuth: false
  })
  .schema(AuthUsersActivationRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(AuthUsersActivationRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authUsersActivation({        body: validatedBody,
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authUsersActivation', true, duration, {
        method: 'POST',
        path: '/auth/users/activation/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authUsersActivation', false, duration, {
        method: 'POST',
        path: '/auth/users/activation/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/users/activation/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /auth/users/me/
 * @generated from GET /auth/users/me/
 * Features: React cache, input validation, error handling
 */
export const authUsersMeRead = cache(
  actionClientWithMeta
    .metadata({
      name: "auth-users-me-read",
      requiresAuth: false
    })
    .schema(z.void())
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {

        // Execute API call with enhanced error handling
        const response = await apiClient.auth.authUsersMeRead({
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('authUsersMeRead', true, duration, {
          method: 'GET',
          path: '/auth/users/me/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('authUsersMeRead', false, duration, {
          method: 'GET',
          path: '/auth/users/me/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/auth/users/me/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * PUT /auth/users/me/
 * @generated from PUT /auth/users/me/
 * Features: Input validation, revalidation, error handling
 */
export const authUsersMeUpdate = actionClientWithMeta
  .metadata({
    name: "auth-users-me-update",
    requiresAuth: false
  })
  .schema(AuthUsersMeUpdateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(AuthUsersMeUpdateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authUsersMeUpdate({        body: validatedBody,
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authUsersMeUpdate', true, duration, {
        method: 'PUT',
        path: '/auth/users/me/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authUsersMeUpdate', false, duration, {
        method: 'PUT',
        path: '/auth/users/me/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/users/me/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * PATCH /auth/users/me/
 * @generated from PATCH /auth/users/me/
 * Features: Input validation, revalidation, error handling
 */
export const authUsersMePartialUpdate = actionClientWithMeta
  .metadata({
    name: "auth-users-me-partial-update",
    requiresAuth: false
  })
  .schema(AuthUsersMePartialUpdateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(AuthUsersMePartialUpdateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authUsersMePartialUpdate({        body: validatedBody,
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authUsersMePartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/auth/users/me/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authUsersMePartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/auth/users/me/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/users/me/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * DELETE /auth/users/me/
 * @generated from DELETE /auth/users/me/
 * Features: Input validation, revalidation, error handling
 */
export const authUsersMeDelete = actionClientWithMeta
  .metadata({
    name: "auth-users-me-delete",
    requiresAuth: false
  })
  .schema(z.void())
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authUsersMeDelete({
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authUsersMeDelete', true, duration, {
        method: 'DELETE',
        path: '/auth/users/me/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authUsersMeDelete', false, duration, {
        method: 'DELETE',
        path: '/auth/users/me/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/users/me/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * POST /auth/users/resend_activation/
 * @generated from POST /auth/users/resend_activation/
 * Features: Input validation, revalidation, error handling
 */
export const authUsersResendActivation = actionClientWithMeta
  .metadata({
    name: "auth-users-resend-activation",
    requiresAuth: false
  })
  .schema(AuthUsersResendActivationRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(AuthUsersResendActivationRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authUsersResendActivation({        body: validatedBody,
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authUsersResendActivation', true, duration, {
        method: 'POST',
        path: '/auth/users/resend_activation/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authUsersResendActivation', false, duration, {
        method: 'POST',
        path: '/auth/users/resend_activation/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/users/resend_activation/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * POST /auth/users/reset_email/
 * @generated from POST /auth/users/reset_email/
 * Features: Input validation, revalidation, error handling
 */
export const authUsersResetUsername = actionClientWithMeta
  .metadata({
    name: "auth-users-reset-username",
    requiresAuth: false
  })
  .schema(AuthUsersResetUsernameRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(AuthUsersResetUsernameRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authUsersResetUsername({        body: validatedBody,
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authUsersResetUsername', true, duration, {
        method: 'POST',
        path: '/auth/users/reset_email/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authUsersResetUsername', false, duration, {
        method: 'POST',
        path: '/auth/users/reset_email/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/users/reset_email/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * POST /auth/users/reset_email_confirm/
 * @generated from POST /auth/users/reset_email_confirm/
 * Features: Input validation, revalidation, error handling
 */
export const authUsersResetUsernameConfirm = actionClientWithMeta
  .metadata({
    name: "auth-users-reset-username-confirm",
    requiresAuth: false
  })
  .schema(AuthUsersResetUsernameConfirmRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(AuthUsersResetUsernameConfirmRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authUsersResetUsernameConfirm({        body: validatedBody,
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authUsersResetUsernameConfirm', true, duration, {
        method: 'POST',
        path: '/auth/users/reset_email_confirm/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authUsersResetUsernameConfirm', false, duration, {
        method: 'POST',
        path: '/auth/users/reset_email_confirm/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/users/reset_email_confirm/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * POST /auth/users/reset_password/
 * @generated from POST /auth/users/reset_password/
 * Features: Input validation, revalidation, error handling
 */
export const authUsersResetPassword = actionClientWithMeta
  .metadata({
    name: "auth-users-reset-password",
    requiresAuth: false
  })
  .schema(AuthUsersResetPasswordRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(AuthUsersResetPasswordRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authUsersResetPassword({        body: validatedBody,
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authUsersResetPassword', true, duration, {
        method: 'POST',
        path: '/auth/users/reset_password/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authUsersResetPassword', false, duration, {
        method: 'POST',
        path: '/auth/users/reset_password/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/users/reset_password/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * POST /auth/users/reset_password_confirm/
 * @generated from POST /auth/users/reset_password_confirm/
 * Features: Input validation, revalidation, error handling
 */
export const authUsersResetPasswordConfirm = actionClientWithMeta
  .metadata({
    name: "auth-users-reset-password-confirm",
    requiresAuth: false
  })
  .schema(AuthUsersResetPasswordConfirmRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(AuthUsersResetPasswordConfirmRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authUsersResetPasswordConfirm({        body: validatedBody,
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authUsersResetPasswordConfirm', true, duration, {
        method: 'POST',
        path: '/auth/users/reset_password_confirm/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authUsersResetPasswordConfirm', false, duration, {
        method: 'POST',
        path: '/auth/users/reset_password_confirm/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/users/reset_password_confirm/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * POST /auth/users/set_email/
 * @generated from POST /auth/users/set_email/
 * Features: Input validation, revalidation, error handling
 */
export const authUsersSetUsername = actionClientWithMeta
  .metadata({
    name: "auth-users-set-username",
    requiresAuth: false
  })
  .schema(AuthUsersSetUsernameRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(AuthUsersSetUsernameRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authUsersSetUsername({        body: validatedBody,
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authUsersSetUsername', true, duration, {
        method: 'POST',
        path: '/auth/users/set_email/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authUsersSetUsername', false, duration, {
        method: 'POST',
        path: '/auth/users/set_email/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/users/set_email/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * POST /auth/users/set_password/
 * @generated from POST /auth/users/set_password/
 * Features: Input validation, revalidation, error handling
 */
export const authUsersSetPassword = actionClientWithMeta
  .metadata({
    name: "auth-users-set-password",
    requiresAuth: false
  })
  .schema(AuthUsersSetPasswordRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(AuthUsersSetPasswordRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authUsersSetPassword({        body: validatedBody,
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authUsersSetPassword', true, duration, {
        method: 'POST',
        path: '/auth/users/set_password/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authUsersSetPassword', false, duration, {
        method: 'POST',
        path: '/auth/users/set_password/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/users/set_password/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /auth/users/{id}/
 * @generated from GET /auth/users/{id}/
 * Features: React cache, input validation, error handling
 */
export const authUsersRead = cache(
  actionClientWithMeta
    .metadata({
      name: "auth-users-read",
      requiresAuth: false
    })
    .schema(AuthUsersReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(AuthUsersReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.auth.authUsersRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: true
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('authUsersRead', true, duration, {
          method: 'GET',
          path: '/auth/users/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('authUsersRead', false, duration, {
          method: 'GET',
          path: '/auth/users/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/auth/users/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * PUT /auth/users/{id}/
 * @generated from PUT /auth/users/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const authUsersUpdate = actionClientWithMeta
  .metadata({
    name: "auth-users-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: AuthUsersUpdateRequestSchema,
        params: AuthUsersUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: AuthUsersUpdateRequestSchema,
        params: AuthUsersUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authUsersUpdate({params: validatedParams,
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authUsersUpdate', true, duration, {
        method: 'PUT',
        path: '/auth/users/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authUsersUpdate', false, duration, {
        method: 'PUT',
        path: '/auth/users/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/users/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * PATCH /auth/users/{id}/
 * @generated from PATCH /auth/users/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const authUsersPartialUpdate = actionClientWithMeta
  .metadata({
    name: "auth-users-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: AuthUsersPartialUpdateRequestSchema,
        params: AuthUsersPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: AuthUsersPartialUpdateRequestSchema,
        params: AuthUsersPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authUsersPartialUpdate({params: validatedParams,
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authUsersPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/auth/users/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authUsersPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/auth/users/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/users/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * DELETE /auth/users/{id}/
 * @generated from DELETE /auth/users/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const authUsersDelete = actionClientWithMeta
  .metadata({
    name: "auth-users-delete",
    requiresAuth: false
  })
  .schema(AuthUsersDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(AuthUsersDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.auth.authUsersDelete({params: validatedParams,
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
      revalidateTag('auth')
      console.log('Revalidated tag: auth')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('authUsersDelete', true, duration, {
        method: 'DELETE',
        path: '/auth/users/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('authUsersDelete', false, duration, {
        method: 'DELETE',
        path: '/auth/users/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/auth/users/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })