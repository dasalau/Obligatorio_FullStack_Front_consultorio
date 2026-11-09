import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

const buildErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.mensaje ||
    error?.message ||
    "Ocurrio un error inesperado"
  );
};

export const loginUsuario = createAsyncThunk(
  "auth/loginUsuario",
  async (payload, thunkApi) => {
    try {
      const { data } = await api.post("/auth/login", payload);
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(buildErrorMessage(error));
    }
  },
);

export const registerUsuario = createAsyncThunk(
  "auth/registerUsuario",
  async (payload, thunkApi) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(buildErrorMessage(error));
    }
  },
);

export const fetchMiPerfil = createAsyncThunk(
  "auth/fetchMiPerfil",
  async (_, thunkApi) => {
    try {
      const { data } = await api.get("/usuarios/me");
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(buildErrorMessage(error));
    }
  },
);

export const cambiarPlanUsuario = createAsyncThunk(
  "auth/cambiarPlanUsuario",
  async (plan, thunkApi) => {
    try {
      const { data } = await api.patch("/usuarios/change-plan", { plan });
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(buildErrorMessage(error));
    }
  },
);

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
  extraReducers: (builder) => {
    builder
      .addCase(loginUsuario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUsuario.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUsuario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUsuario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUsuario.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(registerUsuario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMiPerfil.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMiPerfil.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(fetchMiPerfil.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cambiarPlanUsuario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cambiarPlanUsuario.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.user) {
          state.user = action.payload.user;
        }
      })
      .addCase(cambiarPlanUsuario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthError, logout } = authSlice.actions;

export default authSlice.reducer;
