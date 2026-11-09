import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/auth.slice";
import turnosReducer from "../features/turnos/turnos.slice";
import pacientesReducer from "../features/pacientes/pacientes.slice";
import especialidadesReducer from "../features/especialidades/especialidades.slice";
import groqReducer from "../features/groq/groq.slice";
import uploadsReducer from "../features/uploads/uploads.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    turnos: turnosReducer,
    pacientes: pacientesReducer,
    especialidades: especialidadesReducer,
    groq: groqReducer,
    uploads: uploadsReducer,
  },
});
