import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ role, children }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Prevent unverified interns from accessing protected enclave routes
  if (user.role === 'intern' && user.isEmailVerified === false) {
    return <Navigate to="/verify-email-pending" state={{ email: user.email }} replace />
  }

  // If a specific role is required and user has different role, redirect to their home
  if (role && user.role !== role) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    } else {
      return <Navigate to="/intern/dashboard" replace />
    }
  }

  return children
}
