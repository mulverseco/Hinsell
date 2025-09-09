"use client";


import type { ReactNode } from "react";
import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProviderClient } from "@/locales/client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { SessionProvider } from "next-auth/react"
import { Session } from "next-auth";

type ProviderProps = {
  locale?: string;
  children: ReactNode;
  session: Session | null;
};

export  function Providers({ locale,session, children }: ProviderProps) {
 const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: (failureCount: number, error: any) => {
              if (error?.status === 401) return false
              if (error?.status === 403) return false
              if (error?.status === 404) return false
              if (error?.status >= 400 && error?.status < 500) return false
              return failureCount < 3
            },
            retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: (failureCount: number, error: any) => {
              if (error?.status >= 400 && error?.status < 500) return false
              return failureCount < 2
            },
            retryDelay: 1000,
          },
        },
      }),
  )
  return (
    <I18nProviderClient locale={locale || "en"}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <SessionProvider basePath={"/auth"} session={session}>
         <QueryClientProvider client={queryClient}>
          <TooltipProvider>
           {children}
          </TooltipProvider>
            {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
        </SessionProvider>
      </ThemeProvider>
    </I18nProviderClient>
  );
}
