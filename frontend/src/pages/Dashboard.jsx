import React, { useEffect, useMemo, useState } from "react";
import { getIdeasApi } from "../api/ideasApi";
import { useAuth } from "../auth/AuthContext";

function StatCard({ title, value, variant }) {
  const badgeClass =
    variant === "danger" ? "badgeDraft" : variant === "success" ? "badgePublished" : "";

  return (
    <div className="card">
      <div className="cardHeader" style={{ marginBottom: 6 }}>
        <div className="muted" style={{ fontSize: 13 }}>
          {title}
        </div>
        <div className={`badge ${badgeClass}`} style={{ border: "1px solid var(--border)" }}>
          {variant === "primary" ? "Total" : variant === "danger" ? "Draft" : "Published"}
        </div>
      </div>
      <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -0.03 }}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const { isLoading: authLoading } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await getIdeasApi({ limit: 200 });
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

    if (!authLoading) load();
    return () => {
      cancelled = true;
    };
  }, [authLoading]);

  const stats = useMemo(() => {
    const total = ideas.length;
    const drafts = ideas.filter((i) => i.status === "draft").length;
    const published = ideas.filter((i) => i.status === "published").length;
    return { total, drafts, published };
  }, [ideas]);

  const recent = useMemo(() => {
    return [...ideas].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  }, [ideas]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: -0.03 }}>Dashboard</div>
          <div className="muted" style={{ marginTop: 4 }}>
            Track your ideas from draft to published
          </div>
        </div>
      </div>

      {(loading || authLoading) && <div className="muted" style={{ marginTop: 16 }}>Loading...</div>}
      {error && <div style={{ color: "var(--danger)", marginTop: 16 }}>{error}</div>}

      {!loading && !error && (
        <>
          <div className="gridCards" style={{ marginTop: 16 }}>
            <StatCard title="Total Ideas" value={stats.total} variant="primary" />
            <StatCard title="Published Posts" value={stats.published} variant="success" />
            <StatCard title="Drafts" value={stats.drafts} variant="danger" />
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Recent</div>
            <div className="listGrid">
              {recent.map((idea) => (
                <div key={idea._id} className="card" style={{ padding: 14 }}>
                  <div className="cardHeader" style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 800 }}>{idea.title}</div>
                    <span
                      className={`badge ${idea.status === "published" ? "badgePublished" : "badgeDraft"}`}
                      title={idea.status}
                    >
                      {idea.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: 13, lineHeight: 1.4 }}>
                    {idea.description}
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(idea.tags || []).slice(0, 4).map((t) => (
                      <span key={t} className="tagPill">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {recent.length === 0 && <div className="muted">No ideas yet. Create one in `Ideas Manager`.</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

