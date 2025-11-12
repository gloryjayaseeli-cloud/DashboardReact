import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { logout } from '../Authslice/auth';
import config from '../../config/config';
const API_URL = `${config.api.baseUrl}/users/`;
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token || localStorage.getItem("token")

      if (!token) {
        return thunkAPI.rejectWithValue('Authentication token not found!');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_URL}me/`, config);
      return response.data;

    } catch (error) {
      const message =
        (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const fetchUserList = createAsyncThunk(
  'user/fetchUserList',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token || localStorage.getItem("token");

      if (!token) {
        return thunkAPI.rejectWithValue('Authentication token not found!');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(API_URL, config);
      return response.data;

    } catch (error) {
      const message =
        (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const setUserRole = createAsyncThunk(
  'user/setUserRole',
  async ({ userId, role }, { getState, rejectWithValue }) => {
    try {
      const authToken = getState().auth.token || localStorage.getItem("token");
      if (!authToken) {
        return rejectWithValue('Admin token not found');
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      };

      const response = await axios.patch(`${API_URL}${userId}/set-role/`, { groups:[role] }, config);
      return response.data;
    } catch (error) {
      const message =
        (error.response?.data?.message) || error.message || error.toString();
      return rejectWithValue(message);
    }
  }
);


const initialState = {
  profile: null,
  status: 'idle',
  error: null,
  userList: []
};


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.profile = null;
      })
      .addCase(fetchUserList.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userList = action.payload;
      })
      .addCase(fetchUserList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(setUserRole.fulfilled, (state, action) => {
        const index = state.userList.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.userList[index] = action.payload;
        }
      })
      .addCase(logout, (state) => {
        state.profile = null;
        state.status = 'idle';
        state.error = null;
      });
  },
});


export const selectUserProfile = (state) => state?.user?.profile;

export const selectUserStatus = (state) => state?.user?.status;
export const selectUserError = (state) => state?.user?.error

export const selectUsername = (state) => state.user?.profile?.username;
export const selectUserList = (state) => state.user?.userList;

export const selectUserRole = (state) => state.user?.profile?.groups[0];

export default userSlice.reducer;

