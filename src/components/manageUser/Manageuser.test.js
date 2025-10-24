import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ManageUsers from './ManageUsers';
import {
  fetchUserList,
  setUserRole,
  selectUserList,
  selectUserStatus,
  selectUserError,
} from '../../features/UserSlice/user';


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), 
  useNavigate: () => mockNavigate, 
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
}));

jest.mock('../../features/UserSlice/user', () => ({
  fetchUserList: jest.fn(),
  setUserRole: jest.fn(),
  selectUserList: jest.fn(),
  selectUserStatus: jest.fn(),
  selectUserError: jest.fn(),
}));

jest.mock('../alertMessage/AlertMessage', () => {
  return ({ variant, message, onClose }) => (
    <div data-testid="alert-message">
      <span>{message}</span>
      <button onClick={onClose}>Close</button>
    </div>
  );
});


const mockUsers = [
  {
    id: 1,
    username: 'admin_user',
    email: 'admin@test.com',
    profile: { role: 'admin' },
  },
  {
    id: 2,
    username: 'member_user',
    email: 'member@test.com',
    profile: { role: 'member' },
  },
];



describe('ManageUsers Component', () => {

  const mockState = (status, list, error) => {
    useSelector.mockImplementation((selector) => {
      if (selector === selectUserList) return list;
      if (selector === selectUserStatus) return status;
      if (selector === selectUserError) return error;
      return undefined;
    });
  };

  beforeEach(() => {
  
    mockDispatch.mockClear();
    mockNavigate.mockClear();
    useSelector.mockClear();
    fetchUserList.mockClear();
    setUserRole.mockClear();
  });

  test('1. renders loading state initially', () => {
    mockState('loading', [], null);
    render(<ManageUsers />);


    expect(screen.getByText(/Loading users.../i)).toBeInTheDocument();
    expect(mockDispatch).toHaveBeenCalledWith(fetchUserList());
  });

  test('2. renders user list on successful fetch', () => {
    mockState('succeeded', mockUsers, null);
    render(<ManageUsers />);
    expect(screen.getByText('admin_user')).toBeInTheDocument();
    expect(screen.getByText('member@test.com')).toBeInTheDocument();
    expect(screen.getAllByText('admin')[0]).toBeInTheDocument(); 
    expect(screen.getByText('member')).toBeInTheDocument(); 
  });

  test('3. renders error message on failed fetch', () => {
    mockState('failed', [], 'Failed to fetch users');
    render(<ManageUsers />);

    expect(
      screen.getAllByText(/Failed to fetch users/i)[0]
    ).toBeInTheDocument();
  });

  test('4. back button navigates to /dashboard', () => {
    mockState('succeeded', [], null);
    const { container } = render(<ManageUsers />);

    const backButton = container.querySelector('button.btn-purple');
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('5. opens edit modal with correct user data on row click', () => {
    mockState('succeeded', mockUsers, null);
    render(<ManageUsers />);

    fireEvent.click(screen.getByText('admin_user'));

    expect(screen.getByText('Edit User Details')).toBeInTheDocument();

    expect(screen.getByLabelText(/Username/i)).toHaveValue('admin_user');
    expect(screen.getByLabelText(/Email/i)).toHaveValue('admin@test.com');
    expect(screen.getByLabelText(/Role/i)).toHaveValue('admin');
  });

  test('6. modal form can be updated and submitted', async () => {
    mockState('succeeded', mockUsers, null);
    render(<ManageUsers />);


    fireEvent.click(screen.getByText('admin_user'));

  
    const roleSelect = screen.getByLabelText(/Role/i);
    expect(roleSelect).toHaveValue('admin');

    fireEvent.change(roleSelect, { target: { value: 'member' } });
    expect(roleSelect).toHaveValue('member');

  
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    expect(mockDispatch).toHaveBeenCalledWith(
      setUserRole({ userId: 1, role: 'member' })
    );
  });

  test('7. modal closes on "Cancel" and re-fetches user list', async () => {
    mockState('succeeded', mockUsers, null);
    render(<ManageUsers />);

 
    expect(mockDispatch).toHaveBeenCalledWith(fetchUserList());
    expect(mockDispatch).toHaveBeenCalledTimes(2);


    fireEvent.click(screen.getByText('admin_user'));
    expect(screen.getByText('Edit User Details')).toBeInTheDocument();


    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Edit User Details')).not.toBeInTheDocument();
    });

 
    expect(mockDispatch).toHaveBeenCalledWith(fetchUserList());

    expect(mockDispatch).toHaveBeenCalledTimes(3);
  });
});

