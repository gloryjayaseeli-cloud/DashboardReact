import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProjectDashboard from './ProjectDashboard';
import {
  fetchProjects,
  deleteProject,
  selectAllProjects,
  selectProjectsStatus,
  selectProjectError,
} from '../../features/ProjectSlice/project';
import { selectUserRole } from '../../features/UserSlice/user';
import { selectAuthToken } from '../../features/Authslice/auth';

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
  fetchProjects: jest.fn(),
  deleteProject: jest.fn(),
  selectAllProjects: jest.fn(),
  selectProjectsStatus: jest.fn(),
  selectProjectError: jest.fn(),
}));
jest.mock('../../features/UserSlice/user', () => ({
  selectUserRole: jest.fn(),
}));
jest.mock('../../features/Authslice/auth', () => ({
  selectAuthToken: jest.fn(),
}));

jest.mock('../AlertMessage/AlertMessage', () => {
    return function MockAlertMessage({ message, variant, onClose }) {
      return (
        <div data-testid="alert-message" className={`alert-${variant}`}>
          <span>{message}</span>
          <button onClick={onClose}>Close</button>
        </div>
      );
    };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ProjectDashboard Component', () => {
  let dispatch;

  const mockProjects = [
    { id: '1', name: 'Project Titan', description: 'A major project.', owner: 'Alice', start_date: '2023-01-01', end_date: '2023-12-31' },
    { id: '2', name: 'Project Phoenix', description: 'A revival project.', owner: 'Bob', start_date: '2023-02-01', end_date: '2023-11-30' },
  ];

  beforeEach(() => {
    dispatch = jest.fn();
    useDispatch.mockReturnValue(dispatch);
  
    Storage.prototype.getItem = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ProjectDashboard />
      </MemoryRouter>
    );
  };

  test('should fetch projects on mount if token is present', () => {
    useSelector.mockImplementation(selector => {
      if (selector === selectAuthToken) return 'fake-token';
      if (selector === selectAllProjects) return [];
      return undefined;
    });
    renderComponent();
    expect(dispatch).toHaveBeenCalledWith(fetchProjects());
  });

  test('should render project cards correctly for a regular user', () => {
    useSelector.mockImplementation(selector => {
      if (selector === selectUserRole) return 'user';
      if (selector === selectAllProjects) return mockProjects;
      return undefined;
    });

    renderComponent();
    expect(screen.getByText('Project Titan')).toBeInTheDocument();
    expect(screen.getByText('Project Phoenix')).toBeInTheDocument();
    expect(screen.queryByText('Create Project')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  test('should render admin controls for an admin user', () => {
    useSelector.mockImplementation(selector => {
      if (selector === selectUserRole) return 'admin';
      if (selector === selectAllProjects) return mockProjects;
      return undefined;
    });

    renderComponent();
    expect(screen.getByText('Create Project')).toBeInTheDocument();
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
    expect(screen.getAllByText('Delete').length).toBe(2);
  });
  
  test('should navigate to create project page on button click', () => {
    useSelector.mockImplementation(selector => {
        if (selector === selectUserRole) return 'admin';
        if (selector === selectAllProjects) return [];
        return undefined;
    });

    renderComponent();
    fireEvent.click(screen.getByText('Create Project'));
    expect(mockNavigate).toHaveBeenCalledWith('/projects');
  });
  
  test('should dispatch deleteProject when admin clicks delete', async () => {
    useSelector.mockImplementation(selector => {
      if (selector === selectUserRole) return 'admin';
      if (selector === selectAllProjects) return mockProjects;
      if (selector === selectProjectsStatus) return 'idle';
      return undefined;
    });
  
    renderComponent();
  
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
  
    expect(dispatch).toHaveBeenCalledWith(deleteProject('1'));
  });

  test('should show success alert on successful project deletion', async () => {
    let projectList = [...mockProjects];

    useSelector.mockImplementation(selector => {
      if (selector === selectUserRole) return 'admin';
      if (selector === selectAllProjects) return projectList;
      if (selector === selectProjectsStatus) return 'succeeded';
      if (selector === 'deletingProjectId') return '1';
      return undefined;
    });
    
    const { rerender } = render(
        <MemoryRouter>
          <ProjectDashboard />
        </MemoryRouter>
      );

    projectList = [mockProjects[1]];
    useSelector.mockImplementation(selector => {
        if (selector === selectUserRole) return 'admin';
        if (selector === selectAllProjects) return projectList;
        if (selector === selectProjectsStatus) return 'succeeded';
        if (selector === 'deletingProjectId') return null;
        return undefined;
      });

    rerender(
      <MemoryRouter>
        <ProjectDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText('Project deleted successfully ✅')).toBeInTheDocument();
  });

  test('should show error alert when API call fails', () => {
    useSelector.mockImplementation(selector => {
      if (selector === selectProjectsStatus) return 'failed';
      if (selector === selectProjectError) return 'API Error';
      if (selector === selectAllProjects) return mockProjects;
      return undefined;
    });
  
    renderComponent();
    
    expect(screen.getByText('Something is wrong ❌')).toBeInTheDocument();
  });

  test('should display a message when there are no projects', () => {
    useSelector.mockImplementation(selector => {
      if (selector === selectAllProjects) return [];
      return undefined;
    });

    renderComponent();
    expect(screen.getByText('Your dont have any projects as of now, please contact your admin')).toBeInTheDocument();
  });
});

