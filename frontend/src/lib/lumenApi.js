import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const LUMEN_API = `${BACKEND_URL}/api/lumen`;

const lumenApi = axios.create({ baseURL: LUMEN_API, withCredentials: true });

lumenApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("lumen_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function lumenErr(detail) {
  if (detail == null) return "Something went wrong.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => (e && e.msg) || JSON.stringify(e)).join(" ");
  return String(detail);
}

export default lumenApi;
