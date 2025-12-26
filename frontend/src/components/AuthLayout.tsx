import React from 'react'
import { Outlet, Link } from 'react-router-dom'

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-900">AI Expense Tracker</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Manage your expenses with AI
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Track, categorize, and predict your spending patterns
        </p>
      </div>

      {/* Main Content */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          &copy; 2024 AI Expense Tracker. All rights reserved.
        </p>
        <div className="mt-2 space-x-4">
          <a href="#" className="text-gray-400 hover:text-gray-600 text-xs">Privacy</a>
          <a href="#" className="text-gray-400 hover:text-gray-600 text-xs">Terms</a>
          <a href="#" className="text-gray-400 hover:text-gray-600 text-xs">Support</a>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
