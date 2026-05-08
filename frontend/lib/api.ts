import axios, { AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach auth token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('qp-auth')
      if (stored) {
        const { state } = JSON.parse(stored)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      }
    } catch {}
  }
  return config
})

// Handle errors gracefully
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string; detail?: string }>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('qp-auth')
        window.location.href = '/auth'
      }
    }
    const msg =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      'Something went wrong'
    return Promise.reject(new Error(msg))
  }
)

// Auth
export const authApi = {
  sendOtp: (email: string) => api.post('/api/auth/send-otp', { email }),
  verifyOtp: (email: string, otp: string) => api.post('/api/auth/verify-otp', { email, otp }),
  googleAuth: (data: { google_token: string; email: string; display_name?: string; avatar_url?: string }) =>
    api.post('/api/auth/google', data),
  me: () => api.get('/api/users/me'),
}

// Circuits
export const circuitsApi = {
  list: () => api.get('/api/circuits/'),
  get: (id: string) => api.get(`/api/circuits/${id}`),
  create: (data: any) => api.post('/api/circuits/', data),
  update: (id: string, data: any) => api.patch(`/api/circuits/${id}`, data),
  delete: (id: string) => api.delete(`/api/circuits/${id}`),
}

// Simulate
export const simulateApi = {
  run: (data: any) => api.post('/api/simulate/', data),
}

// Workflows
export const workflowsApi = {
  list: () => api.get('/api/workflows/'),
  create: (data: any) => api.post('/api/workflows/', data),
  run: (id: string) => api.post(`/api/workflows/${id}/run`),
}

// PQC
export const pqcApi = {
  scan: (data: any) => api.post('/api/pqc/scan', data),
  algorithms: () => api.get('/api/pqc/algorithms'),
}

// Optimize
export const optimizeApi = {
  run: (data: any) => api.post('/api/optimize/', data),
}

// Health
export const healthApi = {
  check: () => api.get('/api/health/'),
}
