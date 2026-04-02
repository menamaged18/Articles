import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_URL = 'http://127.0.0.1:8000'

// --------------------
// GET USERS
// --------------------
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    const res = await fetch(API_URL)
    return res.json()
  }
)

// --------------------
// login
// --------------------
export const login = createAsyncThunk('auth/login', async (userData, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
      return rejectWithValue(data.message || 'Login failed');
    }

    // Save token to localStorage
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// --------------------
// CREATE USER
// --------------------
export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    return res.json()
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    loading: false,
    currentUser: null, 
    token: localStorage.getItem('token') || null,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })

      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload)
      })
      
      // login cases 
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
})

export const { logout } = usersSlice.actions;
export default usersSlice.reducer
