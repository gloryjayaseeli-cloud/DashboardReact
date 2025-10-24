import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/Authslice/auth';
import userReducer from '../features/UserSlice/user';
import projectReducer from '../features/ProjectSlice/project';
import taskReducer from '../features/taskSlice/task';
import { store as actualStore } from './index';

jest.mock('redux-persist', () => ({
  ...jest.requireActual('redux-persist'), 
  persistReducer: jest.fn().mockImplementation((config, reducer) => reducer),
  persistStore: jest.fn().mockImplementation(store => ({
      subscribe: jest.fn(),
      getState: jest.fn(),
      dispatch: jest.fn(),
      purge: jest.fn(),
  })),
}));

jest.mock('redux-persist/lib/storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));


describe('Redux Store and Root Reducer', () => {
  it('should initialize with the correct combined initial state', () => {
    const state = actualStore.getState();

    expect(state.auth).toEqual(authReducer(undefined, { type: '' }));
    expect(state.user).toEqual(userReducer(undefined, { type: '' }));
    expect(state.projects).toEqual(projectReducer(undefined, { type: '' }));
    expect(state.task).toEqual(taskReducer(undefined, { type: '' }));
  });

  it('should dispatch actions to the correct reducers', () => {
    const loginSuccessAction = {
      type: 'auth/login/fulfilled',
      payload: { access: 'test-token-123' },
    };

    actualStore.dispatch(loginSuccessAction);
    const state = actualStore.getState();

    expect(state.auth.isAuthenticated).toBe(true);
    expect(state.auth.token).toBe('test-token-123');

   expect(state.user).toEqual(userReducer(undefined, { type: '' }));
  });

  it('should reset the entire app state when USER_LOGOUT action is dispatched', () => {
   const loginSuccessAction = {
      type: 'auth/login/fulfilled',
      payload: { access: 'another-token' },
    };
    actualStore.dispatch(loginSuccessAction);
    
    let currentState = actualStore.getState();
    expect(currentState.auth.isAuthenticated).toBe(true);

    const logoutAction = { type: 'USER_LOGOUT' };
    actualStore.dispatch(logoutAction);
    currentState = actualStore.getState();

    const combinedInitialState = {
        auth: authReducer(undefined, { type: '' }),
        user: userReducer(undefined, { type: '' }),
        projects: projectReducer(undefined, { type: '' }),
        task: taskReducer(undefined, { type: '' }),
    };

    expect(currentState).toEqual(combinedInitialState);
  });
});
