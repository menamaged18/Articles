import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://127.0.0.1:8000/api';

// Fetch all comments for an article 
export const fetchComments = createAsyncThunk('comments/fetch',
  async (articleId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/articles/${articleId}/comments`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch comments');
      return { articleId, comments: data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new comment 
export const createComment = createAsyncThunk('comments/create',
  async ({ articleId, content }, { rejectWithValue}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to create comment');
      return { articleId, comment: data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update an existing comment 
export const updateComment = createAsyncThunk('comments/update',
  async ({ commentId, content }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to update comment');
      return data; // updated comment object
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete a comment 
export const deleteComment = createAsyncThunk('comments/delete',
  async (commentId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.message || 'Failed to delete comment');
      }
      return { id: commentId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    // Store comments per articleId: { [articleId]: arrayOfComments }
    commentsByArticle: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearCommentsForArticle: (state, action) => {
      delete state.commentsByArticle[action.payload];
    },
    clearAllComments: (state) => {
      state.commentsByArticle = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        const { articleId, comments } = action.payload;
        state.commentsByArticle[articleId] = comments;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load comments';
      })

      // Create comment
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        const { articleId, comment } = action.payload;
        if (state.commentsByArticle[articleId]) {
          state.commentsByArticle[articleId] = [comment, ...state.commentsByArticle[articleId]];
        } else {
          state.commentsByArticle[articleId] = [comment];
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create comment';
      })

      // Update comment
      .addCase(updateComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading = false;
        const updatedComment = action.payload;
        // Find the article that contains this comment
        for (const articleId in state.commentsByArticle) {
          const index = state.commentsByArticle[articleId].findIndex(c => c.id === updatedComment.id);
          if (index !== -1) {
            state.commentsByArticle[articleId][index] = updatedComment;
            break;
          }
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update comment';
      })

      // Delete comment
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        const { id: commentId } = action.payload;
        // Update State and Remove from all article comment lists
        for (const articleId in state.commentsByArticle) {
          state.commentsByArticle[articleId] = state.commentsByArticle[articleId].filter(c => c.id !== commentId);
        }
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete comment';
      });
  },
});

export const { clearCommentsForArticle, clearAllComments } = commentsSlice.actions;
export default commentsSlice.reducer;