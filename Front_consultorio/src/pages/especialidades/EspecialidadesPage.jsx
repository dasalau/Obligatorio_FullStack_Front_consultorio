import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../../api/api";
import PageHeader from "../../components/layout/PageHeader";
import PageActionRail from "../../components/layout/PageActionRail";
import PagePagination from "../../components/layout/PagePagination";
import EspecialidadForm from "../../components/especialidades/EspecialidadForm";
import EspecialidadesList from "../../components/especialidades/EspecialidadesList";
import {
  clearEspecialidadesError,
  setEspecialidades,
  setEspecialidadesError,
  setEspecialidadesLoading,
  setEspecialidadesSaving,
  setPaginaEspecialidades,
} from "../../features/especialidades/especialidades.slice";

const EspecialidadesPage = () => {
  const dispatch = useDispatch();
  const { items, loading, saving, error, paginacion } = useSelector(
    (state) => state.especialidades,
  );
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formError, setFormError] = useState(null);
  const emptyEspecialidadForm = {
    nombre: "",
    descripcion: "",
  };

  const cargarEspecialidades = async () => {
    dispatch(setEspecialidadesLoading(true));
    dispatch(clearEspecialidadesError());

    try {
      const { data } = await api.get("/especialidades", {
        params: {
          pagina: paginacion.pagina,
          limite: paginacion.limite,
        },
      });
      dispatch(setEspecialidades(data));
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.mensaje ||
        error?.message ||
        "No se pudieron cargar las especialidades";
      dispatch(setEspecialidadesError(message));
    } finally {
      dispatch(setEspecialidadesLoading(false));
    }
  };

  useEffect(() => {
    cargarEspecialidades();
  }, [dispatch, paginacion.pagina, paginacion.limite]);

  const filteredEspecialidades = items.filter((especialidad) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const nombre = (especialidad.nombre || "").toLowerCase();
    const descripcion = (especialidad.descripcion || "").toLowerCase();

    return nombre.includes(query) || descripcion.includes(query);
  });

  const sanitizePayload = (payload = {}) =>
    Object.fromEntries(
      Object.entries(payload).filter(
        ([key]) => !["_id", "__v", "createdAt", "updatedAt"].includes(key),
      ),
    );

  const onSubmit = async (values) => {
    const payload = sanitizePayload(values);

    try {
      dispatch(setEspecialidadesSaving(true));
      if (editingId) {
        await api.patch(`/especialidades/${editingId}`, payload);
      } else {
        await api.post("/especialidades", payload);
      }

      toast.success(
        editingId
          ? "Especialidad actualizada correctamente"
          : "Especialidad creada correctamente",
      );
      setFormError(null);
      setEditingId(null);
      setShowCreateForm(false);
      dispatch(clearEspecialidadesError());
      await cargarEspecialidades();
      return true;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.mensaje ||
        error?.message ||
        "Ocurrio un error inesperado";
      setFormError(message);
      toast.error(message);
      return false;
    } finally {
      dispatch(setEspecialidadesSaving(false));
    }
  };

  const handleAddEspecialidad = () => {
    setEditingId(null);
    setShowCreateForm(true);
    setFormError(null);
    dispatch(clearEspecialidadesError());
  };

  const handleEdit = (especialidad) => {
    setEditingId(especialidad._id);
    setShowCreateForm(true);
    setFormError(null);
    dispatch(clearEspecialidadesError());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowCreateForm(false);
    setFormError(null);
    dispatch(clearEspecialidadesError());
  };

  const handleDelete = async (id) => {
    try {
      dispatch(setEspecialidadesSaving(true));
      await api.delete(`/especialidades/${id}`);
      toast.success("Especialidad eliminada correctamente");
      await cargarEspecialidades();
      return;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.mensaje ||
        error?.message ||
        "No se pudo eliminar la especialidad";
      toast.error(message);
    } finally {
      dispatch(setEspecialidadesSaving(false));
    }
  };

  return (
    <>
      <PageHeader
        title="Gestion de especialidades"
        subtitle="Alta, edicion y eliminacion"
        rightContent={
          <PageActionRail
            placeholder="Buscar especialidad"
            addLabel="Agregar especialidad"
            value={searchTerm}
            onSearchChange={(event) => setSearchTerm(event.target.value)}
            onAdd={handleAddEspecialidad}
            showAddButton={!showCreateForm && !editingId}
          />
        }
      />

      {(showCreateForm || editingId) && (
        <EspecialidadForm
          onSubmit={onSubmit}
          loading={saving}
          editingId={editingId}
          initialValues={
            editingId
              ? items.find((especialidad) => especialidad._id === editingId) ||
                emptyEspecialidadForm
              : emptyEspecialidadForm
          }
          onCancel={handleCancelEdit}
          error={formError}
        />
      )}

      <EspecialidadesList
        items={filteredEspecialidades}
        loading={loading}
        error={error}
        saving={saving}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PagePagination
        page={paginacion.pagina}
        totalPages={paginacion.totalPages}
        disablePrev={paginacion.pagina <= 1}
        disableNext={paginacion.pagina >= paginacion.totalPages}
        onPrev={() =>
          dispatch(setPaginaEspecialidades(Math.max(paginacion.pagina - 1, 1)))
        }
        onNext={() =>
          dispatch(
            setPaginaEspecialidades(
              Math.min(paginacion.pagina + 1, paginacion.totalPages),
            ),
          )
        }
      />
    </>
  );
};

export default EspecialidadesPage;
