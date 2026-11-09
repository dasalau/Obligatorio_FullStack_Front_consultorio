import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/api";
import UsageCard from "../../components/reportes/UsageCard";
import PlanSwitchCard from "../../components/reportes/PlanSwitchCard";
import TurnosByEstadoChart from "../../components/reportes/TurnosByEstadoChart";
import { setUser } from "../../features/auth/auth.slice";
import {
  setReporteLoading,
  setTurnosReporteData,
  setReporteError,
} from "../../features/turnos/turnos.slice";

const ReportesPage = () => {
  const dispatch = useDispatch();

  const { user, loading, error } = useSelector((state) => state.auth);
  const {
    items,
    total,
    loading: loadingTurnos,
  } = useSelector((state) => state.turnos.reporte);

  const planCode = user?.plan?.codigo || user?.plan;

  useEffect(() => {
    const loadProfile = async () => {
      if (user && user?.plan?.codigo) {
        return;
      }

      try {
        const { data } = await api.get("/usuarios/me");
        dispatch(setUser(data.user || data));
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.mensaje ||
          error?.message ||
          "No se pudo cargar el perfil";
        dispatch(setReporteError(message));
      }
    };

    loadProfile();
  }, [dispatch, user]);

  useEffect(() => {
    const loadReporte = async () => {
      try {
        dispatch(setReporteLoading(true));
        const { data } = await api.get("/turnos", {
          params: {
            pagina: 1,
            limite: 1000,
            mine: true,
          },
        });

        const turnos = data?.turnos || [];
        dispatch(
          setTurnosReporteData({
            turnos,
            total: turnos.filter((turno) => {
              const estado = String(turno?.estado || "")
                .trim()
                .toLowerCase();
              return estado === "pendiente" || estado === "confirmado";
            }).length,
          }),
        );
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.mensaje ||
          error?.message ||
          "No se pudo cargar el reporte";
        dispatch(setReporteError(message));
      } finally {
        dispatch(setReporteLoading(false));
      }
    };

    loadReporte();
  }, [dispatch]);

  const resumen = items.reduce(
    (acc, turno) => {
      const estado = turno.estado || "pendiente";
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    },
    { pendiente: 0, confirmado: 0, cancelado: 0, atendido: 0 },
  );

  const planUsageTotal = items.filter((turno) => {
    const estado = String(turno?.estado || "")
      .trim()
      .toLowerCase();
    return estado === "pendiente" || estado === "confirmado";
  }).length;

  const estadoMasActivo = Object.entries(resumen).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const handleUpgradePlan = async () => {
    try {
      const { data } = await api.patch("/usuarios/change-plan", {
        plan: "premium",
      });
      dispatch(setUser(data.user || data));
      const { data: perfil } = await api.get("/usuarios/me");
      dispatch(setUser(perfil.user || perfil));
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.mensaje ||
        error?.message ||
        "No se pudo cambiar el plan";
      dispatch(setReporteError(message));
    }
  };

  return (
    <>
      {error && <p className="error-text">{error}</p>}

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <UsageCard planCode={planCode} totalTurnos={planUsageTotal} />
        <PlanSwitchCard
          planCode={planCode}
          loading={loading}
          onUpgrade={handleUpgradePlan}
        />
      </div>

      <section className="card section-card">
        <div className="section-head">
          <h2 className="mb-1">Resumen del consultorio</h2>
          <p className="mb-2 text-secondary">
            Estado actual del flujo de trabajo del usuario autenticado
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total</span>
            <strong className="stat-value">{total}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Pendientes</span>
            <strong className="stat-value">{resumen.pendiente}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Confirmados</span>
            <strong className="stat-value">{resumen.confirmado}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Atendidos</span>
            <strong className="stat-value">{resumen.atendido}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Cancelados</span>
            <strong className="stat-value">{resumen.cancelado}</strong>
          </div>
        </div>
      </section>

      {loadingTurnos ? (
        <section className="card">
          <p>Cargando datos de turnos para el grafico...</p>
        </section>
      ) : (
        <TurnosByEstadoChart turnos={items} />
      )}
    </>
  );
};

export default ReportesPage;
