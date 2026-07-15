import axios from "axios";

const rawBase = import.meta.env.VITE_API_URL || "http://localhost:3000/";
export const API_ROOT = rawBase.replace(/\/$/, "");
export const API_BASE = `${API_ROOT}/api`;

const api = axios.create({ baseURL: API_BASE });

// Resolves a relative /uploads/... path (returned by the backend) into an absolute URL.
export const resolveFileUrl = (url) => {
  if (!url) return url;
  return url.startsWith("http") ? url : `${API_ROOT}${url}`;
};

export default api;
