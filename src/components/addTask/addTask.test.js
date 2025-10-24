
import React from 'react';
import { renderWithProviders, screen } from '../../utilities/test-utils'; 
import userEvent from '@testing-library/user-event';
import AddTaskPage from './AddTaskPage'; 

import { createTask } from '../../features/taskSlice/task'; 
jest.mock('../../features/taskSlice/task', () => ({
  ...jest.requireActual('../../features/taskSlice/task'), 
  createTask: jest.fn(), 
}));


const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

describe('AddTaskPage', () => {
  beforeEach(() => {
  
    mockDispatch.mockClear();
    createTask.mockClear(); 
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: jest.fn(() => 'testUser') },
      writable: true,
    });
  });

  test('should render the form and submit data correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddTaskPage />, {
      route: '/add-task/project-123/My%20Awesome%20Project',
      path: '/add-task/:projectID/:ProjectName',
    });

    // Act: Fill out the form
    await user.type(screen.getByLabelText(/task description/i), 'Finalize Q4 report');
    await user.selectOptions(screen.getByLabelText(/status/i), 'completed');
    await user.type(screen.getByLabelText(/due date/i), '2025-11-20');
    await user.click(screen.getByRole('button', { name: /save task/i }));

    expect(mockDispatch).toHaveBeenCalledTimes(1);

    expect(createTask).toHaveBeenCalledWith({
      projectId: 'project-123',
      taskData: {
        id: '',
        project: 'My Awesome Project',
        description: 'Finalize Q4 report',
        due_date: '2025-11-20',
        status: 'completed',
        owner: 'testUser',
      },
    });
  });
});
