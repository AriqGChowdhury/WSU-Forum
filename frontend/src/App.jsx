import React, { useState, useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PostProvider } from '@/contexts/PostContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Header } from '@/components/layout/Header';
import { Sidebar, MobileSidebar } from '@/components/layout/Sidebar';
import { AuthView } from '@/components/auth/AuthView';
import { VerifyView } from '@/components/auth/VerifyView';
import { ResetPasswordView } from '@/components/auth/ResetPasswordView';
import { FeedView } from '@/components/feed/FeedView';
import { TopicsView } from '@/components/topics/TopicsView';
import { SubForumsView } from '@/components/subforums/SubForumsView';
import { SubForumDetailView } from '@/components/subforums/SubForumDetailView';
import { EventsView } from '@/components/events/EventsView';
import { SavedView } from '@/components/saved/SavedView';
import { ProfileView } from '@/components/profile/ProfileView';
import { SettingsView } from '@/components/settings/SettingsView';
import { LoungeView } from '@/components/lounge/LoungeView';
import { AdminView } from '@/components/admin/AdminView';
import { ROUTES } from '@/constants';

/**
 * Main App Component
 * Wraps the application with necessary providers
 */
export default function App() {
  return (
    <TooltipProvider>
      <SettingsProvider>
        <AuthProvider>
          <PostProvider>
            <AppContent />
          </PostProvider>
        </AuthProvider>
      </SettingsProvider>
    </TooltipProvider>
  );
}

/**
 * App Content - Main layout and routing
 */
function AppContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const [route, setRoute] = useState(ROUTES.AUTH);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedSubforum, setSelectedSubforum] = useState(null);
  

  const [resetPasswordParams, setResetPasswordParams] = useState({ uidb64: null, token: null });

  // Handle subforum selection
  const handleSelectSubforum = (subforum) => {
    setSelectedSubforum(subforum);
    setRoute(ROUTES.SUBFORUM);
  };

  // Handle back from subforum detail
  const handleBackFromSubforum = () => {
    setSelectedSubforum(null);
    setRoute(ROUTES.SUBFORUMS);
  };


  useEffect(() => {
    const checkResetPasswordUrl = () => {
      const path = window.location.pathname;
      const resetMatch = path.match(/\/reset-password\/([^\/]+)\/([^\/]+)/);
      
      if (resetMatch) {
        const [, uidb64, token] = resetMatch;
        setResetPasswordParams({ uidb64, token });
        setRoute(ROUTES.RESET_PASSWORD);
      }
    };
    
    checkResetPasswordUrl();
  }, []);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading) {
      // Allow reset password route without authentication
      if (route === ROUTES.RESET_PASSWORD) {
        return;
      }
      
      if (isAuthenticated && route === ROUTES.AUTH) {
        setRoute(ROUTES.FEED);
      } else if (!isAuthenticated && route !== ROUTES.AUTH && route !== ROUTES.VERIFY) {
        setRoute(ROUTES.AUTH);
      }
    }
  }, [isAuthenticated, loading, route]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--wsu-gray)] dark:bg-zinc-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--wsu-green)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Get event count for badge
  const eventBadge = 4; // Would come from events API

  // Handle Reset Password Route 
  if (route === ROUTES.RESET_PASSWORD) {
    return (
      <div className="min-h-screen w-full bg-[var(--wsu-gray)] dark:bg-zinc-900 transition-colors">
        <ResetPasswordView 
          uidb64={resetPasswordParams.uidb64}
          token={resetPasswordParams.token}
          onSuccess={() => setRoute(ROUTES.AUTH)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[var(--wsu-gray)] dark:bg-zinc-900 transition-colors">
      {/* Header */}
      <Header 
        onMenuClick={() => setMobileSidebarOpen(true)} 
        route={route} 
        setRoute={setRoute} 
      />

      {/* Mobile Sidebar (Sheet) */}
      <MobileSidebar
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
        route={route}
        setRoute={setRoute}
        badges={{ events: eventBadge }}
      />

      <div className="flex">
        {/* Desktop Sidebar - Collapsible */}
        <Sidebar 
          route={route} 
          setRoute={setRoute} 
          badges={{ events: eventBadge }} 
        />

        {/* Main Content */}
        <main className="flex-1 max-w-4xl mx-auto w-full">
          <div className="p-4 md:p-6">
            {renderView(route, setRoute, {
              selectedSubforum,
              onSelectSubforum: handleSelectSubforum,
              onBackFromSubforum: handleBackFromSubforum,
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Render the appropriate view based on current route
 */
function renderView(route, setRoute, options = {}) {
  const { 
    selectedSubforum, 
    onSelectSubforum, 
    onBackFromSubforum,
    selectedPostId,
    setSelectedPostId
  
  } = options;

  switch (route) {
    case ROUTES.AUTH:
      return <AuthView onShowVerify={() => setRoute(ROUTES.VERIFY)} />;
    
    case ROUTES.VERIFY:
      return <VerifyView onBackToLogin={() => setRoute(ROUTES.AUTH)} />;
    
    case ROUTES.RESET_PASSWORD:
      // This is handled specially in AppContent
      return null;

    case ROUTES.FEED:
      return <FeedView onSubforumClick={onSelectSubforum} />;

    case ROUTES.TOPICS:
      return <TopicsView />;
    
    case ROUTES.SUBFORUMS:
      return <SubForumsView onSelectSubforum={onSelectSubforum} />;
    
    case ROUTES.SUBFORUM:
      return selectedSubforum ? (
        <SubForumDetailView 
          forum={selectedSubforum} 
          onBack={onBackFromSubforum}
        />
      ) : (
        <SubForumsView onSelectSubforum={onSelectSubforum} />
      );
    
    case ROUTES.EVENTS:
      return <EventsView />;
    
    case ROUTES.SAVED:
      return <SavedView />;
    
    case ROUTES.PROFILE:
      return <ProfileView />;
    
    case ROUTES.SETTINGS:
      return <SettingsView setRoute={setRoute} />;
    
    case ROUTES.LOUNGE:
      return <LoungeView />;
    
    case ROUTES.ADMIN:
      return <AdminView />;
    
    default:
      return <FeedView onSubforumClick={onSelectSubforum} />;
  }
}