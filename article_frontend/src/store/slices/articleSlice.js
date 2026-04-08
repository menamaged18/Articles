import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://127.0.0.1:8000/api';

// Fetch all articles
export const articlesAll = createAsyncThunk('articles/all', async (page = 1) => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/articles?page=${page}`, { headers });
  return res.json();
});

// Fetch single article 
export const articleById = createAsyncThunk('articles/byId', async (articleId) => {
  const res = await fetch(`${API_URL}/articles/${articleId}`);
  return res.json();
});

// Fetch user Articles 
export const articlesUser = createAsyncThunk('articles/user', async (page = 1, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      // Added ?page= parameter
      const response = await fetch(`${API_URL}/articles/user?page=${page}`, {
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

// Update Article
export const articleUpdateById = createAsyncThunk('articles/update', 
  async ({ articleId, updatedArticle }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedArticle)
      });
      
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Update failed');
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete Article
export const articleDeleteById = createAsyncThunk('articles/remove', 
  async (articleId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.message || 'Delete failed');
      }
      
      return { id: articleId }; // Return the ID of deleted article
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

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
          'Accept': 'application/json',
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
    pagination: {
      currentPage: 1,
      lastPage: 1,
      hasNextPage: true, // this helps in Infinite Scroll
    },
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
        
        // Format the new incoming articles
        const newArticles = action.payload.data.map((article) => ({
          ...article,
          userReaction: article.user_reaction !== null ? Boolean(Number(article.user_reaction)) : null,
        }));

        // If it's Page 1: Replace everything (refresh/initial load)
        // If it's page > 1: Append to existing list
        if (action.payload.current_page === 1) {
          state.articles = newArticles;
        } else {
          state.articles = [...state.articles, ...newArticles];
        }

        state.pagination = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          hasNextPage: action.payload.current_page < action.payload.last_page,
        };
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
        
        const newArticles = action.payload.data.map((article) => ({
            ...article,
            userReaction: article.user_reaction !== null ? Boolean(Number(article.user_reaction)) : null,
        }));

        // Logic for Infinite Scroll: 
        // If page 1, reset list. If page > 1, append.
        if (action.payload.current_page === 1) {
          state.articles = newArticles;
        } else {
          state.articles = [...state.articles, ...newArticles];
        }

        state.pagination = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          hasNextPage: action.payload.current_page < action.payload.last_page,
        };
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

      // Update Article
      .addCase(articleUpdateById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(articleUpdateById.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedArticle = action.payload;
        
        // Update in articles array to trigger in frontend
        const index = state.articles.findIndex(a => a.id == updatedArticle.id);
        if (index !== -1) {
          state.articles[index] = { ...state.articles[index], ...updatedArticle };
        }

        // Update article if it's the one being viewed
        if (state.article && state.article.id == updatedArticle.id) {
          state.article = { ...state.article, ...updatedArticle };
        }

      })
      .addCase(articleUpdateById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update article';
      })

      // Article Deletion
      .addCase(articleDeleteById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(articleDeleteById.fulfilled, (state, action) => {
        state.isLoading = false;
        const { id } = action.payload;
        
        // Remove from articles array (Update state)
        state.articles = state.articles.filter(article => article.id != id);
        // Clear single article if it was deleted
        if (state.article && state.article.id == id) {
          state.article = null;
        }
      })
      .addCase(articleDeleteById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete article';
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