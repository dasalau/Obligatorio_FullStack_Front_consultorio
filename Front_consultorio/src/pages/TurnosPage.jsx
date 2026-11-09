import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import PageHeader from "../components/layout/PageHeader";
import PagePagination from "../components/layout/PagePagination";
import TurnosFiltersBar from "../components/layout/TurnosFiltersBar";
import TurnoForm from "../components/turnos/TurnoForm";
import TurnosTable from "../components/turnos/TurnosTable";
import {
  clearTurnosError,
  createTurno,
  deleteTurno,
  fetchTurnos,
  setFiltroEstado,
  setFiltroFecha,
  setPagina,
  updateTurno,
} from "../features/turnos/turnos.slice";
import { fetchEspecialidades } from "../features/especialidades/especialidades.slice";

const TurnosPage = () => {
  const dispatch = useDispatch();

  const { items, loading, saving, error, filtros, paginacion } = useSelector(
    (state) => state.turnos,
  );
  const especialidades = useSelector((state) => state.especialidades.items);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTurno, setEditingTurno] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    dispatch(fetchTurnos());
  }, [dispatch, filtros.estado, filtros.fecha, paginacion.pagina]);

  useEffect(() => {
    dispatch(fetchEspecialidades());
  }, [dispatch]);

  const handleCreateTurno = async (values) => {
    try {
      const payload = {
        fecha: values.fecha,
        hora: values.hora,
        motivo: values.motivo,
        estado: values.estado || "pendiente",
        paciente: values.paciente,
        especialidad: values.especialidad,
      };

      const result = await dispatch(createTurno(payload));
      if (createTurno.fulfilled.match(result)) {
        toast.success("Turno creado correctamente");
        setFormError(null);
        setShowCreateForm(false);
        dispatch(fetchTurnos());
        return true;
      }

      const message = result?.payload || "Ocurrio un error inesperado";
      const friendlyMessage =
        message.includes("4 turnos activos") || message.includes("plan Plus")
          ? "Has alcanzado el límite de 4 turnos activos en tu plan Plus. Pasate a Premium para seguir registrando turnos."
          : message;

      setFormError(friendlyMessage);
      toast.error(friendlyMessage, { autoClose: 7000 });
      return false;
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "No se pudo subir la imagen";
      const friendlyMessage =
        message.includes("4 turnos activos") || message.includes("plan Plus")
          ? "Has alcanzado el límite de 4 turnos activos en tu plan Plus. Pasate a Premium para seguir registrando turnos."
          : message;

      setFormError(friendlyMessage);
      toast.error(friendlyMessage, { autoClose: 7000 });
      return false;
    }
  };

  const handleEditTurno = async (values) => {
    if (!editingTurno?._id) {
      return false;
    }

    const payload = {
      fecha: values.fecha,
      hora: values.hora,
      motivo: values.motivo,
      estado: values.estado || "pendiente",
      paciente: values.paciente,
      especialidad: values.especialidad,
    };

    const result = await dispatch(
      updateTurno({ id: editingTurno._id, payload }),
    );

    if (updateTurno.fulfilled.match(result)) {
      toast.success("Turno actualizado correctamente");
      setFormError(null);
      setShowCreateForm(false);
      setEditingTurno(null);
      dispatch(fetchTurnos());
      return true;
    }

    const message = result?.payload || "Ocurrio un error inesperado";
    setFormError(message);
    toast.error(message);
    return false;
  };

  const handleDeleteTurno = async (id) => {
    const result = await dispatch(deleteTurno(id));
    if (deleteTurno.fulfilled.match(result)) {
      toast.success("Turno eliminado correctamente");
      dispatch(fetchTurnos());
      return;
    }

    const message = result?.payload || "No se pudo eliminar el turno";
    toast.error(message);
  };

  const handleInlineUpdate = async (id, payload) => {
    const turnoActual = items.find((turno) => turno._id === id);
    if (!turnoActual) return;

    const normalizedPayload = {
      fecha: turnoActual.fecha,
      hora: turnoActual.hora,
      motivo: turnoActual.motivo || "",
      estado: payload.estado,
      imagen: turnoActual.imagen || "",
      paciente: turnoActual.paciente?._id || turnoActual.paciente,
      especialidad: turnoActual.especialidad?._id || turnoActual.especialidad,
    };

    const result = await dispatch(
      updateTurno({ id, payload: normalizedPayload }),
    );

    if (updateTurno.fulfilled.match(result)) {
      toast.success("Estado del turno actualizado");
      dispatch(fetchTurnos());
      return;
    }

    const message = result?.payload || "No se pudo actualizar el turno";
    toast.error(message);
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
