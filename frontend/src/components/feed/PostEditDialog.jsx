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
import { usePosts } from '@/contexts/PostContext';
import { Loader2, X } from 'lucide-react';

export function PostEditDialog({ post, open, onOpenChange }) {
  const { updatePost } = usePosts();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setBody(post.body || '');
    }
  }, [post]);

  const handleClose = () => {
    setError('');
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

    setLoading(true);

    const result = await updatePost(post.id, {
      title: title.trim(),
      body: body.trim(),
    });

    setLoading(false);

    if (result.success) {
      handleClose();
    } else {
      setError(result.error || 'Failed to update post');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-medium"
            maxLength={100}
          />

          <Textarea
            placeholder="What's on your mind?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[150px] resize-none"
            maxLength={5000}
          />

          {error && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <X className="h-4 w-4" />
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !title.trim() || !body.trim()}
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

export default PostEditDialog;
