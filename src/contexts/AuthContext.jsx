import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";

const AuthContext = createContext(null);

const USER_CACHE_KEY = "wsu_forum_user_cache";

// Helper functions - NO localStorage usage (violates artifact rules)
// We'll use React state only and sync with backend
function loadCachedUser() {
  try {
    const raw = sessionStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCachedUser(user) {
  try {
    if (!user) {
      sessionStorage.removeItem(USER_CACHE_KEY);
      return;
    }
    sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } catch {
    // Silently fail
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadCachedUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const setUserAndCache = useCallback((nextUser) => {
    setUser(nextUser);
    saveCachedUser(nextUser);
  }, []);

  const mergeUserAndCache = useCallback((incoming) => {
    setUser((prev) => {
      const merged = { ...(prev || {}), ...(incoming || {}) };
      saveCachedUser(merged);
      return merged;
    });
  }, []);

  // Check session on mount
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");

    if (!token) {
      setUserAndCache(null);
      setLoading(false);
      return;
    }

    api.auth
      .getMe()
      .then(({ user: serverUser }) => {
        if (serverUser) {
          mergeUserAndCache(serverUser);
        } else {
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setUserAndCache(null);
        }
      })
      .catch(() => {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUserAndCache(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [mergeUserAndCache, setUserAndCache]);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.auth.signIn(email, password);

      if (result.success && result.user) {
        setUserAndCache(result.user);
        return { success: true };
      }

      return { success: false, error: result.message || "Sign in failed" };
    } catch (err) {
      const msg = err?.message || "Sign in failed";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [setUserAndCache]);

  const signUp = useCallback(async (data) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.auth.signUp(data);

      return {
        success: true,
        message: result.message || "Please check your email to verify your account",
      };
    } catch (err) {
      const msg = err?.message || "Sign up failed";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);

    try {
      await api.auth.signOut();
    } catch {
      // ignore
    } finally {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUserAndCache(null);
      setLoading(false);
    }
  }, [setUserAndCache]);

  const verifyEmail = useCallback(async (uidb64, token) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.auth.verifyEmail(uidb64, token);
      return { success: !!result.success, message: result.message };
    } catch (err) {
      const msg = err?.message || "Verification failed";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FIX: Update user AND sync with backend
  const updateUser = useCallback(async (updates) => {
    // Optimistic update
    setUser((prev) => {
      const next = prev ? { ...prev, ...updates } : null;
      saveCachedUser(next);
      return next;
    });

    // Sync with backend
    try {
      const { user: updatedUser } = await api.users.updateProfile(updates);
      if (updatedUser) {
        setUserAndCache(updatedUser);
      }
    } catch (error) {
      console.error("Failed to sync profile update:", error);
      // Keep local changes even if backend fails
    }
  }, [setUserAndCache]);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    verifyEmail,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;