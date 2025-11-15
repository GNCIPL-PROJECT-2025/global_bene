import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slice/auth.slice';
import userReducer from '../slice/user.slice';
import postReducer from '../slice/post.slice';
import communityReducer from '../slice/community.slice';
import commentReducer from '../slice/comment.slice';
import notificationReducer from '../slice/notification.slice';
import adminReducer from '../slice/admin.slice';
import searchReducer from '../slice/search.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    post: postReducer,
    community: communityReducer,
    comment: commentReducer,
    notification: notificationReducer,
    admin: adminReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});