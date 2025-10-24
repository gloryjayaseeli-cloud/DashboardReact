import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import CreateProject from './CreateProject';

import { createProject, selectProjectsStatus, selectProjectError } from '../../features/ProjectSlice/project';
import { selectUserStatus, selectUserError } from '../../features/UserSlice/user';

Object.defineProperty(window, 'scrollTo', { value: jest.fn(), writable: true });

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));


jest.mock('../../features/ProjectSlice/project');
jest.mock('../../features/UserSlice/user');

jest.mock('../alertMessage/AlertMessage', () => {
  return function MockAlertMessage({ message, variant }) {
    return (
      <div data-testid="alert-message" className={`alert-${variant}`}>
        <span>{message}</span>
      </div>
    );
  };
});


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('CreateProject Component', () => {
  let dispatch;

  beforeEach(() => {
    dispatch = jest.fn();
    useDispatch.mockReturnValue(dispatch);
   useSelector.mockImplementation(selector => {
      if (selector === selectProjectsStatus) return 'idle';
      if (selector === selectUserStatus) return 'succeeded';
      if (selector === selectProjectError) return null;
      if (selector === selectUserError) return null;
      return undefined;
    });

    
    Storage.prototype.getItem = jest.fn(() => 'TestUser');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <CreateProject />
      </MemoryRouter>
    );
  };

  test('should render the create project form with initial values', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /create a new project/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/project name/i)).toHaveValue('');
    expect(screen.getByLabelText(/project description/i)).toHaveValue('');
    expect(screen.getByLabelText(/owner/i)).toHaveValue('TestUser');
  });

  test('should update form fields on user input', () => {
    renderComponent();
    const projectNameInput = screen.getByLabelText(/project name/i);
    fireEvent.change(projectNameInput, { target: { value: 'New Test Project' } });
    expect(projectNameInput).toHaveValue('New Test Project');
  });

  test('should dispatch createProject and navigate on form submission', () => {
    renderComponent();

    
    fireEvent.change(screen.getByLabelText(/project name/i), { target: { value: 'Project Alpha' } });
    fireEvent.change(screen.getByLabelText(/project description/i), { target: { value: 'Description for Alpha' } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2025-10-17' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2025-10-18' } });

  
    fireEvent.click(screen.getByRole('button', { name: /create project/i }));


    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(createProject).toHaveBeenCalledWith({
      owner: 'TestUser',
      name: 'Project Alpha',
      description: 'Description for Alpha',
      start_date: '2025-10-17',
      end_date: '2025-10-18',
      tasks: [],
    });


    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('should display a loading spinner when status is "loading"', () => {
    useSelector.mockImplementation(selector => {
      if (selector === selectProjectsStatus) return 'loading';
      return undefined;
    });
    renderComponent();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('should display an error alert when status is "failed"', () => {
    useSelector.mockImplementation(selector => {
      if (selector === selectProjectsStatus) return 'failed';
      if (selector === selectProjectError) return 'API Error'; 
      return undefined;
    });
    renderComponent();
    expect(screen.getByTestId('alert-message')).toHaveTextContent('project is not created successfully ❌');
  });

  test('should navigate to dashboard when back button is clicked', () => {
    renderComponent();
    const backButton = screen.getByRole('button', { name: '' });
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});

