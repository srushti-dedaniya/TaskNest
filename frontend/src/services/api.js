import axios from 'axios'

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://tasknest-backend-sayc.onrender.com/api'
    : 'http://localhost:5000/api')

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor: attach Bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tasknest_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: refresh expired session (httpOnly cookie) then retry once;
// format error messages for calling code
let refreshingPromise = null

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const config = error.config
    const status = error.response?.status

    if (
      status === 401 &&
      config &&
      !config._retried &&
      !config.url?.includes('/auth/login') &&
      !config.url?.includes('/auth/refresh')
    ) {
      config._retried = true
      try {
        refreshingPromise =
          refreshingPromise || apiClient.post('/auth/refresh').catch(() => {
            throw error
          })
        await refreshingPromise
        refreshingPromise = null
        return apiClient(config)
      } catch (refreshErr) {
        refreshingPromise = null
        return Promise.reject(refreshErr)
      }
    }

    const baseMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred'

    let message = baseMessage
    const details = error.response?.data?.details
    if (Array.isArray(details) && details.length > 0) {
      const fieldErrors = details.map((d) => d.message || `${d.field}: invalid`).join('. ')
      message = `${baseMessage}: ${fieldErrors}`
    } else if (typeof details === 'string' && details !== baseMessage) {
      message = `${baseMessage}: ${details}`
    }

    const customError = new Error(message)
    customError.status = status
    customError.data = error.response?.data
    customError.details = details
    return Promise.reject(customError)
  }
)

export const authService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  verifyEmail: (data) => apiClient.post('/auth/verify-email', data),
  resendVerification: (data) => apiClient.post('/auth/resend-verification', data),
  me: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/me', data),
  logout: () => apiClient.post('/auth/logout'),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data)
}

export const taskService = {
  list: (params) => apiClient.get('/tasks', { params }),
  get: (taskId) => apiClient.get(`/tasks/${taskId}`),
  create: (taskData) => apiClient.post('/tasks', taskData),
  update: (taskId, taskData) => apiClient.patch(`/tasks/${taskId}`, taskData),
  delete: (taskId) => apiClient.delete(`/tasks/${taskId}`),
  stats: () => apiClient.get('/stats/admin')
}

export const submissionService = {
  list: (params) => apiClient.get('/submissions', { params }),
  get: (submissionId) => apiClient.get(`/submissions/${submissionId}`),
  create: (data) => apiClient.post('/submissions', data),
  evaluate: (submissionId, reviewData) =>
    apiClient.post(`/submissions/${submissionId}/review`, reviewData)
}

export const userService = {
  list: () => apiClient.get('/users'),
  get: (internId) => apiClient.get(`/users/${internId}`),
  points: (internId) => (internId ? apiClient.get(`/users/${internId}/points`) : apiClient.get('/me/points'))
}

export const notificationService = {
  list: () => apiClient.get('/notifications'),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.post('/notifications/read-all')
}

export const aiService = {
  askHelp: (message, history = []) => apiClient.post('/ai/help', { message, history }),
  getSuggestedQuestions: () => apiClient.get('/ai/suggested-questions'),
  generateTaskDescription: (data) => apiClient.post('/ai/generate-task-description', data)
}

export const reminderService = {
  getMySchedule: () => apiClient.get('/reminders/my-schedule'),
  getOverview: () => apiClient.get('/reminders/overview'),
  triggerCheck: (now) => apiClient.post('/reminders/check', { now })
}

export default apiClient
