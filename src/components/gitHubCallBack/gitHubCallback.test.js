import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import GitHubCallback from './GitHubCallback';
import { fetchUser, selectUserProfile } from '../../features/UserSlice/user';


jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../features/UserSlice/user');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(),
}));

global.fetch = jest.fn();

describe('GitHubCallback Component', () => {
  let dispatch;

  beforeEach(() => {
    dispatch = jest.fn();
    useDispatch.mockReturnValue(dispatch);
    

    Storage.prototype.setItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
    
    useSelector.mockReturnValue(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <GitHubCallback />
      </MemoryRouter>
    );
  };

  test('should display "Loading..." message on initial render', () => {
    useLocation.mockReturnValue({ search: '' });
    renderComponent();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('should exchange code for a token, fetch user, and navigate to dashboard on success', async () => {
  useLocation.mockReturnValue({ search: '?code=test_github_code' });
     global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ access_token: 'fake_access_token' }),
      })
    );
    
    useSelector.mockReturnValue(null);

    const { rerender } = renderComponent();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/auth/github/'), expect.any(Object));
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake_access_token');
    });

    await waitFor(() => {
        expect(dispatch).toHaveBeenCalledWith(fetchUser());
    });

    const mockUser = { username: 'TestUser', profile: { role: 'admin' } };
    useSelector.mockImplementation(selector => {
      if (selector === selectUserProfile) return mockUser;
      return null;
    });

     rerender(<MemoryRouter><GitHubCallback /></MemoryRouter>);

     await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('role', 'admin');
      expect(localStorage.setItem).toHaveBeenCalledWith('userName', 'TestUser');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('should navigate to login on failed token exchange', async () => {
    useLocation.mockReturnValue({ search: '?code=bad_code' });
    global.fetch.mockRejectedValueOnce(new Error('Authentication failed'));

    renderComponent();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/auth/github/'), expect.any(Object));
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
    
   expect(localStorage.setItem).not.toHaveBeenCalledWith('token', expect.any(String));
    expect(dispatch).not.toHaveBeenCalled();
  });
  
  test('should not make a fetch request if there is no code in the URL', () => {
    useLocation.mockReturnValue({ search: '' });
    renderComponent();
    expect(fetch).not.toHaveBeenCalled();
  });
});

