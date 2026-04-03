// store/store.js
import { configureStore } from '@reduxjs/toolkit'
import userslice from './slices/usersSlice'
import articleSlice from './slices/articleSlice'

export const store = configureStore({
  reducer: {
    users: userslice,
    articles: articleSlice,
  },
})