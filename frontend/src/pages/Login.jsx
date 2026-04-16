import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, authError, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [localError, setLocalError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);

    const result = await login({ email, password });
    if (result.ok) {
      navigate("/", { replace: true });
    } else {
      setLocalError(authError || "Login failed");
    }
  }

  return (
    <div className="page" style={{ maxWidth: 460, margin: "0 auto" }}>
      <div className="card">
        <div className="cardHeader">
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Login</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              Access your Creator Hub workspace
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="formGrid" style={{ gridTemplateColumns: "1fr" }}>
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
            <label>Password</label>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="btnRow" style={{ marginTop: 6 }}>
            <button className="btn btnPrimary" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Login"}
            </button>
            <button className="btn" type="button" onClick={() => navigate("/signup")}>
              Create account
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

