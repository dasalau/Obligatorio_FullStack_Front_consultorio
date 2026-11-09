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

export const fetchEspecialidades = createAsyncThunk(
  "especialidades/fetchEspecialidades",
  async (payload = {}, thunkApi) => {
    try {
      const { pagina = 1, limite = 8 } = payload;
      const { data } = await api.get("/especialidades", {
        params: { pagina, limite },
      });
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(buildErrorMessage(error));
    }
  },
);

export const createEspecialidad = createAsyncThunk(
  "especialidades/createEspecialidad",
  async (payload, thunkApi) => {
    try {
      const { data } = await api.post("/especialidades", payload);
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(buildErrorMessage(error));
    }
  },
);

export const updateEspecialidad = createAsyncThunk(
  "especialidades/updateEspecialidad",
  async ({ id, payload }, thunkApi) => {
    try {
      const { data } = await api.patch(`/especialidades/${id}`, payload);
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(buildErrorMessage(error));
    }
  },
);

export const deleteEspecialidad = createAsyncThunk(
  "especialidades/deleteEspecialidad",
  async (id, thunkApi) => {
    try {
      const { data } = await api.delete(`/especialidades/${id}`);
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(buildErrorMessage(error));
    }
  },
);

const initialState = {
  items: [],
  loading: false,
  saving: false,
  error: null,
  paginacion: {
    pagina: 1,
    limite: 8,
    total: 0,
    totalPages: 1,
  },
};

const especialidadesSlice = createSlice({
  name: "especialidades",
  initialState,
  reducers: {
    setPaginaEspecialidades: (state, action) => {
      state.paginacion.pagina = action.payload;
    },
    clearEspecialidadesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEspecialidades.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEspecialidades.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.especialidades || [];
        state.paginacion.total = action.payload.total || 0;
        state.paginacion.pagina = action.payload.pagina || 1;
        state.paginacion.limite = action.payload.limite || 8;
        state.paginacion.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchEspecialidades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createEspecialidad.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createEspecialidad.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createEspecialidad.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateEspecialidad.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateEspecialidad.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateEspecialidad.rejected, (state) => {
        state.saving = false;
      })
      .addCase(deleteEspecialidad.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteEspecialidad.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(deleteEspecialidad.rejected, (state) => {
        state.saving = false;
      });
  },
});

export const { clearEspecialidadesError, setPaginaEspecialidades } =
  especialidadesSlice.actions;

export default especialidadesSlice.reducer;
