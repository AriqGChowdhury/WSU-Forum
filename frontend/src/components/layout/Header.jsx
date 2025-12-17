import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { SearchResults } from '@/components/search/SearchResults';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { ROUTES } from '@/constants';
import { 
  Menu, 
  Search, 
  User, 
  Settings, 
  LogOut,
  Shield,
  X
} from 'lucide-react';
import { getInitials, debounce } from '@/lib/utils';

export function Header({ onMenuClick, route, setRoute }) {
  const { user, isAuthenticated, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search function
  const performSearch = useRef(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults(null);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);
      try {
        const results = await api.search.query(query);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults(null);
      } finally {
        setSearchLoading(false);
      }
    }, 500)
  ).current;

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      performSearch(query);
    } else {
      setSearchResults(null);
      setShowSearchResults(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setShowSearchResults(false);
  };

  const handleSelectPost = (post) => {
    console.log('Selected post:', post);
    // Navigate to post or open post detail
    setShowSearchResults(false);
    handleClearSearch();
  };

  const handleSelectUser = (user) => {
    console.log('Selected user:', user);
    // Navigate to user profile
    setShowSearchResults(false);
    handleClearSearch();
  };

  const handleSelectSubforum = (subforum) => {
    console.log('Selected subforum:', subforum);
    // Navigate to subforum - you'd need to pass this up or use router
    setShowSearchResults(false);
    handleClearSearch();
  };

  const handleSignOut = async () => {
    await signOut();
    setRoute(ROUTES.AUTH);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Logo & Menu */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <button
            onClick={() => isAuthenticated && setRoute(ROUTES.FEED)}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 bg-[var(--wsu-green)] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:inline">
              WSU Forum
            </span>
          </button>
        </div>

        {/* Center: Search (only when authenticated) */}
        {isAuthenticated && (
          <div className="hidden md:flex flex-1 max-w-md mx-8" ref={searchRef}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search posts, people, sub-forums..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                className="w-full h-10 pl-10 pr-10 rounded-full border bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wsu-green)] focus:border-transparent transition"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center hover:bg-zinc-200 rounded-full transition"
                >
                  <X className="h-3 w-3 text-zinc-500" />
                </button>
              )}
              
              {/* Search Results Dropdown */}
              {showSearchResults && (searchResults || searchLoading) && (
                <SearchResults
                  results={searchResults}
                  loading={searchLoading}
                  onSelectPost={handleSelectPost}
                  onSelectUser={handleSelectUser}
                  onSelectSubforum={handleSelectSubforum}
                />
              )}
            </div>
          </div>
        )}

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <NotificationsDropdown />

              {/* Mobile Search */}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-5 w-5" />
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-[var(--wsu-green)] text-white">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-zinc-500">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setRoute(ROUTES.PROFILE)}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoute(ROUTES.SETTINGS)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500 hidden sm:inline">
                Wayne State University
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
