// src/redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserAndToken(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearUserAndToken(state) {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setUserAndToken, clearUserAndToken } = authSlice.actions;
export const selectUser = state => state.auth.user;
export const selectToken = state => state.auth.token;
export default authSlice.reducer;
