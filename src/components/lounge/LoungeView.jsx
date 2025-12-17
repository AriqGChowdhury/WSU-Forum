import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getInitials } from '@/lib/utils';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Hash,
  Smile
} from 'lucide-react';

// Chat rooms configuration
const CHAT_ROOMS = [
  { id: 'general', name: 'General', icon: Hash, members: 234, unread: 5 },
  { id: 'study', name: 'Study Buddies', icon: Hash, members: 89, unread: 0 },
  { id: 'gaming', name: 'Gaming', icon: Hash, members: 156, unread: 12 },
  { id: 'events', name: 'Events Chat', icon: Hash, members: 67, unread: 0 },
];

// Mock demo messages
const DEMO_MESSAGES = [
  { id: 1, user: { name: 'Alex K.', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Alex' }, text: 'Hey everyone! Anyone up for a study session tonight?', time: '2:30 PM' },
  { id: 2, user: { name: 'Sarah M.', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Sarah' }, text: 'I\'m in! Library 3rd floor?', time: '2:32 PM' },
  { id: 3, user: { name: 'Alex K.', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Alex' }, text: 'Sounds good! Around 7pm?', time: '2:33 PM' },
  { id: 4, user: { name: 'Jordan T.', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Jordan' }, text: 'Count me in too 📚', time: '2:35 PM' },
  { id: 5, user: { name: 'Sarah M.', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Sarah' }, text: 'Perfect! See you all there', time: '2:36 PM' },
];

export function LoungeView() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [activeRoom, setActiveRoom] = useState('general');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Load online users - those with showOnlineStatus enabled
  useEffect(() => {
    // In a real app, this would be from an API
    // For now, we'll show the current user if they have online status enabled
    const loadOnlineUsers = () => {
      const mockOnlineUsers = [
        { 
          id: 'u1', 
          name: 'Alex K.', 
          avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Alex',
          showOnlineStatus: true 
        },
        { 
          id: 'u2', 
          name: 'Sarah M.', 
          avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Sarah',
          showOnlineStatus: true 
        },
        { 
          id: 'u3', 
          name: 'Jordan T.', 
          avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Jordan',
          showOnlineStatus: true 
        },
      ];

      // Add current user if they have online status enabled
      if (user && settings?.showOnlineStatus) {
        const currentUserOnline = {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          showOnlineStatus: true,
          isCurrentUser: true,
        };
        
        // Check if user is already in the list
        const userExists = mockOnlineUsers.some(u => u.id === user.id);
        if (!userExists) {
          setOnlineUsers([currentUserOnline, ...mockOnlineUsers]);
        } else {
          setOnlineUsers(mockOnlineUsers.map(u => 
            u.id === user.id ? { ...u, isCurrentUser: true } : u
          ));
        }
      } else if (user && !settings?.showOnlineStatus) {
        // If current user has online status disabled, don't show them
        setOnlineUsers(mockOnlineUsers.filter(u => u.id !== user.id));
      } else {
        setOnlineUsers(mockOnlineUsers);
      }
    };

    loadOnlineUsers();
  }, [user, settings]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      user: { name: user.name, avatar: user.avatar },
      text: message,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isOwn: true,
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <Card className="h-full">
        <div className="flex h-full">
          {/* Sidebar - Chat Rooms */}
          <div className="w-64 border-r flex-shrink-0 hidden md:block">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[var(--wsu-green)]" />
                Lounge
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {CHAT_ROOMS.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoom(room.id)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg
                      transition text-sm
                      ${activeRoom === room.id 
                        ? 'bg-[var(--wsu-green)]/10 text-[var(--wsu-green)]' 
                        : 'hover:bg-zinc-100'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <room.icon className="h-4 w-4" />
                      <span>{room.name}</span>
                    </div>
                    {room.unread > 0 && (
                      <span className="bg-[var(--wsu-green)] text-white text-xs px-2 py-0.5 rounded-full">
                        {room.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Online Users */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-xs font-medium text-zinc-500 mb-2 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  ONLINE — {onlineUsers.length}
                </p>
                {onlineUsers.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-zinc-400">No users online</p>
                    {user && !settings?.showOnlineStatus && (
                      <p className="text-xs text-zinc-400 mt-1">
                        Enable "Show online status" in Settings to appear here
                      </p>
                    )}
                  </div>
                ) : (
                  <ScrollArea className="max-h-[200px]">
                    <div className="space-y-2">
                      {onlineUsers.map((onlineUser) => (
                        <div key={onlineUser.id} className="flex items-center gap-2">
                          <div className="relative">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={onlineUser.avatar} />
                              <AvatarFallback className="text-xs">
                                {getInitials(onlineUser.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                          </div>
                          <span className="text-sm flex-1 truncate">
                            {onlineUser.name}
                            {onlineUser.isCurrentUser && (
                              <span className="text-xs text-zinc-400 ml-1">(you)</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Settings Reminder */}
              {user && !settings?.showOnlineStatus && (
                <div className="mt-4 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">
                    💡 Your online status is hidden. Enable it in Settings to appear online to others.
                  </p>
                </div>
              )}
            </CardContent>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-zinc-400" />
                <span className="font-semibold">
                  {CHAT_ROOMS.find((r) => r.id === activeRoom)?.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Users className="h-4 w-4" />
                <span>{CHAT_ROOMS.find((r) => r.id === activeRoom)?.members} members</span>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={msg.user.avatar} />
                      <AvatarFallback>{getInitials(msg.user.name)}</AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[70%] ${msg.isOwn ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {!msg.isOwn && (
                          <span className="text-sm font-medium">{msg.user.name}</span>
                        )}
                        <span className="text-xs text-zinc-500">{msg.time}</span>
                      </div>
                      <div 
                        className={`
                          inline-block px-4 py-2 rounded-2xl text-sm
                          ${msg.isOwn 
                            ? 'bg-[var(--wsu-green)] text-white rounded-br-md' 
                            : 'bg-zinc-100 rounded-bl-md'
                          }
                        `}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon">
                  <Smile className="h-5 w-5 text-zinc-400" />
                </Button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={!message.trim()}
                  className="bg-[var(--wsu-green)] hover:bg-[var(--wsu-green)]/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default LoungeView;
