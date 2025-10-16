import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Prefer Expo public env var (EXPO_PUBLIC_API_BASE). Fallback to localhost
const API_BASE = (process.env.EXPO_PUBLIC_API_BASE as string) ?? 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // attach auth token here if needed in the future
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error('API response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('API request error (no response):', error.request);
    } else {
      console.error('API error:', error.message);
    }
    return Promise.reject(error);
  }
);

export async function get<T = any>(url: string, params?: object): Promise<AxiosResponse<T>> {
  return api.get<T>(url, { params });
}

export async function post<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
  return api.post<T>(url, data);
}

export async function put<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
  return api.put<T>(url, data);
}

export async function del<T = any>(url: string): Promise<AxiosResponse<T>> {
  return api.delete<T>(url);
}

export default api;
