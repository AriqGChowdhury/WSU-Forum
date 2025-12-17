import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Calendar,
  CheckCheck,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

// Mock notifications - always show these
const MOCK_NOTIFICATIONS = [
  {
    id: "mock_1",
    type: "like",
    user: {
      name: "Sarah K.",
      avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=Sarah",
    },
    content: 'liked your post "Best starter project for CNNs?"',
    time: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
  },
  {
    id: "mock_2",
    type: "comment",
    user: {
      name: "Dr. Chen",
      avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=DrChen",
    },
    content: "commented on your post",
    time: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
  },
  {
    id: "mock_3",
    type: "event",
    user: {
      name: "WSU Robotics Club",
      avatar: "https://api.dicebear.com/8.x/shapes/svg?seed=WSU",
    },
    content: 'posted a new event "Drivetrain Tear-Down Stream"',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: "mock_4",
    type: "follow",
    user: {
      name: "Mike T.",
      avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=Mike",
    },
    content: "started following you",
    time: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
  },
];

const NOTIFICATION_ICONS = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  event: Calendar,
};

function formatNotificationTime(date) {
  if (!date) return "Just now";

  const now = new Date();
  const notifDate = new Date(date);
  const diffMs = now - notifDate;

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return notifDate.toLocaleDateString();
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (notificationId) => {
    setNotifications((prev) => {
      return prev.map((n) => {
        if (n.id === notificationId) {
          return { ...n, read: true };
        }
        return n;
      });
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => {
      return prev.map((n) => {
        return { ...n, read: true };
      });
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />

          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500 hover:bg-red-500">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-base">Notifications</h3>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAllAsRead();
              }}
              className="h-auto py-1 px-2 text-xs hover:bg-zinc-100"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="max-h-[400px]">
          <div className="py-1">
            {notifications.map((notification) => {
              const IconComponent =
                NOTIFICATION_ICONS[notification.type] || Bell;

              const bg =
                notification.type === "like"
                  ? "#fee2e2"
                  : notification.type === "comment"
                  ? "#dbeafe"
                  : notification.type === "event"
                  ? "#fef3c7"
                  : notification.type === "follow"
                  ? "#dcfce7"
                  : "#f3f4f6";

              const fg =
                notification.type === "like"
                  ? "#ef4444"
                  : notification.type === "comment"
                  ? "#3b82f6"
                  : notification.type === "event"
                  ? "#f59e0b"
                  : notification.type === "follow"
                  ? "#10b981"
                  : "#6b7280";

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={`px-3 py-3 cursor-pointer transition-colors ${
                    !notification.read
                      ? "bg-blue-50/50 hover:bg-blue-50/70"
                      : "hover:bg-zinc-50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!notification.read) {
                      handleMarkAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex gap-3 w-full">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarImage src={notification.user?.avatar} />
                      <AvatarFallback className="text-xs bg-zinc-200">
                        {getInitials(notification.user?.name || "U")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-snug">
                            <span className="font-medium">
                              {notification.user?.name}
                            </span>{" "}
                            <span className="text-zinc-600">
                              {notification.content}
                            </span>
                          </p>

                          <p className="text-xs text-zinc-500 mt-1">
                            {formatNotificationTime(notification.time)}
                          </p>
                        </div>

                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: bg }}
                        >
                          <IconComponent
                            className="h-4 w-4"
                            style={{ color: fg }}
                          />
                        </div>
                      </div>

                      {!notification.read && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-xs text-blue-600 font-medium">
                            New
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        </ScrollArea>

        <DropdownMenuSeparator />


        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-[var(--wsu-green)] hover:bg-[var(--wsu-green)]/10 hover:text-[var(--wsu-green)]"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationsDropdown;

          
