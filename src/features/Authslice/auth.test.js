import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  registerUser,
  loginUser,
  logout,
  selectIsAuthenticated,
  selectAuthError,
  selectAuthStatus,
  selectAuthToken,
} from './auth';
import config from '../../config/config';


const mock = new MockAdapter(axios);
const API_URL = `${config.api.baseUrl}/`;


const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('authSlice', () => {
  let store;

  beforeEach(() => {
    mock.reset();
    localStorage.clear();
    store = configureStore({ reducer: { auth: authReducer } });
  });

  it('should handle initial state', () => {
    expect(store.getState().auth).toEqual({
      token: null,
      isAuthenticated: false,
      status: 'idle',
      error: null,
    });
  });


  describe('logout reducer', () => {
    it('should handle logout action', () => {
    localStorage.setItem('token', 'fake-token');
      const loggedInState = {
        token: 'fake-token',
        isAuthenticated: true,
        status: 'succeeded',
        error: null,
      };
      store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: { auth: loggedInState },
      });

      store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(selectIsAuthenticated(store.getState())).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('registerUser async thunk', () => {
    const userData = { email: 'test@example.com', password: 'password123' };

    it('should handle registerUser.fulfilled', async () => {
      mock.onPost(API_URL + 'signup/').reply(201, { message: 'User created' });
      await store.dispatch(registerUser(userData));

      const state = store.getState().auth;
      expect(state.status).toBe('succeeded');
      expect(state.isAuthenticated).toBe(false); 
      expect(state.error).toBeNull();
    });

    it('should handle registerUser.rejected', async () => {
      const errorMessage = 'Registration failed';
      mock.onPost(API_URL + 'signup/').reply(400, { message: errorMessage });
      await store.dispatch(registerUser(userData));

      const state = store.getState().auth;
      expect(state.status).toBe('failed');
      expect(state.error).toBe(errorMessage);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('loginUser async thunk', () => {
    const userData = { email: 'test@example.com', password: 'password123' };
    const responseData = { access: 'fake-access-token', refresh: 'fake-refresh-token' };

    it('should handle loginUser.fulfilled and set token in localStorage', async () => {
      mock.onPost(API_URL + 'login/').reply(200, responseData);


      expect(localStorage.getItem('token')).toBeNull();

      await store.dispatch(loginUser(userData));

      const state = store.getState().auth;
      expect(state.status).toBe('succeeded');
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe('fake-access-token');
      expect(selectAuthToken(store.getState())).toBe('fake-access-token');

 
      expect(localStorage.getItem('token')).toBe('fake-access-token');
    });

    it('should handle loginUser.rejected', async () => {
      const errorMessage = 'Invalid credentials';
      mock.onPost(API_URL + 'login/').reply(401, { message: errorMessage });
      await store.dispatch(loginUser(userData));

      const state = store.getState().auth;
      expect(state.status).toBe('failed');
      expect(state.error).toBe(errorMessage);
      expect(state.isAuthenticated).toBe(false);
      expect(selectAuthError(store.getState())).toBe(errorMessage);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });


  describe('selectors', () => {
    it('should select correct state slices', () => {
      const testState = {
        auth: {
          token: 'test-token',
          isAuthenticated: true,
          status: 'succeeded',
          error: 'An error',
        },
      };

      expect(selectIsAuthenticated(testState)).toBe(true);
      expect(selectAuthError(testState)).toBe('An error');
      expect(selectAuthStatus(testState)).toBe('succeeded');
      expect(selectAuthToken(testState)).toBe('test-token');
    });
  });
});
