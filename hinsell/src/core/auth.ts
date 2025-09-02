// auth.ts
import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { apiClient } from "@/core/generated/client";

import { ActionError } from "@/core/generated/lib/safe-action";
import { TokenObtainPairSchema } from "./generated/schemas";

export const authConfig: NextAuthConfig = {
  // Add basePath to account for locale prefix
  basePath: "/[lang]/api/auth",
  providers: [
    Credentials({
      credentials: {
        email: { type: "email", label: "Email", placeholder: "johndoe@gmail.com" },
        password: { type: "password", label: "Password", placeholder: "*****" },
      },
      async authorize(credentials, req) {
        try {
          const validatedInput = await TokenObtainPairSchema.parseAsync(credentials);

          const response = await apiClient.auth.authJwtCreateCreate({
            body: validatedInput,
            config: {
              timeout: 30000,
              retries: 3,
              validateResponse: false,
            },
          });

          const tokens = response.data;

          if (!tokens.access || !tokens.refresh) {
            throw new ActionError("Invalid token response", "VALIDATION_ERROR");
          }

          const userResponse = await apiClient.auth.authUsersMeRead({
            config: {
              headers: { Authorization: `Bearer ${tokens.access}` },
              timeout: 30000,
              retries: 3,
            },
          });

          const user = userResponse.data;

          return {
            id: user.id,
            email: user.email,
            username: user.username,
            user_type: user.user_type,
            accessToken: tokens.access,
            refreshToken: tokens.refresh,
          };
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new ActionError(
              `Input validation failed: ${error.errors.map((e) => e.message).join(", ")}`,
              "VALIDATION_ERROR",
            );
          }
          throw new ActionError(
            error instanceof Error ? error.message : "Authentication failed",
            "AUTH_ERROR",
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          user_type: user.user_type,
        };
      }

      try {
        await apiClient.auth.authJwtVerifyCreate({
          body: { token: token.accessToken },
          config: { timeout: 30000, retries: 3 },
        });
        return token;
      } catch (error) {
        try {
          const refreshResponse = await apiClient.auth.authJwtRefreshCreate({
            body: { refresh: token.refreshToken },
            config: { timeout: 30000, retries: 3 },
          });
          token.accessToken = refreshResponse.data.access;
          return token;
        } catch (refreshError) {
          return { ...token, accessToken: null, refreshToken: null };
        }
      }
    },
    async session({ session, token }) {
      session.user = token.user;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    },
  },
  pages: {
    signIn: "/[lang]/login",
    error: "/[lang]/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);