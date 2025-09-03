// auth.ts
import NextAuth, { type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { apiClient } from "@/core/generated/client"
import { TokenObtainPairSchema } from "./generated/schemas"

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { type: "email", label: "Email", placeholder: "johndoe@gmail.com" },
        password: { type: "password", label: "Password", placeholder: "*****" },
      },
      async authorize(credentials) {
        try {
          const validatedInput = await TokenObtainPairSchema.parseAsync(credentials)

          const response = await apiClient.auth.authJwtCreateCreate({
            body: validatedInput,
            config: {
              timeout: 30000,
              retries: 3,
              validateResponse: false,
            },
          })

          const tokens = response.data

          if (!tokens.access || !tokens.refresh) {
            return null
          }

          const userResponse = await apiClient.auth.authUsersMeRead({
            config: {
              headers: { Authorization: `Bearer ${tokens.access}` },
              timeout: 30000,
              retries: 3,
            },
          })

          const user = userResponse.data

          return {
            id: user.id,
            email: user.email,
            username: user.username,
            user_type: user.user_type,
            accessToken: tokens.access,
            refreshToken: tokens.refresh,
          }
        } catch (error) {
          console.error("Authentication failed:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          user_type: user.user_type,
        }
      }

      try {
        await apiClient.auth.authJwtVerifyCreate({
          body: { token: token.accessToken },
          config: { timeout: 30000, retries: 3 },
        })
        return token
      } catch (error) {
        try {
          const refreshResponse = await apiClient.auth.authJwtRefreshCreate({
            body: { refresh: token.refreshToken },
            config: { timeout: 30000, retries: 3 },
          })
          token.accessToken = refreshResponse.data.access
          return token
        } catch (refreshError) {
          return { ...token, accessToken: null, refreshToken: null }
        }
      }
    },
    async session({ session, token }) {
      session.user = token.user
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig)
