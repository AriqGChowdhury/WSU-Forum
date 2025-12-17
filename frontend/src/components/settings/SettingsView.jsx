import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { ROUTES } from '@/constants';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  LogOut,
  Save,
  Loader2,
  Moon,
  Sun,
  CheckCircle2
} from 'lucide-react';
import { api } from '@/services/api'

export function SettingsView({ setRoute }) {
  const { user, signOut, updateUser } = useAuth();
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Form state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  
  // Notification settings from context
  const [emailNotifications, setEmailNotifications] = useState(settings?.emailNotifications ?? true);
  const [pushNotifications, setPushNotifications] = useState(settings?.pushNotifications ?? true);
  const [mentionNotifications, setMentionNotifications] = useState(settings?.mentionNotifications ?? true);
  
  // Privacy settings
  const [publicProfile, setPublicProfile] = useState(settings?.publicProfile ?? true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(settings?.showOnlineStatus ?? true);
  
  // Appearance
  const [darkMode, setDarkMode] = useState(settings?.darkMode ?? false);

  // Sync with settings context
  useEffect(() => {
    if (settings) {
      setEmailNotifications(settings.emailNotifications ?? true);
      setPushNotifications(settings.pushNotifications ?? true);
      setMentionNotifications(settings.mentionNotifications ?? true);
      setPublicProfile(settings.publicProfile ?? true);
      setShowOnlineStatus(settings.showOnlineStatus ?? true);
      setDarkMode(settings.darkMode ?? false);
    }
  }, [settings]);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSaveProfile = async () => {
    setLoading(true);
    setSaveSuccess(false);
    console.log("PATCH /settings payload:", {
      name,
      bio,
      role: user?.role,
    });

    try {
      const result = await api.users.updateProfile({
        name, 
        bio,
        role: user.role
      });
    

      if (result?.user) {
        updateUser(result.user);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setLoading(false);
    }
    
  };

  const handleNotificationChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    
    // Update local state immediately
    switch(key) {
      case 'emailNotifications': setEmailNotifications(value); break;
      case 'pushNotifications': setPushNotifications(value); break;
      case 'mentionNotifications': setMentionNotifications(value); break;
    }
    
    // Persist to context/storage
    await updateSettings(newSettings);
  };

  const handlePrivacyChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    
    switch(key) {
      case 'publicProfile': setPublicProfile(value); break;
      case 'showOnlineStatus': setShowOnlineStatus(value); break;
    }
    
    await updateSettings(newSettings);
  };

  const handleDarkModeChange = async (value) => {
    setDarkMode(value);
    await updateSettings({ ...settings, darkMode: value });
  };

  const handleSignOut = async () => {
    await signOut();
    if (setRoute) setRoute(ROUTES.AUTH);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-zinc-500">Manage your account preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-[var(--wsu-green)]" />
            <CardTitle className="text-lg">Profile</CardTitle>
          </div>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Display Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Bio</label>
            <Input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={user?.email || ''}
              disabled
              className="mt-1 bg-zinc-50"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Email cannot be changed
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleSaveProfile}
              disabled={loading}
              className="bg-[var(--wsu-green)] hover:bg-[var(--wsu-green)]/90"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
            {saveSuccess && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Saved!
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[var(--wsu-green)]" />
            <CardTitle className="text-lg">Notifications</CardTitle>
          </div>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-zinc-500">Receive updates via email</p>
            </div>
            <Switch 
              checked={emailNotifications}
              onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-zinc-500">Receive browser notifications</p>
            </div>
            <Switch 
              checked={pushNotifications}
              onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mention Notifications</p>
              <p className="text-sm text-zinc-500">Get notified when someone mentions you</p>
            </div>
            <Switch 
              checked={mentionNotifications}
              onCheckedChange={(checked) => handleNotificationChange('mentionNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[var(--wsu-green)]" />
            <CardTitle className="text-lg">Privacy</CardTitle>
          </div>
          <CardDescription>Control your privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Public Profile</p>
              <p className="text-sm text-zinc-500">Allow others to see your profile</p>
            </div>
            <Switch 
              checked={publicProfile}
              onCheckedChange={(checked) => handlePrivacyChange('publicProfile', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Online Status</p>
              <p className="text-sm text-zinc-500">Let others see when you're active</p>
            </div>
            <Switch 
              checked={showOnlineStatus}
              onCheckedChange={(checked) => handlePrivacyChange('showOnlineStatus', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-[var(--wsu-green)]" />
            <CardTitle className="text-lg">Appearance</CardTitle>
          </div>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="h-5 w-5 text-indigo-500" />
              ) : (
                <Sun className="h-5 w-5 text-amber-500" />
              )}
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-zinc-500">Use dark theme</p>
              </div>
            </div>
            <Switch 
              checked={darkMode}
              onCheckedChange={handleDarkModeChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-600">Sign Out</p>
              <p className="text-sm text-zinc-500">Sign out of your account</p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsView;
