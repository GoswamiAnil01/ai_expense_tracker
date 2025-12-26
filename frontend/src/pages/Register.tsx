import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice'
import { useRegisterMutation } from '../store/api'
import type { RootState } from '../store'

interface RegisterFormData {
  first_name: string
  last_name: string
  mobile_number?: string
  email: string
  password: string
  confirmPassword: string
}

interface ApiError {
  data?: {
    detail?: string
  }
}

const Register: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isLoading, error } = useSelector((state: RootState) => state.auth)
  const [registerMutation] = useRegisterMutation()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>()

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      dispatch(loginStart())
      const result = await registerMutation({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        mobile_number: data.mobile_number,
        password: data.password,
      }).unwrap()
      dispatch(loginSuccess(result))
      navigate('/dashboard')
    } catch (err) {
      let errorMessage = 'Registration failed'
      
      if (err && typeof err === 'object') {
        if ('data' in err && typeof err.data === 'object' && err.data !== null) {
          errorMessage = (err.data as any)?.detail || errorMessage
        } else if ('message' in err && typeof err.message === 'string') {
          errorMessage = err.message
        } else if ('status' in err && typeof err.status === 'number') {
          errorMessage = `Registration failed with status ${err.status}`
        }
      } else if (typeof err === 'string') {
        errorMessage = err
      }
      
      dispatch(loginFailure(errorMessage))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/auth/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                {...register('first_name', {
                  required: 'First name is required',
                })}
                type="text"
                autoComplete="given-name"
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.first_name ? 'border-error-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your first name"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-error-600">{errors.first_name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                {...register('last_name', {
                  required: 'Last name is required',
                })}
                type="text"
                autoComplete="family-name"
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.last_name ? 'border-error-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your last name"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-error-600">{errors.last_name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700">
                Mobile Number (Optional)
              </label>
              <input
                {...register('mobile_number', {
                  pattern: {
                    value: /^[0-9+\-\s()]*$/,
                    message: 'Invalid mobile number format',
                  },
                })}
                type="tel"
                autoComplete="tel"
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.mobile_number ? 'border-error-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your mobile number"
              />
              {errors.mobile_number && (
                <p className="mt-1 text-sm text-error-600">{errors.mobile_number.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                autoComplete="email"
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-error-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                type="password"
                autoComplete="new-password"
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-error-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value: string) =>
                    value === password || 'Passwords do not match',
                })}
                type="password"
                autoComplete="new-password"
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-error-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-error-50 p-4">
              <div className="text-sm text-error-800">
                {typeof error === 'string' ? error : 'An error occurred'}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
