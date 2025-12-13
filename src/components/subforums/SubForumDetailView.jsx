import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/feed/PostCard';
import { PostComposer } from '@/components/feed/PostComposer';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/contexts/PostContext';
import { canPostInSubforum, CATEGORY_LABELS } from '@/constants';
import { cn, formatNumber } from '@/lib/utils';
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  Plus,
  Lock,
  Loader2,
  TrendingUp,
  Clock,
  Filter,
  Code,
  Cog,
  Briefcase,
  Heart,
  Palette,
  Home,
  UtensilsCrossed,
  Trophy,
  GraduationCap,
  FileText,
  Megaphone,
  ShoppingBag,
  MessageCircle,
  BookOpen,
  UserPlus,
  Sparkles,
  Coffee,
  FolderOpen,
  Globe,
  Building,
  Shield,
  UserCheck
} from 'lucide-react';

// Icon mapping
const ICONS = {
  Code, Cog, Briefcase, Heart, Palette, Home, UtensilsCrossed,
  Trophy, GraduationCap, FileText, Megaphone, ShoppingBag,
  MessageCircle, BookOpen, UserPlus, Sparkles, Coffee, FolderOpen,
  Users, Globe, Building, Shield, UserCheck
};

export function SubForumDetailView({ forum, onBack }) {
  const { user } = useAuth();
  const { posts, loading, getPostsBySubforum } = usePosts();
  const [composerOpen, setComposerOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  const userRole = user?.role || 'Student';
  const canPost = canPostInSubforum(userRole, forum);
  const Icon = ICONS[forum.icon] || MessageCircle;
  const categoryInfo = CATEGORY_LABELS[forum.category];

  // Get posts for this subforum
  const subforumPosts = getPostsBySubforum ? getPostsBySubforum(forum.id) : 
    posts.filter(p => p.subforumId === forum.id);

  // Sort posts
  const sortedPosts = [...subforumPosts].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'popular') {
      return (b.likes || 0) - (a.likes || 0);
    }
    return 0;
  });

  // Mock stats
  const stats = {
    members: 234,
    posts: subforumPosts.length,
    online: 12,
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onBack}
        className="gap-2 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sub-Forums
      </Button>

      {/* Forum Header Card */}
      <Card 
        className="border-l-4 overflow-hidden"
        style={{ borderLeftColor: forum.color }}
      >
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Icon */}
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: forum.color + '20' }}
            >
              <Icon className="h-8 w-8" style={{ color: forum.color }} />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{forum.name}</h1>
                {forum.access && forum.access.length < 5 && (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Restricted
                  </Badge>
                )}
              </div>
              <p className="text-zinc-500 mt-1">{forum.description}</p>
              
              {/* Category Badge */}
              {categoryInfo && (
                <Badge 
                  variant="secondary" 
                  className="mt-2"
                  style={{ 
                    backgroundColor: categoryInfo.color + '15',
                    color: categoryInfo.color 
                  }}
                >
                  {categoryInfo.name}
                </Badge>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1.5 text-zinc-600">
                  <Users className="h-4 w-4" />
                  <span><strong>{formatNumber(stats.members)}</strong> members</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-600">
                  <MessageSquare className="h-4 w-4" />
                  <span><strong>{stats.posts}</strong> posts</span>
                </div>
                <div className="flex items-center gap-1.5 text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span><strong>{stats.online}</strong> online</span>
                </div>
              </div>

              {/* Access Info */}
              {forum.access && forum.access.length < 5 && (
                <p className="text-xs text-zinc-400 mt-3">
                  Accessible to: {forum.access.join(', ')}
                </p>
              )}
            </div>

            {/* Join Button - could be functional later */}
            <Button 
              className="bg-[var(--wsu-green)] hover:bg-[var(--wsu-green)]/90"
            >
              Joined
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New Post Button */}
      {canPost ? (
        <Button 
          onClick={() => setComposerOpen(true)}
          className="w-full sm:w-auto bg-[var(--wsu-green)] hover:bg-[var(--wsu-green)]/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Post in {forum.name}
        </Button>
      ) : (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-3 px-4 flex items-center gap-2 text-amber-700 text-sm">
            <Lock className="h-4 w-4" />
            Only {forum.postAccess?.join(', ')} can post in this sub-forum
          </CardContent>
        </Card>
      )}

      {/* Sort Tabs */}
      <div className="flex items-center justify-between">
        <Tabs value={sortBy} onValueChange={setSortBy}>
          <TabsList>
            <TabsTrigger value="recent" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="popular" className="gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Popular
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          Filter
        </Button>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--wsu-green)]" />
        </div>
      ) : sortedPosts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: forum.color + '20' }}
            >
              <MessageSquare className="h-8 w-8" style={{ color: forum.color }} />
            </div>
            <h3 className="font-semibold mb-1">No posts yet</h3>
            <p className="text-zinc-500 text-sm mb-4">
              Be the first to start a discussion in {forum.name}
            </p>
            {canPost && (
              <Button 
                onClick={() => setComposerOpen(true)}
                className="bg-[var(--wsu-green)] hover:bg-[var(--wsu-green)]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              showSubforum={false}
            />
          ))}
        </div>
      )}

      {/* Post Composer Dialog */}
      <PostComposer 
        open={composerOpen} 
        onOpenChange={setComposerOpen}
        defaultSubforum={forum}
      />
    </div>
  );
}

export default SubForumDetailView;
