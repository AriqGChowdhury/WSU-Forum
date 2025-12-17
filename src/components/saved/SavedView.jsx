import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PostCard } from '@/components/feed/PostCard';
import { usePosts } from '@/contexts/PostContext';
import { Bookmark, Loader2 } from 'lucide-react';

export function SavedView() {
  const { posts, loading, getSavedPosts } = usePosts();
  const savedPosts = getSavedPosts();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--wsu-green)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Saved Posts</h1>
        <p className="text-zinc-500">Posts you've saved for later</p>
      </div>

      {/* Saved Posts */}
      {savedPosts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="font-semibold mb-1">No saved posts</h3>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto">
              When you save posts, they'll appear here so you can easily find them later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">
            {savedPosts.length} saved {savedPosts.length === 1 ? 'post' : 'posts'}
          </p>
          {savedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedView;
