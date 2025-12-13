import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  LogOut,
  Save,
  Loader2
} from 'lucide-react';

export function SettingsView({ setRoute }) {
  const { user, signOut, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [mentionNotifications, setMentionNotifications] = useState(true);

  const handleSaveProfile = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 500));
    updateUser({ name, bio });
    setLoading(false);
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
              onCheckedChange={setEmailNotifications}
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
              onCheckedChange={setPushNotifications}
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
              onCheckedChange={setMentionNotifications}
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
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Online Status</p>
              <p className="text-sm text-zinc-500">Let others see when you're active</p>
            </div>
            <Switch defaultChecked />
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
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-zinc-500">Use dark theme</p>
            </div>
            <Switch />
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
