import axios, { type InternalAxiosRequestConfig } from "axios";

const baseURL =
  (typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_INTEGRATION_API_URL
    : process.env.REACT_APP_INTEGRATION_API_URL) || "";

export const integrationClient = axios.create({
  baseURL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

integrationClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
);
