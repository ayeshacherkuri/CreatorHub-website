import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, authError, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [localError, setLocalError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);

    const result = await signup({ name, email, password });
    if (result.ok) {
      navigate("/", { replace: true });
    } else {
      setLocalError(authError || "Signup failed");
    }
  }

  return (
    <div className="page" style={{ maxWidth: 460, margin: "0 auto" }}>
      <div className="card">
        <div className="cardHeader">
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Create account</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              Join Creator Hub to manage ideas and drafts
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="formGrid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="field">
            <label>Name (optional)</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label>Password (min 6 chars)</label>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="btnRow" style={{ marginTop: 6 }}>
            <button className="btn btnPrimary" type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Signup"}
            </button>
            <button className="btn" type="button" onClick={() => navigate("/login")}>
              I have an account
            </button>
          </div>

          {(localError || authError) && (
            <div className="card" style={{ background: "transparent", padding: 0, border: "none" }}>
              <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 2 }}>
                {localError || authError}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

