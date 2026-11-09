import { createSlice } from "@reduxjs/toolkit";

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
    setEspecialidadesLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setEspecialidadesSaving: (state, action) => {
      state.saving = Boolean(action.payload);
    },
    setEspecialidades: (state, action) => {
      const payload = action.payload || {};
      state.items = payload.especialidades || [];
      state.paginacion.total = payload.total || 0;
      state.paginacion.pagina = payload.pagina || 1;
      state.paginacion.limite = payload.limite || 8;
      state.paginacion.totalPages = payload.totalPages || 1;
      state.error = null;
    },
    setPaginaEspecialidades: (state, action) => {
      state.paginacion.pagina = action.payload;
    },
    setEspecialidadesError: (state, action) => {
      state.error = action.payload || null;
    },
    clearEspecialidadesError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setEspecialidadesLoading,
  setEspecialidadesSaving,
  setEspecialidades,
  setPaginaEspecialidades,
  setEspecialidadesError,
  clearEspecialidadesError,
} = especialidadesSlice.actions;

export default especialidadesSlice.reducer;
