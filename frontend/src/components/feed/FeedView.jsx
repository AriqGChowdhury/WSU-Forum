import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PostCard } from './PostCard';
import { PostComposer } from './PostComposer';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/contexts/PostContext';
import { getInitials } from '@/lib/utils';
import { Loader2, RefreshCw } from 'lucide-react';

export function FeedView({ onSubforumClick }) {
  const { user } = useAuth();
  const { posts, loading, refreshPosts } = usePosts();
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Post Composer Trigger */}
      <Card className="border-2 border-[var(--wsu-green)]/20 hover:border-[var(--wsu-green)]/40 transition">
        <CardContent className="pt-6">
          <button
            onClick={() => setComposerOpen(true)}
            className="w-full flex items-center gap-3 rounded-xl border-2 border-dashed border-zinc-200 px-4 py-3 text-left hover:bg-zinc-50 hover:border-zinc-300 transition"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-[var(--wsu-green)] text-white">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-zinc-500">
              What's on your mind, {user?.name?.split(' ')[0]}?
            </span>
          </button>
        </CardContent>
      </Card>

      {/* Post Composer Dialog */}
      <PostComposer open={composerOpen} onOpenChange={setComposerOpen} />

      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Latest Posts</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={refreshPosts}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {loading && posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[var(--wsu-green)]" />
              <p className="text-zinc-500">Loading posts...</p>
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-semibold mb-1">No posts yet</h3>
              <p className="text-zinc-500 text-sm">
                Be the first to share something with the community!
              </p>
              <Button 
                className="mt-4 bg-[var(--wsu-green)] hover:bg-[var(--wsu-green)]/90"
                onClick={() => setComposerOpen(true)}
              >
                Create Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onSubforumClick={onSubforumClick}
              
            />
          ))
        )}
      </div>
    </div>
  );
}

export default FeedView;
