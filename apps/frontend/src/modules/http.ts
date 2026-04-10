import axios from "axios";
import { useAuthStore } from "../stores/auth-store";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api/v1",
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
