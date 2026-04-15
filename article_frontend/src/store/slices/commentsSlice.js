import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://127.0.0.1:8000/api';

// Fetch all comments for an article (paginated)
export const fetchComments = createAsyncThunk(
  'comments/fetch',
  async ({ articleId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/articles/${articleId}/comments?page=${page}`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch');

      return {
        articleId,
        comments: data.data,          // array of comments
        meta: {
          currentPage: data.current_page,
          lastPage: data.last_page,
          hasNextPage: data.current_page < data.last_page,
        },
        isNewPage: page > 1,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new comment
export const createComment = createAsyncThunk(
  'comments/create',
  async ({ articleId, content }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
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
export const updateComment = createAsyncThunk(
  'comments/update',
  async ({ commentId, content }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
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
export const deleteComment = createAsyncThunk(
  'comments/delete',
  async (commentId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
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
    // Each article stores: { data: [], meta: { currentPage, lastPage, hasNextPage } }
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
      // ========== FETCH COMMENTS ==========
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        const { articleId, comments, meta, isNewPage } = action.payload;

        if (!state.commentsByArticle[articleId] || !isNewPage) {
          // First page or refresh
          state.commentsByArticle[articleId] = {
            data: comments,
            meta: meta,
          };
        } else {
          // Append next page
          state.commentsByArticle[articleId].data.push(...comments);
          state.commentsByArticle[articleId].meta = meta;
        }
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load comments';
      })

      // ========== CREATE COMMENT ==========
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        const { articleId, comment } = action.payload;
        if (state.commentsByArticle[articleId]) {
          // Prepend new comment to the data array
          state.commentsByArticle[articleId].data.unshift(comment);
        } else {
          // No comments loaded yet, create a new entry
          state.commentsByArticle[articleId] = {
            data: [comment],
            meta: { currentPage: 1, lastPage: 1, hasNextPage: false },
          };
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create comment';
      })

      // ========== UPDATE COMMENT ==========
      .addCase(updateComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading = false;
        const updatedComment = action.payload;
        // Find the article containing this comment and update it
        for (const articleId in state.commentsByArticle) {
          const articleComments = state.commentsByArticle[articleId];
          const index = articleComments.data.findIndex(c => c.id === updatedComment.id);
          if (index !== -1) {
            articleComments.data[index] = updatedComment;
            break;
          }
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update comment';
      })

      // ========== DELETE COMMENT ==========
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        const { id: commentId } = action.payload;
        for (const articleId in state.commentsByArticle) {
          const articleComments = state.commentsByArticle[articleId];
          articleComments.data = articleComments.data.filter(c => c.id !== commentId);
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