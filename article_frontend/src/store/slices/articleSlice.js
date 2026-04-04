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

// Send a reaction (like/dislike)
export const articleReact = createAsyncThunk(
  'articles/react',
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

      // Handle reaction
      .addCase(articleReact.fulfilled, (state, action) => {
        const reaction = action.payload;       
        const articleIndex = state.articles.findIndex((a) => a.id === reaction.article_id);
        if (articleIndex === -1) return;

        const article = state.articles[articleIndex];
        const oldReaction = article.userReaction;   
        const newReaction = reaction.type;          

        // Adjust counts based on change
        if (oldReaction === null) {
          // New reaction
          if (newReaction === true) article.likes_count += 1;
          else article.dislikes_count += 1;
        } else if (oldReaction === true && newReaction === false) {
          // Switching from like to dislike
          article.likes_count -= 1;
          article.dislikes_count += 1;
        } else if (oldReaction === false && newReaction === true) {
          // Switching from dislike to like
          article.dislikes_count -= 1;
          article.likes_count += 1;
        } else if (oldReaction === newReaction) {
          // Same reaction – cancel 
          if (newReaction === true) article.likes_count -= 1;
          else article.dislikes_count -= 1;
          article.userReaction = null;
          return;   
        }

        // Update userReaction to the new reaction 
        article.userReaction = newReaction;
      })
      .addCase(articleReact.rejected, (state, action) => {
        console.error('Reaction failed:', action.payload);
        // TODO: notification or a state to display in home component
      });
  },
});

export default articleSlice.reducer;