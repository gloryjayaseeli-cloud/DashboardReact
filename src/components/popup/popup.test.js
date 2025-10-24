import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Popup from './popup'; 
import { deleteTask, updateTask } from '../../features/taskSlice/task';
import { selectUserRole } from '../../features/UserSlice/user';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('../../features/taskSlice/task', () => ({
  deleteTask: jest.fn(),
  updateTask: jest.fn(),
}));
jest.mock('../../features/UserSlice/user', () => ({
  selectUserRole: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ projectID: 'proj-123' }),
}));

describe('Popup and Modal Component', () => {
  let dispatch;
  const mockSetShowModal = jest.fn();

  const mockTask = {
    id: 'task-001',
    description: 'Initial Task Description',
    status: 'in_progress',
    owner: 'John Doe',
    due_date: '2025-12-25',
  };

  beforeEach(() => {
    dispatch = jest.fn();
    useDispatch.mockReturnValue(dispatch);
    useSelector.mockImplementation((selector) => {
        if (selector === selectUserRole) return 'user';
        return undefined;
    });
    Storage.prototype.getItem = jest.fn(() => 'TestUser');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    test('should not render the modal when "show" prop is false', () => {
      render(<Popup show={false} />);
      expect(screen.queryByText(/Task/)).not.toBeInTheDocument();
    });

    test('should render the modal when "show" prop is true', () => {
        render(<Popup show={true} action="View" task={mockTask} />);
        const modalTitle = screen.getByText('View Task');
        const modal = modalTitle.closest('.modal');
        expect(modal).toBeInTheDocument();
        expect(modal).toHaveStyle('display: block');
    });
    

    test('should call setShowModal when the close button is clicked', () => {
      render(<Popup show={true} action="View" task={mockTask} setShowModal={mockSetShowModal} />);
      fireEvent.click(screen.getByLabelText('Close'));
      expect(mockSetShowModal).toHaveBeenCalledWith(false);
    });
  });


  describe('View Mode', () => {
    test('should render task details in read-only fields', async () => {
        render(<Popup show={true} action="View" task={mockTask} />);
        
        const descriptionFields = await screen.findAllByDisplayValue(mockTask.description);
        const viewDescriptionField = descriptionFields[0];
        expect(viewDescriptionField).toBeInTheDocument();

        const viewContainer = viewDescriptionField.closest('.modal-body');

        expect(within(viewContainer).getByDisplayValue('In Progress')).toBeInTheDocument();
        expect(within(viewContainer).getByDisplayValue(mockTask.owner)).toBeInTheDocument();
        expect(within(viewContainer).getByDisplayValue(mockTask.due_date)).toBeInTheDocument();

        expect(within(viewContainer).queryByRole('button', { name: /update/i })).not.toBeInTheDocument();
      });
  });

  describe('Edit Mode (User Role)', () => {
    test('should render editable fields and an update button', () => {
      useSelector.mockImplementation((selector) => {
        if (selector === selectUserRole) return 'user';
      });
      render(<Popup show={true} action="Edit" task={mockTask} setShowModal={mockSetShowModal} />);

     const descriptionField = screen.getByDisplayValue(mockTask.description);
      expect(descriptionField).toBeInTheDocument();
      
      expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });

    test('should dispatch updateTask when the update button is clicked', () => {
        useSelector.mockImplementation((selector) => {
            if (selector === selectUserRole) return 'user';
        });
        render(<Popup show={true} action="Edit" task={mockTask} setShowModal={mockSetShowModal} />);

        // Find the single editable input
        const descriptionInput = screen.getByDisplayValue(mockTask.description);
        fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });

        fireEvent.click(screen.getByRole('button', { name: /update/i }));

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(updateTask).toHaveBeenCalledWith({
          projectId: 'proj-123',
          taskId: mockTask.id,
          taskData: expect.objectContaining({ description: 'Updated Description' }),
        });
        expect(mockSetShowModal).toHaveBeenCalledWith(false);
      });
  });

   
    describe('Edit Mode (Admin Role)', () => {
        test('should render admin-specific edit view with Update and Delete buttons', () => {
            useSelector.mockImplementation((selector) => {
                if (selector === selectUserRole) return 'admin';
            });
            const handleTaskUpdate = jest.fn();
            const handleDelete = jest.fn();

            render(
              <Popup
                show={true}
                action="Edit"
                task={mockTask}
                setShowModal={mockSetShowModal}
                handleTaskUpdate={handleTaskUpdate}
                handleDelete={handleDelete}
              />
            );

            expect(screen.getByText('Assign task')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: /update/i }));
            expect(handleTaskUpdate).toHaveBeenCalled();

            fireEvent.click(screen.getByRole('button', { name: /delete/i }));
            expect(handleDelete).toHaveBeenCalled();
        });
    });

  describe('Create Mode', () => {
    const mockCreateTask = jest.fn();
    const mockSetNewTask = jest.fn();

    test('should render a form to create a new task', () => {
        render(
          <Popup
            show={true}
            action="Create"
            setShowModal={mockSetShowModal}
            handleCreateTaskWithData={mockCreateTask}
            NewOnetask={{ description: '', status: 'new', owner: '', due_date: '' }}
            setNewOneTask={mockSetNewTask}
          />
        );
      
        const saveButton = screen.getByRole('button', { name: /save task/i });
        const formContainer = saveButton.closest('.card-body');
      
        expect(within(formContainer).getByLabelText(/task description/i)).toBeInTheDocument();
        expect(within(formContainer).getByLabelText(/status/i)).toBeInTheDocument();
        expect(saveButton).toBeInTheDocument();
      });

    test('should call handleCreateTaskWithData on form submission', () => {
      const initialTaskState = { description: 'New Task', status: 'new', owner: 'New Owner', due_date: '2026-01-01' };
      render(
        <Popup
          show={true}
          action="Create"
          setShowModal={mockSetShowModal}
          handleCreateTaskWithData={mockCreateTask}
          NewOnetask={initialTaskState}
          setNewOneTask={mockSetNewTask}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /save task/i }));

      expect(mockCreateTask).toHaveBeenCalledWith(initialTaskState);
      expect(mockSetShowModal).toHaveBeenCalledWith(false);
    });
  });
});

