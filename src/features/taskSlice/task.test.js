import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { configureStore } from '@reduxjs/toolkit';
import taskReducer, {
  createTask,
  fetchTasks,
  viewTaskDetails,
  updateTask,
  deleteTask,
} from './task';
import { viewProjectDetails } from '../ProjectSlice/project';
import config from '../../config/config';

const selectAllTasks = (state) => state.tasks.tasks;
const selectTaskDetails = (state) => state.tasks.selectedTask;
const selectTasksStatus = (state) => state.tasks.status;
const selectTaskError = (state) => state.tasks.error;


const mock = new MockAdapter(axios);
const API_URL = `${config.api.baseUrl}/projects/`;


const createTestStore = (initialTaskState) => {
  const preloadedState = initialTaskState ? { tasks: initialTaskState } : undefined;

  return configureStore({
    reducer: {
      tasks: taskReducer,
      auth: (state = { token: 'fake-test-token' }) => state,
    },
    preloadedState,
  });
};

describe('taskSlice', () => {
  let store;
  const projectId = 1;

  beforeEach(() => {
    store = createTestStore();
    mock.reset();
  });

  it('should handle initial state', () => {
    expect(store.getState().tasks).toEqual({
      tasks: [],
      selectedTask: null,
      status: 'idle',
      error: null,
    });
  });

  describe('fetchTasks async thunk', () => {
    const mockTasks = [{ id: 101, title: 'Task 1' }, { id: 102, title: 'Task 2' }];

    it('should handle fetchTasks.fulfilled and update state correctly', async () => {
      mock.onGet(`${API_URL}${projectId}/tasks/`).reply(200, mockTasks);
      await store.dispatch(fetchTasks(projectId));

      const state = store.getState().tasks;
      expect(state.status).toBe('succeeded');
      expect(state.tasks).toEqual(mockTasks);
      expect(selectAllTasks(store.getState())).toEqual(mockTasks);
    });

    it('should handle fetchTasks.rejected', async () => {
      mock.onGet(`${API_URL}${projectId}/tasks/`).reply(500, 'Server Error');
      await store.dispatch(fetchTasks(projectId));

      const state = store.getState().tasks;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Server Error');
      expect(selectTaskError(store.getState())).toBe('Server Error');
    });

    it('should clear tasks and set status to loading on fetchTasks.pending', () => {
        store.dispatch(fetchTasks(projectId));
        const state = store.getState().tasks;
        expect(state.status).toBe('loading');
        expect(state.tasks).toEqual([]);
    });
  });

  describe('createTask async thunk', () => {
    const newTaskData = { title: 'New Task' };
    const returnedTask = { id: 103, ...newTaskData };

    it('should add the new task on createTask.fulfilled', async () => {
      mock.onPost(`${API_URL}${projectId}/tasks/`).reply(201, returnedTask);
      await store.dispatch(createTask({ projectId, taskData: newTaskData }));

      const state = store.getState().tasks;
      expect(state.tasks).toContainEqual(returnedTask);
    });
  });

  describe('updateTask async thunk', () => {
    const taskId = 101;
    const initialTask = { id: taskId, title: 'Old Title' };
    const updatedData = { title: 'New Title' };
    const returnedTask = { id: taskId, ...updatedData };

    it('should update a task in the tasks array on updateTask.fulfilled', async () => {
        store = createTestStore({ tasks: [initialTask] });
        mock.onPut(`${API_URL}${projectId}/tasks/${taskId}/`).reply(200, returnedTask);
        await store.dispatch(updateTask({ projectId, taskId, taskData: updatedData }));

        const state = store.getState().tasks;
        const updatedTaskInArray = state.tasks.find(t => t.id === taskId);
        expect(updatedTaskInArray).toEqual(returnedTask);
    });

    it('should update selectedTask if it matches the updated task', async () => {
        store = createTestStore({ tasks: [initialTask], selectedTask: initialTask });
        mock.onPut(`${API_URL}${projectId}/tasks/${taskId}/`).reply(200, returnedTask);
        await store.dispatch(updateTask({ projectId, taskId, taskData: updatedData }));

        const state = store.getState().tasks;
        expect(state.selectedTask).toEqual(returnedTask);
        expect(selectTaskDetails(store.getState())).toEqual(returnedTask);
    });
  });

  describe('deleteTask async thunk', () => {
      const taskId = 101;
      const initialTasks = [{ id: taskId, title: 'To Delete' }, { id: 102, title: 'To Keep' }];

      it('should remove the task from the array on deleteTask.fulfilled', async () => {
          store = createTestStore({ tasks: initialTasks });
          mock.onDelete(`${API_URL}${projectId}/tasks/${taskId}/`).reply(204);
          await store.dispatch(deleteTask({ projectId, taskId }));

          const state = store.getState().tasks;
          expect(state.tasks.length).toBe(1);
          expect(state.tasks.find(t => t.id === taskId)).toBeUndefined();
      });

      it('should clear selectedTask if the deleted task was selected', async () => {
        store = createTestStore({ tasks: initialTasks, selectedTask: initialTasks[0] });
        mock.onDelete(`${API_URL}${projectId}/tasks/${taskId}/`).reply(204);
        await store.dispatch(deleteTask({ projectId, taskId }));

        const state = store.getState().tasks;
        expect(state.selectedTask).toBeNull();
      });
  });

  describe('extraReducers', () => {
    it('should populate tasks when viewProjectDetails is fulfilled', () => {
      const projectPayload = {
          data: {
              id: 1,
              name: 'Project with Tasks',
              tasks: [{ id: 201, title: 'Task from Project' }]
          }
      };
      store.dispatch(viewProjectDetails.fulfilled(projectPayload));

      const state = store.getState().tasks;
      expect(state.status).toBe('succeeded');
      expect(state.tasks).toEqual(projectPayload.data.tasks);
    });

    it('should set tasks to an empty array if project details payload has no tasks', () => {
        const projectPayload = {
            data: {
                id: 1,
                name: 'Project without Tasks',
            }
        };
        store.dispatch(viewProjectDetails.fulfilled(projectPayload));
        const state = store.getState().tasks;
        expect(state.tasks).toEqual([]);
    });
  });
});
