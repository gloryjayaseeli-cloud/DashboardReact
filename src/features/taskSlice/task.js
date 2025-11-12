import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import config from '../../config/config';
import { viewProjectDetails } from '../ProjectSlice/project';

const API_URL = `${config.api.baseUrl}/projects/`;


export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ projectId, taskData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_URL}${projectId}/tasks/`, taskData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Could not create task');
    }
  }
);

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (projectId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}${projectId}/tasks/`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Could not fetch tasks');
    }
  }
);

export const viewTaskDetails = createAsyncThunk(
  'tasks/viewTaskDetails',
  async ({ projectId, taskId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}${projectId}/tasks/${taskId}/`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Could not fetch task details');
    }
  }
);


export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ projectId, taskId, taskData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`${API_URL}${projectId}/tasks/${taskId}/`, taskData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Could not update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async ({ projectId, taskId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}${projectId}/tasks/${taskId}/`, config);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Could not delete task');
    }
  }
);




const initialState = {
  tasks: [],
  selectedTask: null,
  status: 'idle',
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.tasks = [];
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(viewTaskDetails.pending, (state) => {
        state.status = 'loading';
        state.selectedTask = null;
      })
      .addCase(viewTaskDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedTask = action.payload;
      })
      .addCase(viewTaskDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })

      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.selectedTask?.id === action.payload.id) {
          state.selectedTask = action.payload;
        }
      })
      .addCase(viewProjectDetails.fulfilled, (state, action) => {
        console.log("view success", action.payload)
        state.status = 'succeeded';
        state.tasks = action.payload.data.tasks || [];
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        if (state.selectedTask?.id === action.payload) {
          state.selectedTask = null;
        }
      });

  },
});

export const selectAllTasks = (state) => {
  return state?.task?.tasks;
};
export const selectTaskDetails = (state) => state?.task?.selectedTask;
export const selectTasksStatus = (state) => state?.task?.status;
export const selectTaskError = (state) => state?.task?.error;

export default taskSlice.reducer;
