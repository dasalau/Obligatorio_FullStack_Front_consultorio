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

export const fetchPacientes = createAsyncThunk(
  "pacientes/fetchPacientes",
  async (payload = {}, thunkApi) => {
    try {
      const { pagina = 1, limite = 8 } = payload;
      const { data } = await api.get("/pacientes", {
        params: { pagina, limite },
      });
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(buildErrorMessage(error));
    }
  },
);

export const searchPacientes = createAsyncThunk(
  "pacientes/searchPacientes",
  async ({ q = "", limite = 8 } = {}, thunkApi) => {
    try {
      const { data } = await api.get("/pacientes/buscar", {
        params: { q, limite },
      });
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(buildErrorMessage(error));
    }
  },
);

export const createPaciente = createAsyncThunk(
  "pacientes/createPaciente",
  async (payload, thunkApi) => {
    try {
      const { data } = await api.post("/pacientes", payload);
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(buildErrorMessage(error));
    }
  },
);

export const updatePaciente = createAsyncThunk(
  "pacientes/updatePaciente",
  async ({ id, payload }, thunkApi) => {
    try {
      const { data } = await api.put(`/pacientes/${id}`, payload);
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(buildErrorMessage(error));
    }
  },
);

export const deletePaciente = createAsyncThunk(
  "pacientes/deletePaciente",
  async (id, thunkApi) => {
    try {
      const { data } = await api.delete(`/pacientes/${id}`);
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(buildErrorMessage(error));
    }
  },
);

const initialState = {
  items: [],
  searchResults: [],
  loading: false,
  searchLoading: false,
  saving: false,
  error: null,
  paginacion: {
    pagina: 1,
    limite: 8,
    total: 0,
    totalPages: 1,
  },
};

const pacientesSlice = createSlice({
  name: "pacientes",
  initialState,
  reducers: {
    setPaginaPacientes: (state, action) => {
      state.paginacion.pagina = action.payload;
    },
    clearPacientesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPacientes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPacientes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.pacientes || [];
        state.paginacion.total = action.payload.total || 0;
        state.paginacion.pagina = action.payload.pagina || 1;
        state.paginacion.limite = action.payload.limite || 8;
        state.paginacion.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchPacientes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchPacientes.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchPacientes.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.pacientes || [];
      })
      .addCase(searchPacientes.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      })
      .addCase(createPaciente.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createPaciente.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createPaciente.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updatePaciente.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updatePaciente.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updatePaciente.rejected, (state) => {
        state.saving = false;
      })
      .addCase(deletePaciente.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deletePaciente.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(deletePaciente.rejected, (state) => {
        state.saving = false;
      });
  },
});

export const { clearPacientesError, setPaginaPacientes } =
  pacientesSlice.actions;

export default pacientesSlice.reducer;
