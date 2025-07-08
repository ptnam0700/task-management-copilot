import axios, { AxiosError } from "axios";
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskQuery,
  AuthLogin,
  AuthRegister,
  AuthResponse,
} from "./types";

const API_BASE_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Auth token helper ---
function getToken() {
  return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: any) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: any) => response,
  (error: AxiosError) => {
    if (error.response) {
      if (error.response.status === 401) {
        window.location.href = "/login";
      }
      if (error.response.status === 404) {
        // Optionally handle not found
      }
    }
    // Optionally extract error message
    return Promise.reject(error.response?.data || error);
  }
);

// --- Task management API ---
export const TaskAPI = {
  getAll: (params?: TaskQuery) =>
    api.get<{data: Task[]}>("/tasks", { params }).then((res) => res.data.data),
  getById: (id: number) =>
    api.get<{ success: boolean; data: Task }>(`/tasks/${id}`).then((res) => res.data.data),
  create: (data: TaskCreate) =>
    api.post<{ success: boolean; data: Task }>("/tasks", data).then((res) => res.data.data),
  update: (id: number, data: TaskUpdate) =>
    api.put<{ success: boolean; data: Task }>(`/tasks/${id}`, data).then((res) => res.data.data),
  delete: (id: number) =>
    api.delete(`/tasks/${id}`).then((res) => res.status === 204),
};

// --- Auth API ---
export const AuthAPI = {
  login: (data: AuthLogin) =>
    api.post<AuthResponse>("/auth/login", data).then((res) => res.data),
  register: (data: AuthRegister) =>
    api.post<AuthResponse>("/auth/register", data).then((res) => res.data),
  refreshToken: (refresh_token: string) =>
    api.post<AuthResponse>("/auth/refresh-token", { refresh_token }).then((res) => res.data),
};

export default api;