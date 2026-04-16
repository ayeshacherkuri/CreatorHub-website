import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="sidebar" aria-label="Sidebar navigation">
      <div className="brand">
        <div>
          <div className="brandTitle">Creator Hub</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
            Ideas to published posts
          </div>
        </div>
      </div>

      <nav className="nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/ideas"
          className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
        >
          Ideas Manager
        </NavLink>
        <NavLink
          to="/ai"
          className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
        >
          AI Generator
        </NavLink>
      </nav>

      <div className="sidebarFooter">
        <button className="btn" onClick={toggleTheme} type="button">
          {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
        </button>

        <div className="muted" style={{ fontSize: 12 }}>
          {user?.email ? `Signed in as ${user.email}` : ""}
        </div>

        <button className="btn btnDanger" onClick={handleLogout} type="button">
          Logout
        </button>
      </div>
    </aside>
  );
}

