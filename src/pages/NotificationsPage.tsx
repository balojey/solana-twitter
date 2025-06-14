import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { EmptyState } from '../components/EmptyState';

export function NotificationsPage() {
  // Mock notifications for now
  const notifications = [
    {
      id: '1',
      type: 'like',
      user: 'alice.sol',
      content: 'liked your tweet',
      time: '2m ago',
      icon: Heart,
      color: 'text-red-500'
    },
    {
      id: '2',
      type: 'reply',
      user: 'bob.sol',
      content: 'replied to your tweet',
      time: '5m ago',
      icon: MessageCircle,
      color: 'text-blue-500'
    },
    {
      id: '3',
      type: 'follow',
      user: 'charlie.sol',
      content: 'started following you',
      time: '1h ago',
      icon: UserPlus,
      color: 'text-green-500'
    },
  ];

  return (
    <div className="space-y-4 p-6">
      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-full h-full" />}
          title="No notifications yet"
          description="When someone likes, replies to, or follows you, you'll see it here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <Card key={notification.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full bg-background ${notification.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {notification.user.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{notification.user}</span>{' '}
                        {notification.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}