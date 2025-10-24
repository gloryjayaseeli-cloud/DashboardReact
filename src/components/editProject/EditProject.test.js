import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import EditProject from './EditProject';

import {
  updateProject,
  selectProjectDetails,
  selectProjectsStatus,
  selectProjectError,
} from '../../features/ProjectSlice/project';
import {
  selectAllTasks,
  selectTasksStatus,
  selectTaskError,
} from '../../features/taskSlice/task';

Object.defineProperty(window, 'scrollTo', { value: jest.fn(), writable: true });

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('../../features/ProjectSlice/project');
jest.mock('../../features/taskSlice/task');

jest.mock('../alertMessage/AlertMessage', () => ({ message, variant }) => (
  <div data-testid="alert-message" className={`alert-${variant}`}>{message}</div>
));
jest.mock('../popup/popup', () => ({ show }) => (show ? <div data-testid="popup-modal">Popup Modal</div> : null));


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({
    projectID: '1',
    ProjectName: 'Project Titan',
  }),
}));

describe('EditProject Component', () => {
  let dispatch;
  const mockProjectDetails = {
    data: {
      id: '1',
      name: 'Project Titan',
      description: 'A major project.',
      owner: 'Alice',
      start_date: '2025-10-17',
      end_date: '2025-10-25',
    },
    tasks: [
      { id: 'task1', description: 'Design phase', status: 'completed' },
      { id: 'task2', description: 'Development phase', status: 'in_progress' },
    ],
  };

  beforeEach(() => {
    dispatch = jest.fn();
    useDispatch.mockReturnValue(dispatch);
    useSelector.mockImplementation(selector => {
      if (selector === selectProjectDetails) return mockProjectDetails;
      if (selector === selectAllTasks) return mockProjectDetails.tasks;
      if (selector === selectProjectsStatus) return 'succeeded';
      if (selector === selectTasksStatus) return 'succeeded';
      if (selector === selectProjectError) return null;
      if (selector === selectTaskError) return null;
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
        <EditProject />
      </MemoryRouter>
    );
  };

  test('should render the edit project form with initial project data', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /edit project/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProjectDetails.data.name)).toBeInTheDocument();
    expect(screen.getByLabelText(/project description/i)).toHaveValue(mockProjectDetails.data.description);
    expect(screen.getByText('Design phase')).toBeInTheDocument();
    expect(screen.getByText('Development phase')).toBeInTheDocument();
  });

  test('should update form fields on user input', () => {
    renderComponent();
    const projectNameInput = screen.getByDisplayValue(mockProjectDetails.data.name);
    fireEvent.change(projectNameInput, { target: { value: 'Project Titan Updated' } });
    expect(projectNameInput).toHaveValue('Project Titan Updated');
  });

  test('should dispatch updateProject and navigate on form submission', () => {
    renderComponent();

    const descriptionInput = screen.getByLabelText(/project description/i);
    fireEvent.change(descriptionInput, { target: { value: 'An updated major project.' } });
    fireEvent.click(screen.getByRole('button', { name: /edit project/i }));

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(updateProject).toHaveBeenCalledWith({
      id: '1',
      projectData: expect.objectContaining({
        description: 'An updated major project.',
      }),
    });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('should open the modal when a task is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Design phase'));
    expect(screen.getByTestId('popup-modal')).toBeInTheDocument();
  });

   test('should open the modal when "Add Task" is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    expect(screen.getByTestId('popup-modal')).toBeInTheDocument();
  });

  test('should display a loading spinner when project status is "loading"', () => {
    useSelector.mockImplementation(selector => {
      if (selector === selectProjectsStatus) return 'loading';
      return undefined;
    });
    renderComponent();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('should handle project fetch failure gracefully', () => {
    useSelector.mockImplementation(selector => {
        if (selector === selectProjectDetails) return { data: null, tasks: [] };
        if (selector === selectProjectsStatus) return 'failed';
        if (selector === selectProjectError) return 'Failed to fetch details';
        return undefined;
    });
    renderComponent();
    
    expect(screen.queryByDisplayValue(mockProjectDetails.data.name)).not.toBeInTheDocument();
    expect(screen.queryByTestId('alert-message')).not.toBeInTheDocument();
  });
});

