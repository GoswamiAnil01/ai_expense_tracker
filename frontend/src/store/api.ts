import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from './index'

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  mobile_number?: string
  created_at: string
}

export interface Expense {
  id: number
  user_id: number
  amount: number
  category: string
  date: string
  notes?: string
  receipt_url?: string
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  first_name: string
  last_name: string
  mobile_number?: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface CreateExpenseRequest {
  amount: number
  category: string
  date?: string
  notes?: string
  receipt_url?: string
}

export interface UpdateExpenseRequest {
  amount?: number
  category?: string
  date?: string
  notes?: string
  receipt_url?: string
}

export interface ExpenseSummary {
  year: number
  month: number
  categories: Array<{
    category: string
    total: number
    count: number
    average: number
  }>
  grand_total: number
}

export interface PredictionResponse {
  predicted_overspend: number
  confidence: number
  data_points: number
  prediction?: number
  recent_average?: number
}

export interface PaginatedExpenses {
  items: Expense[]
  total: number
  page: number
  limit: number
}

export interface OCRResponse {
  amount: number
  category: string
  confidence: number
  raw_text: string
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['User', 'Expense'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<{ access_token: string; token_type: string }, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: credentials.email,
          password: credentials.password,
        }).toString(),
      }),
    }),
    register: builder.mutation<User, RegisterRequest>({
      query: (credentials) => ({
        url: 'auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => ({
        url: 'auth/me',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    
    // Expense endpoints
    getExpenses: builder.query<{ items: Expense[]; total: number }, { page?: number; limit?: number; category?: string; startDate?: string; endDate?: string; search?: string }>({
      query: (params) => ({
        url: 'expenses',
        params,
      }),
      providesTags: ['Expense'],
      transformResponse: (response: Expense[]) => {
        return {
          items: response,
          total: response.length
        }
      }
    }),
    getExpense: builder.query<Expense, number>({
      query: (id) => `expenses/${id}`,
      providesTags: ['Expense'],
    }),
    createExpense: builder.mutation<Expense, CreateExpenseRequest>({
      query: (expense) => ({
        url: 'expenses',
        method: 'POST',
        body: expense,
      }),
      invalidatesTags: ['Expense'],
    }),
    updateExpense: builder.mutation<Expense, { id: number; data: UpdateExpenseRequest }>({
      query: ({ id, data }) => ({
        url: `expenses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Expense'],
    }),
    deleteExpense: builder.mutation<void, number>({
      query: (id) => ({
        url: `expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Expense'],
    }),
    getExpenseSummary: builder.query<ExpenseSummary, { year: number; month: number }>({
      query: ({ year, month }) => ({
        url: `expenses/summary/${year}/${month}`,
      }),
    }),
    predictOverspend: builder.query<PredictionResponse, { category: string }>({
      query: ({ category }) => ({
        url: `expenses/predict/${category}`,
        method: 'POST',
      }),
    }),
    
    // OCR endpoint
    extractReceipt: builder.mutation<OCRResponse, FormData>({
      query: (formData) => ({
        url: 'ocr/extract',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useGetExpensesQuery,
  useGetExpenseQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseSummaryQuery,
  usePredictOverspendQuery,
  useExtractReceiptMutation,
} = api
