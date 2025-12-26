import { createBrowserRouter, Navigate } from 'react-router-dom'

// Layout components
import Layout from '../components/Layout'
import AuthLayout from '../components/AuthLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import PublicRoute from '../components/PublicRoute'

// Page components (will be created)
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import ExpenseForm from '../pages/ExpenseForm'
import ExpenseList from '../pages/ExpenseList'
import Profile from '../pages/Profile'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'expenses',
        element: (
          <ProtectedRoute>
            <ExpenseList />
          </ProtectedRoute>
        )
      },
      {
        path: 'expenses/new',
        element: (
          <ProtectedRoute>
            <ExpenseForm />
          </ProtectedRoute>
        )
      },
      {
        path: 'expenses/:id/edit',
        element: (
          <ProtectedRoute>
            <ExpenseForm />
          </ProtectedRoute>
        )
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )
      }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        )
      },
      {
        path: 'register',
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        )
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
])

export default router
