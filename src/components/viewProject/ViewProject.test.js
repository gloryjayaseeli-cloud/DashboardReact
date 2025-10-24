import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ViewProject from './ViewProject'; 

import { viewProjectDetails, selectProjectDetails } from '../../features/ProjectSlice/project';
import { selectUserRole } from '../../features/UserSlice/user'; 

Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
    writable: true,
});

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('../../features/ProjectSlice/project', () => ({
  viewProjectDetails: jest.fn(),
  selectProjectDetails: state => state.project.projectDetails,
}));


jest.mock('../../features/UserSlice/user', () => ({
  selectUserRole: state => state.user.role,
}));


jest.mock('../popup/popup', () => {
  return function MockPopup({ show, task }) {
    return show ? (
      <div data-testid="popup">
        <h2>Task: {task.description}</h2>
        <span>Status: {task.status}</span>
      </div>
    ) : null;
  };
});


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ projectID: 'proj123' }),
}));


describe('ViewProject Component', () => {
  let dispatch;

  const mockProjectWithTasks = {
    data: {
      id: 'proj123',
      name: 'Test Project Alpha',
      description: 'This is a detailed description for the test project.',
      tasks: [
        { id: 'task1', description: 'Complete initial setup', status: 'completed' },
        { id: 'task2', description: 'Develop feature X', status: 'in_progress' },
        { id: 'task3', description: 'Fix bug in login', status: 'blocked' },
      ],
    },
  };

  const mockProjectWithoutTasks = {
    data: {
      id: 'proj456',
      name: 'Empty Project',
      description: 'A project with no tasks assigned.',
      tasks: [],
    },
  };

  beforeEach(() => {
    dispatch = jest.fn();
    useDispatch.mockReturnValue(dispatch);
    useSelector.mockClear();
    mockNavigate.mockClear();
    viewProjectDetails.mockClear();
    window.scrollTo.mockClear();
  });

  const renderComponent = (initialPath = '/project/proj123') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/project/:projectID" element={<ViewProject />} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          <Route path="/editProject/:projectID" element={<div>Edit Project Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };
  
  test('should render project details and tasks for a regular user', async () => {
    useSelector.mockImplementation(selector => {
      if (selector === selectUserRole) return 'user';
      if (selector === selectProjectDetails) return mockProjectWithTasks;
      return undefined;
    });

    renderComponent();
    
    expect(await screen.findByText('Test Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('This is a detailed description for the test project.')).toBeInTheDocument();
    expect(screen.getByText('Complete initial setup')).toBeInTheDocument();
    expect(screen.getByText('Develop feature X')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.queryByText('Edit Project')).not.toBeInTheDocument();
  });

  test('should render "Edit Project" button for an admin user and navigate on click', async () => {
    useSelector.mockImplementation(selector => {
        if (selector === selectUserRole) return 'admin';
        if (selector === selectProjectDetails) return mockProjectWithTasks;
        return undefined;
    });

    renderComponent();
    
    const editButton = await screen.findByText('Edit Project');
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);
    expect(mockNavigate).toHaveBeenCalledWith('/editProject/proj123');
  });

  test('should dispatch viewProjectDetails action on mount', () => {
    useSelector.mockImplementation(selector => {
        if (selector === selectUserRole) return 'user';
        if (selector === selectProjectDetails) return mockProjectWithTasks;
        return undefined;
    });

    renderComponent();
    expect(dispatch).toHaveBeenCalled();
    expect(viewProjectDetails).toHaveBeenCalledWith('proj123');
  });

  test('should display a message for admin when there are no tasks', async () => {
    useSelector.mockImplementation(selector => {
        if (selector === selectUserRole) return 'admin';
        if (selector === selectProjectDetails) return mockProjectWithoutTasks;
        return undefined;
    });

    renderComponent('/project/proj456');

    expect(await screen.findByText('Empty Project')).toBeInTheDocument();
    expect(screen.getByText('No task added, please edit the project to add tasks')).toBeInTheDocument();
  });
  
  test('should display a message for regular user when there are no tasks', async () => {
    useSelector.mockImplementation(selector => {
        if (selector === selectUserRole) return 'user';
        if (selector === selectProjectDetails) return mockProjectWithoutTasks;
        return undefined;
    });

    renderComponent('/project/proj456');

    expect(await screen.findByText('You dont have any task in this project')).toBeInTheDocument();
  });

  test('should open and close the task details popup on task click', async () => {
    useSelector.mockImplementation(selector => {
        if (selector === selectUserRole) return 'user';
        if (selector === selectProjectDetails) return mockProjectWithTasks;
        return undefined;
    });

    renderComponent();

    expect(screen.queryByTestId('popup')).not.toBeInTheDocument();
    
    const taskElement = await screen.findByText('Develop feature X');
    fireEvent.click(taskElement);

    const popup = screen.getByTestId('popup');
    expect(popup).toBeInTheDocument();
    expect(within(popup).getByText('Task: Develop feature X')).toBeInTheDocument();
    expect(within(popup).getByText('Status: in_progress')).toBeInTheDocument();
  });
  
  test('should navigate to dashboard when back button is clicked', async () => {
    useSelector.mockImplementation(selector => {
        if (selector === selectUserRole) return 'user';
        if (selector === selectProjectDetails) return mockProjectWithTasks;
        return undefined;
    });

    renderComponent();
    
    const backButton = await screen.findByRole('button', { name: '' }); 
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

});

