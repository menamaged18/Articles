import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://127.0.0.1:8000/api';

// Fetch all articles
export const articlesAll = createAsyncThunk('articles/all', async () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/articles`, { headers });
  return res.json();
});

// Fetch single article 
export const articleById = createAsyncThunk('articles/byId', async (articleId) => {
  const res = await fetch(`${API_URL}/articles/${articleId}`);
  return res.json();
});

// Fetch user Articles 
export const articlesUser = createAsyncThunk('articles/user', async (_, { rejectWithValue}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }, 
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Fetching user Articles failed');
      return data; 
    } catch (error) {
      return rejectWithValue(error.message);
    }
});

// create article for the current user
export const createArticle = createAsyncThunk(
  'articles/create',
  async (articleData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(articleData), 
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create article');
      }
      return data; 
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// Send a reaction (like/dislike)
export const articleReact = createAsyncThunk('articles/react',
  async ({ articleId, reactType }, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles/${articleId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: reactType }), 
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Reaction failed');
      return data; 
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const articleSlice = createSlice({
  name: 'articles',
  initialState: {
    articles: [],          
    article: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all articles
      .addCase(articlesAll.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(articlesAll.fulfilled, (state, action) => {
        state.isLoading = false;
        state.articles = action.payload.map((article) => ({
            ...article,
            userReaction: article.user_reaction, 
        }));
      })
      .addCase(articlesAll.rejected, (state) => {
        state.isLoading = false;
        state.error = 'Failed to load articles';
      })

      // Fetch single article
      .addCase(articleById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(articleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.article = { ...action.payload, userReaction: null };
      })
      .addCase(articleById.rejected, (state) => {
        state.isLoading = false;
        state.error = 'Failed to load article';
      })

      // Fetch user articles
      .addCase(articlesUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(articlesUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.articles = action.payload.map((article) => ({
            ...article,
            userReaction: article.user_reaction, 
        }));
      })
      .addCase(articlesUser.rejected, (state) => {
        state.isLoading = false;
        state.error = 'Failed to load articles';
      })

      // Create article
      .addCase(createArticle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.articles.unshift(action.payload);

      })
      .addCase(createArticle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create article';
      })

      // Handle reaction
      .addCase(articleReact.fulfilled, (state, action) => {
        const { article_id, type, deleted } = action.payload;
        
        // Use == instead of === to handle String vs Number ID issues 
        // this solves the problem where manually reloading the page to see changes 
        const articleIndex = state.articles.findIndex((a) => a.id == article_id);
        
        if (articleIndex === -1) return;

        const article = { ...state.articles[articleIndex] };
        
        // Ensure userReaction isn't undefined (important for newly created articles)
        const oldReaction = article.userReaction ?? null;

        if (deleted) {
          // Remove Reaction
          if (oldReaction === true || oldReaction === 1) article.likes_count -= 1;
          if (oldReaction === false || oldReaction === 0) article.dislikes_count -= 1;
          article.userReaction = null;
        } else {
          const newReaction = !!type; 
          const normalizedOld = oldReaction === null ? null : !!oldReaction;

          if (normalizedOld === null) {
            newReaction ? article.likes_count += 1 : article.dislikes_count += 1;
          } else if (normalizedOld !== newReaction) {
            if (newReaction) {
              article.likes_count += 1;
              article.dislikes_count -= 1;
            } else {
              article.likes_count -= 1;
              article.dislikes_count += 1;
            }
          }
          article.userReaction = newReaction;
        }

        state.articles[articleIndex] = article;
      })
      .addCase(articleReact.rejected, (state, action) => {
        console.error('Reaction failed:', action.payload);
        // TODO: notification or a state to display in home component
      });
  },
});

export default articleSlice.reducer;