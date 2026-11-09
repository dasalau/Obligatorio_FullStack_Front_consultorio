import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../../api/api";
import PageHeader from "../../components/layout/PageHeader";
import PagePagination from "../../components/layout/PagePagination";
import TurnosFiltersBar from "../../components/layout/TurnosFiltersBar";
import TurnoForm from "../../components/turnos/TurnoForm";
import TurnosTable from "../../components/turnos/TurnosTable";
import {
  clearTurnosError,
  setFiltroEstado,
  setFiltroFecha,
  setPagina,
  setTurnosData,
  setTurnosError,
  setTurnosLoading,
  setTurnosSaving,
} from "../../features/turnos/turnos.slice";
import {
  setEspecialidades,
  setEspecialidadesLoading,
} from "../../features/especialidades/especialidades.slice";

const TurnosPage = () => {
  const dispatch = useDispatch();

  const { items, loading, saving, error, filtros, paginacion } = useSelector(
    (state) => state.turnos,
  );
  const especialidades = useSelector((state) => state.especialidades.items);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTurno, setEditingTurno] = useState(null);
  const [formError, setFormError] = useState(null);

  const cargarTurnos = async () => {
    dispatch(setTurnosLoading(true));
    dispatch(clearTurnosError());

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
      dispatch(setTurnosData(data));
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.mensaje ||
        error?.message ||
        "No se pudieron cargar los turnos";
      dispatch(setTurnosError(message));
    } finally {
      dispatch(setTurnosLoading(false));
    }
  };

  const cargarEspecialidades = async () => {
    dispatch(setEspecialidadesLoading(true));

    try {
      const { data } = await api.get("/especialidades", {
        params: { pagina: 1, limite: 1000 },
      });
      dispatch(setEspecialidades(data));
    } catch (error) {
      console.error("Error cargando especialidades", error);
    } finally {
      dispatch(setEspecialidadesLoading(false));
    }
  };

  useEffect(() => {
    cargarTurnos();
  }, [dispatch, filtros.estado, filtros.fecha, paginacion.pagina]);

  useEffect(() => {
    cargarEspecialidades();
  }, [dispatch]);

  const handleCreateTurno = async (values) => {
    try {
      dispatch(setTurnosSaving(true));
      const payload = {
        fecha: values.fecha,
        hora: values.hora,
        motivo: values.motivo,
        estado: values.estado || "pendiente",
        paciente: values.paciente,
        especialidad: values.especialidad,
      };

      await api.post("/turnos", payload);
      toast.success("Turno creado correctamente");
      setFormError(null);
      setShowCreateForm(false);
      await cargarTurnos();
      return true;
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo crear el turno";
      const friendlyMessage =
        message.includes("4 turnos activos") || message.includes("plan Plus")
          ? "Has alcanzado el límite de 4 turnos activos en tu plan Plus. Pasate a Premium para seguir registrando turnos."
          : message;

      setFormError(friendlyMessage);
      toast.error(friendlyMessage, { autoClose: 7000 });
      return false;
    } finally {
      dispatch(setTurnosSaving(false));
    }
  };

  const handleEditTurno = async (values) => {
    if (!editingTurno?._id) {
      return false;
    }

    try {
      dispatch(setTurnosSaving(true));
      const payload = {
        fecha: values.fecha,
        hora: values.hora,
        motivo: values.motivo,
        estado: values.estado || "pendiente",
        paciente: values.paciente,
        especialidad: values.especialidad,
      };

      await api.put(`/turnos/${editingTurno._id}`, payload);
      toast.success("Turno actualizado correctamente");
      setFormError(null);
      setShowCreateForm(false);
      setEditingTurno(null);
      await cargarTurnos();
      return true;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.mensaje ||
        error?.message ||
        "No se pudo actualizar el turno";
      setFormError(message);
      toast.error(message);
      return false;
    } finally {
      dispatch(setTurnosSaving(false));
    }
  };

  const handleDeleteTurno = async (id) => {
    try {
      dispatch(setTurnosSaving(true));
      await api.delete(`/turnos/${id}`);
      toast.success("Turno eliminado correctamente");
      await cargarTurnos();
      return;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.mensaje ||
        error?.message ||
        "No se pudo eliminar el turno";
      toast.error(message);
    } finally {
      dispatch(setTurnosSaving(false));
    }
  };

  const handleInlineUpdate = async (id, payload) => {
    const turnoActual = items.find((turno) => turno._id === id);
    if (!turnoActual) return;

    try {
      dispatch(setTurnosSaving(true));
      const normalizedPayload = {
        fecha: turnoActual.fecha,
        hora: turnoActual.hora,
        motivo: turnoActual.motivo || "",
        estado: payload.estado,
        imagen: turnoActual.imagen || "",
        paciente: turnoActual.paciente?._id || turnoActual.paciente,
        especialidad: turnoActual.especialidad?._id || turnoActual.especialidad,
      };

      await api.put(`/turnos/${id}`, normalizedPayload);
      toast.success("Estado del turno actualizado");
      await cargarTurnos();
      return;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.mensaje ||
        error?.message ||
        "No se pudo actualizar el turno";
      toast.error(message);
    } finally {
      dispatch(setTurnosSaving(false));
    }
  };

  return (
    <>
      <PageHeader
        title="Gestion de turnos"
        subtitle="Alta, listado, edicion y eliminacion con filtros"
        rightContent={
          !showCreateForm ? (
            <button
              type="button"
              className="nav-action-btn"
              onClick={() => {
                dispatch(clearTurnosError());
                setFormError(null);
                setEditingTurno(null);
                setShowCreateForm(true);
              }}
            >
              Agregar turno
            </button>
          ) : null
        }
      />

      {showCreateForm && (
        <TurnoForm
          onSubmit={editingTurno ? handleEditTurno : handleCreateTurno}
          loading={saving}
          especialidades={especialidades}
          error={formError}
          editingId={editingTurno?._id}
          initialValues={
            editingTurno
              ? {
                  fecha: editingTurno.fecha || "",
                  hora: editingTurno.hora || "",
                  motivo: editingTurno.motivo || "",
                  estado: editingTurno.estado || "pendiente",
                  paciente:
                    editingTurno.paciente?._id || editingTurno.paciente || "",
                  especialidad:
                    editingTurno.especialidad?._id ||
                    editingTurno.especialidad ||
                    "",
                  pacienteLabel: editingTurno.paciente
                    ? `${editingTurno.paciente.nombre || ""} ${editingTurno.paciente.apellido || ""}`.trim() ||
                      editingTurno.paciente.cedula ||
                      ""
                    : "",
                  especialidadLabel: editingTurno.especialidad?.nombre || "",
                }
              : undefined
          }
          onCancel={() => {
            dispatch(clearTurnosError());
            setFormError(null);
            setShowCreateForm(false);
            setEditingTurno(null);
          }}
        />
      )}

      <TurnosFiltersBar
        estado={filtros.estado}
        fecha={filtros.fecha}
        onEstadoChange={(event) => {
          dispatch(clearTurnosError());
          dispatch(setFiltroEstado(event.target.value));
        }}
        onFechaChange={(value) => {
          dispatch(clearTurnosError());
          dispatch(setFiltroFecha(value));
        }}
        onClear={() => {
          dispatch(clearTurnosError());
          dispatch(setFiltroEstado(""));
          dispatch(setFiltroFecha(""));
        }}
      />

      {error && <p className="error-text">{error}</p>}

      <div style={{ height: 16 }} />

      <TurnosTable
        turnos={items}
        loading={loading}
        onDelete={handleDeleteTurno}
        onEdit={(turno) => {
          setFormError(null);
          setEditingTurno(turno);
          setShowCreateForm(true);
        }}
        onInlineUpdate={handleInlineUpdate}
      />

      <PagePagination
        page={paginacion.pagina}
        totalPages={paginacion.totalPages}
        disablePrev={paginacion.pagina <= 1}
        disableNext={paginacion.pagina >= paginacion.totalPages}
        onPrev={() => dispatch(setPagina(paginacion.pagina - 1))}
        onNext={() => dispatch(setPagina(paginacion.pagina + 1))}
      />
    </>
  );
};

export default TurnosPage;
