import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/Authslice/auth';
import userReducer from '../features/UserSlice/user';
import projectReducer from "../features/ProjectSlice/project";
import taskReducer from "../features/taskSlice/task"


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'user', "projects"],
};

const appReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  projects: projectReducer,
  task: taskReducer
});

const rootReducer = (state, action) => {
  if (action.type === 'USER_LOGOUT') {

    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);