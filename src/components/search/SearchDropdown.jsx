import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { api } from '@/services/api';
import { getInitials, debounce } from '@/lib/utils';
import { 
  Search, 
  Loader2, 
  User, 
  FileText, 
  Hash, 
  X,
  ArrowRight 
} from 'lucide-react';

export function SearchDropdown({ onSelectPost, onSelectUser, onSelectSubforum }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ people: [], posts: [], subforums: [] });
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search function
  const performSearch = debounce(async (searchQuery) => {
    if (searchQuery.length < 2) {
      setResults({ people: [], posts: [], subforums: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // Try API search
      const response = api.posts.search
        ? await api.posts.search(searchQuery)
        : { People: [], Posts: [], Subforums: [] };

      setResults({
        people: response.People || [],
        posts: response.Posts || [],
        subforums: response.Subforums || [], // enable if backend returns it
      });

    } catch (error) {
      console.error('Search error:', error);
      // Fallback to local mock search
      setResults({
        people: [],
        posts: [],
        subforums: [],
      });
    } finally {
      setLoading(false);
    }
  }, 300);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    
    if (value.length >= 2) {
      setLoading(true);
      performSearch(value);
    } else {
      setResults({ people: [], posts: [], subforums: [] });
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults({ people: [], posts: [], subforums: [] });
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSelectPost = (post) => {
    setIsOpen(false);
    setQuery('');
    onSelectPost?.(post);
  };

  const handleSelectUser = (user) => {
    setIsOpen(false);
    setQuery('');
    onSelectUser?.(user);
  };

  const hasResults = results.people.length > 0 || results.posts.length > 0 || results.subforums.length > 0;
  const showDropdown = isOpen && (query.length >= 2);

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search posts, topics, people..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="w-full h-10 pl-10 pr-10 rounded-full border bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wsu-green)] focus:border-transparent transition"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-200 rounded-full transition"
          >
            <X className="h-4 w-4 text-zinc-400" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <Card 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg max-h-[400px] overflow-y-auto"
        >
          {loading ? (
            <div className="p-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-[var(--wsu-green)]" />
              <p className="text-sm text-zinc-500 mt-2">Searching...</p>
            </div>
          ) : !hasResults ? (
            <div className="p-4 text-center">
              <Search className="h-8 w-8 mx-auto text-zinc-300 mb-2" />
              <p className="text-sm text-zinc-500">
                No results found for "{query}"
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Try different keywords
              </p>
            </div>
          ) : (
            <div className="py-2">
              {/* People Results */}
              {results.people.length > 0 && (
                <div>
                  <div className="px-3 py-2 flex items-center gap-2 text-xs font-medium text-zinc-500">
                    <User className="h-3.5 w-3.5" />
                    People
                  </div>
                  {results.people.slice(0, 3).map((person) => (
                    <button
                      key={person.id}
                      onClick={() => handleSelectUser(person)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 transition"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={person.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(person.name || person.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{person.name || person.username}</p>
                        <p className="text-xs text-zinc-500">{person.email}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-300" />
                    </button>
                  ))}
                  {results.people.length > 3 && (
                    <p className="px-3 py-1 text-xs text-zinc-400">
                      +{results.people.length - 3} more people
                    </p>
                  )}
                </div>
              )}

              {results.people.length > 0 && results.posts.length > 0 && (
                <Separator className="my-2" />
              )}

              {/* Posts Results */}
              {results.posts.length > 0 && (
                <div>
                  <div className="px-3 py-2 flex items-center gap-2 text-xs font-medium text-zinc-500">
                    <FileText className="h-3.5 w-3.5" />
                    Posts
                  </div>
                  {results.posts.slice(0, 5).map((post) => (
                    <button
                      key={post.id}
                      onClick={() => handleSelectPost(post)}
                      className="w-full flex items-start gap-3 px-3 py-2 hover:bg-zinc-50 transition"
                    >
                      <div className="w-8 h-8 rounded bg-zinc-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-zinc-400" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium truncate">{post.title}</p>
                        <p className="text-xs text-zinc-500 truncate">
                          {post.body?.substring(0, 60)}...
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-300 flex-shrink-0 mt-1" />
                    </button>
                  ))}
                  {results.posts.length > 5 && (
                    <p className="px-3 py-1 text-xs text-zinc-400">
                      +{results.posts.length - 5} more posts
                    </p>
                  )}
                </div>
              )}

              {/* Subforums Results */}
              {results.subforums.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div>
                    <div className="px-3 py-2 flex items-center gap-2 text-xs font-medium text-zinc-500">
                      <Hash className="h-3.5 w-3.5" />
                      Sub-Forums
                    </div>
                    {results.subforums.slice(0, 3).map((subforum) => (
                      <button
                        key={subforum.id}
                        onClick={() => onSelectSubforum?.(subforum)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 transition"
                      >
                        <div 
                          className="w-8 h-8 rounded flex items-center justify-center"
                          style={{ backgroundColor: (subforum.color || '#0c5449') + '20' }}
                        >
                          <Hash className="h-4 w-4" style={{ color: subforum.color || '#0c5449' }} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{subforum.name}</p>
                          <p className="text-xs text-zinc-500">{subforum.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-zinc-300" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default SearchDropdown;
