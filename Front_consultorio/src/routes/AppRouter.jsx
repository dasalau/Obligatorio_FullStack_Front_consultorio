import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import NotFoundPage from "../pages/common/NotFoundPage";
import ContainerPage from "../pages/common/ContainerPage";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import TurnosPage from "../pages/turnos/TurnosPage";
import ReportesPage from "../pages/reportes/ReportesPage";
import PacientesPage from "../pages/pacientes/PacientesPage";
import EspecialidadesPage from "../pages/especialidades/EspecialidadesPage";
import GroqPage from "../pages/groq/GroqPage";
import UploadsPage from "../pages/uploads/UploadsPage";

const AppRouter = () => {
  const { token } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
      />
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={
          token ? <Navigate to="/dashboard" replace /> : <RegisterPage />
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <ContainerPage />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/turnos" element={<TurnosPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
        <Route path="/pacientes" element={<PacientesPage />} />
        <Route path="/especialidades" element={<EspecialidadesPage />} />
        <Route path="/groq" element={<GroqPage />} />
        <Route path="/uploads" element={<UploadsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
