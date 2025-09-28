import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3008/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Debug log para verificar a URL sendo usada
console.log('🔗 API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:3008/api')

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken,
          })
          
          const { token } = response.data
          localStorage.setItem('token', token)
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    if (error.response?.status >= 500) {
      toast.error('Erro interno do servidor. Tente novamente mais tarde.')
    } else if (error.response?.status === 404) {
      toast.error('Recurso não encontrado.')
    } else if (error.response?.status === 403) {
      toast.error('Acesso negado.')
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Tempo limite de conexão excedido.')
    } else if (!error.response) {
      toast.error('Erro de conexão. Verifique sua internet.')
    }

    return Promise.reject(error)
  }
)

export default api