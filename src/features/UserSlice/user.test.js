import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { configureStore } from '@reduxjs/toolkit';
import userReducer, {
  fetchUser,
  fetchUserList,
  setUserRole,
} from './user';
import { logout } from '../Authslice/auth';
import config from '../../config/config';

const mock = new MockAdapter(axios);
const API_URL = `${config.api.baseUrl}/users/`;

const createTestStore = (initialUserState) => {
  const preloadedState = initialUserState ? { user: initialUserState } : undefined;

  return configureStore({
    reducer: {
      user: userReducer,
      auth: (state = { token: 'fake-test-token' }) => state,
    },
    preloadedState,
  });
};

describe('userSlice', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
    mock.reset();
  });

  it('should handle initial state', () => {
    expect(store.getState().user).toEqual({
      profile: null,
      status: 'idle',
      error: null,
      userList: [],
    });
  });

  describe('fetchUser async thunk', () => {
    const mockUserProfile = { id: 1, username: 'TestUser', email: 'test@example.com' };

    it('should handle fetchUser.fulfilled and set the user profile', async () => {
      mock.onGet(`${API_URL}me/`).reply(200, mockUserProfile);
      await store.dispatch(fetchUser());

      const state = store.getState().user;
      expect(state.status).toBe('succeeded');
      expect(state.profile).toEqual(mockUserProfile);
    });

    it('should handle fetchUser.rejected and set an error', async () => {
      mock.onGet(`${API_URL}me/`).reply(401, { message: 'Unauthorized' });
      await store.dispatch(fetchUser());

      const state = store.getState().user;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Unauthorized');
      expect(state.profile).toBeNull();
    });

     it('should set status to loading on fetchUser.pending', () => {
        store.dispatch(fetchUser());
        const state = store.getState().user;
        expect(state.status).toBe('loading');
    });
  });

  describe('fetchUserList async thunk', () => {
    const mockUserList = [
      { id: 1, username: 'Alice' },
      { id: 2, username: 'Bob' },
    ];

    it('should handle fetchUserList.fulfilled and populate the user list', async () => {
      mock.onGet(API_URL).reply(200, mockUserList);
      await store.dispatch(fetchUserList());

      const state = store.getState().user;
      expect(state.status).toBe('succeeded');
      expect(state.userList).toEqual(mockUserList);
    });

    it('should handle fetchUserList.rejected', async () => {
      mock.onGet(API_URL).reply(500, { message: 'Server Error' });
      await store.dispatch(fetchUserList());

      const state = store.getState().user;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Server Error');
    });
  });

  describe('setUserRole async thunk', () => {
    const userId = 2;
    const newRole = 'admin';
    const initialUserList = [
      { id: 1, username: 'Alice', profile: { role: 'user' } },
      { id: 2, username: 'Bob', profile: { role: 'user' } },
    ];
    const updatedUser = { id: 2, username: 'Bob', profile: { role: 'admin' } };

    it('should handle setUserRole.fulfilled and update the user in the list', async () => {
      store = createTestStore({ userList: initialUserList });
      mock.onPatch(`${API_URL}${userId}/set-role/`).reply(200, updatedUser);

      await store.dispatch(setUserRole({ userId, role: newRole }));

      const state = store.getState().user;
      const userInList = state.userList.find(u => u.id === userId);
      expect(userInList).toEqual(updatedUser);
    });
  });

  describe('logout extra reducer', () => {
    it('should clear the user profile and reset status on logout', () => {
      store = createTestStore({
        profile: { id: 1, username: 'TestUser' },
        status: 'succeeded',
        error: null,
        userList: [],
      });
      
      store.dispatch(logout());

      const state = store.getState().user;
      expect(state.profile).toBeNull();
      expect(state.status).toBe('idle');
      expect(state.error).toBeNull();
    });
  });
});

