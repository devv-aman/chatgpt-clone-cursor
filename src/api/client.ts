import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { API_CONFIG, API_ENDPOINTS } from "@/constants/api";

interface ApiError {
  message: string;
  status: number;
  code?: string;
  data?: unknown;
}

interface ApiErrorResponse {
  message?: string;
  code?: string;
}

// Token storage
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const tokenStorage = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshToken,
  setTokens: (access: string | null, refresh: string | null) => {
    accessToken = access;
    refreshToken = refresh;
    // Optionally persist to localStorage for page refresh persistence
    if (access) {
      localStorage.setItem("access_token", access);
    } else {
      localStorage.removeItem("access_token");
    }
    if (refresh) {
      localStorage.setItem("refresh_token", refresh);
    } else {
      localStorage.removeItem("refresh_token");
    }
  },
  clearTokens: () => {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
  loadFromStorage: () => {
    accessToken = localStorage.getItem("access_token");
    refreshToken = localStorage.getItem("refresh_token");
  },
};

// Load tokens from localStorage on module init
tokenStorage.loadFromStorage();

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: {
    [API_CONFIG.HEADERS.CONTENT_TYPE]: API_CONFIG.CONTENT_TYPES.JSON,
    [API_CONFIG.HEADERS.ACCEPT]: API_CONFIG.CONTENT_TYPES.JSON,
  },
});

// Request interceptor - add Authorization header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
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
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 errors - attempt token refresh
    // Exclude auth endpoints that should not trigger refresh
    // Note: /me endpoint SHOULD trigger refresh, only exclude login/register/refresh
    const isAuthEndpoint =
      originalRequest.url === API_ENDPOINTS.AUTH.REFRESH ||
      originalRequest.url === API_ENDPOINTS.AUTH.LOGIN ||
      originalRequest.url === API_ENDPOINTS.AUTH.REGISTER;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint &&
      tokenStorage.getRefreshToken()
    ) {
      if (isRefreshing) {
        // Queue the request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
          refreshToken: tokenStorage.getRefreshToken(),
        });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data.data;
        tokenStorage.setTokens(newAccessToken, newRefreshToken);
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        tokenStorage.clearTokens();
        // Redirect to login on refresh failure
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const apiError: ApiError = {
      message: "An unexpected error occurred",
      status: error.response?.status || 500,
      data: error.response?.data,
    };

    if (error.response) {
      const responseData = error.response.data as ApiErrorResponse | undefined;
      apiError.code = responseData?.code;

      // Server responded with error status
      switch (error.response.status) {
        case 401:
          apiError.message =
            responseData?.message || "Unauthorized. Please log in again.";
          break;
        case 403:
          apiError.message =
            "You do not have permission to access this resource.";
          break;
        case 404:
          apiError.message = "The requested resource was not found.";
          break;
        case 409:
          apiError.message = responseData?.message || "A conflict occurred.";
          break;
        case 422:
          apiError.message = responseData?.message || "Validation error.";
          break;
        case 500:
          apiError.message = "A server error occurred. Please try again later.";
          break;
        default:
          apiError.message = responseData?.message || "An error occurred";
      }
    } else if (error.request) {
      // Request was made but no response received
      apiError.message =
        "No response from server. Please check your connection.";
    }

    return Promise.reject(apiError);
  }
);

export { apiClient };
export type { ApiError };
