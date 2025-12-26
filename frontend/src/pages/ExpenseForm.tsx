import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { useDispatch, useSelector } from 'react-redux'
import { useGetExpenseQuery, useCreateExpenseMutation, useUpdateExpenseMutation, useExtractReceiptMutation } from '../store/api'
import { setLoading, addExpense, updateExpense } from '../store/slices/expensesSlice'
import type { RootState } from '../store'

interface ExpenseFormData {
  amount: number
  category: string
  date: string
  notes?: string
  receipt_url?: string
}

const ExpenseForm: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const dispatch = useDispatch()
  const { isLoading } = useSelector((state: RootState) => state.expenses)
  
  const isEditing = !!id
  const { data: expense, isLoading: expenseLoading } = useGetExpenseQuery(Number(id), {
    skip: !isEditing,
  })
  
  const [createExpense] = useCreateExpenseMutation()
  const [updateExpenseMutation] = useUpdateExpenseMutation()
  const [extractReceipt] = useExtractReceiptMutation()
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [ocrProcessing, setOcrProcessing] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ExpenseFormData>()

  // These must match the Category enum in the backend
  // These must match the Category enum in the backend exactly (lowercase)
  const categories = [
    'food',
    'travel',
    'entertainment',
    'shopping',
    'healthcare',
    'utilities',
    'education',
    'other'
  ]

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploadedFile(acceptedFiles[0])
        processReceipt(acceptedFiles[0])
      }
    }
  })

  const processReceipt = async (file: File) => {
    setOcrProcessing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await extractReceipt(formData).unwrap()
      
      // Populate form with OCR results
      setValue('amount', result.amount)
      setValue('category', result.category)
      setValue('notes', `OCR Extracted: ${result.raw_text}`)
      
    } catch (error) {
      console.error('OCR processing failed:', error)
    } finally {
      setOcrProcessing(false)
    }
  }

  useEffect(() => {
    if (expense && isEditing) {
      reset({
        amount: expense.amount,
        category: expense.category,
        date: expense.date.split('T')[0], // Format date for input
        notes: expense.notes || '',
        receipt_url: expense.receipt_url || ''
      })
    }
  }, [expense, isEditing, reset])

  const onSubmit = async (formData: ExpenseFormData) => {
    try {
      dispatch(setLoading(true));
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        throw new Error('Session expired. Please log in again.');
      }
      
      // Format the data to match backend expectations
      const expenseData = {
        amount: parseFloat(Number(formData.amount).toFixed(2)),
        category: formData.category,
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        notes: formData.notes?.trim() || undefined,
        receipt_url: formData.receipt_url?.trim() || undefined
      };
      
      console.log('Sending to backend:', JSON.stringify(expenseData, null, 2));
      
      const response = await fetch('http://localhost:8000/expenses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenseData)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          throw new Error('Session expired. Please log in again.');
        }
        
        // Handle validation errors
        if (response.status === 422 && responseData.detail) {
          if (Array.isArray(responseData.detail)) {
            const errorMessages = responseData.detail.map((err: any) => 
              `${err.loc ? err.loc.join('.') + ' - ' : ''}${err.msg}`
            ).join('\n');
            throw new Error(errorMessages);
          }
          throw new Error(responseData.detail);
        }
        throw new Error(responseData.detail || 'Failed to save expense');
      }

      dispatch(addExpense(responseData));
      navigate('/expenses');
    } catch (error: any) {
      console.error('Error saving expense:', error);
      alert(error.message || 'Failed to save expense. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  }

  if (expenseLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Expense' : 'Add New Expense'}
            </h1>
            <p className="mt-2 text-gray-600">
              {isEditing ? 'Update your expense details' : 'Track your expenses by adding a new entry'}
            </p>
          </div>

          <div className="card p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Receipt Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt Image (Optional)
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  {ocrProcessing ? (
                    <div className="space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="text-sm text-gray-600">Processing receipt...</p>
                    </div>
                  ) : uploadedFile ? (
                    <div className="space-y-2">
                      <svg className="w-12 h-12 text-success-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">OCR processed successfully</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        {isDragActive ? 'Drop the receipt here' : 'Drag & drop a receipt image, or click to select'}
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount *
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    {...register('amount', {
                      required: 'Amount is required',
                      min: {
                        value: 0.01,
                        message: 'Amount must be greater than 0',
                      },
                    })}
                    type="number"
                    step="0.01"
                    min="0.01"
                    className={`input pl-7 ${errors.amount ? 'border-error-300' : ''}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-error-600">{errors.amount.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  {...register('category', {
                    required: 'Category is required',
                  })}
                  className={`input ${errors.category ? 'border-error-300' : ''}`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-error-600">{errors.category.message}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <input
                  {...register('date', {
                    required: 'Date is required',
                  })}
                  type="date"
                  className={`input ${errors.date ? 'border-error-300' : ''}`}
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-error-600">{errors.date.message}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="input"
                  placeholder="Add any additional notes about this expense..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/expenses')}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || ocrProcessing}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    <span>{isEditing ? 'Update Expense' : 'Create Expense'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpenseForm
