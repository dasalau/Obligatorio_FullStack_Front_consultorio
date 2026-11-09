import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../api/api";
import PageHeader from "../components/layout/PageHeader";
import PageActionRail from "../components/layout/PageActionRail";
import PagePagination from "../components/layout/PagePagination";
import PacienteForm from "../components/pacientes/PacienteForm";
import PacientesList from "../components/pacientes/PacientesList";
import {
  clearPacientesError,
  createPaciente,
  deletePaciente,
  fetchPacientes,
  searchPacientes,
  setPaginaPacientes,
  updatePaciente,
} from "../features/pacientes/pacientes.slice";

const PacientesPage = () => {
  const dispatch = useDispatch();
  const {
    items,
    searchResults,
    searchLoading,
    loading,
    saving,
    error,
    paginacion,
  } = useSelector((state) => state.pacientes);
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [formError, setFormError] = useState(null);
  const [pacienteBusqueda, setPacienteBusqueda] = useState("");
  const emptyPacienteForm = {
    nombre: "",
    apellido: "",
    cedula: "",
    telefono: "",
    email: "",
  };

  useEffect(() => {
    dispatch(
      fetchPacientes({
        pagina: paginacion.pagina,
        limite: paginacion.limite,
      }),
    );
  }, [dispatch, paginacion.pagina, paginacion.limite]);

  useEffect(() => {
    const query = pacienteBusqueda.trim();
    if (!query) {
      return;
    }

    const timeoutId = setTimeout(() => {
      dispatch(searchPacientes({ q: query, limite: 8 }));
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [dispatch, pacienteBusqueda]);

  const uploadPacienteImage = async (id, file) => {
    if (!file) {
      return null;
    }

    const formData = new FormData();
    formData.append("imagen", file);
    formData.append("folder", "pacientes");

    const { data } = await api.patch(`/pacientes/${id}/imagenes`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data?.paciente || null;
  };

  const loadPacienteCompleto = async (paciente) => {
    if (!paciente?._id) {
      return paciente;
    }

    try {
      const { data } = await api.get(`/pacientes/${paciente._id}`);
      return data?.paciente || paciente;
    } catch (error) {
      return paciente;
    }
  };

  const sanitizePayload = (payload = {}) =>
    Object.fromEntries(
      Object.entries(payload).filter(
        ([key]) => !["_id", "__v", "createdAt", "updatedAt"].includes(key),
      ),
    );

  const onSubmit = async (values, selectedFile) => {
    try {
      let result;
      let pacienteId = editingId;
      const payload = sanitizePayload(values);

      if (editingId) {
        result = await dispatch(updatePaciente({ id: editingId, payload }));
      } else {
        result = await dispatch(createPaciente(values));
        if (createPaciente.fulfilled.match(result)) {
          pacienteId = result.payload?.paciente?._id || result.payload?._id;
        }
      }

      if (
        createPaciente.fulfilled.match(result) ||
        updatePaciente.fulfilled.match(result)
      ) {
        if (selectedFile && pacienteId) {
          await uploadPacienteImage(pacienteId, selectedFile);
        }

        toast.success(
          editingId
            ? "Paciente actualizado correctamente"
            : "Paciente creado correctamente",
        );
        setFormError(null);
        setEditingId(null);
        setShowCreateForm(false);
        dispatch(clearPacientesError());
        dispatch(
          fetchPacientes({
            pagina: paginacion.pagina,
            limite: paginacion.limite,
          }),
        );
        return true;
      }

      const message = result?.payload || "Ocurrio un error inesperado";
      setFormError(message);
      toast.error(message);
      return false;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "No se pudo guardar el paciente";
      setFormError(message);
      toast.error(message);
      return false;
    }
  };

  const handleAddPaciente = () => {
    setEditingId(null);
    setShowCreateForm(true);
    setFormError(null);
    dispatch(clearPacientesError());
  };

  const handleEdit = (paciente) => {
    setEditingId(paciente._id);
    setShowCreateForm(true);
    setFormError(null);
    dispatch(clearPacientesError());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowCreateForm(false);
    setFormError(null);
    dispatch(clearPacientesError());
  };

  const handleDelete = async (id) => {
    const result = await dispatch(deletePaciente(id));
    if (deletePaciente.fulfilled.match(result)) {
      toast.success("Paciente eliminado correctamente");
      dispatch(
        fetchPacientes({
          pagina: paginacion.pagina,
          limite: paginacion.limite,
        }),
      );
      return;
    }

    const message = result?.payload || "No se pudo eliminar el paciente";
    toast.error(message);
  };

  return (
    <>
      <PageHeader
        title="Gestion de pacientes"
        subtitle="Alta, edicion y eliminacion"
        rightContent={
          <div style={{ position: "relative", width: "min(100%, 420px)" }}>
            <PageActionRail
              placeholder="Buscar paciente"
              addLabel="Agregar paciente"
              value={pacienteBusqueda}
              onSearchChange={(event) =>
                setPacienteBusqueda(event.target.value)
              }
              onAdd={handleAddPaciente}
              showAddButton={!showCreateForm && !editingId}
            />

            {pacienteBusqueda.trim() && (
              <div
                className="search-suggestion-list"
                style={{ top: "calc(100% + 10px)" }}
              >
                {searchLoading ? (
                  <span className="search-suggestion-empty">
                    Buscando paciente...
                  </span>
                ) : searchResults.length > 0 ? (
                  searchResults.map((paciente) => (
                    <button
                      key={paciente._id}
                      type="button"
                      className="search-suggestion-item"
                      onClick={async () => {
                        const pacienteCompleto =
                          await loadPacienteCompleto(paciente);
                        setSelectedPaciente(pacienteCompleto);
                        setPacienteBusqueda("");
                      }}
                    >
                      {`${paciente.nombre || ""} ${paciente.apellido || ""}`.trim() ||
                        paciente.cedula ||
                        "Paciente"}
                      {paciente.cedula ? ` (${paciente.cedula})` : ""}
                    </button>
                  ))
                ) : (
                  <span className="search-suggestion-empty">
                    No se encontraron pacientes
                  </span>
                )}
              </div>
            )}
          </div>
        }
      />

      {(showCreateForm || editingId) && (
        <PacienteForm
          onSubmit={onSubmit}
          loading={saving}
          editingId={editingId}
          initialValues={
            editingId
              ? items.find((paciente) => paciente._id === editingId) ||
                emptyPacienteForm
              : emptyPacienteForm
          }
          onCancel={handleCancelEdit}
          error={formError}
        />
      )}

      <PacientesList
        items={items}
        loading={loading}
        error={error}
        saving={saving}
        selectedPaciente={selectedPaciente}
        onSelectPaciente={async (paciente) => {
          const pacienteCompleto = await loadPacienteCompleto(paciente);
          setSelectedPaciente(pacienteCompleto);
        }}
        onPacienteUpdated={(pacienteActualizado) => {
          setSelectedPaciente(pacienteActualizado);
        }}
        onClosePaciente={() => setSelectedPaciente(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PagePagination
        page={paginacion.pagina}
        totalPages={paginacion.totalPages}
        disablePrev={paginacion.pagina <= 1}
        disableNext={paginacion.pagina >= paginacion.totalPages}
        onPrev={() =>
          dispatch(setPaginaPacientes(Math.max(paginacion.pagina - 1, 1)))
        }
        onNext={() =>
          dispatch(
            setPaginaPacientes(
              Math.min(paginacion.pagina + 1, paginacion.totalPages),
            ),
          )
        }
      />
    </>
  );
};

export default PacientesPage;
