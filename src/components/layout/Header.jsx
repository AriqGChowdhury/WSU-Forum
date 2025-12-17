import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import NotificationsDropdown from "@/components/notifications/NotificationsDropdown";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { SearchDropdown } from "@/components/search/SearchDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants";
import { Menu, Search, User, Settings, LogOut, Shield } from "lucide-react";
import { getInitials } from "@/lib/utils";

export function Header({ onMenuClick, route, setRoute }) {
  const { user, isAuthenticated, signOut } = useAuth();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setRoute(ROUTES.AUTH);
  };

  const handleSearchSelectPost = (post) => {
    setRoute(ROUTES.FEED);
    setMobileSearchOpen(false);
  };

  const handleSearchSelectUser = (selectedUser) => {
    setRoute(ROUTES.PROFILE);
    setMobileSearchOpen(false);
  };

  return (
    <>
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
              type="button"
            >
              <div className="w-8 h-8 bg-[var(--wsu-green)] rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg hidden sm:inline">
                WSU Forum
              </span>
            </button>
          </div>

          {/* Center: Search - Desktop */}
          {isAuthenticated && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchDropdown
                onSelectPost={handleSearchSelectPost}
                onSelectUser={handleSearchSelectUser}
              />
            </div>
          )}

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notifications (FIX: use your component) */}
                <NotificationsDropdown />

                {/* Mobile Search Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                    >
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
                        <AvatarFallback>
                          {getInitials(user?.name)}
                        </AvatarFallback>
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

                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-600"
                    >
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

      {/* Mobile Search Dialog */}
      <Dialog open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
        <DialogContent className="sm:max-w-md top-4 translate-y-0">
          <DialogHeader>
            <DialogTitle className="sr-only">Search</DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <SearchDropdown
              onSelectPost={handleSearchSelectPost}
              onSelectUser={handleSearchSelectUser}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Header;
