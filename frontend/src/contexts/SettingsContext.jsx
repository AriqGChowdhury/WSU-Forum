import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ============================================================================
// CONTEXT
// ============================================================================

const SettingsContext = createContext(null);

// Default settings
const DEFAULT_SETTINGS = {
  // Notifications
  emailNotifications: true,
  pushNotifications: true,
  mentionNotifications: true,
  
  // Privacy
  publicProfile: true,
  showOnlineStatus: true,
  
  // Appearance
  darkMode: false,
  
  // Other preferences
  compactView: false,
  autoPlayVideos: true,
};

// ============================================================================
// PROVIDER
// ============================================================================

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('wsu_forum_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        
        // Apply dark mode immediately
        if (parsed.darkMode) {
          document.documentElement.classList.add('dark');
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    
    // Persist to localStorage
    try {
      localStorage.setItem('wsu_forum_settings', JSON.stringify(merged));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
    
    // Apply dark mode
    if (merged.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return { success: true };
  }, [settings]);

  // Reset to defaults
  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('wsu_forum_settings');
    document.documentElement.classList.remove('dark');
    return { success: true };
  }, []);

  // Get a specific setting
  const getSetting = useCallback((key) => {
    return settings[key];
  }, [settings]);

  const value = {
    settings,
    loading,
    updateSettings,
    resetSettings,
    getSetting,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export default SettingsContext;
