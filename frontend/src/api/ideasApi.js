import { http } from "./http";

export async function getIdeasApi({ status, tags, search, limit, page } = {}) {
  const params = {};
  if (status && status !== "all") params.status = status;
  if (search) params.search = search;
  if (Array.isArray(tags) && tags.length > 0) params.tags = tags.join(",");
  if (limit) params.limit = limit;
  if (page) params.page = page;

  const res = await http.get("/api/ideas", { params });
  return res.data;
}

export async function createIdeaApi({ title, description, tags, status }) {
  const res = await http.post("/api/ideas", { title, description, tags, status });
  return res.data;
}

export async function updateIdeaApi(id, { title, description, tags, status }) {
  const res = await http.put(`/api/ideas/${id}`, { title, description, tags, status });
  return res.data;
}

export async function deleteIdeaApi(id) {
  const res = await http.delete(`/api/ideas/${id}`);
  return res.data;
}

