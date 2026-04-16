import React, { useEffect, useState } from "react";
import { deleteIdeaApi, getIdeasApi, createIdeaApi, updateIdeaApi } from "../api/ideasApi";
import { useAuth } from "../auth/AuthContext";

function parseTagsInput(tagsInput) {
  const raw = String(tagsInput || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return raw;
}

function StatusBadge({ status }) {
  return (
    <span className={`badge ${status === "published" ? "badgePublished" : "badgeDraft"}`}>
      {status === "published" ? "Published" : "Draft"}
    </span>
  );
}

export default function IdeasManager() {
  const { isLoading: authLoading } = useAuth();

  const [ideas, setIdeas] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    status: "draft",
  });

  const [key, setKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 450);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    async function loadTagsAndIdeas() {
      try {
        const data = await getIdeasApi({ limit: 200 });
        if (cancelled) return;
        const uniqueTags = new Set();
        data.forEach((i) => (i.tags || []).forEach((t) => uniqueTags.add(String(t).toLowerCase())));
        setTagOptions(Array.from(uniqueTags).sort((a, b) => a.localeCompare(b)));
      } catch (err) {
        if (cancelled) return;
        // Non-fatal: tag options will just be empty.
        setError(err?.response?.data?.message || err?.message || "Failed to load tag options");
      }
    }
    loadTagsAndIdeas();
    return () => {
      cancelled = true;
    };
  }, [authLoading]);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    async function fetchIdeas() {
      setLoading(true);
      setError(null);
      try {
        const tags = tagFilter ? [tagFilter] : undefined;
        const data = await getIdeasApi({
          status: statusFilter,
          tags,
          search: searchQuery || undefined,
          limit: 100,
        });
        if (cancelled) return;
        setIdeas(data);
      } catch (err) {
        if (cancelled) return;
        setError(err?.response?.data?.message || err?.message || "Failed to load ideas");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }
    fetchIdeas();
    return () => {
      cancelled = true;
    };
  }, [authLoading, statusFilter, searchQuery, tagFilter, key]);

  async function handleCreateOrUpdate(e) {
    e.preventDefault();

    const tags = parseTagsInput(form.tags);

    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await updateIdeaApi(editingId, {
          title: form.title,
          description: form.description,
          tags,
          status: form.status,
        });
      } else {
        await createIdeaApi({
          title: form.title,
          description: form.description,
          tags,
          status: form.status,
        });
      }

      setEditingId(null);
      setForm({ title: "", description: "", tags: "", status: "draft" });
      setKey((k) => k + 1);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(idea) {
    setEditingId(idea._id);
    setForm({
      title: idea.title || "",
      description: idea.description || "",
      tags: (idea.tags || []).join(", "),
      status: idea.status || "draft",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ title: "", description: "", tags: "", status: "draft" });
  }

  async function handleDelete(id) {
    const ok = window.confirm("Delete this idea?");
    if (!ok) return;

    setLoading(true);
    setError(null);
    try {
      await deleteIdeaApi(id);
      setKey((k) => k + 1);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(id, nextStatus) {
    try {
      await updateIdeaApi(id, { status: nextStatus });
      setKey((k) => k + 1);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Status update failed");
    }
  }

  const statusOptions = ["all", "draft", "published"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: -0.03 }}>Ideas Manager</div>
          <div className="muted" style={{ marginTop: 4 }}>
            Add, edit, delete, and move ideas between draft and published.
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="cardHeader">
          <div>
            <div style={{ fontWeight: 850 }}>Create / Edit Idea</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              {editingId ? "Editing an idea" : "Create a new content idea"}
            </div>
          </div>
        </div>

        <form onSubmit={handleCreateOrUpdate} className="formGrid">
          <div className="field">
            <label>Title</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g., How to build a creator portfolio"
              required
            />
          </div>

          <div className="field">
            <label>Status</label>
            <select
              className="select"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Description</label>
            <textarea
              className="textarea"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Short description that explains the idea."
              required
            />
          </div>

          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Tags (comma separated)</label>
            <input
              className="input"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="e.g., marketing, seo, growth"
            />
          </div>

          <div className="btnRow" style={{ gridColumn: "1 / -1" }}>
            <button className="btn btnPrimary" type="submit" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Idea" : "Add Idea"}
            </button>
            {editingId && (
              <button className="btn" type="button" onClick={cancelEdit} disabled={loading}>
                Cancel
              </button>
            )}
          </div>

          {error && (
            <div style={{ gridColumn: "1 / -1", color: "var(--danger)", fontSize: 13 }}>{error}</div>
          )}
        </form>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="cardHeader" style={{ marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 850 }}>Filters</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              Search by text, filter by status, and refine using tags.
            </div>
          </div>
        </div>

        <div className="btnRow" style={{ marginBottom: 12 }}>
          {statusOptions.map((s) => (
            <button
              key={s}
              type="button"
              className={`btn ${statusFilter === s ? "btnPrimary" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : s === "draft" ? "Draft" : "Published"}
            </button>
          ))}
        </div>

        <div className="formGrid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="field">
            <label>Search</label>
            <input
              className="input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search title or description"
            />
          </div>
          <div className="field">
            <label>Tag</label>
            <select
              className="select"
              value={tagFilter || ""}
              onChange={(e) => setTagFilter(e.target.value || null)}
            >
              <option value="">All tags</option>
              {tagOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="cardHeader" style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 850 }}>Your Ideas</div>
          <div className="muted" style={{ fontSize: 12 }}>
            {loading ? "Updating..." : `${ideas.length} item(s)`}
          </div>
        </div>

        {error && !loading && <div style={{ color: "var(--danger)", marginBottom: 12 }}>{error}</div>}
        {loading && <div className="muted">Loading ideas...</div>}

        {!loading && ideas.length === 0 && <div className="muted">No ideas match these filters.</div>}

        {!loading && ideas.length > 0 && (
          <div className="listGrid">
            {ideas.map((idea) => (
              <div key={idea._id} className="card" style={{ padding: 14 }}>
                <div className="cardHeader" style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 900, lineHeight: 1.2 }}>{idea.title}</div>
                  <StatusBadge status={idea.status} />
                </div>

                <div className="muted" style={{ fontSize: 13, lineHeight: 1.4 }}>
                  {idea.description.length > 160 ? `${idea.description.slice(0, 160)}...` : idea.description}
                </div>

                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(idea.tags || []).slice(0, 5).map((t) => (
                    <span key={t} className="tagPill">
                      {t}
                    </span>
                  ))}
                  {(idea.tags || []).length > 5 && <span className="muted" style={{ fontSize: 12 }}>+{(idea.tags || []).length - 5}</span>}
                </div>

                <div className="btnRow" style={{ marginTop: 12 }}>
                  <button className="btn" type="button" onClick={() => startEdit(idea)} disabled={loading}>
                    Edit
                  </button>
                  <button className="btn btnDanger" type="button" onClick={() => handleDelete(idea._id)} disabled={loading}>
                    Delete
                  </button>

                  <div style={{ flex: "1 1 auto" }} />

                  <div style={{ minWidth: 190 }}>
                    <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Mark as</div>
                    <select
                      className="select"
                      value={idea.status}
                      onChange={(e) => handleUpdateStatus(idea._id, e.target.value)}
                      disabled={loading}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

