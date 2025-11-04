import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slice/auth.slice';
import userReducer from '../slice/user.slice';
import postReducer from '../slice/post.slice';
import communityReducer from '../slice/community.slice';
import commentReducer from '../slice/comment.slice';
import notificationReducer from '../slice/notification.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    post: postReducer,
    community: communityReducer,
    comment: commentReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});