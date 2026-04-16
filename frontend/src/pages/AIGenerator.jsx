import React, { useMemo, useState } from "react";
import { createIdeaApi } from "../api/ideasApi";
import { generateMockIdeas } from "../utils/mockAi";

function GeneratedIdeaCard({ idea, onAdd }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="cardHeader" style={{ marginBottom: 8 }}>
        <div style={{ fontWeight: 900 }}>{idea.title}</div>
        <span className="badge badgeDraft">Draft</span>
      </div>
      <div className="muted" style={{ fontSize: 13, lineHeight: 1.4 }}>
        {idea.description}
      </div>
      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(idea.tags || []).slice(0, 6).map((t) => (
          <span key={t} className="tagPill">
            {t}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <button className="btn btnPrimary" type="button" onClick={onAdd}>
          Add
        </button>
      </div>
    </div>
  );
}

export default function AIGenerator() {
  const [topic, setTopic] = useState("");
  const [generated, setGenerated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canGenerate = useMemo(() => topic.trim().length > 0, [topic]);

  function handleGenerate() {
    setError(null);
    const ideas = generateMockIdeas(topic);
    setGenerated(ideas);
  }

  async function addAll() {
    setLoading(true);
    setError(null);
    try {
      for (const idea of generated) {
        await createIdeaApi({
          title: idea.title,
          description: idea.description,
          tags: idea.tags || [],
          status: "draft",
        });
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to add generated ideas");
    } finally {
      setLoading(false);
    }
  }

  async function addOne(idea) {
    setLoading(true);
    setError(null);
    try {
      await createIdeaApi({
        title: idea.title,
        description: idea.description,
        tags: idea.tags || [],
        status: "draft",
      });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to add idea");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: -0.03 }}>AI Idea Generator</div>
          <div className="muted" style={{ marginTop: 4 }}>
            Enter a topic and generate draft content ideas (mock generator).
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="cardHeader">
          <div style={{ fontWeight: 850 }}>Generate</div>
        </div>

        <div className="formGrid">
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Topic</label>
            <input
              className="input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., personal branding for engineers"
            />
          </div>

          <div className="btnRow" style={{ gridColumn: "1 / -1" }}>
            <button className="btn btnPrimary" type="button" onClick={handleGenerate} disabled={!canGenerate}>
              Generate Ideas
            </button>
            <button className="btn" type="button" onClick={() => setGenerated([])} disabled={loading}>
              Clear
            </button>
          </div>
        </div>

        {error && <div style={{ color: "var(--danger)", marginTop: 10, fontSize: 13 }}>{error}</div>}
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="cardHeader" style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 850 }}>Generated Drafts</div>
          <div className="muted" style={{ fontSize: 12 }}>{generated.length ? `${generated.length} idea(s)` : ""}</div>
        </div>

        {generated.length === 0 && <div className="muted">No ideas generated yet. Enter a topic and click `Generate Ideas`.</div>}

        {generated.length > 0 && (
          <>
            <div className="btnRow" style={{ marginBottom: 12 }}>
              <button className="btn btnPrimary" type="button" onClick={addAll} disabled={loading}>
                {loading ? "Adding..." : "Add All to My Ideas"}
              </button>
            </div>

            <div className="gridCards" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
              {generated.map((idea, idx) => (
                <GeneratedIdeaCard key={`${idea.title}-${idx}`} idea={idea} onAdd={() => addOne(idea)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

