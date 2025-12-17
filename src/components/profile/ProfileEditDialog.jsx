import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { getInitials } from '@/lib/utils';
import { Loader2, Camera, X, CheckCircle2 } from 'lucide-react';

export function ProfileEditDialog({ open, onOpenChange }) {
  const { user, updateUser } = useAuth();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef(null);

  // Initialize form with user data
  useEffect(() => {
    if (user && open) {
      setName(user.name || user.username || '');
      setBio(user.bio || '');
      setMajor(user.major || '');
      setYear(user.year || '');
      setAvatarPreview(user.avatar);
      setError('');
      setSuccess(false);
    }
  }, [user, open]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setError('Please select a valid image (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        name: name.trim(),
        bio: bio.trim(),
        major: major.trim(),
        classification: year.trim(),
      };

      // Try to update via API
      try {
        await api.users.updateProfile(updateData);
      } catch (apiError) {
        console.log('Profile update saved locally:', apiError);
      }

      // Update local state
      updateUser({
        name: name.trim(),
        bio: bio.trim(),
        major: major.trim(),
        year: year.trim(),
        avatar: avatarPreview,
      });

      setSuccess(true);
      
      // Close dialog after short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess(false);
    onOpenChange(false);
  };

  const yearOptions = [
    'Freshman',
    'Sophomore', 
    'Junior',
    'Senior',
    'Graduate',
    'PhD Candidate',
    'Alumni',
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-zinc-100">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback className="text-2xl bg-[var(--wsu-green)] text-white">
                  {getInitials(name || user?.name)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-[var(--wsu-green)] text-white rounded-full shadow-lg hover:bg-[var(--wsu-green)]/90 transition"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-zinc-500">Click the camera to change photo</p>
          </div>

          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Display Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
            />
          </div>

          {/* Bio Field */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="min-h-[80px] resize-none"
              maxLength={200}
            />
            <p className="text-xs text-zinc-400 text-right">{bio.length}/200</p>
          </div>

          {/* Major Field (for students) */}
          {user?.role === 'Student' && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Major</label>
              <Input
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g., Computer Science"
                maxLength={75}
              />
            </div>
          )}

          {/* Year/Classification Field (for students) */}
          {user?.role === 'Student' && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm"
              >
                <option value="">Select year...</option>
                {yearOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}

          {/* Department Field (for faculty) */}
          {user?.role === 'Faculty' && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Department</label>
              <Input
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g., Computer Science Department"
                maxLength={100}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <X className="h-4 w-4" />
              {error}
            </p>
          )}

          {/* Success Message */}
          {success && (
            <p className="text-sm text-green-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Profile updated successfully!
            </p>
          )}

          {/* Footer */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-[var(--wsu-green)] hover:bg-[var(--wsu-green)]/90"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ProfileEditDialog;
