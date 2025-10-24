import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import NavBar from './NavBar';
import * as store from '../../store/index'; 

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));



describe('NavBar Component', () => {
  let mockDispatch;
  let mockNavigate;
  let persistorSpy;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockNavigate = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);
    useNavigate.mockReturnValue(mockNavigate);
    Storage.prototype.removeItem = jest.fn();
    useSelector.mockReturnValue(null);

    persistorSpy = jest.spyOn(store.persistor, 'purge').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
    persistorSpy.mockRestore(); 
  });

  const renderComponent = () => {
    const dummyStore = { getState: () => ({}), subscribe: () => {}, dispatch: () => {} };
    return render(
      <Provider store={dummyStore}>
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      </Provider>
    );
  };

  test('should render login button when user is not logged in', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('should render user info and logout button when user is logged in', () => {
    useSelector.mockReturnValue('TestUser');
    renderComponent();
    expect(screen.getByText('Welcome, TestUser')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  test('should handle logout process correctly', async () => {
    useSelector.mockReturnValue('TestUser');
    renderComponent();
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await act(async () => {
      fireEvent.click(logoutButton);
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('userName');
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'USER_LOGOUT' });
    
    expect(persistorSpy).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('should navigate to home page when login button is clicked', () => {
    renderComponent();
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});