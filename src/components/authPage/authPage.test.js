import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import AuthPage from './AuthPage';
import { loginUser, registerUser, selectIsAuthenticated, selectAuthStatus } from '../../features/Authslice/auth';
import { fetchUser, selectUserProfile, selectUserStatus, selectUserError } from '../../features/UserSlice/user';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../../features/Authslice/auth', () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
  selectIsAuthenticated: jest.fn(),
  selectAuthStatus: jest.fn(),
}));

jest.mock('../../features/UserSlice/user', () => ({
  fetchUser: jest.fn(),
  selectUserProfile: jest.fn(),
  selectUserStatus: jest.fn(),
  selectUserError: jest.fn(),
}));

const renderWithProviders = (
  ui,
  {
    preloadedState = {
      auth: { token: null, isAuthenticated: false, status: 'idle', error: null },
      user: { profile: null, status: 'idle', error: null },
    },
    ...renderOptions
  } = {}
) => {
  const store = configureStore({
    reducer: {
      auth: (state = preloadedState.auth, action) => {
        if (action.type === 'auth/loginUser/fulfilled' || action.type === 'auth/registerUser/fulfilled') {
          return { ...state, isAuthenticated: true, status: 'succeeded' };
        }
        if (action.type === 'auth/loginUser/rejected' || action.type === 'auth/registerUser/rejected') {
          return { ...state, status: 'failed', error: 'Invalid credentials' };
        }
        return state;
      },
      user: (state = preloadedState.user) => state,
    },
  });

  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

describe('AuthPage Component', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    window.scrollTo = jest.fn();


    selectIsAuthenticated.mockImplementation(state => state.auth.isAuthenticated);
    selectAuthStatus.mockImplementation(state => state.auth.status);
    selectUserError.mockImplementation(state => state.user.error);
    selectUserStatus.mockImplementation(state => state.user.status);
    selectUserProfile.mockImplementation(state => state.user.profile);

    loginUser.mockReturnValue(() => ({ type: 'auth/loginUser/fulfilled' }));
    registerUser.mockReturnValue(() => ({ type: 'auth/registerUser/fulfilled' }));
    fetchUser.mockReturnValue(() => ({ type: 'user/fetchUser/fulfilled' }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render the Login form by default', () => {
    renderWithProviders(<AuthPage />);
    const loginButtons = screen.getAllByRole('button', { name: /login/i });
    expect(loginButtons.length).toBe(2);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });

  test('should switch to the Sign Up form when "Sign Up" is clicked', () => {
    renderWithProviders(<AuthPage />);
    const signUpTab = screen.getAllByRole('button', { name: 'Sign Up' })[0];
    fireEvent.click(signUpTab);
    const signUpButtons = screen.getAllByRole('button', { name: /sign up/i });
    expect(signUpButtons.length).toBe(2);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  test('should call loginUser with correct credentials on login form submission', () => {
    renderWithProviders(<AuthPage />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    const submitButton = screen.getAllByRole('button', { name: 'Login' })[1];
    fireEvent.click(submitButton);
    expect(loginUser).toHaveBeenCalledWith({ username: 'testuser', password: 'password123' });
  });

  test('should call registerUser with correct details on sign up form submission', () => {
    renderWithProviders(<AuthPage />);
    const signUpTab = screen.getAllByRole('button', { name: 'Sign Up' })[0];
    fireEvent.click(signUpTab);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'newpassword' } });
    const submitButton = screen.getAllByRole('button', { name: 'Sign Up' })[1];
    fireEvent.click(submitButton);
    expect(registerUser).toHaveBeenCalledWith({
      username: 'newuser',
      email: 'new@example.com',
      password: 'newpassword',
    });
  });

  test('should show a success alert and navigate on successful authentication', () => {
    renderWithProviders(<AuthPage />, {
      preloadedState: {
        auth: { isAuthenticated: true, status: 'succeeded', error: null },
        user: { status: 'idle' },
      },
    });
    expect(screen.getByText(/successful/i)).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('should show an error alert on authentication failure', () => {
    renderWithProviders(<AuthPage />, {
      preloadedState: {
        auth: { isAuthenticated: false, status: 'failed', error: 'Invalid credentials' },
        user: { profile: null, status: 'idle', error: null },
      },
    });
    expect(screen.getByText(/oops! something went wrong/i)).toBeInTheDocument();
  });

  test('should render a link to GitHub for OAuth authentication', () => {
    process.env.REACT_APP_GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize?client_id=test_id';
    renderWithProviders(<AuthPage />);
    const githubLink = screen.getByText(/continue with github/i).closest('a');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/login/oauth/authorize?client_id=test_id');
  });
});

