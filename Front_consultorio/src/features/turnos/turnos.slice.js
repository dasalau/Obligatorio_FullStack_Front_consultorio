import { createSlice } from "@reduxjs/toolkit";

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
    setTurnosLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setTurnosSaving: (state, action) => {
      state.saving = Boolean(action.payload);
    },
    setTurnosData: (state, action) => {
      const payload = action.payload || {};
      state.items = payload.turnos || [];
      state.paginacion.total = payload.total || 0;
      state.paginacion.pagina = payload.pagina || 1;
      state.paginacion.limite = payload.limite || 10;
      state.paginacion.totalPages = payload.totalPages || 1;
      state.error = null;
    },
    setTurnosReporteData: (state, action) => {
      const payload = action.payload || {};
      state.reporte.items = payload.turnos || payload.items || [];
      state.reporte.total = payload.total || 0;
      state.reporte.error = null;
    },
    setReporteLoading: (state, action) => {
      state.reporte.loading = Boolean(action.payload);
    },
    setReporteError: (state, action) => {
      state.reporte.error = action.payload || null;
    },
    setTurnosError: (state, action) => {
      state.error = action.payload || null;
    },
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
});

export const {
  setTurnosLoading,
  setTurnosSaving,
  setTurnosData,
  setTurnosReporteData,
  setReporteLoading,
  setReporteError,
  setTurnosError,
  setFiltroEstado,
  setFiltroFecha,
  setPagina,
  clearTurnosError,
} = turnosSlice.actions;

export default turnosSlice.reducer;
