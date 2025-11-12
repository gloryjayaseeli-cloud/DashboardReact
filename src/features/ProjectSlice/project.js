import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import config from '../../config/config';

const API_URL = `${config.api.baseUrl}/projects/`;
export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(API_URL, projectData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Could not create project');
    }
  }
);

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token|| localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_URL, config);
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Could not fetch projects');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, projectData }, { getState, rejectWithValue }) => {
    try {
      console.log("updateProject", id,projectData)
      const token = getState().auth.token|| localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`${API_URL}${id}/`, projectData, config);
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Could not update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token|| localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}${projectId}/`, config);
      return projectId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Could not delete project');
    }
  }
);

export const viewProjectDetails = createAsyncThunk(
  'projects/viewProjectDetails',
  async (projectId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token|| localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}${projectId}/`, config);
      console.log("resss>>", response)
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Could not fetch project details');
    }
  }

);



const initialState = {
  projects: [],
  selectedProject: null, 
  status: 'idle', 
  error: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
   
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
     
      .addCase(createProject.fulfilled, (state, action) => {
         state.projects.push(action.payload); 
      })
      .addCase(createProject.pending, (state) => {
        state.status = 'loading'; 
      })
      .addCase(createProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload);
      })
      .addCase(viewProjectDetails.pending, (state) => {
        state.status = 'loading';
        state.selectedProject = null; 
      })
      .addCase(viewProjectDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedProject = action.payload;
      })
      .addCase(viewProjectDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});


export const selectAllProjects = (state) => state.projects.projects;
export const selectProjectsStatus = (state) => state.projects.status;
export const selectProjectDetails = (state) => state.projects.selectedProject; 
export const selectProjectError=(state)=>state.projects.error
export default projectSlice.reducer;