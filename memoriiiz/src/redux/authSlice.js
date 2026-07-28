import { createSlice } from "@reduxjs/toolkit";
import { tokenStore } from "../utils/api";

// Hydrate initial state from localStorage so refreshes don't log the user out.
const initialState = {
  user: tokenStore.getUser(),
  accessToken: tokenStore.getAccess(),
  refreshToken: tokenStore.getRefresh(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action) {
      const { user, accessToken, refreshToken } = action.payload || {};
      if (user !== undefined) state.user = user;
      if (accessToken !== undefined) state.accessToken = accessToken;
      if (refreshToken !== undefined) state.refreshToken = refreshToken;
      tokenStore.set({ user, accessToken, refreshToken });
    },
    clearSession(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      tokenStore.clear();
    },
  },
});

export const { setSession, clearSession } = authSlice.actions;

// Backwards-compat aliases so old imports keep working.
export const setUserAndToken = (payload) =>
  setSession({
    user: payload?.user,
    accessToken: payload?.accessToken || payload?.token,
    refreshToken: payload?.refreshToken,
  });
export const clearUserAndToken = clearSession;

export const selectUser = (s) => s.auth.user;
export const selectToken = (s) => s.auth.accessToken; // backwards-compat
export const selectAccessToken = (s) => s.auth.accessToken;
export const selectRefreshToken = (s) => s.auth.refreshToken;
export const selectIsAuthenticated = (s) => !!s.auth.accessToken;

export default authSlice.reducer;
