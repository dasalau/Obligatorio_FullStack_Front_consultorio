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

export const fetchTurnos = createAsyncThunk(
  "turnos/fetchTurnos",
  async (_, thunkApi) => {
    const { filtros, paginacion } = thunkApi.getState().turnos;

    try {
      const params = {
        pagina: paginacion.pagina,
        limite: paginacion.limite,
        mine: true,
      };

      if (filtros.estado) {
        params.estado = filtros.estado;
      }

      if (filtros.fecha) {
        params.fecha = filtros.fecha;
      }

      const { data } = await api.get("/turnos", { params });
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(buildErrorMessage(error));
    }
  },
);

const getActiveTurnosCount = (turnos = []) =>
  turnos.filter((turno) => {
    const estado = String(turno?.estado || "")
      .trim()
      .toLowerCase();
    return estado === "pendiente" || estado === "confirmado";
  }).length;

export const fetchTurnosReporte = createAsyncThunk(
  "turnos/fetchTurnosReporte",
  async (_, thunkApi) => {
    try {
      const params = {
        pagina: 1,
        limite: 1000,
        mine: true,
      };

      const { data } = await api.get("/turnos", { params });
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(buildErrorMessage(error));
    }
  },
);

export const createTurno = createAsyncThunk(
  "turnos/createTurno",
  async (payload, thunkApi) => {
    try {
      const { data } = await api.post("/turnos", payload);
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(buildErrorMessage(error));
    }
  },
);

export const updateTurno = createAsyncThunk(
  "turnos/updateTurno",
  async ({ id, payload }, thunkApi) => {
    try {
      const { data } = await api.put(`/turnos/${id}`, payload);
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(buildErrorMessage(error));
    }
  },
);

export const deleteTurno = createAsyncThunk(
  "turnos/deleteTurno",
  async (id, thunkApi) => {
    try {
      const { data } = await api.delete(`/turnos/${id}`);
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
  filtros: {
    estado: "",
    fecha: "",
  },
  paginacion: {
    pagina: 1,
    limite: 10,
    total: 0,
    totalPages: 1,
  },
  reporte: {
    items: [],
    total: 0,
    loading: false,
    error: null,
  },
};

const turnosSlice = createSlice({
  name: "turnos",
  initialState,
  reducers: {
    setFiltroEstado: (state, action) => {
      state.filtros.estado = action.payload;
      state.paginacion.pagina = 1;
    },
    setFiltroFecha: (state, action) => {
      state.filtros.fecha = action.payload;
      state.paginacion.pagina = 1;
    },
    setPagina: (state, action) => {
      state.paginacion.pagina = action.payload;
    },
    clearTurnosError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTurnos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTurnos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.turnos || [];
        state.paginacion.total = action.payload.total || 0;
        state.paginacion.pagina = action.payload.pagina || 1;
        state.paginacion.limite = action.payload.limite || 10;
        state.paginacion.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchTurnos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTurnosReporte.pending, (state) => {
        state.reporte.loading = true;
        state.reporte.error = null;
      })
      .addCase(fetchTurnosReporte.fulfilled, (state, action) => {
        const turnos = action.payload.turnos || [];
        state.reporte.loading = false;
        state.reporte.items = turnos;
        state.reporte.total = getActiveTurnosCount(turnos);
      })
      .addCase(fetchTurnosReporte.rejected, (state, action) => {
        state.reporte.loading = false;
        state.reporte.error = action.payload;
      })
      .addCase(createTurno.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createTurno.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createTurno.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateTurno.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateTurno.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateTurno.rejected, (state) => {
        state.saving = false;
      })
      .addCase(deleteTurno.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteTurno.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(deleteTurno.rejected, (state) => {
        state.saving = false;
      });
  },
});

export const { setFiltroEstado, setFiltroFecha, setPagina, clearTurnosError } =
  turnosSlice.actions;

export default turnosSlice.reducer;
