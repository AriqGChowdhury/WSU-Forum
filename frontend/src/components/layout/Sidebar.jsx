import React, { useState } from 'react';
import { 
  Home, 
  Hash, 
  CalendarDays, 
  Bookmark, 
  User, 
  Settings, 
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  LayoutGrid,
  ShieldCheck
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// Navigation items configuration
const NAV_ITEMS = [
  { icon: Home, label: 'Feed', route: ROUTES.FEED },
  { icon: LayoutGrid, label: 'Sub-Forums', route: ROUTES.SUBFORUMS },
  // { icon: Hash, label: 'Topics', route: ROUTES.TOPICS },
  { icon: CalendarDays, label: 'Events', route: ROUTES.EVENTS, badgeKey: 'events' },
  { icon: Bookmark, label: 'Saved', route: ROUTES.SAVED },
];

const ACCOUNT_ITEMS = [
  { icon: User, label: 'Profile', route: ROUTES.PROFILE },
  { icon: Settings, label: 'Settings', route: ROUTES.SETTINGS },
  // { icon: MessageCircle, label: 'Lounge', route: ROUTES.LOUNGE },
];

const ADMIN_ITEM = { icon: ShieldCheck, label: 'Admin', route: ROUTES.ADMIN };

/**
 * Desktop Sidebar - Collapsible with icons/text toggle
 */
export function Sidebar({ route, setRoute, badges = {} }) {
  const { isAuthenticated, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  
  // Add admin item if user is admin
  const accountItems = user?.role === 'Admin' 
    ? [...ACCOUNT_ITEMS, ADMIN_ITEM] 
    : ACCOUNT_ITEMS;

  if (!isAuthenticated) return null;

  return (
    <aside 
      className={cn(
        'sticky top-16 hidden h-[calc(100vh-4rem)] flex-col border-r bg-zinc-50/50 transition-all duration-300 md:flex',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {/* Navigation Items */}
      <div className="flex-1 p-2 space-y-1 overflow-hidden">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.route}
            icon={item.icon}
            label={item.label}
            active={route === item.route}
            onClick={() => setRoute(item.route)}
            badge={item.badgeKey ? badges[item.badgeKey] : undefined}
            collapsed={collapsed}
          />
        ))}

        <Separator className="my-3" />

        {accountItems.map((item) => (
          <NavItem
            key={item.route}
            icon={item.icon}
            label={item.label}
            active={route === item.route}
            onClick={() => setRoute(item.route)}
            collapsed={collapsed}
          />
        ))}
      </div>

      {/* Collapse Toggle Button */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full',
            collapsed ? 'justify-center px-2' : 'justify-start'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>

      {/* Footer - only show when expanded */}
      {!collapsed && (
        <div className="p-3 border-t text-xs text-zinc-400">
          <p>© 2025 WSU Forum</p>
          <div className="flex gap-2 mt-1">
            <button className="hover:text-zinc-600">About</button>
            <button className="hover:text-zinc-600">Help</button>
            <button className="hover:text-zinc-600">Terms</button>
          </div>
        </div>
      )}
    </aside>
  );
}

/**
 * Mobile Sidebar - Sheet/Drawer that slides in from left
 */
export function MobileSidebar({ open, onOpenChange, route, setRoute, badges = {} }) {
  const { isAuthenticated, user } = useAuth();
  
  // Add admin item if user is admin
  const accountItems = user?.role === 'Admin' 
    ? [...ACCOUNT_ITEMS, ADMIN_ITEM] 
    : ACCOUNT_ITEMS;

  if (!isAuthenticated) return null;

  const handleNavClick = (newRoute) => {
    setRoute(newRoute);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--wsu-green)] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span>WSU Forum</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <MobileNavItem
              key={item.route}
              icon={item.icon}
              label={item.label}
              active={route === item.route}
              onClick={() => handleNavClick(item.route)}
              badge={item.badgeKey ? badges[item.badgeKey] : undefined}
            />
          ))}

          <Separator className="my-3" />

          {accountItems.map((item) => (
            <MobileNavItem
              key={item.route}
              icon={item.icon}
              label={item.label}
              active={route === item.route}
              onClick={() => handleNavClick(item.route)}
            />
          ))}
        </div>

        <div className="p-4 border-t text-xs text-zinc-400">
          <p>© 2025 WSU Forum</p>
          <div className="flex gap-3 mt-1">
            <button className="hover:text-zinc-600">About</button>
            <button className="hover:text-zinc-600">Help</button>
            <button className="hover:text-zinc-600">Terms</button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Desktop Nav Item - with tooltip when collapsed
 */
function NavItem({ icon: Icon, label, active, onClick, badge, collapsed }) {
  const buttonContent = (
    <button
      onClick={onClick}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
        'hover:bg-white hover:shadow-sm',
        active && 'bg-white shadow-sm text-[var(--wsu-green)]',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', active && 'text-[var(--wsu-green)]')} />
      
      {!collapsed && (
        <>
          <span className="flex-1 text-left truncate">{label}</span>
          {badge && (
            <Badge 
              variant="secondary" 
              className="h-5 min-w-5 px-1.5 bg-[var(--wsu-green)]/10 text-[var(--wsu-green)]"
            >
              {badge}
            </Badge>
          )}
        </>
      )}
      
      {collapsed && badge && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--wsu-green)] rounded-full" />
      )}
    </button>
  );

  // Wrap in tooltip when collapsed
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            {buttonContent}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          <p>{label}</p>
          {badge && <span className="ml-1 text-xs">({badge})</span>}
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}

/**
 * Mobile Nav Item - always shows icon + text
 */
function MobileNavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all',
        'hover:bg-white hover:shadow-sm',
        active && 'bg-white shadow-sm text-[var(--wsu-green)]'
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn('h-5 w-5', active && 'text-[var(--wsu-green)]')} />
        <span>{label}</span>
      </div>
      {badge && (
        <Badge 
          variant="secondary" 
          className="h-5 min-w-5 px-1.5 bg-[var(--wsu-green)]/10 text-[var(--wsu-green)]"
        >
          {badge}
        </Badge>
      )}
    </button>
  );
}

export default Sidebar;
