import { DEFAULT_SERVER_ERROR_MESSAGE, createSafeActionClient } from "next-safe-action";
import { headers } from "next/headers";
import { z } from "zod";

export class ActionError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "ActionError";
  }
}

// Basic client without metadata
export const actionClient = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof ActionError) {
      return e.message;
    }
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

// Client with metadata support
export const actionClientWithMeta = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof ActionError) {
      return e.message;
    }
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
  defineMetadataSchema() {
    return z.object({
      name: z.string(),
      requiresAuth: z.boolean().default(false),
      rateLimit: z.object({
        requests: z.number(),
        window: z.string(), // e.g., "10s", "1m"
      }).optional(),
    });
  },
});

// Simple in-memory rate limiter
class MemoryRateLimiter {
  private limits = new Map<string, { count: number; expiresAt: number }>();

  async limit(key: string, requests: number, window: string) {
    const now = Date.now();
    const windowMs = this.parseWindow(window);
    const entry = this.limits.get(key);

    if (!entry || entry.expiresAt <= now) {
      this.limits.set(key, { count: 1, expiresAt: now + windowMs });
      return { success: true, remaining: requests - 1 };
    }

    if (entry.count >= requests) {
      return { success: false, remaining: 0 };
    }

    this.limits.set(key, { ...entry, count: entry.count + 1 });
    return { success: true, remaining: requests - entry.count - 1 };
  }

  private parseWindow(window: string): number {
    const value = parseInt(window);
    if (window.endsWith("s")) return value * 1000;
    if (window.endsWith("m")) return value * 60 * 1000;
    if (window.endsWith("h")) return value * 60 * 60 * 1000;
    return 1000; // default to 1 second
  }
}

const memoryRateLimiter = new MemoryRateLimiter();

// Auth client with rate limiting
export const authActionClient = actionClientWithMeta
  .use(async ({ next, clientInput, metadata }) => {
    if (process.env.NODE_ENV === "development") {
      console.log("Input:", clientInput);
      console.log("Metadata:", metadata);
    }
    return next({ ctx: {} });
  })
  .use(async ({ next, metadata }) => {
    if (metadata?.rateLimit) {
      const headersList = await headers(); // Await the headers promise
      const ip = headersList.get("x-forwarded-for") ?? "local";
      const { success, remaining } = await memoryRateLimiter.limit(
        `${ip}-${metadata.name}`,
        metadata.rateLimit.requests,
        metadata.rateLimit.window
      );

      if (!success) {
        throw new ActionError("Too many requests", "RATE_LIMITED");
      }

      return next({
        ctx: {
          ratelimit: { remaining },
        },
      });
    }
    return next();
  })
  .use(async ({ next, metadata }) => {
    if (metadata?.requiresAuth) {
      const user = await getCurrentUser();
      
      if (!user) {
        throw new ActionError("Unauthorized", "UNAUTHORIZED");
      }

      return next({
        ctx: {
          user,
        },
      });
    }
    return next();
  });

// Mock user function
async function getCurrentUser() {
  // Implement your authentication logic here
  return null;
}