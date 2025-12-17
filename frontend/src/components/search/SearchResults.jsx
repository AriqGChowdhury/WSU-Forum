import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, FileText, Hash, Loader2 } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export function SearchResults({ results, loading, onSelectPost, onSelectUser, onSelectSubforum }) {
  const { users = [], posts = [], subforums = [] } = results || {};
  const hasResults = users.length > 0 || posts.length > 0 || subforums.length > 0;

  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border p-4 z-50">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--wsu-green)]" />
          <span className="ml-2 text-sm text-zinc-500">Searching...</span>
        </div>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border p-4 z-50">
        <div className="text-center py-8">
          <Search className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
          <p className="text-sm font-medium text-zinc-700">No results found</p>
          <p className="text-xs text-zinc-500 mt-1">
            Try different keywords
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border z-50 max-h-[500px] overflow-hidden">
      <ScrollArea className="max-h-[500px]">
        <div className="p-2">
          {/* Users Section */}
          {users.length > 0 && (
            <div className="mb-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase">
                People
              </div>
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => onSelectUser?.(user)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100 transition text-left"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs">
                      {getInitials(user.username || user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.username || user.name}
                    </p>
                    {user.email && (
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    )}
                  </div>
                  {user.role && (
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Subforums Section */}
          {subforums.length > 0 && (
            <div className="mb-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase">
                Sub-Forums
              </div>
              {subforums.map((subforum) => (
                <button
                  key={subforum.id}
                  onClick={() => onSelectSubforum?.(subforum)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100 transition text-left"
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: subforum.color + '20' }}
                  >
                    <Hash className="h-4 w-4" style={{ color: subforum.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{subforum.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{subforum.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Posts Section */}
          {posts.length > 0 && (
            <div>
              <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase">
                Posts
              </div>
              {posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => onSelectPost?.(post)}
                  className="w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100 transition text-left"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-zinc-100">
                    <FileText className="h-4 w-4 text-zinc-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{post.title}</p>
                    {post.body && (
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">{post.body}</p>
                    )}
                    {post.user && (
                      <p className="text-xs text-zinc-400 mt-1">
                        by {typeof post.user === 'string' ? post.user : post.user.username}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default SearchResults;
