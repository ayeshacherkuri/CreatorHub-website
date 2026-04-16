import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { extractErrorMessage, setAuthToken } from "../api/http";
import { loginApi, meApi, registerApi } from "../api/authApi";

const AuthContext = createContext(null);

const TOKEN_KEY = "creatorHubToken";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    setAuthToken(token);
    let cancelled = false;

    async function loadMe() {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const data = await meApi();
        if (cancelled) return;
        setUser(data.user);
      } catch (err) {
        if (cancelled) return;
        setAuthError(extractErrorMessage(err));
        // Token is stale/invalid; clear it.
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function login(payload) {
    setAuthError(null);
    setIsLoading(true);
    try {
      const data = await loginApi(payload);
      const nextToken = data.token;
      localStorage.setItem(TOKEN_KEY, nextToken);
      setToken(nextToken);
      setUser(data.user);
      setAuthToken(nextToken);
      return { ok: true };
    } catch (err) {
      setAuthError(extractErrorMessage(err));
      return { ok: false };
    } finally {
      setIsLoading(false);
    }
  }

  async function signup(payload) {
    setAuthError(null);
    setIsLoading(true);
    try {
      const data = await registerApi(payload);
      const nextToken = data.token;
      localStorage.setItem(TOKEN_KEY, nextToken);
      setToken(nextToken);
      setUser(data.user);
      setAuthToken(nextToken);
      return { ok: true };
    } catch (err) {
      setAuthError(extractErrorMessage(err));
      return { ok: false };
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setAuthToken(null);
  }

  const value = useMemo(() => {
    return {
      token,
      user,
      isLoading,
      authError,
      login,
      signup,
      logout,
      isAuthenticated: Boolean(token),
    };
  }, [token, user, isLoading, authError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

