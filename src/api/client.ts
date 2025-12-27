import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { API_CONFIG } from '@/constants/api';

interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    [API_CONFIG.HEADERS.CONTENT_TYPE]: API_CONFIG.CONTENT_TYPES.JSON,
    [API_CONFIG.HEADERS.ACCEPT]: API_CONFIG.CONTENT_TYPES.JSON,
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers[API_CONFIG.HEADERS.AUTHORIZATION] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: error.response?.status || 500,
      data: error.response?.data,
    };

    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Handle unauthorized - could redirect to login
          localStorage.removeItem('auth_token');
          apiError.message = 'Unauthorized. Please log in again.';
          break;
        case 403:
          apiError.message = 'You do not have permission to access this resource.';
          break;
        case 404:
          apiError.message = 'The requested resource was not found.';
          break;
        case 500:
          apiError.message = 'A server error occurred. Please try again later.';
          break;
        default:
          apiError.message =
            (error.response.data as { message?: string })?.message ||
            'An error occurred';
      }
    } else if (error.request) {
      // Request was made but no response received
      apiError.message = 'No response from server. Please check your connection.';
    }

    return Promise.reject(apiError);
  }
);

export { apiClient };
export type { ApiError };

