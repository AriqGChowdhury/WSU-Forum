import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { PostCard } from '@/components/feed/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/contexts/PostContext';
import { getInitials, formatDate } from '@/lib/utils';
import { 
  Edit, 
  Calendar, 
  BookOpen, 
  Users, 
  FileText,
  Settings,
  Share2
} from 'lucide-react';

export function ProfileView() {
  const { user } = useAuth();
  const { getUserPosts } = usePosts();
  const [tab, setTab] = useState('posts');
  
  const userPosts = getUserPosts();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          {/* Cover & Avatar */}
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-[var(--wsu-green)] to-[var(--wsu-green)]/70 rounded-lg" />
            <div className="absolute -bottom-12 left-6">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl bg-[var(--wsu-green)] text-white">
                  {getInitials(user.name || user.username)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute top-4 right-4">
              <Button variant="secondary" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* User Info */}
          <div className="mt-14 ml-2">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{user.username || user.name}</h1>
                <p className="text-zinc-500">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{user.role}</Badge>
                  {user.major && (
                    <Badge variant="outline">{user.major}</Badge>
                  )}
                  {user.year && (
                    <Badge variant="outline">{user.year}</Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="mt-4 text-zinc-700">{user.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6 mt-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-xl font-bold">{user.stats?.posts || userPosts.length}</p>
                <p className="text-xs text-zinc-500">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{user.stats?.followers || 0}</p>
                <p className="text-xs text-zinc-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{user.stats?.following || 0}</p>
                <p className="text-xs text-zinc-500">Following</p>
              </div>
            </div>

            {/* Joined Date */}
            <div className="flex items-center gap-2 mt-4 text-sm text-zinc-500">
              <Calendar className="h-4 w-4" />
              <span>Joined {user.joinedAt ? formatDate(user.joinedAt) : 'recently'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Posts ({userPosts.length})
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 mt-4">
          {userPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
                <h3 className="font-semibold mb-1">No posts yet</h3>
                <p className="text-zinc-500 text-sm">
                  Your posts will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </TabsContent>

        <TabsContent value="about" className="mt-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">About</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-zinc-500">Bio</p>
                <p className="mt-1">{user.bio || 'No bio yet'}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-zinc-500">Role</p>
                <p className="mt-1">{user.role}</p>
              </div>
              {user.major && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-zinc-500">Major</p>
                    <p className="mt-1">{user.major}</p>
                  </div>
                </>
              )}
              {user.year && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-zinc-500">Year</p>
                    <p className="mt-1">{user.year}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProfileView;
