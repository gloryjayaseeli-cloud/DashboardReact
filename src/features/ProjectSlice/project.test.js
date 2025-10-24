import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { configureStore } from '@reduxjs/toolkit';
import projectReducer, {
  createProject,
  fetchProjects,
  updateProject,
  deleteProject,
  viewProjectDetails,
  selectAllProjects,
  selectProjectsStatus,
  selectProjectDetails,
  selectProjectError,
} from './project';
import config from '../../config/config';

const mock = new MockAdapter(axios);
const API_URL = `${config.api.baseUrl}/projects/`;

const createTestStore = (initialProjectState) => {
  const preloadedState = initialProjectState ? { projects: initialProjectState } : undefined;

  return configureStore({
    reducer: {
      projects: projectReducer,
      auth: (state = { token: 'fake-test-token' }) => state,
    },
    preloadedState: preloadedState,
  });
};

describe('projectSlice', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
     mock.reset();
  });

  it('should handle initial state', () => {
    expect(store.getState().projects).toEqual({
      projects: [],
      selectedProject: null,
      status: 'idle',
      error: null,
    });
  });

  describe('fetchProjects async thunk', () => {
    const mockProjects = [{ id: 1, name: 'Project Alpha' }, { id: 2, name: 'Project Beta' }];

    it('should handle fetchProjects.fulfilled', async () => {
      mock.onGet(API_URL).reply(200, mockProjects);
      await store.dispatch(fetchProjects());

      const state = store.getState().projects;
      expect(state.status).toBe('succeeded');
      expect(state.projects).toEqual(mockProjects);
      expect(selectAllProjects(store.getState())).toEqual(mockProjects);
    });

    it('should handle fetchProjects.rejected', async () => {
      mock.onGet(API_URL).reply(500, 'Server Error');
      await store.dispatch(fetchProjects());

      const state = store.getState().projects;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Server Error');
      expect(selectProjectError(store.getState())).toBe('Server Error');
    });
  });

  describe('createProject async thunk', () => {
    const newProject = { name: 'Project Gamma', description: 'A new project' };
    const returnedProject = { id: 3, ...newProject };

    it('should handle createProject.fulfilled', async () => {
      mock.onPost(API_URL).reply(201, returnedProject);
      await store.dispatch(createProject(newProject));

      const state = store.getState().projects;
      expect(state.projects).toContainEqual(returnedProject);
    });
  });

  describe('updateProject async thunk', () => {
    const initialProject = { id: 1, name: 'Old Name' };
    const updatedData = { name: 'New Name' };
    const returnedProject = { id: 1, name: 'New Name' };

    it('should handle updateProject.fulfilled', async () => {
      store = createTestStore({ projects: [initialProject] });
      mock.onPut(`${API_URL}${initialProject.id}/`).reply(200, returnedProject);
      await store.dispatch(updateProject({ id: initialProject.id, projectData: updatedData }));

      const state = store.getState().projects;
      const project = state.projects.find(p => p.id === initialProject.id);
      expect(project).toEqual(returnedProject);
    });
  });

  describe('deleteProject async thunk', () => {
    const projects = [{ id: 1, name: 'To Delete' }, { id: 2, name: 'To Keep' }];
    const projectIdToDelete = 1;

    it('should handle deleteProject.fulfilled', async () => {
      store = createTestStore({ projects });
      mock.onDelete(`${API_URL}${projectIdToDelete}/`).reply(204);
      await store.dispatch(deleteProject(projectIdToDelete));

      const state = store.getState().projects;
      expect(state.projects.length).toBe(1);
      expect(state.projects[0].id).toBe(2);
    });
  });

  describe('viewProjectDetails async thunk', () => {
    const projectDetails = { id: 1, name: 'Detailed Project', tasks: [] };
    const projectId = 1;

    it('should handle viewProjectDetails.fulfilled', async () => {
      mock.onGet(`${API_URL}${projectId}/`).reply(200, projectDetails);
      await store.dispatch(viewProjectDetails(projectId));

      const state = store.getState().projects;
      expect(state.status).toBe('succeeded');
      expect(state.selectedProject).toEqual(projectDetails);
      expect(selectProjectDetails(store.getState())).toEqual(projectDetails);
    });

    it('should handle viewProjectDetails.rejected', async () => {
      mock.onGet(`${API_URL}${projectId}/`).reply(404, 'Not Found');
      await store.dispatch(viewProjectDetails(projectId));
      
      const state = store.getState().projects;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Not Found');
      expect(state.selectedProject).toBeNull();
    });

    it('should set status to loading on viewProjectDetails.pending', () => {
        store.dispatch(viewProjectDetails(1));
        const status = selectProjectsStatus(store.getState());
        expect(status).toBe('loading');
    });
  });
});

