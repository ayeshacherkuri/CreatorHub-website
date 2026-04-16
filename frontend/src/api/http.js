import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const http = axios.create({
  baseURL: API_BASE_URL || undefined, // when empty, Vite dev server will proxy `/api`
});

export function setAuthToken(token) {
  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete http.defaults.headers.common.Authorization;
  }
}

export function extractErrorMessage(err) {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.message) return err.message;
  return "Request failed";
}

