import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import taskReducer from '../features/tasks/taskSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    // tasks: taskReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});