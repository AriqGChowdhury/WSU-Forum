import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { formatNumber } from '@/lib/utils';
import { Hash, Users, Search, Loader2, Plus } from 'lucide-react';

export function TopicsView() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [following, setFollowing] = useState(new Set());

  useEffect(() => {
    api.topics.getAll()
      .then(({ topics }) => setTopics(topics))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleFollow = async (topicId) => {
    const isFollowing = following.has(topicId);
    
    // Optimistic update
    setFollowing((prev) => {
      const next = new Set(prev);
      if (isFollowing) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });

    try {
      if (isFollowing) {
        await api.topics.unfollow(topicId);
      } else {
        await api.topics.follow(topicId);
      }
    } catch {
      // Revert on error
      setFollowing((prev) => {
        const next = new Set(prev);
        if (isFollowing) {
          next.add(topicId);
        } else {
          next.delete(topicId);
        }
        return next;
      });
    }
  };

  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Topics</h1>
          <p className="text-zinc-500">Browse and follow topics you're interested in</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Topics Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredTopics.map((topic) => (
          <Card 
            key={topic.id} 
            className="hover:shadow-md transition cursor-pointer"
            style={{ borderLeftColor: topic.color, borderLeftWidth: 4 }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: topic.color + '20' }}
                  >
                    <Hash className="h-5 w-5" style={{ color: topic.color }} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{topic.name}</CardTitle>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Users className="h-3 w-3" />
                      <span>{formatNumber(topic.followers)} followers</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={following.has(topic.id) ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollow(topic.id);
                  }}
                  className={following.has(topic.id) ? "bg-[var(--wsu-green)]" : ""}
                >
                  {following.has(topic.id) ? 'Following' : 'Follow'}
                </Button>
              </div>
            </CardHeader>
            {topic.description && (
              <CardContent className="pt-0">
                <p className="text-sm text-zinc-600">{topic.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Hash className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
            <h3 className="font-semibold mb-1">No topics found</h3>
            <p className="text-zinc-500 text-sm">
              Try a different search term
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TopicsView;
