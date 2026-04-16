import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("creatorHubTheme");
    return stored === "dark" || stored === "light" ? stored : "light";
  });

  useEffect(() => {
    localStorage.setItem("creatorHubTheme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo(() => {
    return {
      theme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

