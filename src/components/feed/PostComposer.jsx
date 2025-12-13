import React, { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RoleBadge } from '@/components/common/RoleBadge';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/contexts/PostContext';
import { getInitials } from '@/lib/utils';
import { 
  CONTENT_TYPES, 
  SUBFORUMS, 
  CATEGORY_LABELS,
  getAccessibleSubforums,
  canPostInSubforum 
} from '@/constants';
import { 
  Loader2, 
  Image as ImageIcon, 
  Calendar, 
  MapPin,
  Hash,
  X,
  ChevronDown,
  Lock
} from 'lucide-react';

export function PostComposer({ open, onOpenChange, defaultSubforum = null }) {
  const { user } = useAuth();
  const { createPost } = usePosts();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [contentType, setContentType] = useState(CONTENT_TYPES.DISCUSSION);
  const [selectedSubforum, setSelectedSubforum] = useState(defaultSubforum);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventPlace, setEventPlace] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userRole = user?.role || 'Student';
  const isEvent = contentType === CONTENT_TYPES.EVENT;
  
  // Get subforums user can post in
  const postableSubforums = getAccessibleSubforums(userRole).filter(sf => 
    canPostInSubforum(userRole, sf)
  );

  // Group subforums by category
  const subforumsByCategory = {};
  postableSubforums.forEach(sf => {
    if (!subforumsByCategory[sf.category]) {
      subforumsByCategory[sf.category] = [];
    }
    subforumsByCategory[sf.category].push(sf);
  });

  // Update selected subforum when default changes
  useEffect(() => {
    if (defaultSubforum) {
      setSelectedSubforum(defaultSubforum);
    }
  }, [defaultSubforum]);

  const resetForm = () => {
    setTitle('');
    setBody('');
    setContentType(CONTENT_TYPES.DISCUSSION);
    if (!defaultSubforum) {
      setSelectedSubforum(null);
    }
    setEventDate('');
    setEventTime('');
    setEventPlace('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please add a title');
      return;
    }

    if (!body.trim()) {
      setError('Please add some content');
      return;
    }

    if (!selectedSubforum) {
      setError('Please select a sub-forum');
      return;
    }

    if (isEvent && !eventDate) {
      setError('Please select an event date');
      return;
    }

    setLoading(true);

    const postData = {
      title: title.trim(),
      body: body.trim(),
      contentType,
      subforumId: selectedSubforum.id,
      subforumName: selectedSubforum.name,
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    };

    if (isEvent) {
      postData.eventDate = eventDate;
      postData.eventTime = eventTime;
      postData.eventPlace = eventPlace;
    }

    const result = await createPost(postData);
    
    setLoading(false);

    if (result.success) {
      handleClose();
    } else {
      setError(result.error || 'Failed to create post');
    }
  };

  const contentTypes = [
    { value: CONTENT_TYPES.DISCUSSION, label: '💬 Discussion', color: 'bg-blue-100 text-blue-700' },
    { value: CONTENT_TYPES.QUESTION, label: '❓ Question', color: 'bg-purple-100 text-purple-700' },
    { value: CONTENT_TYPES.EVENT, label: '📅 Event', color: 'bg-amber-100 text-amber-700' },
    { value: CONTENT_TYPES.ANNOUNCEMENT, label: '📢 Announcement', color: 'bg-green-100 text-green-700' },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-[var(--wsu-green)] text-white">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{user?.name}</p>
                <RoleBadge role={userRole} size="sm" />
              </div>
              <p className="text-xs text-zinc-500">
                {selectedSubforum 
                  ? `Posting to ${selectedSubforum.name}` 
                  : 'Select a sub-forum below'
                }
              </p>
            </div>
          </div>

          {/* Subforum Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                type="button"
              >
                {selectedSubforum ? (
                  <span className="flex items-center gap-2">
                    <Hash className="h-4 w-4" style={{ color: selectedSubforum.color }} />
                    {selectedSubforum.name}
                  </span>
                ) : (
                  <span className="text-zinc-500">Select sub-forum...</span>
                )}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 max-h-80 overflow-y-auto">
              {Object.entries(subforumsByCategory).map(([category, subforums]) => (
                <React.Fragment key={category}>
                  <DropdownMenuLabel className="text-xs text-zinc-500">
                    {CATEGORY_LABELS[category]?.name || category}
                  </DropdownMenuLabel>
                  {subforums.map(sf => (
                    <DropdownMenuItem 
                      key={sf.id}
                      onClick={() => setSelectedSubforum(sf)}
                      className="cursor-pointer"
                    >
                      <Hash className="h-4 w-4 mr-2" style={{ color: sf.color }} />
                      <span className="flex-1">{sf.name}</span>
                      {sf.access && sf.access.length < 5 && (
                        <Lock className="h-3 w-3 text-zinc-400" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Content Type Selector */}
          <div className="flex flex-wrap gap-2">
            {contentTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setContentType(type.value)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium transition
                  ${contentType === type.value 
                    ? type.color + ' ring-2 ring-offset-1 ring-zinc-300'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }
                `}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <Input
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-medium"
            maxLength={100}
          />

          {/* Body */}
          <Textarea
            placeholder="What's on your mind?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={5000}
          />

          {/* Event Fields */}
          {isEvent && (
            <div className="space-y-3 p-3 bg-zinc-50 rounded-lg">
              <p className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Event Details
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500">Date *</label>
                  <Input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">Time</label>
                  <Input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Event location"
                    value={eventPlace}
                    onChange={(e) => setEventPlace(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <X className="h-4 w-4" />
              {error}
            </p>
          )}

          {/* Footer */}
          <DialogFooter className="flex-row justify-between sm:justify-between">
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="icon" disabled>
                <ImageIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !title.trim() || !body.trim() || !selectedSubforum}
                className="bg-[var(--wsu-green)] hover:bg-[var(--wsu-green)]/90"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Post
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PostComposer;
