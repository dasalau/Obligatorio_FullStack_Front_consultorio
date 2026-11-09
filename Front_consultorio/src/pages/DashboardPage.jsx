import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMiPerfil } from "../features/auth/auth.slice";
import { fetchTurnosReporte } from "../features/turnos/turnos.slice";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user, error } = useSelector((state) => state.auth);
  const turnos = useSelector((state) => state.turnos.reporte.items || []);
  const totalTurnos = useSelector((state) => state.turnos.reporte.total || 0);
  const planCode = user?.plan?.codigo || user?.plan;

  useEffect(() => {
    if (!user || !user?.plan?.codigo) {
      dispatch(fetchMiPerfil());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      dispatch(fetchTurnosReporte());
    }
  }, [dispatch, user?._id, user?.id]);

  const resumen = turnos.reduce(
    (acc, turno) => {
      const estado = turno.estado || "pendiente";
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    },
    { pendiente: 0, confirmado: 0, cancelado: 0, atendido: 0 },
  );

  const estadoPrincipal = Object.entries(resumen).sort(
    (a, b) => b[1] - a[1],
  )[0];

  return (
    <>
      <section className="dashboard-hero card section-card">
        <div className="dashboard-hero-copy">
          <h2>Bienvenido a tu espacio de gestión clínica.</h2>
          <p>
            Todo el seguimiento diario, la agenda y la atención del consultorio
            en un mismo lugar para trabajar con claridad y tranquilidad.
          </p>
        </div>

        <div className="dashboard-hero-side">
          <Link to="/reportes" className="nav-action-btn dashboard-link-btn">
            Cambio de plan
          </Link>
          <span className="soft-badge dashboard-plan-pill">
            Plan actual: {planCode || "Sin plan"}
          </span>
        </div>
      </section>

      {error && <p className="error-text">{error}</p>}

      <section className="card section-card dashboard-summary">
        <div className="summary-header">
          <div>
            <span className="summary-kicker">Resumen del consultorio</span>
            <h3>Estado actual de la agenda</h3>
          </div>
        </div>

        <div className="summary-layout">
          <div className="stat-card stat-card-featured">
            <span className="stat-label">Confirmados</span>
            <strong className="stat-value">{resumen.confirmado}</strong>
          </div>

          <div className="stats-grid summary-grid">
            <div className="stat-card stat-card-small">
              <span className="stat-label">Pendientes</span>
              <strong className="stat-value">{resumen.pendiente}</strong>
            </div>
            <div className="stat-card stat-card-small">
              <span className="stat-label">Atendidos</span>
              <strong className="stat-value">{resumen.atendido}</strong>
            </div>
            <div className="stat-card stat-card-small">
              <span className="stat-label">Cancelados</span>
              <strong className="stat-value">{resumen.cancelado}</strong>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DashboardPage;
