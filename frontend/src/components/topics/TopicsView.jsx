import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { formatNumber } from '@/lib/utils';
import { Hash, Users, Search, Loader2, CheckCircle2 } from 'lucide-react';

// Enhanced topics with subforum links
const ENHANCED_TOPICS = [
  { 
    id: 't1', 
    name: 'Announcements', 
    description: 'Official WSU announcements and updates', 
    followers: 2345, 
    color: '#0c5449',
    subforumId: 'announcements'
  },
  { 
    id: 't2', 
    name: 'Computer Science', 
    description: 'Programming, algorithms, and AI discussions', 
    followers: 856, 
    color: '#3b82f6',
    subforumId: 'cs'
  },
  { 
    id: 't3', 
    name: 'Events', 
    description: 'Campus events, meetups, and activities', 
    followers: 2103, 
    color: '#f59e0b',
    subforumId: 'clubs'
  },
  { 
    id: 't4', 
    name: 'Housing', 
    description: 'Dorms, apartments, and roommate finder', 
    followers: 534, 
    color: '#8b5cf6',
    subforumId: 'housing'
  },
  { 
    id: 't5', 
    name: 'Marketplace', 
    description: 'Buy, sell, and trade textbooks and more', 
    followers: 678, 
    color: '#10b981',
    subforumId: 'marketplace'
  },
  { 
    id: 't6', 
    name: 'Study Groups', 
    description: 'Find study partners and groups', 
    followers: 456, 
    color: '#ec4899',
    subforumId: 'study-groups'
  },
  { 
    id: 't7', 
    name: 'Career', 
    description: 'Jobs, internships, and career advice', 
    followers: 567, 
    color: '#6366f1',
    subforumId: 'internships'
  },
  { 
    id: 't8', 
    name: 'Sports', 
    description: 'WSU athletics, intramurals, and recreation', 
    followers: 1234, 
    color: '#ef4444',
    subforumId: 'sports'
  },
  { 
    id: 't9', 
    name: 'Engineering', 
    description: 'All engineering disciplines and projects', 
    followers: 623, 
    color: '#f59e0b',
    subforumId: 'engineering'
  },
  { 
    id: 't10', 
    name: 'Business', 
    description: 'Finance, marketing, and management discussions', 
    followers: 445, 
    color: '#10b981',
    subforumId: 'business'
  },
  { 
    id: 't11', 
    name: 'Dining', 
    description: 'Meal plans, campus food, and restaurant reviews', 
    followers: 678, 
    color: '#f97316',
    subforumId: 'dining'
  },
  { 
    id: 't12', 
    name: 'Off-Topic', 
    description: 'Random discussions, memes, and fun stuff', 
    followers: 567, 
    color: '#64748b',
    subforumId: 'offtopic'
  },
];

export function TopicsView() {
  const [topics, setTopics] = useState(ENHANCED_TOPICS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [following, setFollowing] = useState(new Set());
  const [loadingFollow, setLoadingFollow] = useState(null);

  // Load followed topics from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wsu_followed_topics');
      if (saved) {
        setFollowing(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Failed to load followed topics:', error);
    }
    
    // Try to fetch from API
    api.topics.getAll()
      .then(({ topics: apiTopics }) => {
        if (apiTopics && apiTopics.length > 0) {
          // Merge API topics with enhanced data
          const merged = ENHANCED_TOPICS.map(enhanced => {
            const apiTopic = apiTopics.find(t => t.id === enhanced.id);
            return apiTopic ? { ...enhanced, ...apiTopic } : enhanced;
          });
          setTopics(merged);
        }
      })
      .catch(console.error);
  }, []);

  // Save followed topics
  const saveFollowing = (newFollowing) => {
    try {
      localStorage.setItem('wsu_followed_topics', JSON.stringify([...newFollowing]));
    } catch (error) {
      console.error('Failed to save followed topics:', error);
    }
  };

  const toggleFollow = async (topicId) => {
    const isFollowing = following.has(topicId);
    setLoadingFollow(topicId);
    
    // Optimistic update
    setFollowing((prev) => {
      const next = new Set(prev);
      if (isFollowing) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      saveFollowing(next);
      return next;
    });

    // Update follower count optimistically
    setTopics(prev => prev.map(t => 
      t.id === topicId 
        ? { ...t, followers: isFollowing ? t.followers - 1 : t.followers + 1 }
        : t
    ));

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
        saveFollowing(next);
        return next;
      });
      
      setTopics(prev => prev.map(t => 
        t.id === topicId 
          ? { ...t, followers: isFollowing ? t.followers + 1 : t.followers - 1 }
          : t
      ));
    } finally {
      setLoadingFollow(null);
    }
  };

  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Sort: following first, then by followers
  const sortedTopics = [...filteredTopics].sort((a, b) => {
    const aFollowing = following.has(a.id);
    const bFollowing = following.has(b.id);
    if (aFollowing && !bFollowing) return -1;
    if (!aFollowing && bFollowing) return 1;
    return b.followers - a.followers;
  });

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
        {following.size > 0 && (
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <CheckCircle2 className="h-4 w-4 text-[var(--wsu-green)]" />
            <span>Following <strong>{following.size}</strong> topics</span>
          </div>
        )}
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
        {sortedTopics.map((topic) => {
          const isFollowed = following.has(topic.id);
          const isLoading = loadingFollow === topic.id;
          
          return (
            <Card 
              key={topic.id} 
              className={`hover:shadow-md transition cursor-pointer ${isFollowed ? 'ring-2 ring-[var(--wsu-green)]/20' : ''}`}
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
                      <CardTitle className="text-base flex items-center gap-2">
                        {topic.name}
                        {isFollowed && (
                          <CheckCircle2 className="h-4 w-4 text-[var(--wsu-green)]" />
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Users className="h-3 w-3" />
                        <span>{formatNumber(topic.followers)} followers</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isFollowed ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFollow(topic.id);
                    }}
                    disabled={isLoading}
                    className={isFollowed ? "bg-[var(--wsu-green)] hover:bg-[var(--wsu-green)]/90" : ""}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : isFollowed ? (
                      'Following'
                    ) : (
                      'Follow'
                    )}
                  </Button>
                </div>
              </CardHeader>
              {topic.description && (
                <CardContent className="pt-0">
                  <p className="text-sm text-zinc-600">{topic.description}</p>
                </CardContent>
              )}
            </Card>
          );
        })}
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
