import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'

const Home: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100">
      <div className="container">
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI Expense Tracker
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Track your expenses with AI-powered receipt scanning and intelligent spending predictions
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="btn btn-primary text-lg px-8 py-3"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    to="/expenses/new"
                    className="btn btn-secondary text-lg px-8 py-3"
                  >
                    Add Expense
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/register"
                    className="btn btn-primary text-lg px-8 py-3"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/auth/login"
                    className="btn btn-secondary text-lg px-8 py-3"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Tracking</h3>
                <p className="text-gray-600">
                  Automatically categorize and track expenses with intelligent receipt scanning
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Predictions</h3>
                <p className="text-gray-600">
                  Get spending insights and predictions to help you make better financial decisions
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h3>
                <p className="text-gray-600">
                  Your financial data is encrypted and secure with bank-level security
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-8 text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text font-medium text-gray-900">OCR Receipt Scanning</h4>
                    <p className="text-sm text-gray-600">Upload receipts and let AI extract expense details automatically</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text font-medium text-gray-900">Smart Categorization</h4>
                    <p className="text-sm text-gray-600">Automatically categorize expenses based on receipt content</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text font-medium text-gray-900">Spending Analytics</h4>
                    <p className="text-sm text-gray-600">Visualize spending patterns with interactive charts and graphs</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text font-medium text-gray-900">Budget Predictions</h4>
                    <p className="text-sm text-gray-600">AI-powered predictions to help you avoid overspending</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
