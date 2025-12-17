import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check session on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const { user } = await api.auth.getMe();
        if (!user) throw new Error("No user");

        let settings = {};
        try {
          const res = await api.settings.get();
          settings = res?.settings || {};
        } catch {
          // optional settings endpoint
        }
        setUser({
          ...settings,
          ...user,
        });
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const signIn = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.auth.signIn(username, password);
      
      if (result.success && result.token) {
        const decoded = jwtDecode(result.token);

        setUser({
          id: decoded.user_id,
          username: decoded.username,
          name: decoded.username,
          role: decoded.role ?? null
        });
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
  }, []);

  const signUp = useCallback(async (data) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.auth.signUp(data);

      // do NOT set user until email verified
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
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      setLoading(false);
    }
  }, []);

  // match api.auth.verifyEmail(uidb64, token)
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

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

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
