import { http } from "./http";

export async function registerApi({ name, email, password }) {
  const res = await http.post("/api/auth/register", { name, email, password });
  return res.data; // { token, user }
}

export async function loginApi({ email, password }) {
  const res = await http.post("/api/auth/login", { email, password });
  return res.data; // { token, user }
}

export async function meApi() {
  const res = await http.get("/api/auth/me");
  return res.data; // { user }
}

