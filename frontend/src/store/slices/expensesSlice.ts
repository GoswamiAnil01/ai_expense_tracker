import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

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

interface ExpensesState {
  expenses: Expense[]
  currentExpense: Expense | null
  isLoading: boolean
  error: string | null
  filters: {
    category?: string
    startDate?: string
    endDate?: string
  }
  pagination: {
    page: number
    limit: number
    total: number
  }
}

const initialState: ExpensesState = {
  expenses: [],
  currentExpense: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
}

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.expenses = action.payload
    },
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.unshift(action.payload)
    },
    updateExpense: (state, action: PayloadAction<Expense>) => {
      const index = state.expenses.findIndex(exp => exp.id === action.payload.id)
      if (index !== -1) {
        state.expenses[index] = action.payload
      }
    },
    removeExpense: (state, action: PayloadAction<number>) => {
      state.expenses = state.expenses.filter(exp => exp.id !== action.payload)
    },
    setCurrentExpense: (state, action: PayloadAction<Expense | null>) => {
      state.currentExpense = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<ExpensesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    setPagination: (state, action: PayloadAction<Partial<ExpensesState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setLoading,
  setError,
  setExpenses,
  addExpense,
  updateExpense,
  removeExpense,
  setCurrentExpense,
  setFilters,
  clearFilters,
  setPagination,
  clearError,
} = expensesSlice.actions

export default expensesSlice.reducer
