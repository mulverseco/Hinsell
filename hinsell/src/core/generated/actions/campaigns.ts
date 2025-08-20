'use server'
import { z } from 'zod'
import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { apiClient } from '@/core/generated/client'
import { actionClientWithMeta, ActionError } from '@/core/generated/lib/safe-action'
import {
  CampaignsListParamsSchema,
  CampaignsListResponseSchema,
  CampaignsCreateRequestSchema,
  CampaignsCreateResponseSchema,
  CampaignsReadParamsSchema,
  CampaignsReadResponseSchema,
  CampaignsUpdateRequestSchema,
  CampaignsUpdateParamsSchema,
  CampaignsUpdateResponseSchema,
  CampaignsPartialUpdateRequestSchema,
  CampaignsPartialUpdateParamsSchema,
  CampaignsPartialUpdateResponseSchema,
  CampaignsDeleteParamsSchema,
  CampaignsDeleteResponseSchema,
  CampaignsTrackClickRequestSchema,
  CampaignsTrackClickParamsSchema,
  CampaignsTrackClickResponseSchema,
  CampaignsTrackConversionRequestSchema,
  CampaignsTrackConversionParamsSchema,
  CampaignsTrackConversionResponseSchema,
  CampaignsTrackImpressionRequestSchema,
  CampaignsTrackImpressionParamsSchema,
  CampaignsTrackImpressionResponseSchema
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
 * GET /campaigns/
 * @generated from GET /campaigns/
 * Features: React cache, input validation, error handling
 */
export const campaignsList = cache(
  actionClientWithMeta
    .metadata({
      name: "campaigns-list",
      requiresAuth: false
    })
    .schema(CampaignsListParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(CampaignsListParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.campaigns.campaignsList({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: CampaignsListResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('campaignsList', true, duration, {
          method: 'GET',
          path: '/campaigns/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('campaignsList', false, duration, {
          method: 'GET',
          path: '/campaigns/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/campaigns/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * POST /campaigns/
 * @generated from POST /campaigns/
 * Features: Input validation, revalidation, error handling
 */
export const campaignsCreate = actionClientWithMeta
  .metadata({
    name: "campaigns-create",
    requiresAuth: false
  })
  .schema(CampaignsCreateRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize request body
    const validatedBody = await validateAndSanitizeInput(CampaignsCreateRequestSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.campaigns.campaignsCreate({        body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: CampaignsCreateResponseSchema
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
      revalidateTag('campaigns')
      console.log('Revalidated tag: campaigns')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('campaignsCreate', true, duration, {
        method: 'POST',
        path: '/campaigns/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('campaignsCreate', false, duration, {
        method: 'POST',
        path: '/campaigns/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/campaigns/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * GET /campaigns/{id}/
 * @generated from GET /campaigns/{id}/
 * Features: React cache, input validation, error handling
 */
export const campaignsRead = cache(
  actionClientWithMeta
    .metadata({
      name: "campaigns-read",
      requiresAuth: false
    })
    .schema(CampaignsReadParamsSchema)
    .action(async ({ parsedInput, ctx }) => {
      const startTime = Date.now()
      
      try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(CampaignsReadParamsSchema, parsedInput)

        // Execute API call with enhanced error handling
        const response = await apiClient.campaigns.campaignsRead({params: validatedParams,
          config: {
            timeout: 30000,
            retries: 3,
            validateResponse: false,
            responseSchema: CampaignsReadResponseSchema
          }
        })
        
        // Log successful execution
        const duration = Date.now() - startTime
        await logActionExecution('campaignsRead', true, duration, {
          method: 'GET',
          path: '/campaigns/{id}/'
        })
        
        return response.data
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error logging
        await logActionExecution('campaignsRead', false, duration, {
          method: 'GET',
          path: '/campaigns/{id}/',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Throw enhanced error with context
        throw new ActionExecutionError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            endpoint: '/campaigns/{id}/',
            method: 'GET',
            timestamp: Date.now()
          },
          error
        )
      }
    })
)

/**
 * PUT /campaigns/{id}/
 * @generated from PUT /campaigns/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const campaignsUpdate = actionClientWithMeta
  .metadata({
    name: "campaigns-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: CampaignsUpdateRequestSchema,
        params: CampaignsUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: CampaignsUpdateRequestSchema,
        params: CampaignsUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.campaigns.campaignsUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: CampaignsUpdateResponseSchema
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
      revalidateTag('campaigns')
      console.log('Revalidated tag: campaigns')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('campaignsUpdate', true, duration, {
        method: 'PUT',
        path: '/campaigns/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('campaignsUpdate', false, duration, {
        method: 'PUT',
        path: '/campaigns/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/campaigns/{id}/',
          method: 'PUT',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * PATCH /campaigns/{id}/
 * @generated from PATCH /campaigns/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const campaignsPartialUpdate = actionClientWithMeta
  .metadata({
    name: "campaigns-partial-update",
    requiresAuth: false
  })
  .schema(z.object({
        body: CampaignsPartialUpdateRequestSchema,
        params: CampaignsPartialUpdateParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: CampaignsPartialUpdateRequestSchema,
        params: CampaignsPartialUpdateParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.campaigns.campaignsPartialUpdate({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: CampaignsPartialUpdateResponseSchema
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
      revalidateTag('campaigns')
      console.log('Revalidated tag: campaigns')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('campaignsPartialUpdate', true, duration, {
        method: 'PATCH',
        path: '/campaigns/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('campaignsPartialUpdate', false, duration, {
        method: 'PATCH',
        path: '/campaigns/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/campaigns/{id}/',
          method: 'PATCH',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * DELETE /campaigns/{id}/
 * @generated from DELETE /campaigns/{id}/
 * Features: Input validation, revalidation, error handling
 */
export const campaignsDelete = actionClientWithMeta
  .metadata({
    name: "campaigns-delete",
    requiresAuth: false
  })
  .schema(CampaignsDeleteParamsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize parameters
    const validatedParams = await validateAndSanitizeInput(CampaignsDeleteParamsSchema, parsedInput)

      // Execute API call with enhanced configuration
      const response = await apiClient.campaigns.campaignsDelete({params: validatedParams,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: CampaignsDeleteResponseSchema
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
      revalidateTag('campaigns')
      console.log('Revalidated tag: campaigns')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('campaignsDelete', true, duration, {
        method: 'DELETE',
        path: '/campaigns/{id}/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('campaignsDelete', false, duration, {
        method: 'DELETE',
        path: '/campaigns/{id}/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/campaigns/{id}/',
          method: 'DELETE',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Track a campaign click.
 * @generated from POST /campaigns/{id}/track_click/
 * Features: Input validation, revalidation, error handling
 */
export const campaignsTrackClick = actionClientWithMeta
  .metadata({
    name: "campaigns-track-click",
    requiresAuth: false
  })
  .schema(z.object({
        body: CampaignsTrackClickRequestSchema,
        params: CampaignsTrackClickParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: CampaignsTrackClickRequestSchema,
        params: CampaignsTrackClickParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.campaigns.campaignsTrackClick({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: CampaignsTrackClickResponseSchema
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
      revalidateTag('campaigns')
      console.log('Revalidated tag: campaigns')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('campaignsTrackClick', true, duration, {
        method: 'POST',
        path: '/campaigns/{id}/track_click/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('campaignsTrackClick', false, duration, {
        method: 'POST',
        path: '/campaigns/{id}/track_click/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/campaigns/{id}/track_click/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Track a campaign conversion.
 * @generated from POST /campaigns/{id}/track_conversion/
 * Features: Input validation, revalidation, error handling
 */
export const campaignsTrackConversion = actionClientWithMeta
  .metadata({
    name: "campaigns-track-conversion",
    requiresAuth: false
  })
  .schema(z.object({
        body: CampaignsTrackConversionRequestSchema,
        params: CampaignsTrackConversionParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: CampaignsTrackConversionRequestSchema,
        params: CampaignsTrackConversionParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.campaigns.campaignsTrackConversion({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: CampaignsTrackConversionResponseSchema
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
      revalidateTag('campaigns')
      console.log('Revalidated tag: campaigns')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('campaignsTrackConversion', true, duration, {
        method: 'POST',
        path: '/campaigns/{id}/track_conversion/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('campaignsTrackConversion', false, duration, {
        method: 'POST',
        path: '/campaigns/{id}/track_conversion/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/campaigns/{id}/track_conversion/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })

/**
 * Track a campaign impression.
 * @generated from POST /campaigns/{id}/track_impression/
 * Features: Input validation, revalidation, error handling
 */
export const campaignsTrackImpression = actionClientWithMeta
  .metadata({
    name: "campaigns-track-impression",
    requiresAuth: false
  })
  .schema(z.object({
        body: CampaignsTrackImpressionRequestSchema,
        params: CampaignsTrackImpressionParamsSchema
      }))
  .action(async ({ parsedInput, ctx }) => {
    const startTime = Date.now()
    
    try {
    // Validate and sanitize input
    const { body, params } = await validateAndSanitizeInput(z.object({
        body: CampaignsTrackImpressionRequestSchema,
        params: CampaignsTrackImpressionParamsSchema
      }), parsedInput)
    const validatedBody = body
    const validatedParams = params

      // Execute API call with enhanced configuration
      const response = await apiClient.campaigns.campaignsTrackImpression({params: validatedParams,
body: validatedBody,
        config: {
          timeout: 30000,
          retries: 3,
          validateResponse: false,
          responseSchema: CampaignsTrackImpressionResponseSchema
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
      revalidateTag('campaigns')
      console.log('Revalidated tag: campaigns')
      
      // Background tasks (Next.js 15 feature)
      // Log successful execution
      const duration = Date.now() - startTime
      await logActionExecution('campaignsTrackImpression', true, duration, {
        method: 'POST',
        path: '/campaigns/{id}/track_impression/'
      })
      
      return response.data
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Enhanced error logging
      await logActionExecution('campaignsTrackImpression', false, duration, {
        method: 'POST',
        path: '/campaigns/{id}/track_impression/',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Throw enhanced error with context
      throw new ActionExecutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          endpoint: '/campaigns/{id}/track_impression/',
          method: 'POST',
          timestamp: Date.now()
        },
        error
      )
    }
  })