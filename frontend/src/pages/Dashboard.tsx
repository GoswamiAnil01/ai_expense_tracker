import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import type { RootState } from '../store'
import type { Expense, ExpenseSummary } from '../store/api'
import { useGetExpensesQuery, useGetExpenseSummaryQuery } from '../store/api'
import PredictionChart from '../components/PredictionChart'
import PDFExport from '../components/PDFExport'

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [selectedMonth] = useState(new Date())
  
  const { data: expenses, isLoading: expensesLoading } = useGetExpensesQuery({
    limit: 10,
  })
  
  const { data: summary, isLoading: summaryLoading } = useGetExpenseSummaryQuery({
    year: selectedMonth.getFullYear(),
    month: selectedMonth.getMonth() + 1,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food: 'bg-blue-500',
      travel: 'bg-green-500',
      entertainment: 'bg-purple-500',
      shopping: 'bg-pink-500',
      healthcare: 'bg-red-500',
      utilities: 'bg-yellow-500',
      education: 'bg-indigo-500',
      other: 'bg-gray-500',
    }
    return colors[category] || colors.other
  }

  if (expensesLoading || summaryLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <div className="mt-2">
            <p className="text-gray-600">Welcome back, {user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary-600 rounded"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary?.grand_total || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-success-600 rounded"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary?.grand_total || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-warning-600 rounded"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary?.categories?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-purple-600 rounded"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {expenses?.items?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Monthly Overview</h2>
              <PDFExport data={summary} />
            </div>
            
            {summary?.categories?.length ? (
              <div className="space-y-3">
                {summary.categories.map((category: ExpenseSummary['categories'][0], index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(category.category)} mr-3`}></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(category.total)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {category.count} transactions
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No expenses this month</p>
                <Link
                  to="/expenses/new"
                  className="mt-2 inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
                >
                  Add your first expense →
                </Link>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending Predictions</h2>
            <PredictionChart />
          </div>
        </div>

        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
              <Link
                to="/expenses"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View all →
              </Link>
            </div>
          </div>
          
          <div className="overflow-hidden">
            {expenses?.items?.length ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses?.items.slice(0, 5).map((expense: Expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {expense.notes || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)} text-white`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(expense.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No expenses yet</p>
                <Link
                  to="/expenses/new"
                  className="mt-2 inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
                >
                  Add your first expense →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
