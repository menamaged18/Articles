import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_URL = 'http://127.0.0.1:8000/api'

export const articlesAll = createAsyncThunk('articles', async () => {
    const articles = await fetch(`${API_URL}/articles`);
    return articles.json();
})

const articleSlice = createSlice( {
    name: 'ArticleSlice',
    initialState: {
        articles: [],
        article: null,
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(articlesAll.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(articlesAll.fulfilled, (state, action) => {
            state.isLoading = false;
            state.articles = action.payload;
        })
        .addCase(articlesAll.rejected, (state) => {
            state.isLoading = false;
            state.error = "Failed to load articles";
        })
    }
})

export default articleSlice.reducer
