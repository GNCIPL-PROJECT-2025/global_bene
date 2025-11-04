import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MainLayout from '@/Layouts/MainLayout';
import { Loader } from '@/components/common/Loader';
import { fetchNotifications, removeNotification, updateUnreadCount } from '../redux/slice/notification.slice';
import { getAllCommunities } from '@/redux/slice/community.slice';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Bell, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, loading, error, pagination } = useSelector(state => state.notification);
  const { communities } = useSelector(state => state.community);

  useEffect(() => {
    dispatch(fetchNotifications({}));
    // Reset unread count when user visits notifications page
    dispatch(updateUnreadCount(0));
  }, [dispatch]);

  useEffect(() => {
    // Fetch communities for sidebar
    dispatch(getAllCommunities());
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(removeNotification(id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'upvote':
        return '👍';
      case 'downvote':
        return '👎';
      case 'comment':
        return '💬';
      case 'reply':
        return '↩️';
      case 'follow':
        return '👤';
      case 'community_invite':
        return '📧';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'upvote':
        return 'text-green-600';
      case 'downvote':
        return 'text-red-600';
      case 'comment':
        return 'text-blue-600';
      case 'reply':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <MainLayout communities={communities || []}>
        <div className="flex items-center justify-center min-h-64">
          <Loader size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout communities={communities || []}>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
              <p className="text-muted-foreground text-center">
                When someone interacts with your posts or you receive updates, they'll appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification._id} className="transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                        {notification.relatedPost && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Post: {notification.relatedPost.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(notification._id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {pagination.currentPage < pagination.totalPages && (
          <div className="text-center mt-8">
            <Button
              onClick={() => {
                dispatch(fetchNotifications({ page: pagination.currentPage + 1 }));
              }}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;