import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addNotification, updateUnreadCount, fetchUnreadCount } from '../redux/slice/notification.slice';
import { updatePostVotes } from '../redux/slice/post.slice';
import { addCommentToPost, updateCommentVotes } from '../redux/slice/comment.slice';
import { requestNotificationPermission, subscribeToPushNotifications } from '../utils/pushNotifications';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Request notification permission and subscribe to push notifications
      const setupPushNotifications = async () => {
        try {
          const granted = await requestNotificationPermission();
          if (granted) {
            await subscribeToPushNotifications();
          }
        } catch (error) {
          console.log('Push notification setup failed:', error.message);
        }
      };
      setupPushNotifications();

      // Connect to socket server
      socketRef.current = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', {
        withCredentials: true,
      });

      const socket = socketRef.current;

      // Join user room
      socket.emit('join-user', user._id);

      // Fetch initial unread count
      dispatch(fetchUnreadCount());

      // Listen for new notifications
      socket.on('new-notification', (notification) => {
        dispatch(addNotification(notification));

        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('New Notification', {
            body: notification.message,
            icon: '/icon-192x192.png'
          });
        }
      });

      // Listen for comment updates
      socket.on('comment-added', (data) => {
        dispatch(addCommentToPost(data));
      });

      // Listen for vote updates
      socket.on('vote-updated', (data) => {
        dispatch(updatePostVotes(data));
      });

      // Listen for comment vote updates
      socket.on('comment-vote-updated', (data) => {
        dispatch(updateCommentVotes(data));
      });

      // Cleanup on unmount
      return () => {
        socket.disconnect();
      };
    } else {
      // Disconnect if not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }
  }, [isAuthenticated, user, dispatch]);

  const joinPostRoom = (postId) => {
    if (socketRef.current) {
      socketRef.current.emit('join-post', postId);
    }
  };

  const leavePostRoom = (postId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-post', postId);
    }
  };

  const value = {
    socket: socketRef.current,
    joinPostRoom,
    leavePostRoom,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};