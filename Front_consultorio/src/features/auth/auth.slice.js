import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("token") || null,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action) => {
      const { token, user } = action.payload || {};
      state.token = token || null;
      state.user = user || null;
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    },
    setUser: (state, action) => {
      state.user = action.payload?.user || action.payload || null;
    },
    setAuthLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setAuthError: (state, action) => {
      state.error = action.payload || null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.error = null;
      localStorage.removeItem("token");
    },
  },
});

export const {
  setSession,
  setUser,
  setAuthLoading,
  setAuthError,
  clearAuthError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
