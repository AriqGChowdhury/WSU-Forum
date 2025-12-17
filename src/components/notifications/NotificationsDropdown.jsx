import React, { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Heart, MessageCircle, UserPlus, Calendar, CheckCheck } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';

// Mock notifications for now - would come from API
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'like',
    user: { name: 'Sarah K.', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Sarah' },
    content: 'liked your post "Best starter project for CNNs?"',
    time: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
  },
  {
    id: 2,
    type: 'comment',
    user: { name: 'Dr. Chen', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=DrChen' },
    content: 'commented on your post',
    time: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
  },
  {
    id: 3,
    type: 'event',
    user: { name: 'WSU Robotics Club', avatar: 'https://api.dicebear.com/8.x/shapes/svg?seed=WSU' },
    content: 'posted a new event "Drivetrain Tear-Down Stream"',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
  },
];

const NOTIFICATION_ICONS = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  event: Calendar,
};

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Load notifications from localStorage or API
    const loadNotifications = () => {
      try {
        const saved = localStorage.getItem('wsu_notifications');
        if (saved) {
          const parsed = JSON.parse(saved);
          setNotifications(parsed.map(n => ({
            ...n,
            time: new Date(n.time)
          })));
        } else {
          setNotifications(MOCK_NOTIFICATIONS);
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setNotifications(MOCK_NOTIFICATIONS);
      }
    };

    loadNotifications();
  }, []);

  useEffect(() => {
    // Count unread notifications
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      // Save to localStorage
      try {
        localStorage.setItem('wsu_notifications', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save notifications:', error);
      }
      return updated;
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      try {
        localStorage.setItem('wsu_notifications', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save notifications:', error);
      }
      return updated;
    });
  };

  const handleClearAll = () => {
    setNotifications([]);
    try {
      localStorage.removeItem('wsu_notifications');
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-[500px]" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto py-1 px-2 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-700">No notifications</p>
            <p className="text-xs text-zinc-500 mt-1">
              You're all caught up!
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="py-1">
              {notifications.map((notification) => {
                const IconComponent = NOTIFICATION_ICONS[notification.type] || Bell;
                
                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`px-3 py-3 cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''}`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex gap-3 w-full">
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage src={notification.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(notification.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">{notification.user.name}</span>{' '}
                              <span className="text-zinc-600">{notification.content}</span>
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              {formatDate(notification.time)}
                            </p>
                          </div>
                          <div 
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ 
                              backgroundColor: notification.type === 'like' ? '#fee2e2' : 
                                              notification.type === 'comment' ? '#dbeafe' : 
                                              notification.type === 'event' ? '#fef3c7' : '#f3f4f6'
                            }}
                          >
                            <IconComponent 
                              className="h-4 w-4"
                              style={{
                                color: notification.type === 'like' ? '#ef4444' :
                                       notification.type === 'comment' ? '#3b82f6' :
                                       notification.type === 'event' ? '#f59e0b' : '#6b7280'
                              }}
                            />
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                        )}
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationsDropdown;
