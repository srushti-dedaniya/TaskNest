import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.jsx'
import InternLayout from '../layouts/InternLayout.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'

// Common & Public
import Landing from '../pages/common/Landing.jsx'
import NotFound from '../pages/common/NotFound.jsx'
import Notifications from '../pages/common/Notifications.jsx'
import Unauthorized from '../pages/common/Unauthorized.jsx'
import Login from '../pages/auth/Login.jsx'
import Register from '../pages/auth/Register.jsx'
import ForgotPassword from '../pages/auth/ForgotPassword.jsx'
import ResetPassword from '../pages/auth/ResetPassword.jsx'
import VerifyEmailPending from '../pages/auth/VerifyEmailPending.jsx'
import VerifyEmail from '../pages/auth/VerifyEmail.jsx'

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard.jsx'
import AdminManageTasks from '../pages/admin/ManageTasks.jsx'
import AdminTaskDetails from '../pages/admin/AdminTaskDetails.jsx'
import AdminCreateTask from '../pages/admin/CreateTask.jsx'
import AdminReviews from '../pages/admin/Reviews.jsx'
import AdminEvaluateSubmission from '../pages/admin/EvaluateSubmission.jsx'
import AdminInternManagement from '../pages/admin/InternManagement.jsx'
import AdminInternDetails from '../pages/admin/InternDetails.jsx'
import AdminSettings from '../pages/admin/Settings.jsx'

// Intern Pages
import InternDashboard from '../pages/intern/Dashboard.jsx'
import InternDailyTasks from '../pages/intern/DailyTasks.jsx'
import InternWeeklyGoals from '../pages/intern/WeeklyGoals.jsx'
import InternTaskDetails from '../pages/intern/TaskDetails.jsx'
import InternSubmitTask from '../pages/intern/SubmitTask.jsx'
import InternSubmissions from '../pages/intern/Submissions.jsx'
import InternSubmissionDetails from '../pages/intern/SubmissionDetails.jsx'
import InternPoints from '../pages/intern/Points.jsx'
import InternProfile from '../pages/intern/Profile.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      {/* === Public Routes === */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email-pending" element={<VerifyEmailPending />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* === Intern Routes (Protected + InternLayout) === */}
      <Route
        path="/intern/dashboard"
        element={
          <ProtectedRoute role="intern">
            <InternLayout>
              <InternDashboard />
            </InternLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/intern/daily-tasks"
        element={
          <ProtectedRoute role="intern">
            <InternLayout>
              <InternDailyTasks />
            </InternLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/intern/weekly-goals"
        element={
          <ProtectedRoute role="intern">
            <InternLayout>
              <InternWeeklyGoals />
            </InternLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/intern/tasks/:taskId"
        element={
          <ProtectedRoute role="intern">
            <InternLayout>
              <InternTaskDetails />
            </InternLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/intern/tasks/:taskId/submit"
        element={
          <ProtectedRoute role="intern">
            <InternLayout>
              <InternSubmitTask />
            </InternLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/intern/submissions"
        element={
          <ProtectedRoute role="intern">
            <InternLayout>
              <InternSubmissions />
            </InternLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/intern/submissions/:submissionId"
        element={
          <ProtectedRoute role="intern">
            <InternLayout>
              <InternSubmissionDetails />
            </InternLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/intern/points"
        element={
          <ProtectedRoute role="intern">
            <InternLayout>
              <InternPoints />
            </InternLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/intern/profile"
        element={
          <ProtectedRoute role="intern">
            <InternLayout>
              <InternProfile />
            </InternLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/intern/notifications"
        element={
          <ProtectedRoute role="intern">
            <InternLayout>
              <Notifications />
            </InternLayout>
          </ProtectedRoute>
        }
      />

      {/* === Admin Routes (Protected + AdminLayout) === */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tasks"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout>
              <AdminManageTasks />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tasks/create"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout>
              <AdminCreateTask />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tasks/:taskId"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout>
              <AdminTaskDetails />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/submissions"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout>
              <AdminReviews />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/submissions/:submissionId/review"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout>
              <AdminEvaluateSubmission />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/interns"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout>
              <AdminInternManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/interns/:internId"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout>
              <AdminInternDetails />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout>
              <Notifications />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* === Convenient Aliases and Redirects === */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/overview" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/create-task" element={<Navigate to="/admin/tasks/create" replace />} />
      <Route path="/admin/task-management" element={<Navigate to="/admin/tasks" replace />} />
      <Route path="/admin/reviews" element={<Navigate to="/admin/submissions" replace />} />
      <Route path="/admin/evaluate" element={<Navigate to="/admin/submissions" replace />} />
      <Route path="/admin/fellow-management" element={<Navigate to="/admin/interns" replace />} />
      <Route path="/admin/fellow-details" element={<Navigate to="/admin/interns" replace />} />
      <Route path="/admin/settings" element={<Navigate to="/admin/profile" replace />} />

      <Route path="/intern" element={<Navigate to="/intern/dashboard" replace />} />
      <Route path="/intern/tasks" element={<Navigate to="/intern/daily-tasks" replace />} />
      <Route path="/intern/goals" element={<Navigate to="/intern/weekly-goals" replace />} />
      <Route path="/intern/task-details" element={<Navigate to="/intern/tasks/task-01" replace />} />
      <Route path="/intern/submit" element={<Navigate to="/intern/tasks/task-01/submit" replace />} />
      <Route path="/notifications" element={<Navigate to="/intern/notifications" replace />} />

      {/* === Fallbacks === */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
