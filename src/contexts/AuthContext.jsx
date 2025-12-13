import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      api.auth.getMe()
        .then(({ user }) => setUser(user))
        .catch(() => localStorage.removeItem('auth_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Sign in with email/password
  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { user, token } = await api.auth.signIn(email, password);
      localStorage.setItem('auth_token', token);
      setUser(user);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Sign in failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in with SSO (Wayne State)
  const signInSSO = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { user, token } = await api.auth.signInWithSSO();
      localStorage.setItem('auth_token', token);
      setUser(user);
      return { success: true };
    } catch (err) {
      setError(err.message || 'SSO sign in failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign up
  const signUp = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const { user, token } = await api.auth.signUp(data);
      localStorage.setItem('auth_token', token);
      setUser(user);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Sign up failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await api.auth.signOut();
    } catch {
      // Ignore errors, still sign out locally
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setLoading(false);
    }
  }, []);

  // Verify email
  const verifyEmail = useCallback(async (code) => {
    setLoading(true);
    setError(null);
    try {
      await api.auth.verifyEmail(code);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Verification failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile locally
  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signInSSO,
    signUp,
    signOut,
    verifyEmail,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
