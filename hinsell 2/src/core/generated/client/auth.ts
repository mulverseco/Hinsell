import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  AuthJwtCreateCreateRequestSchema,
  AuthJwtCreateCreateResponseSchema,
  AuthJwtRefreshCreateRequestSchema,
  AuthJwtRefreshCreateResponseSchema,
  AuthJwtVerifyCreateRequestSchema,
  AuthJwtVerifyCreateResponseSchema,
  AuthSocialOReadResponseSchema,
  AuthSocialOReadParamsSchema,
  AuthSocialOCreateRequestSchema,
  AuthSocialOCreateResponseSchema,
  AuthSocialOCreateParamsSchema,
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
  AuthUsersReadResponseSchema,
  AuthUsersReadParamsSchema,
  AuthUsersUpdateRequestSchema,
  AuthUsersUpdateResponseSchema,
  AuthUsersUpdateParamsSchema,
  AuthUsersPartialUpdateRequestSchema,
  AuthUsersPartialUpdateResponseSchema,
  AuthUsersPartialUpdateParamsSchema,
  AuthUsersDeleteResponseSchema,
  AuthUsersDeleteParamsSchema
} from '@/core/generated/schemas'

export class AuthApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'auth-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'auth'
          }
        }
      }
    })
  }

  /**
   * Takes a set of user credentials and returns an access and refresh JSON web
token pair to prove the authentication of those credentials.
   * Takes a set of user credentials and returns an access and refresh JSON web
token pair to prove the authentication of those credentials.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthJwtCreateCreateResponseSchema>>>
   * @example
   * const result = await client.authJwtCreateCreate({
   *   config: { timeout: 5000 }
   * })
   */
  authJwtCreateCreate = async (options: {
    body: z.infer<typeof AuthJwtCreateCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuthJwtCreateCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof AuthJwtCreateCreateResponseSchema>>(
      'POST',
      '/auth/jwt/create/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthJwtCreateCreateResponseSchema
      }
    )
  }

  /**
   * Takes a refresh type JSON web token and returns an access type JSON web
token if the refresh token is valid.
   * Takes a refresh type JSON web token and returns an access type JSON web
token if the refresh token is valid.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthJwtRefreshCreateResponseSchema>>>
   * @example
   * const result = await client.authJwtRefreshCreate({
   *   config: { timeout: 5000 }
   * })
   */
  authJwtRefreshCreate = async (options: {
    body: z.infer<typeof AuthJwtRefreshCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuthJwtRefreshCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof AuthJwtRefreshCreateResponseSchema>>(
      'POST',
      '/auth/jwt/refresh/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthJwtRefreshCreateResponseSchema
      }
    )
  }

  /**
   * Takes a token and indicates if it is valid.  This view provides no
information about a token's fitness for a particular use.
   * Takes a token and indicates if it is valid.  This view provides no
information about a token's fitness for a particular use.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthJwtVerifyCreateResponseSchema>>>
   * @example
   * const result = await client.authJwtVerifyCreate({
   *   config: { timeout: 5000 }
   * })
   */
  authJwtVerifyCreate = async (options: {
    body: z.infer<typeof AuthJwtVerifyCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuthJwtVerifyCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof AuthJwtVerifyCreateResponseSchema>>(
      'POST',
      '/auth/jwt/verify/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthJwtVerifyCreateResponseSchema
      }
    )
  }

  /**
   * GET /auth/social/o/{provider}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthSocialOReadResponseSchema>>>
   * @example
   * const result = await client.authSocialORead({
   *   config: { timeout: 5000 }
   * })
   */
  authSocialORead = cache(async (options: {
    params: z.infer<typeof AuthSocialOReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await AuthSocialOReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AuthSocialOReadResponseSchema>>(
      'GET',
      '/auth/social/o/{provider}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthSocialOReadResponseSchema
      }
    )
  })

  /**
   * POST /auth/social/o/{provider}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthSocialOCreateResponseSchema>>>
   * @example
   * const result = await client.authSocialOCreate({
   *   config: { timeout: 5000 }
   * })
   */
  authSocialOCreate = async (options: {
    params: z.infer<typeof AuthSocialOCreateParamsSchema>
    body: z.infer<typeof AuthSocialOCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuthSocialOCreateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await AuthSocialOCreateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AuthSocialOCreateResponseSchema>>(
      'POST',
      '/auth/social/o/{provider}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthSocialOCreateResponseSchema
      }
    )
  }

  /**
   * GET /auth/users/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersListResponseSchema>>>
   * @example
   * const result = await client.authUsersList({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersList = cache(async (options?: { config?: RequestConfiguration }) => {
    return this.request<z.infer<typeof AuthUsersListResponseSchema>>(
      'GET',
      '/auth/users/',
      {
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersListResponseSchema
      }
    )
  })

  /**
   * POST /auth/users/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersCreateResponseSchema>>>
   * @example
   * const result = await client.authUsersCreate({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersCreate = async (options?: { config?: RequestConfiguration }) => {
    return this.request<z.infer<typeof AuthUsersCreateResponseSchema>>(
      'POST',
      '/auth/users/',
      {
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersCreateResponseSchema
      }
    )
  }

  /**
   * POST /auth/users/activation/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersActivationResponseSchema>>>
   * @example
   * const result = await client.authUsersActivation({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersActivation = async (options: {
    body: z.infer<typeof AuthUsersActivationRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuthUsersActivationRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof AuthUsersActivationResponseSchema>>(
      'POST',
      '/auth/users/activation/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersActivationResponseSchema
      }
    )
  }

  /**
   * GET /auth/users/me/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersMeReadResponseSchema>>>
   * @example
   * const result = await client.authUsersMeRead({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersMeRead = cache(async (options?: { config?: RequestConfiguration }) => {
    return this.request<z.infer<typeof AuthUsersMeReadResponseSchema>>(
      'GET',
      '/auth/users/me/',
      {
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersMeReadResponseSchema
      }
    )
  })

  /**
   * PUT /auth/users/me/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersMeUpdateResponseSchema>>>
   * @example
   * const result = await client.authUsersMeUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersMeUpdate = async (options: {
    body: z.infer<typeof AuthUsersMeUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuthUsersMeUpdateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof AuthUsersMeUpdateResponseSchema>>(
      'PUT',
      '/auth/users/me/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersMeUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /auth/users/me/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersMePartialUpdateResponseSchema>>>
   * @example
   * const result = await client.authUsersMePartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersMePartialUpdate = async (options: {
    body: z.infer<typeof AuthUsersMePartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuthUsersMePartialUpdateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof AuthUsersMePartialUpdateResponseSchema>>(
      'PATCH',
      '/auth/users/me/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersMePartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /auth/users/me/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersMeDeleteResponseSchema>>>
   * @example
   * const result = await client.authUsersMeDelete({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersMeDelete = async (options?: { config?: RequestConfiguration }) => {
    return this.request<z.infer<typeof AuthUsersMeDeleteResponseSchema>>(
      'DELETE',
      '/auth/users/me/',
      {
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersMeDeleteResponseSchema
      }
    )
  }

  /**
   * POST /auth/users/resend_activation/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersResendActivationResponseSchema>>>
   * @example
   * const result = await client.authUsersResendActivation({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersResendActivation = async (options: {
    body: z.infer<typeof AuthUsersResendActivationRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuthUsersResendActivationRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof AuthUsersResendActivationResponseSchema>>(
      'POST',
      '/auth/users/resend_activation/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersResendActivationResponseSchema
      }
    )
  }

  /**
   * POST /auth/users/reset_email/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersResetUsernameResponseSchema>>>
   * @example
   * const result = await client.authUsersResetUsername({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersResetUsername = async (options: {
    body: z.infer<typeof AuthUsersResetUsernameRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuthUsersResetUsernameRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof AuthUsersResetUsernameResponseSchema>>(
      'POST',
      '/auth/users/reset_email/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersResetUsernameResponseSchema
      }
    )
  }

  /**
   * POST /auth/users/reset_email_confirm/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersResetUsernameConfirmResponseSchema>>>
   * @example
   * const result = await client.authUsersResetUsernameConfirm({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersResetUsernameConfirm = async (options: {
    body: z.infer<typeof AuthUsersResetUsernameConfirmRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuthUsersResetUsernameConfirmRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof AuthUsersResetUsernameConfirmResponseSchema>>(
      'POST',
      '/auth/users/reset_email_confirm/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersResetUsernameConfirmResponseSchema
      }
    )
  }

  /**
   * POST /auth/users/reset_password/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersResetPasswordResponseSchema>>>
   * @example
   * const result = await client.authUsersResetPassword({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersResetPassword = async (options: {
    body: z.infer<typeof AuthUsersResetPasswordRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuthUsersResetPasswordRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof AuthUsersResetPasswordResponseSchema>>(
      'POST',
      '/auth/users/reset_password/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersResetPasswordResponseSchema
      }
    )
  }

  /**
   * POST /auth/users/reset_password_confirm/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersResetPasswordConfirmResponseSchema>>>
   * @example
   * const result = await client.authUsersResetPasswordConfirm({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersResetPasswordConfirm = async (options: {
    body: z.infer<typeof AuthUsersResetPasswordConfirmRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuthUsersResetPasswordConfirmRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof AuthUsersResetPasswordConfirmResponseSchema>>(
      'POST',
      '/auth/users/reset_password_confirm/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersResetPasswordConfirmResponseSchema
      }
    )
  }

  /**
   * POST /auth/users/set_email/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersSetUsernameResponseSchema>>>
   * @example
   * const result = await client.authUsersSetUsername({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersSetUsername = async (options: {
    body: z.infer<typeof AuthUsersSetUsernameRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuthUsersSetUsernameRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof AuthUsersSetUsernameResponseSchema>>(
      'POST',
      '/auth/users/set_email/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersSetUsernameResponseSchema
      }
    )
  }

  /**
   * POST /auth/users/set_password/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersSetPasswordResponseSchema>>>
   * @example
   * const result = await client.authUsersSetPassword({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersSetPassword = async (options: {
    body: z.infer<typeof AuthUsersSetPasswordRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuthUsersSetPasswordRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof AuthUsersSetPasswordResponseSchema>>(
      'POST',
      '/auth/users/set_password/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersSetPasswordResponseSchema
      }
    )
  }

  /**
   * GET /auth/users/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersReadResponseSchema>>>
   * @example
   * const result = await client.authUsersRead({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersRead = cache(async (options: {
    params: z.infer<typeof AuthUsersReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await AuthUsersReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AuthUsersReadResponseSchema>>(
      'GET',
      '/auth/users/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersReadResponseSchema
      }
    )
  })

  /**
   * PUT /auth/users/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersUpdateResponseSchema>>>
   * @example
   * const result = await client.authUsersUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersUpdate = async (options: {
    params: z.infer<typeof AuthUsersUpdateParamsSchema>
    body: z.infer<typeof AuthUsersUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuthUsersUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await AuthUsersUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AuthUsersUpdateResponseSchema>>(
      'PUT',
      '/auth/users/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /auth/users/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.authUsersPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersPartialUpdate = async (options: {
    params: z.infer<typeof AuthUsersPartialUpdateParamsSchema>
    body: z.infer<typeof AuthUsersPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuthUsersPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await AuthUsersPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AuthUsersPartialUpdateResponseSchema>>(
      'PATCH',
      '/auth/users/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersPartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /auth/users/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuthUsersDeleteResponseSchema>>>
   * @example
   * const result = await client.authUsersDelete({
   *   config: { timeout: 5000 }
   * })
   */
  authUsersDelete = async (options: {
    params: z.infer<typeof AuthUsersDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await AuthUsersDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AuthUsersDeleteResponseSchema>>(
      'DELETE',
      '/auth/users/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuthUsersDeleteResponseSchema
      }
    )
  }
}