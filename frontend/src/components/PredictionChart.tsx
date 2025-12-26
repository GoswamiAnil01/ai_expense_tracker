import React, { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { usePredictOverspendQuery } from '../store/api'

interface PredictionData {
  month: string
  actual: number
  predicted: number
  overspend: number
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
  }>
  label?: string
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const PredictionChart: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('food')
  
  const { data: prediction, isLoading, error } = usePredictOverspendQuery({ category: selectedCategory })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

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

  // Generate mock historical data for visualization
  const historicalData = useMemo((): PredictionData[] => {
    const data: PredictionData[] = []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    
    // Use a simple seed based on category for consistent mock data
    const seed = selectedCategory.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const random = (index: number) => {
      const x = Math.sin(seed + index) * 10000
      return x - Math.floor(x)
    }
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const actual = random(i) * 500 + 200
      const predicted = i === 0 ? (prediction?.prediction || actual) : actual * (1 + (random(i + 10) - 0.5) * 0.3)
      
      data.push({
        month: months[monthIndex],
        actual: Math.round(actual * 100) / 100,
        predicted: Math.round(predicted * 100) / 100,
        overspend: Math.round(Math.max(0, predicted - actual) * 100) / 100
      })
    }
    
    return data
  }, [selectedCategory, prediction])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load predictions</p>
        <p className="text-sm text-gray-400 mt-1">Try again later</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Category for Prediction
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Prediction Summary */}
      {prediction && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Predicted Next Month</p>
                <p className="text-lg font-bold text-blue-900">
                  {formatCurrency(prediction.prediction || 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Recent Average</p>
                <p className="text-lg font-bold text-green-900">
                  {formatCurrency(prediction.recent_average || 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">Predicted Overspend</p>
                <p className="text-lg font-bold text-red-900">
                  {formatCurrency(prediction.predicted_overspend || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              name="Actual Spending"
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#10b981', r: 4 }}
              name="Predicted Spending"
            />
            <Line
              type="monotone"
              dataKey="overspend"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 4 }}
              name="Overspend Amount"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">AI Insights</h3>
        <div className="space-y-2">
          {prediction && prediction.predicted_overspend > 0 ? (
            <div className="flex items-start">
              <div className="w-2 h-2 bg-warning-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                Based on your spending patterns, you might overspend by{' '}
                <span className="font-medium text-warning-700">
                  {formatCurrency(prediction.predicted_overspend)}
                </span>{' '}
                next month in {selectedCategory}.
              </p>
            </div>
          ) : (
            <div className="flex items-start">
              <div className="w-2 h-2 bg-success-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                Your {selectedCategory} spending is on track. No overspend predicted for next month.
              </p>
            </div>
          )}
          
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
            <p className="text-sm text-gray-600">
              Prediction confidence: <span className="font-medium">{Math.round((prediction?.confidence || 0) * 100)}%</span>
              {' '}based on {prediction?.data_points || 0} historical data points.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PredictionChart
