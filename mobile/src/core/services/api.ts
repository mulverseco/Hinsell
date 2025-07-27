import { type BaseQueryFn, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { Mutex } from "async-mutex"
import { RootState } from "../store"
import { logout, setToken } from "../store/auth-slice"
import { LoginResponse, ReportCategory, ReportFilters, ReportRequest, ReportResponse, ReportTemplate, User } from "../types"

const mutex = new Mutex()

const CACHE_LIFETIME = {
  DEFAULT: 60,
  REPORTS: 300,
  STATIC_DATA: 3600,
  USER_DATA: 300,
  SEARCH_RESULTS: 120,
  GEOGRAPHIC_DATA: 86400,
}

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_NATIVE_PUBLIC_BACKEND_API_URL
    ? `${process.env.REACT_NATIVE_PUBLIC_BACKEND_API_URL}/api`
    : "http://192.168.0.133:8000/api",
  credentials: "include",
  prepareHeaders: (headers, { getState, arg }) => {
    const state = getState() as RootState
    const token = state.auth.token
    const url = typeof arg === "object" && "url" in arg ? arg.url : undefined
    const apiKey = "41xoVjOn.iu91jK2vgvxHdBvownQpOJ9yoXqjVLx8"

    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    } else if (!url?.startsWith("/auth/") && apiKey) {
      headers.set("Authorization", `Api-Key ${apiKey}`)
    }

    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  await mutex.waitForUnlock()
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire()
      try {
        const state = api.getState() as RootState
        const refreshToken = state.auth.refreshToken

        if (refreshToken) {
          const refreshResult = await baseQuery(
            {
              url: "/auth/jwt/refresh/",
              method: "POST",
              body: { refresh: refreshToken },
            },
            api,
            extraOptions,
          )

          if (refreshResult.data) {
            const newAccessToken = (refreshResult.data as { access: string }).access
            api.dispatch(
              setToken(newAccessToken),
            )
            await new Promise((resolve) => setTimeout(resolve, 100))

            result = await baseQuery(args, api, extraOptions)
          } else {
            api.dispatch(logout())
          }
        } else {
          api.dispatch(logout())
        }
      } finally {
        release()
      }
    } else {
      await mutex.waitForUnlock()
      result = await baseQuery(args, api, extraOptions)
    }
  }

  if (
    result.error?.status === 401 ||
    (result.error?.status === 403 && (result.error.data as { code?: string })?.code === "token_invalid")
  ) {
    api.dispatch(logout())
  }

  return result
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "Report",
  ],
  keepUnusedDataFor: CACHE_LIFETIME.DEFAULT,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, { username: string; password: string }>({
      query: (credentials) => ({
        url: "/auth/jwt/create/",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    refreshToken: builder.mutation<{ access: string }, { refresh: string }>({
      query: (data) => ({
        url: "/auth/jwt/refresh/",
        method: "POST",
        body: data,
      }),
    }),

    verifyToken: builder.mutation<void, { token: string }>({
      query: (token) => ({
        url: "/auth/jwt/verify/",
        method: "POST",
        body: token,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/logout/",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),

    getUser: builder.query<User, void>({
      query: () => ({
        url: "/auth/users/me/",
      }),
      providesTags: ["Auth"],
      keepUnusedDataFor: CACHE_LIFETIME.USER_DATA,
    }),

    updateUser: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: "/auth/users/me/",
        method: "PATCH",
        body: userData,
      }),
      invalidatesTags: ["Auth"],
    }),

    getReportCategories: builder.query<ReportCategory[], void>({
      query: () => "/reporting/reports/categories/",
      providesTags: ["Report"],
      keepUnusedDataFor: CACHE_LIFETIME.REPORTS,
    }),

        getReportTemplates: builder.query<
      {
        results: ReportTemplate[]
        count: number
        next: string | null
        previous: string | null
      },
      ReportFilters & { page?: number; page_size?: number }
    >({
      query: (params) => ({
        url: "/reporting/reports/",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: "Report" as const, id })),
              { type: "Report", id: "LIST" },
            ]
          : [{ type: "Report", id: "LIST" }],
      keepUnusedDataFor: CACHE_LIFETIME.REPORTS,
    }),
    
    getReportTemplate: builder.query<ReportTemplate, string>({
      query: (id) => `/reporting/reports/${id}/`,
      providesTags: (result, error, id) => [{ type: "Report", id }],
      keepUnusedDataFor: CACHE_LIFETIME.REPORTS,
    }),
    executeReportTemplate: builder.mutation<ReportResponse, { id: string } & Omit<ReportRequest, "template_id">>({
      query: ({ id, ...data }) => ({
        url: `/reporting/reports/${id}/execute/`,
        method: "POST",
        body: data,
        page:1,
        page_siza:25
      }),
      invalidatesTags: ["Report"],
    }),
  }),
})

export const {
  // Authentication hooks
  useLoginMutation,
  useRefreshTokenMutation,
  useVerifyTokenMutation,
  useLogoutMutation,
  useGetUserQuery,
  useUpdateUserMutation,

  useGetReportCategoriesQuery,
  useGetReportTemplatesQuery,
  useGetReportTemplateQuery,
  useExecuteReportTemplateMutation,
} = api