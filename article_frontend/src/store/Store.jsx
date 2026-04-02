// store/store.js
import { configureStore } from '@reduxjs/toolkit'
import userslice from './slices/usersSlice'

export const store = configureStore({
  reducer: {
    users: userslice,
  },
})