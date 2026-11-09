import { createSlice } from "@reduxjs/toolkit";

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
    setPacientesLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setPacientesSearchLoading: (state, action) => {
      state.searchLoading = Boolean(action.payload);
    },
    setPacientesSaving: (state, action) => {
      state.saving = Boolean(action.payload);
    },
    setPacientes: (state, action) => {
      const payload = action.payload || {};
      state.items = payload.pacientes || [];
      state.paginacion.total = payload.total || 0;
      state.paginacion.pagina = payload.pagina || 1;
      state.paginacion.limite = payload.limite || 8;
      state.paginacion.totalPages = payload.totalPages || 1;
      state.error = null;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload?.pacientes || action.payload || [];
      state.searchLoading = false;
    },
    setPaginaPacientes: (state, action) => {
      state.paginacion.pagina = action.payload;
    },
    setPacientesError: (state, action) => {
      state.error = action.payload || null;
    },
    clearPacientesError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setPacientesLoading,
  setPacientesSearchLoading,
  setPacientesSaving,
  setPacientes,
  setSearchResults,
  setPaginaPacientes,
  setPacientesError,
  clearPacientesError,
} = pacientesSlice.actions;

export default pacientesSlice.reducer;
